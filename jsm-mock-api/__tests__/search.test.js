const request = require('supertest');
const app = require('../src/server');

const AUTH = { Authorization: 'Bearer pamlab-dev-token' };

describe('Search — JQL filters', () => {
  let issueAlpha, issueBeta, issueBoth, issueNoLabels;

  beforeAll(async () => {
    await request(app).post('/reset');

    const r1 = await request(app).post('/rest/api/2/issue').set(AUTH).send({
      fields: { project: { key: 'TST' }, summary: 'Issue with label alpha', issuetype: { name: 'Task' }, labels: ['alpha'], priority: { name: 'Critical' } },
    });
    issueAlpha = r1.body.key;

    const r2 = await request(app).post('/rest/api/2/issue').set(AUTH).send({
      fields: { project: { key: 'TST' }, summary: 'Issue with label beta', issuetype: { name: 'Task' }, labels: ['beta'], priority: { name: 'Major' } },
    });
    issueBeta = r2.body.key;

    const r3 = await request(app).post('/rest/api/2/issue').set(AUTH).send({
      fields: { project: { key: 'TST' }, summary: 'Issue with both labels', issuetype: { name: 'Task' }, labels: ['alpha', 'beta'], priority: { name: 'Minor' } },
    });
    issueBoth = r3.body.key;

    const r4 = await request(app).post('/rest/api/2/issue').set(AUTH).send({
      fields: { project: { key: 'TST' }, summary: 'Issue with no labels', issuetype: { name: 'Task' }, labels: [] },
    });
    issueNoLabels = r4.body.key;
  });

  // ── project filter ────────────────────────────────────────────────────────

  test('filter by project = returns only matching project', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH).send({ jql: 'project = TST' });
    expect(res.status).toBe(200);
    expect(res.body.issues.length).toBeGreaterThanOrEqual(4);
    res.body.issues.forEach((i) => expect(i.key).toMatch(/^TST-/));
  });

  test('filter by project != excludes matching project', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH).send({ jql: 'project != TST' });
    expect(res.status).toBe(200);
    res.body.issues.forEach((i) => expect(i.key).not.toMatch(/^TST-/));
  });

  // ── status filter ─────────────────────────────────────────────────────────

  test('filter by status != Closed returns only open issues', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH).send({ jql: 'project = TST AND status != Closed' });
    expect(res.status).toBe(200);
    res.body.issues.forEach((i) => expect(i.fields.status.name).not.toBe('Closed'));
  });

  // ── priority IN ───────────────────────────────────────────────────────────

  test('filter by priority IN returns correct issues', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST AND priority IN (Critical, Major)' });
    expect(res.status).toBe(200);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).toContain(issueAlpha);   // Critical
    expect(keys).toContain(issueBeta);    // Major
    expect(keys).not.toContain(issueBoth); // Minor
  });

  // ── summary contains ──────────────────────────────────────────────────────

  test('filter by summary ~ (contains) returns matching issues', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH).send({ jql: 'summary ~ "label alpha"' });
    expect(res.status).toBe(200);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).toContain(issueAlpha);
    expect(keys).not.toContain(issueBeta);
  });

  // ── assignee IS EMPTY ─────────────────────────────────────────────────────

  test('filter by assignee IS EMPTY returns unassigned issues', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH).send({ jql: 'project = TST AND assignee IS EMPTY' });
    expect(res.status).toBe(200);
    res.body.issues.forEach((i) => expect(i.fields.assignee).toBeFalsy());
  });

  // ── ordering ──────────────────────────────────────────────────────────────

  test('ORDER BY created DESC returns issues in descending order', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST ORDER BY created DESC' });
    expect(res.status).toBe(200);
    const dates = res.body.issues.map((i) => i.fields.created);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  // ── pagination ────────────────────────────────────────────────────────────

  test('pagination with startAt and maxResults returns disjoint pages', async () => {
    const page1 = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST', startAt: 0, maxResults: 2 });
    const page2 = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST', startAt: 2, maxResults: 2 });
    expect(page1.body.issues.length).toBe(2);
    const keys1 = page1.body.issues.map((i) => i.key);
    const keys2 = page2.body.issues.map((i) => i.key);
    keys2.forEach((k) => expect(keys1).not.toContain(k));
  });

  // ── GET variant ───────────────────────────────────────────────────────────

  test('GET search with jql query param also works', async () => {
    const res = await request(app).get('/rest/api/2/search').set(AUTH)
      .query({ jql: 'project = TST AND summary ~ "label alpha"' });
    expect(res.status).toBe(200);
    expect(res.body.issues.map((i) => i.key)).toContain(issueAlpha);
  });

  // ── empty jql ─────────────────────────────────────────────────────────────

  test('empty jql returns all issues', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH).send({ jql: '' });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
  });

  // ── labels IN (array fix) ─────────────────────────────────────────────────

  test('labels IN matches issue with exactly that label', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST AND labels in ("alpha") AND status != Closed' });
    expect(res.status).toBe(200);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).toContain(issueAlpha);
  });

  test('labels IN matches issue that has the label among multiple labels', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST AND labels in ("alpha")' });
    expect(res.status).toBe(200);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).toContain(issueBoth);
  });

  test('labels IN does not match issue with a different label', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST AND labels in ("alpha")' });
    expect(res.status).toBe(200);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).not.toContain(issueBeta);
  });

  test('labels IN for second label matches correctly and excludes first', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST AND labels in ("beta")' });
    expect(res.status).toBe(200);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).toContain(issueBeta);
    expect(keys).not.toContain(issueAlpha);
  });

  test('labels IN does not match issue with empty labels', async () => {
    const res = await request(app).post('/rest/api/2/search').set(AUTH)
      .send({ jql: 'project = TST AND labels in ("alpha")' });
    expect(res.status).toBe(200);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).not.toContain(issueNoLabels);
  });

  test('combined project + labels IN + status != Closed works end-to-end', async () => {
    const res = await request(app).get('/rest/api/2/search').set(AUTH).query({
      jql: 'project in (TST) AND labels in ("alpha") AND status != Closed',
      maxResults: 500,
      startAt: 0,
    });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    const keys = res.body.issues.map((i) => i.key);
    expect(keys).toContain(issueAlpha);
    expect(keys).toContain(issueBoth);
    expect(keys).not.toContain(issueBeta);
    expect(keys).not.toContain(issueNoLabels);
  });
});
