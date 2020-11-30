const { database } = require("../utils/admin");
const { getChallengeFunction } = require("./challenges");

const getUserInfo = (req, res) => {
	const { userId } = req.body;
	database
		.collection("users")
		.doc(userId)
		.get()
		.then(async (doc) => {
			const {
				displayName,
				highscoreSinglePlayer,
				numSinglePlayerGamesPlayed,
				challengesMade,
				challengesPlayed,
			} = doc.data();
			var newChallengesMade = await Promise.all(
				challengesMade.map(async (challenge) => {
					challengeFull = await getChallengeFunction(
						challenge.challengeId
					);
					challenge = {
						challengeId: challenge.challengeId,
						name: challengeFull.name,
						date: challengeFull.date,
					};
					return challenge;
				})
			);
			var newChallengesPlayed = await Promise.all(
				challengesPlayed.map(async (challenge) => {
					challengeFull = await getChallengeFunction(
						challenge.challengeId
					);
					challenge = {
						challengeId: challenge.challengeId,
						name: challengeFull.name,
						date: challengeFull.date,
					};
					return challenge;
				})
			);
			res.json({
				displayName,
				highscoreSinglePlayer,
				numSinglePlayerGamesPlayed,
				challengesMade: newChallengesMade,
				challengesPlayed: newChallengesPlayed,
			});
		});
};

const changeName = (req, res) => {
	const { userId, displayName } = req.body;
	database
		.collection("users")
		.doc(userId)
		.get()
		.then((doc) => {
			doc.ref.update({ displayName });
		})
		.then(() => {
			res.json({ message: "Name successfully updated" });
		});
};

const initializeUser = (req, res) => {
	const { userId, displayName } = req.body;
	database
		.collection("users")
		.doc(userId)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				doc.ref
					.set({
						challengesMade: [],
						challengesPlayed: [],
						displayName,
						highscoreSinglePlayer: 0,
						numSinglePlayerGamesPlayed: 0,
					})
					.then(() =>
						res.json({ message: "Successfully initialized user" })
					)
					.catch((err) => res.json({ error: err.message }));
			} else {
				res.json({ message: "User already exists" });
			}
		});
};

module.exports = {
	getUserInfo,
	initializeUser,
	changeName,
};
