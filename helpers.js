/** @format */

//helper function find if user exists
const findUserByEmail = (email, database) => {
	for (const user in database) {
		//const user = users[user_id];
		//console.log("test", users[user_id]);
		if (email === database[user].email) {
			return database[user];
		}
	}
	return undefined;
};

module.exports = { findUserByEmail };
