const loadProblems = require(__rootdir + "/server/problems");
const { renderWithPopups } = require(__rootdir + "/server/util");

const router = require("express").Router();

router.get("/", (req, res) =>
  renderWithPopups(req, res, "pages/contest/index", {
    problems: loadProblems()
  })
);

router.get("/scoreboard", (req, res) =>
  renderWithPopups(req, res, "pages/contest/scoreboard")
);

module.exports = router;
