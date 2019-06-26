const refresh = () => {
  $.get("/admin/users/list").then(users => {
    $("#users").html("");

    users.forEach(user => {
      const $row = $(`
      <tr class="submissions--row">
        <td><input class="submissions--input" value="${user.username}" /></td>
        <td>
          <select class="submissions--input" class="form--input" name="division">
            <option ${
              user.division === "beginner" ? "selected" : ""
            } value="beginner">Beginner</option>
            <option ${
              user.division === "advanced" ? "selected" : ""
            } value="advanced">Advanced</option>
          </select>
        </td>
        <td class="submissions--delete">X</td>
      </tr>
      `);

      $row.find(".submissions--delete").data("username", user.username);

      $("#users").append($row);
    });

    $(".submissions--delete").click(function() {
      if (
        confirm(`Are you sure you want to delete ${$(this).data("username")}`)
      ) {
        $.post("/admin/users/remove/", {
          username: $(this).data("username")
        }).then(() => refresh());
      }
    });
  });
};

refresh();
