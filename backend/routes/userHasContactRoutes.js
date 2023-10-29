const express = require('express');
const router = express.Router();

// Route for adding a new contact for a user
router.post('/user/contact', (req, res) => {
  const { userId, contactId } = req.body;

  // Insert a new user contact into the UserHasContact table
  const sql = 'INSERT INTO UserHasContact (user_id, contact_id) VALUES (?, ?)';

  // Use the database connection to execute the query
  db.query(sql, [userId, contactId], (err, results) => {
    if (err) {
      console.error('Error adding contact:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response
    res.json({ message: 'Contact added successfully' });
  });
});

// Route for fetching all contacts for a user
router.get('/user/contacts/:userId', (req, res) => {
  const userId = req.params.userId;

  // Query to retrieve all contacts for a user
  const sql = 'SELECT * FROM UserHasContact WHERE user_id = ?';

  // Use the database connection to execute the query
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user contacts:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the retrieved contacts as a JSON response
    res.json(results);
  });
});

// Route for removing a contact for a user
router.delete('/user/contact/:userId/:contactId', (req, res) => {
  const userId = req.params.userId;
  const contactId = req.params.contactId;

  // Delete the user contact from the UserHasContact table
  const sql = 'DELETE FROM UserHasContact WHERE user_id = ? AND contact_id = ?';

  // Use the database connection to execute the query
  db.query(sql, [userId, contactId], (err, results) => {
    if (err) {
      console.error('Error removing contact:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send a success response
    res.json({ message: 'Contact removed successfully' });
  });
});

// Other user contact-related routes can be added here
module.exports = router;
