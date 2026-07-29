const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);

  // Prisma Known Request Errors
  if (err.code === 'P2002') {
    return errorResponse(res, 'A record with this unique value already exists', 400);
  }
  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found', 404);
  }

  const statusCode = err.statusCode || res.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode >= 400 ? statusCode : 500);
}

module.exports = errorHandler;
