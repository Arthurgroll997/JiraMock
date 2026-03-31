const express = require('express');
const cors = require('cors');
const seed = require('./data/seed');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8449;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'remedy-mock-api', timestamp: new Date().toISOString() });
});

app.post('/reset', (req, res) => {
  seed();
  res.json({ status: 'reset', service: 'remedy-mock-api' });
});

// JWT auth routes (public)
app.use('/api/jwt', require('./routes/auth'));

// Auth middleware for all /api/arsys routes
app.use('/api/arsys', authMiddleware);

// Generic entry API (Remedy forms)
app.use('/api/arsys/v1/entry', require('./routes/entry'));

// Convenience routes (also protected)
app.use('/api/arsys', authMiddleware);
app.use('/api/arsys/v1/incidents', require('./routes/incident'));
app.use('/api/arsys/v1/changes', require('./routes/change'));
app.use('/api/arsys/v1/assets', require('./routes/asset'));
app.use('/api/arsys/v1/people', require('./routes/people'));
app.use('/api/arsys/v1/workorders', require('./routes/workorder'));
app.use('/api/arsys/v1/sla', require('./routes/sla'));
app.use('/api/arsys/v1/webhooks', require('./routes/webhook'));

// 404
app.use((req, res) => {
  res.status(404).json({ error: [{ messageType: 'ERROR', messageText: `${req.method} ${req.path} is not a valid endpoint`, messageNumber: 9999 }] });
});

// Seed data
seed();

if (require.main === module) app.listen(PORT, () => {
  console.log(`BMC Remedy Mock API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`JWT Login: POST http://localhost:${PORT}/api/jwt/login`);
  console.log(`Entry API: http://localhost:${PORT}/api/arsys/v1/entry/{formName}`);
});

module.exports = app;

module.exports = app;
