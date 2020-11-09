const admin = require("firebase-admin");
admin.initializeApp();
const database = admin.firestore();
const firebase = require("firebase");
const firebaseConfig = require("./config");

firebase.initializeApp(firebaseConfig);
module.exports = { admin, database, firebase };
