global.__rootdir = __dirname;

// Config
const PORT = process.env.PORT || 3000;
const config = require(__dirname + "/config.js");

// Express
const express = require("express");
const cookieSession = require("cookie-session");

// Server
const { fullProblemData } = require("./server/problemData").loadProblems(
  __dirname + "/problems"
);
const loadProblems = require(__rootdir + "/server/routes/problems.js")(config);
const { getPopups } = require(__rootdir + "/server/util");

const enforceLogin = require(__rootdir + "/server/enforceLogin.js");
const enforceAdmin = require(__rootdir + "/server/enforceAdmin.js");

// Express app
const app = express();

const lessMiddleware = require("less-middleware");
app.use(lessMiddleware(__dirname + "/public"));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRET || "aria is nice"],
    maxAge: 24 * 60 * 60 * 1000
  })
);

// Public routes
app.use("/login", require(__rootdir + "/server/routes/login.js"));

// Private routes
app.use(enforceLogin);
app.get("/", (req, res) => {
  const { error, message } = getPopups(req.session);

  res.render("pages/index", {
    problems: loadProblems(),
    error,
    message
  });
});
app.get("/scoreboard", (req, res) => {
  const { error, message } = getPopups(req.session);

  res.render("pages/scoreboard", {
    error,
    message
  });
});

app.use("/api", require(__rootdir + "/server/routes/api.js"));
app.get("/config", (req, res) => res.send(config));

app.use(
  "/grader",
  require(__rootdir + "/server/routes/grader.js")(fullProblemData)
);

//app.use(enforceAdmin);
app.use("/admin", require(__rootdir + "/server/routes/admin.js")(config));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
