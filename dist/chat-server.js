"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
//import {schema} from'./model';
var schema_1 = require("./model/schema");
var ChatServer = /** @class */ (function () {
    //private api = require('./server/routes/api');
    //private chat =require('./model/schema');
    function ChatServer() {
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
        this.mongoose.connect('mongodb://localhost/chat', function (err) {
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
        this.app.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');
            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            //res.setHeader('Access-Control-Allow-Credentials', 'false');
            // Pass to next layer of middleware
            next();
        });
        this.app.use('/api', this.api);
    };
    ChatServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    ChatServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            console.log('Connected client on port %s.', _this.port);
            socket.on('username', function (userName) {
                var query = schema_1.chatSchema.find({ $or: [{ senderName: userName }, { receiverName: userName }] });
                query.sort('+createdAt').limit().exec(function (err, allMessages) {
                    if (err)
                        throw err;
                    else {
                        console.log("allMessages", allMessages);
                        socket.emit('old msgs', allMessages);
                    }
                });
                console.log("socketid: ", socket.id);
                console.log('User Joined: %s', JSON.stringify(userName));
                var sameUserIds = [];
                var found = _this.users.some(function (user) {
                    console.log("for each user", user);
                    if (user.userName === userName) {
                        console.log("find same user", user.channelid);
                        //user.channelids.push(socket.id);
                        //sameUserIds.push(user.channelid);
                        user.channelid.push(socket.id);
                        return user.channelid;
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
                        userName: userName,
                    });
                    console.log(_this.users);
                }
                var len = _this.users.length;
                len--;
                _this.io.emit('userList', _this.users, socket.id);
            });
            socket.on('getMsg', function (data) {
                var newMsg = new schema_1.chatSchema(data);
                //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
                newMsg.save(function (err) {
                    if (err)
                        throw err;
                });
                console.log("saved message:", data);
                if (data.toid != '') {
                    for (var i = 0; i < data.toid.length; i++) {
                        socket.broadcast.to(data.toid[i]).emit('sendMsg', {
                            msg: data.msg,
                            senderName: data.senderName,
                            receiverName: data.receiverName,
                            fromid: data.fromid,
                            toid: data.toid,
                            createAt: data.createAt
                        });
                    }
                }
                if (data.selfsockets != '') {
                    for (var i = 0; i < data.selfsockets.length; i++) {
                        socket.broadcast.to(data.selfsockets[i]).emit('sendMsg', {
                            msg: data.msg,
                            senderName: data.senderName,
                            receiverName: data.receiverName,
                            fromid: data.fromid,
                            toid: data.toid,
                            createAt: data.createAt
                        });
                    }
                }
                socket.emit('sendMsg', {
                    msg: data.msg,
                    senderName: data.senderName,
                    receiverName: data.receiverName,
                    fromid: data.fromid,
                    toid: data.toid,
                    createAt: data.createAt
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
                var newMsg = new schema_1.chatSchema(data);
                //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
                newMsg.save(function (err) {
                    if (err)
                        throw err;
                });
                //console.log("saved message:",data);
                if (data.toid != '') {
                    for (var i = 0; i < data.toid.length; i++) {
                        socket.broadcast.to(data.toid[i]).emit('sendDrawImg', {
                            //msg:data.msg,
                            senderName: data.senderName,
                            drawImg: data.drawImg,
                            receiverName: data.receiverName,
                            fromid: data.fromid,
                            toid: data.toid,
                            createAt: data.createAt
                        });
                    }
                }
                if (data.selfsockets != '') {
                    for (var i = 0; i < data.selfsockets.length; i++) {
                        socket.broadcast.to(data.selfsockets[i]).emit('sendDrawImg', {
                            //msg:data.msg,
                            senderName: data.senderName,
                            drawImg: data.drawImg,
                            receiverName: data.receiverName,
                            fromid: data.fromid,
                            toid: data.toid,
                            createAt: data.createAt
                        });
                    }
                }
                socket.emit('sendDrawImg', {
                    //msg:data.msg,
                    senderName: data.senderName,
                    drawImg: data.drawImg,
                    receiverName: data.receiverName,
                    fromid: data.fromid,
                    toid: data.toid,
                    createAt: data.createAt
                });
            });
            socket.on('getFile', function (data) {
                var newMsg = new schema_1.chatSchema(data);
                console.log(newMsg);
                //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
                newMsg.save(function (err) {
                    if (err)
                        throw err;
                });
                //console.log("saved message:",data);
                if (data.toid != '') {
                    for (var i = 0; i < data.toid.length; i++) {
                        socket.broadcast.to(data.toid[i]).emit('sendFile', {
                            //msg:data.msg,
                            senderName: data.senderName,
                            file: data.file,
                            filename: data.filename,
                            receiverName: data.receiverName,
                            fromid: data.fromid,
                            toid: data.toid,
                            createAt: data.createAt
                        });
                    }
                }
                if (data.selfsockets != '') {
                    for (var i = 0; i < data.selfsockets.length; i++) {
                        socket.broadcast.to(data.selfsockets[i]).emit('sendFile', {
                            //msg:data.msg,
                            senderName: data.senderName,
                            file: data.file,
                            filename: data.filename,
                            receiverName: data.receiverName,
                            fromid: data.fromid,
                            toid: data.toid,
                            createAt: data.createAt
                        });
                    }
                }
                socket.emit('sendFile', {
                    //msg:data.msg,
                    senderName: data.senderName,
                    file: data.file,
                    filename: data.filename,
                    receiverName: data.receiverName,
                    fromid: data.fromid,
                    toid: data.toid,
                    createAt: data.createAt
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
