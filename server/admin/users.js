const router = require("express").Router();
const { renderWithPopups } = require(__rootdir + "/server/util");
const { getUserData, addUser, removeUser } = require(__rootdir + "/server/db");

router.get("/", (req, res) => {
  getUserData(users =>
    renderWithPopups(req, res, "pages/admin/users", { users })
  );
});

router.get("/list", (req, res) => getUserData(data => res.json(data)));
router.post("/remove", (req, res) => {
  removeUser(req.body.username, () => {
    req.session.message = `User ${req.body.username} removed`;
    res.redirect("back");
  });
});

router.post("/add", (req, res) => {
  addUser(
    req.body.username,
    req.body.username + "@none.com",
    req.body.password,
    req.body.division,
    err => {
      if (err) {
        req.session.error = err;
        res.redirect("back");
      }
      req.session.message = `User ${req.body.username} created`;
      res.redirect("back");
    }
  );
});

module.exports = router;
