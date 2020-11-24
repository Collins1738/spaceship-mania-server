const { admin, database } = require("../utils/admin");

const makeSinglePlayerGame = (req, res) => {
	const { size, numShips, userId } = req.body;

	let positions = [];
	let checkPositions = [];
	var i = 0;
	let position = null;
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
		.add({ positions, size, numShips, triesLeft, userId })
		.then((doc) => {
			res.json({ gameId: doc.id, size, numShips, triesLeft });
		})
		.catch((err) => {
			res.status(500).json({ error: err.message });
		});

	// increment users numSinglePlayerGamesPlayed
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
};

const getGameInfo = (req, res) => {
	const { gameId } = req.body;
	database
		.collection("gameplay")
		.doc(gameId)
		.get()
		.then((doc) => {
			if (doc.exists) {
				const {
					numShips,
					size,
					triesLeft,
					userId,
					gameId,
				} = doc.data();
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
	const correctPositions = await database
		.collection("gameplay")
		.doc(gameId)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				res.status(404).json({ error: "Game does not exist" });
			} else {
				const { positions } = doc.data();
				triesLeft = doc.data().triesLeft;
				numShips = doc.data().numShips;
				userId = doc.data().userId;
				triesLeft -= 1;
				doc.ref.update({ triesLeft });
				return positions;
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
		// deleteGame(gameId);
		updateSinglePlayerHighscore(score, userId);
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
	const displayName = await database
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
	const highscoreToAdd = { score, displayName, date };
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

module.exports = {
	makeSinglePlayerGame,
	getNumberCorrectPositions,
	test,
	getGameInfo,
};
