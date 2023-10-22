const express = require('express');
const router = express.Router();
const mysql = require('mysql2'); // Import the MySQL library or ORM you're using
const db = require('../server.js')



// Route for user registration
router.post('/register', (req, res) => {
  const { user_id, password, email, fname, lname } = req.body;

  // Insert a new user into the User table
  const sql = 'INSERT INTO User (user_id, password, email, fname, lname) VALUES (?, ?, ?, ?, ?)';
  const values = [user_id, password, email, fname, lname];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.status(500).json({ error: 'User registration failed' });
    }
    return res.status(201).json({ message: 'User registered successfully' });
  });
});

// Route for user login
router.post('/login', (req, res) => {
  const { user_id, password } = req.body;

  // Check if the user credentials are valid (we'll need to implement this logic)
  // For example, query the User table to verify the user's existence and password

  // Assuming you've verified the user, generate a JWT token and send it in the response
  const token = generateJWT(user_id); // Implement this function to generate JWT

  res.status(200).json({ token });
});

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await db.promise().query('SELECT * FROM User');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET a user by user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await db.promise().query('SELECT * FROM User WHERE user_id = ?', [user_id]);
    if (user.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user[0]);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new user
router.post('/', async (req, res) => {
  const { user_id, password, email, fname, lname } = req.body;
  try {
    await db.promise().query('INSERT INTO User (user_id, password, email, fname, lname) VALUES (?, ?, ?, ?, ?)', [user_id, password, email, fname, lname]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT (update) a user's information
router.put('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { email, fname, lname } = req.body;
  try {
    await db.promise().query('UPDATE User SET email = ?, fname = ?, lname = ? WHERE user_id = ?', [email, fname, lname, user_id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Add more user-related routes as needed

module.exports = router;
