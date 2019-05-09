const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = new Schema({
    uploader: {
        type: ObjectId,
        ref: "User"
    },
    url: {
        type: String
    },
    filename: {
        type: String
    }
})

