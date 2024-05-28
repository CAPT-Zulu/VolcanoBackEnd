// Custom exception class to handle HTTP errors (Passes status code and message)
class HttpException extends Error {
  constructor(status, message) {
    // Call the parent constructor
    super(message);
    // Set the status code and message
    this.status = status;
    this.message = message;
  }
}

module.exports = HttpException;