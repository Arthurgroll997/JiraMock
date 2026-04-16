const ConnectorRegistry = require('./ConnectorRegistry');
const JsmConnector = require('./jsm');

function registerConnectorNames(registry, names, connector) {
  names.forEach((name) => registry.register(name, connector));
}

function createRegistry(env = process.env) {
  const registry = new ConnectorRegistry();

  const jsm = new JsmConnector(env.JSM_URL || 'http://localhost:8448');

  registerConnectorNames(registry, ['jsm', 'jira'], jsm);

  return registry;
}

module.exports = createRegistry;
