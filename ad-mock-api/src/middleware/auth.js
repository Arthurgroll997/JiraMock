const tokens = new Map();

// Dev token always accepted for local development
const DEV_TOKEN = 'pamlab-dev-token';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  // Accept Basic auth (from PAMlab Studio) — pass through in dev mode
  if (auth && auth.startsWith('Basic ')) {
    req.bindDN = 'cn=admin,dc=corp,dc=local';
    return next();
  }
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token required' });
  }
  const token = auth.slice(7);
  // Accept dev token
  if (token === DEV_TOKEN) {
    req.bindDN = 'cn=admin,dc=corp,dc=local';
    return next();
  }
  const session = tokens.get(token);
  if (!session) return res.status(401).json({ error: 'Invalid or expired token' });
  req.bindDN = session.bind_dn;
  next();
}

module.exports = { authMiddleware, tokens };
