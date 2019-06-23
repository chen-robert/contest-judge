import marked from "marked";

import "./styles/main.less";

import "./navbar.js";
import "./timer.js";
import "./forms.js";
import graderLoop from "./grader.js";

import $ from "jquery";

const problemList = name => `
<div class="problem-list--item">
  <a class="navbar--link" href="#problem-${name}">${name}</a>
</div>
`;
const problemStatement = ({ name, statement, sampleIn, sampleOut }) => `
<div class="problem-statement">
  <div class="problem--title">${name}</div>
  <div class="problem--text">${marked(statement)}</div>
  <div class="problem--title problem--title__secondary">Sample Input</div>
  <div class="problem--text">${sampleIn}</div>
  <div class="problem--title problem--title__secondary">Sample Output</div>
  <div class="problem--text">${sampleOut}</div>
</div>
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

    graderLoop(problemData);
  });
});

window.MathJax = {
  tex2jax: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    processEscapes: true
  }
};
