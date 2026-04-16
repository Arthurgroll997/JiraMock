const express = require('express');
const cors = require('cors');
const seed = require('./data/seed');
const authMiddleware = require('./middleware/auth');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.text({ type: ['text/plain', 'application/x-www-form-urlencoded'] }));
// Fallback: if body arrived as a raw string (e.g. requests lib with data= instead of json=),
// attempt JSON.parse so routes always receive a plain object.
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); } catch (_) { /* leave as-is */ }
  }
  next();
});

// --- Request Logging ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- Health & Admin ---
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'jsm-mock-api', timestamp: new Date().toISOString() });
});

app.post('/reset', (req, res) => {
  seed();
  res.json({ status: 'reset', service: 'jsm-mock-api' });
});

// --- Public Routes ---
app.use('/rest/auth/1/session', require('./routes/auth'));

// --- Auth Middleware ---
app.use('/rest', authMiddleware);

// --- Protected Routes (Jira REST API v2) ---
app.use('/rest/api/2/issue', require('./routes/issues'));
app.use('/rest/api/2/issue', require('./routes/transitions'));
app.use('/rest/api/2/search', require('./routes/search'));
app.use('/rest/api/2/webhook', require('./routes/webhooks'));
app.use('/rest/webhooks/1.0/webhook', require('./routes/webhooks'));
app.get('/rest/api/2/mypermissions', (req, res) => {
  res.json({
    permissions: {
      BROWSE_PROJECTS: { id: '10', key: 'BROWSE_PROJECTS', name: 'Browse Projects', type: 'PROJECT', description: 'Ability to browse projects', havePermission: true },
      CREATE_ISSUES: { id: '11', key: 'CREATE_ISSUES', name: 'Create Issues', type: 'PROJECT', description: 'Ability to create issues', havePermission: true },
      EDIT_ISSUES: { id: '12', key: 'EDIT_ISSUES', name: 'Edit Issues', type: 'PROJECT', description: 'Ability to edit issues', havePermission: true },
      TRANSITION_ISSUES: { id: '13', key: 'TRANSITION_ISSUES', name: 'Transition Issues', type: 'PROJECT', description: 'Ability to transition issues', havePermission: true },
      RESOLVE_ISSUES: { id: '14', key: 'RESOLVE_ISSUES', name: 'Resolve Issues', type: 'PROJECT', description: 'Ability to resolve issues', havePermission: true },
      CLOSE_ISSUES: { id: '18', key: 'CLOSE_ISSUES', name: 'Close Issues', type: 'PROJECT', description: 'Ability to close issues', havePermission: true },
    },
  });
});

// --- Protected Routes (JSM Service Desk API) ---
app.use('/rest/servicedeskapi', require('./routes/approvals'));
app.use('/rest/servicedeskapi', require('./routes/customers'));
app.use('/rest/servicedeskapi', require('./routes/queues'));

// --- Protected Routes (Assets API) ---
app.use('/rest/assets/1.0', require('./routes/assets'));

// --- 404 ---
app.use((req, res) => {
  res
    .status(404)
    .json({ errorMessages: [`${req.method} ${req.path} is not a valid endpoint`], errors: {} });
});

// --- Seed Data ---
seed();

// --- Start ---
const PORT = process.env.PORT || 8448;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`JSM Mock API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
