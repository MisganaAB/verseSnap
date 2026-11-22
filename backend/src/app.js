const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require('./config/env');
const requestId = require('./middleware/requestId');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// 1. Request correlation ID
app.use(requestId);

// 2. Security headers
app.use(helmet());

// 3. CORS configuration with explicit origin and credentials
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// 4. Request body parsing with safe 1mb limit
app.use(express.json({ limit: '1mb' }));

// 5. CSRF Protection Mount Point
// NOTE: CSRF protection middleware (e.g. csurf / custom double-submit cookie)
// will be mounted here for state-mutating endpoints once authentication is introduced.

// 6. API Route mounting
app.use('/api/v1', routes);

// 7. 404 handler
app.use(notFound);

// 8. Global centralized error handler
app.use(errorHandler);

module.exports = app;
