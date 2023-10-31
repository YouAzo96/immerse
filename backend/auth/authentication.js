// This microservice handles user authentication and token issuance.
const mysql = require('mysql2');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bc = require('bcrypt');
const app = express();
const port = 3002;

// Create a MySQL connection
const db = mysql.createConnection({
  // host: 'sql9.freemysqlhosting.net', // Change to database host
  // user: 'sql9652386',      // Change to database user
  // password: 'NqHfNyamBY',  // Change to database password
  // database: 'sql9652386',  // Change to database name
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'immerse',
});

// Secret key for JWT token
const secretKey = 'MyToKeN';

app.use(bodyParser.json());

// Endpoint for user authentication
app.post('/auth', async (req, res) => {
  const { username, password } = req.body;
  // User Authentication:
  let user = null;
  try {
    const sql = 'SELECT * FROM user WHERE email = ?;';
    const [results, fields] = await db.promise().query(sql, [username]);

    if (results.length === 0) {
      return res.status(403).json({ error: 'User Not Found!' }); //'User not found!
    }
    user = results[0];
    if (!(await bc.compare(password, user.password))) {
      return res.status(404).json({ error: 'Credentials Missmatch' }); //Credentials Missmatch!
    }
  } catch (err) {
    return res.status(500).json({ error: err.message }); //'MYSQL Server Error'
  }
  // Generate a JWT token based on the user email and user_id
  const token = jwt.sign(
    {
      username: user.email,
      fname: user.fname,
      lname: user.lname,
    },
    secretKey,
    {
      expiresIn: '1h',
    }
  );

  return res.status(200).json({ token: token }); //user authenticated and token generated
});

app.listen(port, () => {
  console.log(`Authentication Microservice is running on port ${port}`);
});
