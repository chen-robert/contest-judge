const fs = require("fs");
const config = require(__rootdir + "/config");
const request = require("request");

const cirrusEndpoint = process.env.CIRRUS_ENDPOINT;

const loadProblems = dir => {
  const config = require(dir + "/config.json");

  const { testData, problemData } = loadData(config, dir);
  return {
    testData,
    problemData,
    config
  };
};

const normalizeName = name => {
  const norm = name.replace(/ /g, "_").replace(/\W/g, "").toLowerCase();
  return norm.substring(Math.max(0, norm.length - 30), norm.length);
}

const loadData = (config, dir) => {
  const problemData = [];
  const testData = {};

  const defaultConf = config.default;

  const excludedDirs = config.excluded || [];
  const problemDirs = (config.problems || fs.readdirSync(dir))
    .filter(problem => !excludedDirs.includes(problem));

    
  for (const problem of problemDirs) {
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

    const loadTestCases = dataBase => {
      let i = 0;
      while (fs.existsSync(`${dataBase}/${i}.in`)) {
        tests.push({
          name: `test_${tests.length}`,
          stdin: `${dataBase}/${i}.in`,
          stdout: `${dataBase}/${i}.out`
        });
        i++;
      }
    };

    loadTestCases(`${problemDir}/data`);
    loadTestCases(`${problemDir}/data/generated`);

    if(tests.length === 0){
      console.error(`ERROR: 0 test cases found for ${problemDir}`);
    } else {
      const upload = (name, testsuite, path) => {
        return new Promise((resolve, reject) => {
          request.post({
            url: `${cirrusEndpoint}/upload`,
            formData: {
              name,
              testsuite,
              file: fs.createReadStream(path)
            }
          }, (err, resp) => {
            if(err) return reject(err);
            if(resp.statusCode === 200) return resolve();
            return reject({err: "404"});
          });
        });
      }

      (async function() {
        for(const test of tests) {
          const testsuite = normalizeName(problem);
          await upload(test.name + ".in", testsuite, test.stdin);
          await upload(test.name + ".out", testsuite, test.stdout);
        };
      })();
    }

    testData[problem] = normalizeName(problem);
  };

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

const values = config.problemDirs.map(dir => loadProblems(__rootdir + dir));
module.exports = combine(values);
