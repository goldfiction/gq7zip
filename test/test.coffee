log=console.log
fix=require('fix-path')()
_7z=require '../app.js'
assert=require 'assert'
tests=require "gqtest"
fs=require 'fs'
_7zfile='./test/7ztest.7z'
_7zfile2='./test/7ztest2.7z'
outputDirectory='./test/output'
checkDirectory='./test/output/7ztest'
checkHash="89b5c851ae8092be15177acee6b73f43e7de9c27cbb90f75c50fa12357a15b44"

category="should be able to "

after=(done)->
  _7z.deleteFolder {folder:outputDirectory},(e,r)->
    if done
      done e

f1={}
f1.name=category+"run"
f1.test=(done)->
  done()

f2={}
f2.name=category+"extract 7ztest.7z"
f2.test=(done)->
  _7z.uncompress {file:_7zfile,password:"1111",$progress:false,outputDirectory:outputDirectory},(e,r)->
    _7z.countFile {directory:checkDirectory},(e,num)->
      assert.equal num,4
      done e

f3={}
f3.name=category+"read d.txt"
f3.test=(done)->
  dfile=fs.readFileSync(checkDirectory+"/"+"d.txt").toString()
  assert.equal dfile,"d"
  done()

f4={}
f4.name=category+"compress folder"
f4.test=(done)->
  _7z.compress {archive:_7zfile2,folder:checkDirectory+"/*",password:"1111",$progress:false},(e,r)->
    _7z.hash _7zfile2,(e,hash)->
      assert.equal hash,checkHash
      done(e)

doingtest=()->
  tests.add(f1.name,f1.test)
  tests.add(f2.name,f2.test)
  tests.add(f3.name,f3.test)
  tests.add(f4.name,f4.test)
  tests.run null,(e,r)->
    tests.printResult(e,r)
    #after()

doingtest()