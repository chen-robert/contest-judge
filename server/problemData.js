const fs = require("fs");

module.exports = {
  loadProblems: dir => {
    const ret = [];
    fs.readdirSync(dir).forEach(file => {
      const problemDir = dir + "/" + file;
      
      const statement = fs.readFileSync(problemDir + "/statement.txt", "utf8");
      const sampleIn = fs.readFileSync(problemDir + "/0.in", "utf8");
      const sampleOut = fs.readFileSync(problemDir + "/0.out", "utf8");
      const problemData = {
        name: file,
        statement,
        sampleIn,
        sampleOut        
      }
      ret.push(problemData);
    });
    return ret;
  }
}
