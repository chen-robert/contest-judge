const { Client } = require("pg");
const async = require("async");
const { connectionString } = require("./config");

console.log(connectionString);

const client = new Client({ connectionString });
client.connect();

const queries = [
  "DROP TABLE users",
  "DROP TABLE solves",
  "CREATE TABLE users(id SERIAL PRIMARY KEY, username TEXT not null, email TEXT not null, password TEXT not null, division TEXT not null)",
  "CREATE TABLE solves(user_id INTEGER not null, problem TEXT not null, status TEXT not null, time BIGINT not null)",
  "INSERT INTO users(username, email, password, division) VALUES('admin', '', '$2y$12$pr9QbWlYSdyMOUvSm0F.J.71/ms1hshrXYdiHNFs4l2vbtP6wILyW', 'advanced') RETURNING *"
];

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
