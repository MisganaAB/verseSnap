const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Provide fallback environment variables for test execution
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/versesnap_test?schema=public';
process.env.PORT = process.env.PORT || '5001';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = require('../src/app');

describe('Health API Endpoint Smoke Tests', () => {
  let server;
  let baseUrl;

  before((_, done) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  test('GET /api/v1/health returns 200 and matches the success envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.message, 'VerseSnap API is running');
    assert.ok(body.data, 'Response should contain a data field');
    assert.ok(body.data.timestamp, 'Response data should contain a timestamp');
    assert.ok(!isNaN(Date.parse(body.data.timestamp)), 'Timestamp must be a valid ISO string');
  });

  test('GET /unknown-route returns 404 with standard error envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/non-existent-route`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.message.includes('Route not found'));
    assert.ok(Array.isArray(body.errors));
    assert.equal(body.errors.length, 1);
  });
});
