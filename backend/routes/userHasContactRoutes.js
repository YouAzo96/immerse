const express = require('express');
const router = express.Router();


// Route for adding a new contact for a user
router.post('/', (req, res) => {
  const { userId, contactId } = req.body;
  try{
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
  } catch (error) {
    console.log("Error occured in adding contact:", error);
    return res.status(500).json({ error: 'Internal Server Error' + error });
  }2
});

// Route for fetching all contacts for a user
router.get('/:userId', async (req, res) => {
  const isValidUser = await verifiedUser(req);
  if (!isValidUser) {
    return res.status(405).json({ error: 'Invalid Or Expired Token' });
  }
  try {
    const [results, flds] = await db.promise().query(
      'SELECT u.user_id,u.fname,u.lname,u.email FROM user u \
        JOIN userhascontact uc ON u.user_id = uc.contact_id \
        WHERE uc.user_id = ?;',
      [isValidUser.user_id]
    );
    return res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
});

// Route for removing a contact for a user
router.delete('/:userId/:contactId', (req, res) => {
  const userId = req.params.userId;
  const contactId = req.params.contactId;

  try{
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
    } catch (error) {
      console.log("Error occured in removing contact:", error);
      return res.status(500).json({ error: 'Internal Server Error' + error });
    }
  });

// Other user contact-related routes can be added here
module.exports = router;
