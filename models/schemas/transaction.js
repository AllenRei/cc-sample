const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = new Schema({ 
    type: { type: Number, require: true },
    author: { type: ObjectId, ref: "User", required: true },
    date: { type: Number, required: false },
    amount: { type: Number, required: false, default : 0 },
    attachments: [{ type: ObjectId, ref: 'Event.files', required: false }],
    version: { type: Boolean, default: 0 },
    comment: { type: String, required: false, maxlength: 200 },
    target: { type: ObjectId, ref: "User", required: false }
});