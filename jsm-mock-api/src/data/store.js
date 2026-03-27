const store = {
  tokens: [],
  issues: [],
  projects: [],
  transitions: {},
  approvals: [],
  assets: { schemas: [], object_types: [], objects: [] },
  customers: [],
  organizations: [],
  queues: [],
  sla_policies: [],
  webhooks: [],
  comments: [],
  worklogs: [],
  sessions: {},
  users: [],
  counters: { ITSM: 10, SEC: 3 },
  defaultToken: process.env.DEFAULT_API_TOKEN || 'pamlab-dev-token',
};

store.tokens.push({ token: store.defaultToken, user: 'admin', created: new Date().toISOString() });

module.exports = store;
