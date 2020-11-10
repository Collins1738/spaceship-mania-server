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

	// console.log(challengeId, uid);
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

module.exports = { getChallengesMadeByUser, addChallenge };
