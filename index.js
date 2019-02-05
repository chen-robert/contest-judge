global.__rootdir = __dirname;

// Config
const PORT = process.env.PORT || 3000;
const config = require(__dirname + "/config.js");

// Express
const express = require("express");
const session = require("express-session");

// Server
const {
  problemData,
  fullProblemData
} = require("./server/problemData").loadProblems(__dirname + "/problems");
const { addUser } = require(__rootdir + "/server/db");
const enforceLogin = require(__rootdir + "/server/enforceLogin.js");

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

app.use("/login", require(__rootdir + "/server/login.js"));
app.use("/grader", require("./server/grader.js")(fullProblemData));

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



app.use(enforceLogin);
app.get("/config", (req, res) => res.send(config));
app.get("/problems", (req, res) => res.send(problemData));

app.use(express.static(__dirname + "/dist", {extensions: ["html"]}));
app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
