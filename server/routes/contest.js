const loadProblems = require(__rootdir + "/server/problems");
const { renderWithPopups } = require(__rootdir + "/server/util");
const { getAllSolves } = require(__rootdir + "/server/db");

const fs = require("fs");

const { languages } = require(__rootdir + "/config");

const md = new require("markdown-it")();

const router = require("express").Router();

router.get("/", 
  (req, res, next) => {
    if(req.session.finished) return next();
    
    getAllSolves(solves => {
      req.session.finished = solves
        .filter(solve => solve.user_id === req.session.uid)
        .filter(solve => solve.status === "OK")
        .map(solve => solve.problem)
        .filter((v, i, arr) => i === arr.indexOf(v));
      
      next();
    });
  },
  (req, res) =>
  renderWithPopups(req, res, "pages/contest/index", {
    problems: loadProblems(),
    md,
    languages,
    finished: req.session.finished || []
  })
);

router.get("/scoreboard", (req, res) =>
  renderWithPopups(req, res, "pages/contest/scoreboard")
);

const samples = fs.readdirSync(
  __rootdir + "/problems/sample/Hello Woooorld/solution"
).filter(name => !name.endsWith(".class"));
router.get("/about", (req, res) =>
  renderWithPopups(req, res, "pages/contest/about", {
    samples,
    sampleProblem: loadProblems().filter(
      problem => problem.name === "Hello Woooorld"
    )[0],
    md
  })
);

module.exports = router;
