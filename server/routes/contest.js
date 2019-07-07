const loadProblems = require(__rootdir + "/server/problems");
const { renderWithPopups } = require(__rootdir + "/server/util");

const fs = require("fs");

const { languages } = require(__rootdir + "/config");

const md = new require("markdown-it")();

const router = require("express").Router();

router.get("/", (req, res) =>
  renderWithPopups(req, res, "pages/contest/index", {
    problems: loadProblems(),
    md,
    languages
  })
);

router.get("/scoreboard", (req, res) =>
  renderWithPopups(req, res, "pages/contest/scoreboard")
);

const samples = fs.readdirSync(__rootdir + "/problems/sample/Hello Woooorld/solution");
router.get("/tutorial", (req, res) => renderWithPopups(req, res, "pages/contest/tutorial", {
  samples, 
  sampleProblem: loadProblems().filter(problem => problem.name === "Hello Woooorld")[0],
  md
}));

module.exports = router;
