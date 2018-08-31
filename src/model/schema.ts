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
    required: false
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
  },
  tutor_user_id: { type: Number },
  learner_user_id: { type: Number },
  session_subject: { type: String },
  session_location: { type: String },
  session_date: { type: Date },
  learner_name: { type: String },
  tutor_name: { type: String },
  tutor_read:{type:Boolean},
  learner_read:{type:Boolean}

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

let sessionschema = new Schema({
  tutor_user_id: {type: Number},
  learner_user_id: {type: Number},
  session_subject: {type:String},
  session_location: {type:String},
  session_date:{type:Date},
  learner_name: {type:String},
  tutor_name: {type:String},
  createdAt: {
	   type: Date,
	   required: false
  },
  modifiedAt: {
	   type: Date,
	   required: false
  },
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

export let sessionSchema = mongoose.model('sessions', sessionschema);


export let chatSchema = mongoose.model('Message', schema);

export let userSchema = mongoose.model('users', userschema);
