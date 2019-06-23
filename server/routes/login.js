const router = require("express").Router();

const { checkLogin } = require(__rootdir + "/server/db");

router.get("/", (req, res) => {
  res.render("pages/login", {
    message: req.message,
    error: res.locals.error
  });
});

router.post("/", (req, res) => {
  checkLogin(req.body.username, req.body.password, (err, data) => {
    if (err) {
      res.locals.error = err;
      return res.redirect("/login");
    }
    
    return res.redirect("/");
  });
});

module.exports = router;
