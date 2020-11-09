const functions = require("firebase-functions");
const app = require("express")();

const { getChallenges } = require("./routes/challenges");

app.get("/hi", (req, res) => {
	res.json({
		message: "Hey whats up??",
	});
});

// Challenges Routes
app.get("/getChallenges", getChallenges);

exports.api = functions.https.onRequest(app);
