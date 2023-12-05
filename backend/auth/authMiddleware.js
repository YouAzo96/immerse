const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const request = require('request-promise');
const { authServiceUrl, secretKey } = require('../envRoutes');

const { dbConfig } = require('../envRoutes.js');

// Secret key for JWT token
const db = mysql.createPool(dbConfig);

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
      .then(async (response) => {
        if (response.token) {
          flag = true;
          const user = jwt.decode(response.token);
          await db
            .promise()
            .query("update user set last_seen = 'online' where user_id =?", [
              user.user_id,
            ]);
          return res.status(200).json({ token: response.token, status: 200 }); //send token back to front end.
        }
      })
      .catch((error) => {
        flag = true;
        console.log('error: ', error);
        return res.status(400).json(error.error);
      });
  }
  if (!flag) {
    //Token received, we must verify it
    jwt.verify(token, secretKey, async (err, user) => {
      if (err) {
        //If token exists but invalid, return error and redirect to login page
        return res.status(403).json({ error: 'Forbidden | Invalid Token!' });
      }
      await db
        .promise()
        .query("update user set last_seen = 'online' where user_id =?", [
          user.user_id,
        ]);

      return res.status(200).json({ message: 'Valid Token' }); // redirect to dashboard on front end
    });
  }
}
module.exports = authenticateToken;
