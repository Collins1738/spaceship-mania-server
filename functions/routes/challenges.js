const { admin, database } = require("../utils/admin");

const getAllChallenges = async (req, res) => {
	allChallenges = [];
	await database
		.collection("challenges")
		.get()
		.then((data) => {
			data.forEach((doc) => {
				allChallenges.push({ challengeId: doc.id, ...doc.data() });
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
				} = doc.data();
				const creator = await getDisplayName(userId);
				const challenge = {
					challengeId,
					highscores,
					positions,
					size,
					tries,
					creator,
				};
				res.json(challenge);
			}
		})
		.catch((err) => res.status(500).json({ error: err.message }));
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
};
