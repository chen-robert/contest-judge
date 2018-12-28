# contest-judge

A minimalistic programming judge built on top of [camisole's judging API](https://github.com/prologin/camisole). 

## Directory Structure

HTML files can be found in `./dist`. 
Javascript and CSS are found in `./client`.
Serverside code is found in `/server`. 
Sample problems can be found in `/problems`. 

The files are compiled with webpack.

## Running
```
npm install
npm run build
npm start
```

## Development
`npm run build-dev` and `npm run dev-server` watch the directory for changes and will automatically update the instance. 
