const router = require("express").Router();
const { renderWithPopups } = require(__rootdir + "/server/util");

const config = require(__rootdir + "/config");

router.get("/", (req, res) => res.render())

module.exports = router;
