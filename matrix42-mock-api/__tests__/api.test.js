const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('Matrix42 ESM Mock API', () => {
  beforeAll(async () => {
    await request(app).post('/reset');
  });

  // Health
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('matrix42-mock-api');
  });

  // Auth
  test('POST /m42Services/api/ApiToken/GenerateAccessTokenFromApiToken/', async () => {
    const res = await request(app).post('/m42Services/api/ApiToken/GenerateAccessTokenFromApiToken/').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.RawToken).toBeDefined();
  });

  // Data - Objects
  test('POST /m42Services/api/data/objects/query returns results', async () => {
    const res = await request(app).post('/m42Services/api/data/objects/query').set(AUTH).send({ ddName: 'SPSUserClassBase' });
    expect(res.status).toBe(200);
  });

  // Meta
  test('GET /m42Services/api/meta/datadefinitions returns list', async () => {
    const res = await request(app).get('/m42Services/api/meta/datadefinitions').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Users
  test('GET /m42Services/api/users returns list', async () => {
    const res = await request(app).get('/m42Services/api/users').set(AUTH);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('POST /m42Services/api/users creates user', async () => {
    const res = await request(app).post('/m42Services/api/users').set(AUTH).send({ FirstName: 'Test', LastName: 'User', Email: 'test@example.com' });
    expect(res.status).toBe(201);
  });

  test('GET /m42Services/api/users/:id returns user', async () => {
    const list = await request(app).get('/m42Services/api/users').set(AUTH);
    const id = list.body.data[0].ID;
    const res = await request(app).get(`/m42Services/api/users/${id}`).set(AUTH);
    expect(res.status).toBe(200);
  });

  // Assets
  test('GET /m42Services/api/assets returns list', async () => {
    const res = await request(app).get('/m42Services/api/assets').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('POST /m42Services/api/assets creates asset', async () => {
    const res = await request(app).post('/m42Services/api/assets').set(AUTH).send({ Name: 'Test Laptop', Type: 'Laptop', SerialNumber: 'SN-TEST' });
    expect(res.status).toBe(201);
  });

  // Tickets
  test('GET /m42Services/api/tickets returns list', async () => {
    const res = await request(app).get('/m42Services/api/tickets').set(AUTH);
    expect(res.status).toBe(200);
  });

  test('POST /m42Services/api/tickets creates ticket', async () => {
    const res = await request(app).post('/m42Services/api/tickets').set(AUTH).send({ Subject: 'Test Ticket', Description: 'Test' });
    expect(res.status).toBe(201);
  });

  test('GET /m42Services/api/tickets/stats returns stats', async () => {
    const res = await request(app).get('/m42Services/api/tickets/stats').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Software
  test('GET /m42Services/api/software returns list', async () => {
    const res = await request(app).get('/m42Services/api/software').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Webhooks
  test('GET /m42Services/api/webhooks returns list', async () => {
    const res = await request(app).get('/m42Services/api/webhooks').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Reports
  test('GET /m42Services/api/reports/inventory returns report', async () => {
    const res = await request(app).get('/m42Services/api/reports/inventory').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Provisioning
  test('GET /m42Services/api/provisioning/workflows returns list', async () => {
    const res = await request(app).get('/m42Services/api/provisioning/workflows').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Access Requests
  test('GET /m42Services/api/access-requests returns list', async () => {
    const res = await request(app).get('/m42Services/api/access-requests').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Auth required
  test('GET /m42Services/api/users without auth returns 401', async () => {
    const res = await request(app).get('/m42Services/api/users');
    expect(res.status).toBe(401);
  });

  // 404
  test('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});
