<#
.SYNOPSIS
    PAMlab - Jira Service Management (JSM) Mock API Integration Examples
.DESCRIPTION
    Demonstrates JSM REST API operations: auth, issues, JQL search,
    transitions, approvals, assets, and SLA tracking.
#>

$JSM_URL = "http://localhost:8448"
$Token = "pamlab-dev-token"
$Headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }

Write-Host "=== PAMlab JSM Integration Examples ===" -ForegroundColor Cyan

# ── 1. Health Check ──
Write-Host "`n[1] Health Check" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$JSM_URL/health" -Method Get
Write-Host "Status: $($health.status) | Service: $($health.service)"

# ── 2. Session Auth ──
Write-Host "`n[2] Session Authentication" -ForegroundColor Yellow
$loginBody = @{ username = "j.doe"; password = "password" } | ConvertTo-Json
$session = Invoke-RestMethod -Uri "$JSM_URL/rest/auth/1/session" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable jsmSession
Write-Host "Logged in as: $($session.session.name)"

# ── 3. Get Issue ──
Write-Host "`n[3] Get Issue ITSM-1" -ForegroundColor Yellow
$issue = Invoke-RestMethod -Uri "$JSM_URL/rest/api/2/issue/ITSM-1" -Headers $Headers
Write-Host "Key: $($issue.key) | Summary: $($issue.fields.summary)"
Write-Host "Priority: $($issue.fields.priority.name) | Status: $($issue.fields.status.name)"
Write-Host "Assignee: $($issue.fields.assignee.displayName)"

# ── 4. Create Incident from Fudo Anomaly ──
Write-Host "`n[4] Create Incident from Fudo Anomaly" -ForegroundColor Yellow
$newIssue = @{
    fields = @{
        project = @{ key = "ITSM" }
        summary = "Fudo PAM: Suspicious session detected on DB-PROD"
        description = "Automated alert: Unusual command patterns detected during privileged session on DB-PROD (10.0.1.20). User svc-integration executed DROP TABLE command at 03:42 UTC."
        issuetype = @{ name = "Incident" }
        priority = @{ id = "2"; name = "Critical" }
        assignee = @{ key = "b.wilson" }
    }
} | ConvertTo-Json -Depth 5
$created = Invoke-RestMethod -Uri "$JSM_URL/rest/api/2/issue" -Method Post -Headers $Headers -Body $newIssue
Write-Host "Created: $($created.key) (ID: $($created.id))"

# ── 5. Search with JQL ──
Write-Host "`n[5] JQL Search - All Open Incidents" -ForegroundColor Yellow
$searchBody = @{ jql = "project = ITSM AND issuetype = Incident AND status = Open"; maxResults = 10 } | ConvertTo-Json
$results = Invoke-RestMethod -Uri "$JSM_URL/rest/api/2/search" -Method Post -Headers $Headers -Body $searchBody
Write-Host "Found $($results.total) open incidents:"
foreach ($i in $results.issues) {
    Write-Host "  $($i.key): $($i.fields.summary) [$($i.fields.priority.name)]"
}

# ── 6. Search - Critical and Blocker ──
Write-Host "`n[6] JQL Search - Critical/Blocker Issues" -ForegroundColor Yellow
$searchBody = @{ jql = "priority = Blocker OR priority = Critical"; maxResults = 20 } | ConvertTo-Json
$results = Invoke-RestMethod -Uri "$JSM_URL/rest/api/2/search" -Method Post -Headers $Headers -Body $searchBody
Write-Host "Found $($results.total) critical/blocker issues:"
foreach ($i in $results.issues) {
    Write-Host "  $($i.key): $($i.fields.summary) [$($i.fields.priority.name)/$($i.fields.status.name)]"
}

# ── 7. Transition Issue Through Workflow ──
Write-Host "`n[7] Transition ITSM-1: Open -> In Progress" -ForegroundColor Yellow
$transitions = Invoke-RestMethod -Uri "$JSM_URL/rest/api/2/issue/ITSM-1/transitions" -Headers $Headers
Write-Host "Available transitions:"
foreach ($t in $transitions.transitions) {
    Write-Host "  ID: $($t.id) - $($t.name) -> $($t.to.name)"
}
$transBody = @{ transition = @{ id = "21" } } | ConvertTo-Json
Invoke-RestMethod -Uri "$JSM_URL/rest/api/2/issue/ITSM-1/transitions" -Method Post -Headers $Headers -Body $transBody
$updated = Invoke-RestMethod -Uri "$JSM_URL/rest/api/2/issue/ITSM-1" -Headers $Headers
Write-Host "ITSM-1 new status: $($updated.fields.status.name)"

# ── 8. Approvals ──
Write-Host "`n[8] Approvals for SEC-1" -ForegroundColor Yellow
$approvals = Invoke-RestMethod -Uri "$JSM_URL/rest/servicedeskapi/request/SEC-1/approval" -Headers $Headers
Write-Host "Approvals: $($approvals.size)"
foreach ($a in $approvals.values) {
    Write-Host "  ID: $($a.id) | Status: $($a.status) | Approvers: $($a.approvers.Count)"
}

# Create and approve
Write-Host "`n  Creating new approval..." -ForegroundColor Gray
$approvalBody = @{ approvers = @("c.jones"); requiredApprovers = 1 } | ConvertTo-Json
$newApproval = Invoke-RestMethod -Uri "$JSM_URL/rest/servicedeskapi/request/SEC-1/approval" -Method Post -Headers $Headers -Body $approvalBody
Write-Host "  Created approval: $($newApproval.id)"
$approved = Invoke-RestMethod -Uri "$JSM_URL/rest/servicedeskapi/request/SEC-1/approval/$($newApproval.id)/approve" -Method Post -Headers $Headers
Write-Host "  Approval status: $($approved.status)"

# ── 9. Query Assets ──
Write-Host "`n[9] Query Assets" -ForegroundColor Yellow
$schemas = Invoke-RestMethod -Uri "$JSM_URL/rest/assets/1.0/objectschema/list" -Headers $Headers
Write-Host "Schemas: $($schemas.objectschemas.Count)"
foreach ($s in $schemas.objectschemas) {
    Write-Host "  $($s.name) ($($s.objectCount) objects)"
}

$servers = Invoke-RestMethod -Uri "$JSM_URL/rest/assets/1.0/objecttype/1/objects" -Headers $Headers
Write-Host "Server objects:"
foreach ($obj in $servers) {
    $ip = ($obj.attributes | Where-Object { $_.name -eq "IP Address" }).value
    Write-Host "  $($obj.name) - $ip"
}

# AQL Search
$aql = Invoke-RestMethod -Uri "$JSM_URL/rest/assets/1.0/object/aql?aql=Name%3DDC01" -Headers $Headers
Write-Host "AQL search for DC01: $($aql.totalFilterCount) result(s)"

# ── 10. SLA Status ──
Write-Host "`n[10] SLA Status for ITSM-1" -ForegroundColor Yellow
$sla = Invoke-RestMethod -Uri "$JSM_URL/rest/servicedeskapi/request/ITSM-1/sla" -Headers $Headers
foreach ($s in $sla.values) {
    $pct = [math]::Round($s.ongoingCycle.percentageElapsed, 1)
    $breached = if ($s.ongoingCycle.breached) { "BREACHED" } else { "OK" }
    Write-Host "  $($s.name): ${pct}% elapsed - Remaining: $($s.ongoingCycle.remainingTime.friendly) [$breached]"
}

Write-Host "`n=== JSM Integration Examples Complete ===" -ForegroundColor Cyan
