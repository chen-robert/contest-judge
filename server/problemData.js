const fs = require("fs");

module.exports = {
  loadProblems: function(dir) {
    return {
      problemData: this.loadClientProblemData(dir),
      fullProblemData: this.loadFullProblemData(dir)
    };
  },
  loadClientProblemData: dir => {
    const ret = [];
    const defaultConf = require(dir + "/default.json");
    const config = require(dir + "/config.json");
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
  },
  loadFullProblemData: dir => {
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
  }
};
