const fs = require("fs");
const {startGrading, finishGrading, getSolves} = require("./db");
const request = require("request");
const router = require("express").Router();
const upload = require("multer")({ dest: "uploads/" });

const api = process.env.CAMISOLE;

const compileLimits = {
  "wall-time": 10
}
const execLimits = {
  "time": 10,
  "wall-time": 10,
  "processes": 100,
  "mem": 100 * 1000 * 1000
}

const compare = (a, b) => {
  return a.split("\r").join("") === b.split("\r").join("");
}

const status = (camisoleBody, expected) => {
  for(let i = 0; i < camisoleBody.tests.length; i++){
    const currTest = camisoleBody.tests[i];
    if(currTest.meta.status !== "OK") return currTest.meta.status;
    if(!compare(currTest.stdout, expected[currTest.name])) return "WA";
  }
  return "OK";
}


module.exports = problems => {
  router.get("/", (req, res) => {
    getSolves(rows => {
      res.send(rows);
    });
  });
  router.post("/submit", upload.single("file"), (req, res) => {
    const data = fs.readFileSync(req.file.path, "utf8");
    const tests = problems[req.body.pid];
    const expected = {};
    for(let i = 0; i < tests.length; i++){
      expected[tests[i].name] = tests[i].stdout;
    }
    
    const time = startGrading(req.session.uid, req.body.pid);
    
    request({
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
    }, (err, response, body) => {
      finishGrading(req.session.uid, time, req.body.pid, status(body, expected));
    });
    
    res.redirect("/");
  });
  return router;
};