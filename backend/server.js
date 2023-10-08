const express = require('express');
const mysql = require('mysql2/promise.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const authenticateToken = require('./auth/authMiddleware.js');
const errorHandler = require('./errorHandler.js');

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Create a MySQL pool connection
const db = mysql.createPool({
    host: 'localhost', // Change to database host
    user: 'root',      // Change to database user
    password: 'password',  // Change to database password
    database: 'immerse',  // Change to database name
  });
  
  module.exports = db; // Export the db connection pool


// app.use('/api/users', authenticateToken, (req, res) => {
//      // Check if the user has specific permissions
//     if (!userHasPermission(req.user)) {
//         const error = new Error('Permission Denied');
//         error.status = 403; // Forbidden
//         return next(error); // Pass the error to the error handling middleware
//     }
//     // Only accessible if the user is authenticated
//     res.json({ message: 'This is a protected route' });
//   });

// app.use(errorHandler);


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
app.use('/api/user-has-contact', userHasContactRoutes);
app.use('/api/conversation-participant', conversationHasParticipantRoutes);




// Create a route for testing the database connection
app.get('/test-db', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT 1 + 1 AS result');
      console.log('Database connection successful');
      res.json({ result: rows[0].result });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: 'Database connection error' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });