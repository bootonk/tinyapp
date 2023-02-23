const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

//
// middleware
//
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cookieMonster',
  keys: ['key1']
}));

//
// databases
//
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
    encryptedPassword: "1234"
  },
};

//
// functions
//
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

const getUrlsForUser = function(id) {
  const urlsForUserArr = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urlsForUserArr.push(url)  
    }
  }
  return urlsForUserArr;
};

//
// routes
//
app.get("/", (req, res) => {
    if (!req.session.user_id) {
    return res.redirect("/login");
  }

  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('Please login');
  }
  
  // // keep a close eye on this
  // if (!users[req.session.user_id]) {
  //   return res.status(401).send('Login required');
  // }

  const userUrls = getUrlsForUser(req.session.user_id);

  res.render("urls_index", {
    urls: urlDatabase, 
    user: users[req.session.user_id],
    urlsForUser: userUrls
  });
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send(`Sign in to create new URLs`);
  }

  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  
  res.redirect("/urls/" + id);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new', {
    user: users[req.session.user_id]
  });
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send(`Sign in to view URLs`);
  }

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Short URL id does not exist');
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.status(403).send(`Requested URL not in your catalog`);
  }

  const userUrls = getUrlsForUser(req.session.user_id)
  
  res.render("urls_show", { 
    urls: urlDatabase,
    id: req.params.id, 
    user: users[req.session.user_id], 
    urlsForUser: userUrls
  });

});

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Cannot access non-existant file');
  }

  if (!req.session.user_id) {
    return res.status(401).send('Please login before accessing');
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.status(403).send(`Requested URL not in your catalog`);
  }
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Cannot delete non-existant file');
  }

  if (!req.session.user_id) {
    return res.status(401).send('Please login before deleting');
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.status(403).send(`Requested URL not in your catalog`);
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Short URL does not exist in database');
  }
 
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render("user_login", {
    urls: urlDatabase,
    user: null
  });
});

app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

  if (!submittedEmail || !submittedPassword) {
    return res.status(401).send('Please provide email and password');
  }

  let foundUser = getUserByEmail(submittedEmail);
  if(!foundUser) {
    return res.status(404).send(`Email is not registered`);
  }

  let userID = foundUser.id;
  let doesPasswordCheck = bcrypt.compareSync(submittedPassword, foundUser.encryptedPassword);

  if (!doesPasswordCheck) {
    return res.status(403).send(`Password is incorrect`);
  }

  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render("user_registration", { 
    user: null
  })
});

app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  if (!submittedEmail || !req.body.password) {
    return res.status(401).send('Please provide email and password');
  }
  
  let foundEmail = getUserByEmail(submittedEmail);
  if(foundEmail) {
    return res.status(409).send(`${foundEmail.email} has already been registered`);
  }
  
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();
  users[id] = {
    id,
    email: submittedEmail,
    encryptedPassword: hashedPassword
  }
  
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});