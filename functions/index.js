const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");

app.use(cors());

const { getChallenge, getAllChallenges } = require("./routes/challenges");
const { addChallenge } = require("./routes/user");
const { makeGame } = require("./routes/singlePlayer");

app.get("/hi", (req, res) => {
	res.json({
		message: "Hey whats up??",
	});
});

// Challenges Routes
app.post("/getChallenge", getChallenge);
app.get("/getAllChallenges", getAllChallenges);

// User Routes
app.post("/addChallenge", addChallenge);

// Single Player Routes
app.post("/singlePlayer/makeGame", makeGame);

exports.api = functions.https.onRequest(app);
