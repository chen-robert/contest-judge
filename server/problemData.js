const fs = require("fs");

const loadProblems = dir => {
  return {
    problemData: loadClientProblemData(dir),
    fullProblemData: loadFullProblemData(dir)
  };
};
const loadClientProblemData = dir => {
  const ret = [];
  const config = require(dir + "/config.json");
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
const loadFullProblemData = dir => {
  const ret = {};
  const config = require(dir + "/config.json");
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

const combine = (...problems) => {
  const problemData = [];
  const fullProblemData = {};

  problems.forEach(problemSet => {
    problemSet.problemData.forEach(problem => {
      problemData.push(problem);
    });
    Object.entries(problemSet.fullProblemData).forEach(([problemName, problem]) => {
      fullProblemData[problemName] = problem;
    });
  })

  return {problemData, fullProblemData};
}

module.exports = combine(loadProblems(__rootdir + "/problems"));
