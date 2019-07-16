const fs = require("fs");
const config = require(__rootdir + "/config");

const loadProblems = dir => {
  const config = require(dir + "/config.json");

  const { testData, problemData } = loadData(config, dir);
  return {
    testData,
    problemData,
    config
  };
};

const loadData = (config, dir) => {
  const problemData = [];
  const testData = {};

  const defaultConf = config.default;

  const problemDirs = config.problems || fs.readdirSync(dir);
  const excludedDirs = config.excluded || [];

  problemDirs
    .filter(problem => !excludedDirs.includes(problem))
    .forEach(problem => {
      const problemDir = dir + "/" + problem;

      if (!fs.lstatSync(problemDir).isDirectory()) {
        return;
      }

      // Load problemData
      const statement = fs.readFileSync(problemDir + "/statement.txt", "utf8");
      const config = Object.assign(
        {},
        defaultConf,
        fs.existsSync(problemDir + "/config.json")
          ? require(problemDir + "/config.json")
          : {}
      );
      const currProblemData = {
        name: problem,
        statement,
        config
      };
      problemData.push(currProblemData);

      // Load test cases
      const tests = [];
      let i = 0;
      while (fs.existsSync(`${problemDir}/data/${i}.in`)) {
        tests.push({
          name: `test_${i}`,
          stdin: fs.readFileSync(`${problemDir}/data/${i}.in`).toString(),
          stdout: fs.readFileSync(`${problemDir}/data/${i}.out`).toString()
        });

        i++;
      }
      testData[problem] = tests;
    });

  return { testData, problemData };
};

const combine = problems => {
  const problemData = [];
  const testData = {};

  problems.forEach(problemSet => {
    problemSet.problemData.forEach(problem => {
      problemData.push(problem);
    });
    Object.entries(problemSet.testData).forEach(([problemName, problem]) => {
      testData[problemName] = problem;
    });
  });

  return { problemData, testData };
};

module.exports = combine(
  config.problemDirs.map(dir => loadProblems(__rootdir + dir))
);
