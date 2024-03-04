const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Set up SQLite database
const db = new sqlite3.Database('data.db');

// Create a table for feedback data
db.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    reason TEXT
  )
`);

// Middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static('public'));

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the provided credentials match the hardcoded values
  if (username === 'user' && password === 'user') {
    res.json({ success: true, role: 'user' });
  } else if (username === 'admin' && password === 'admin') {
    res.json({ success: true, role: 'admin' });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Feedback form endpoint for user
app.post('/user/feedback', (req, res) => {
  const { title, reason } = req.body;

  // Insert feedback into the database
  db.run('INSERT INTO feedback (title, reason) VALUES (?, ?)', [title, reason], (err) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Error storing feedback' });
    } else {
      res.json({ success: true, message: 'Feedback submitted successfully' });
    }
  });
});

// Fetch feedback for admin
app.get('/admin/feedback', (req, res) => {
  // Retrieve all feedback from the database
  db.all('SELECT * FROM feedback', (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Error fetching feedback' });
    } else {
      res.json({ success: true, feedback: rows });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
