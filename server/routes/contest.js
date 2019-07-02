const loadProblems = require(__rootdir + "/server/problems");
const { renderWithPopups } = require(__rootdir + "/server/util");

const router = require("express").Router();

router.get("/", (req, res) =>
  renderWithPopups(req, res, "pages/index", {
    problems: loadProblems()
  })
);

router.get("/scoreboard", (req, res) =>
  renderWithPopups(req, res, "pages/scoreboard", {})
);

module.exports = router;
