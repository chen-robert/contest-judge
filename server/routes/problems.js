module.exports = config => {
  const { problemData } = require(__rootdir + "/server/problemData").loadProblems(
    __rootdir + "/problems"
  );

  const loadProblems = () => {
    if (Date.now() < config.startTime) {
      return problemData.filter(problem => problem.config.sample);
    } else {
      return problemData;
    }
  };

  return loadProblems;
}