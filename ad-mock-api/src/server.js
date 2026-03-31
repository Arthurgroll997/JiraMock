require('dotenv').config();
const express = require('express');
const { authMiddleware } = require('./middleware/auth');

const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Auth (no token needed)
app.use('/api/ad/auth', require('./routes/auth'));

// Protected routes
app.use('/api/ad/users', authMiddleware, require('./routes/users'));
app.use('/api/ad/groups', authMiddleware, require('./routes/groups'));
app.use('/api/ad/ous', authMiddleware, require('./routes/ous'));
app.use('/api/ad/computers', authMiddleware, require('./routes/computers'));
app.use('/api/ad/domain', authMiddleware, require('./routes/domain'));
app.use('/api/ad/bulk', authMiddleware, require('./routes/bulk'));

// Alias routes (without /ad/ prefix) for convenience
app.use('/api/users', authMiddleware, require('./routes/users'));
app.use('/api/groups', authMiddleware, require('./routes/groups'));

// Health
app.post('/reset', (req, res) => {
  const store = require('./data/store');
  store.reset();
  res.json({ status: 'reset', service: 'ad-mock-api' });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ad-mock-api', domain: 'corp.local' }));

const PORT = process.env.PORT || 8445;
if (require.main === module) app.listen(PORT, () => console.log(`AD Mock API running on port ${PORT} (corp.local)`));

module.exports = app;

module.exports = app;
