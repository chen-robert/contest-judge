const router = require("express").Router();

const { checkLogin } = require(__rootdir + "/server/db");

router.get("/", (req, res) => res.render("pages/login"));

router.post("/", (req, res) => {
  checkLogin(req.body.username, req.body.password, (err, data) => {
    if (err) return res.render("pages/login", { error: err });
    
    return res.redirect("/");
  });
});

module.exports = router;
