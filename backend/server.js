const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./errorHandler.js');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const request = require('request-promise');

const {
  frontendServiceUrl,
  secretKey,
  notificationsServiceUrl,
} = require('./envRoutes.js');
const app = express();
const port = process.env.PORT || 3001;
// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
//server to handle sockets
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: frontendServiceUrl,
    methods: ['GET', 'POST'],
  },
});

// Create a MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'immerse',
  connectionLimit: 10, // Adjust the limit based on your requirements
});

// Routes
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);

app.use(errorHandler);

app.post('/notify', async (req, res) => {
  const requestOptions = {
    method: 'POST',
    uri: `${notificationsServiceUrl}/subscribe`,
    body: req.body,
    json: true,
  };

  await request(requestOptions)
    .then((response) => {
      if (response.success) {
        console.log('subscription sent to notifications api');
        return res.status(200).json(response.success);
      } else {
        return res.status(400).json({ error: 'Failed to subscribe' });
      }
    })
    .catch((error) => {
      return res.status(500).json(error.error);
    });
});
//sockets store:
const sockets = new Map();

//handle websockets
io.on('connection', async (socket) => {
  const token =
    socket.handshake.query.userId == 'null'
      ? null
      : socket.handshake.query.userId;
  if (!token) {
    return;
  }

  const user = await verifiedUser(token);
  const user_id = user.user_id;
  if (user_id) {
    //add socket to store:
    sockets.set(user_id, socket);
    console.log('socket added for ', user_id, socket.id);
  }
  // Listen for chat messages
  socket.on('chat message', async (data) => {
    const { sender, receiver, message } = data; //stringify msg it at front end
    const contact_socket = sockets.get(receiver);
    if (contact_socket) {
      //contact has an open socket, emit msg to them:
      message.userType = 'receiver';
      contact_socket.emit('chat message', {
        sender: sender,
        message: message,
      });
    } else {
      //store to db:
      try {
        const [currentMsgsInDb, flds] = await db
          .promise()
          .query(
            'SELECT msg from messages where sender_id = ? and receiver_id= ?;',
            [sender, receiver]
          );
        if (currentMsgsInDb[0]) {
          //user already have msgs, add to them:
          const prevMsgs = currentMsgsInDb[0]['msg'];

          console.log('current msgs in db: ', currentMsgsInDb[0]['msg']);
          prevMsgs.push(message);
          console.log('new msg included: ', prevMsgs);
          await db
            .promise()
            .query(
              'UPDATE messages set msg = ? where (sender_id = ? and receiver_id = ?)',
              [JSON.stringify(prevMsgs), sender, receiver]
            );
        } else {
          //doesnt have saved msgs, start a new JSON wrapper object.
          const messages = [];
          messages.push(message);
          await db
            .promise()
            .query('INSERT into messages values (?,?,?)', [
              sender,
              receiver,
              JSON.stringify(messages),
            ]);
        }
      } catch (error) {
        console.log('Failed to save msgs: ', error);
      }
    }
  });
  // Handle user disconnect
  socket.on('disconnect', () => {
    if (user_id) {
      sockets.delete(user_id); //delete socket from store
    }
    console.log('socket deleted for ', user_id);
  });
});

const verifiedUser = async (token) => {
  const isValidUser = jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return false;
    } else {
      return user;
    }
  });
  return isValidUser;
};
// Start listening for incoming connections
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // You may want to add custom logging or other error handling here
  process.exit(1);
});
