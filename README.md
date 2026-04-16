# JiraMock

A lightweight **Jira Service Management (JSM) mock API** for local development and testing.

Simulates the Jira REST API v2 and Service Desk API so that integrations can be built and tested without a real Jira instance.

Docker image: `arthurgroll64940/jsm-mock-api:1.0.0`

---

## Quick Start

### Docker

```bash
docker run -p 8448:8448 arthurgroll64940/jsm-mock-api:1.0.0
curl http://localhost:8448/health
```

### From source

```bash
cd jsm-mock-api
npm install
npm start
# Listening on http://localhost:8448
```

**Default auth token (all endpoints):** `Bearer pamlab-dev-token`

---

## API Reference

### Authentication

Three methods are accepted on every protected endpoint:

| Method | Example |
|--------|---------|
| Bearer token | `Authorization: Bearer pamlab-dev-token` |
| Basic auth | Any seeded username + any password |
| Session cookie | Obtain via `POST /rest/auth/1/session`, then send `Cookie: JSESSIONID=<value>` |

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rest/auth/1/session` | Login → returns JSESSIONID |
| DELETE | `/rest/auth/1/session` | Logout |
| GET | `/rest/auth/1/session/current` | Current session info |

---

### Issues

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/api/2/issue/:issueIdOrKey` | Get issue by key (e.g. `ITSM-1`) or numeric ID |
| POST | `/rest/api/2/issue` | Create issue |
| PUT | `/rest/api/2/issue/:issueIdOrKey` | Update issue fields |
| DELETE | `/rest/api/2/issue/:issueIdOrKey` | Delete issue |
| GET | `/rest/api/2/issue/:issueIdOrKey/comment` | List comments |
| POST | `/rest/api/2/issue/:issueIdOrKey/comment` | Add comment |
| GET | `/rest/api/2/issue/:issueIdOrKey/worklog` | List worklogs |
| POST | `/rest/api/2/issue/:issueIdOrKey/worklog` | Add worklog |

**Create issue — minimal body:**
```json
POST /rest/api/2/issue
{
  "fields": {
    "project": { "key": "ITSM" },
    "summary": "Something is broken",
    "issuetype": { "name": "Incident" }
  }
}
```

**Response:**
```json
{ "id": "10001", "key": "ITSM-14", "self": "http://localhost:8448/rest/api/2/issue/10001" }
```

---

### Search (JQL)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rest/api/2/search` | Search with JQL (body) |
| GET | `/rest/api/2/search?jql=...` | Search with JQL (query param) |

**Supported JQL operators:** `=`, `!=`, `~` (contains), `IN`, `NOT IN`, `IS EMPTY`, `ORDER BY`, `AND`, `OR`

**Supported fields:** `project`, `issuetype`, `priority`, `status`, `assignee`, `reporter`, `summary`, `labels`, `created`, `updated`

```bash
# POST with JQL
curl -s -X POST http://localhost:8448/rest/api/2/search \
  -H "Authorization: Bearer pamlab-dev-token" \
  -H "Content-Type: application/json" \
  -d '{"jql": "project = ITSM AND priority IN (Critical, Blocker)", "maxResults": 10, "startAt": 0}'

# GET with JQL
curl -s "http://localhost:8448/rest/api/2/search?jql=project+%3D+ITSM&maxResults=5" \
  -H "Authorization: Bearer pamlab-dev-token"
```

**Response:**
```json
{
  "startAt": 0,
  "maxResults": 10,
  "total": 3,
  "issues": [
    { "id": "10001", "key": "ITSM-1", "fields": { "summary": "...", "status": { "name": "Open" }, ... } }
  ]
}
```

---

### Workflow Transitions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/api/2/issue/:issueIdOrKey/transitions` | List available transitions for the issue's current status |
| POST | `/rest/api/2/issue/:issueIdOrKey/transitions` | Execute a transition |

```bash
# Get available transitions
curl -s http://localhost:8448/rest/api/2/issue/ITSM-1/transitions \
  -H "Authorization: Bearer pamlab-dev-token"

# Execute a transition
curl -s -X POST http://localhost:8448/rest/api/2/issue/ITSM-1/transitions \
  -H "Authorization: Bearer pamlab-dev-token" \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "21"}}'
# → 204 No Content
```

**Workflows:**

| Issue Type | Transitions |
|------------|------------|
| Incident | Open → In Progress (21) → Waiting for Customer (31) → Resolved (41) → Closed (51) |
| Service Request | Open → Waiting for Approval (21) → In Progress (31) → Completed (41) → Closed (51) |
| Change | Open → Planning (21) → Awaiting Approval (31) → Implementing (41) → Review (51) → Closed (61) |
| Task / Bug | Any status → Closed (61) |

---

### Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/servicedeskapi/request/:requestId/approval` | List approvals |
| POST | `/rest/servicedeskapi/request/:requestId/approval` | Create approval |
| POST | `/rest/servicedeskapi/request/:requestId/approval/:approvalId/approve` | Approve |
| POST | `/rest/servicedeskapi/request/:requestId/approval/:approvalId/decline` | Decline |

---

### Assets (Insight)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/assets/1.0/objectschema/list` | List schemas |
| GET | `/rest/assets/1.0/objecttype/:schemaId` | Object types in schema |
| GET | `/rest/assets/1.0/object/:objectId` | Get asset |
| POST | `/rest/assets/1.0/object/create` | Create asset |
| PUT | `/rest/assets/1.0/object/:objectId` | Update asset |
| GET | `/rest/assets/1.0/object/aql` | AQL search |
| GET | `/rest/assets/1.0/objecttype/:typeId/objects` | Objects by type |

---

### Service Desk

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/servicedeskapi/servicedesk/:id/queue` | List queues |
| GET | `/rest/servicedeskapi/servicedesk/:id/queue/:queueId/issue` | Issues in queue |
| GET | `/rest/servicedeskapi/request/:requestId/sla` | SLA status |
| GET/POST | `/rest/servicedeskapi/customer` | Customers |
| GET/POST | `/rest/servicedeskapi/organization` | Organizations |
| GET | `/rest/servicedeskapi/organization/:orgId/user` | Org members |

---

### Webhooks & Misc

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET/DELETE | `/rest/api/2/webhook` | Webhook management |
| GET | `/rest/api/2/mypermissions` | Returns full permissions object |
| GET | `/rest/api/2/issue/createmeta` | Issue creation metadata |
| GET | `/health` | Health check |
| POST | `/reset` | Reset all data to seed state |

---

## Seed Data

**13 issues pre-loaded across two projects:**

| Key | Type | Priority | Summary |
|-----|------|----------|---------|
| ITSM-1 | Incident | Blocker | Database server unreachable |
| ITSM-2 | Incident | Critical | VPN authentication failures |
| ITSM-3 | Incident | Major | ERP application slow response |
| ITSM-4 | Incident | Minor | Printer not responding Floor 2 |
| ITSM-5 | Incident | Critical | Fudo PAM session recording gap |
| ITSM-6 | Incident | Major | Password rotation failed for svc accounts |
| ITSM-7 | Change | Critical | Upgrade Fudo PAM to v6.2 |
| ITSM-8 | Change | Blocker | Patch critical vulnerability on DC01 |
| ITSM-9 | Change | Major | Add new server to PAM monitoring |
| ITSM-10 | Change | Critical | AD group restructuring for RBAC |
| SEC-1 | Service Request | Major | Privileged access request for new engineer |
| SEC-2 | Service Request | Blocker | Emergency access revocation |
| SEC-3 | Service Request | Major | Password vault onboarding |

**10 users:** `admin`, `j.doe`, `a.smith`, `b.wilson`, `c.jones`, `svc-integration`, `svc-fudo-sync`, `svc-matrix42`, `t.developer`, `l.leaving`

**SLA policies:**

| Priority | Response | Resolution |
|----------|----------|------------|
| P1 Blocker | 1h | 4h |
| P2 Critical | 4h | 8h |
| P3 Major | 8h | 24h |
| P4 Minor | 24h | 72h |

---

## Body Parsing

The API accepts request bodies as either a parsed JSON object or a raw JSON string (regardless of `Content-Type`). This means clients that serialise the body before sending (e.g. `data=json.dumps(...)` in Python) work without any special configuration.

Invalid JSON strings return `400`.

---

## Pipeline Engine

The `pipeline-engine/` directory contains a minimal pipeline runner with a JSM connector. It can orchestrate multi-step workflows that create issues, execute transitions, and add comments.

```bash
cd pipeline-engine
npm install
npm start
# REST API on http://localhost:8446
```

---

## Running Tests

```bash
cd jsm-mock-api
npm install
npm test
# 39 tests — issues, search/JQL, transitions, auth, assets, SLA, body parsing
```

---

## License

[Apache License 2.0](LICENSE)
