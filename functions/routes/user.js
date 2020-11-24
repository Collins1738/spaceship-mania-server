const { admin, database } = require("../utils/admin");

const getChallengesMadeByUser = (req, res) => {
	//TODO
};

const initializeUser = (req, res) => {
	const { userId, displayName } = req.body;
	const doc = database.collection("users").doc(userId);
	if (!doc.exists) {
		doc.set({
			challengesMade: [],
			challengesPlayed: [],
			displayName,
			highscoreSinglePlayer: 0,
			numSinglePlayerGamesPlayed: 0,
		})
			.then(() => res.json({ message: "Successfully initialized user" }))
			.catch((err) => res.json({ error: err.message }));
	} else {
		res.json({ message: "User already exists" });
	}
};

module.exports = { getChallengesMadeByUser, initializeUser };
