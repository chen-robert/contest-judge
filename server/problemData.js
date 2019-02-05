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
    fs.readdirSync(dir).forEach(file => {
      const problemDir = dir + "/" + file;
      
      if(!fs.lstatSync(problemDir).isDirectory()) return;

      const statement = fs.readFileSync(problemDir + "/statement.txt", "utf8");
      const config = Object.assign({}, defaultConf, fs.existsSync(problemDir + "/config.json")? require(problemDir + "/config.json"): {});
      const sampleIn = fs.readFileSync(problemDir + "/0.in", "utf8");
      const sampleOut = fs.readFileSync(problemDir + "/0.out", "utf8");
      const problemData = {
        name: file,
        statement,
        sampleIn,
        sampleOut,
        config
      };
      ret.push(problemData);
    });
    return ret;
  },
  loadFullProblemData: dir => {
    const ret = {};
    fs.readdirSync(dir).forEach(file => {
      const problemDir = dir + "/" + file;
      
      if(!fs.lstatSync(problemDir).isDirectory()) return;

      const tests = [];
      let i = 0;
      while (fs.existsSync(`${problemDir}/${i}.in`)) {
        tests.push({
          name: `test_${i}`,
          stdin: fs.readFileSync(`${problemDir}/${i}.in`).toString(),
          stdout: fs.readFileSync(`${problemDir}/${i}.out`).toString()
        });

        i++;
      }

      ret[file] = tests;
    });
    return ret;
  }
};
