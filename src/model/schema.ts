import * as mongoose from 'mongoose';


export let Schema = mongoose.Schema;

let schema = new Schema({
  sender_id: {
	   type: Number,
	   required: true
  },
  receiver_id: {
	   type: Number,
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
  if (this._doc) {
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



let userschema = new Schema({
  user_id: {type: Number},
  first_name: {type:String},
  last_name: {type:String},
  email: {type:String},
  verified:{type:String},
  tutor_id:{type:String},
  user_role:{type:Number},
  created_at:{type:Date},
  updated_at:{type:Date},
  deleted_at:{type:Date}


})


export let chatSchema = mongoose.model('Message', schema);

export let userSchema = mongoose.model('users', userschema);
