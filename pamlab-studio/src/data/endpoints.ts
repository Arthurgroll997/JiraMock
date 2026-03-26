import type { ApiEndpointGroup } from '../types';

export const apiEndpoints: ApiEndpointGroup[] = [
  {
    api: 'Fudo PAM',
    baseUrl: 'http://localhost:8443',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check', exampleResponse: { status: 'ok' } },
      { method: 'GET', path: '/api/v2/users', description: 'List all PAM users', exampleResponse: [{ id: 1, name: 'admin' }] },
      { method: 'POST', path: '/api/v2/users', description: 'Create PAM user', parameters: [{ name: 'name', type: 'string', required: true, description: 'Username' }, { name: 'email', type: 'string', required: false, description: 'Email address' }], exampleRequest: { name: 'jdoe', email: 'jdoe@corp.local' } },
      { method: 'GET', path: '/api/v2/servers', description: 'List servers', exampleResponse: [{ id: 1, name: 'prod-db-01' }] },
      { method: 'POST', path: '/api/v2/servers', description: 'Create server', parameters: [{ name: 'name', type: 'string', required: true, description: 'Server name' }, { name: 'address', type: 'string', required: true, description: 'Server address' }], exampleRequest: { name: 'prod-db-01', address: '10.0.1.10' } },
      { method: 'GET', path: '/api/v2/sessions', description: 'List sessions', exampleResponse: [{ id: 1, user_id: 1, server_id: 1, status: 'active' }] },
      { method: 'GET', path: '/api/v2/access-requests', description: 'List access requests', exampleResponse: [{ id: 1, status: 'pending' }] },
      { method: 'POST', path: '/api/v2/access-requests', description: 'Create access request', parameters: [{ name: 'user_id', type: 'number', required: true, description: 'User ID' }, { name: 'server_id', type: 'number', required: true, description: 'Server ID' }, { name: 'justification', type: 'string', required: true, description: 'Reason' }], exampleRequest: { user_id: 1, server_id: 1, justification: 'Maintenance' } },
      { method: 'POST', path: '/api/v2/access-requests/{id}/approve', description: 'Approve access request', parameters: [{ name: 'id', type: 'number', required: true, description: 'Request ID' }] },
      { method: 'GET', path: '/api/v2/events/stream', description: 'SSE event stream (Server-Sent Events)' },
    ],
  },
  {
    api: 'Matrix42 ESM',
    baseUrl: 'http://localhost:8444',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check', exampleResponse: { status: 'ok' } },
      { method: 'GET', path: '/api/tickets', description: 'List all tickets', exampleResponse: [{ id: 1, title: 'Onboarding', status: 'open' }] },
      { method: 'POST', path: '/api/tickets', description: 'Create ticket', parameters: [{ name: 'title', type: 'string', required: true, description: 'Ticket title' }, { name: 'description', type: 'string', required: false, description: 'Description' }, { name: 'priority', type: 'string', required: false, description: 'low/medium/high' }, { name: 'category', type: 'string', required: false, description: 'Category' }], exampleRequest: { title: 'Onboarding: Jane', priority: 'medium', category: 'onboarding' } },
      { method: 'GET', path: '/api/tickets/{id}', description: 'Get ticket by ID', parameters: [{ name: 'id', type: 'number', required: true, description: 'Ticket ID' }] },
      { method: 'PUT', path: '/api/tickets/{id}', description: 'Update ticket', parameters: [{ name: 'id', type: 'number', required: true, description: 'Ticket ID' }, { name: 'status', type: 'string', required: false, description: 'Status' }] },
      { method: 'GET', path: '/api/services', description: 'List service catalog', exampleResponse: [{ id: 1, name: 'VPN Access' }] },
    ],
  },
  {
    api: 'Active Directory',
    baseUrl: 'http://localhost:8445',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check', exampleResponse: { status: 'ok' } },
      { method: 'GET', path: '/api/users', description: 'List all users', exampleResponse: [{ username: 'jdoe', firstName: 'John' }] },
      { method: 'POST', path: '/api/users', description: 'Create user', parameters: [{ name: 'username', type: 'string', required: true, description: 'Username' }, { name: 'firstName', type: 'string', required: true, description: 'First name' }, { name: 'lastName', type: 'string', required: true, description: 'Last name' }, { name: 'email', type: 'string', required: false, description: 'Email' }], exampleRequest: { username: 'jdoe', firstName: 'John', lastName: 'Doe', email: 'jdoe@corp.local' } },
      { method: 'GET', path: '/api/groups', description: 'List all groups', exampleResponse: [{ name: 'engineers', members: ['jdoe'] }] },
      { method: 'POST', path: '/api/groups/{name}/members', description: 'Add member to group', parameters: [{ name: 'name', type: 'string', required: true, description: 'Group name' }, { name: 'username', type: 'string', required: true, description: 'Username to add' }] },
      { method: 'DELETE', path: '/api/groups/{name}/members/{username}', description: 'Remove member from group', parameters: [{ name: 'name', type: 'string', required: true, description: 'Group name' }, { name: 'username', type: 'string', required: true, description: 'Username' }] },
      { method: 'POST', path: '/api/users/{username}/disable', description: 'Disable user account', parameters: [{ name: 'username', type: 'string', required: true, description: 'Username' }] },
      { method: 'POST', path: '/api/users/{username}/reset-password', description: 'Reset password', parameters: [{ name: 'username', type: 'string', required: true, description: 'Username' }, { name: 'newPassword', type: 'string', required: true, description: 'New password' }] },
    ],
  },
];
