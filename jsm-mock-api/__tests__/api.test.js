const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('JSM Mock API', () => {
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
  test('POST /rest/auth/1/session login returns session', async () => {
    const res = await request(app).post('/rest/auth/1/session').send({ username: 'admin', password: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.session).toBeDefined();
  });

  test('POST /rest/auth/1/session bad creds returns 401', async () => {
    const res = await request(app).post('/rest/auth/1/session').send({ username: 'nonexistent', password: 'x' });
    expect(res.status).toBe(401);
  });

  // Auth required
  test('GET /rest/api/2/issue/TEST-1 without auth returns 401', async () => {
    const res = await request(app).get('/rest/api/2/issue/TEST-1');
    expect(res.status).toBe(401);
  });

  // Issues
  test('POST /rest/api/2/issue creates issue', async () => {
    const res = await request(app).post('/rest/api/2/issue').set(AUTH).send({
      fields: { project: { key: 'SD' }, summary: 'Test issue', issuetype: { name: 'Service Request' } }
    });
    expect(res.status).toBe(201);
    expect(res.body.key).toBeDefined();
  });

  test('GET /rest/api/2/issue/:key returns issue', async () => {
    const created = await request(app).post('/rest/api/2/issue').set(AUTH).send({
      fields: { project: { key: 'SD' }, summary: 'Fetch test', issuetype: { name: 'Bug' } }
    });
    const res = await request(app).get(`/rest/api/2/issue/${created.body.key}`).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.fields.summary).toBe('Fetch test');
  });

  test('GET /rest/api/2/issue/NONEXIST-999 returns 404', async () => {
    const res = await request(app).get('/rest/api/2/issue/NONEXIST-999').set(AUTH);
    expect(res.status).toBe(404);
  });

  // Search
  test('POST /rest/api/2/search returns results', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH).send({ jql: 'project=SD' });
    expect(res.status).toBe(200);
    expect(res.body.issues).toBeDefined();
  });

  test('GET /rest/api/2/search with jql returns results', async () => {
    const res = await request(app).get('/rest/api/2/search').set(AUTH).query({ jql: 'project=SD' });
    expect(res.status).toBe(200);
  });

  // Customers
  test('GET /rest/servicedeskapi/customer returns customers', async () => {
    const res = await request(app).get('/rest/servicedeskapi/customer').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Organizations
  test('GET /rest/servicedeskapi/organization returns orgs', async () => {
    const res = await request(app).get('/rest/servicedeskapi/organization').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Assets
  test('GET /rest/assets/1.0/objectschema/list returns schemas', async () => {
    const res = await request(app).get('/rest/assets/1.0/objectschema/list').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Webhooks
  test('GET /rest/api/2/webhook returns list', async () => {
    const res = await request(app).get('/rest/api/2/webhook').set(AUTH);
    expect(res.status).toBe(200);
  });

  // Transitions
  test('GET /rest/api/2/issue/:key/transitions returns transitions', async () => {
    const created = await request(app).post('/rest/api/2/issue').set(AUTH).send({
      fields: { project: { key: 'SD' }, summary: 'Transition test', issuetype: { name: 'Task' } }
    });
    const res = await request(app).get(`/rest/api/2/issue/${created.body.key}/transitions`).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.transitions).toBeDefined();
  });

  // 404
  test('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});
