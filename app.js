const express = require("express");
const path = require("path");
const compression = require("compression");
const enforce = require('express-sslify');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
if(process.env.NODE_ENV === "production"){
  app.use(enforce.HTTPS({trustProtoHeader: true}));
  console.log(process.env.NODE_ENV);
}

app.use(express.static(path.join(__dirname, "dist")));
app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
