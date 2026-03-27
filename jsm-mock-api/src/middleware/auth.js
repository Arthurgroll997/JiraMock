const store = require('../data/store');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Cookie-based session auth (JSESSIONID)
  const cookie = req.headers.cookie;
  if (cookie) {
    const match = cookie.match(/JSESSIONID=([^;]+)/);
    if (match && store.sessions[match[1]]) {
      req.jiraUser = store.sessions[match[1]];
      return next();
    }
  }

  if (!authHeader) {
    return res.status(401).json({ errorMessages: ['Missing Authorization header. Provide Bearer token or Basic auth.'], errors: {} });
  }

  // Bearer token auth
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const valid = store.tokens.some(t => t.token === token);
    if (!valid) {
      return res.status(401).json({ errorMessages: ['Invalid or expired token'], errors: {} });
    }
    req.jiraUser = { key: 'admin', displayName: 'System Administrator' };
    return next();
  }

  // Basic auth
  if (authHeader.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [username] = decoded.split(':');
    const user = store.users.find(u => u.key === username);
    if (user) {
      req.jiraUser = user;
      return next();
    }
    return res.status(401).json({ errorMessages: ['Invalid credentials'], errors: {} });
  }

  return res.status(401).json({ errorMessages: ['Unsupported authentication method'], errors: {} });
}

module.exports = authMiddleware;
