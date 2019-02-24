import "./styles/main.less";

import "./forms.js";

import $ from "jquery";

$.get("/admin/users").then(users => {
  users.forEach(user => $("#users").append(`
  <tr>
    <td>${user.username}</td>
    <td>${user.division}</td>
  <5r>
  `));
});