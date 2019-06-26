const {getUserData} = require(__rootdir + "/server/db");
const { getPopups } = require(__rootdir + "/server/util");

module.exports = config => {
  const router = require("express").Router();

  const { getUserData, addUser, removeUser } = require(__rootdir +
    "/server/db");

  router.get("/", (req, res) => res.render("pages/admin/index"));
  router.get("/users", (req, res) => {
    const {error, message} = getPopups(req.session);
  
    res.render("pages/admin/users", {
      error, 
      message
    });
  });
  router.get("/users/list", (req, res) => getUserData(data => res.json(data)));


  router.post("/users/remove", (req, res) =>
    removeUser(req.body.username, data => res.send(data))
  );
  router.post("/users/add", (req, res) => {
    addUser(
      req.body.username,
      req.body.username + "none.com",
      req.body.password,
      req.body.division,
      err => {
        if (err) {
          req.session.error = err;
          res.redirect("/admin/users");
        }
        req.session.message = `User ${req.body.username} created`;
        res.redirect("/admin/users");
      }
    );
  });

  return router;
};
