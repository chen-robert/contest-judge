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
  <div class="problem--title problem--title__secondary">Sample Input</div>
  <div class="problem--text">${sampleIn}</div>
  <div class="problem--title problem--title__secondary">Sample Output</div>
  <div class="problem--text">${sampleOut}</div>
</div>
`;

$.get("/problems")
  .then(data => {
    data.forEach((problem, i) => {
      const $problemElem = $(problemStatement(problem)).appendTo("#problems");
      if(i === 0){
        $problemElem.hide();
        $("#pid").val(problem.name);
      }
      
      const $listElem = $(problemList(problem.name)).appendTo("#problem-list");
      $listElem.click(e => {
        e.preventDefault();
        
        $(".problem-statement").hide();
        $problemElem.show();
        $("#pid").val(problem.name);
      });
      

    });
  });