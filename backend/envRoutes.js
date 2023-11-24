const secretKey = 'MyToKeN';

// Microservices URLs
const frontendServiceUrl = 'http://localhost:3000';
const gatewayServiceUrl = 'http://localhost:3001';
const authServiceUrl = 'http://localhost:3002';
const notificationsServiceUrl = 'http://localhost:3003';
const usersServiceUrl = 'http://localhost:3004';
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'immerse',
  connectionLimit: 10, // Adjust the limit based on your requirements
};
module.exports = {
  dbConfig,
  secretKey,
  frontendServiceUrl,
  gatewayServiceUrl,
  authServiceUrl,
  notificationsServiceUrl,
  usersServiceUrl,
};
