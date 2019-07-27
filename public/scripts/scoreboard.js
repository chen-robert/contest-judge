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

const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get("refresh")) setInterval(updateScoreboard, Math.max(1000, +urlParams.get("refresh") || 1000));
