const loadProblems = require(__rootdir + "/server/problems");
const { renderWithPopups } = require(__rootdir + "/server/util");

const { languages } = require(__rootdir + "/config");
console.log(languages);

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

module.exports = router;
