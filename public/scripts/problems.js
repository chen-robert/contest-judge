window.MathJax = {
  tex2jax: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    processEscapes: true
  }
};

$(() => {
  $(".problem-list--item a").click(function(e) {
    $(".problem-statement").hide();
    const id = $(this).data("id");
    $(`.problem-statement[data-id=${id}]`).show();

    $("#pid").val($(this).data("name"));
  });

  // Substring 1 to remove the "#"
  const hash = window.location.hash.substring(1);
  const $target = $(`.problem-statement[data-hash=${hash}]`);
  if($target.length !== 0){
    $(".problem-statement").hide();
    $target.show();
  }

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
