const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/authMiddleware.js');
const mysql = require('mysql2');
const bc = require('bcrypt');
const request = require('request-promise');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const EventEmitter = require('events');
const {
  dbConfig,
  secretKey,
  authServiceUrl,
  notificationsServiceUrl,
} = require('../envRoutes.js');

// Secret key for JWT token
const db = mysql.createPool(dbConfig);

const emitter = new EventEmitter();

// Route for user registration
router.post('/register', async (req, res) => {
  const { referrer, email, fname, lname } = req.body;

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
    //retrieve new user's ID:
    const [newUser_ID, flds] = await db
      .promise()
      .query('select user_id from user where email=?', [email]);
    // Emit a User Registration event
    emitter.emit('userRegistered', { email: email });

    if (referrer) {
      //If this registration was referred by someone
      const [res, fields] = await db
        .promise()
        .query('SELECT fname,lname from user where user_id= ?', [referrer]);
      if (res[0]) {
        await db
          .promise()
          .query('insert into invitations values(?,?)', [
            referrer,
            newUser_ID[0].user_id,
          ]);

        //send contact invitation from the referrer to the new user:
        emitter.emit('contactInvitation', {
          email: email,
          toName: fname,
          fromName: res[0].fname + ' ' + res[0].lname,
          senderId: referrer,
          receiverId: newUser_ID[0].user_id,
        });
      }
    }
    req.body = { email: req.body.email, password: req.body.password };
    //authenticate user after registration
    authMiddleware(req, res); //turn into an api call
  } catch (err) {
    return res.status(500).json({ error: 'User registration failed: ' + err });
  }
});

// Route for user login
router.post('/login', authMiddleware);

// Route for user login from lock screen
router.post('/verify', async (req, res) => {
  const requestOptions = {
    method: 'POST',
    uri: `${authServiceUrl}/verify`,
    body: req.body,
    headers: {
      authorization: req.headers['authorization'],
    },
    json: true,
  };

  await request(requestOptions)
    .then((response) => {
      if (response) {
        return res.status(200).json(response.message); //send token back to front end.
      } else {
        return res
          .status(400)
          .json({ error: 'Something went wrong | Redirect to login' });
      }
    })
    .catch((error) => {
      return res.status(500).json(error.error);
    });
});

router.post('/invite', async (req, res) => {
  //Jancel: This takes a token in headers and a 'refereeEmail' field in the body.
  try {
    const isValidUser = await verifiedUser(req);
    if (!isValidUser) {
      return res.status(401).json({ error: 'Invalid or Expired Token' });
    }
    const refereeEmail = req.body.refereeEmail;
    if (!refereeEmail)
      return res.status(405).json({ error: 'Missing Param [referee email]' });
    //check if user exist:
    const [referee, fields] = await db
      .promise()
      .query('SELECT user_id,fname,lname FROM User WHERE email = ?', [
        refereeEmail,
      ]);

    if (referee[0]) {
      await db
        .promise()
        .query('INSERT into invitations values(?,?)', [
          isValidUser.user_id,
          referee[0].user_id,
        ]);

      emitter.emit('contactInvitation', {
        email: refereeEmail,
        toName: referee[0].fname,
        fromName: isValidUser.fname + ' ' + isValidUser.lname,
        senderId: isValidUser.user_id,
        receiverId: referee[0].user_id,
      });
      return res
        .status(200)
        .json({ message: 'Invitation Sent', color: 'success' });
    } else {
      emitter.emit('invite-to-app', {
        email: refereeEmail,
        fromName: isValidUser.fname + ' ' + isValidUser.lname,
        senderId: isValidUser.user_id,
      });
      return res
        .status(200)
        .json({ message: 'Invitation Sent', color: 'success' });
    }
  } catch (error) {
    console.log('Internal Server Error: ' + error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error: ' + error, color: 'danger' });
  }
});

router.get('/accept-contact/:sender/:receiver', async (req, res) => {
  const sender = req.params.sender;
  const receiver = req.params.receiver;
  const [iscontact, fields] = await db.promise().query(
    'SELECT * from userhascontact where \
  (user_id = ? and contact_id = ?) or ((user_id = ? and contact_id = ?))',
    [sender, receiver, receiver, sender]
  );
  if (iscontact[0]) {
    return res.status(200).redirect('http://localhost:3000/');
  }
  await db
    .promise()
    .query('INSERT into userhascontact values(?,?)', [sender, receiver]);
  await db
    .promise()
    .query('delete from invitations where sender_id = ? and contact_id = ?;', [
      sender,
      receiver,
    ]);
  //send notification back to sender:
  const [Receiver, flds] = await db
    .promise()
    .query('Select fname,lname from user where user_id=?;', [receiver]);
  const [SenderDeviceToken, filds] = await db
    .promise()
    .query('Select subscription from user where user_id=?;', [sender]);

  //get deviceToken info or whatever Firebase FCM will need:
  emitter.emit('contactAdded', {
    message: {
      notification: {
        title: 'New Contact Added',
        body: `${Receiver[0].fname} ${Receiver[0].lname} Accepted Your Invitation!`,
      },
      subscription: SenderDeviceToken[0].subscription,
    },
  });
  return res.status(200).redirect('http://localhost:3000/');
});

router.get('/refuse-contact/:sender/:receiver', async (req, res) => {
  const sender = req.params.sender;
  const receiver = req.params.receiver;

  try {
    await db
      .promise()
      .query('DELETE from invitations where sender_id=? and contact_id=? ;', [
        sender,
        receiver,
      ]);
    return res.status(200).json('Invitation Deleted.');
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

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
      emitter.emit('verificationCode', {
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
  const email = req.body.email ? req.body.email : req.body.email;
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
    return res.status(500).json({ error });
  }
});

// GET a user by email

router.get('/me', async (req, res) => {
  try {
    const isValidUser = await verifiedUser(req);
    if (!isValidUser) {
      return res.status(401).json({ error: 'Invalid or Expired Token' });
    }
    const user = await db
      .promise()
      .query('SELECT about,image FROM User WHERE email = ?', [
        isValidUser.email,
      ]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user[0][0].image) {
      return res.status(200).json({ about: user[0][0].about, image: null });
    }
    const imageBuffer = user[0][0].image;
    if (!Buffer.isBuffer(imageBuffer)) {
      return res.status(500).json({ error: 'Invalid image format' });
    }
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const image = `data:image;base64,${base64Image}`;
    const userData = {
      about: user[0][0].about,
      image: image,
    };
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(error.status || 500).json({ error });
  }
});

//Get Contacts
router.get('/contacts', async (req, res) => {
  try {
    const isValidUser = await verifiedUser(req);
    if (!isValidUser) {
      return res.status(401).json({ error: 'Invalid or Expired Token' });
    }
    const sql = `
      SELECT u.user_id, u.fname, u.lname, u.email, u.last_seen, u.about, u.image FROM user u
      JOIN userhascontact uc ON u.user_id = uc.contact_id
      WHERE uc.user_id = ?
      UNION
      SELECT u.user_id, u.fname, u.lname, u.email, u.last_seen, u.about, u.image FROM user u
      JOIN userhascontact uc ON u.user_id = uc.user_id
      WHERE uc.contact_id = ?
    `;
    const [results] = await db
      .promise()
      .query(sql, [isValidUser.user_id, isValidUser.user_id]);

    const contacts = results.map((contact) => {
      if (Buffer.isBuffer(contact.image)) {
        const base64Image = Buffer.from(contact.image).toString('base64');
        contact.image = `data:image;base64,${base64Image}`;
      }
      return contact;
    });

    return res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error });
  }
});

//Get All pending messages from db:

router.get('/messages', async (req, res) => {
  try {
    const isValidUser = await verifiedUser(req);
    if (!isValidUser) {
      return res.status(401).json({ error: 'Invalid or Expired Token' });
    }
    const sql = `SELECT sender_id,msg from messages where receiver_id = ?;`;
    const [results, flds] = await db
      .promise()
      .query(sql, [isValidUser.user_id]);
    if (results) {
      console.log('results: ', results);

      await db
        .promise()
        .query('delete from messages where receiver_id = ?', [
          isValidUser.user_id,
        ]);
      return res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});
// PUT (update) a user's information: image or status
router.put('/update', async (req, res) => {
  try {
    const isValidUser = await verifiedUser(req);
    if (!isValidUser) {
      return res.status(401).json({ error: 'Invalid or Expired Token' });
    }
    const updates = [];
    const values = [];

    for (let key in req.body) {
      if (key === 'image') {
        updates.push(`${key} = ?`);
        values.push(Buffer.from(req.body[key], 'base64'));
      } else if (typeof req.body[key] === 'string') {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      } else {
        for (let subKey in req.body[key]) {
          updates.push(`${key}.${subKey} = ?`);
          values.push(req.body[key][subKey]);
        }
      }
    }

    values.push(isValidUser.user_id);

    const sql = `UPDATE User SET ${updates.join(', ')} WHERE user_id = ?`;

    await db.promise().query(sql, values);

    const [rows] = await db
      .promise()
      .query('SELECT * FROM User WHERE user_id = ?', [isValidUser.user_id]);
    const updatedUser = rows[0];

    const newToken = jwt.sign(
      {
        user_id: updatedUser.user_id,
        fname: updatedUser.fname,
        lname: updatedUser.lname,
        email: updatedUser.email,
      },
      secretKey,
      {
        expiresIn: '10hr',
      }
    );

    return res
      .status(200)
      .json({ message: 'User updated successfully', token: newToken });
  } catch (error) {
    console.log('Error in /update:', error);
    return res.status(500).json({ error });
  }
});

const verifiedUser = async (req) => {
  try {
    const token = req.headers['authorization'].split(' ')[1].replace(/"/g, '');
    const isValidUser = jwt.verify(token, secretKey);
    return isValidUser;
  } catch (error) {
    console.log('Token Error: ', error.name);
    return false;
  }
};

const generateVerificationCode = () => {
  const code = crypto.randomBytes(2).toString('hex'); // Generate a 4-digit code
  return code;
};

//**************************************/
//Events handlers for notifications api
//**************************************/

let notificationServiceEndPoint = {
  url: `${notificationsServiceUrl}/notify`,
  method: 'POST',
};

emitter.on('contactAdded', async (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'contactAdded';

  await request(notificationServiceEndPoint)
    .then((response) => {
      console.log('Event sent successfully:', response);
    })
    .catch((error) => {
      console.error('Error sending contactAdded event:', error);
    });
  delete notificationServiceEndPoint.json; //reset endpoint
});

emitter.on('verificationCode', (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'verificationCode';
  request(notificationServiceEndPoint, (error, response, body) => {
    if (error) {
      console.error('Error sending verificationCode event:', error.message);
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
      console.error('Error sending userRegistered event:', error.message);
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
      console.error('Error sending passwordChanged event:', error.message);
    } else {
      console.log('passwordChanged event sent successfully:', response);
    }
  });
  delete notificationServiceEndPoint.json;
});

emitter.on('invite-to-app', (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'invite-to-app'; //modify
  request(notificationServiceEndPoint, (error, response, body) => {
    if (error) {
      console.error('Error sending invite-to-app event:', error);
    } else {
      console.log('invite-to-app event sent successfully:', response);
    }
  });
  delete notificationServiceEndPoint.json;
});

emitter.on('contactInvitation', (eventData) => {
  notificationServiceEndPoint.json = eventData;
  notificationServiceEndPoint.json.eventType = 'contactInvitation'; //modify
  request(notificationServiceEndPoint, (error, response, body) => {
    if (error) {
      console.error('Error sending contactInvitation event:', error.message);
    } else {
      console.log('contactInvitation event sent successfully:', response);
    }
  });
  delete notificationServiceEndPoint.json;
});

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
