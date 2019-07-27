const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const { randInt } = require("./rng.js");

const __rootdir = path.resolve(__dirname, "../..");
const config = require(__rootdir + "/config");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let override;
const prompt = () =>
  rl.question("Override existing problem data? [y/N] ", answer => {
    if (/^(y|yes)$/i.test(answer)) {
      override = true;
      genProblemData();
    } else if (/^(n|no)$/i.test(answer)) {
      override = false;
      genProblemData();
    } else {
      prompt();
    }
  });

const genProblemData = () => {
  config.problemDirs.forEach(problemDir => {
    loadData(__rootdir + problemDir);
  });
  process.exit();
};

const loadData = problemsDir => {
  const problemsConfig = require(problemsDir + "/config.json");

  const excluded = problemsConfig.excluded || [];
  fs.readdirSync(problemsDir)
    .filter(file => fs.lstatSync(`${problemsDir}/${file}`).isDirectory())
    .filter(file => !excluded.includes(file))
    .filter(problem => {
      const formatExists = fs.existsSync(
        `${problemsDir}/${problem}/format.txt`
      );
      if (!formatExists) {
        console.log(`Skipping [${problem}]: No format.txt`);
      }
      return formatExists;
    })
    .forEach(problem => generateData(`${problemsDir}/${problem}`));
};

const prepare = problemDir => {
  if (override) {
    const dataDir = problemDir + "/data/generated";
    console.log(`Removing all data in ${dataDir}`);
    fs.readdirSync(dataDir).forEach(file => {
      fs.unlinkSync(`${dataDir}/${file}`);
    });
  }

  const javaFiles = fs
    .readdirSync(problemDir + "/solution")
    .filter(file => file.endsWith(".java"));

  if (javaFiles.length === 0) {
    console.log(`No .java files in ${problemDir}/solution, aborting`);
    return false;
  } else if (javaFiles.length > 1) {
    console.log(`Multiple .java files in ${problemDir}/solution, aborting`);
    return false;
  }
  execSync(`javac "${problemDir}/solution/${javaFiles[0]}"`);

  return `java -cp "${problemDir}/solution" ${javaFiles[0].split(".")[0]}`;
};

const generateData = problemDir => {
  if(!fs.existsSync(problemDir + "/data")) {
    fs.mkdirSync(problemDir + "/data");
  }
  if (!fs.existsSync(problemDir + "/data/generated")) {
    fs.mkdirSync(problemDir + "/data/generated");
  }

  const solveScript = prepare(problemDir);
  if (!solveScript) return;

  const problemName = path.basename(problemDir);

  const lines = fs
    .readFileSync(`${problemDir}/format.txt`)
    .toString("utf-8")
    .split("\n")
    .map(line => line.split("#")[0]);

  var i = 0;
  const config = {};
  while (!lines[i].startsWith("---")) {
    const parts = lines[i].split(":");
    // If in format "name: value"
    if (parts.length === 2) {
      const name = parts[0].trim().toLowerCase();
      const value = parts[1].trim();

      config[name] = value;
    }
    i++;
  }

  let cases = config.count || 1;

  // Hard limit at 100 cases
  cases = Math.min(cases, 100);
  if (isNaN(cases)) cases = 1;

  console.log(`Generating ${cases} testcases for [${problemName}]`);

  const startingIndex = i;
  for (let caseNum = 0; caseNum < cases; caseNum++) {
    i = startingIndex;

    const vars = {};

    const getValue = str => {
      if (Object.keys(vars).includes(str)) return vars[str];

      if (str.startsWith("{") && str.endsWith("}")) {
        const parts = str.substring(1, str.length - 1).split(":");

        const min = getValue(parts[0]);
        const max = getValue(parts[1]);

        return randInt(min, max);
      } else if(str.startsWith("[") && str.endsWith("]")){
        str = str.substring(1, str.length - 1);

        const type = str.split(":")[0];
        const args = str.split(":")[1].split(",");

        switch(type){
          case "STR":
            const length = getValue(args[0]);
            let ret = "";
            for(let i = 0; i < length; i++){
              ret += String.fromCharCode("a".charCodeAt(0) + randInt(0, 26 - 1));
            }
            return ret;
            break;
        }


      }else{
        if (str.includes("+")) {
          const parts = str.split(/\+/);
          return parts.map(getValue).reduce((a, b) => a + b);
        } else if (str.includes("-")) {
          if (str.startsWith("-")) str = "0" + str;

          const parts = str.split(/-/);
          return (
            getValue(parts[0]) -
            parts
              .slice(1)
              .map(getValue)
              .reduce((a, b) => a + b)
          );
        } else {
          return Number.parseFloat(str);
        }
      }
    };

    const END_BLOCK = {};
    const genOutput = () => {
      i++;
      if (i >= lines.length) return "";

      const currLine = lines[i];

      const parts = currLine.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      switch (cmd) {
        case "var":
          const name = parts[1];
          const value = parts[2];

          vars[name] = getValue(value);

          return "";
        // Print out
        case ">":
          return (
            parts
              .slice(1)
              .filter(str => str !== "")
              .map(getValue)
              .join(" ") + "\n"
          );
        case "end":
          return END_BLOCK;
        case "times":
          let ret = "";

          const reps = getValue(parts[1]);
          const oriIndex = i;

          for (var j = 0; j < reps; j++) {
            i = oriIndex;

            let res = "";
            let part = "";
            do {
              res += part;

              const tmp = genOutput();
              part = tmp;
            } while (part !== END_BLOCK);
            ret += res;
          }
          return ret;

        case "if":
          let condition = parts.slice(1).join("");

          let negate = false;
          if (condition.startsWith("!")) {
            condition = condition.substring(1);
            negate = true;
          }

          let truthiness;
          if (condition.includes(">")) {
            const parts = condition.split(">");
            truthiness = getValue(parts[0]) > getValue(parts[1]);
          } else if (condition.includes("==")) {
            const parts = condition.split("==");
            truthiness = getValue(parts[0]) == getValue(parts[1]);
          } else if (condition.includes("<")) {
            const parts = condition.split("<");
            truthiness = getValue(parts[0]) < getValue(parts[1]);
          } else {
            console.log("Invalid condition: " + condition);
            process.exit();
          }

          if (negate) truthiness = !truthiness;

          let res = "";
          let part = "";
          do {
            res += part;

            part = genOutput();
          } while (part !== END_BLOCK);
          return truthiness ? res : "";

        default:
          return "";
      }
    };

    let inputStr = "";
    while (i != lines.length) {
      inputStr += genOutput();
    }

    const dataBase = `${problemDir}/data/generated/${caseNum}`;
    const inputFile = dataBase + ".in";
    const outputFile = dataBase + ".out";

    if (override || !(fs.existsSync(inputFile) && fs.existsSync(outputFile))) {
      fs.writeFileSync(inputFile, inputStr);
      fs.writeFileSync(outputFile, "");

      execSync(`${solveScript} < "${inputFile}" > "${outputFile}"`);
    }
  }
};

prompt();
