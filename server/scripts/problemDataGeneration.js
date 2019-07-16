const readline = require("readline");
const fs = require("fs");

const __rootdir = "../../";
const config = require(__rootdir + "config");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = () =>
  rl.question("Override existing problem data? [y/N] ", answer => {
    if (/^(y|yes)$/i.test(answer)) {
      genProblemData(true);
    } else if (/^(n|no)$/i.test(answer)) {
      genProblemData(false);
    } else {
      prompt();
    }
  });

const genProblemData = override => {
  config.problemDirs.forEach(problemDir => {
    loadData(__rootdir + problemDir);
  });
  process.exit();
};

const loadData = problemsDir => {
  const problemsConfig = require(problemsDir + "/config.json");

  const excluded = problemsConfig.excluded || {};
  fs.readdirSync(problemsDir)
    .filter(file => fs.lstatSync(`${problemsDir}/${file}`).isDirectory)
    .filter(file => !excluded.includes(file))
    .filter(problem => {
      const formatExists = fs.existsSync(
        `${problemsDir}/${problem}/format.txt`
      );
      if (!formatExists) {
        console.log(
          `Skipping generation of [${problemsDir}/${problem}]: format.txt not found`
        );
      }
      return formatExists;
    });
};

prompt();
