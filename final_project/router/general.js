const express = require('express');
let books = require("./booksdb.js");
let users = require('./auth_users.js').users;
let isValid = require("./auth_users.js").isValid;
const public_users = express.Router();

const getBooksData = () => {
    return new Promise((resolve, reject) => {
        books ? resolve(books) : reject(new Error('Cannot fetch the books'));
    })
}


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({ message: `${username} successfully registered` });
        }
        else {
            return res.status(404).json({ error: 404, message: "Username already exists" });
        }
    }
    return res.status(404).json({ error: 404, message: "Unable to register user" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBooksData()
        .then((books) => res.status(200).send(JSON.stringify(books, null, 4)))
        .catch((e) => res.status(500).send({ message: e }))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBooksData()
        .then((books) => {
            if (books[isbn]) {
                return res.status(200).json(books[isbn]);
            }
            return res.status(404).json({ error: 404, message: "Book not found" });
        })
        .catch((e) => res.status(500).send({ message: e }))
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];
    getBooksData()
        .then((books) => {
            for (const isbn in books) {
                if (books[isbn].author === author) {
                    booksByAuthor.push(books[isbn]);
                }
            }
            return booksByAuthor.length > 0 ? res.status(200).json(booksByAuthor) : res.status(404).json({ error: 404, message: "Book not found" });
        })
        .catch((e) => res.status(500).send({ message: e }))
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksByTitle = [];
    getBooksData()
        .then((books) => {
            for (const isbn in books) {
                if (books[isbn].title === title) {
                    booksByTitle.push(books[isbn]);
                }
            }
            return booksByTitle.length > 0 ? res.status(200).json(booksByTitle) : res.status(404).json({ error: 404, message: "Book not found" });
        })
        .catch((e) => res.status(500).send({ message: e }))
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }
    return res.status(404).json({ error: 404, message: "Book not found" });
});

module.exports.general = public_users;
