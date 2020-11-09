// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const app = require("express")();

// Posts Routes
// app.get("/getPosts", getPosts);
// app.post("/addPost", FbAuth, addPost);
app.get("/hi", (req, res) => {
	res.json({
		message: "Hey whats up??",
	});
});
// User Routes
// app.post("/signup", signup);
// app.post("/login", login);
// app.post("/uploadImage", FbAuth, uploadImage);

exports.api = functions.https.onRequest(app);
