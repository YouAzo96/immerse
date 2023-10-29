const jwt = require('jsonwebtoken');
const request = require('request-promise');
const server = require('../server');
const authServiceUrl = server.authServiceUrl;

//verification of tokens
async function authenticateToken(req, res) {
  const token =
    req.headers['authorization'] ||
    (req.cookies && req.cookies['access_token']);

  if (!token) {
    //login credentials with no token
    //forward to auth microservice.
    const requestOptions = {
      method: 'POST',
      uri: `${authServiceUrl}/auth`,
      body: req.body,
      json: true,
    };

    await request(requestOptions)
      .then((response) => {
        if (response.token) {
          return res.status(200).json({ token: response.token, status: 200 }); //send token back to front end.
        }
      })
      .catch((error) => {
        return res.status(error.statusCode).json(error.error);
      });
  }

  //Token received, we must verify it
  jwt.verify(token, 'MyToKeN', (err, user) => {
    if (err) {
      //If token exists but invalid, return error and redirect to login page
      return res.status(403).end('Forbidden | Invalid Token!');
    }
    return res.status(200).end('Valid Token'); // redirect to dashboard on front end
  });
}
module.exports = authenticateToken;
