# contest-judge

A programming judge built on top of [the cirrus judging API](https://github.com/chen-robert/cirrus). Built with the express framework on a postgreSQL database, rendered with [EJS](https://ejs.co/).

## Features

- Automatic problem data generation in one command
- Admin interface for editting users and configuration
- Easy, highly configurable problem writing
- Simple, one command deployment with docker

## Deployment

```bash
git clone https://github.com/chen-robert/contest-judge.git
cd contest-judge
docker-compose up
```

By default, the server runs on port 5000. You can change this up editting the `.env` file.

There are a few environmental variables that you should change to ensure security.

File | Default | Description
--- | --- | ---
POSTGRES_PASSWORD | secret_pw | The password used for the Postgres database that gets built in docker-compose
SECRET | cookie_secret | The secret key used to sign cookies. You should change this to something random
ADMIN_PASSWORD | admin_pw | A user named `admin` and password `$ADMIN_PASSWORD` if one does not already exist
PORT | 8101 | The port to run on

## Directory Structure

EJS template files can be found in `/views`.

Static files can be found in `/public`. Scripts are located in `/public/scripts` and styles in `/public/styles`.

Styles are written with [less](http://lesscss.org/) and compiled with [express middleware](https://github.com/emberfeather/less.js-middleware) at runtime.

Serverside scripts are located in `/server`, with the main file at `/index.js`.

**The configuration file is located at `/config.json`.**

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

### Problem Data Generation

`npm run pdata:gen` will generate the problem data for all problems that contain a `format.txt`.

You should also have a reference solution file, located at `solution/*.java`. 

#### format.txt

Comments begin with a `#`, and comment out everything on the line after it.

Each format file is divided into two parts, seperated by a line beginning with three dashes (`---`). The first part of the file is the configuration. The configuration consists of a key-value pair on each line, separated by a colon. Below lists valid configuration values.

Value | Description
--- | ---
count | Number of test cases to generate. Defaults to 1.

The rest of the file defines the format for the test data. 

#### Values

`{a:b}` is a value representing a random integer from a to b inclusive.

`[TYPE:args...]` declares an object with type TYPE.

##### Arrays

Format: `[ARR:COUNT,MIN,MAX]`

Sample: `[ARR:N,0,1e9]`

Note that arrays will be outputed as `N` space separated values on a single line. For example, `> F` could generate `1 2 3` if F is `[1, 2, 3]`.

#### Statements

`VAR X ${value}` declares a variable called X to some value. X can then be used later in both future variable declarations, as well as outputed.

`> ${value} ${value} ${value}...` will output all of the values onto a new line.

#### Examples

Generating and outputing an array of length `N`.

```
# Config
count: 15
---

# Variable declaration
VAR N {1:1e5}

VAR F [ARR:N,0,1e9]

# Input Format
> N
> F
```

## TODO

- Enable automatic problem data generation with any program
