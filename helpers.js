/** @format */

//find if user id exists
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

//return an object {shortUrl: longURL} to match previous database forms
const urlForUsers = function(userID, urlDatabase) {
  const newUrlDatabase = {};

  for (let shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      newUrlDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return newUrlDatabase;
};

const generateRandomString = function() {
  let result = "";
  let characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

module.exports = { findUserByEmail, urlForUsers, generateRandomString };
