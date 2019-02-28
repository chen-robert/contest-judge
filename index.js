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
const enforceLogin = require(__rootdir + "/server/enforceLogin.js");
const enforceAdmin = require(__rootdir + "/server/enforceAdmin.js");
const {getUserData} = require(__rootdir + "/server/db");

// Express app
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET || "aria is nice :thinking:",
    resave: false,
    saveUninitialized: true
  })
);

// Public routes
app.use("/login", require(__rootdir + "/server/routes/login.js"));

// Private routes
app.use(enforceLogin);
app.get("/users", (req, res) => getUserData(data => res.json(data)));
app.get("/config", (req, res) => res.send(config));
app.use("/problems", require(__rootdir + "/server/routes/problems.js")(config));
app.use(
  "/grader",
  require(__rootdir + "/server/routes/grader.js")(fullProblemData)
);

app.use(express.static(__dirname + "/dist", { extensions: ["html"] }));

app.use(enforceAdmin);
app.use("/admin", require(__rootdir + "/server/routes/admin.js")(config));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
