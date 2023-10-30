const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/authMiddleware.js');
const bc = require('bcrypt');
const { db } = require('../server.js');

// Route for user registration
router.post('/register', async (req, res) => {
  const { email, fname, lname } = req.body;

  // Insert a new user into the User table
  const sql =
    'INSERT INTO User (password, email, fname, lname) VALUES (?, ?, ?, ?)';

  try {
    // Generate a salt and hash the password
    const salt = await bc.genSalt();
    const password = await bc.hash(req.body.password, salt);
    //password is now hashed

    const values = [password, email, fname, lname];
    //send to DB
    await db.promise().query(sql, values);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'User registration failed: ' + err });
  }
});

// Route for user login
router.post('/login', authMiddleware);

// GET a user by user_id, might be used to fetch contacts
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await db
      .promise()
      .query('SELECT * FROM User WHERE user_id = ?', [user_id]);
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

// Fetch Logged in User
router.get('/me', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  console.log('userId', userId);
  const user = await getUserById(userId);
  console.log('user', user);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// PUT (update) a user's information
router.put('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { email, fname, lname } = req.body;
  try {
    await db
      .promise()
      .query(
        'UPDATE User SET email = ?, fname = ?, lname = ? WHERE user_id = ?',
        [email, fname, lname, user_id]
      );
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getUserById(userId) {
  try {
    const user = await db
      .promise()
      .query('SELECT * FROM User WHERE user_id = ?', [userId]);
    if (user.length === 0) {
      return null;
    } else {
      return user[0];
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

module.exports = router;
