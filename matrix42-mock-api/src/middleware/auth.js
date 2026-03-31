const store = require('../data/store');

// Dev token always accepted for local development
const DEV_TOKEN = 'pamlab-dev-token';

function authMiddleware(req, res, next) {
  // Skip auth for token generation endpoint
  if (req.path.includes('/ApiToken')) return next();

  const authHeader = req.headers.authorization;
  // Accept Basic auth (from PAMlab Studio) — pass through in dev mode
  if (authHeader && authHeader.startsWith('Basic ')) return next();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  // Accept dev token
  if (token === DEV_TOKEN) return next();

  const valid = store.tokens.some((t) => t.RawToken === token || t.apiToken === token);
  if (!valid) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  next();
}

module.exports = authMiddleware;
