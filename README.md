# contest-judge

A minimalisic programming judge built on top of [camisole's judging API](https://github.com/prologin/camisole).  An express application built on a postgreSQL database, rendered with [EJS](https://ejs.co/).

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

Each directory has its own config file.
