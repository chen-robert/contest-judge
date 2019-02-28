import $ from "jquery";

const submission = ({ problem, status }) => `
<tr>
  <td>${problem}</td>
  <td>${status}</td>
</tr>
`;

const scoreboardItem = ({ username, score, division }) => `
<tr>
  <td>${username}</td>
  <td>${score}</td>
  <td>${division}</td>
</tr>
`;

const graderLoop = problemData => {
  $.get("/users").then(users => {
    const idToUser = {};
    users.forEach(user => idToUser[user.id] = user);
    
  $.get("/grader/user").then(user => {
    function reload() {
      $.get("/grader").then(subs => {
        $("#submissions").html(
          subs
            .filter(sub => sub.uid === user.uid)
            .sort((a, b) => b.time - a.time)
            .slice(0, 15)
            .map(sub => submission(sub))
            .join("\n")
        );

        const isUnique = (val, index, self) => self.indexOf(val) === index;

        const users = subs.map(sub => sub.uid).filter(isUnique);

        const calculateScore = uid => {
          let score = 0;

          const problemToConfig = {};
          problemData.forEach(
            problem => (problemToConfig[problem.name] = problem.config)
          );

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

          const incorrect = subs
            .filter(sub => sub.uid === uid)
            .filter(sub => sub.status !== "OK" && sub.status !== "GRADING")
            .filter(
              sub =>
                correctTimes[sub.problem] === undefined ||
                sub.time < correctTimes[sub.problem]
            )
            .forEach(sub => (score -= problemToConfig[sub.problem].penalty));

          return {
            username: idToUser[uid].username,
            score,
            division: idToUser[uid].division, 
            lastTime: Math.max.apply(Object.values(correctTimes))
          };
        };

        $("#scoreboard").html(
          users
            .map(calculateScore)
            .sort((a, b) => {
              if(b.score == a.score) return b.time - a.time;
              return b.score - a.score;
            })
            .map(sub => scoreboardItem(sub))
            .join("\n")
        );
      });
    }
    setInterval(reload, 1000);
    reload();
  });
  });
};

export default graderLoop;
