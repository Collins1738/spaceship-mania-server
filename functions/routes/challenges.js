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

	allChallenges = allChallenges.map(async (challenge) => {
		const { date, userId, name, highscores } = challenge;
		const highscoreDisplayName = highscores[0]
			? await getDisplayName(highscores[0].userId)
			: null;
		const highscore = highscores[0]
			? {
					date: highscores[0].date,
					score: highscores[0].score,
					displayName: highscoreDisplayName,
			  }
			: null;
		const creator = await getDisplayName(userId);
		return {
			challengeId: challenge.challengeId,
			date: date.toDate().toString().slice(0, 15),
			creator,
			name,
			highscore,
		};
	});

	allChallenges = await Promise.all(allChallenges);
	res.json(allChallenges);
};

const getChallenge = async (req, res) => {
	const { challengeId } = req.body;
	const challenge = await getChallengeFunction(challengeId);
	if (challenge.error) {
		res.error({ error });
	} else {
		res.json(challenge);
	}
};

const getChallengeFunction = async (challengeId) => {
	return await database
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
				const newHighscores = await Promise.all(
					highscores.map(async (highscore) => {
						const displayName = await getDisplayName(
							highscore.userId
						);
						return {
							displayName,
							score: highscore.score,
							date: highscore.date
								.toDate()
								.toString()
								.slice(0, 15),
						};
					})
				);
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
				return challenge;
			}
		})
		.catch((err) => {
			return { error: err.message };
		});
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

const getDisplayName = async (userId) => {
	if (!userId) {
		userId = "Anonymous";
	}
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
	addChallenge,
	getDisplayName,
	getChallengeFunction,
};
