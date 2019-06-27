const { getUserData } = require(__rootdir + "/server/db");

module.exports = config => {
  const router = require("express").Router();

  router.get("/", (req, res) => res.render("pages/admin/index"));
  router.use("/users", require(__rootdir + "/server/admin/users"));
  router.use("/config", require(__rootdir + "/server/admin/config")(config));
  router.use("/problems", require(__rootdir + "/server/admin/problems"));

  return router;
};
