// =============================================================================
// Active Directory Connector — Anbindung an die AD Mock API (:8445)
// =============================================================================

const BaseConnector = require('./BaseConnector');

class ActiveDirectoryConnector extends BaseConnector {
  constructor(baseUrl = 'http://localhost:8445') {
    super('active-directory', baseUrl);
    this.credentials = { dn: 'CN=admin', password: 'admin' };
    this._defineActions();
  }

  _defineActions() {
    // --- Auth ---
    this.defineAction('auth.bind', {
      method: 'POST', path: '/api/ad/auth/bind',
      description: 'LDAP Bind simulieren'
    });

    // --- Users ---
    this.defineAction('users.list', {
      method: 'GET', path: '/api/ad/users',
      description: 'Alle Benutzer auflisten'
    });
    this.defineAction('users.get', {
      method: 'GET', path: '/api/ad/users/{sam}',
      description: 'Benutzer nach sAMAccountName'
    });
    this.defineAction('users.create', {
      method: 'POST', path: '/api/ad/users',
      description: 'Neuen Benutzer anlegen'
    });
    this.defineAction('users.update', {
      method: 'PUT', path: '/api/ad/users/{sam}',
      description: 'Benutzer aktualisieren'
    });
    this.defineAction('users.delete', {
      method: 'DELETE', path: '/api/ad/users/{sam}',
      description: 'Benutzer löschen'
    });
    this.defineAction('users.disable', {
      method: 'PUT', path: '/api/ad/users/{sam}',
      description: 'Benutzer deaktivieren (enabled: false)'
    });
    this.defineAction('users.list-groups', {
      method: 'GET', path: '/api/ad/users/{sam}/groups',
      description: 'Gruppenmitgliedschaften eines Benutzers'
    });

    // --- Groups ---
    this.defineAction('groups.list', {
      method: 'GET', path: '/api/ad/groups',
      description: 'Alle Gruppen auflisten'
    });
    this.defineAction('groups.get', {
      method: 'GET', path: '/api/ad/groups/{name}',
      description: 'Gruppe nach Name'
    });
    this.defineAction('groups.create', {
      method: 'POST', path: '/api/ad/groups',
      description: 'Neue Gruppe anlegen'
    });
    this.defineAction('groups.update', {
      method: 'PUT', path: '/api/ad/groups/{name}',
      description: 'Gruppe aktualisieren'
    });
    this.defineAction('groups.delete', {
      method: 'DELETE', path: '/api/ad/groups/{name}',
      description: 'Gruppe löschen'
    });
    this.defineAction('groups.list-members', {
      method: 'GET', path: '/api/ad/groups/{name}/members',
      description: 'Gruppenmitglieder auflisten'
    });
    this.defineAction('groups.add-member', {
      method: 'POST', path: '/api/ad/groups/{name}/members',
      description: 'Mitglied zur Gruppe hinzufügen'
    });
    this.defineAction('groups.remove-member', {
      method: 'DELETE', path: '/api/ad/groups/{name}/members',
      description: 'Mitglied aus Gruppe entfernen'
    });
    this.defineAction('groups.add-member-timed', {
      method: 'POST', path: '/api/ad/groups/{name}/members/timed',
      description: 'Zeitlich begrenzte Gruppenmitgliedschaft (JIT)'
    });

    // --- OUs ---
    this.defineAction('ous.list', {
      method: 'GET', path: '/api/ad/ous',
      description: 'Organisationseinheiten auflisten'
    });

    // --- Computers ---
    this.defineAction('computers.list', {
      method: 'GET', path: '/api/ad/computers',
      description: 'Computer-Objekte auflisten'
    });
    this.defineAction('computers.create', {
      method: 'POST', path: '/api/ad/computers',
      description: 'Computer-Objekt anlegen'
    });

    // --- Domain ---
    this.defineAction('domain.info', {
      method: 'GET', path: '/api/ad/domain',
      description: 'Domain-Informationen'
    });

    // --- Bulk ---
    this.defineAction('bulk.group-membership', {
      method: 'POST', path: '/api/ad/bulk/group-membership',
      description: 'Bulk-Gruppenmitgliedschaften ändern'
    });
  }

  async authenticate() {
    const res = await fetch(`${this.baseUrl}/api/ad/auth/bind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`AD Auth fehlgeschlagen: ${JSON.stringify(data)}`);
    this.token = data.token || data.sessionId || 'authenticated';
    return data;
  }

  getAuthHeaders() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }
}

module.exports = ActiveDirectoryConnector;
