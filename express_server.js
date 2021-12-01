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
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};
const users = {
	//savein browser and validate if user
	userRandomID: {
		id: "userRandomID",
		email: "user@example.com",
		password: "purple-monkey-dinosaur",
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
		const user = users[user_id];
		if (user.email === email) {
			return user;
		}
	}
	return null;
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
	const user = users[id];
	const templateVars = {
		urls: urlDatabase,
		user,
	};
	res.render("urls_index", templateVars); //first argument is the file/template and second is the object we want to use
});

app.get("/login", (req, res) => {
	const user = null;
	res.render("urls_login", { user, error: null });
});

app.post("/login", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	if (!email || !password) {
		// return res.status(400).send("Please enter a valid email and password");
		return res.render("urls_registration", {
			user: null,
			error: "Try again: enter a valid email and password",
		});
	}
	const userExists = findUserByEmail(email);
	if (!userExists) {
		return res.status(403).send("User not found please register");
	}
	if (userExists.password !== password) {
		return res.status(403).send("Try again: wrong password");
	}
	res.cookie("user_id", userExists.id);
	return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
	// const id = req.body.user_id;
	// res.cookie("user_id", id);
	res.clearCookie("user_id");
	return res.redirect("/urls");
});

app.get("/register", (req, res) => {
	const user = null;
	res.render("urls_registration", { user, error: null });
});

app.post("/register", (req, res) => {
	console.log(req.body);
	const email = req.body.email;
	const password = req.body.password;
	if (!email || !password) {
		// return res.status(400).send("Please enter a valid email and password");
		res.status(400);
		return res.render("urls_registration", {
			user: null,
			error: "Try again: enter a valid email and password",
		});
	}
	const userExists = findUserByEmail(email);
	if (userExists) {
		return res.status(401).send("Try again: email already exists");
	}
	const id = generateRandomString(6);
	users[id] = { id, email, password };
	console.log("New users object", users);
	res.cookie("user_id", id);
	return res.redirect("/urls");
});

//create short url
app.post("/urls", (req, res) => {
	const shortURL = generateRandomString(6);
	urlDatabase[shortURL] = req.body.longURL;
	console.log(urlDatabase); // Log the POST request body to the console
	return res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
	const id = req.cookies.user_id;
	const user = users[id];
	res.render("urls_new", { user });
});

app.get("/urls/:shortURL", (req, res) => {
	const id = req.cookies.user_id;
	const user = users[id];
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL];
	console.log("shortURL", shortURL);
	console.log("longURL", longURL);
	const templateVars = { shortURL, longURL, user };
	res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
	const longURL = urlDatabase[req.params.shortURL];
	return res.redirect(longURL);
});

app.post("/urls/:shortURL/edit", (req, res) => {
	const id = req.cookies.user_id;
	const user = users[id];
	//urlDatabase[req.params.shortURL] = req.body.longURL;
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL];
	const templateVars = { shortURL, longURL, user };
	return res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
	const shortURL = req.params.shortURL;
	console.log(urlDatabase[shortURL]);
	delete urlDatabase[shortURL];
	return res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
	urlDatabase[shortURL] = req.body.longURL;
	console.log(req.params);
	console.log(urlDatabase);
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
