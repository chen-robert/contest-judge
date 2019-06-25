module.exports = config => {
  const router = require("express").Router();

  const { getUserData, addUser, removeUser } = require(__rootdir +
    "/server/db");

  router.get("/", (req, res) => res.render("pages/admin/index"));
  router.get("/users", (req, res) => res.render("pages/admin/users"));

  router.post("/user/remove", (req, res) =>
    removeUser(req.body.username, data => res.send(data))
  );
  router.post("/user/add", (req, res) => {
    addUser(
      req.body.username,
      req.body.username + "none.com",
      req.body.password,
      req.body.division,
      err => {
        if (err) return res.send({ error: err });
        res.send({ message: `User ${req.body.username} created` });
      }
    );
  });

  return router;
};
