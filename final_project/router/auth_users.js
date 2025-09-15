const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    const userNameExists = users.filter((user) => user.username = username);
    return userNameExists.length > 0 ? false : true;
}

const authenticatedUser = (username, password) => {
    const validUsers = users.filter((user) => user.username === username && user.password === password);
    return validUsers.length > 0 ? true : false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    const username = req.session.authorization['username'];
    let bookToReview = books[isbn];

    bookToReview.reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    const username = req.session.authorization['username'];
    let bookToReview = books[isbn];

    delete bookToReview.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticated = regd_users;
