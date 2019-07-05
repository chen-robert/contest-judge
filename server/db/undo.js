const { Client } = require("pg");
const async = require("async");
const { connectionString } = require("./config");

console.log(connectionString);

const client = new Client({ connectionString });
client.connect();

const queries = ["DELETE FROM solves WHERE problem = 'Fibonecci v2' "];

async.eachSeries(
  queries,
  (query, callback) => {
    client.query(query, (err, res) => {
      console.log(err ? err.stack : res.command);
      callback();
    });
  },
  err => {
    if (err) console.log(err);
    client.end();
  }
);
