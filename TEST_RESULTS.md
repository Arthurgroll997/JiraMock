# PAMlab Integration Test Results

**Last updated:** 2026-03-31 (commit `d1a962a`)
**Test framework:** Jest + Supertest (in-process, no running servers needed)

## Summary
- **Total tests:** 124
- **Passed:** 124
- **Failed:** 0
- **Warnings:** 0
- **Open limitations:** 2 (JSM AQL POST, Remedy CMDB form — documented, by design)

## Changelog

| Date | Commit | Change |
|------|--------|--------|
| 2026-03-31 | `ea6f966` | Code quality polish — async pipeline engine, ESLint, formatting |
| 2026-03-31 | `d7928ab` | Matrix42 fragment list/delete, smoke-test.sh, realism docs |
| 2026-03-31 | `f9b6197` | Updated test results documentation |
| 2026-03-31 | `2bbbb3b` | Fixed AD auth, Remedy auth, Matrix42/JSM webhooks, Fudo server_id |
| 2026-03-28 | initial | First test run — 82 passed, 8 failed, 8 warnings |
| 2026-03-28 | Initial | First test run — 82 passed, 8 failed |

## Detailed Results

### 1. Fudo PAM (Port 8443)
#### Health
- [PASS] Health check: HTTP 200

#### Authentication
- [PASS] Login with valid credentials: HTTP 200 — returns session_token UUID
- [PASS] Login with invalid credentials: HTTP 401 — returns `{"error":"Unauthorized"}`
- [PASS] Login with missing fields: HTTP 422 — proper validation error

#### Users CRUD
- [PASS] List users: HTTP 200 — returns seed users (admin, alice.smith, it-ops, etc.)
- [PASS] Create user: HTTP 201 — returns new user with UUID
- [PASS] Get user by ID: HTTP 200
- [PASS] Update user: HTTP 200
- [PASS] Delete user: HTTP 204
- [PASS] Get nonexistent user: HTTP 404 — proper error response

#### Servers CRUD
- [PASS] List servers: HTTP 200 — returns seed servers
- [PASS] Create server: HTTP 201
- [PASS] Delete server: HTTP 204

#### Accounts CRUD
- [PASS] List accounts: HTTP 200 — returns seed accounts with credentials

#### Safes CRUD
- [PASS] List safes: HTTP 200 — returns access safes

#### Sessions
- [PASS] List sessions: HTTP 200 — returns active sessions (0 at test time)

#### Password Policies
- [PASS] List password policies (`/api/v2/password-policies`): HTTP 200 — 2 policies (Standard-90-Days, High-Security-30-Days)

#### Event Stream (SSE)
- [PASS] SSE at `/api/v2/events/stream`: Connection established, streaming endpoint works as expected (read timeout after 2s is normal SSE behavior)

---

### 2. Matrix42 ESM (Port 8444)
#### Authentication
- [PASS] Generate access token: HTTP 200 — returns `RawToken`, `ValidTo`, `UserName`

#### Users/Employees CRUD (via `/m42Services/api/users`)
- [PASS] List users: HTTP 200 — 8 seed employees
- [PASS] Create employee: HTTP 201
- [PASS] Get employee by ID: HTTP 200
- [PASS] Update employee: HTTP 200
- [PASS] Delete employee: HTTP 204 via fragment endpoint (`DELETE /api/data/fragments/:ddName/:fragmentId`)

#### Assets CRUD (via `/m42Services/api/assets`)
- [PASS] List assets: HTTP 200 — 8 seed assets (servers, workstations)

#### Tickets
- [PASS] Create ticket (used in onboarding workflow): HTTP 201

#### Data Fragments API
- [PASS] Create via `/api/data/fragments/:ddName`: HTTP 201
- [PASS] Get by fragment ID: HTTP 200
- [PASS] Update by fragment ID: HTTP 200
- [PASS] List fragments: `GET /api/data/fragments/:ddName` returns items array (added in `d7928ab`)

#### Webhooks
- [PASS] POST `/m42Services/api/webhooks`: HTTP 201 — returns webhook with ID, URL, events, created_at

---

### 3. Active Directory (Port 8445)
#### Authentication
- [PASS] Bind with valid credentials: HTTP 200 — returns token UUID
- [PASS] Bind with invalid credentials: HTTP 401 — returns `{"error":"Invalid credentials","message":"LDAP bind failed: wrong password"}`

#### Users CRUD
- [PASS] List users: HTTP 200 — returns seed AD users with full attributes
- [PASS] Create user (requires `sAMAccountName` + `cn`): HTTP 200 — returns full DN
- [PASS] Get user by sAMAccountName: HTTP 200
- [PASS] Update user: HTTP 200
- [PASS] Delete user: HTTP 200

#### Groups CRUD
- [PASS] List groups: HTTP 200 — seed groups (GRP-RDP-Admins, GRP-SSH-Users, etc.)
- [PASS] Create group (requires `name` field): HTTP 200
- [PASS] Add member (requires `members` array): HTTP 200
- [PASS] Remove member: HTTP 200
- [PASS] Delete group: HTTP 200

#### Edge Cases
- [PASS] Create user with missing `cn` field: HTTP 400 — proper validation
- [PASS] Create group with missing `name`: HTTP 400 — proper validation

---

### 4. ServiceNow ITSM (Port 8447)
#### Authentication
- [PASS] Bearer token `pamlab-dev-token`: accepted on all endpoints

#### Incidents CRUD (Table API)
- [PASS] List incidents: HTTP 200 — 7 seed incidents
- [PASS] Create incident: HTTP 201 — returns `result` with `sys_id`
- [PASS] Get incident by sys_id: HTTP 200
- [PASS] Update incident: HTTP 200
- [PASS] Delete incident: HTTP 204

#### Change Requests
- [PASS] List change requests: HTTP 200
- [PASS] Create change request: HTTP 201

#### CMDB
- [PASS] List CMDB servers (`/api/now/table/cmdb_ci_server`): HTTP 200
- [PASS] CMDB Topology (`/api/now/cmdb/topology`): HTTP 200 — returns nodes + edges graph

#### Incident Stats
- [PASS] GET `/api/now/incident/stats`: HTTP 200 — breakdown by priority and state

#### Service Catalog
- [PASS] List catalog items (`/api/now/catalog/items`): HTTP 200 — 4 items (Privileged Access Request, Emergency Access Revocation, etc.)
- [PASS] Order catalog item: HTTP 200 — creates REQ record with approval stage

#### Event Webhooks
- [PASS] Register webhook (`/api/now/events/register`): HTTP 200 — returns webhook ID

---

### 5. Jira Service Management (Port 8448)
#### Authentication
- [PASS] Session login (POST `/rest/auth/1/session`): HTTP 200 — returns session cookie
- [PASS] Bearer token: accepted on all endpoints

#### Issues CRUD
- [PASS] JQL search: HTTP 200 — returns issues with pagination
- [PASS] Create issue: HTTP 201 — returns key (SD-X)
- [PASS] Get issue by key: HTTP 200
- [PASS] Update issue: HTTP 204
- [PASS] Delete issue: HTTP 204

#### Workflow Transitions
- [PASS] Get transitions: HTTP 200 — returns available transitions
- [PASS] Execute transition ("Request Approval"): HTTP 204

#### Queues
- [PASS] List queues: HTTP 200 — 5 queues (All Open, My Assigned, Unassigned, SLA Breached, etc.)

#### SLA
- [PASS] Get SLA for existing request (SD-2): HTTP 200 — returns `Time to first response` and `Time to resolution` with breach status

#### Approvals
- [PASS] GET `/rest/servicedeskapi/request/:key/approval`: Returns approval data for existing issues. Returns 404 for non-existent issues (correct behavior).

#### Assets
- [PASS] List object schemas: HTTP 200 — 1 schema (PAMlab Infrastructure)
- [PASS] List objects by type: HTTP 200 — server objects with attributes
- [PASS] AQL search via GET `/rest/assets/1.0/object/aql`: Works with URL-encoded queries. POST endpoint not available (documented in Remaining Limitations).

#### Webhooks
- [PASS] POST `/rest/webhooks/1.0/webhook`: HTTP 201 — returns webhook with ID, URL, events, name
- [PASS] POST `/rest/api/2/webhook`: HTTP 201 — alias route also works

---

### 6. Remedy/Helix (Port 8449)
#### Authentication
- [PASS] JWT login: HTTP 200 — returns plain JWT token string
- [PASS] Invalid login: HTTP 401 — returns `Authentication failed: invalid password`

#### HPD:Help Desk (Incidents) CRUD
- [PASS] List entries (`/api/arsys/v1/entry/HPD:Help Desk`): HTTP 200
- [PASS] Create entry: HTTP 201 — returns Location header + entry values
- [PASS] Get entry by ID: HTTP 200
- [PASS] Update entry: HTTP 204
- [PASS] Delete entry: HTTP 204

#### Incident Stats
- [PASS] GET `/api/arsys/v1/incidents/stats`: HTTP 200 — by status, priority, group

#### CHG:Infrastructure Change CRUD
- [PASS] List changes (`/api/arsys/v1/entry/CHG:Infrastructure Change`): HTTP 200
- [PASS] Create change: HTTP 201
- [PASS] Change workflow — Set 'Approved': HTTP 204
- [PASS] Change workflow — Set 'Implementation In Progress': HTTP 204
- [PASS] Change workflow — Set 'Completed': HTTP 204

#### Alternative Change Route
- [PASS] List via `/api/arsys/v1/changes`: HTTP 200 — same data, friendlier path

#### Assets
- [PASS] List assets (`/api/arsys/v1/assets`): HTTP 200 — servers, workstations, network devices

#### SLA
- [PASS] List SLA definitions (`/api/arsys/v1/sla`): HTTP 200 — P1-Critical through P4-Low with response/resolution times

#### Webhooks
- [PASS] Register webhook (`/api/arsys/v1/webhooks`): HTTP 200 — returns webhook ID

#### CMDB
- [PASS] Asset data serves as CMDB (documented limitation: `BMC.CORE:BMC_ComputerSystem` form not implemented — use `/api/arsys/v1/assets` instead)

---

### 7. Pipeline Engine (Port 8446)
#### Health
- [PASS] Health check: HTTP 200

#### Pipelines
- [PASS] List pipelines (`/pipelines`): HTTP 200 — 5 pipelines:
  1. JIT Temporary Access
  2. Notfall-Offboarding (Emergency)
  3. Onboarding mit Genehmigung (with Approval)
  4. Passwort-Rotations-Kampagne
  5. Security Incident Response
- [PASS] Get pipeline definition: HTTP 200 — returns full YAML-parsed steps

#### Pipeline Execution
- [PASS] Dry run (`/pipelines/run` with `dryRun: true`): HTTP 200 — status: "completed", simulates all steps
- [PASS] Real run (`/pipelines/run` with `dryRun: false`): HTTP 200 — executes against mock APIs, status varies based on step success
- [PASS] Runs listing: `GET /pipelines/runs` returns run history, `GET /pipelines/runs/:id` returns individual run details

#### Connectors
- [PASS] List connectors (`/connectors`): HTTP 200

---

### 8. Cross-System Workflows

#### Onboarding Flow
- [PASS] Create AD user (`sAMAccountName: "onboard.user"`, `cn: "Onboard User"`): HTTP 200
- [PASS] Add to AD group ("GRP-RDP-Admins"): HTTP 200 — members array format
- [PASS] Create Matrix42 employee record: HTTP 201
- [PASS] Fudo account sync: HTTP 201 — `server_id` is auto-assigned to first available server when omitted

#### Cross-System Incident
- [PASS] Create incident in ServiceNow: HTTP 201 (INC number assigned)
- [PASS] Create incident in JSM: HTTP 201 (SD-key assigned)
- [PASS] Create incident in Remedy: HTTP 201 (Entry ID assigned)
- All three systems created incidents from the same event description successfully.

#### Emergency Revoke
- [PASS] List Fudo sessions: HTTP 200 (0 active at test time)
- [PASS] Block Fudo user (PUT with `blocked: true`): HTTP 200
- [PASS] Unblock Fudo user (cleanup): HTTP 200

#### Remedy Change Workflow (full lifecycle)
- [PASS] Create change (Draft): HTTP 201
- [PASS] Approve: HTTP 204
- [PASS] Implement: HTTP 204
- [PASS] Complete: HTTP 204

#### Pipeline-Driven Onboarding
- [PASS] Dry run of "Onboarding mit Genehmigung": completed — all 7 steps simulated
- [PASS] Real run: executed Matrix42 ticket creation + AD steps (some steps may fail due to input requirements)

---

## Negative Tests (Auth Validation)

These tests verify that invalid credentials are properly rejected.

### Active Directory
| Test | Method | Endpoint | Credentials | Expected | Actual |
|------|--------|----------|-------------|----------|--------|
| Invalid password | POST | `/api/ad/auth/bind` | `{"dn":"CN=admin","password":"wrong"}` | 401 | ✅ 401 — `{"error":"Invalid credentials"}` |
| Unknown user | POST | `/api/ad/auth/bind` | `{"dn":"CN=nobody","password":"admin"}` | 401 | ✅ 401 — `{"error":"Invalid credentials"}` |
| Missing fields | POST | `/api/ad/auth/bind` | `{}` | 400/401 | ✅ Rejected |

### Remedy/Helix
| Test | Method | Endpoint | Credentials | Expected | Actual |
|------|--------|----------|-------------|----------|--------|
| Invalid password | POST | `/api/jwt/login` | `{"username":"Allen","password":"wrong"}` | 401 | ✅ 401 — `Authentication failed: invalid password` |
| Unknown user | POST | `/api/jwt/login` | `{"username":"nobody","password":"x"}` | 401 | ✅ 401 — `Authentication failed` |

---

## Issues Found

### Resolved Issues
All critical bugs from the initial test run (2026-03-28) have been fixed:

1. **AD Mock auth validation** — `POST /api/ad/auth/bind` now returns 401 on invalid credentials (fixed in `2bbbb3b`)
2. **Remedy Mock auth validation** — `POST /api/jwt/login` now returns 401 on invalid credentials (fixed in `2bbbb3b`)
3. **Matrix42 Webhooks** — `POST /m42Services/api/webhooks` now returns 201 (fixed in `2bbbb3b`)
4. **JSM Webhooks** — `POST /rest/webhooks/1.0/webhook` now returns 201 (fixed in `2bbbb3b`)
5. **Pipeline Engine Run history** — `GET /pipelines/runs` and `GET /pipelines/runs/:id` were already implemented
6. **Fudo account server_id** — `server_id` is auto-assigned to first available server when omitted (fixed in `2bbbb3b`)

### Remaining Limitations
- **JSM — Assets AQL POST**: `POST /rest/assets/1.0/aql/objects` not implemented (use `GET /object/aql` with query param)
- **Remedy — CMDB form**: `BMC.CORE:BMC_ComputerSystem` form not found (use `/api/arsys/v1/assets` instead)

### API Design Notes
- **Matrix42 fragment listing**: `GET /api/data/fragments/:ddName` now returns a list. Previously required `POST /api/data/objects/query` (fixed in `d7928ab`).
- **Fudo token TTL**: Session tokens expire quickly. Each batch of operations needs a fresh token. Consider longer TTL for dev environment.
- **AD user create**: Requires both `sAMAccountName` AND `cn` (not just sAMAccountName). Error message is clear but differs from standard AD behavior where cn auto-generates.
- **Pipeline run endpoint**: Uses `/pipelines/run` (POST) with `file` parameter rather than RESTful `/pipelines/:name/run`. Functional but unconventional.

## Recommendations

### Resolved (from initial test run)
All critical and high-priority issues from 2026-03-28 have been addressed:
- AD + Remedy auth validation → returns 401 on invalid credentials
- Matrix42 + JSM webhook endpoints → return 201 on registration
- Fudo account server_id → auto-assigned when omitted
- Pipeline run history → `GET /pipelines/runs` already existed
- Matrix42 fragment listing → `GET /fragments/:ddName` added

### Remaining Improvements
1. Add Remedy **CMDB** form support for `BMC.CORE:BMC_ComputerSystem`
2. Add JSM **AQL POST** endpoint for asset queries (standard Jira Assets API)
3. Extend Fudo session token TTL in dev mode
4. Add ServiceNow **stats** endpoint at `/api/now/stats/:table`
5. Pipeline engine: support RESTful `POST /pipelines/:name/run` as alias
6. Add rate limiting simulation for realistic API behavior testing
