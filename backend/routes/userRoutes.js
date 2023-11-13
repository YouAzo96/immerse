const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/authMiddleware.js');
const bc = require('bcrypt');
const { db } = require('../server.js');
const request = require('request-promise');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Route for user registration
router.post('/register', async (req, res) => {
  const { email, fname, lname } = req.body;

  // Insert a new user into the User table
  const sql =
    'INSERT INTO User (password, email, fname, lname) VALUES (?, ?, ?, ?)';

  try {
    const sql1 = 'SELECT email FROM user WHERE email = ?;';
    const [results, fields] = await db.promise().query(sql1, [email]);
    if (results.length !== 0) {
      return res.status(405).json({ error: 'User Exists' }); //'User exists!
    }
    // Generate a salt and hash the password
    const salt = await bc.genSalt();
    const password = await bc.hash(req.body.password, salt);
    //password is now hashed

    const values = [password, email, fname, lname];
    //send to DB
    await db.promise().query(sql, values);

    req.body = { username: req.body.email, password: req.body.password };
    authMiddleware(req, res); //authenticate user after registration
  } catch (err) {
    return res.status(500).json({ error: 'User registration failed: ' + err });
  }
});

// Route for user login
router.post('/login', authMiddleware);
//Generate verification code for password reset process
router.post('/code-gen', async (req, res) => {
  try {
    const [resp, fields] = await db
      .promise()
      .query('SELECT user_id FROM User WHERE email = ?', [
        req.body.username ? req.body.username : req.body.email,
      ]);
    if (!resp[0]) {
      return res.status(403).json({ error: 'User not found' });
    } else {
      console.log(resp[0].user_id);
      //generate code and store in DB
      const verificationCode = generateVerificationCode();
      await db
        .promise()
        .query('UPDATE USER set verif_code= ? where user_id= ?;', [
          verificationCode,
          resp[0].user_id,
        ]);
      //Send Email to user with value of: verificationCode
      const mailOptions = {
        from: 'your_email@gmail.com',
        to: req.body.email,
        subject: 'Password Reset Verification Code',
        text: `Your verification code is: ${verificationCode}`,
      };

      //await transporter.sendMail(mailOptions); //send email.

      return res.status(200).json({
        success: 'Code Sent (valid for 15 min), Please Check Your Email',
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

//Forget password
router.post('/forget-pwd', async (req, res) => {
  const username = req.body.username ? req.body.username : req.body.email;
  const { password, verifCode } = req.body;
  try {
    const [dbresp, fields] = await db
      .promise()
      .query('SELECT user_id,verif_code FROM User WHERE email = ?', [username]);
    console.log();
    if (!dbresp[0]) {
      return res.status(403).json({ error: 'User Not Found!' });
    } else if (dbresp[0].verif_code === null) {
      return res
        .status(404)
        .json({ error: 'Please send verification code first!' });
    } else {
      if (dbresp[0].verif_code === verifCode) {
        // Generate a salt and hash the password
        const salt = await bc.genSalt();
        const newpassword = await bc.hash(password, salt);
        await db
          .promise()
          .query('UPDATE USER set password=? where user_id=?;', [
            newpassword,
            dbresp[0].user_id,
          ]);
        return res
          .status(200)
          .json({ success: 'Password Changed Successfully!' });
      } else {
        return res.status(403).json({ error: 'Invalid Verification Code!' });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

// GET a user by email

router.get('/me', async (req, res) => {
  const isValidUser = verifiedUser(req);
  if (!isValidUser) {
    return res.status(405).json({ error: 'Invalid Token' });
  }
  try {
    const user = await db
      .promise()
      .query('SELECT about,image FROM User WHERE email = ?', [
        isValidUser.username,
      ]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      return res.status(200).json(user[0]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

//Get Contacts
router.get('/contacts', async (req, res) => {
  const isValidUser = verifiedUser(req);
  if (!isValidUser) {
    return res.status(405).json({ error: 'Invalid Token' });
  }
  try {
    const [results, flds] = await db.promise().query(
      'SELECT u.user_id,u.fname,u.lname,u.email FROM user u \
        JOIN userhascontact uc ON u.user_id = uc.contact_id \
        WHERE uc.user_id = ?;',
      [isValidUser.user_id]
    );
    return res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

// PUT (update) a user's information
router.put('/update', async (req, res) => {
  const isValidUser = verifiedUser(req);
  if (!isValidUser) {
    return res.status(405).json({ error: 'Invalid Token' });
  }

  const { email, fname, lname } = req.body;
  try {
    await db
      .promise()
      .query(
        'UPDATE User SET email = ?, fname = ?, lname = ? WHERE email = ?',
        [email, fname, lname, isValidUser.username]
      );
    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

const verifiedUser = (req) => {
  const token = req.headers['authorization'].split(' ')[1].slice(0, -1);
  const isValidUser = jwt.verify(token, 'MyToKeN', (err, user) => {
    if (err) {
      return false;
    }
    return user;
  });
  return isValidUser;
};

const generateVerificationCode = () => {
  const code = crypto.randomBytes(2).toString('hex'); // Generate a 4-digit code
  return code;
};

module.exports = router;
