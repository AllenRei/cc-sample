const mongoose = require("mongoose");

module.exports = {
    init() {
        const connection = mongoose.connect(process.env.DB)
        mongoose.connection.on("error", console.error.bind(console, "Mongo connection error:"));
        mongoose.connection.once("open", () => {
            console.log("Connected to Mongo");
        });
        return connection;
    }
}