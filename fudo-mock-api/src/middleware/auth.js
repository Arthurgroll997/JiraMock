const db = require('../data/store');

// Dev token always accepted for local development
const DEV_TOKEN = 'pamlab-dev-token';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  // Accept Basic auth (from PAMlab Studio) — pass through in dev mode
  if (authHeader && authHeader.startsWith('Basic ')) {
    req.userId = 1;
    req.userLogin = 'admin';
    return next();
  }
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.slice(7);
  // Accept dev token
  if (token === DEV_TOKEN) {
    req.userId = 1;
    req.userLogin = 'admin';
    return next();
  }
  const session = db.tokens.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session token' });
  }
  req.userId = session.user_id;
  req.userLogin = session.login;
  next();
}

module.exports = authMiddleware;
