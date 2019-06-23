window.MathJax = {
  tex2jax: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    processEscapes: true
  }
};

$(() => {
  $(".problem-list--item").click(function(e) {
    e.preventDefault();

    $(".problem-statement").hide();
    const id = $(this).data("id");
    $(`div[data-id=${id}]`).show();

    $("#pid").val($(this).data("name"));
  });
});

const submission = ({ problem, status }) => `
<tr>
  <td>${problem}</td>
  <td>${status}</td>
</tr>
`;

const updateSubmissions = () => {
  $.get("/grader/submissions").then(subs => {
    $("#submissions").html(
      subs
        .sort((a, b) => b.time - a.time)
        .map(sub => submission(sub))
        .join("\n")
    );
  });
};

$(updateSubmissions);
setInterval(updateSubmissions, 1000);
