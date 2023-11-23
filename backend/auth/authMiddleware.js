const jwt = require('jsonwebtoken');
const request = require('request-promise');
const authServiceUrl = 'http://localhost:3002';

//verification of tokens
async function authenticateToken(req, res) {
  const token =
    req.headers['authorization'] ||
    (req.cookies && req.cookies['access_token']);
  let flag = false;
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
          flag = true;
          return res.status(200).json({ token: response.token, status: 200 }); //send token back to front end.
        }
      })
      .catch((error) => {
        flag = true;
        return res.status(400).json(error.error);
      });
  }
  if (!flag) {
    //Token received, we must verify it
    jwt.verify(token, 'MyToKeN', async (err, user) => {
      if (err) {
        //If token exists but invalid, return error and redirect to login page
        return res.status(403).json({ error: 'Forbidden | Invalid Token!' });
      }
      return res.status(200).json({ message: 'Valid Token' }); // redirect to dashboard on front end
    });
  }
}
module.exports = authenticateToken;
