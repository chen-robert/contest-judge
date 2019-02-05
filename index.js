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
const { addUser } = require(__rootdir + "/server/db");
const enforceLogin = require(__rootdir + "/server/enforceLogin.js");

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

app.get("/admin", (req, res) => res.sendFile(__dirname + "/dist/admin.html"));
app.post("/addUser", (req, res) => {
  addUser(
    req.body.username,
    req.body.username + "@gmail.com",
    req.body.password,
    err => {
      if (err) return res.send({ error: err });
      res.send({ message: `User ${req.body.username} created` });
    }
  );
});

// Private routes
app.use(enforceLogin);
app.get("/config", (req, res) => res.send(config));
app.use("/problems", require(__rootdir + "/server/routes/problems.js"));
app.use(
  "/grader",
  require(__rootdir + "/server/routes/grader.js")(fullProblemData)
);
app.use(express.static(__dirname + "/dist", { extensions: ["html"] }));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
