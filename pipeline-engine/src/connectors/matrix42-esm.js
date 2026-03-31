// =============================================================================
// Matrix42 ESM Connector — Anbindung an die Matrix42 Mock API (:8444)
// =============================================================================

const BaseConnector = require('./BaseConnector');

class Matrix42EsmConnector extends BaseConnector {
  constructor(baseUrl = 'http://localhost:8444') {
    super('matrix42-esm', baseUrl);
    this.apiToken = 'pamlab-dev-token';
    this._defineActions();
  }

  _defineActions() {
    // --- Auth ---
    this.defineAction('auth.get-token', {
      method: 'POST',
      path: '/m42Services/api/ApiToken/GenerateAccessTokenFromApiToken/',
      description: 'Access Token aus API Token generieren',
    });

    // --- Data/Objects ---
    this.defineAction('data.get-fragment', {
      method: 'GET',
      path: '/m42Services/api/data/fragments/{ddName}/{id}',
      description: 'Fragment-Daten abrufen',
    });
    this.defineAction('data.update-fragment', {
      method: 'PUT',
      path: '/m42Services/api/data/fragments/{ddName}/{id}',
      description: 'Fragment aktualisieren',
    });
    this.defineAction('data.create-fragment', {
      method: 'POST',
      path: '/m42Services/api/data/fragments/{ddName}',
      description: 'Fragment erstellen',
    });
    this.defineAction('data.get-object', {
      method: 'GET',
      path: '/m42Services/api/data/objects/{ddName}/{id}',
      description: 'Objekt abrufen',
    });
    this.defineAction('data.create-object', {
      method: 'POST',
      path: '/m42Services/api/data/objects/{ddName}',
      description: 'Objekt erstellen',
    });
    this.defineAction('data.update-object', {
      method: 'PUT',
      path: '/m42Services/api/data/objects/{ddName}/{id}',
      description: 'Objekt aktualisieren',
    });
    this.defineAction('data.delete-object', {
      method: 'DELETE',
      path: '/m42Services/api/data/objects/{ddName}/{id}',
      description: 'Objekt löschen',
    });
    this.defineAction('data.query', {
      method: 'POST',
      path: '/m42Services/api/data/objects/query',
      description: 'Objekte abfragen mit Filtern',
    });

    // --- Users ---
    this.defineAction('users.list', {
      method: 'GET',
      path: '/m42Services/api/users',
      description: 'Mitarbeiter auflisten',
    });
    this.defineAction('users.get', {
      method: 'GET',
      path: '/m42Services/api/users/{id}',
      description: 'Mitarbeiter nach ID',
    });
    this.defineAction('users.create', {
      method: 'POST',
      path: '/m42Services/api/users',
      description: 'Mitarbeiter anlegen',
    });
    this.defineAction('users.update', {
      method: 'PUT',
      path: '/m42Services/api/users/{id}',
      description: 'Mitarbeiter aktualisieren',
    });
    this.defineAction('users.delete', {
      method: 'DELETE',
      path: '/m42Services/api/users/{id}',
      description: 'Mitarbeiter deaktivieren',
    });
    this.defineAction('users.onboard', {
      method: 'POST',
      path: '/m42Services/api/users/{id}/onboard',
      description: 'Onboarding-Workflow starten',
    });
    this.defineAction('users.offboard', {
      method: 'POST',
      path: '/m42Services/api/users/{id}/offboard',
      description: 'Offboarding-Workflow starten',
    });
    this.defineAction('users.list-assets', {
      method: 'GET',
      path: '/m42Services/api/users/{id}/assets',
      description: 'Zugewiesene Geräte',
    });
    this.defineAction('users.list-groups', {
      method: 'GET',
      path: '/m42Services/api/users/{id}/groups',
      description: 'AD-Gruppenmitgliedschaften',
    });
    this.defineAction('users.list-tickets', {
      method: 'GET',
      path: '/m42Services/api/users/{id}/tickets',
      description: 'Tickets des Mitarbeiters',
    });

    // --- Tickets ---
    this.defineAction('tickets.list', {
      method: 'GET',
      path: '/m42Services/api/tickets',
      description: 'Tickets auflisten',
    });
    this.defineAction('tickets.get', {
      method: 'GET',
      path: '/m42Services/api/tickets/{id}',
      description: 'Ticket-Details',
    });
    this.defineAction('tickets.create', {
      method: 'POST',
      path: '/m42Services/api/tickets',
      description: 'Neues Ticket erstellen',
    });
    this.defineAction('tickets.update', {
      method: 'PUT',
      path: '/m42Services/api/tickets/{id}',
      description: 'Ticket aktualisieren',
    });
    this.defineAction('tickets.assign', {
      method: 'POST',
      path: '/m42Services/api/tickets/{id}/assign',
      description: 'Ticket zuweisen',
    });
    this.defineAction('tickets.comment', {
      method: 'POST',
      path: '/m42Services/api/tickets/{id}/comment',
      description: 'Kommentar hinzufügen',
    });
    this.defineAction('tickets.resolve', {
      method: 'POST',
      path: '/m42Services/api/tickets/{id}/resolve',
      description: 'Ticket lösen',
    });
    this.defineAction('tickets.reopen', {
      method: 'POST',
      path: '/m42Services/api/tickets/{id}/reopen',
      description: 'Ticket wiedereröffnen',
    });
    this.defineAction('tickets.escalate', {
      method: 'POST',
      path: '/m42Services/api/tickets/{id}/escalate',
      description: 'Ticket eskalieren',
    });
    this.defineAction('tickets.stats', {
      method: 'GET',
      path: '/m42Services/api/tickets/stats',
      description: 'Ticket-Statistiken',
    });

    // --- Assets ---
    this.defineAction('assets.list', {
      method: 'GET',
      path: '/m42Services/api/assets',
      description: 'Assets auflisten',
    });
    this.defineAction('assets.get', {
      method: 'GET',
      path: '/m42Services/api/assets/{id}',
      description: 'Asset-Details',
    });
    this.defineAction('assets.create', {
      method: 'POST',
      path: '/m42Services/api/assets',
      description: 'Asset registrieren',
    });
    this.defineAction('assets.update', {
      method: 'PUT',
      path: '/m42Services/api/assets/{id}',
      description: 'Asset aktualisieren',
    });
    this.defineAction('assets.assign', {
      method: 'POST',
      path: '/m42Services/api/assets/{id}/assign',
      description: 'Asset zuweisen',
    });

    // --- Software ---
    this.defineAction('software.list', {
      method: 'GET',
      path: '/m42Services/api/software',
      description: 'Software-Katalog',
    });
    this.defineAction('software.get', {
      method: 'GET',
      path: '/m42Services/api/software/{id}',
      description: 'Software-Details',
    });

    // --- Provisioning ---
    this.defineAction('provisioning.create-workflow', {
      method: 'POST',
      path: '/m42Services/api/provisioning/workflows',
      description: 'Provisionierungs-Workflow erstellen',
    });
    this.defineAction('provisioning.list-workflows', {
      method: 'GET',
      path: '/m42Services/api/provisioning/workflows',
      description: 'Workflows auflisten',
    });
    this.defineAction('provisioning.get-workflow', {
      method: 'GET',
      path: '/m42Services/api/provisioning/workflows/{id}',
      description: 'Workflow-Details',
    });
    this.defineAction('provisioning.execute-workflow', {
      method: 'POST',
      path: '/m42Services/api/provisioning/workflows/{id}/execute',
      description: 'Nächsten Schritt ausführen',
    });

    // --- Access Requests ---
    this.defineAction('access-requests.list', {
      method: 'GET',
      path: '/m42Services/api/access-requests',
      description: 'Zugriffsanfragen auflisten',
    });
    this.defineAction('access-requests.create', {
      method: 'POST',
      path: '/m42Services/api/access-requests',
      description: 'Zugriffsanfrage erstellen',
    });
    this.defineAction('access-requests.approve', {
      method: 'POST',
      path: '/m42Services/api/access-requests/{id}/approve',
      description: 'Anfrage genehmigen',
    });
    this.defineAction('access-requests.deny', {
      method: 'POST',
      path: '/m42Services/api/access-requests/{id}/deny',
      description: 'Anfrage ablehnen',
    });
    this.defineAction('access-requests.revoke', {
      method: 'POST',
      path: '/m42Services/api/access-requests/{id}/revoke',
      description: 'Zugriff widerrufen',
    });

    // --- Webhooks ---
    this.defineAction('webhooks.list', {
      method: 'GET',
      path: '/m42Services/api/webhooks',
      description: 'Webhooks auflisten',
    });
    this.defineAction('webhooks.create', {
      method: 'POST',
      path: '/m42Services/api/webhooks',
      description: 'Webhook registrieren',
    });
    this.defineAction('webhooks.delete', {
      method: 'DELETE',
      path: '/m42Services/api/webhooks/{id}',
      description: 'Webhook löschen',
    });

    // --- Reports ---
    this.defineAction('reports.inventory', {
      method: 'GET',
      path: '/m42Services/api/reports/inventory',
      description: 'Inventar-Übersicht',
    });
    this.defineAction('reports.compliance', {
      method: 'GET',
      path: '/m42Services/api/reports/compliance',
      description: 'Compliance-Bericht',
    });
    this.defineAction('reports.user-access', {
      method: 'GET',
      path: '/m42Services/api/reports/user-access',
      description: 'Benutzer-Zugriffs-Matrix',
    });
    this.defineAction('reports.provisioning', {
      method: 'GET',
      path: '/m42Services/api/reports/provisioning',
      description: 'Provisionierungs-Aktivität',
    });
  }

  async authenticate() {
    const res = await fetch(
      `${this.baseUrl}/m42Services/api/ApiToken/GenerateAccessTokenFromApiToken/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(`Matrix42 Auth fehlgeschlagen: ${JSON.stringify(data)}`);
    this.token = data.RawToken || data.accessToken || data.token || 'authenticated';
    return data;
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

module.exports = Matrix42EsmConnector;
