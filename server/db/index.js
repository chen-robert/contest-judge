const {Client} = require("pg");
const bcrypt = require("bcryptjs");
const { connectionString } = require("./config");

const client = new Client({ connectionString });
client.connect();

const handleError = (err, callback) => {
  console.error(err);
  callback("Unknown error");
};
module.exports = {
 addUser: (name, email, password, callback) => {
    client
      .query("SELECT * FROM users WHERE username = $1", [name])
      .then(res => {
        if (res.rows.length > 0) {
          return callback("Username already exists");
        }
        return client.query("SELECT * FROM users WHERE email = $1", [email]);
      })
      .then(res => {
        if(!res)return;
        
        if (res.rows.length > 0) {
          return callback("Email already exists");
        }

        return bcrypt.hash(password, 10);
      })
      .then(hash =>{
        client.query(
          "INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *",
          [name, email, hash]
        )
      }
      )
      .then(() => callback())
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
        return callback(null, { id: data.id });
      })
      .catch(err => handleError(err, callback));
  },
  startGrading: (uid, problem) => {
    console.log("User id " + uid);
    const time = new Date().getTime();
    client.query(
      `
      INSERT INTO solves
      (user_id, problem, status, time) 
      VALUES($1, $2, $3, $4)
      `,
      [uid, problem, "GRADING", time]
    );
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
  getSolves: (callback) => {
     client
      .query("SELECT * FROM solves")
      .then(res => callback(res.rows))
      .catch(err => handleError(err, callback));
  }
}