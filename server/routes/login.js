const router = require("express").Router();

const { checkLogin } = require(__rootdir + "/server/db");

router.get("/", (req, res) => res.sendFile(__rootdir + "/dist/login.html"));
router.get("/index.js", (req, res) =>
  res.sendFile(__rootdir + "/dist/login.js")
);

router.post("/", (req, res) => {
  checkLogin(req.body.username, req.body.password, (err, data) => {
    if (err) return res.send({ error: err });
    req.session.uid = data.id;
    req.session.username = req.body.username;
    return res.send({ redirect: "/" });
  });
});

module.exports = router;
