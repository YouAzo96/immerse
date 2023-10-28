const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
// const authenticateToken = require('./auth/authMiddleware.js');
const errorHandler = require('./errorHandler.js');

// Middleware
app.use(cors());
app.use(bodyParser.json());


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
  
  module.exports = db; // Export the db connection


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
app.use('/api/user/contact', userHasContactRoutes);
app.use('/api/conversation/participant', conversationHasParticipantRoutes);




// Connect to the MySQL server
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // You can now perform MySQL queries using the 'db' object

  // For example, to execute a simple query:
  db.query('SELECT 1 + 1 AS result', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    console.log('Query result:', results);
  });

  // Don't forget to close the db when you're done
  // db.end();
});
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });