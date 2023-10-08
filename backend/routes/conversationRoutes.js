const express = require('express');
const router = express.Router();

// Import the database connection
const db = require('../server.js'); // Update the path as needed

// Route for creating a new conversation
router.post('/conversations', (req, res) => {
  const { name } = req.body;

  // Insert a new conversation into the Conversation table
  const sql = 'INSERT INTO Conversation (name) VALUES (?)';
  
  // Use the database connection to execute the query
  db.query(sql, [name], (err, results) => {
    if (err) {
      console.error('Error creating conversation:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response with the ID of the created conversation
    res.json({ conversationId: results.insertId });
  });
});

// Route for fetching all conversations
router.get('/conversations', (req, res) => {
  // Query to retrieve all conversations
  const sql = 'SELECT * FROM Conversation';
  
  // Use the database connection to execute the query
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching conversations:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the retrieved conversations as a JSON response
    res.json(results);
  });
});

// Route for fetching a conversation by ID
router.get('/conversations/:convId', (req, res) => {
  const convId = req.params.convId;

  // Query to retrieve a conversation by ID
  const sql = 'SELECT * FROM Conversation WHERE conv_id = ?';

  // Use the database connection to execute the query
  db.query(sql, [convId], (err, results) => {
    if (err) {
      console.error('Error fetching conversation by ID:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the retrieved conversation as a JSON response
    if (results.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Other conversation-related routes can be added here

module.exports = router;
