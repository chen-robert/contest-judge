const router = require("express").Router();

router.get("/", (req, res) => res.render("pages/admin/index"));
router.use("/users", require(__rootdir + "/server/admin/users"));
router.use("/config", require(__rootdir + "/server/admin/config"));
router.use("/problems", require(__rootdir + "/server/admin/problems"));

module.exports = router;
