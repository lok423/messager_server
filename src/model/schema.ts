import * as mongoose from 'mongoose';


export let Schema = mongoose.Schema;

let chat_schema = new Schema({
  senderName: {
	   type: String,
	   required: true
  },
  receiverName: {
	   type: String,
	   required: true
  },
  msg: {
	   type: String,
	   required: false
  },

  drawImg:{
    type: String,
    required: false
  },
  read:{
    type: Boolean,
    required: true
  },

  file:{
    type: String,
    required: false
  },

  filename:{
    type: String,
    required: false
  },

  img:{
    type: String,
    required: false
  },

  imgname:{
    type: String,
    required: false
  },

  createdAt: {
	   type: Date,
	   required: false
  },
  modifiedAt: {
	   type: Date,
	   required: false
  }
}).pre('save', function(next) {
  if (this) {
    let doc = this._doc;
    let now = new Date();
    if (!doc.createdAt) {
      doc.createdAt = now;
    }
    doc.modifiedAt = now;
  }
  next();
  return this;
});

export let chatSchema = mongoose.model('Message', chat_schema);
