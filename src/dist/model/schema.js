"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
exports.Schema = mongoose.Schema;
var schema = new exports.Schema({
    sender_id: {
        type: String,
        required: true
    },
    receiver_id: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: false
    },
    drawImg: {
        type: String,
        required: false
    },
    read: {
        type: Boolean,
        required: true
    },
    file: {
        type: String,
        required: false
    },
    filename: {
        type: String,
        required: false
    },
    img: {
        type: String,
        required: false
    },
    imgname: {
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
}).pre('save', function (next) {
    if (this._doc) {
        var doc = this._doc;
        var now = new Date();
        if (!doc.createdAt) {
            doc.createdAt = now;
        }
        doc.modifiedAt = now;
    }
    next();
    return this;
});
var userschema = new exports.Schema({
    user_id: { type: Number },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    verified: { type: String },
    tutor_id: { type: String },
    user_role: { type: Number },
    created_at: { type: Date },
    updated_at: { type: Date },
    deleted_at: { type: Date }
});
exports.chatSchema = mongoose.model('Message', schema);
exports.userSchema = mongoose.model('users', userschema);
