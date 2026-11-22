const { randomUUID } = require('crypto');

/**
 * Middleware that assigns a unique UUID to each incoming request,
 * attaches it to req.id, and sets the X-Request-Id response header.
 */
function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

module.exports = requestId;
