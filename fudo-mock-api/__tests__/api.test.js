const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('Fudo Mock API', () => {
  beforeAll(async () => {
    await request(app).post('/reset');
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/v2/health returns ok', async () => {
    const res = await request(app).get('/api/v2/health');
    expect(res.status).toBe(200);
  });

  test('POST /api/v2/auth/login with valid creds', async () => {
    const res = await request(app).post('/api/v2/auth/login').send({ login: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.session_token).toBeDefined();
  });

  test('POST /api/v2/auth/login bad creds returns 401', async () => {
    const res = await request(app).post('/api/v2/auth/login').send({ login: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('POST /api/v2/auth/login missing fields returns 422', async () => {
    const res = await request(app).post('/api/v2/auth/login').send({});
    expect(res.status).toBe(422);
  });

  test('GET /api/v2/users without auth returns 401', async () => {
    const res = await request(app).get('/api/v2/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/v2/users returns paginated list', async () => {
    const res = await request(app).get('/api/v2/users').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  test('GET /api/v2/users/:id returns user', async () => {
    const list = await request(app).get('/api/v2/users').set(AUTH);
    const id = list.body.items[0].id;
    const res = await request(app).get(`/api/v2/users/${id}`).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('POST /api/v2/users creates user', async () => {
    const res = await request(app).post('/api/v2/users').set(AUTH).send({ login: 'testuser', name: 'Test User', email: 'test@test.com' });
    expect(res.status).toBe(201);
    expect(res.body.login).toBe('testuser');
  });

  test('GET /api/v2/users/999 returns 404', async () => {
    const res = await request(app).get('/api/v2/users/999').set(AUTH);
    expect(res.status).toBe(404);
  });

  test('GET /api/v2/servers returns list', async () => {
    const res = await request(app).get('/api/v2/servers').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('POST /api/v2/servers creates server', async () => {
    const res = await request(app).post('/api/v2/servers').set(AUTH).send({ name: 'test-server', address: '10.0.0.1', protocol: 'ssh' });
    expect(res.status).toBe(201);
  });

  test('GET /api/v2/safes returns list', async () => {
    const res = await request(app).get('/api/v2/safes').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/accounts returns list', async () => {
    const res = await request(app).get('/api/v2/accounts').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/sessions returns list', async () => {
    const res = await request(app).get('/api/v2/sessions').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/groups returns list', async () => {
    const res = await request(app).get('/api/v2/groups').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/listeners returns list', async () => {
    const res = await request(app).get('/api/v2/listeners').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/pools returns list', async () => {
    const res = await request(app).get('/api/v2/pools').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/session-control/live returns live sessions', async () => {
    const res = await request(app).get('/api/v2/session-control/live').set(AUTH);
    expect(res.status).toBe(200);
  });

  test('GET /api/v2/events returns events', async () => {
    const res = await request(app).get('/api/v2/events').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/access-policies returns list', async () => {
    const res = await request(app).get('/api/v2/access-policies').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /api/v2/password-policies returns list', async () => {
    const res = await request(app).get('/api/v2/password-policies').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});
