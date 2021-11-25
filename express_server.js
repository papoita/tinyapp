/** @format */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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
generateRandomString(6);

app.get("/", (req, res) => {
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
	res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
	res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
	console.log(req.params.shortURL);
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL];
	const templateVars = { shortURL, longURL };
	res.render("urls_show", templateVars);
});
//example variables exercise
// app.get("/set", (req, res) => {
// 	const a = 1;
// 	res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
// 	res.send(`a = ${a}`);
// });
app.post("/urls", (req, res) => {
	console.log(req.body); // Log the POST request body to the console
	res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
