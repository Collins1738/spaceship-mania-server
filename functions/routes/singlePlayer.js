const { database } = require("../utils/admin");

const getSinglePlayerLeaderboard = (req, res) => {
	database
		.collection("singlePlayer")
		.doc("highscores")
		.get()
		.then((doc) => {
			highscores = doc.data().highscores.map((highscore) => {
				return {
					displayName: highscore.displayName,
					score: highscore.score,
					date: highscore.date.toDate().toString().slice(0, 15),
				};
			});
			res.json(highscores);
		});
};

module.exports = {
	getSinglePlayerLeaderboard,
};
