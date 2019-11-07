$(() => {
  $(".submissions--row").click(function() {
    if (
      confirm(`Are you sure you want to delete ${$(this).data("username")}`)
    ) {
      $.post("/admin/users/remove/", {
        username: $(this).data("username")
      }).then(() => window.location.reload());
    }
  });
});
