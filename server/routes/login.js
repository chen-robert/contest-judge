const router = require("express").Router();
const Joi = require("@hapi/joi");

const { getPopups } = require(__rootdir + "/server/util");
const { checkLogin } = require(__rootdir + "/server/db");

router.get("/", (req, res) => {
  const { error, message } = getPopups(req.session);

  res.render("pages/login", {
    message: message,
    error: error
  });
});

const loginSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
});

router.post("/", (req, res) => {
  loginSchema.validate(req.body, (err, val) => {
    if (err) {
      return res.status(400).send("Invalid login parameters");
    }
    const { username, password } = val;
    checkLogin(username, password, (err, data) => {
      if (err) {
        req.session.error = err;
        return res.redirect("back");
      }

      req.session.uid = data.id;
      req.session.username = username;
      return res.redirect("/contest");
    });
  });
});

module.exports = router;
