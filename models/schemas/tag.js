const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.export = new Schema({ 
    title: { type: String, required: false } 
})