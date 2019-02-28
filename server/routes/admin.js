module.exports = config => {
  const router = require("express").Router();

  const { getUserData, addUser, removeUser } = require(__rootdir + "/server/db");


  router.get("/", (req, res) => res.sendFile(__rootdir + "/dist/admin.html"));

  router.get("/users", (req, res) => getUserData(data => res.send(data)));

  router.post("/remove", (req, res) => removeUser(req.body.username, data => res.send(data)));

  router.post("/addUser", (req, res) => {
    addUser(
      req.body.username,
      "",
      req.body.password,
      req.body.division,
      err => {
        if (err) return res.send({ error: err });
        res.send({ message: `User ${req.body.username} created` });
      }
    );
  });

  return router;
}