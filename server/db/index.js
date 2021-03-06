const { Client } = require("pg");
const bcrypt = require("bcryptjs");
const { connectionString } = require("./config");

const client = new Client({ connectionString });
client.connect();

const handleError = (err, callback) => {
  callback(err);
};

module.exports = {
  addUser: (name, email, password, division, callback) => {
    client
      .query("SELECT * FROM users WHERE username = $1", [name])
      .then(res => {
        if (res.rows.length > 0) {
          throw "Username already exists";
        }
        return client.query("SELECT * FROM users WHERE email = $1", [email]);
      })
      .then(res => {
        if (res.rows.length > 0) {
          throw "Email already exists";
        }
        return bcrypt.hash(password, 10);
      })
      .then(hash => {
        client.query(
          "INSERT INTO users(username, email, password, division) VALUES($1, $2, $3, $4) RETURNING *",
          [name, email, hash, division]
        );
      })
      .then(() => callback())
      .catch(err => handleError(err, callback));
  },
  removeUser: (name, callback) => {
    client
      .query("DELETE FROM users WHERE username = $1 RETURNING *", [name])
      .then(callback)
      .catch(err => handleError(err, callback));
  },
  checkLogin: (name, password, callback) => {
    let data;
    client
      .query("SELECT * FROM users WHERE username = $1", [name])
      .then(res => {
        if (res.rows.length === 0) {
          return;
        }
        if (res.rows.length !== 1) {
          console.error(`Multiple entries for username ${name}`);
          return;
        }
        data = res.rows[0];
        return bcrypt.compare(password, data.password);
      })
      .then(res => {
        if (!res) {
          return callback("Incorrect username or password");
        }
        return callback(null, { id: data.id, division: data.division });
      })
      .catch(err => handleError(err, callback));
  },
  getUserData: callback => {
    client
      .query("SELECT id, username, email, division FROM users")
      .then(res => callback(res.rows))
      .catch(err => handleError(err, callback));
  },
  startGrading: (uid, problem) => {
    const time = new Date().getTime();
    client
      .query(
        `
      INSERT INTO solves
      (user_id, problem, status, time) 
      VALUES($1, $2, $3, $4)
      `,
        [uid, problem, "GRADING", time]
      )
      .catch(err => console.log("Grading broken"));
    return time;
  },
  finishGrading: (uid, time, problem, status) => {
    client.query(
      `
      UPDATE solves
      SET status = $1
      WHERE user_id = $2 AND problem = $3 AND time = $4
      `,
      [status, uid, problem, time]
    );
  },
  getAllSolves: callback => {
    client
      .query(
        `
        SELECT solves.user_id, solves.problem, solves.status, solves.time, users.username, users.division FROM solves 
        INNER JOIN users ON solves.user_id = users.id
      `
      )
      .then(res => callback(res.rows))
      .catch(err => handleError(err, callback));
  },
  getSolves: (uid, callback) => {
    client
      .query("SELECT * FROM solves WHERE user_id = $1", [uid])
      .then(res => callback(res.rows))
      .catch(err => handleError(err, callback));
  }
};
