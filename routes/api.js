var express = require('express');
var router = express.Router();
var fs        = require('fs');
//const upload_URL ='http://localhost:8080/api/upload-file';
var _filename='';
var formidable = require('formidable');
var path = require('path');
const AWS = require('aws-sdk');

const BUCKET_NAME = 'messager-file-storage';
const IAM_USER_KEY = 'AKIAJ7XAHZ2UV7PMGGGA';
const IAM_USER_SECRET = '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';

/*
router.post('/upload-file', function(req, res, next) {
  //console.log("post",req.busboy);
  //console.log("res",res)
  var fstream;

  if (req.method === 'POST') {
   //在这里做一个头部数据检查
 if(!/multipart\/form-data/i.test(req.headers['content-type'])){
   return res.end('wrong');
 }
  //if (req.busboy) {

    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      _filename=filename;

      fstream = fs.createWriteStream(__dirname + '/../public/my-files/' + filename);
      file.pipe(fstream);

      fstream.on('close', function(){
        console.log('file ' + filename + ' uploaded');
      });
      //return _filename;
    });

    req.busboy.on('finish', function(){
      console.log('finish, files uploaded ');
      console.log("name",_filename);
      res.json({ success : true, file_path:  __dirname + '/../public/my-files/' + _filename, file_name: _filename});
    });
    req.pipe(req.busboy);
  }
});*/

router.post('/upload-file', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();
  //console.log(req);


  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
  //console.log("1");
  //console.log(__dirname);

  // store all uploads in the /uploads directory
  //form.uploadDir = path.join(__dirname, '/../public/my-files/');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    _filename = file.name;

    //console.log("file_path", file.path);
    //console.log(file);
    //fs.rename(file.path, path.join(form.uploadDir, file.name));
    fs.readFile(file.path, function (err, data) {
      if (err) throw err; // Something went wrong!



    let s3bucket = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  Bucket: BUCKET_NAME
});
s3bucket.createBucket(function () {
    var params = {
      Bucket: BUCKET_NAME,
      Key: file.name,
      Body: data
    };
    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.log('error in callback');
        console.log(err);
      }
      console.log('success');
      console.log(data);
    });
});
  });
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    //console.log(file);

    //res.end({ success : true, file_path:  __dirname + '/../public/my-files/' + _filename, file_name: _filename});
    res.json({ success : true, file_path:  __dirname + '/../public/my-files/' + _filename, file_name: _filename});





  });

  // parse the incoming request containing the form data
  form.parse(req);

});


router.get('/download-file/:filename', function(req, res, next) {
  //console.log("post",req.busboy);
  //console.log("res",res)
  console.log(req.params.filename);
  var filename = ''+req.params.filename;

  //var file = __dirname + '/../public/my-files/' + req.params.filename;
  //console.log(file);
  //res.download(file);

  let s3bucket = new AWS.S3({
accessKeyId: IAM_USER_KEY,
secretAccessKey: IAM_USER_SECRET,
Bucket: BUCKET_NAME
});
s3bucket.createBucket(function () {
  var params = {
    Bucket: BUCKET_NAME,
    Key: filename
    };
  s3bucket.getObject(params, function (err, data) {
    if (err) {
      console.log('error in callback');
      console.log(err);
    }
    console.log('success');
    console.log(data);
    //res.setHeader('Content-disposition','attachment; filename='+filename);
    //res.setHeader('Content-length',data.ContentLength);
    //res.send(data.body);
    res.attachment(filename); // or whatever your logic needs
       res.send(data.Body);
  });
});
});


module.exports = router;
