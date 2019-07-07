const { Client } = require("pg");
const async = require("async");
const { connectionString } = require("./config");

console.log(connectionString);

const client = new Client({ connectionString });
client.connect();

const queries = [
  "CREATE TABLE users(id SERIAL PRIMARY KEY, username TEXT not null, email TEXT not null, password TEXT not null, division TEXT not null)",
  "CREATE TABLE solves(user_id INTEGER not null, problem TEXT not null, status TEXT not null, time BIGINT not null)",
  "INSERT INTO users(username, email, password, division) VALUES('admin', '', '$2y$12$Y4NqIDHjqbkpc8ZoCzAKUukwK0vFWilDToV0bAnLwOcQ6ZKfDh56W', 'advanced') RETURNING *"
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
