import "./styles/main.less";

import "./navbar.js";
import "./timer.js";
import "./forms.js";

import $ from "jquery";

const problemList = name => `
<div class="problem-list--item">
  <a class="navbar--link" href="#problem-${name}">${name}</a>
</div>
`;
const problemStatement = ({ name, statement, sampleIn, sampleOut }) => `
<div class="problem-statement">
  <div class="problem--title">${name}</div>
  <div class="problem--text">${statement}</div>
  <div class="problem--title problem--title__secondary">Sample Input</div>
  <div class="problem--text">${sampleIn}</div>
  <div class="problem--title problem--title__secondary">Sample Output</div>
  <div class="problem--text">${sampleOut}</div>
</div>
`;

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
$(() => {
  $.get("/problems").then(problemData => {
    problemData.forEach((problem, i) => {
      const $problemElem = $(problemStatement(problem)).appendTo("#problems");
      if (i === 0) {
        $("#pid").val(problem.name);
      } else {
        $problemElem.hide();
      }

      const $listElem = $(problemList(problem.name)).appendTo("#problem-list");
      $listElem.click(e => {
        e.preventDefault();

        $(".problem-statement").hide();
        $problemElem.show();
        $("#pid").val(problem.name);
      });
    });
    
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
            problemData.forEach(problem => problemToConfig[problem.name] = problem.config);
            
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
              .forEach(sub => score -= problemToConfig[sub.problem].penalty);

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
  });
});
