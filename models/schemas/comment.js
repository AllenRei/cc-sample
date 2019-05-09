const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User" },
  reply: {
    type: Schema.Types.ObjectId,
    ref: "Event.thread",
    required: false
  },
  body: { type: String, maxlength: 400, index: false }
});
