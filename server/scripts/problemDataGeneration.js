const readline = require("readline");
const fs = require("fs");
const path = require("path");
const {randInt} = require("./rng.js");

const __rootdir = path.resolve(__dirname, "../..");
const config = require(__rootdir + "/config");

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

  const excluded = problemsConfig.excluded || [];
  fs.readdirSync(problemsDir)
    .filter(file => fs.lstatSync(`${problemsDir}/${file}`).isDirectory())
    .filter(file => !excluded.includes(file))
    .filter(problem => {
      const formatExists = fs.existsSync(
        `${problemsDir}/${problem}/format.txt`
      );
      if (!formatExists) {
        console.log(
          `Skipping [${problem}]: No format.txt`
        );
      }
      return formatExists;
    })
    .forEach(problem => generateData(`${problemsDir}/${problem}`))
};

const generateData = problemDir => {
  const problemName = path.basename(problemDir);

  const lines = fs.readFileSync(`${problemDir}/format.txt`)
    .toString("utf-8")
    .split("\n")
    .map(line => line.split("#")[0]);

  var i = 0;
  const config = {};
  while(!lines[i].startsWith("---")) {
    const parts = lines[i].split(":");
    // If in format "name: value"
    if(parts.length === 2){
      const name = parts[0].trim().toLowerCase();
      const value = parts[1].trim();

      config[name] = value;
    }
    i++;
  }

  let cases = config.count || 1;

  // Hard limit at 100 cases
  cases = Math.min(cases, 100);
  if(isNaN(cases)) cases = 1;

  console.log(`Generating ${cases} testcases for [${problemName}]`);

  const startingIndex = i;
  for(let caseNum = 0; caseNum < cases; caseNum++){
    i = startingIndex;
    
    const vars = {};

    const getValue = str => {
      if(Object.keys(vars).includes(str))return vars[str];

      if(str.startsWith("{") && str.endsWith("}")) {
        const parts = str.substring(1, str.length - 1).split(":");
        
        const min = getValue(parts[0]);
        const max = getValue(parts[1]);

        return randInt(min, max);
      }else{
        if(str.includes("+")){
          const parts = str.split(/\+/);
          return parts
            .map(getValue)
            .reduce((a, b) => a + b);
        }else if(str.includes("-")){
          if(str.startsWith("-")) str = "0" + str;

          const parts = str.split(/-/);
          return getValue(parts[0]) - 
            parts.slice(1)
              .map(getValue)
              .reduce((a, b) => a + b);

        }else{
          return Number.parseFloat(str);
        }
      }
    }

    const END_BLOCK = {};
    const genOutput = () => {
      i++;
      if(i >= lines.length) return "";

      const currLine = lines[i];

      const parts = currLine.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      switch(cmd){
        case "var":
          const name = parts[1];
          const value = parts[2];

          vars[name] = getValue(value);

          return "";
        // Print out
        case ">":
          return parts
            .slice(1)
            .filter(str => str !== "")
            .map(getValue)
            .join(" ") + "\n";
        case "end":
          return END_BLOCK;
        case "times":
          let ret = "";

          const reps = getValue(parts[1]);
          const oriIndex = [i];
          for(var j = 0; j < reps; j++){
            i = oriIndex;

            res = "";
            part = "";
            do{
              res += part;

              part = genOutput();
            } while(part !== END_BLOCK);
            ret += res;
          }
          return ret;
        case "if":
          let condition = parts.slice(1).join("");
          let negate = false;
          if(condition.startsWith("!")){
            condition = condition.substring(1);
            negate = true;
          }

          let truthiness;
          if(condition.includes(">")){
            const parts = condition.split(">");
            truthiness = getValue(parts[0]) > getValue(parts[1]);
          }else if(condition.includes("==")){
            const parts = condition.split("==");
            truthiness = getValue(parts[0]) == getValue(parts[1]);
          } else if(condition.includes("<")) {
            const parts = condition.split("<");
            truthiness = getValue(parts[0]) < getValue(parts[1]);
          }

          if(negate) truthiness = !truthiness;

          res = "";
          part = "";
          do{
            res += part;

            part = genOutput();
          } while(part !== END_BLOCK);
          return truthiness ? res: "";
        default:
          return "";
      }
    }

    let inputStr = "";
    while(i != lines.length) {
      inputStr += genOutput();
    }
  }
}

prompt();
