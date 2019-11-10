const config = require(__rootdir + "/config");

const { problemData } = require(__rootdir + "/server/problemData");

const loadProblems = division => {
  const divisionProblems = problemData.filter(
    problem =>
      division === undefined ||
      problem.config.division === null ||
      problem.config.division.includes(division)
  );

  if (Date.now() < new Date(config.startTime).getTime()) {
    return divisionProblems.filter(problem => problem.config.sample);
  } else {
    return divisionProblems;
  }
};

module.exports = loadProblems;
