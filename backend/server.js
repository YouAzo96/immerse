const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./errorHandler.js');
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

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
// Microservices URLs

const authServiceUrl = 'http://localhost:3002';
const conversationServiceUrl = 'http://localhost:3003';
const notificationServiceUrl = 'http://localhost:3004';

module.exports = { db, authServiceUrl };
app.use(errorHandler);

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

// Connect to the MySQL server
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  // db.end();
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
