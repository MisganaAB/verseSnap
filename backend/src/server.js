require('dotenv').config();

const env = require('./config/env');
const app = require('./app');
const prisma = require('./config/database');

let server;

async function start() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL via Prisma');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }

  server = app.listen(env.PORT, () => {
    console.log(`VerseSnap API server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Performing graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      try {
        await prisma.$disconnect();
        console.log('Database connection disconnected');
      } catch (err) {
        console.error('Error disconnecting database:', err);
      }
      process.exit(0);
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      console.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

start();
