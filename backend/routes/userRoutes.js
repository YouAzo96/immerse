const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/authMiddleware.js');
const bc = require('bcrypt');
const { db } = require('../server.js');
const request = require('request-promise');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { log } = require('console');
const EventEmitter = require('events');
const emitter = new EventEmitter();

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
    // Emit a User Registration event
    emitter.emit('userRegistered', { email: email });

    req.body = { username: req.body.email, password: req.body.password };
    //authenticate user after registration
    authMiddleware(req, res); //turn into an api call
  } catch (err) {
    return res.status(500).json({ error: 'User registration failed: ' + err });
  }
});

// Route for user login
router.post('/login', authMiddleware);
//Generate verification code for password reset process
router.post('/code-gen', async (req, res) => {
  try {
    const email = req.body.username ? req.body.username : req.body.email;
    const [resp, fields] = await db
      .promise()
      .query('SELECT user_id FROM User WHERE email = ?', [email]);
    if (!resp[0]) {
      return res.status(403).json({ error: 'User not found' });
    } else {
      //generate code and store in DB
      const verificationCode = generateVerificationCode();
      await db
        .promise()
        .query('UPDATE USER set verif_code= ? where user_id= ?;', [
          verificationCode,
          resp[0].user_id,
        ]);
      //Send Email to user with value of: verificationCode
      await emitter.emit('verificationCode', {
        email: email,
        verificationCode: verificationCode,
      });
      deleteGeneratedCode(resp[0].user_id);
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
        emitter.emit('passwordChanged', {
          email: username,
        });
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
  const isValidUser = await verifiedUser(req);
  if (!isValidUser) {
    return res.status(405).json({ error: 'Invalid Or Expired Token' });
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
  const isValidUser = await verifiedUser(req);
  if (!isValidUser) {
    return res.status(405).json({ error: 'Invalid Or Expired Token' });
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

// PUT (update) a user's information: image or status
router.put('/update', async (req, res) => {
  const isValidUser = await verifiedUser(req);
  if (!isValidUser) {
    return res.status(405).json({ error: 'Invalid Or Expired Token' });
  }

  const { image, status } = req.body;
  try {
    let sql = '';
    let props = [];
    if (image) {
      sql = 'UPDATE User SET image = ? WHERE user_id = ?';
      props = [image, isValidUser.user_id];
    } else if (status) {
      sql = 'UPDATE User SET status = ?,  WHERE user_id = ?';
      props = [status, isValidUser.user_id];
    }
    await db.promise().query(sql, props);

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

const verifiedUser = async (req) => {
  const token = req.headers['authorization'].split(' ')[1].replace(/"/g, '');
  console.log(token);

  const isValidUser = await jwt.verify(token, 'MyToKeN', (err, user) => {
    if (err) {
      return false;
    } else {
      return user;
    }
  });
  return isValidUser;
};

const generateVerificationCode = () => {
  const code = crypto.randomBytes(2).toString('hex'); // Generate a 4-digit code
  return code;
};
//Events handlers for notifications api
let notificationServiceEndPoint = {
  url: 'http://localhost:3003/notify',
  method: 'POST',
};

emitter.on('contactAdded', async (eventData) => {
  console.log('Event triggered');
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'contactAdded';
  console.log(notificationServiceEndPoint);

  await request(notificationServiceEndPoint)
    .then((response) => {
      console.log('Event sent successfully:', response);
    })
    .catch((error) => {
      console.error('Error sending event:', error);
    });
  delete notificationServiceEndPoint.json; //reset endpoint
});

emitter.on('verificationCode', (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'verificationCode';
  request(notificationServiceEndPoint, (error, response, body) => {
    if (error) {
      console.error('Error sending event:', error.message);
    } else {
      console.log('Event sent successfully:', response);
    }
  });
  delete notificationServiceEndPoint.json;
});

emitter.on('userRegistered', (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'userRegistered'; //modify
  request(notificationServiceEndPoint, (error, response, body) => {
    if (error) {
      console.error('Error sending event:', error.message);
    } else {
      console.log('Event sent successfully:', response);
    }
  });
  delete notificationServiceEndPoint.json;
});

emitter.on('passwordChanged', (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'passwordChanged'; //modify
  request(notificationServiceEndPoint, (error, response, body) => {
    if (error) {
      console.error('Error sending event:', error.message);
    } else {
      console.log('passwordChanged event sent successfully:', response);
    }
  });
  delete notificationServiceEndPoint.json;
});
/*Template
emitter.on('eventname', (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'eventname'; //modify
  request(notificationServiceEndPoint, (error, response, body) => {
    if (error) {
      console.error('Error sending event:', error.message);
    } else {
      console.log('Event sent successfully:', response);
    }
  });
  delete notificationServiceEndPoint.json;
});
*/
async function deleteGeneratedCode(user_id) {
  const delay = new Promise((resolve) => setTimeout(resolve, 600000));
  await delay;
  try {
    await db
      .promise()
      .query('update user set verif_code = NULL where user_id = ?', [user_id]);
  } catch (error) {
    console.log('Internal Server Error: ' + error);
  }
}

module.exports = router;
