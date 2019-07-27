const fs = require("fs");
const Joi = require("@hapi/joi");

const config = require(__rootdir + "/config");

const { testData } = require(__rootdir + "/server/problemData");

const { startGrading, finishGrading, getSolves, getAllSolves } = require(__rootdir +
  "/server/db");
const request = require("request");
const router = require("express").Router();

const upload = require("multer")({
  dest: "uploads/",
  limits: {
    fileSize: 30 * 1000
  }
});

const api = process.env.CAMISOLE;
console.log(
  api === undefined
    ? "WARNING: Camisole endpoint undefined (process.env.CAMISOLE)"
    : `Using camsiole endpoint at ${api}`
);

const compileLimits = {
  "wall-time": 10
};

const execLimits = {
  time: 10,
  "wall-time": 10,
  processes: 100,
  mem: 100 * 1000 * 1000
};

const compare = (a, b) => {
  return clean(a) === clean(b);
};
const clean = a => a.trim().replace(/\r/g, "");

const status = (camisoleBody, expected) => {
  if (camisoleBody.compile) {
    if (camisoleBody.compile.exitcode !== 0) {
      return "COMPILE_ERROR";
    }
  }

  if (!camisoleBody.success) {
    return "GRADER_ERROR";
  }
  if (camisoleBody.tests) {
    for (let i = 0; i < camisoleBody.tests.length; i++) {
      const currTest = camisoleBody.tests[i];
      if (currTest.meta.status !== "OK") return currTest.meta.status;
      if (!compare(currTest.stdout, expected[currTest.name])) return "WA";
    }
  } else {
    return "UNKNOWN_ERROR";
  }

  return "OK";
};

router.get("/submissions", (req, res) => {
  getSolves(req.session.uid, rows => {
    rows = rows.map(row => {
      const data = {
        uid: row.user_id,
        problem: row.problem,
        status: row.status,
        time: row.time
      };

      return data;
    });

    return res.send(rows);
  });
});
router.get("/user", (req, res) => res.send({ uid: req.session.uid }));

const graderSchema = Joi.object().keys({
  pid: Joi.string().required(),
  lang: Joi.string()
    .valid(config.languages)
    .required(),
  file: Joi.any()
});

router.post(
  "/submit",
  (req, res, next) => {
    upload.single("file")(req, res, err => {
      if (err) {
        req.session.error = "File is too big!";
        return res.redirect("/");
      }
      next();
    });
  },
  (req, res) => {
    graderSchema.validate(req.body, (err, val) => {
      if (err) {
        return res.status(400).send("Invalid parameters");
      }
      const { pid, lang } = req.body;

      const tests = testData[pid];

      if (req.file === undefined) {
        req.session.error = "Please upload a file";
      } else if (tests === undefined) {
        req.session.error = "Testcases not available. Please contact an admin.";
      } else {
        const data = fs.readFileSync(req.file.path, "utf8");
        const expected = {};
        for (let i = 0; i < tests.length; i++) {
          expected[tests[i].name] = tests[i].stdout;
        }

        const time = startGrading(req.session.uid, pid);

        request(
          {
            method: "POST",
            body: {
              lang: lang,
              source: data,
              compile: compileLimits,
              execute: execLimits,
              tests
            },
            json: true,
            url: `${api}/run`
          },
          (err, response, body) => {
            let code;
            if (err) {
              code = "ENDPOINT_ERROR";
            } else {
              code = status(body, expected);
            }

            req.session.finished.push(pid);
            finishGrading(req.session.uid, time, pid, code);
          }
        );

        req.session.message = "Successfully submitted";
      }
      return res.redirect("/contest#" + pid.toLowerCase().replace(/ /g, "-"));
    });
  }
);

module.exports = router;
