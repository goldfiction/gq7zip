log=console.log
fix=require('fix-path')()
_7z=require '../app.js'
assert=require 'assert'
tests=require "gqtest"
fs=require 'fs'

_7zfile='./test/7ztest.7z'
_7zfile2='./test/compressed/7ztest2.7z'
_zipfile='./test/7ztest.zip'
_zipfile2='./test/compressed/7ztest2.zip'
_rarfile='./test/7ztest.rar'
_rarfile2='./test/compressed/7ztest2.rar'

outputDirectory='./test/output'
checkDirectory='./test/output/7ztest'
outputDirectoryZip='./test/outputzip'
checkDirectoryZip='./test/outputzip/7ztest'
outputDirectoryRar='./test/outputrar'
checkDirectoryRar='./test/outputrar/7ztest'
compressedFolder='./test/compressed'

checkHash="89b5c851ae8092be15177acee6b73f43e7de9c27cbb90f75c50fa12357a15b44"
#checkHash2="888dae7ee4aea95ae186cec35832dac8bed9060f8ec48f9803f16fd7986d8245"
checkHash2="76c2b1ead811a96396d11279608b6e2ccbfa3cb3bca3a2dadce36b1064b2cfa2"
password="1111"

category="should be able to "

after=()->
  await _7z.deleteFolder {folder:outputDirectory}
  await _7z.deleteFolder {folder:outputDirectoryZip}
  await _7z.deleteFolder {folder:outputDirectoryRar}
  await _7z.deleteFolder {folder:compressedFolder}
  return null

f1={}
f1.name=category+"run"
f1.test=(done)->
  done()

f2={}
f2.name=category+"extract 7ztest.7z"
f2.test=(done)->
  _7z.uncompress
    file:_7zfile
    password:password
    $progress:false
    outputDirectory:outputDirectory
  ,(e,r)->
    _7z.countFile {directory:checkDirectory},(e,num)->
      assert.equal num,4
      dfile=fs.readFileSync(checkDirectory+"/"+"d.txt").toString()
      assert.equal dfile,"d"
      done e

f3={}
f3.name=category+"compress folder"
f3.test=(done)->
  _7z.compress
    archive:_7zfile2
    folder:checkDirectory+"/*"
    password:password
    $progress:false
  ,(e,r)->
    _7z.hash _7zfile2,(e,hash)->
      #log hash
      assert.equal hash,checkHash
      done(e)

f4={}
f4.name=category+"extract 7ztest.zip"
f4.test=(done)->
  _7z.uncompress 
    file:_zipfile
    password:password
    $progress:false
    outputDirectory:outputDirectoryZip
  ,(e,r)->
    _7z.countFile {directory:checkDirectoryZip},(e,num)->
      assert.equal num,4
      dfile=fs.readFileSync(checkDirectoryZip+"/"+"d.txt").toString()
      assert.equal dfile,"d"
      done e

f5={}
f5.name=category+"compress folder to zip"
f5.test=(done)->
  _7z.compress 
    archive:_zipfile2
    folder:checkDirectoryZip+"/*"
    password:password
    $progress:false
  ,(e,r)->
    if e
      log e.stack
    # can not check for zip file hash as it is changing each time somehow, 
    # we use file exist and file size to check for success
    assert.equal fs.existsSync(_zipfile2),true
    fs.stat _zipfile2,(e,stat)->
      if e
        log e.stack
      #log stat
      assert.equal stat.size,514
      done(e)

f6={}
f6.name=category+"extract 7ztest.rar"
f6.test=(done)->
  _7z.uncompress
    file:_rarfile
    password:password
    $progress:false
    outputDirectory:outputDirectoryRar
  ,(e,r)->
    if e
      log e.stack
    _7z.countFile {directory:checkDirectoryRar},(e,num)->
      assert.equal num,4
      dfile=fs.readFileSync(checkDirectoryRar+"/"+"d.txt").toString()
      assert.equal dfile,"d"
      done e

f7={}
f7.name=category+"compress folder to rar"
# note: to be able to compress rar file, you need to "apt install rar". This module assume you have rar installed
# we can not supply rar as it is proprietary. As there is no exisiting module for compressing rar file in node npm
# repo, we had to use command line to execute rar compression manually
# please make sure rarfile is a single folder for compression to be successful. We have supplied it to be recursive.
f7.test=(done)->
  _7z.compress 
    archive:_rarfile2
    folder:checkDirectoryRar+"/*"
    password:password
    $progress:false
  ,(e,r)->
    if e
      log e.stack
    assert.equal fs.existsSync(_rarfile2),true
    fs.stat _rarfile2,(e,stat)->
      if e
        log e.stack
      #log stat
      assert.equal stat.size,686
      done(e)

doingtest=()->
  tests.add(f1.name,f1.test)
  tests.add(f2.name,f2.test)
  tests.add(f3.name,f3.test)
  tests.add(f4.name,f4.test)
  tests.add(f5.name,f5.test)
  tests.add(f6.name,f6.test)
  tests.add(f7.name,f7.test)
  tests.run null,(e,r)->
    tests.printResult(e,r)
    after()

doingtest()