const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const router = express.Router();

// POST /rest/auth/1/session - Login
router.post('/', (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(401).json({ errorMessages: ['Username is required'], errors: {} });
  const user = store.users.find(u => u.key === username);
  if (!user) return res.status(401).json({ errorMessages: ['Invalid credentials'], errors: {} });
  const sessionId = uuidv4();
  store.sessions[sessionId] = user;
  res.cookie('JSESSIONID', sessionId, { httpOnly: true });
  res.json({ session: { name: user.key, value: sessionId }, loginInfo: { loginCount: 1, previousLoginTime: new Date().toISOString() } });
});

// DELETE /rest/auth/1/session - Logout
router.delete('/', (req, res) => {
  const cookie = req.headers.cookie;
  if (cookie) {
    const match = cookie.match(/JSESSIONID=([^;]+)/);
    if (match) delete store.sessions[match[1]];
  }
  res.status(204).send();
});

// GET /rest/auth/1/session/current
router.get('/current', (req, res) => {
  const cookie = req.headers.cookie;
  if (cookie) {
    const match = cookie.match(/JSESSIONID=([^;]+)/);
    if (match && store.sessions[match[1]]) {
      const user = store.sessions[match[1]];
      return res.json({ self: `http://localhost:${process.env.PORT || 8448}/rest/api/2/user?key=${user.key}`, key: user.key, name: user.key, displayName: user.displayName, emailAddress: user.emailAddress, active: true });
    }
  }
  res.status(401).json({ errorMessages: ['No active session'], errors: {} });
});

module.exports = router;
