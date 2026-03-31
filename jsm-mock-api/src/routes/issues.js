const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const router = express.Router();
const BASE = `http://localhost:${process.env.PORT || 8448}`;

function findIssue(idOrKey) {
  return store.issues.find((i) => i.id === idOrKey || i.key === idOrKey);
}

function formatIssue(issue) {
  const comments = store.comments.filter((c) => c.issueKey === issue.key);
  const worklogs = store.worklogs.filter((w) => w.issueKey === issue.key);
  return {
    id: issue.id,
    key: issue.key,
    self: `${BASE}/rest/api/2/issue/${issue.id}`,
    fields: {
      ...issue.fields,
      comment: {
        total: comments.length,
        maxResults: comments.length,
        startAt: 0,
        comments: comments.map((c) => ({
          id: c.id,
          self: `${BASE}/rest/api/2/issue/${issue.key}/comment/${c.id}`,
          body: c.body,
          author: c.author,
          created: c.created,
          updated: c.updated,
        })),
      },
      worklog: {
        total: worklogs.length,
        maxResults: worklogs.length,
        startAt: 0,
        worklogs: worklogs.map((w) => ({
          id: w.id,
          self: `${BASE}/rest/api/2/issue/${issue.key}/worklog/${w.id}`,
          timeSpent: w.timeSpent,
          timeSpentSeconds: w.timeSpentSeconds,
          author: w.author,
          comment: w.comment,
          started: w.started,
        })),
      },
    },
  };
}

function fireWebhooks(event, issue) {
  store.webhooks.forEach((wh) => {
    if (wh.events.includes(event) || wh.events.includes('*')) {
      console.log(`[WEBHOOK] Firing ${event} to ${wh.url} for ${issue.key}`);
    }
  });
}

// GET /rest/api/2/issue/:issueIdOrKey
router.get('/:issueIdOrKey', (req, res) => {
  // Avoid matching sub-routes
  if (req.params.issueIdOrKey === 'createmeta') return res.json({ projects: store.projects });
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: [`Issue Does Not Exist`], errors: {} });
  res.json(formatIssue(issue));
});

// POST /rest/api/2/issue - Create
router.post('/', (req, res) => {
  const { fields } = req.body;
  if (!fields || !fields.summary)
    return res.status(400).json({ errorMessages: ['Field "summary" is required'], errors: {} });
  const projectKey =
    (fields.project &&
      (fields.project.key || store.projects.find((p) => p.id === fields.project.id)?.key)) ||
    'ITSM';
  if (!store.counters[projectKey]) store.counters[projectKey] = 0;
  store.counters[projectKey]++;
  const key = `${projectKey}-${store.counters[projectKey]}`;
  const id = String(10000 + store.issues.length + 1);
  const now = new Date().toISOString().replace('Z', '+0000');
  const issue = {
    id,
    key,
    fields: {
      summary: fields.summary,
      description: fields.description || '',
      issuetype: fields.issuetype || { id: '1', name: 'Incident' },
      priority: fields.priority || { id: '3', name: 'Major' },
      status: { id: '1', name: 'Open' },
      project: store.projects.find((p) => p.key === projectKey),
      assignee: fields.assignee || null,
      reporter:
        fields.reporter ||
        (req.jiraUser ? { key: req.jiraUser.key, displayName: req.jiraUser.displayName } : null),
      created: now,
      updated: now,
      labels: fields.labels || [],
      components: fields.components || [],
    },
  };
  store.issues.push(issue);
  fireWebhooks('jira:issue_created', issue);
  res.status(201).json({ id, key, self: `${BASE}/rest/api/2/issue/${id}` });
});

// PUT /rest/api/2/issue/:issueIdOrKey - Update
router.put('/:issueIdOrKey', (req, res) => {
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  const { fields } = req.body;
  if (fields) {
    Object.assign(issue.fields, fields);
    issue.fields.updated = new Date().toISOString().replace('Z', '+0000');
  }
  fireWebhooks('jira:issue_updated', issue);
  res.status(204).send();
});

// DELETE /rest/api/2/issue/:issueIdOrKey
router.delete('/:issueIdOrKey', (req, res) => {
  const idx = store.issues.findIndex(
    (i) => i.id === req.params.issueIdOrKey || i.key === req.params.issueIdOrKey,
  );
  if (idx === -1)
    return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  store.issues.splice(idx, 1);
  res.status(204).send();
});

// GET comments
router.get('/:issueIdOrKey/comment', (req, res) => {
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  const comments = store.comments.filter((c) => c.issueKey === issue.key);
  res.json({ startAt: 0, maxResults: comments.length, total: comments.length, comments });
});

// POST comment
router.post('/:issueIdOrKey/comment', (req, res) => {
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  const now = new Date().toISOString().replace('Z', '+0000');
  const comment = {
    id: uuidv4(),
    issueKey: issue.key,
    body: req.body.body,
    author: req.jiraUser || { key: 'admin', displayName: 'System Administrator' },
    created: now,
    updated: now,
  };
  store.comments.push(comment);
  res.status(201).json(comment);
});

// GET worklogs
router.get('/:issueIdOrKey/worklog', (req, res) => {
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  const worklogs = store.worklogs.filter((w) => w.issueKey === issue.key);
  res.json({ startAt: 0, maxResults: worklogs.length, total: worklogs.length, worklogs });
});

// POST worklog
router.post('/:issueIdOrKey/worklog', (req, res) => {
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  const now = new Date().toISOString().replace('Z', '+0000');
  const worklog = {
    id: uuidv4(),
    issueKey: issue.key,
    timeSpent: req.body.timeSpent || '1h',
    timeSpentSeconds: req.body.timeSpentSeconds || 3600,
    author: req.jiraUser || { key: 'admin', displayName: 'System Administrator' },
    comment: req.body.comment || '',
    started: req.body.started || now,
  };
  store.worklogs.push(worklog);
  res.status(201).json(worklog);
});

module.exports = router;
