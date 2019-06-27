const router = require("express").Router();
const { renderWithPopups } = require(__rootdir + "/server/util");

module.exports = config => {
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
      config.startTime = startTime;
      config.endTime = endTime;

      req.session.message = "Successfully updated times";
    }
    return res.redirect("back");
  });

  return router;
};
