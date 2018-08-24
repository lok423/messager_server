"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('rootpath')();
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
//import {schema} from'./model';
var schema_1 = require("./model/schema");
var config = require('config.json');
var http = require('http');
var ChatServer = /** @class */ (function () {
    //private api = require('./server/routes/api');
    //private chat =require('./model/schema');
    function ChatServer() {
        this.cors = require('cors');
        this.bodyParser = require('body-parser');
        this.expressJwt = require('express-jwt');
        this.authconfig = require('config.json');
        this.jwt = require('jsonwebtoken');
        this.passport = require('passport');
        this.createApp();
        this.config();
        this.createServer();
        this.createMongodb();
        this.sockets();
        this.listen();
        this.users = [];
    }
    /*
        private chatSchema(){
          var chatSchema = this.mongoose.Schema({
            created: {type:Date, default:Date.now()}
          });
        }
        */
    ChatServer.prototype.createMongodb = function () {
        this.mongoose = require('mongoose');
        this.mongoose.connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('connected to the mongodb!');
            }
        });
    };
    ChatServer.prototype.createApp = function () {
        this.app = express();
        this.api = require('../routes/api');
        //this.busboy = require('connect-busboy');
        this.formidable = require('formidable');
    };
    ChatServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    ChatServer.prototype.config = function () {
        this.port = process.env.PORT || ChatServer.PORT;
        this.app.set('port', this.port);
        //this.app.use(this.busboy({ immediate: true }));
        //this.app.use(this.formidable);
        this.app.use(this.cors());
        this.app.use(this.bodyParser.urlencoded({ extended: false }));
        this.app.use(this.bodyParser.json());
        /*
        this.app.use(this.passport.initialize());
    this.app.use(this.passport.session());*/
        this.app.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');
            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            /*
                var token = req.body.token || req.query.token || req.headers['x-access-token']
              if (token) {
                jwt.verify(token, app.get('secret'), function (err, decoded) {
                  if (err) {
                    return res.json({success: false, message: 'Failed to authenticate token.'})
                  } else {
                    req.decoded = decoded
                    next()
                  }
                })
              } else {
                return res.status(403).send({
                  success: false,
                  message: 'No token provided.'
                })
              }*/
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            //res.setHeader('Access-Control-Allow-Credentials', 'false');
            // Pass to next layer of middleware
            next();
        });
        this.app.use('/api', this.api);
        this.app.use(this.expressJwt({
            secret: this.authconfig.secret,
            getToken: function (req) {
                //console.log(req);
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    return req.headers.authorization.split(' ')[1];
                }
                else if (req.query && req.query.token) {
                    return req.query.token;
                }
                return null;
            }
        }).unless({ path: ['/users/authenticate', '/users/register'] }));
        // routes
        this.app.use('/users', require('../controllers/users.controller'));
        // error handler
        this.app.use(function (err, req, res, next) {
            console.log(err);
            if (err.name === 'UnauthorizedError') {
                res.status(401).send('Invalid Token');
            }
            else {
                throw err;
            }
        });
        http.get('http://proprius.co.nz/api/public/api/adminusers', function (res) {
            var data = '';
            res.setEncoding('utf8');
            //console.log("get http", res);
            // A chunk of data has been recieved.
            res.on('data', function (chunk) {
                data += chunk;
                //console.log(data);
            });
            // The whole response has been received. Print out the result.
            res.on('end', function () {
                //console.log(JSON.parse(data));
                var users = JSON.parse(data);
                console.log(users.length);
                for (var i = 0; i < users.length; i++) {
                    //console.log(users[i]);
                    var new_user = new schema_1.userSchema(users[i]);
                    //console.log(new_user);
                    new_user.save(function (err) {
                        if (err)
                            throw err;
                    });
                }
            });
        }).on("error", function (err) {
            console.log("Error: " + err.message);
        });
    };
    ChatServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    ChatServer.prototype.listen = function () {
        var _this = this;
        var jwt = require('jsonwebtoken');
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.use(function (socket, next) {
            /*
            console.log(socket.handshake.query);
            if (socket.handshake.query && socket.handshake.query.token) {
              console.log("verify");
              jwt.verify(socket.handshake.query.token, config.secret, function(err, decoded) {
                console.log(err);
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
      
                next();
              });
            } else {
              next(new Error('Authentication error'));
            }*/
            next();
        })
            .on('connect', function (socket) {
            console.log('Connected client on port %s.', _this.port);
            socket.on('user', function (user) {
                console.log("on user", user);
                /*
                var query = chatSchema.find({ $or: [{ sender_id: user.user_id }, { receiver_id: user.user_id }] });
                query.sort({ createdAt: 1 }).exec(function(err, allMessages) {
                  if (err) throw err;
                  else {
                    //console.log("allMessages",allMessages);
                    socket.emit('old msgs', allMessages);
                  }
                });*/
                console.log("socketid: ", socket.id);
                console.log('User Joined: %s', JSON.stringify(user.user_id));
                var sameUserIds = [];
                var found = _this.users.some(function (finduser) {
                    console.log("for each user", user);
                    if (finduser.user_id === user.user_id) {
                        console.log("find same user", finduser.channelid);
                        //user.channelids.push(socket.id);
                        //sameUserIds.push(user.channelid);
                        finduser.channelid.push(socket.id);
                        return finduser.channelid;
                    }
                });
                console.log("found same user, which id", sameUserIds);
                if (found) {
                    //sameUserIds.push(socket.id);
                    console.log(_this.users);
                    console.log("same user join");
                }
                else {
                    _this.users.push({
                        channelid: [socket.id],
                        user_id: user.user_id,
                    });
                    console.log(_this.users);
                }
                var len = _this.users.length;
                len--;
                _this.io.emit('userList', _this.users, socket.id);
            });
            socket.on('getMsg', function (data) {
                /*
                if(!data.toid){
                  data.read=false;
                }else{
                  data.read =true;
                }*/
                data.read = false;
                console.log(data);
                var newMsg = new schema_1.chatSchema(data);
                console.log(newMsg);
                newMsg.save(function (err) {
                    if (err)
                        throw err;
                });
                console.log("saved message:", data);
                if (data.toid) {
                    for (var i = 0; i < data.toid.length; i++) {
                        socket.broadcast.to(data.toid[i]).emit('sendMsg', {
                            msg: data.msg,
                            sender_id: data.sender_id,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            toid: data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                if (data.selfsockets) {
                    for (var i = 0; i < data.selfsockets.length; i++) {
                        socket.broadcast.to(data.selfsockets[i]).emit('sendMsg', {
                            msg: data.msg,
                            sender_id: data.sender_id,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            //toid:data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                socket.emit('sendMsg', {
                    msg: data.msg,
                    sender_id: data.sender_id,
                    receiver_id: data.receiver_id,
                    fromid: data.fromid,
                    createdAt: data.createdAt
                });
            });
            socket.on('disconnect', function () {
                for (var i = 0; i < _this.users.length; i++) {
                    var foundExitUserId = _this.users[i].channelid.findIndex(function (element) {
                        return element === socket.id;
                    });
                    console.log(foundExitUserId);
                    if (foundExitUserId > -1) {
                        if (_this.users[i].channelid.length > 1) {
                            _this.users[i].channelid.splice(foundExitUserId, 1);
                        }
                        else {
                            _this.users.splice(i, 1);
                        }
                    }
                }
                console.log("current users", _this.users);
                _this.io.emit('exit', _this.users);
            });
            socket.on('getDraw', function (data) {
                /*
                if(!data.toid){
                  data.read=false;
                }else{
                  data.read =true;
                }*/
                data.read = false;
                var newMsg = new schema_1.chatSchema(data);
                //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
                newMsg.save(function (err) {
                    if (err)
                        throw err;
                });
                //console.log("saved message:",data);
                if (data.toid) {
                    for (var i = 0; i < data.toid.length; i++) {
                        socket.broadcast.to(data.toid[i]).emit('sendDrawImg', {
                            //msg:data.msg,
                            sender_id: data.sender_id,
                            drawImg: data.drawImg,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            toid: data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                if (data.selfsockets) {
                    for (var i = 0; i < data.selfsockets.length; i++) {
                        socket.broadcast.to(data.selfsockets[i]).emit('sendDrawImg', {
                            //msg:data.msg,
                            sender_id: data.sender_id,
                            drawImg: data.drawImg,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            //toid:data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                socket.emit('sendDrawImg', {
                    //msg:data.msg,
                    sender_id: data.sender_id,
                    drawImg: data.drawImg,
                    receiver_id: data.receiver_id,
                    fromid: data.fromid,
                    createdAt: data.createdAt
                });
            });
            socket.on('getFile', function (data) {
                /*
                if(!data.toid){
                  data.read=false;
                }else{
                  data.read =true;
                }*/
                data.read = false;
                var newMsg = new schema_1.chatSchema(data);
                console.log(newMsg);
                //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
                newMsg.save(function (err) {
                    if (err)
                        throw err;
                });
                //console.log("saved message:",data);
                if (data.toid) {
                    for (var i = 0; i < data.toid.length; i++) {
                        socket.broadcast.to(data.toid[i]).emit('sendFile', {
                            //msg:data.msg,
                            sender_id: data.sender_id,
                            file: data.file,
                            filename: data.filename,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            toid: data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                if (data.selfsockets) {
                    for (var i = 0; i < data.selfsockets.length; i++) {
                        socket.broadcast.to(data.selfsockets[i]).emit('sendFile', {
                            //msg:data.msg,
                            sender_id: data.sender_id,
                            file: data.file,
                            filename: data.filename,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            //toid:data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                socket.emit('sendFile', {
                    //msg:data.msg,
                    sender_id: data.sender_id,
                    file: data.file,
                    filename: data.filename,
                    receiver_id: data.receiver_id,
                    fromid: data.fromid,
                    createdAt: data.createdAt
                });
            });
            socket.on('getImg', function (data) {
                /*
                if(!data.toid){
                  data.read=false;
                }else{
                  data.read =true;
                }*/
                data.read = false;
                var newMsg = new schema_1.chatSchema(data);
                console.log('get img');
                console.log(newMsg);
                //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
                newMsg.save(function (err) {
                    if (err)
                        throw err;
                });
                //console.log("saved message:",data);
                if (data.toid) {
                    for (var i = 0; i < data.toid.length; i++) {
                        socket.broadcast.to(data.toid[i]).emit('sendImg', {
                            //msg:data.msg,
                            sender_id: data.sender_id,
                            img: data.img,
                            imgname: data.imgname,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            toid: data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                if (data.selfsockets) {
                    for (var i = 0; i < data.selfsockets.length; i++) {
                        socket.broadcast.to(data.selfsockets[i]).emit('sendImg', {
                            //msg:data.msg,
                            sender_id: data.sender_id,
                            img: data.img,
                            imgname: data.imgname,
                            receiver_id: data.receiver_id,
                            fromid: data.fromid,
                            //toid:data.toid,
                            createdAt: data.createdAt
                        });
                    }
                }
                console.log("emit msgData", data);
                socket.emit('sendImg', {
                    //msg:data.msg,
                    sender_id: data.sender_id,
                    img: data.img,
                    imgname: data.imgname,
                    receiver_id: data.receiver_id,
                    fromid: data.fromid,
                    createdAt: data.createdAt
                });
                console.log("emit self", data);
            });
            socket.on('message_Read', function (data) {
                console.log("update read", data);
                schema_1.chatSchema.update({ sender_id: data.selectedUser_id, receiver_id: data.currentUser_id }, { read: true, modifiedAt: new Date() }, { multi: true }, function (err, res) {
                    if (err) {
                        throw err;
                    }
                    else {
                        console.log(null, res);
                    }
                });
            });
        });
    };
    ChatServer.prototype.getApp = function () {
        return this.app;
    };
    ChatServer.PORT = 8080;
    return ChatServer;
}());
exports.ChatServer = ChatServer;
/*
export class ChatSchema {
  mongoose= require('mongoose');
  constructor(private chatSchema){
    chatSchema = this.mongoose.Schema({
      created: {type:Date, default:Date.now()}
    });
  }
}
*/
