const { admin } = require("./admin");

const firebaseAuthentication = (req, res, next) => {
	let idToken;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer ")
	) {
		idToken = req.headers.authorization.split("Bearer ")[1];
	} else {
		console.error("no auth token found in header");
		res.status(403).json({ error: "Unauthorzied" });
	}
	admin
		.auth()
		.verifyIdToken(idToken)
		.then((decodedToken) => {
			console.log(decodedToken);
			req.user = decodedToken;
			// req.user.uid should get you the UserID
		})
		.then(() => {
			return next();
		})
		.catch((err) => {
			console.log(`Error while verifying token ${err}`);
			res.status(403).json({ error: "Unauthorzied" });
		});
};

module.exports = { firebaseAuthentication };
