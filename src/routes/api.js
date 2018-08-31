var express = require('express');
var router = express.Router();
var fs        = require('fs');
//const upload_URL ='http://localhost:8080/api/upload-file';
var _filename='';
var formidable = require('formidable');
var path = require('path');
//const chatserver =require('../dist/chat-server');
//const io = require('../ChatServer');
//const sessionSchema = require('sessionSchema');
const schema = require("../dist/model/schema");
const Model = require("../dist/model/message");

const mongoose =require('mongoose').connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', function(err) {
  if (err) {
    //console.log(err);
  } else {
    console.log('connected to the mongodb!');
  }
})




const GCP = require('@google-cloud/storage');
const storage = new GCP();
const bucketName = 'learnspacemessenger';



router.post('/upload-file', function(req, res){
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    _filename = file.name;
    var strCopy = file.path.split('/');
    _filepath = strCopy[strCopy.length-1];

    fs.readFile(file.path, function (err, data) {
      if (err) throw err; // Something went wrong!

      let googlebucket = storage.bucket(bucketName).upload(file.path, (err, data) => {
});
  });
  });

  // log any errors that occur
  form.on('error', function(err) {
    //console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
res.json({ success : true, file_path: _filepath, file_name: _filename});
  });
  form.parse(req);

});


router.get('/download-file/:filename', function(req, res, next) {

  var filename = ''+req.params.filename;

  let googlebucket = storage.bucket(bucketName).file(filename).download({
  destination: filename
}, function(err) {});

});

router.post('/sessions/create', function(req, res, next) {

  //console.log(req.body[0]);
  Model.Session = req.body[0];
  //console.log(Model.Session);

  var session = new schema.sessionSchema(Model.Session);
session.save(function(err) {
  if (err) throw err;
});

/*
  Model.MessageSession = {
    sender_id: Model.Session.learner_user_id,
    receiver_id: Model.Session.tutor_user_id,
    tutor_user_id : Model.Session.tutor_user_id,
    learner_user_id: Model.Session.learner_user_id,
    session_date: Model.Session.session_date,
    session_subject:Model.Session.session_subject,
    session_location:Model.Session.session_location,
    learner_name:Model.Session.learner_name,
    tutor_name:Model.Session.tutor_name,
    tutor_read:false,
    learner_read:false
  }

  console.log(Model.MessageSession);




var msg = new schema.chatSchema(Model.MessageSession);
msg.save(function(err) {
if (err) throw err;
})*/
  /*
  io.use(function(socket, next) {
    next();
    console.log(socket);
  })*/

  res.json({ success : true});

  next();


});



module.exports =  router;



//module.exports = router;
