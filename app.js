var log=console.log
var fix=require('fix-path')()
var sevenBin = require('7zip-bin')
var pathTo7zip=sevenBin.path7za
var pathToP7zip="/usr/bin/p7zip"
var _7=require('node-7z')
var fs=require('fs')
var crypto=require('crypto')
//var Rar=require('super-winrar')
var unrar=require("node-unrar-js")
var exec=require('child_process').exec


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
  option["$progress"]=o["$progress"]

  if(option.file.toLowerCase().includes(".7z")||option.file.toLowerCase().includes(".zip")){
    
    var myStream=_7.extractFull(option.file,option.outputDirectory||"./output",option)
    
    myStream.on('data',function(data){
      // { status: 'extracted', file: 'extracted/file.txt" }
      // log(data)
    })
    
    myStream.on('progress',function(progress){
      // { percent: 67, fileCount: 5, file: undefinded }
      if(o['$progress'])
        log(progress)
    })
    
    myStream.on('end',cb)
    
    myStream.on('error',cb)
  } else if(option.file.toLowerCase().includes(".rar")){
    uncompressRar3(o,cb)
  }
}

compress=function(o,cb){
    option={}
    option["$bin"]=pathTo7zip
    if(o.archive.toLowerCase().includes(".7z"))
      option.method=['0=BCJ','1=LZMA:d=21']
    option.recursive=true
    option["$progress"]=o.progress

    if(o.archive.toLowerCase().includes(".7z")||o.archive.toLowerCase().includes(".zip")){
      var myStream=_7.add(o.archive,o.folder,option)
    
      myStream.on('data',function(data){
        // { status: 'extracted', file: 'extracted/file.txt" }
        // log(data)
      })
      
      myStream.on('progress',function(progress){
        // { percent: 67, fileCount: 5, file: undefinded }
        if(o['$progress'])
          log(progress)
      })
      
      myStream.on('end',cb)
      
      myStream.on('error',cb) 
    } else if (o.archive.toLowerCase().includes(".rar")){
      compressRar2(o,cb)
    }
}

deleteFolder=function(o,cb){
  if(!!!o.folder)
    cb("no folder specified")
  else
    fs.rm(o.folder,{recursive:true,force:true},function(e,r){
      if(cb)
        cb(e,r)
    })
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

function hash(file,cb){
    calculateFileHash(file).then(function(hash){
        cb(null,hash)
    }).catch(function(e){
        cb(e)
    })
}

/*
function compressRar1(o,cb){

  var rar = new Rar(o.archive);

  rar.on('error',cb);

  rar.once('ready',function(){
    if(o.$password){
      rar.setPassword(o.$password,function(correct){
        if(correct){
          rar.append(o.folder,cb);
        } else{
          cb("password incorrect");
        }
      }); 
    } else{
      rar.append(o.folder,cb);
    }
  });
}
*/

function uncompressRar(o,cb){
  var rar = new Rar(o.file);

  rar.on('error',function(e){
    return cb(e)
  });

  rar.once('password',function(){
	  console.log('Rar requested password!');
	  rar.setPassword(o.$password,function(correct){
      if (!correct) {
        log('wrong password!');
        return cb('wrong password!');
      }else{
        log('password match!');
      }
    })
  });

  rar.once('ready',function(){
	  rar.list(cb);
  });

  rar.extract({path:o.outputDirectory,files:['*']},function(e){
    if(e)
      return cb(e)
  })

  // Read file contents insided rar as Buffer With ReadableStream (good for avoiding memory leaks with large files)
  rar.getFileBufferStream('*',function(e,bufferStream){
    if(e){
      return cb(e);
    }
	  buffer = new Buffer.from([]);
    bufferStream.on('data',function(data){
    	buffer = new Buffer.concat([buffer, data]);
    });
    bufferStream.on('error',function(e){
      return cb(e);
    });
    bufferStream.once('end',function(){
      log('buffer size', buffer.length); //271
    });
  });
}

function uncompressRar2(o,cb){
  log(o)
  try{
    var buf=Uint8Array.from(fs.readFileSync(o.file)).buffer;
    unrar.createExtractorFromData({data:buf},function(extractor){
      try{
        list = extractor.getFileList();
        listArcHeader = list.arcHeader; // archive header
        fileHeaders = [...list.fileHeaders]; // load the file headers
      
        extracted = extractor.extract({files:["*"]});
        // extracted.arcHeader  : archive header
        files = [...extracted.files]; //load the files
        for(i of files){
          i.fileHeader; // file header
          i.extraction; // Uint8Array content, createExtractorFromData only
        }  
        cb()    
      }catch(e){cb(e)}
    });
  }catch(e){
    cb(e)
  }
}

async function uncompressRar3(o,cb){
  try {
    // Ensure the destination directory exists (optional, but good practice)
    // You might need 'fs' module for this: const fs = require('fs'); fs.mkdirSync(destinationPath, { recursive: true });

    if(o.logging)
      log(o)
    extractor=await unrar.createExtractorFromFile({
        filepath: o.file,
        targetPath: o.outputDirectory,
        password: o.password // Optional: provide password if the RAR is protected
    })

    //log("extracted files")
    // Extract the files
    extractedFiles = [...extractor.extract().files];

    if(o.logging)
      log(`Successfully extracted ${extractedFiles.length} files to ${o.outputDirectory}`);
    // extractedFiles contains an array of objects with information about the extracted files
    // Example: [{ filepath: 'file1.txt', size: 1234, ... }, ...]
    return cb(null,extractedFiles)

  }catch(e) {
    //log('Error during RAR extraction:', e);
    return cb(e);
  }
}

function compressRar2(o,cb){
  filesToCompress = [o.folder];
  pwcmd=""
  if(o.password)
    pwcmd="-hp"+o.password
  o.rarCommand="rar a -r "+pwcmd+" "+o.archive+" "+o.folder
  exec(o.rarCommand,function(error, stdout, stderr){
    if (error){
        return cb(error,o);
    }
    if (stderr){
        return cb(stderr,o);
    }
    //console.log(`RAR stdout: ${stdout}`);
    //console.log(`Successfully created RAR archive: ${outputRarFile}`);
    return cb(null,o);
  });
}

exports.countFile=countFile
exports.compress=compress
exports.uncompress=uncompress
exports.deleteFolder=deleteFolder
exports.hash=hash
exports._7=_7
