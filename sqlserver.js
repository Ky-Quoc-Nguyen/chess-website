const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();

// Set up database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'sqluser',
    password: 'password',
    database: 'chessClubDB'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('Connected to the database');
});

// Set up middleware, routes, etc.

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
