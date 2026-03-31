const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('ServiceNow Mock API', () => {
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
  test('POST /api/now/auth/token with Basic auth returns token', async () => {
    const res = await request(app).post('/api/now/auth/token')
      .set('Authorization', 'Basic ' + Buffer.from('admin:admin').toString('base64'));
    expect(res.status).toBe(200);
    expect(res.body.result.token).toBeDefined();
  });

  // Auth required
  test('GET /api/now/table/incident without auth returns 401', async () => {
    const res = await request(app).get('/api/now/table/incident');
    expect(res.status).toBe(401);
  });

  // Table API - incident
  test('GET /api/now/table/incident returns list', async () => {
    const res = await request(app).get('/api/now/table/incident').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

  test('POST /api/now/table/incident creates record', async () => {
    const res = await request(app).post('/api/now/table/incident').set(AUTH)
      .send({ short_description: 'Test incident', priority: '2' });
    expect(res.status).toBe(201);
    expect(res.body.result.sys_id).toBeDefined();
  });

  test('GET /api/now/table/incident/:sys_id returns record', async () => {
    const list = await request(app).get('/api/now/table/incident').set(AUTH);
    const sys_id = list.body.result[0].sys_id;
    const res = await request(app).get(`/api/now/table/incident/${sys_id}`).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.result.sys_id).toBe(sys_id);
  });

  test('PUT /api/now/table/incident/:sys_id updates record', async () => {
    const list = await request(app).get('/api/now/table/incident').set(AUTH);
    const sys_id = list.body.result[0].sys_id;
    const res = await request(app).put(`/api/now/table/incident/${sys_id}`).set(AUTH)
      .send({ short_description: 'Updated' });
    expect(res.status).toBe(200);
  });

  test('DELETE /api/now/table/incident/:sys_id deletes record', async () => {
    const created = await request(app).post('/api/now/table/incident').set(AUTH)
      .send({ short_description: 'To delete' });
    const sys_id = created.body.result.sys_id;
    const res = await request(app).delete(`/api/now/table/incident/${sys_id}`).set(AUTH);
    expect(res.status).toBe(204);
  });

  // Table API - change_request
  test('GET /api/now/table/change_request returns list', async () => {
    const res = await request(app).get('/api/now/table/change_request').set(AUTH);
    expect(res.status).toBe(200);
  });

  // CMDB
  test('GET /api/now/cmdb/topology returns topology', async () => {
    const res = await request(app).get('/api/now/cmdb/topology').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Catalog
  test('GET /api/now/catalog/items returns items', async () => {
    const res = await request(app).get('/api/now/catalog/items').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Incident convenience
  test('GET /api/now/incident/stats returns stats', async () => {
    const res = await request(app).get('/api/now/incident/stats').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Events
  test('GET /api/now/events/list returns list', async () => {
    const res = await request(app).get('/api/now/events/list').set(AUTH);
    expect(res.status).toBe(200);
  });

  // 404
  test('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  // Table 404
  test('GET /api/now/table/incident/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/now/table/incident/nonexistent-id').set(AUTH);
    expect(res.status).toBe(404);
  });
});
