const express = require('express');
const router = express.Router();

// Route for creating a new conversation
router.post('/', (req, res) => {
  const { id, name } = req.body;

  // Insert a new conversation into the Conversation table
  const sql = 'INSERT INTO Conversation VALUES (?,?)';

  // Use the database connection to execute the query
  db.query(sql, [id, name], (err, results) => {
    if (err) {
      console.error('Error creating conversation:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response with the ID of the created conversation
    return res.status(200).json({ conv_id: results.insertId });
  });
});

// Fetch All messages for a user_id:
router.get('/messages', (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT c.conv_id, m.*
  FROM conversation c
  JOIN conversationhasparticipant cp ON c.conv_id = cp.conv_id
  JOIN message m ON c.conv_id = m.conv_id
  WHERE cp.user_id = ?';`;

  // Use the database connection to execute the query
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the retrieved conversations as a JSON response
    res.status(200).json(results);
  });
});

// conv by user_id
// add msgs to conv_id
// flush out messages and conv for user_id
//
module.exports = router;
