/** @format */

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const PORT = 8080; // default port 8080

const urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
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

const app = express();
app.use(morgan("short"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); //this is how we are processing views

//app.use(express.static(__dirname + "/public"));//if wanted to have a css file

app.get("/", (req, res) => {
	//listen to get request / localhost8080
	res.send("Hello!");
});

app.get("/hello", (req, res) => {
	res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//read main page
app.get("/urls", (req, res) => {
	const templateVars = {
		username: req.cookies["username"],
		urls: urlDatabase,
	};
	res.render("urls_index", templateVars); //first argument is the file/template and second is the object we want to use
});
app.post("/login", (req, res) => {
	const username = req.body.username;
	res.cookie("username", username);
	console.log(`username = ${username}`);
	return res.redirect("/urls");
});
//create short url
app.post("/urls", (req, res) => {
	const shortURL = generateRandomString(6);
	urlDatabase[shortURL] = req.body.longURL;
	console.log(urlDatabase); // Log the POST request body to the console
	return res.redirect("/urls/${shortURL}"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
	res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
	// : for dynamic purposes to req.params

	console.log(req.params.shortURL);
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL];
	const templateVars = { shortURL, longURL };
	res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
	const longURL = urlDatabase[req.params.shortURL];
	return res.redirect(longURL);
});

app.post("/urls/:shortURL/edit", (req, res) => {
	//urlDatabase[req.params.shortURL] = req.body.longURL;
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL];
	const templateVars = { shortURL, longURL };
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
