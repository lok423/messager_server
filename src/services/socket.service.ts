import * as socketIo from 'socket.io';
import { chatSchema } from '../model/schema';
import { Message } from '../model/message';
import { UpdateMsg } from '../model/user';
import { createServer, Server } from 'http';
import * as express from 'express';
const config = require('config.json');


export class SocketService {
  private io: SocketIO.Server;
  private port: string | number;
  private server: Server;
  private users: any[];

    constructor() {

    }

    public sockets(): void {
      this.io = socketIo(this.server);
    }

    public listen(): void {
      var jwt = require('jsonwebtoken');
      this.server.listen(this.port, () => {
        console.log('Running server on port %s', this.port);
      });


      this.io.use(function(socket, next) {
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
        }
      })



        .on('connect', (socket: any) => {
          console.log('Connected client on port %s.', this.port);


          socket.on('user', (user: any) => {
            console.log("on user", user);
            var query = chatSchema.find({ $or: [{ senderName: user.username }, { receiverName: user.username }] });
            query.sort({ createdAt: 1 }).exec(function(err, allMessages) {
              if (err) throw err;
              else {
                //console.log("allMessages",allMessages);
                socket.emit('old msgs', allMessages);
              }
            });

            console.log("socketid: ", socket.id);
            console.log('User Joined: %s', JSON.stringify(user.username));
            var sameUserIds: string[] = [];
            var found = this.users.some(function(finduser) {
              console.log("for each user", user);

              if (finduser.username === user.username) {
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

              console.log(this.users);
              console.log("same user join");
            } else {
              this.users.push({
                channelid: [socket.id],
                username: user.username,
              });
              console.log(this.users);
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

            console.log(data);
            var newMsg = new chatSchema(data);
            console.log(newMsg);

            newMsg.save(function(err) {
              if (err) throw err;
            })

            console.log("saved message:", data);
            if (data.toid) {
              for (let i = 0; i < data.toid.length; i++) {
                socket.broadcast.to(data.toid[i]).emit('sendMsg', {
                  msg: data.msg,
                  senderName: data.senderName,
                  receiverName: data.receiverName,
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
                  senderName: data.senderName,
                  receiverName: data.receiverName,
                  fromid: data.fromid,
                  //toid:data.toid,
                  createdAt: data.createdAt
                });
              }
            }


            socket.emit('sendMsg', {
              msg: data.msg,
              senderName: data.senderName,
              receiverName: data.receiverName,
              fromid: data.fromid,
              createdAt: data.createdAt
            });


          });


          socket.on('disconnect', () => {

            for (let i = 0; i < this.users.length; i++) {
              var foundExitUserId = this.users[i].channelid.findIndex(function(element: string) {
                return element === socket.id;
              });
              console.log(foundExitUserId);
              if (foundExitUserId > -1) {
                if (this.users[i].channelid.length > 1) {
                  this.users[i].channelid.splice(foundExitUserId, 1);
                } else {
                  this.users.splice(i, 1);
                }

              }
            }
            console.log("current users", this.users);
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
                  senderName: data.senderName,
                  drawImg: data.drawImg,
                  receiverName: data.receiverName,
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
                  senderName: data.senderName,
                  drawImg: data.drawImg,
                  receiverName: data.receiverName,
                  fromid: data.fromid,
                  //toid:data.toid,
                  createdAt: data.createdAt
                });
              }
            }

            socket.emit('sendDrawImg', {
              //msg:data.msg,
              senderName: data.senderName,
              drawImg: data.drawImg,
              receiverName: data.receiverName,
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
            console.log(newMsg);
            //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
            newMsg.save(function(err) {
              if (err) throw err;
            })

            //console.log("saved message:",data);
            if (data.toid) {
              for (let i = 0; i < data.toid.length; i++) {
                socket.broadcast.to(data.toid[i]).emit('sendFile', {
                  //msg:data.msg,
                  senderName: data.senderName,
                  file: data.file,
                  filename: data.filename,
                  receiverName: data.receiverName,
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
                  senderName: data.senderName,
                  file: data.file,
                  filename: data.filename,
                  receiverName: data.receiverName,
                  fromid: data.fromid,
                  //toid:data.toid,
                  createdAt: data.createdAt
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
            console.log('get img');
            console.log(newMsg);
            //chatSchema.save({fromname:"aa", toname:"bb", msg:"hi"});
            newMsg.save(function(err) {
              if (err) throw err;
            })

            //console.log("saved message:",data);
            if (data.toid) {
              for (let i = 0; i < data.toid.length; i++) {
                socket.broadcast.to(data.toid[i]).emit('sendImg', {
                  //msg:data.msg,

                  senderName: data.senderName,
                  img: data.img,
                  imgname: data.imgname,
                  receiverName: data.receiverName,
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
                  senderName: data.senderName,
                  img: data.img,
                  imgname: data.imgname,
                  receiverName: data.receiverName,
                  fromid: data.fromid,
                  //toid:data.toid,
                  createdAt: data.createdAt
                });
              }
            }
            console.log("emit msgData", data);


            socket.emit('sendImg', {
              //msg:data.msg,
              senderName: data.senderName,
              img: data.img,
              imgname: data.imgname,
              receiverName: data.receiverName,
              fromid: data.fromid,
              createdAt: data.createdAt
            });
            console.log("emit self", data);
          });

            socket.on('message_Read', (data: UpdateMsg) => {
              console.log("update read",data);
              chatSchema.update({senderName: data.selectedUserName, receiverName:data.currentUserName},{read: true, modifiedAt: new Date()},{multi: true}, function(err, res) {
   if (err) { throw err;
   } else { console.log(null, res);
   }});

            });


        });
    }
}
