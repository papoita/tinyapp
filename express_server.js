/** @format */

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const PORT = 8080; // default port 8080
const app = express();

app.use(morgan("short"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs"); //this is how we are processing views

//app.use(express.static("public"));//if wanted to have a css file static vs the dynamic ejs

const urlDatabase = {
	b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
	i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = {
	//savein browser and validate if user
	aJ48lW: {
		id: "aJ48lW",
		email: "1@1",
		password: "1",
	},
	user2RandomID: {
		id: "user2RandomID",
		email: "user2@example.com",
		password: "dishwasher-funk",
	},
};
//helper function find if user exists
const findUserByEmail = (email) => {
	for (const user_id in users) {
		//const user = users[user_id];
		console.log("test", users[user_id]);
		if (users[user_id].email === email) {
			return users[user_id];
		}
	}
	return null;
};
//urlDatabase { shortURL, shortURL.longURL, shortURL.userID}

// const urlDatabase = {
// 	b2xVn2: "http://www.lighthouselabs.ca",
// 	"9sm5xK": "http://www.google.com",
// };

//helper function shoul return an object {shortUrl: longURL} to match our previous database forms
const urlForUsers = function (userID, urlDatabase) {
	const newUrlDatabase = {};

	for (let shortURL in urlDatabase) {
		if (userID === urlDatabase[shortURL].userID) {
			newUrlDatabase[shortURL] = urlDatabase[shortURL];
		}
	}
	return newUrlDatabase;
};

function generateRandomString() {
	var result = "";
	var characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

app.get("/", (req, res) => {
	//listen to get request / localhost8080
	res.send("Hello!");
});

app.get("/hello", (req, res) => {
	res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//read main page
app.get("/urls", (req, res) => {
	const id = req.cookies.user_id;
//	console.log(id);
	const user = users[id];
	//console.log(urlForUsers(id, urlDatabase));
	const templateVars = {
		urls: urlForUsers(id, urlDatabase),
		user,
	};
	if (!user) {
		return res.status(401).send("To view your tinyUrls please login first");
	}
	res.render("urls_index", templateVars);
});
//urlDatabase { shortURL, shortURL.longURL, shortURL.userID}

app.get("/login", (req, res) => {
	const user = null;
	res.render("urls_login", { user, error: null });
});

app.post("/login", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	if (!email || !password) {
		res.status(403);
		return res.render("urls_login", {
			user: null,
			error: "Try again: enter a valid email and password",
		});
	}
	const userExists = findUserByEmail(email);
	if (!userExists) {
		res.status(403);
		return res.render("urls_login", {
			user: null,
			error: "Try again: user doesn't exist",
		});
	}
	if (userExists.password !== password) {
		res.status(403);
			return res.render("urls_login", {
			user: null,
			error: "Try again: password doesn't match",
		});
	}
	res.cookie("user_id", userExists.id);
	return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
	res.clearCookie("user_id");
	return res.redirect("/urls");
});

app.get("/register", (req, res) => {
	const user = null;
	res.render("urls_registration", { user, error: null });
});

app.post("/register", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	if (!email || !password) {
		res.status(401);
		return res.render("urls_registration", {
			user: null,
			error: "Try again: enter a valid email and password",
		});
	}
	const userExists = findUserByEmail(email);
	if (userExists) {
			res.status(403);
		return res.render("urls_registration", {
			user: null,
			error: "Try again: email already in use",
		});
	}
	const id = generateRandomString(6);
	users[id] = { id, email, password };
	//console.log("New users object", users);
	res.cookie("user_id", id);
	return res.redirect("/urls");
});

//create short url
app.post("/urls", (req, res) => {
	const shortURL = generateRandomString(6);
	urlDatabase[shortURL] = {longURL: req.body.longURL, userID:req.cookies.user_id};
	//console.log(urlDatabase); // Log the POST request body to the console
	return res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
	//const userExists = findUserByEmail();
	const id = req.cookies.user_id;
	const user = users[id];
	if (!user) {
		return res.redirect("/login");
	}

	res.render("urls_new", { user });
});

app.get("/urls/:shortURL", (req, res) => {
	const id = req.cookies.user_id;
	const user = users[id];

const shortURL = req.params.shortURL;

	
	const longURL = urlDatabase[shortURL].longURL;
	
	const templateVars = { shortURL, longURL, user };
	return res.render("urls_show", templateVars);
	
});

app.get("/u/:shortURL", (req, res) => {
		//const id = req.cookies.user_id;
			const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL].longURL;
		urlDatabase[shortURL] = {longURL: req.body.longURL, userID:null};
	return res.redirect(longURL);
});

app.post("/urls/:shortURL/edit", (req, res) => {
	const id = req.cookies.user_id;
	const shortURL = req.params.shortURL;
if(urlDatabase[shortURL].userID = id){
	urlDatabase[shortURL] = {longURL: req.body.longURL, userID:req.cookies.user_id};
}	
return res.redirect("/urls/:shortURL");
});

app.post("/urls/:shortURL/delete", (req, res) => {
	const id = req.cookies.user_id;
	const shortURL = req.params.shortURL;
	if(urlDatabase[shortURL].userID = id){
delete urlDatabase[shortURL];
	}
	return res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;

urlDatabase[shortURL] = {longURL: req.body.longURL, userID:req.cookies.user_id};
	return res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

//catch all in case the page is not found
app.get("* ", (req, res) => {
	res.send("Page not found");
});
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
