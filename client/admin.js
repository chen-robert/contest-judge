import "./styles/main.less";
import "./styles/admin.less";

import "./forms.js";

import $ from "jquery";

const refresh = () => {
  $.get("/admin/users").then(users => {
    $("#users").html("");
    
    users.forEach(user => {
      const $row = $(`
      <tr class="submissions--row">
        <td>${user.username}</td>
        <td>${user.division}</td>
      <5r>
      `);
      
      $row.data("username", user.username);
      
      $("#users").append($row);
    });
    
    $(".submissions--row").click(function(){
      $.post("/admin/remove/", {username: $(this).data("username")});
    });
  });
}



refresh();
setInterval(refresh, 2500);