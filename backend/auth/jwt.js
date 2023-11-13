const jwt = require('jsonwebtoken');
const secretKey = 'MyToKeN'; // Replace with a secret key for your application.

// Sample user data (in a real application, you would fetch this from a database)
const user = {
  id: 123,
  username: 'exampleuser',
  role: 'user',
};

// Create a JWT token when the user logs in (typically during authentication)
const token = jwt.sign(user, secretKey, { expiresIn: '1h' });

// The token is then sent to the client (e.g., as a response to a successful login request)
console.log('JWT token:', token);

// On the client side, the token can be stored securely (e.g., in a cookie or local storage) for future use.

// When the user makes authenticated requests, the token is included in the HTTP headers.
// For example, using the 'Authorization' header:
// Authorization: Bearer <token>

// On the server side, you can validate and decode the token to identify the user.

// Sample usage of token verification:
const userToken = token; // Replace with a valid token.
const decodedUser = verifyToken(userToken);

if (decodedUser) {
  console.log('User ID:', decodedUser.id);
  console.log('Username:', decodedUser.username);
  console.log('Role:', decodedUser.role);
} else {
  console.log('Invalid or expired token.');
}
