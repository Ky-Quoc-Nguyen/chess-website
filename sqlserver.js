const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());


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
            res.redirect('http://127.0.0.1:5500/index.html#')
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log("Received credentials:", username, password);

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        console.log("Database query results:", results);
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            if (results[0].password === password) {
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.json({ success: false, message: 'Invalid username or password' });
            }
        } else {
            res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
});
