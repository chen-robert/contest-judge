import { Client } from "pg";
import async from "async";
import { connectionString } from "./config";

const client = new Client({ connectionString });
client.connect();

const queries = [
  "DROP TABLE users",
  "DROP TABLE data",
  "CREATE TABLE users(id SERIAL PRIMARY KEY, username TEXT not null, password TEXT not null)",
  "CREATE TABLE solves(user_id INTEGER UNIQUE PRIMARY KEY, problem TEXT not null, correct BOOLEAN not null, time BIGINT not null)"
];

async.each(
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
