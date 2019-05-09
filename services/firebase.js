const admin = require("firebase-admin");
const { FIREBASE, FIREBASE_DB } = require("../config")
module.exports = {
    init() {       
        admin.initializeApp({
            credential: admin.credential.cert(FIREBASE),
            databaseURL: FIREBASE_DB
        });
        console.log("Firebase service initialized");
    }
}