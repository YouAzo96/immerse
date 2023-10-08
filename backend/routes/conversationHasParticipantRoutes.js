const express = require('express');
const router = express.Router();

// Import the database connection
const db = require('../server.js'); // Update the path as needed

// Route for adding a participant to a conversation
router.post('/conversation/participant', (req, res) => {
  const { userId, convId } = req.body;

  // Insert a new participant into the ConversationHasParticipant table
  const sql = 'INSERT INTO ConversationHasParticipant (user_id, conv_id) VALUES (?, ?)';
  
  // Use the database connection to execute the query
  db.query(sql, [userId, convId], (err, results) => {
    if (err) {
      console.error('Error adding participant to conversation:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response
    res.json({ message: 'Participant added to conversation successfully' });
  });
});

// Route for fetching all participants in a conversation
router.get('/conversation/participants/:convId', (req, res) => {
  const convId = req.params.convId;

  // Query to retrieve all participants in a conversation
  const sql = 'SELECT * FROM ConversationHasParticipant WHERE conv_id = ?';
  
  // Use the database connection to execute the query
  db.query(sql, [convId], (err, results) => {
    if (err) {
      console.error('Error fetching conversation participants:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the retrieved participants as a JSON response
    res.json(results);
  });
});

// Other conversation participant-related routes can be added here

module.exports = router;
