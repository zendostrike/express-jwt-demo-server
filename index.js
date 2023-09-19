const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./verify-token');
const { secretKey } = require('./constants');
const { db } = require('./database');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/register', (req, res) => {
  const { name, lastName, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }


    db.run(
      'INSERT INTO users (email, password, name, lastName) VALUES (?, ?, ?, ?)',
      [email, password, name, lastName],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error registering user' });
        }

        const token = jwt.sign({ email, name, lastName }, secretKey, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
      }
    );
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

  res.status(200).json({ message: 'Login successful', token });
});

app.get('/user', verifyToken, (req, res) => {
  res.status(200).json(req.user);
});


app.get('/protected', verifyToken, (_, res) => {
  res.status(200).json({ message: 'OK, you have a valid token.' });
});

app.get('/userByEmail/:email', (req, res) => {
  const { email } = req.params;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      email: row.email,
    };

    res.status(200).json(user);
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});