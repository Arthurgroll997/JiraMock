# BMC Remedy / Helix ITSM Mock API

Mock server for BMC Remedy ITSM REST API, part of the PAMlab developer sandbox.

## Quick Start

```bash
npm install
npm start
# Server runs on http://localhost:8449
```

## Authentication

### JWT (Remedy Native)
```bash
# Login — returns plain text token
TOKEN=$(curl -s -X POST http://localhost:8449/api/jwt/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}')

# Use token
curl -H "Authorization: AR-JWT $TOKEN" http://localhost:8449/api/arsys/v1/entry/HPD%3AHelp%20Desk

# Logout
curl -X DELETE -H "Authorization: AR-JWT $TOKEN" http://localhost:8449/api/jwt/logout
```

### Bearer Token (PAMlab Convenience)
```bash
curl -H "Authorization: Bearer pamlab-dev-token" http://localhost:8449/api/arsys/v1/entry/HPD%3AHelp%20Desk
```

### Basic Auth
```bash
curl -u admin:admin http://localhost:8449/api/arsys/v1/entry/HPD%3AHelp%20Desk
```

## API Endpoints

### Generic Entry API (Remedy Forms)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/arsys/v1/entry/{formName}` | List entries |
| GET | `/api/arsys/v1/entry/{formName}/{id}` | Get entry |
| POST | `/api/arsys/v1/entry/{formName}` | Create entry |
| PUT | `/api/arsys/v1/entry/{formName}/{id}` | Update entry |
| DELETE | `/api/arsys/v1/entry/{formName}/{id}` | Delete entry |

**Available Forms:**
- `HPD:Help Desk` — Incidents
- `CHG:Infrastructure Change` — Change Requests
- `AST:ComputerSystem` — Assets/CMDB
- `CTM:People` — People/Contacts
- `CTM:Support Group` — Support Groups
- `WOI:WorkOrder` — Work Orders
- `SLA:SLADefinition` — SLA Definitions

**Query Parameters:**
- `q` — Qualification string: `'Status' = "New" AND 'Priority' = "Critical"`
- `fields` — Comma-separated field list
- `sort` — Sort field with direction: `Incident Number.asc`
- `offset` / `limit` — Pagination

### Convenience Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/arsys/v1/incidents` | List incidents |
| GET | `/api/arsys/v1/incidents/stats` | Incident statistics |
| GET | `/api/arsys/v1/incidents/{id}` | Get incident |
| POST | `/api/arsys/v1/incidents/{id}/assign` | Assign incident |
| POST | `/api/arsys/v1/incidents/{id}/resolve` | Resolve incident |
| POST | `/api/arsys/v1/incidents/{id}/reopen` | Reopen incident |
| POST | `/api/arsys/v1/incidents/{id}/worknotes` | Add work note |
| GET | `/api/arsys/v1/changes` | List changes |
| GET | `/api/arsys/v1/changes/{id}` | Get change |
| POST | `/api/arsys/v1/changes/{id}/schedule` | Schedule change |
| POST | `/api/arsys/v1/changes/{id}/approve` | Approve change |
| POST | `/api/arsys/v1/changes/{id}/reject` | Reject change |
| POST | `/api/arsys/v1/changes/{id}/implement` | Start implementation |
| POST | `/api/arsys/v1/changes/{id}/complete` | Complete change |
| GET | `/api/arsys/v1/changes/{id}/tasks` | List change tasks |
| GET | `/api/arsys/v1/assets` | List assets |
| GET | `/api/arsys/v1/assets/{id}` | Get asset |
| GET | `/api/arsys/v1/assets/{id}/topology` | Asset topology |
| GET | `/api/arsys/v1/people` | List people |
| GET | `/api/arsys/v1/people/groups` | List support groups |
| GET | `/api/arsys/v1/people/groups/{name}/members` | Group members |
| GET | `/api/arsys/v1/people/{id}` | Get person |
| GET | `/api/arsys/v1/workorders` | List work orders |
| POST | `/api/arsys/v1/workorders/{id}/assign` | Assign work order |
| POST | `/api/arsys/v1/workorders/{id}/complete` | Complete work order |
| GET | `/api/arsys/v1/sla` | List SLA definitions |
| GET | `/api/arsys/v1/sla/status/{incidentId}` | SLA status for incident |
| POST | `/api/arsys/v1/webhooks` | Register webhook |
| GET | `/api/arsys/v1/webhooks` | List webhooks |
| DELETE | `/api/arsys/v1/webhooks/{id}` | Delete webhook |

## Response Format

Follows BMC Remedy REST API format:
```json
{
  "entries": [
    {
      "values": { "Incident Number": "INC000000001", ... },
      "_links": { "self": [{"href": "..."}] }
    }
  ],
  "_totalCount": 8
}
```

## Seed Data

- **8 Incidents** — Critical PAM/infrastructure scenarios
- **5 Change Requests** — PAM upgrades, patching, compliance
- **5 Assets** — DC01, DB-PROD, APP-ERP, FILE-SRV01, FUDO-PAM
- **10 People** — Matching AD mock users
- **5 Support Groups** — IT Ops, Security, Service Desk, Network Ops, CAB
- **3 Work Orders** — PAM configuration, patching, decommission
- **4 SLA Definitions** — P1-P4

## Docker

```bash
docker build -t remedy-mock-api .
docker run -p 8449:8449 remedy-mock-api
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8449 | Server port |
| DEFAULT_API_TOKEN | pamlab-dev-token | Default Bearer/AR-JWT token |
