global.__rootdir = __dirname;

// Config
const PORT = process.env.PORT || 3000;
const config = require(__dirname + "/config.js");

// Express
const express = require("express");
const session = require("express-session");

// Server
const { fullProblemData } = require("./server/problemData").loadProblems(
  __dirname + "/problems"
);
const loadProblems = require(__rootdir + "/server/routes/problems.js")(config);
const {getUserData} = require(__rootdir + "/server/db");

const enforceLogin = require(__rootdir + "/server/enforceLogin.js");
const enforceAdmin = require(__rootdir + "/server/enforceAdmin.js");


// Express app
const app = express();

const lessMiddleware = require('less-middleware');
app.use(lessMiddleware(__dirname + '/public'));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET || "aria is nice",
    resave: false,
    saveUninitialized: true
  })
);

// Public routes
app.use("/login", require(__rootdir + "/server/routes/login.js"));

// Private routes
//app.use(enforceLogin);
app.get("/", (req, res) => {
  res.render("pages/index", {
    problems: loadProblems(),
    message: req.message,
    error: req.error
  });
});
app.get("/users", (req, res) => getUserData(data => res.json(data)));
app.get("/config", (req, res) => res.send(config));

app.use(
  "/grader",
  require(__rootdir + "/server/routes/grader.js")(fullProblemData)
);

//app.use(enforceAdmin);
app.use("/admin", require(__rootdir + "/server/routes/admin.js")(config));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
