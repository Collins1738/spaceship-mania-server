const { database } = require("../utils/admin");

const makeGame = (req, res) => {
	const { size, numShips } = req.body;

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

	database
		.collection("singlePlayer")
		.add({ positions, size, numShips, tries: 5 })
		.then((doc) => {
			res.json({ gameId: doc.id });
		})
		.catch((err) => {
			res.status(500).json({ error: err.message });
		});
};

const deleteGame = (req, res) => {
	const { gameId } = req.body;
	// TODO
};

const getCorrectPositions = (req, res) => {
	const { gameId } = req.body;
	// TODO
};

const numOfCorrectPositions = (req, res) => {
	const { gameId, answers } = req.body;
	// TODO
};

module.exports = {
	makeGame,
	deleteGame,
	getCorrectPositions,
	numOfCorrectPositions,
};
