const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('Body parsing — string JSON fallback', () => {
  beforeAll(async () => {
    await request(app).post('/reset');
  });

  // ── POST /rest/api/2/issue ────────────────────────────────────────────────

  test('creates issue when body is JSON string with Content-Type application/json', async () => {
    const body = JSON.stringify({
      fields: { project: { key: 'MOCK' }, summary: 'string-body create test', issuetype: { name: 'Task' } },
    });
    const res = await request(app)
      .post('/rest/api/2/issue')
      .set({ ...AUTH, 'Content-Type': 'application/json' })
      .send(body);
    expect(res.status).toBe(201);
    expect(res.body.key).toMatch(/^MOCK-/);
  });

  test('creates issue when body is JSON string with Content-Type text/plain (worst case)', async () => {
    const body = JSON.stringify({
      fields: { project: { key: 'MOCK' }, summary: 'text-plain body test', issuetype: { name: 'Task' } },
    });
    const res = await request(app)
      .post('/rest/api/2/issue')
      .set({ ...AUTH, 'Content-Type': 'text/plain' })
      .send(body);
    // express.json() won't parse text/plain; fallback middleware must handle it
    expect(res.status).toBe(201);
    expect(res.body.key).toMatch(/^MOCK-/);
  });

  test('returns 400 when body is an invalid JSON string', async () => {
    const res = await request(app)
      .post('/rest/api/2/issue')
      .set({ ...AUTH, 'Content-Type': 'text/plain' })
      .send('this is not json');
    expect(res.status).toBe(400);
  });

  test('creates issue normally when body is a plain object (existing behaviour)', async () => {
    const res = await request(app)
      .post('/rest/api/2/issue')
      .set(AUTH)
      .send({ fields: { project: { key: 'MOCK' }, summary: 'object body test', issuetype: { name: 'Task' } } });
    expect(res.status).toBe(201);
    expect(res.body.key).toMatch(/^MOCK-/);
  });

  // ── POST /rest/api/2/issue/:key/transitions ───────────────────────────────

  test('executes transition when body is a JSON string', async () => {
    // Create a Task issue first
    const created = await request(app)
      .post('/rest/api/2/issue')
      .set(AUTH)
      .send({ fields: { project: { key: 'MOCK' }, summary: 'transition string-body test', issuetype: { name: 'Task' } } });
    const key = created.body.key;

    // Send body as serialised JSON string with Content-Type: application/json
    const body = JSON.stringify({
      fields: { resolution: { name: 'Completed' } },
      transition: { id: '61' },
      update: { comment: [{ add: { body: 'auto-closed' } }] },
    });
    const res = await request(app)
      .post(`/rest/api/2/issue/${key}/transitions`)
      .set({ ...AUTH, 'Content-Type': 'application/json' })
      .send(body);
    expect(res.status).toBe(204);

    // Verify the issue is now Closed
    const check = await request(app).get(`/rest/api/2/issue/${key}`).set(AUTH);
    expect(check.body.fields.status.name).toBe('Closed');
  });

  test('transition with string body also works for text/plain content type', async () => {
    const created = await request(app)
      .post('/rest/api/2/issue')
      .set(AUTH)
      .send({ fields: { project: { key: 'MOCK' }, summary: 'transition text/plain test', issuetype: { name: 'Task' } } });
    const key = created.body.key;

    const body = JSON.stringify({ transition: { id: '61' } });
    const res = await request(app)
      .post(`/rest/api/2/issue/${key}/transitions`)
      .set({ ...AUTH, 'Content-Type': 'text/plain' })
      .send(body);
    expect(res.status).toBe(204);
  });

  test('transition returns 400 when string body is invalid JSON', async () => {
    const created = await request(app)
      .post('/rest/api/2/issue')
      .set(AUTH)
      .send({ fields: { project: { key: 'MOCK' }, summary: 'transition invalid json test', issuetype: { name: 'Task' } } });
    const key = created.body.key;

    const res = await request(app)
      .post(`/rest/api/2/issue/${key}/transitions`)
      .set({ ...AUTH, 'Content-Type': 'text/plain' })
      .send('not json at all');
    expect(res.status).toBe(400);
  });
});
