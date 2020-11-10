const { database } = require("../utils/admin");

const getNumberCorrect = (req, res) => {
	const { challengeId, positions } = req.body;
	// TODO
};

module.exports = { getChallenges, getChallenge, addChallenge, updateHighscore };
