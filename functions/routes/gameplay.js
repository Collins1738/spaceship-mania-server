const { admin, database } = require("../utils/admin");
const { getDisplayName } = require("./challenges");

const makeSinglePlayerGame = (req, res) => {
	const { size, numShips, userId } = req.body;

	let positions = [];
	let checkPositions = [];
	var i = 0;
	let position = null;
	if (numShips > Math.pow(size, 2)) {
		res.status(404).json({ message: "More ships than boards" });
		return;
	}
	while (i < numShips) {
		while (position == null || checkPositions.includes(checkPosition)) {
			var x = Math.round(Math.random() * 10) % size;
			var y = Math.round(Math.random() * 10) % size;
			position = { x, y };
			checkPosition = `${x}${y}`;
		}
		positions.push(position);
		checkPositions.push(checkPosition);
		i += 1;
	}
	const triesLeft = 10;

	// add to gameplay
	database
		.collection("gameplay")
		.add({
			positions,
			size,
			numShips,
			triesLeft,
			userId,
			made: admin.firestore.Timestamp.now(),
			mode: "SinglePlayer",
		})
		.then((doc) => {
			res.json({ gameId: doc.id, size, numShips, triesLeft });
		})
		.catch((err) => {
			res.status(500).json({ error: err.message });
		});

	// increment users numSinglePlayerGamesPlayed
	if (userId) {
		database
			.collection("users")
			.doc(userId)
			.get()
			.then((doc) => {
				doc.ref.update({
					numSinglePlayerGamesPlayed:
						doc.data().numSinglePlayerGamesPlayed + 1,
				});
			});
	}
};

const makeChallengeGame = (req, res) => {
	const { challengeId, userId } = req.body;
	console.log(challengeId, userId);
	database
		.collection("challenges")
		.doc(challengeId)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				res.status(400).json({ message: "Challenge doesn't exist" });
				return;
			} else {
				const { size, numShips, positions, tries } = doc.data();
				return { size, numShips, positions, tries };
			}
		})
		.then(({ size, numShips, positions, tries }) => {
			return database.collection("gameplay").add({
				positions,
				size,
				numShips,
				triesLeft: tries,
				userId,
				made: admin.firestore.Timestamp.now(),
				mode: "Challenge",
				challengeId: challengeId,
			});
		})
		.then((doc) => {
			res.json({ gameId: doc.id });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: err.message });
		});

	const doc = database.collection("users").doc(userId);
	doc.update({
		challengesPlayed: admin.firestore.FieldValue.arrayUnion({
			challengeId,
		}),
	}).catch((err) => {
		console.log(err.message);
	});
};

const getGameInfo = (req, res) => {
	const { gameId } = req.body;
	database
		.collection("gameplay")
		.doc(gameId)
		.get()
		.then((doc) => {
			if (doc.exists) {
				const { numShips, size, triesLeft, userId } = doc.data();
				res.json({ numShips, size, triesLeft, userId, gameId });
			} else {
				res.status(500).json({ message: "Game does not exist" });
			}
		})
		.catch((err) => res.status(400).json({ message: err.message }));
};

const getNumberCorrectPositions = async (req, res) => {
	const { gameId, answers } = req.body;
	var triesLeft, numShips, userId;
	const { correctPositions, mode, challengeId } = await database
		.collection("gameplay")
		.doc(gameId)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				res.status(404).json({ error: "Game does not exist" });
			} else {
				const { positions, mode, challengeId } = doc.data();
				triesLeft = doc.data().triesLeft;
				numShips = doc.data().numShips;
				userId = doc.data().userId;
				triesLeft -= 1;
				doc.ref.update({ triesLeft });
				return { correctPositions: positions, mode, challengeId };
			}
		});

	const checkCorrectPositions = correctPositions.map((position) => {
		return `${position.x}${position.y}`;
	});

	const checkAnswers = answers.map((position) => {
		return `${position.x}${position.y}`;
	});

	var count = 0;
	for (position of checkAnswers) {
		if (checkCorrectPositions.includes(position)) {
			count += 1;
		}
	}
	const gameWon = count == numShips;
	const gameOver = triesLeft == 0 || gameWon;
	const score = gameWon ? triesLeft * 5 + 1 : 0;

	if (gameOver) {
		deleteGame(gameId);
		if (mode == "SinglePlayer") {
			updateSinglePlayerHighscore(score, userId);
		} else if (mode == "Challenge") {
			updateChallengeHighscore(score, userId, challengeId);
			console.log("updating gp");
		}
	}

	res.json({
		triesLeft,
		numCorrect: count,
		numShips,
		gameOver,
		gameWon,
		positions: gameOver ? correctPositions : null,
		score,
	});
};

const endGame = async (req, res) => {
	const { gameId } = req.body;
	const { correctPositions } = await database
		.collection("gameplay")
		.doc(gameId)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				res.status(404).json({ error: "Game does not exist" });
			} else {
				const { positions } = doc.data();
				return { correctPositions: positions };
			}
		});

	const gameWon = false;
	const gameOver = true;
	const score = 0;

	deleteGame(gameId);

	res.json({
		gameOver,
		gameWon,
		positions: gameOver ? correctPositions : null,
		score,
	});
};

const deleteGame = (gameId) => {
	database
		.collection("gameplay")
		.doc(gameId)
		.delete()
		.catch((err) => console.log(err.message));
};

const getCorrectPositions = async (gameId) => {
	const correctPositions = await database
		.collection("gameplay")
		.doc(gameId)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				res.status(404).json({ error: "Game does not exist" });
			} else {
				return doc.data().positions;
			}
		});
	return correctPositions;
};

const test = (req, res) => {
	const answer = updateSinglePlayerHighscore(30, "JHoJASF5lPANBjVaev09");
	res.json(answer);
};

const updateSinglePlayerHighscore = async (score, userId) => {
	let date = admin.firestore.Timestamp.now();
	database
		.collection("users")
		.doc(userId)
		.get()
		.then((doc) => {
			if (doc.data().highscoreSinglePlayer < score) {
				doc.ref.update({ highscoreSinglePlayer: score });
			}
			return doc.data().displayName;
		})
		.catch((err) => res.status(500).json({ error: err.message }));
	const highscoreToAdd = { score, userId, date };
	database
		.collection("singlePlayer")
		.doc("highscores")
		.get()
		.then((doc) => {
			var { highscores, amount } = doc.data();
			if (highscores.length < amount) {
				highscores.push(highscoreToAdd);
				highscores.sort((a, b) => {
					return b.score - a.score;
				});
				doc.ref.update({ highscores });
			} else {
				if (highscores[amount - 1].score < highscoreToAdd.score) {
					highscores.push(highscoreToAdd);
					highscores.sort((a, b) => {
						return b.score - a.score;
					});
					highscores.pop();
					doc.ref.update({ highscores });
				}
			}
		});
	// TODO update Leaderboard
};

const updateChallengeHighscore = async (score, userId, challengeId) => {
	let date = admin.firestore.Timestamp.now();
	const highscoreToAdd = { score, userId, date };
	database
		.collection("challenges")
		.doc(challengeId)
		.get()
		.then((doc) => {
			var { highscores } = doc.data();
			const amount = 5;
			if (highscores.length < amount) {
				highscores.push(highscoreToAdd);
				highscores.sort((a, b) => {
					return b.score - a.score;
				});
				doc.ref.update({ highscores });
			} else {
				if (highscores[amount - 1].score < highscoreToAdd.score) {
					highscores.push(highscoreToAdd);
					highscores.sort((a, b) => {
						return b.score - a.score;
					});
					highscores.pop();
					doc.ref.update({ highscores });
				}
			}
		});
};

module.exports = {
	makeSinglePlayerGame,
	makeChallengeGame,
	getNumberCorrectPositions,
	test,
	getGameInfo,
	endGame,
};
