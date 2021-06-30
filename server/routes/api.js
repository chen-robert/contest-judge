const router = require("express").Router();
const config = require(__rootdir + "/config");

const { problemData } = require(__rootdir + "/server/problemData");

const { getAllSolves } = require(__rootdir + "/server/db");

router.get("/scoreboard", (req, res) => {
  getAllSolves(rows => {
    if(!rows.filter) console.log(rows)
    rows = rows.filter(({ time }) => time < new Date(config.endTime).getTime());

    const problemToConfig = {};
    problemData.forEach(
      problem => (problemToConfig[problem.name] = problem.config)
    );

    const subs = rows.map(row => {
      const data = {
        uid: row.user_id,
        username: row.username,
        division: row.division,
        problem: row.problem,
        status: row.status,
        time: row.time
      };

      return data;
    })
      .filter(({ problem }) => problemToConfig[problem] !== undefined)
      .filter(({ username }) => username !== 'admin')

    const isUnique = (val, index, self) => self.indexOf(val) === index;
    const users = subs.map(sub => sub.uid).filter(isUnique);

    const idToUser = {};
    subs.forEach(
      sub =>
        (idToUser[sub.uid] = {
          username: sub.username,
          division: sub.division
        })
    );
    const calculateScore = uid => {
      let score = 0;


      const correctTimes = {};
      subs
        .filter(sub => sub.uid === uid)
        .filter(sub => sub.status === "OK")
        .sort((a, b) => a.time - b.time)
        .forEach(sub => {
          if (correctTimes[sub.problem] == undefined) {
            correctTimes[sub.problem] = sub.time;

            score += problemToConfig[sub.problem].value;
          }
        });

      subs
        .filter(sub => sub.uid === uid)
        .filter(sub => sub.status !== "OK" && sub.status !== "GRADING")
        .filter(
          sub =>
            correctTimes[sub.problem] === undefined ||
            sub.time < correctTimes[sub.problem]
        )
        .forEach(sub => {
          if (problemToConfig[sub.problem] !== undefined) {
            score -= problemToConfig[sub.problem].penalty;
          }
        });

      return {
        username: idToUser[uid].username,
        score,
        division: idToUser[uid].division,
        lastTime: Math.max.apply(Object.values(correctTimes))
      };
    };

    return res.send(
      users.map(calculateScore).sort((a, b) => {
        if (b.score == a.score) return a.time - b.time;
        return b.score - a.score;
      })
    );
  });
});

module.exports = router;
