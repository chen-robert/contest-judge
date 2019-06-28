const fs = require("fs");
const config = require(__rootdir + "/config");

const loadProblems = dir => {
  const config = require(dir + "/config.json");
  return {
    problemData: loadClientProblemData(config, dir),
    testData: loadTestData(config, dir),
    config
  };
};

const loadClientProblemData = (config, dir) => {
  const ret = [];
  const defaultConf = config.default;
  
  config.problems.forEach(problem => {
    const problemDir = dir + "/" + problem;

    if (!fs.lstatSync(problemDir).isDirectory()) return;

    const statement = fs.readFileSync(problemDir + "/statement.txt", "utf8");
    const config = Object.assign(
      {},
      defaultConf,
      fs.existsSync(problemDir + "/config.json")
        ? require(problemDir + "/config.json")
        : {}
    );
    const problemData = {
      name: problem,
      statement,
      config
    };
    ret.push(problemData);
  });
  return ret;
};
const loadTestData = (config, dir) => {
  const ret = {};
  config.problems.forEach(problem => {
    const problemDir = dir + "/" + problem;

    if (!fs.lstatSync(problemDir).isDirectory()) return;

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

    ret[problem] = tests;
  });
  return ret;
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
  })

  return {problemData, testData};
}


module.exports = combine(config.problemDirs.map(dir => loadProblems(__rootdir + dir)));
