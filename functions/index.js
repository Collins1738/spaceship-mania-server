const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");

app.use(cors());

const {
	getChallenge,
	getAllChallenges,
	addChallenge,
} = require("./routes/challenges");
const { initializeUser } = require("./routes/user");
const { getSinglePlayerLeaderboard } = require("./routes/singlePlayer");
const {
	makeSinglePlayerGame,
	getNumberCorrectPositions,
	test,
	getGameInfo,
} = require("./routes/gameplay");

app.get("/hi", (req, res) => {
	res.json({
		message: "Hey whats up??",
	});
});

app.get("/test", test);

// Challenges Routes
app.post("/getChallenge", getChallenge);
app.get("/getAllChallenges", getAllChallenges);
app.post("/addChallenge", addChallenge);

// User Routes
app.post("/initializeUser", initializeUser);

// Gameplay Routes
app.post("/makeSinglePlayerGame", makeSinglePlayerGame);
app.post("/getGameInfo", getGameInfo);

app.get("/getSinglePlayerLeaderboard", getSinglePlayerLeaderboard);
app.post("/getNumberCorrectPositions", getNumberCorrectPositions);

exports.api = functions.https.onRequest(app);
