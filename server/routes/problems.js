module.exports = config => {
  const { problemData } = require(__rootdir +
    "/server/problemData").loadProblems(__rootdir + "/problems");

  const loadProblems = () => {
    if (Date.now() < new Date(config.startTime).getTime()) {
      return problemData.filter(problem => problem.config.sample);
    } else {
      return problemData;
    }
  };

  return loadProblems;
};
