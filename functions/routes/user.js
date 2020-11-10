const { admin, database } = require("../utils/admin");

const getChallengesMadeByUser = (req, res) => {
	//TODO
};

const addChallenge = async (req, res) => {
	const { challenge, uid } = req.body;

	const challengeId = await database
		.collection("challenges")
		.add({ ...challenge, highscores: [], userId: uid })
		.then((doc) => {
			return doc.id;
		})
		.catch((err) => res.status(500).json({ error: err.message }));

	const userRef = database.collection("users").doc(uid);
	await userRef
		.update({
			challengesMade: admin.firestore.FieldValue.arrayUnion({
				challengeId,
			}),
		})
		.then(() => res.json({ message: "Challenge added successfully" }))
		.catch((err) => {
			res.json({ error: err.message });
		});
};

const initializeUser = (req, res) => {
	const { userId, displayName } = req.body;
	const doc = database.collection("users").doc(userId);
	if (!doc.exists) {
		database.collection("users").add({
			challengesMade: [],
			challengesPlayed: [],
			displayName,
			highscoreSinglePlayer,
			numSinglePlayerGamesPlayed,
		});
		res.json({ message: "Successfully initialized user" });
	} else {
		res.json({ message: "User already exists" });
	}
};

module.exports = { getChallengesMadeByUser, addChallenge, initializeUser };
