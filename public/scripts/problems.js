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
    $(`.problem-statement[data-id=${id}]`).removeClass(
      "problem-statement__hidden"
    );

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

  if (localStorage.getItem("lang"))
    $(`select[name="lang"]`).val(localStorage.getItem("lang"));
  $(`select[name="lang"]`).change(e => {
    localStorage.setItem("lang", e.target.value);
  });
});

const submission = ({ problem, status }) => {
  const msg = status.split("\n").slice(1).join("\n").trim();
  status = status.split("\n")[0].trim();

  const $elem = $(`
  <tr>
    <td>${problem}</td>
    <td>${status}</td>
  </tr>
  `);

  if(msg.length !== 0) $elem.addClass("hoverable");

  $elem.click(() => {
    if(msg.length !== 0) alert(msg);
  });
  return $elem;
}

const updateSubmissions = () => {
  $.get("/grader/submissions").then(subs => {
    $("#submissions").empty();
    
    $("#submissions").append(
      subs
        .sort((a, b) => b.time - a.time)
        .map(sub => submission(sub))
    );

    subs
      .filter(sub => sub.status === "OK")
      .map(sub => sub.problem)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .forEach(name =>
        $(`.problem-list--link[data-name="${name}"]`).addClass(
          "problem-list--link__done"
        )
      );
  });
};

$(updateSubmissions);
setInterval(updateSubmissions, 1000);
