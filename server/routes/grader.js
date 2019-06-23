const fs = require("fs");
const {
  startGrading,
  finishGrading,
  getSolves,
  getUserData,
  getAllSolves
} = require(__rootdir + "/server/db");
const request = require("request");
const router = require("express").Router();

const upload = require("multer")({
  dest: "uploads/",
  limits: {
    fileSize: 30 * 1000
  }
});

const api = process.env.CAMISOLE;
console.log(`Using camsiole endpoint at ${api} (process.env.CAMISOLE)`);

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
const clean = a =>
  a
    .trim()
    .split("\r")
    .join("")
    .split("\n")
    .map(a => a.trim())
    .join("");

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

module.exports = problems => {
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

  router.post(
    "/submit",
    (req, res, next) => {
      upload.single("file")(req, res, err => {
        if (err) {
          req.session.error = "Invalid file";
          return res.redirect("/");
        }
        next();
      });
    },
    (req, res) => {
      const tests = problems[req.body.pid];

      if (req.file === undefined) {
        req.session.error = "Please upload a file";
        return res.redirect("/");
      }
      if (tests === undefined) {
        req.session.error = "Unknown error. Please contact an admin.";
        return res.redirect("/");
      }

      const data = fs.readFileSync(req.file.path, "utf8");
      const expected = {};
      for (let i = 0; i < tests.length; i++) {
        expected[tests[i].name] = tests[i].stdout;
      }

      const time = startGrading(req.session.uid, req.body.pid);

      request(
        {
          method: "POST",
          body: {
            lang: req.body.lang,
            source: data,
            compile: compileLimits,
            execute: execLimits,
            tests
          },
          json: true,
          url: `http://${api}/run`
        },
        (err, response, body) => {
          if (err) {
            console.log(err);
            req.session.error = "Grading error. Please contact an admin.";
            return res.redirect("/");
          }
          finishGrading(
            req.session.uid,
            time,
            req.body.pid,
            status(body, expected)
          );
        }
      );

      req.session.message = "Successfully submitted";
      return res.redirect("/");
    }
  );
  return router;
};
