const express = require('express');
const router = express.Router();

// Route for creating a new conversation
router.post('/', (req, res) => {
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
router.get('/', (req, res) => {
  // Query to retrieve all conversations
  const sql = 'SELECT * FROM Conversation where ';

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

// conv by user_id
// messages for conv_id
// add msgs to conv_id
// flush out messages and conv for user_id
//
module.exports = router;
