/** @format */

const express = require("express");
//const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //this is how we are processing views

//app.use(morgan("dev"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.static(__dirname + "/public"));

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

app.get("/", (req, res) => {
	//listen to get request / localhost8080
	res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
	res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
	const templateVars = { urls: urlDatabase };
	res.render("urls_index", templateVars); //first argument is the file/template and second is the object we want to use
});
app.post("/urls", (req, res) => {
	const shortURL = generateRandomString(6);
	urlDatabase[shortURL] = req.body.longURL;
	console.log(urlDatabase); // Log the POST request body to the console
	return res.redirect("/urls${shortURL}"); // Respond with 'Ok' (we will replace this)
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

//how to delete? test
app.post("/urls/:shortURL/delete", (req, res) => {
	// const shortURL = req.params.shortURL;
	// console.log(urlDatabase[shortURL]);
	// // delete urlDatabase[shortURL];
	// return res.redirect("/urls");
	console.log("testing");
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
