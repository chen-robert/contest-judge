# contest-judge

A programming judge built on top of [camisole's judging API](https://github.com/prologin/camisole). Built with the express framework on a postgreSQL database, rendered with [EJS](https://ejs.co/).

## Features

- Automatic problem data generation in one command `npm run pdata:gen`
- Admin interface for editting users / configuration
- Easy, highly configurable problem writing

## Directory Structure

EJS template files can be found in `/views`.
Static files can be found in `/public`. Scripts are located in `/public/scripts` and styles in `/public/styles`.
Styles are written with [less](http://lesscss.org/) and compiled with [express middleware](https://github.com/emberfeather/less.js-middleware) at runtime.
Serverside scripts are located in `/server`, with the main file at `/index.js`.
The configuration file can be located at `/config.json`.

## Running

```bash
$ npm install
$ PORT=1234 npm start
```

## Development

```bash
$ npm run dev
```

will restart the server on changes.

## Problem Configuration

Problems are loaded through seperate directories, specified through the `problemDirs` of the root config. An example problem directory can be found in `problems/sample`. Note that the problem directories don't necessarily have to be under `problems`, though this may help with organization.

Each directory has its own config file, located in `config.json` under the root directory.

File | Description
--- | ---
statement.txt | The problem statement. Rendered with markdown and latex.
config.json | Additional configuration for the problem. Overrides values set in the default in the problem directory root.
format.txt | Optional. Specifies the format for automatic problem data generation.
data | The directory storing problem data. Input and output files should be labeled `${num}.in` and `${num}.out` respectively, with num starting from 0 and going up (non-negative integers).
data/generated | Auto-generated problem data.
solution | Any solution files for the problem.

## format.txt

Comments begin with a `#`, and comment out everything on the line after it.

Each format file is divided into two parts, seperated by a line beginning with three dashes (`---`). The first part of the file is the configuration. The configuration consists of a key-value pair on each line, separated by a colon. Below lists valid configuration values.

Value | Description
--- | ---
count | Number of test cases to generate. Defaults to 1.

The rest of the file defines the format for the test data. 

### Values

`{a:b}` is a value representing a random integer from a to b inclusive.

`[TYPE:args...]` declares an object with type TYPE.

### Statements

`VAR X ${value}` declares a variable called X to some value. X can then be used later in both future variable declarations, as well as outputed.

`> ${value} ${value} ${value}...` will output all of the values onto a new line.

