const generateRandomString = function() {
  let id = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return id;
};

const getUserByEmail = function(submittedEmail, database) {
  let foundUser = null;

  for (let userID in database) {
    if (database[userID].email === submittedEmail) {
      foundUser = database[userID];
    }
  }

  return foundUser;
};

const getUrlsForUser = function(id, database) {
  const userUrlsArr = [];
  for (let url in database) {
    if (database[url].userID === id) {
      userUrlsArr.push(url);
    }
  }
  return userUrlsArr;
};

module.exports = { generateRandomString, getUserByEmail, getUrlsForUser };