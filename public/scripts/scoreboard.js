const scoreboardItem = ({ username, score, division }) => `
<tr>
  <td>${username}</td>
  <td>${score}</td>
  <td>${division}</td>
</tr>
`;

const updateScoreboard = () => {
  $.get("/api/scoreboard").then(entries => {
    $("#scoreboard").html(entries.map(sub => scoreboardItem(sub)).join("\n"));
  });
};

$(updateScoreboard);
setInterval(updateScoreboard, 5000);
