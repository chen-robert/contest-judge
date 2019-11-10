const loadProblems = require(__rootdir + "/server/problems");
const { renderWithPopups } = require(__rootdir + "/server/util");

const fs = require("fs");

const { languages } = require(__rootdir + "/config");

const md = new require("markdown-it")();

const router = require("express").Router();

router.get("/", (req, res) =>
  renderWithPopups(req, res, "pages/contest/index", {
    problems: loadProblems(req.session.division),
    name: req.session.username,
    md,
    languages
  })
);

router.get("/scoreboard", (req, res) =>
  renderWithPopups(req, res, "pages/contest/scoreboard", {
    name: req.session.username
  })
);

const sampleDir = __rootdir + "/problems/sample/Hello Woooorld/solution";
router.use("/about/samples", require("express").static(sampleDir));

const samples = fs
  .readdirSync(sampleDir)
  .filter(name => !name.endsWith(".class"));

router.get("/about", (req, res) =>
  renderWithPopups(req, res, "pages/contest/about", {
    samples,
    sampleProblem: loadProblems().filter(
      problem => problem.name === "Hello Woooorld"
    )[0],
    name: req.session.username,
    md
  })
);

module.exports = router;
