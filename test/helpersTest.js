const { assert } = require('chai');
const { getUserByEmail, getUrlsForUser, isValidHTTPUrl } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: undefined
  }
};

describe('getUserByEmail', function() {
  it('should return a user with a valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it('should return null if an email being checked is not in the database', function() {
    const user = getUserByEmail("ducks@gmail.com", testUsers);
    assert.isNull(user);
  });
});

describe('getUrlsForUser', function() {
  it('should return only the URLs the user has created', function() {
    const userUrls = getUrlsForUser("userRandomID", testUrlDatabase);
    const expectedUrls = ["b2xVn2"];
    assert.deepEqual(userUrls, expectedUrls);
  });

  it('should not return a URL if it has been created by someone else', function() {
    const userUrls = getUrlsForUser("userRandomID", testUrlDatabase);
    const expectedFailUrls = ["9sm5xK"];
    assert.notDeepEqual(userUrls, expectedFailUrls);
  });
});