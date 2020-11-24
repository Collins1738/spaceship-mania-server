const { admin, database } = require("../utils/admin");

const getAllChallenges = async (req, res) => {
	allChallenges = [];
	await database
		.collection("challenges")
		.get()
		.then((data) => {
			data.forEach((doc) => {
				const { date, userId, name, highscores } = doc.data();
				allChallenges.push({
					challengeId: doc.id,
					date: date.toDate().toString().slice(0, 15),
					userId,
					name,
					highscore: highscores[0] || null,
				});
			});
		})
		.catch((err) => res.status(500).json({ error: err.message }));

	var index = 0;
	while (index < allChallenges.length) {
		const { userId, ...rest } = allChallenges[index];
		let creator = await getDisplayName(userId);
		allChallenges[index] = { creator, ...rest };
		index += 1;
	}
	res.json(allChallenges);
};

const getChallenge = (req, res) => {
	const { challengeId } = req.body;
	database
		.collection("challenges")
		.doc(challengeId)
		.get()
		.then(async (doc) => {
			if (!doc.exists) {
				res.status(404).json({ error: "challenge does not exist" });
			} else {
				const {
					challengeId,
					highscores,
					positions,
					size,
					tries,
					userId,
					date,
					name,
				} = doc.data();
				const creator = await getDisplayName(userId);
				const newHighscores = highscores.map((highscore) => {
					return {
						displayName: highscore.displayName,
						score: highscore.score,
						date: highscore.date.toDate().toString().slice(0, 15),
					};
				});
				const challenge = {
					challengeId,
					highscores: newHighscores,
					positions,
					size,
					tries,
					creator,
					date: date.toDate().toString().slice(0, 15),
					name,
				};
				res.json(challenge);
			}
		})
		.catch((err) => res.status(500).json({ error: err.message }));
};

const addChallenge = async (req, res) => {
	const {
		size,
		numShips,
		tries,
		positions,
		userId,
		challengeName,
	} = req.body;
	const date = admin.firestore.Timestamp.now();
	const challengeId = await database
		.collection("challenges")
		.add({
			size,
			numShips,
			tries,
			positions,
			userId,
			date,
			highscores: [],
			name: challengeName,
		})
		.then((doc) => {
			return doc.id;
		})
		.catch((err) => {
			res.status(500).json({ message: err.message });
		});

	const userRef = database.collection("users").doc(userId);
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

const updateHighscore = (req, res) => {
	const { challengeId, highscore } = req.body;
	// TODO
};

const getDisplayName = async (userId) => {
	const displayName = await database
		.collection("users")
		.doc(userId)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return null;
			} else {
				return doc.data().displayName;
			}
		})
		.catch((err) => {
			console.log(err.message);
			return null;
		});
	return displayName;
};

module.exports = {
	getAllChallenges,
	getChallenge,
	updateHighscore,
	addChallenge,
};
