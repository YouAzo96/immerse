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
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user credentials are valid by verifying the user's existence and password
  // You need to implement a database query to check if the user_id exists and the password matches
  let responseSent = false; //Flag to track whether a response has been sent
  try {
    const user = await db.promise().query('SELECT * FROM User WHERE email = ?', [email]);
    if (user.length === 0) {
      responseSent = true;
      res.status(404).json({ error: 'User not found' });
    } else {
      responseSent = true;
      if (user && user[0][0].password === password) {
        // User exists, and the password is correct
        res.status(200).json({ user: user });
      } else {
        // User doesn't exist or password is incorrect
        res.status(401).json({ error: 'Invalid username or password' });
      }
      user = user[0];
    }
  } catch (error) {
    if (!responseSent) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

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
  const { email } = req.params;
  console.log("user_id req: ", req.params);
  findUserInDatabase(email, res)
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

async function findUserInDatabase(email, res){
  let responseSent = false; //Flag to track whether a response has been sent
  try {
    const user = await db.promise().query('SELECT * FROM User WHERE email = ?', [email]);
    if (user.length === 0) {
      responseSent = true;
      res.status(404).json({ error: 'User not found' });
    } else {
      responseSent = true;
      res.json(user[0]);
    }
  } catch (error) {
    if (!responseSent) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = router;
