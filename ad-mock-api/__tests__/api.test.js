const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('AD Mock API', () => {
  beforeAll(async () => {
    await request(app).post('/reset');
  });

  // Health
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.domain).toBe('corp.local');
  });

  // Auth
  test('POST /api/ad/auth/bind returns token', async () => {
    const res = await request(app).post('/api/ad/auth/bind').send({ dn: 'cn=admin,dc=corp,dc=local', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  // Auth required
  test('GET /api/ad/users without auth returns 401', async () => {
    const res = await request(app).get('/api/ad/users');
    expect(res.status).toBe(401);
  });

  // Users
  test('GET /api/ad/users returns list', async () => {
    const res = await request(app).get('/api/ad/users').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.users).toBeDefined();
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  test('GET /api/ad/users/:sam returns user', async () => {
    const list = await request(app).get('/api/ad/users').set(AUTH);
    const sam = list.body.users[0].sAMAccountName;
    const res = await request(app).get(`/api/ad/users/${sam}`).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.sAMAccountName).toBe(sam);
  });

  test('POST /api/ad/users creates user', async () => {
    const res = await request(app).post('/api/ad/users').set(AUTH).send({
      sAMAccountName: 'testuser', cn: 'Test User', givenName: 'Test', sn: 'User',
      mail: 'testuser@corp.local', ou: 'OU=Users,DC=corp,DC=local'
    });
    expect(res.status).toBe(201);
  });

  test('GET /api/ad/users/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/ad/users/nonexistent999').set(AUTH);
    expect(res.status).toBe(404);
  });

  // Groups
  test('GET /api/ad/groups returns list', async () => {
    const res = await request(app).get('/api/ad/groups').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.groups).toBeDefined();
  });

  test('GET /api/ad/groups/:name returns group', async () => {
    const list = await request(app).get('/api/ad/groups').set(AUTH);
    const name = list.body.groups[0].cn;
    const res = await request(app).get(`/api/ad/groups/${name}`).set(AUTH);
    expect(res.status).toBe(200);
  });

  test('GET /api/ad/groups/:name/members returns members', async () => {
    const list = await request(app).get('/api/ad/groups').set(AUTH);
    const name = list.body.groups[0].cn;
    const res = await request(app).get(`/api/ad/groups/${name}/members`).set(AUTH);
    expect(res.status).toBe(200);
  });

  // OUs
  test('GET /api/ad/ous returns tree', async () => {
    const res = await request(app).get('/api/ad/ous').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Computers
  test('GET /api/ad/computers returns list', async () => {
    const res = await request(app).get('/api/ad/computers').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.computers).toBeDefined();
  });

  // Domain
  test('GET /api/ad/domain returns info', async () => {
    const res = await request(app).get('/api/ad/domain').set(AUTH);
    expect(res.status).toBe(200);
  });

  // User groups
  test('GET /api/ad/users/:sam/groups returns groups', async () => {
    const list = await request(app).get('/api/ad/users').set(AUTH);
    const sam = list.body.users[0].sAMAccountName;
    const res = await request(app).get(`/api/ad/users/${sam}/groups`).set(AUTH);
    expect(res.status).toBe(200);
  });
});
