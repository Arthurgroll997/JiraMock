// =============================================================================
// Fudo PAM Connector — Anbindung an die Fudo PAM Mock API (:8443)
// =============================================================================

const BaseConnector = require('./BaseConnector');

class FudoPamConnector extends BaseConnector {
  constructor(baseUrl = 'http://localhost:8443') {
    super('fudo-pam', baseUrl);
    this.credentials = { login: 'admin', password: 'admin123' };
    this._defineActions();
  }

  _defineActions() {
    // --- Auth ---
    this.defineAction('auth.login', {
      method: 'POST',
      path: '/api/v2/auth/login',
      description: 'Login mit Zugangsdaten',
    });
    this.defineAction('auth.logout', {
      method: 'POST',
      path: '/api/v2/auth/logout',
      description: 'Session beenden',
    });

    // --- Users ---
    this.defineAction('users.list', {
      method: 'GET',
      path: '/api/v2/users',
      description: 'Alle Benutzer auflisten',
    });
    this.defineAction('users.get', {
      method: 'GET',
      path: '/api/v2/users/{id}',
      description: 'Benutzer nach ID',
    });
    this.defineAction('users.create', {
      method: 'POST',
      path: '/api/v2/users',
      description: 'Neuen Benutzer anlegen',
    });
    this.defineAction('users.update', {
      method: 'PUT',
      path: '/api/v2/users/{id}',
      description: 'Benutzer aktualisieren',
    });
    this.defineAction('users.delete', {
      method: 'DELETE',
      path: '/api/v2/users/{id}',
      description: 'Benutzer löschen',
    });
    this.defineAction('users.block', {
      method: 'POST',
      path: '/api/v2/users/{id}/block',
      description: 'Benutzer sperren',
    });
    this.defineAction('users.unblock', {
      method: 'POST',
      path: '/api/v2/users/{id}/unblock',
      description: 'Benutzer entsperren',
    });

    // --- Groups ---
    this.defineAction('groups.list', {
      method: 'GET',
      path: '/api/v2/groups',
      description: 'Alle Gruppen auflisten',
    });
    this.defineAction('groups.get', {
      method: 'GET',
      path: '/api/v2/groups/{id}',
      description: 'Gruppe nach ID',
    });
    this.defineAction('groups.create', {
      method: 'POST',
      path: '/api/v2/groups',
      description: 'Neue Gruppe anlegen',
    });
    this.defineAction('groups.update', {
      method: 'PUT',
      path: '/api/v2/groups/{id}',
      description: 'Gruppe aktualisieren',
    });
    this.defineAction('groups.delete', {
      method: 'DELETE',
      path: '/api/v2/groups/{id}',
      description: 'Gruppe löschen',
    });
    this.defineAction('groups.list-users', {
      method: 'GET',
      path: '/api/v2/groups/{id}/users',
      description: 'Gruppenmitglieder auflisten',
    });
    this.defineAction('groups.add-user', {
      method: 'POST',
      path: '/api/v2/groups/{id}/users',
      description: 'Benutzer zur Gruppe hinzufügen',
    });
    this.defineAction('groups.remove-user', {
      method: 'DELETE',
      path: '/api/v2/groups/{id}/users',
      description: 'Benutzer aus Gruppe entfernen',
    });
    this.defineAction('groups.list-safes', {
      method: 'GET',
      path: '/api/v2/groups/{id}/safes',
      description: 'Safes der Gruppe auflisten',
    });
    this.defineAction('groups.add-safe', {
      method: 'POST',
      path: '/api/v2/groups/{id}/safes',
      description: 'Safe zur Gruppe hinzufügen',
    });
    this.defineAction('groups.remove-safe', {
      method: 'DELETE',
      path: '/api/v2/groups/{id}/safes',
      description: 'Safe von Gruppe entfernen',
    });

    // --- Sessions ---
    this.defineAction('sessions.list', {
      method: 'GET',
      path: '/api/v2/sessions',
      description: 'Aufgezeichnete Sessions auflisten',
    });
    this.defineAction('sessions.get', {
      method: 'GET',
      path: '/api/v2/sessions/{id}',
      description: 'Session-Details',
    });

    // --- Session Control ---
    this.defineAction('session-control.connect', {
      method: 'POST',
      path: '/api/v2/session-control/connect',
      description: 'Session starten',
    });
    this.defineAction('session-control.terminate', {
      method: 'POST',
      path: '/api/v2/session-control/{id}/terminate',
      description: 'Session beenden',
    });
    this.defineAction('session-control.pause', {
      method: 'POST',
      path: '/api/v2/session-control/{id}/pause',
      description: 'Session pausieren',
    });
    this.defineAction('session-control.resume', {
      method: 'POST',
      path: '/api/v2/session-control/{id}/resume',
      description: 'Session fortsetzen',
    });
    this.defineAction('session-control.live', {
      method: 'GET',
      path: '/api/v2/session-control/live',
      description: 'Aktive Sessions auflisten',
    });

    // --- Access Requests ---
    this.defineAction('access-requests.create', {
      method: 'POST',
      path: '/api/v2/access-requests',
      description: 'Zugriffsanfrage erstellen',
    });
    this.defineAction('access-requests.list', {
      method: 'GET',
      path: '/api/v2/access-requests',
      description: 'Zugriffsanfragen auflisten',
    });
    this.defineAction('access-requests.approve', {
      method: 'POST',
      path: '/api/v2/access-requests/{id}/approve',
      description: 'Anfrage genehmigen',
    });
    this.defineAction('access-requests.deny', {
      method: 'POST',
      path: '/api/v2/access-requests/{id}/deny',
      description: 'Anfrage ablehnen',
    });
    this.defineAction('access-requests.revoke', {
      method: 'POST',
      path: '/api/v2/access-requests/{id}/revoke',
      description: 'Zugriff widerrufen',
    });

    // --- Password Policies ---
    this.defineAction('password-policies.list', {
      method: 'GET',
      path: '/api/v2/password-policies',
      description: 'Passwort-Richtlinien auflisten',
    });
    this.defineAction('password-policies.get', {
      method: 'GET',
      path: '/api/v2/password-policies/{id}',
      description: 'Passwort-Richtlinie nach ID',
    });
    this.defineAction('password-policies.create', {
      method: 'POST',
      path: '/api/v2/password-policies',
      description: 'Neue Passwort-Richtlinie',
    });
    this.defineAction('password-policies.rotate-now', {
      method: 'POST',
      path: '/api/v2/password-policies/{id}/rotate-now',
      description: 'Sofortige Passwort-Rotation',
    });
    this.defineAction('password-policies.history', {
      method: 'GET',
      path: '/api/v2/password-policies/{id}/history',
      description: 'Rotations-Historie',
    });

    // --- User Directory (AD Sync) ---
    this.defineAction('user-directory.config', {
      method: 'GET',
      path: '/api/v2/user-directory/config',
      description: 'AD-Sync Konfiguration abrufen',
    });
    this.defineAction('user-directory.sync', {
      method: 'POST',
      path: '/api/v2/user-directory/sync',
      description: 'AD-Sync starten',
    });
    this.defineAction('user-directory.status', {
      method: 'GET',
      path: '/api/v2/user-directory/status',
      description: 'Letzter Sync-Status',
    });
  }

  async authenticate() {
    const res = await fetch(`${this.baseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Fudo PAM Auth fehlgeschlagen: ${JSON.stringify(data)}`);
    this.token = data.token || data.sessionToken || data.session_token || 'authenticated';
    return data;
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

module.exports = FudoPamConnector;
