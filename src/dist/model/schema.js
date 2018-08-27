"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
exports.Schema = mongoose.Schema;
var chat_schema = new exports.Schema({
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
    if (this) {
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
exports.chatSchema = mongoose.model('Message', chat_schema);
