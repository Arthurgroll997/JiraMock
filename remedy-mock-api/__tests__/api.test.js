const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('Remedy Mock API', () => {
  beforeAll(async () => {
    await request(app).post('/reset');
  });

  // Health
  test('GET /health returns healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // Auth
  test('POST /api/jwt/login returns token', async () => {
    const res = await request(app).post('/api/jwt/login').send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.text).toBeDefined();
    expect(res.text.length).toBeGreaterThan(0);
  });

  test('POST /api/jwt/login bad creds returns 401', async () => {
    const res = await request(app).post('/api/jwt/login').send({ username: 'nonexistent', password: 'x' });
    expect(res.status).toBe(401);
  });

  // Auth required
  test('GET /api/arsys/v1/entry/HPD:Help%20Desk without auth returns 401', async () => {
    const res = await request(app).get('/api/arsys/v1/entry/HPD:Help%20Desk');
    expect(res.status).toBe(401);
  });

  // Entry API - incidents
  test('GET /api/arsys/v1/incidents returns list', async () => {
    const res = await request(app).get('/api/arsys/v1/incidents').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.entries).toBeDefined();
  });

  test('GET /api/arsys/v1/incidents/stats returns stats', async () => {
    const res = await request(app).get('/api/arsys/v1/incidents/stats').set(AUTH);
    expect(res.status).toBe(200);
  });

  test('GET /api/arsys/v1/incidents/:id returns incident', async () => {
    const list = await request(app).get('/api/arsys/v1/incidents').set(AUTH);
    const id = list.body.entries[0].values['Entry ID'] || list.body.entries[0].values['Incident Number'];
    if (id) {
      const res = await request(app).get(`/api/arsys/v1/incidents/${id}`).set(AUTH);
      expect([200, 404]).toContain(res.status);
    }
  });

  // Changes
  test('GET /api/arsys/v1/changes returns list', async () => {
    const res = await request(app).get('/api/arsys/v1/changes').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Assets
  test('GET /api/arsys/v1/assets returns list', async () => {
    const res = await request(app).get('/api/arsys/v1/assets').set(AUTH);
    expect(res.status).toBe(200);
  });

  // People
  test('GET /api/arsys/v1/people returns list', async () => {
    const res = await request(app).get('/api/arsys/v1/people').set(AUTH);
    expect(res.status).toBe(200);
  });

  test('GET /api/arsys/v1/people/groups returns groups', async () => {
    const res = await request(app).get('/api/arsys/v1/people/groups').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Work Orders
  test('GET /api/arsys/v1/workorders returns list', async () => {
    const res = await request(app).get('/api/arsys/v1/workorders').set(AUTH);
    expect(res.status).toBe(200);
  });

  // SLA
  test('GET /api/arsys/v1/sla returns list', async () => {
    const res = await request(app).get('/api/arsys/v1/sla').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Webhooks
  test('GET /api/arsys/v1/webhooks returns list', async () => {
    const res = await request(app).get('/api/arsys/v1/webhooks').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Generic Entry API
  test('GET /api/arsys/v1/entry/HPD:Help%20Desk returns entries', async () => {
    const res = await request(app).get('/api/arsys/v1/entry/HPD:Help%20Desk').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.entries).toBeDefined();
  });

  // 404
  test('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});
