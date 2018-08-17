import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
//import * as mongoose from 'mongoose';
import { Message } from './model';
//import {schema} from'./model';
import {chatSchema} from './model/schema';


export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
		private users:any[];
    private mongoose;
    private api;
    //private busboy;
    private formidable;
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
    private createMongodb(){
      this.mongoose = require('mongoose');
      this.mongoose.connect('mongodb://localhost/chat', function (err) {
      //this.mongoose.connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', function (err) {
if (err) {
      console.log(err);
}else {
  console.log('connected to the mongodb!');
}      })
    }

    private createApp(): void {
        this.app = express();
        this.api =require('../routes/api');
        //this.busboy = require('connect-busboy');
        this.formidable = require('formidable');
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
        this.app.set('port', this.port );
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


    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });




        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);


            socket.on('username', (userName:string) => {
              var query = chatSchema.find({ $or: [ { senderName: userName}, { receiverName: userName } ] });
              query.sort('+createdAt').limit().exec(function (err,allMessages) {
                  if(err) throw err;
                  else{
                    console.log("allMessages",allMessages);
                    socket.emit('old msgs', allMessages);
                  }
              });

              console.log("socketid: ",socket.id);
              console.log('User Joined: %s', JSON.stringify(userName));
              var sameUserIds:string[]=[];
              var found = this.users.some(function(user) {
                console.log("for each user",user);

  if (user.userName === userName) {
    console.log("find same user", user.channelid);
    //user.channelids.push(socket.id);
    //sameUserIds.push(user.channelid);
    user.channelid.push(socket.id);
    return user.channelid;
  }
});
console.log("found same user, which id",sameUserIds);
              if(found){
                //sameUserIds.push(socket.id);

                console.log(this.users);
                console.log("same user join");
              }else{
                this.users.push({
    		      		channelid : [socket.id],
    		      		userName : userName,
    		      	});
                console.log(this.users);
              }
              let len = this.users.length;
              len--;

              this.io.emit('userList',this.users,socket.id);

		    });

        socket.on('getMsg', (data:any) => {
          var newMsg = new chatSchema(data);
          //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
          newMsg.save(function(err){
          if(err) throw err;
        })

          console.log("saved message:",data);
          if(data.toid!=''){
          for(let i=0; i<data.toid.length;i++){
            socket.broadcast.to(data.toid[i]).emit('sendMsg',{
  		    		msg:data.msg,
  		    		senderName:data.senderName,
              receiverName: data.receiverName,
              fromid:data.fromid,
              toid:data.toid,
              createAt:data.createAt
  		    	});
          }
        }
        if(data.selfsockets!=''){
          for(let i=0; i<data.selfsockets.length;i++){
            socket.broadcast.to(data.selfsockets[i]).emit('sendMsg',{
  		    		msg:data.msg,
  		    		senderName:data.senderName,
              receiverName: data.receiverName,
              fromid:data.fromid,
              toid:data.toid,
              createAt:data.createAt
  		    	});
          }
        }



          socket.emit('sendMsg',{
		    		msg:data.msg,
            senderName:data.senderName,
            receiverName: data.receiverName,
            fromid:data.fromid,
            toid:data.toid,
            createAt:data.createAt
		    	});

		    });

		    socket.on('disconnect',()=>{

		      	for(let i=0; i < this.users.length; i++){
              var foundExitUserId = this.users[i].channelid.findIndex(function(element:string) {
  return element ===socket.id;
});
              console.log(foundExitUserId);
		        	if(foundExitUserId>-1){
                if(this.users[i].channelid.length>1){
                  this.users[i].channelid.splice(foundExitUserId,1);
                }else{
                  this.users.splice(i,1);
                }

		        	}
		      	}
            console.log("current users", this.users);
		      	this.io.emit('exit',this.users);
		    });


        socket.on('getDraw', (data:any) => {
          var newMsg = new chatSchema(data);
          //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
          newMsg.save(function(err){
          if(err) throw err;
        })

          //console.log("saved message:",data);
          if(data.toid!=''){
          for(let i=0; i<data.toid.length;i++){
            socket.broadcast.to(data.toid[i]).emit('sendDrawImg',{
              //msg:data.msg,
              senderName:data.senderName,
              drawImg:data.drawImg,
              receiverName: data.receiverName,
              fromid:data.fromid,
              toid:data.toid,
              createAt:data.createAt
            });
          }
        }
        if(data.selfsockets!=''){
          for(let i=0; i<data.selfsockets.length;i++){
            socket.broadcast.to(data.selfsockets[i]).emit('sendDrawImg',{
              //msg:data.msg,
              senderName:data.senderName,
              drawImg:data.drawImg,
              receiverName: data.receiverName,
              fromid:data.fromid,
              toid:data.toid,
              createAt:data.createAt
            });
          }
        }
          socket.emit('sendDrawImg',{
            //msg:data.msg,
            senderName:data.senderName,
            drawImg:data.drawImg,
            receiverName: data.receiverName,
            fromid:data.fromid,
            toid:data.toid,
            createAt:data.createAt
          });
        });



        socket.on('getFile', (data:any) => {
          var newMsg = new chatSchema(data);
          console.log(newMsg);
          //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
          newMsg.save(function(err){
          if(err) throw err;
        })

          //console.log("saved message:",data);
          if(data.toid!=''){
          for(let i=0; i<data.toid.length;i++){
            socket.broadcast.to(data.toid[i]).emit('sendFile',{
              //msg:data.msg,
              senderName:data.senderName,
              file:data.file,
              filename:data.filename,
              receiverName: data.receiverName,
              fromid:data.fromid,
              toid:data.toid,
              createAt:data.createAt
            });
          }
        }
        if(data.selfsockets!=''){
          for(let i=0; i<data.selfsockets.length;i++){
            socket.broadcast.to(data.selfsockets[i]).emit('sendFile',{
              //msg:data.msg,
              senderName:data.senderName,
              file:data.file,
              filename:data.filename,
              receiverName: data.receiverName,
              fromid:data.fromid,
              toid:data.toid,
              createAt:data.createAt
            });
          }
        }



          socket.emit('sendFile',{
            //msg:data.msg,
            senderName:data.senderName,
            file:data.file,
            filename:data.filename,
            receiverName: data.receiverName,
            fromid:data.fromid,
            toid:data.toid,
            createAt:data.createAt
          });

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
