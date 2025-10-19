var log=console.log
var fix=require('fix-path')()
var sevenBin = require('7zip-bin')
var pathTo7zip=sevenBin.path7za
var pathToP7zip="/usr/bin/p7zip"
var _7=require('node-7z')
var fs=require('fs')
var crypto=require('crypto')
//_7zfile='./test/7ztest.7z'
//outputDirectory='./test/output'
//checkDirectory='./test/output/7ztest'

countFile=function(o,cb){
  fs.readdir(o.directory,function(e,files){
    if(e)
      cb(e)
    else
      cb(null,files.length)
  })
}

uncompress=function(o,cb){
  option=o||{}
  option["$bin"]=pathTo7zip
  //option["$progress"]=true
  var myStream=_7.extractFull(option.file,option.outputDirectory||"./output",option)
  myStream.on('data',function(data){
    //#? { status: 'extracted', file: 'extracted/file.txt" }
    log(data)
  })
  myStream.on('progress',function(progress){
    //#? { percent: 67, fileCount: 5, file: undefinded }
    log(progress)
  })
  myStream.on('end',cb)
  myStream.on('error',cb)
}

compress=function(o,cb){
    //log(o)
    option={}
    option["$bin"]=pathTo7zip
    option.method=['0=BCJ','1=LZMA:d=21']
    option.recursive=true
    option["$progress"]=o.progress
    //log(pathTo7zip)
    //log(option)
    var myStream=_7.add(o.archive,o.folder,option)
    myStream.on('data',function(data){
      //#? { status: 'extracted', file: 'extracted/file.txt" }
      //#log(data)
    })
    myStream.on('progress',function(progress){
      //#? { percent: 67, fileCount: 5, file: undefinded }
      log(progress)
    })
    myStream.on('end',cb)
    myStream.on('error',cb)
  }

deleteFolder=function(o,cb){
  if(!!!o.folder)
    cb("no folder specified")
  else
    fs.rm(o.folder,{recursive:true,force:true},cb)
}

hash=function(o,cb){
    option={}
    option["$bin"]=pathTo7zip
    option.hashMethod='sha256'
    var myStream=_7.hash(o.file,option)
    myStream.on('end',cb)
    myStream.on('error',cb)
    //cb(null,myStream)
}

function calculateFileHash(filePath, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);
  
      stream.on('data', (data) => {
        hash.update(data);
      });
  
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
  
      stream.on('error', (err) => {
        reject(err);
      });
    });
}

exports.countFile=countFile
exports.compress=compress
exports.uncompress=uncompress
exports.deleteFolder=deleteFolder
exports.hash=calculateFileHash
exports._7=_7
