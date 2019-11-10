global.__rootdir = __dirname;

// Config
const PORT = process.env.PORT || 3000;
const config = require(__dirname + "/config.json");
console.info("Loaded config from ./config.json");
console.info(JSON.stringify(config, undefined, 2));

// Express
const express = require("express");
const cookieSession = require("cookie-session");
const lessMiddleware = require("less-middleware");
const bodyParser = require("body-parser");
const xssFilter = require("x-xss-protection");

// Access restrictions
const enforceLogin = require(__rootdir + "/server/enforceLogin.js");
const enforceAdmin = require(__rootdir + "/server/enforceAdmin.js");

// Express app
const app = express();
app.set("view engine", "ejs");

// Static assets
app.use(lessMiddleware(__dirname + "/public"));
app.use(express.static(__dirname + "/public"));

// Security
app.use(xssFilter());
app.disable("x-powered-by");

// Parsing and cookies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRET || "lorem ipsum"],
    maxAge: 24 * 60 * 60 * 1000
  })
);

app.get("/", (req, res) => res.render("pages/index"));
app.get("/about", (req, res) => res.render("pages/about", {
  people: config.about
}))

// Public routes
app.use("/login", require(__rootdir + "/server/routes/login.js"));
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Require login
app.use(enforceLogin);

app.get("/config", (req, res) => res.send(config));

app.use("/contest", require(__rootdir + "/server/routes/contest"));
app.use("/api", require(__rootdir + "/server/routes/api"));
app.use("/grader", require(__rootdir + "/server/routes/grader"));

// Require admin
app.use(enforceAdmin);
app.use("/admin", require(__rootdir + "/server/routes/admin.js"));

const { addUser } = require(__rootdir + "/server/db");

addUser(
  "admin",
  "admin",
  process.env.ADMIN_PASSWORD || "ihsprogramming",
  "advanced",
  err => {
    if (!err)
      console.log(
        "Successfully created new admin user with password $ADMIN_PASSWORD"
      );
  }
);

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
