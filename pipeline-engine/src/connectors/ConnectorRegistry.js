// =============================================================================
// ConnectorRegistry — Registriert und verwaltet System-Connectors
// =============================================================================

class ConnectorRegistry {
  constructor() {
    this.connectors = new Map();
  }

  /**
   * Registriert einen Connector
   * @param {string} name - z.B. 'fudo-pam'
   * @param {object} connector - Connector-Instanz mit actions und execute()
   */
  register(name, connector) {
    this.connectors.set(name, connector);
  }

  /**
   * Gibt einen Connector zurück
   */
  get(name) {
    const connector = this.connectors.get(name);
    if (!connector) {
      throw new Error(
        `Connector "${name}" nicht registriert. Verfügbar: ${this.list().join(', ')}`,
      );
    }
    return connector;
  }

  /**
   * Liste aller registrierten Connector-Namen
   */
  list() {
    return Array.from(this.connectors.keys());
  }

  /**
   * Gibt alle Connectors mit ihren Actions zurück
   */
  listDetailed() {
    const result = {};
    for (const [name, connector] of this.connectors) {
      result[name] = {
        name,
        baseUrl: connector.baseUrl,
        actions: Object.keys(connector.actions || {}),
      };
    }
    return result;
  }
}

module.exports = ConnectorRegistry;
