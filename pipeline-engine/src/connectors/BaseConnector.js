// =============================================================================
// BaseConnector — Basis-Klasse für alle System-Connectors
// =============================================================================

class BaseConnector {
  /**
   * @param {string} name - Connector-Name (z.B. 'fudo-pam')
   * @param {string} baseUrl - Basis-URL des Zielsystems
   */
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.token = null;
    this.actions = {};
  }

  /**
   * Definiert eine Action mit HTTP-Methode, Pfad und Parameterschema
   */
  defineAction(actionName, { method, path, params = {}, description = '' }) {
    this.actions[actionName] = { method, path, params, description };
  }

  /**
   * Authentifizierung — wird von Subklassen überschrieben
   */
  async authenticate() {
    throw new Error(`authenticate() nicht implementiert für ${this.name}`);
  }

  /**
   * Führt eine Action aus
   * @param {string} actionName - z.B. 'users.list'
   * @param {object} params - Parameter für die Action
   * @param {boolean} dryRun - Nur simulieren, nicht ausführen
   */
  async execute(actionName, params = {}, dryRun = false) {
    const action = this.actions[actionName];
    if (!action) {
      throw new Error(`Action "${actionName}" nicht gefunden in ${this.name}. Verfügbar: ${Object.keys(this.actions).join(', ')}`);
    }

    // Auto-Authentifizierung beim ersten Aufruf
    if (!this.token) {
      await this.authenticate();
    }

    // Pfad-Parameter substituieren: /users/{id} → /users/123
    let url = this.baseUrl + action.path;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }

    if (dryRun) {
      return {
        dryRun: true,
        connector: this.name,
        action: actionName,
        method: action.method,
        url,
        params
      };
    }

    // Body nur bei POST/PUT/PATCH
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(action.method.toUpperCase());
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders()
    };

    const fetchOptions = {
      method: action.method.toUpperCase(),
      headers
    };

    if (hasBody) {
      // Pfad-Parameter aus dem Body entfernen
      const bodyParams = { ...params };
      const pathParamRegex = /\{(\w+)\}/g;
      let match;
      while ((match = pathParamRegex.exec(action.path)) !== null) {
        delete bodyParams[match[1]];
      }
      fetchOptions.body = JSON.stringify(bodyParams);
    }

    const response = await fetch(url, fetchOptions);
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`${this.name}.${actionName} fehlgeschlagen (${response.status}): ${JSON.stringify(data)}`);
    }

    return data;
  }

  /**
   * Auth-Headers — wird von Subklassen überschrieben
   */
  getAuthHeaders() {
    return {};
  }
}

module.exports = BaseConnector;
