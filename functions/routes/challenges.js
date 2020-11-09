const { admin, database } = require("../utils/admin");

const getChallenges = async (req, res) => {
	allChallenges = [];
	await database
		.collection("challenges")
		.get()
		.then((data) => {
			data.forEach((doc) => allChallenges.push(doc.data()));
		})
		.then(() => res.json({ allChallenges }))
		.catch((err) => res.status(500).json({ error: err.message }));
};

const getChallenge = (req, res) => {
	const { challengeId } = req.body;
	// TODO
};

const addChallenge = (req, res) => {
	const { challenge } = req.body;
	// TODO
};

const updateHighscore = (req, res) => {
	const { challengeId, highscore } = req.body;
	// TODO
};

module.exports = { getChallenges, getChallenge, addChallenge, updateHighscore };
