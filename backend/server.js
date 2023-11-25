const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./errorHandler.js');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { frontendServiceUrl, secretKey } = require('./envRoutes.js');
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
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const conversationHasParticipantRoutes = require('./routes/conversationHasParticipantRoutes');
const userHasContactRoutes = require('./routes/userHasContactRoutes');

// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/conversation/participant', conversationHasParticipantRoutes);

app.use(errorHandler);

//handle websockets
io.on('connection', async (socket) => {
  const token =
    socket.handshake.query.userId == 'null'
      ? null
      : socket.handshake.query.userId.slice(1, -1);
  //console.log('Backend: ' + token);
  if (!token) {
    return;
  }
  const user = await verifiedUser(token);
  const user_id = user.user_id;
  if (user_id) {
    const socketId = socket.id;
    const sql = 'update user set socket_id = ? where user_id = ?';
    db.promise()
      .execute(sql, [socketId, user_id])
      .then(() => {
        console.log(`User connected: ${user_id}, Socket ID: ${socketId}`);
      })
      .catch((error) => {
        console.error('Error storing socket information:', error);
      });
  }
  // Handle signaling events (offer, answer, ice candidates)
  socket.on('offer', (data) => {
    io.to(data.to).emit('offer', { from: socket.id, offer: data.offer });
  });

  socket.on('answer', (data) => {
    io.to(data.to).emit('answer', { from: socket.id, answer: data.answer });
  });

  socket.on('ice-candidate', (data) => {
    console.log('New ICE candidate: ' + data.iceCandidate);
    io.to(data.to).emit('ice-candidate', {
      from: socket.id,
      iceCandidate: data.iceCandidate,
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    if (user_id) {
      const sql = 'update user set socket_id = NULL WHERE user_id = ?';
      db.promise()
        .execute(sql, [user_id])
        .then(() => {
          console.log(`User disconnected: ${user_id}, Socket ID: ${socket.id}`);
        })
        .catch((error) => {
          console.error('Error removing socket information:', error);
        });
    }
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
