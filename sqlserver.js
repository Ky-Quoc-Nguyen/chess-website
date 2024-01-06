const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'sqluser', 
    password: 'password', 
    database: 'chessClubDB' 
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Error registering new user');
        } else {
            // Send a success response
            res.json({ success: true, message: 'Registration successful' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
