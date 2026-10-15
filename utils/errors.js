function AppError(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode || 500;
}

module.exports = { AppError };
