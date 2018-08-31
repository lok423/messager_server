require('rootpath')();
import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';



//import * as mongoose from 'mongoose';
import { Message } from './model';
//import {schema} from'./model';
import { chatSchema,userSchema } from './model/schema';
import { UpdateMsg } from './model/user';
const config = require('config.json');
const http = require('http');





export class ChatServer {
  public static readonly PORT: number = 8080;
  private ip : string = '192.168.1.83' ;

  private app: express.Application;
  private server: Server;
  public  io: SocketIO.Server;
  private port: string | number;
  public users: any[];
  private mongoose;
  private api = require('../routes/api');
  //private busboy;
  private formidable;
  private cors = require('cors');
  private bodyParser = require('body-parser');
  private expressJwt = require('express-jwt');
  private authconfig = require('config.json');

  //private jwt = require('jsonwebtoken');
  //private passport = require('passport');


  //private api = require('./server/routes/api');


  //private chat =require('./model/schema');

  constructor() {
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
  private createMongodb() {
    this.mongoose = require('mongoose');
    this.mongoose.connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', function(err) {
      if (err) {
        //console.log(err);
      } else {
        //console.log('connected to the mongodb!');
      }
    })
  }

  private createApp(): void {
    this.app = express();
    //this.busboy = require('connect-busboy');
    this.formidable = require('formidable');

  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private config(): void {
    this.port = process.env.PORT || ChatServer.PORT;
    this.app.set('port', this.port);

    //this.app.set('socketIo',this.io);
    //this.app.use(this.busboy({ immediate: true }));
    //this.app.use(this.formidable);
    this.app.use(this.cors());
    this.app.use(this.bodyParser.urlencoded({ extended: true }));
    this.app.use(this.bodyParser.json());

    /*
    this.app.use(this.passport.initialize());
this.app.use(this.passport.session());*/
    this.app.use(function(req, res, next) {
      //console.log(req);
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
    this.app.use(this.expressJwt({
      secret: this.authconfig.secret,
      getToken: function(req) {
        //console.log(req);
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
          return req.query.token;
        }
        return null;
      }
    }).unless({ path: ['/users/authenticate', '/users/register','/api/sessions/create'] }));

    // routes
    this.app.use('/api', this.api);
    this.app.use('/users', require('../controllers/users.controller'));

    // error handler
    this.app.use(function(err, req, res, next) {
    //console.log(err);
      if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid Token');
      } else {
        throw err;
      }
    });



/*
http.get('http://proprius.co.nz/api/public/api/adminusers', (res) => {
  let data = '';
  res.setEncoding('utf8');
  //console.log("get http", res);

  // A chunk of data has been recieved.
  res.on('data', (chunk) => {
    data += chunk;
    //console.log(data);

  });

  // The whole response has been received. Print out the result.
  res.on('end', () => {
    //console.log(JSON.parse(data));
    var users = JSON.parse(data);
    console.log(users.length);
    for(var i=0;i<users.length;i++){
      //console.log(users[i]);
      var new_user = new userSchema(users[i]);
      //console.log(new_user);

      new_user.save(function(err) {
        if (err) throw err;
      })
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});*/


  }

  private sockets(): void {
    this.io = socketIo(this.server);

    //console.log(this.io);
  }

  private listen(): void {
    //var jwt = require('jsonwebtoken');
    this.server.listen(this.port,Number(this.ip) ,()=>  {
      console.log('Running server on port %s', this.port);
    });

    this.socketfunction();

}


  socketfunction(){
    this.io.use(function(socket, next) {
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
      .on('connect', (socket) => {
        //console.log('Connected client on port %s.', this.port);
        socket.on('user', (user) => {
          //console.log("on user", user);

          var query = chatSchema.find({ $or: [{ sender_id: user.user_id }, { receiver_id: user.user_id }] });
          //console.log(query);
          query.sort({ createdAt: 1 }).exec(function(err, allMessages) {
            if (err) throw err;
            else {
              //console.log("allMessages",allMessages);
              socket.emit('old msgs', allMessages);
            }
          });

          //console.log("socketid: ", socket.id);
          //console.log('User Joined: %s', JSON.stringify(user.user_id));
          var sameUserIds: string[] = [];
          var found = this.users.some(function(finduser) {
            //console.log("for each user", user);

            if (finduser.user_id === user.user_id) {
              //console.log("find same user", finduser.channelid);
              //user.channelids.push(socket.id);
              //sameUserIds.push(user.channelid);
              finduser.channelid.push(socket.id);
              return finduser.channelid;
            }
          });
          //console.log("found same user, which id", sameUserIds);
          if (found) {
            //sameUserIds.push(socket.id);

            //console.log(this.users);
            //console.log("same user join");
          } else {
            this.users.push({
              channelid: [socket.id],
              user_id: user.user_id,
            });
            //console.log(this.users);
          }
          let len = this.users.length;
          len--;

          this.io.emit('userList', this.users, socket.id);

        });

        socket.on('getMsg', (data: Message) => {
          /*
          if(!data.toid){
            data.read=false;
          }else{
            data.read =true;
          }*/
          data.read = false;

          //console.log(data);
          var newMsg = new chatSchema(data);
          //console.log(newMsg);

          newMsg.save(function(err) {
            if (err) throw err;
          })

          //console.log("saved message:", data);
          if (data.toid) {
            for (let i = 0; i < data.toid.length; i++) {
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
            for (let i = 0; i < data.selfsockets.length; i++) {
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


        socket.on('disconnect', () => {

          for (let i = 0; i < this.users.length; i++) {
            var foundExitUserId = this.users[i].channelid.findIndex(function(element: string) {
              return element === socket.id;
            });
            //console.log(foundExitUserId);
            if (foundExitUserId > -1) {
              if (this.users[i].channelid.length > 1) {
                this.users[i].channelid.splice(foundExitUserId, 1);
              } else {
                this.users.splice(i, 1);
              }

            }
          }
          //console.log("current users", this.users);
          this.io.emit('exit', this.users);
        });


        socket.on('getDraw', (data: Message) => {
          /*
          if(!data.toid){
            data.read=false;
          }else{
            data.read =true;
          }*/
          data.read = false;

          var newMsg = new chatSchema(data);
          //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
          newMsg.save(function(err) {
            if (err) throw err;
          })

          //console.log("saved message:",data);
          if (data.toid) {
            for (let i = 0; i < data.toid.length; i++) {
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
            for (let i = 0; i < data.selfsockets.length; i++) {
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



        socket.on('getFile', (data: Message) => {
          /*
          if(!data.toid){
            data.read=false;
          }else{
            data.read =true;
          }*/
          data.read = false;

          var newMsg = new chatSchema(data);
          //console.log(newMsg);
          //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
          newMsg.save(function(err) {
            if (err) throw err;
          })

          //console.log("saved message:",data);
          if (data.toid) {
            for (let i = 0; i < data.toid.length; i++) {
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
            for (let i = 0; i < data.selfsockets.length; i++) {
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

        socket.on('getImg', (data: Message) => {
          /*
          if(!data.toid){
            data.read=false;
          }else{
            data.read =true;
          }*/
          data.read = false;

          var newMsg = new chatSchema(data);
          //console.log('get img');
          //console.log(newMsg);
          //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
          newMsg.save(function(err) {
            if (err) throw err;
          })

          //console.log("saved message:",data);
          if (data.toid) {
            for (let i = 0; i < data.toid.length; i++) {
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
            for (let i = 0; i < data.selfsockets.length; i++) {
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
          //console.log("emit msgData", data);


          socket.emit('sendImg', {
            //msg:data.msg,
            sender_id: data.sender_id,
            img: data.img,
            imgname: data.imgname,
            receiver_id: data.receiver_id,
            fromid: data.fromid,
            createdAt: data.createdAt
          });
          //console.log("emit self", data);
        });

          socket.on('message_Read', (data: UpdateMsg) => {
            //console.log("update read",data);

            if(data.role=="1"){
            chatSchema.update({sender_id: data.selectedUserId, receiver_id: data.currentUserId},{read: true, modifiedAt: new Date()},{multi: true}, function(err, res) {
 if (err) { throw err;
 } else { console.log("update user");
 }});
 chatSchema.update({sender_id: data.currentUserId, receiver_id: data.selectedUserId},{modifiedAt: new Date(),learner_read:true},{multi: true}, function(err, res) {
if (err) { throw err;
} else { console.log("update learner");
}});
          }else if(data.role=="3"){
            chatSchema.update({sender_id: data.selectedUserId, receiver_id: data.currentUserId},{read: true, modifiedAt: new Date(), tutor_read:true},{multi: true}, function(err, res) {
 if (err) { throw err;
 } else { console.log("update tutor");
 }});
          }


          });


      });


  }


  public getApp(): express.Application {
    return this.app;
  }

}


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
