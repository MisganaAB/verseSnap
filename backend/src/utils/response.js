/**
 * Sends a standardized success envelope.
 * Envelope: { success: true, message: string, data: any }
 *
 * @param {import('express').Response} res
 * @param {any} [data=null]
 * @param {string} [message='Success']
 * @param {number} [status=200]
 */
function sendSuccess(res, data = null, message = 'Success', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends a standardized error envelope.
 * Envelope: { success: false, message: string, errors: Array<{ field?: string, message: string }> }
 *
 * @param {import('express').Response} res
 * @param {string} [message='An error occurred']
 * @param {Array<{field?: string, message: string}>} [errors=[]]
 * @param {number} [status=500]
 */
function sendError(res, message = 'An error occurred', errors = [], status = 500) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
