const express = require('express');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/v1/health
 * Public health check endpoint verifying the API is alive.
 */
router.get('/', (_req, res) => {
  const timestamp = new Date().toISOString();
  return sendSuccess(res, { timestamp }, 'VerseSnap API is running', 200);
});

module.exports = router;
