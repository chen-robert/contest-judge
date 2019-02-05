import $ from "jquery";

const submission = ({ problem, status }) => `
<tr>
  <td>${problem}</td>
  <td>${status}</td>
</tr>
`;

const scoreboardItem = ({ username, score }) => `
<tr>
  <td>${username}</td>
  <td>${score}</td>
</tr>
`;

const graderLoop = problemData => {
  $.get("/grader/user").then(user => {
    function reload() {
      $.get("/grader").then(subs => {
        $("#submissions").html(
          subs
            .filter(sub => sub.uid === user.uid)
            .sort((a, b) => b.time - a.time)
            .slice(0, 5)
            .map(sub => submission(sub))
            .join("\n")
        );

        const isUnique = (val, index, self) => self.indexOf(val) === index;
        const idToName = {};
        subs.forEach(sub => (idToName[sub.uid] = sub.username));

        const users = subs.map(sub => sub.uid).filter(isUnique);

        const calculateScore = uid => {
          let score = 0;

          const problemToConfig = {};
          problemData.forEach(
            problem => (problemToConfig[problem.name] = problem.config)
          );

          const correctTimes = {};
          subs
            .filter(sub => sub.status === "OK")
            .sort((a, b) => a.time - b.time)
            .forEach(sub => {
              if (correctTimes[sub.problem] == undefined) {
                correctTimes[sub.problem] = sub.time;

                score += problemToConfig[sub.problem].value;
              }
            });
          const correct = Object.keys(correctTimes).length;

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
            username: idToName[uid],
            score
          };
        };

        $("#scoreboard").html(
          users
            .map(calculateScore)
            .sort((a, b) => b.score - a.score)
            .map(sub => scoreboardItem(sub))
            .join("\n")
        );
      });
    }
    setInterval(reload, 1000);
    reload();
  });
};

export default graderLoop;
