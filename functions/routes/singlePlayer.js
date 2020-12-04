const { database } = require("../utils/admin");
const { getDisplayName } = require("./challenges");

const getSinglePlayerLeaderboard = async (req, res) => {
	database
		.collection("singlePlayer")
		.doc("highscores")
		.get()
		.then(async (doc) => {
			var highscores = doc.data().highscores.map((highscore) => {
				return {
					userId: highscore.userId,
					score: highscore.score,
					date: highscore.date.toDate().toString().slice(0, 15),
				};
			});
			highscores = highscores.map(async (highscore) => {
				const { userId, score, date } = highscore;
				const displayName = await getDisplayName(userId);
				return { displayName, score, date };
			});
			highscores = await Promise.all(highscores);
			res.json(highscores);
		});
};

module.exports = {
	getSinglePlayerLeaderboard,
};
