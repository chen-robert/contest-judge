const router = require("express").Router();
const config = require(__rootdir + "/config.json");
const { renderWithPopups } = require(__rootdir + "/server/util");

const fs = require("fs");
const updateConfigFile = () => {
  fs.writeFileSync(
    __rootdir + "/config.json",
    JSON.stringify(config, undefined, 2)
  );
};

router.get("/", (req, res) =>
  renderWithPopups(req, res, "pages/admin/config", { config })
);
router.post("/update", (req, res) => {
  try {
    const newData = JSON.parse(req.body.data);

    Object.keys(newData).forEach(key => {
      if (config[key] !== newData[key]) {
        config[key] = newData[key];
      }
    });
    updateConfigFile();

    req.session.message = "Sucessfully updated config";
  } catch (e) {
    req.session.error = e.message;
  }
  return res.redirect("back");
});

router.post("/time", (req, res) => {
  const startTime = new Date(req.body.startTime).getTime();
  const endTime = new Date(req.body.startTime).getTime();

  if (startTime == NaN) {
    req.session.error = `${req.body.startTime} invalid Date string`;
  } else if (endTime == NaN) {
    req.session.error = `${req.body.endTime} invalid Date string`;
  } else {
    config.startTime = req.body.startTime;
    config.endTime = req.body.endTime;

    updateConfigFile();

    req.session.message = "Successfully updated times";
  }
  return res.redirect("back");
});

module.exports = router;
