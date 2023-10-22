const express = require('express');
const router = express.Router();

// Import the database connection (assuming it's named 'db' in server.js)
const db = require('../server.js'); // Update the path as needed

// Route for fetching messages by conversation ID
router.get('/:convId', (req, res) => {
  const convId = req.params.convId;

  // Query to retrieve messages for a specific conversation
  const sql = 'SELECT * FROM Message WHERE conv_id = ?';
  
  // Use the database connection to execute the query
  db.query(sql, [convId], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the retrieved messages as a JSON response
    res.json(results);
  });
});

// Route for sending a new message
router.post('/', (req, res) => {
  const { content, content_type, status, conv_id, sender_id } = req.body;

  // Insert a new message into the Message table
  const sql = 'INSERT INTO Message (content, content_type, status, conv_id, sender_id) VALUES (?, ?, ?, ?, ?)';
  const values = [content, content_type, status, conv_id, sender_id];

  // Use the database connection to execute the query
  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response
    res.json({ message: 'Message sent successfully' });
  });
});

// Route for updating a message's status
router.put('/:msgId', (req, res) => {
  const msgId = req.params.msgId;
  const { status } = req.body;

  // Update a message's status in the Message table
  const sql = 'UPDATE Message SET status = ? WHERE msg_id = ?';
  const values = [status, msgId];

  // Use the database connection to execute the query
  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error updating message status:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response
    res.json({ message: 'Message status updated successfully' });
  });
});

// Route for deleting a message
router.delete('/:msgId', (req, res) => {
  const msgId = req.params.msgId;

  // Delete a message from the Message table
  const sql = 'DELETE FROM Message WHERE msg_id = ?';
  
  // Use the database connection to execute the query
  db.query(sql, [msgId], (err, results) => {
    if (err) {
      console.error('Error deleting message:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response
    res.json({ message: 'Message deleted successfully' });
  });
});

// Other message-related routes can be added here

module.exports = router;
