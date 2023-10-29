function errorHandler(err, req, res, next) {
    console.error('Error:', err);
  
    // Determine the status code based on the error
    const statusCode = err.status || 500;
    
    // Send an error response with the status code and error message
    res.status(statusCode).json({ error: err.message || 'Internal Server Error' });
  }
  
  module.exports = errorHandler;
  