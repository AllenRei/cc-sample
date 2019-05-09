const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = new Schema({
  type: { type: Number, requried: true },
  author: { type: ObjectId, ref: "User", required: true },
  target: { type: ObjectId, required: true },
  date: { type: Number, required: true }
})
