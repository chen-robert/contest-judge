import $ from "jquery";

$(() => {
  $(".scoreboard-section").hide();

  $("#navbar-problems").click(() => {
    $(".problem-section").show();
    $(".scoreboard-section").hide();
  });

  $("#navbar-scoreboard").click(() => {
    $(".problem-section").hide();
    $(".scoreboard-section").show();
  });
});
