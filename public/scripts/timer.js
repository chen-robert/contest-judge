const formatMilliseconds = ms => {
  const secs = Math.floor(ms / 1000);
  const minutes = Math.floor(secs / 60);
  const hours = Math.floor(minutes / 60);

  if (hours == 0) return `${minutes}:${pad(secs % 60)}`;
  return `${hours}:${pad(minutes % 60)}:${pad(secs % 60)}`;
};

const pad = num => {
  if (num < 10) return "0" + num;
  return num;
};

$.get("/config").then(({ startTime, endTime }) => {
  const $timeElem = $("#timer");

  setInterval(() => {
    const now = Date.now();

    let displayText;
    if (now < startTime) {
      displayText = `${formatMilliseconds(
        startTime - now
      )} Before Contest Start`;
    } else if (now < endTime) {
      displayText = `${formatMilliseconds(endTime - now)} Before Contest End`;
    } else {
      displayText = "Contest Over";
    }
    $timeElem.text(displayText);
  }, 500);
});
