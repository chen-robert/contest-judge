module.exports = config => {
  const router = require("express").Router();
  const { problemData } = require(__rootdir + "/server/problemData").loadProblems(
    __rootdir + "/problems"
  );

  router.get("/", (req, res) => {
    if (Date.now() < config.startTime) {
      res.send(problemData.filter(problem => problem.config.sample));
    } else {
      res.send(problemData);
    }
  });

  return router;
}