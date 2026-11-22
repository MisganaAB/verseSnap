class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Error description
   * @param {string} [code='INTERNAL_ERROR'] - Machine-readable error code
   * @param {Array<{field?: string, message: string}>} [details=[]] - Field-level error list
   */
  constructor(status, message, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
