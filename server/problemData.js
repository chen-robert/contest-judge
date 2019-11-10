const fs = require("fs");
const config = require(__rootdir + "/config");
const request = require("request");

const cirrusEndpoint = process.env.CIRRUS_ENDPOINT;

const loadProblems = dir => {
  const config = require(dir + "/config.json");

  const { testData, problemData } = loadData(config, dir);
  return {
    testData,
    problemData
  };
};

const normalizeName = name => {
  const norm = name
    .replace(/ /g, "_")
    .replace(/\W/g, "")
    .toLowerCase();
  return norm.substring(Math.max(0, norm.length - 30), norm.length);
};

const loadDivisions = (config, problemName) => {
  if (!config.divisions) return null;

  const ret = [];
  for (const division of Object.keys(config.divisions)) {
    if (config.divisions[division].includes(problemName)) ret.push(division);
  }
  return ret;
};

const loadData = (config, dir) => {
  const problemData = [];
  const testData = {};

  const defaultConf = config.default;

  const excludedDirs = config.excluded || [];
  const problemDirs = (config.problems || fs.readdirSync(dir)).filter(
    problem => !excludedDirs.includes(problem)
  );

  for (const problem of problemDirs) {
    const problemDir = dir + "/" + problem;
    const testsuite = normalizeName(problem);

    if (!fs.lstatSync(problemDir).isDirectory()) {
      return;
    }

    // Load problemData
    const statement = fs.readFileSync(problemDir + "/statement.txt", "utf8");
    const problemConfig = Object.assign(
      {},
      defaultConf,
      fs.existsSync(problemDir + "/config.json")
        ? require(problemDir + "/config.json")
        : {},
      {
        division: loadDivisions(config, problem)
      }
    );
    const currProblemData = {
      name: problem,
      statement,
      config: problemConfig
    };
    problemData.push(currProblemData);

    // Load test cases
    let tests = [];

    const loadTestCases = dataBase => {
      let i = 0;
      while (fs.existsSync(`${dataBase}/${i}.in`)) {
        tests.push({
          name: `test_${tests.length}`,
          testsuite,
          stdin: `${dataBase}/${i}.in`,
          stdout: `${dataBase}/${i}.out`
        });
        i++;
      }
    };

    const upload = (name, testsuite, path) => {
      return new Promise((resolve, reject) => {
        // If endpoint not specified, don't try uploading
        if (!cirrusEndpoint) return resolve();

        request.post(
          {
            url: `${cirrusEndpoint}/upload`,
            formData: {
              name,
              testsuite,
              file: fs.createReadStream(path)
            }
          },
          (err, resp) => {
            if (err) return reject(err);
            if (resp.statusCode === 200) return resolve();
            return reject({ err: "404" });
          }
        );
      });
    };

    loadTestCases(`${problemDir}/data`);
    loadTestCases(`${problemDir}/data/generated`);

    if (tests.length === 0) {
      console.log(
        `0 test cases found for ${problemDir}. Attempting to load subtests`
      );

      tests = tests.splice(0, tests.length);

      const subtests = fs
        .readdirSync(`${problemDir}/data`)
        .filter(name => name !== "generated");

      let ret = [];
      for (const subtest of subtests) {
        loadTestCases(`${problemDir}/data/${subtest}`);

        const currTests = tests.splice(0, tests.length);
        currTests.forEach(test => {
          test.testsuite = testsuite + config.subtestSep + subtest;
          ret.push(test);
        });
      }
      tests = ret;
    }

    if (tests.length === 0)
      console.error(`ERROR: 0 test cases found for ${problemDir}`);

    (async function() {
      for (const test of tests) {
        await upload(test.name + ".in", test.testsuite, test.stdin);
        await upload(test.name + ".out", test.testsuite, test.stdout);
      }
    })();

    testData[problem] = normalizeName(problem);
  }

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
