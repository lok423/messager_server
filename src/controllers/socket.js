import * as socketIo from 'socket.io';

module.exports.functionName = function () {
  // body...
};



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
