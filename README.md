# gq7zip

A wrapper module for handling 7z compressed files.

## Description

This is a module to make 7zip function easy to use with node.js.

## Getting Started

### Dependencies

* require using node.js container node-18.20.8-slim
* require node.js 18.20.8
* dependencies include:
** "7zip-bin":"5.2.0"
** "node-7z":"3.0.0"
** "fix-path":"3.0.0"
* devDependencies include:
** "coffeescript":"2.0.0"
** "nodemon":"3.1.10"
** "gqtest":"^0.0.12"

** note: to be able to compress rar file, you need to "apt install rar". This module assume you have rar installed. we can not supply rar as it is proprietary. 
** As there is no exisiting module for compressing rar file in node npm repo, we had to use command line to execute rar compression with a childprocess call (it is still automatic by code). 
** please make sure rar file (o.folder) is a single folder. We have ensured it to be recursive.


### Installing

git clone git@github.com:goldfiction/gq7zip.git
npm run-script inst

### Executing program

to find usage, checkout /test/test.coffee

## Authors

[@glidev5](glidev5@gmail.com)


## License

This project is licensed under the Apache-2 License - see the LICENSE.md file for details

## Acknowledgments

