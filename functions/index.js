const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");

app.use(cors());

const { getChallenge, getAllChallenges } = require("./routes/challenges");
const { addChallenge, initializeUser } = require("./routes/user");
const {
	makeSinglePlayerGame,
	getNumberCorrectPositions,
	test,
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

// User Routes
app.post("/addChallenge", addChallenge);
app.post("/initializeUser", initializeUser);

// Gameplay Routes
app.post("/makeSinglePlayerGame", makeSinglePlayerGame);
/*
req body: size, numShips, userId
return {gameId, size, numShips, triesLeft} 
*/

app.post("/getNumberCorrectPositions", getNumberCorrectPositions);
/*
 */

exports.api = functions.https.onRequest(app);
