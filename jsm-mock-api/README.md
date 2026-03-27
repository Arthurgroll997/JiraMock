# JSM Mock API

Jira Service Management (JSM) REST API mock server for PAMlab development and testing.

## Quick Start

```bash
cd jsm-mock-api
npm install
npm start
# → http://localhost:8448
```

## Authentication

Three methods supported:

### Bearer Token (default)
```bash
curl -H "Authorization: Bearer pamlab-dev-token" http://localhost:8448/rest/api/2/issue/ITSM-1
```

### Basic Auth (any user in store, password = anything)
```bash
curl -u j.doe:password http://localhost:8448/rest/api/2/issue/ITSM-1
```

### Cookie Session
```bash
# Login
curl -c cookies.txt -X POST http://localhost:8448/rest/auth/1/session \
  -H "Content-Type: application/json" -d '{"username":"j.doe","password":"pass"}'

# Use session
curl -b cookies.txt http://localhost:8448/rest/api/2/issue/ITSM-1
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/rest/auth/1/session` | Login |
| DELETE | `/rest/auth/1/session` | Logout |
| GET | `/rest/auth/1/session/current` | Current session |

### Issues (Jira REST API v2)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rest/api/2/issue/:key` | Get issue |
| POST | `/rest/api/2/issue` | Create issue |
| PUT | `/rest/api/2/issue/:key` | Update issue |
| DELETE | `/rest/api/2/issue/:key` | Delete issue |
| GET | `/rest/api/2/issue/:key/comment` | Get comments |
| POST | `/rest/api/2/issue/:key/comment` | Add comment |
| GET | `/rest/api/2/issue/:key/worklog` | Get worklogs |
| POST | `/rest/api/2/issue/:key/worklog` | Add worklog |

### Transitions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rest/api/2/issue/:key/transitions` | Get available transitions |
| POST | `/rest/api/2/issue/:key/transitions` | Execute transition |

### Search (JQL)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/rest/api/2/search` | Search with JQL |

### Approvals (JSM)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rest/servicedeskapi/request/:key/approval` | List approvals |
| POST | `/rest/servicedeskapi/request/:key/approval` | Create approval |
| POST | `/rest/servicedeskapi/request/:key/approval/:id/approve` | Approve |
| POST | `/rest/servicedeskapi/request/:key/approval/:id/decline` | Decline |

### Assets
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rest/assets/1.0/objectschema/list` | List schemas |
| GET | `/rest/assets/1.0/objecttype/:schemaId` | List object types |
| GET | `/rest/assets/1.0/object/:id` | Get object |
| POST | `/rest/assets/1.0/object/create` | Create object |
| PUT | `/rest/assets/1.0/object/:id` | Update object |
| GET | `/rest/assets/1.0/object/aql?aql=...` | AQL search |
| GET | `/rest/assets/1.0/objecttype/:typeId/objects` | List by type |

### Customers & Organizations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rest/servicedeskapi/customer` | List customers |
| POST | `/rest/servicedeskapi/customer` | Create customer |
| GET | `/rest/servicedeskapi/organization` | List organizations |
| POST | `/rest/servicedeskapi/organization` | Create organization |
| GET | `/rest/servicedeskapi/organization/:id/user` | Get org members |

### Queues & SLA
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rest/servicedeskapi/servicedesk/:id/queue` | List queues |
| GET | `/rest/servicedeskapi/servicedesk/:id/queue/:queueId/issue` | Queue issues |
| GET | `/rest/servicedeskapi/request/:key/sla` | SLA info |

### Webhooks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/rest/api/2/webhook` | Register webhook |
| GET | `/rest/api/2/webhook` | List webhooks |
| DELETE | `/rest/api/2/webhook/:id` | Delete webhook |

## JQL Examples

```bash
# All incidents
curl -X POST http://localhost:8448/rest/api/2/search \
  -H "Authorization: Bearer pamlab-dev-token" \
  -H "Content-Type: application/json" \
  -d '{"jql":"issuetype = Incident"}'

# Blocker priority issues
curl -X POST http://localhost:8448/rest/api/2/search \
  -H "Authorization: Bearer pamlab-dev-token" \
  -H "Content-Type: application/json" \
  -d '{"jql":"priority = Blocker AND status != Closed ORDER BY created DESC"}'

# Security project
curl -X POST http://localhost:8448/rest/api/2/search \
  -H "Authorization: Bearer pamlab-dev-token" \
  -H "Content-Type: application/json" \
  -d '{"jql":"project = SEC"}'
```

## Seed Data

- **13 issues** across ITSM and SEC projects (incidents, changes, service requests)
- **10 users** matching PAMlab AD mock
- **3 organizations**: PAMlab Corp, Engineering, Finance
- **5 assets**: DC01, DB-PROD, APP-ERP, FILE-SRV01, FUDO-PAM
- **4 SLA policies**: P1-P4 with response/resolution targets
- **5 queues**: All Open, My Assigned, Unassigned, SLA Breached, Security Queue

## Docker

```bash
docker build -t jsm-mock-api .
docker run -p 8448:8448 jsm-mock-api
```

## Integration

- Port: **8448**
- Default token: `pamlab-dev-token`
- Health check: `GET /health`
