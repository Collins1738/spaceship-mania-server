const { admin, db, fb } = require("../utils/admin");

const config = require("../utils/config");

const signup = async (req, res) => {
	const { email, password } = req.body;
};

const login = (req, res) => {
	const { email, password } = req.body;
};

module.exports = { signup, login };
