const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/response');

/**
 * Global error handling middleware.
 * Formats errors into the standard error envelope.
 * In production, never leaks internal stack traces or raw database messages.
 */
function errorHandler(err, req, res, _next) {
  const isProduction = process.env.NODE_ENV === 'production';
  const requestId = req.id || 'unknown';

  // Log error with contextual requestId
  console.error(`[Error] [RequestID: ${requestId}]`, err);

  // 1. Handled operational API errors
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.details, err.status);
  }

  // 2. Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, 'Validation failed', formattedErrors, 400);
  }

  // 3. Prisma Client known errors (e.g., unique constraint violations)
  if (err && err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const target = err.meta?.target ? ` on field: ${err.meta.target}` : '';
      return sendError(
        res,
        'A unique constraint violation occurred',
        [{ message: `Record already exists${target}` }],
        409
      );
    }
    if (err.code === 'P2025') {
      return sendError(
        res,
        'Record not found',
        [{ message: 'The requested record does not exist or has been removed' }],
        404
      );
    }
    // Generic Prisma database error in production
    const message = isProduction
      ? 'A database error occurred'
      : (err.message || 'Database operation failed');
    return sendError(res, message, [{ message: 'Database error' }], 400);
  }

  // 4. Fallback internal server error
  const statusCode = err.status || err.statusCode || 500;
  const message = isProduction
    ? 'Internal server error'
    : (err.message || 'An unexpected error occurred');

  return sendError(res, message, [], statusCode);
}

module.exports = errorHandler;
