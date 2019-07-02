const router = require("express").Router();

const { getPopups } = require(__rootdir + "/server/util");
const { checkLogin } = require(__rootdir + "/server/db");

router.get("/", (req, res) => {
  const { error, message } = getPopups(req.session);

  res.render("pages/login", {
    message: message,
    error: error
  });
});

router.post("/", (req, res) => {
  checkLogin(req.body.username, req.body.password, (err, data) => {
    if (err) {
      req.session.error = err;
      return res.redirect("back");
    }

    req.session.uid = data.id;
    req.session.username = req.body.username;
    return res.redirect("/contest");
  });
});

module.exports = router;
