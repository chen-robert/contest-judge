const config = require(__rootdir + "/config");

const { problemData } = require(__rootdir + "/server/problemData");

const loadProblems = () => {
  if (Date.now() < new Date(config.startTime).getTime()) {
    return problemData.filter(problem => problem.config.sample);
  } else {
    return problemData;
  }
};

module.exports = loadProblems;
