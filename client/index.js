import "./styles/main.less";
import $ from "jquery";

const problemList = (name) => `
<div class="problem-list--item">
  <a class="navbar--link" href="#problem-${name}">${name}</a>
</div>
`;
const problemStatement = ({name, statement, sampleIn, sampleOut}) => `
<div class="problem-statement">
  <div class="problem--title">${name}</div>
  <div class="problem--text">${statement}</div>
  <div class="problem--title">Sample Input</div>
  <div class="problem--text">${sampleIn}</div>
  <div class="problem--title">Sample Output</div>
  <div class="problem--text">${sampleOut}</div>
</div>
`;

$.get("/problems")
  .then(data => {
    data.forEach(problem => {
      const $problemElem = $(problemStatement(problem)).appendTo("#problems");
      $problemElem.hide();
      
      const $listElem = $(problemList(problem.name)).appendTo("#problem-list");
      $listElem.click(() => {
        $(".problem-statement").hide();
        $problemElem.show();
        $("#pid").val(problem.name);
      });
    });
  });