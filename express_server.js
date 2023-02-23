const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "2d3r4t"
  },
  "9sm5xK": {
    longURL: "http://www.google.com", 
    userID: undefined
  }
};

const users = {
  "2d3r4t": {
    id: "2d3r4t",
    email: "user@example.com", 
    password: "1234"
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

const getUserByEmail = function(submittedEmail) {
  let foundUser = null;

  for (let userID in users) {
    const email = users[userID].email;
    if (email === submittedEmail) {
      foundUser = users[userID];
    }
  }

  return foundUser;
}

const urlsForUser = function(id, pageTempateVariables) {
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      pageTempateVariables.urlsForUser.push(url)  
    }
  }
  return pageTempateVariables.urlsForUser;
};

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
    user: users[req.cookies["user_id"]],
    urlsForUser: []
  };
// console.log(templateVars.user);
  if (templateVars.user) {
    urlsForUser(templateVars.user.id, templateVars);
  }

  res.render("urls_index", templateVars, console.log(templateVars));
});

app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  if (!templateVars.user) return res.status(400).send(`Sign in to create new URLs`);

  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: templateVars.user.id
  }
  
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
    urls: urlDatabase,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]], 
    urlsForUser: []
  }

  if (!templateVars.user) {
    return res.status(400).send(`Sign in to view URLs`);
  }

  if (templateVars.user.id === urlDatabase[req.params.id].userID) {
    let validUrls = urlsForUser(templateVars.user.id, templateVars);
    console.log(validUrls);
    res.render("urls_show", templateVars);
  } else {
    return res.status(400).send(`Requested URL not in your catalog`);
  }
});

app.post("/urls/:id", (req, res) => {
  // urlDatabase[req.params.id].longURL = req.body.longURL;
  const templateVars = {
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]],
    urlsForUser: []
  };

  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"].id
  }
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  }

  if (!templateVars.urls[req.params.id]) {
    return res.status(400).send('Short URL id does not exist');
  }
 
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }

  if (templateVars.user) {
    return res.redirect("/urls");
  }

  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

  if (!submittedEmail || !submittedPassword) {
    return res.status(400).send('Please provide email and password');
  }

  let foundUser = getUserByEmail(submittedEmail);
  // console.log(foundUser);
  if(!foundUser) {
    return res.status(400).send(`Email is not registered`);
  }

  let userID = foundUser.id;
  let userPassword = foundUser.password;

  if (userPassword !== submittedPassword) {
    return res.status(400).send(`Password is incorrect`);
  }
  res.cookie('user_id', userID );
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }

  if (templateVars.user) {
    return res.redirect("/urls");
  }

  res.render("user_registration", templateVars)
});

app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

  if (!submittedEmail || !submittedPassword) {
    return res.status(400).send('Please provide email and password');
  }

  let foundEmail = getUserByEmail(submittedEmail);
  // console.log(foundEmail);
  if(foundEmail) {
    return res.status(400).send(`${foundEmail.email} has already been registered`);
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