const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");

app.use(cors());

const {
	getChallenge,
	getAllChallenges,
	addChallenge,
} = require("./routes/challenges");
const { initializeUser, changeName, getUserInfo } = require("./routes/user");
const { getSinglePlayerLeaderboard } = require("./routes/singlePlayer");
const {
	makeSinglePlayerGame,
	makeChallengeGame,
	getNumberCorrectPositions,
	test,
	getGameInfo,
	endGame,
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
app.post("/changeName", changeName);
app.post("/getUserInfo", getUserInfo);

// Gameplay Routes
app.post("/makeSinglePlayerGame", makeSinglePlayerGame);
app.post("/makeChallengeGame", makeChallengeGame);
app.post("/getGameInfo", getGameInfo);
app.post("/endGame", endGame);

app.get("/getSinglePlayerLeaderboard", getSinglePlayerLeaderboard);
app.post("/getNumberCorrectPositions", getNumberCorrectPositions);

exports.api = functions.https.onRequest(app);
