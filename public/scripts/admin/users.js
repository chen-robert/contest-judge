$(() => {
  $(".submissions--delete").click(function() {
    if (
      confirm(`Are you sure you want to delete ${$(this).data("username")}`)
    ) {
      $.post("/admin/users/remove/", {
        username: $(this).data("username")
      }).then(data => (window.location.href = "/admin/users"));
    }
  });
});
