global.__rootdir = __dirname;

// Config
const PORT = process.env.PORT || 3000;
const config = require(__dirname + "/config.js");

// Express
const express = require("express");
const cookieSession = require("cookie-session");
const lessMiddleware = require('less-middleware');
const bodyParser = require("body-parser");

// Server
const { fullProblemData } = require("./server/problemData").loadProblems(
  __dirname + "/problems"
);
const loadProblems = require(__rootdir + "/server/routes/problems.js")(config);
const { getPopups } = require(__rootdir + "/server/util");

// Routes
const enforceLogin = require(__rootdir + "/server/enforceLogin.js");
const enforceAdmin = require(__rootdir + "/server/enforceAdmin.js");


// Express app
const app = express();


app.set("view engine", "ejs");
app.use(lessMiddleware(__dirname + '/public'));
app.use(express.static(__dirname + "/public"));

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

// Require login
app.use(enforceLogin);
app.get("/", (req, res) => {
  const {error, message} = getPopups(req.session);
  
  res.render("pages/index", {
    problems: loadProblems(),
    error, 
    message
  });
});
app.get("/scoreboard", (req, res) => {
  const {error, message} = getPopups(req.session);
  
  res.render("pages/scoreboard", {
    error, 
    message
  });
});
app.use("/api", require(__rootdir + "/server/routes/api.js")(config));
app.get("/config", (req, res) => res.send(config));
app.use(
  "/grader",
  require(__rootdir + "/server/routes/grader.js")(fullProblemData)
);

// Require admin
//app.use(enforceAdmin);
app.use("/admin", require(__rootdir + "/server/routes/admin.js")(config));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
