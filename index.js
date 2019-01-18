const express = require("express");
const path = require("path");
const compression = require("compression");
const enforce = require("express-sslify");
const problemData = require("./server/problemData").loadProblems(
  __dirname + "/problems"
);
const fullProblemData = require("./server/problemData").loadFullProblemData(
  __dirname + "/problems"
);
const { addUser, checkLogin } = require("./server/db");
const enforceLogin = require("./server/enforceLogin.js");

const session = require("express-session");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SECRET || "aria is nice :thinking:",
    resave: false,
    saveUninitialized: true
  })
);

app.get("/login", (req, res) => res.sendFile(__dirname + "/dist/login.html"));
app.post("/login", (req, res) => {
  checkLogin(req.body.username, req.body.password, (err, data) => {
    if (err) return res.send({ error: err });
    req.session.uid = data.id;
    req.session.username = req.body.username;
    return res.send({ redirect: "/" });
  });
});

app.get("/bundle.js", (req, res) =>
  res.sendFile(__dirname + "/dist/bundle.js")
);

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

app.use("/grader", require("./server/grader.js")(fullProblemData));

const PORT = process.env.PORT || 3000;

app.use(compression());
if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
  console.log(process.env.NODE_ENV);
}

app.get("/problems", (req, res) => res.send(problemData));

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => res.redirect("/"));
app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
