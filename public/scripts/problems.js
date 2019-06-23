window.MathJax = {
  tex2jax: {
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    processEscapes: true
  }
}

$(() => {
  $(".problem-list--item").click(function(e) {
    e.preventDefault();

    $(".problem-statement").hide();
    const id = $(this).data("id");
    $(`div[data-id=${id}]`).show();
    
    $("#pid").val($(this).data("name"));
  });
});