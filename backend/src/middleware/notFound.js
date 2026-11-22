const { sendError } = require('../utils/response');

/**
 * 404 Not Found fallback handler returning the standard error envelope.
 */
function notFound(req, res, _next) {
  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    [{ message: 'Resource not found' }],
    404
  );
}

module.exports = notFound;
