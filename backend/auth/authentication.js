// This microservice handles user authentication and token issuance.
const mysql = require('mysql2');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bc = require('bcrypt');
const { dbConfig, secretKey } = require('../envRoutes');
const app = express();
const port = 3002;

// Create a MySQL connection
const db = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(bodyParser.json());

// Endpoint for user authentication
app.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  // User Authentication:
  let user = null;
  try {
    const sql =
      'SELECT user_id,email,fname,lname,password FROM user WHERE email = ?;';
    const [results, fields] = await db.promise().query(sql, [email]);

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
      user_id: user.user_id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
    },
    secretKey,
    {
      expiresIn: '10h',
    }
  );
  return res.status(200).json({ token: token }); //user authenticated and token generated
});
app.post('/verify', async (req, res) => {
  const { password } = req.body;
  try {
    const isValidUser = await verifiedUser(req);
    if (!isValidUser) {
      return res.status(405).json({ error: 'Invalid Or Expired Token' });
    }
    const sql = 'SELECT password FROM user WHERE user_id = ?;';
    const [results, fields] = await db
      .promise()
      .query(sql, [isValidUser.user_id]);

    if (results.length === 0) {
      return res.status(403).json({ error: 'User Not Found!' });
    }
    user = results[0];

    if (!(await bc.compare(password, user.password))) {
      return res.status(404).json({ error: 'Credentials Missmatch' });
    }
    return res.status(200).json({ message: 'Access Granted!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const verifiedUser = async (req) => {
  const token = req.headers['authorization'].split(' ')[1].replace(/"/g, '');
  const isValidUser = jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return false;
    } else {
      return user;
    }
  });
  return isValidUser;
};
app.listen(port, () => {
  console.log(`Authentication Microservice is running on port ${port}`);
});
