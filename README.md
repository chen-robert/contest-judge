# contest-judge

A minimalistic programming judge built on top of [camisole's judging API](https://github.com/prologin/camisole).  An express application built on a postgreSQL database, rendered with [EJS](https://ejs.co/).

## Directory Structure

EJS template files can be found in `/views`.
Static files can be found in `/public`. Scripts are located in `/public/scripts` and styles in `/public/styles`.
Styles are written with [less](http://lesscss.org/) and compiled with [express middleware](https://github.com/emberfeather/less.js-middleware) at runtime.
Serverside scripts are located in `/server`, with the main file at `/index.js`.
The configuration file can be located at `/config.json`.

## Running

```bash
$ npm install
$ export PORT=1234
$ npm start
```

## Development

```bash
$ npm run dev
```
will restart the server on changes. 
