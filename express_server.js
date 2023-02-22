const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "2d3r4t": {
    id: "2d3r4t",
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
};

const generateRandomString = function() {
  let id = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return id;
};

const getUserByEmail = function(usersObj, submittedEmail) {
  let foundEmail = null;

  for (let userID in usersObj) {
    const email = users[userID].email;
    if (email === submittedEmail) {
      foundEmail = email;
    }
  }

  return foundEmail;
}

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
  const templateVars = {
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
  console.log(templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls/" + id);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('user_id', '2d3r4t' );
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('email');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }
  res.render("user_registration", templateVars, console.log(templateVars))
});

app.post("/register", (req, res) => {
  if (!req.body.email.length || !req.body.password.length) {
    return res.status(400).send('Please provide email and password');
  }

  let foundEmail = getUserByEmail(users, req.body.email);
  if(foundEmail) {
    return res.status(400).send(`${foundEmail} has already been registered`);
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});