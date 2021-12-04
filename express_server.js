/** @format */

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const {
	findUserByEmail,
	urlForUsers,
	generateRandomString,
} = require("./helpers.js");
const PORT = 8080; // default port 8080
const app = express();

app.use(morgan("short"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	cookieSession({
		name: "session",
		keys: ["key"],
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	})
);

app.set("view engine", "ejs"); //this is how we are processing views

//app.use(express.static("public"));//if wanted to have a css file static vs the dynamic ejs

const urlDatabase = {
	b6UTxQ: { longURL: "https://www.tsn.ca", userID: "JAZVA6" },
	i3BoGr: { longURL: "https://www.google.ca", userID: "JAZVA6" },
};

const users = {
	//savein browser and validate if user
	aJ48lW: {
		id: "aJ48lW",
		email: "1@1",
		hashedPassword: "1",
	},
	user2RandomID: {
		id: "user2RandomID",
		email: "user2@example.com",
		hashedPassword: "dishwasher-funk",
	},
	JAZVA6: {
		id: "JAZVA6",
		email: "2@2",
		hashedPassword:
			"$2b$10$Ymt2wBv7I.mrCrZcMKU/nO2xUuTe0G6qqcWlWKOzFMoWsWtEzt7Lu",
	},
};

app.get("/", (req, res) => {
	return res.redirect("/login");
});

//read main page
app.get("/urls", (req, res) => {
	const id = req.session.user_id;
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

app.post("/urls", (req, res) => {
	const shortURL = generateRandomString(6);
	urlDatabase[shortURL] = {
		longURL: req.body.longURL,
		userID: req.session.user_id,
	};
	//console.log(urlDatabase); // Log the POST request body to the console
	return res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
	const user = null;
	res.render("urls_login", { user, error: null });
});
//TODO comapre passwords
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
	const userExists = findUserByEmail(email, users);
	console.log("userExists", userExists);
	//	console.log("id", id);
	//console.log(userExists.id);

	if (!userExists) {
		res.status(403);
		return res.render("urls_login", {
			user: null,
			error: "Try again: user doesn't exist",
		});
	}
	//if (userExists.password !== password) {
	if (!bcrypt.compareSync(password, userExists.hashedPassword)) {
		res.status(403);
		return res.render("urls_login", {
			user: null,
			error: "Try again: password doesn't match",
		});
	}
	console.log("userexists?", userExists.id);
	req.session.user_id = userExists.id;
	return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
	req.session = null;
	return res.redirect("/");
});

app.get("/register", (req, res) => {
	const user = null;
	res.render("urls_registration", { user, error: null });
});
//TODO revise if database has to change, correct way to pass in the crypto
app.post("/register", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const hashedPassword = bcrypt.hashSync(password, 10);
	if (!email || !password) {
		res.status(401);
		return res.render("urls_registration", {
			user: null,
			error: "Try again: enter a valid email and password",
		});
	}
	const userExists = findUserByEmail(email, users);
	if (userExists) {
		res.status(403);
		return res.render("urls_registration", {
			user: null,
			error: "Try again: email already in use",
		});
	}
	const id = generateRandomString(6);
	users[id] = { id, email, hashedPassword }; //check this!!
	console.log("new objwect hashed", users[id]);
	req.session.user_id = id;
	return res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
	//const userExists = findUserByEmail();
	const id = req.session.user_id;
	const user = users[id];
	if (!user) {
		return res.redirect("/login");
	}

	res.render("urls_new", { user });
});

app.get("/urls/:shortURL", (req, res) => {
	const id = req.session.user_id;
	const user = users[id];

	const shortURL = req.params.shortURL;

	const longURL = urlDatabase[shortURL].longURL;

	const templateVars = { shortURL, longURL, user };
	return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL].longURL;
	return res.redirect(longURL);
});

app.post("/urls/:shortURL/edit", (req, res) => {
	const id = req.session.user_id;
	const shortURL = req.params.shortURL;
	if ((urlDatabase[shortURL].userID = id)) {
		urlDatabase[shortURL] = {
			longURL: req.body.longURL,
			userID: req.session.user_id,
		};
	}
	return res.redirect("/urls/:shortURL");
});

app.post("/urls/:shortURL/delete", (req, res) => {
	const id = req.session.user_id;
	const shortURL = req.params.shortURL;
	if ((urlDatabase[shortURL].userID = id)) {
		delete urlDatabase[shortURL];
	}
	return res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;

	urlDatabase[shortURL] = {
		longURL: req.body.longURL,
		userID: req.session.user_id,
	};
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
