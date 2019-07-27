window.MathJax = {
  tex2jax: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    processEscapes: true
  },
  CommonHTML: {
    scale: 90
  }
};

$(() => {
  $(".problem-list--item a").click(function(e) {
    $(".problem-statement").addClass("problem-statement__hidden");
    const id = $(this).data("id");
    $(`.problem-statement[data-id=${id}]`).removeClass("problem-statement__hidden");

    $("#pid").val($(this).data("name"));
  });

  // Substring 1 to remove the "#"
  const hash = window.location.hash.substring(1);
  if (hash.length !== 0) {
    const $target = $(`.problem-statement[data-hash=${hash}]`);
    if ($target.length !== 0) {
      $(".problem-statement").addClass("problem-statement__hidden");
      $target.removeClass("problem-statement__hidden");

      $("#pid").val($target.data("name"));
    }
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
