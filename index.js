const express = require("express");
const path = require("path");
const compression = require("compression");
const enforce = require('express-sslify');
const problemData = require(__dirname + "/server/problemData").loadProblems(__dirname + "/problems");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
if(process.env.NODE_ENV === "production"){
  app.use(enforce.HTTPS({trustProtoHeader: true}));
  console.log(process.env.NODE_ENV);
}

app.get("/problems", (req, res) => res.send(problemData));

app.use(express.static(path.join(__dirname, "dist")));
app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
