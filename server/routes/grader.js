const fs = require("fs");
const Joi = require("@hapi/joi");

const config = require(__rootdir + "/config");

const { testData } = require(__rootdir + "/server/problemData");

const { startGrading, finishGrading, getSolves } = require(__rootdir +
  "/server/db");
const request = require("request");
const router = require("express").Router();

const upload = require("multer")({
  dest: "uploads/",
  limits: {
    fileSize: 30 * 1000
  }
});

const api = process.env.CIRRUS_ENDPOINT;
console.log(
  api === undefined
    ? "WARNING: Cirrus endpoint undefined (process.env.CIRRUS_ENDPOINT)"
    : `Using camsiole endpoint at ${api}`
);

const compileLimits = {
  wallTime: 10
};

const execLimits = {
  time: 4,
  wallTime: 20,
  mem: 100 * 1000 * 1000
};

const status = body => {
  if (body.compile) {
    if (body.compile.err) {
      return "COMPILE_ERROR";
    }
  }

  if (body.tests) {
    for (let i = 0; i < body.tests.length; i++) {
      const currTest = body.tests[i];
      if (currTest.status !== "AC") return currTest.status;
    }
  } else {
    return "UNKNOWN_ERROR";
  }

  return "OK";
};

const submissions = {};
const submissionData = (uid, problem, status, time) => {
  return { uid, problem, status, time };
};
router.get("/submissions", (req, res) => {
  if (submissions[req.session.uid])
    return res.send(submissions[req.session.uid]);

  getSolves(req.session.uid, rows => {
    rows = rows.map(row => {
      const data = submissionData(
        row.user_id,
        row.problem,
        row.status,
        row.time
      );

      return data;
    });

    submissions[req.session.uid] = rows;
    return res.send(submissions[req.session.uid]);
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
      const { pid, lang } = val;

      const tests = testData[pid];

      if (req.file === undefined) {
        req.session.error = "Please upload a file";
      } else if (tests === undefined) {
        req.session.error = "Testcases not available. Please contact an admin.";
      } else {
        const data = fs.readFileSync(req.file.path, "utf8");

        const time = startGrading(req.session.uid, pid);

        if (!submissions[req.session.uid]) submissions[req.session.uid] = [];
        const oldIndex = submissions[req.session.uid].length;
        submissions[req.session.uid].push(
          submissionData(req.session.uid, pid, "GRADING", time)
        );

        request(
          {
            method: "POST",
            body: {
              lang: lang,
              source: data,
              filename: req.file.originalname,
              compileOpts: compileLimits,
              executeOpts: execLimits,
              grader: "default",
              testsuite: tests
            },
            json: true,
            url: `${api}/run`
          },
          (err, response, body) => {
            let code;
            if (err) {
              code = "ENDPOINT_ERROR";
              console.log(err);
            } else {
              code = status(body);
            }

            submissions[req.session.uid][oldIndex] = submissionData(
              req.session.uid,
              pid,
              code,
              time
            );
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
