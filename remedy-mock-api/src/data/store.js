const store = {
  tokens: [],
  forms: {
    'HPD:Help Desk': [],
    'CHG:Infrastructure Change': [],
    'AST:ComputerSystem': [],
    'CTM:People': [],
    'CTM:Support Group': [],
    'WOI:WorkOrder': [],
    'SLA:SLADefinition': [],
  },
  webhooks: [],
  jwt_sessions: [],
  defaultToken: process.env.DEFAULT_API_TOKEN || 'pamlab-dev-token',
};

// Pre-register default token
store.tokens.push({ token: store.defaultToken, user: 'admin', created: new Date().toISOString() });

module.exports = store;
