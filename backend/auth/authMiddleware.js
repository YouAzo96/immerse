const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Extract the token from the request headers or cookies
  const token = req.headers['authorization'] || req.cookies['access_token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify the token
  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Attach the user object to the request for later use
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  });
}

module.exports = authenticateToken;
