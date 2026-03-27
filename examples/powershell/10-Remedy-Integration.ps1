<#
.SYNOPSIS
    PAMlab Example: BMC Remedy ITSM Integration
.DESCRIPTION
    Demonstrates integration with BMC Remedy / Helix ITSM Mock API:
    - JWT authentication (AR-JWT)
    - Incident management (list, create, assign, resolve)
    - Change request workflows
    - Asset/CMDB queries
    - SLA status checks
    - Qualification string queries
.NOTES
    Requires: remedy-mock-api running on port 8449
#>

param(
    [string]$RemedyUrl = "http://localhost:8449",
    [string]$Token = "pamlab-dev-token"
)

$ErrorActionPreference = "Stop"
$headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }

Write-Host "=== PAMlab: BMC Remedy ITSM Integration ===" -ForegroundColor Cyan

# ── 1. JWT Authentication (Remedy Native) ──
Write-Host "`n[1] JWT Authentication" -ForegroundColor Yellow
$loginBody = @{ username = "admin"; password = "admin" } | ConvertTo-Json
$jwtToken = Invoke-RestMethod -Uri "$RemedyUrl/api/jwt/login" -Method POST -Body $loginBody -ContentType "application/json"
Write-Host "  AR-JWT Token: $($jwtToken.Substring(0, 8))..."
$arHeaders = @{ "Authorization" = "AR-JWT $jwtToken"; "Content-Type" = "application/json" }

# ── 2. List Critical Incidents ──
Write-Host "`n[2] Critical Incidents (Qualification Query)" -ForegroundColor Yellow
$q = [System.Uri]::EscapeDataString("'Priority' = ""Critical""")
$incidents = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/entry/HPD%3AHelp%20Desk?q=$q" -Headers $arHeaders
Write-Host "  Found $($incidents._totalCount) critical incidents:"
foreach ($inc in $incidents.entries) {
    $v = $inc.values
    Write-Host "    $($v.'Incident Number'): $($v.Description) [$($v.Status)]" -ForegroundColor Red
}

# ── 3. Get Incident Details ──
Write-Host "`n[3] Incident Details" -ForegroundColor Yellow
$inc = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/incidents/INC000000005" -Headers $headers
$v = $inc.values
Write-Host "  $($v.'Incident Number'): $($v.Description)"
Write-Host "  Priority: $($v.Priority) | Status: $($v.Status)"
Write-Host "  Assigned: $($v.Assignee) ($($v.'Assigned Group'))"

# ── 4. Add Work Note ──
Write-Host "`n[4] Add Work Note to INC000000005" -ForegroundColor Yellow
$noteBody = @{ submitter = "svc-integration"; note = "Automated check: Fudo PAM appliance logs collected. Restart confirmed at 02:15 UTC." } | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/incidents/INC000000005/worknotes" -Method POST -Headers $headers -Body $noteBody
Write-Host "  Work note added. Updated notes:" -ForegroundColor Green
Write-Host "  $($result.values.'Work Notes')"

# ── 5. Resolve Incident ──
Write-Host "`n[5] Resolve INC000000008 (SSL Certificate)" -ForegroundColor Yellow
$resolveBody = @{ resolution = "SSL certificate renewed via Let's Encrypt automation. Valid until 2027-03-27."; reason = "No Further Action Required" } | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/incidents/INC000000008/resolve" -Method POST -Headers $headers -Body $resolveBody
Write-Host "  Status: $($result.values.Status) | Resolution: $($result.values.Resolution)" -ForegroundColor Green

# ── 6. Create New Incident ──
Write-Host "`n[6] Create New Incident" -ForegroundColor Yellow
$newIncident = @{
    values = @{
        "Incident Number" = "INC000000009"
        "Description" = "PAM integration health check failure"
        "Detailed Description" = "Automated health check detected Fudo PAM API returning 503 errors. Integration pipeline halted."
        "Status" = "New"
        "Impact" = "2-Significant/Large"
        "Urgency" = "1-Critical"
        "Priority" = "High"
        "Category" = "Application"
        "Type" = "Integration"
        "Assigned Group" = "Security Team"
        "Assignee" = "a.smith"
        "Submitter" = "svc-integration"
        "CI Name" = "FUDO-PAM"
    }
} | ConvertTo-Json -Depth 3
$created = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/entry/HPD%3AHelp%20Desk" -Method POST -Headers $headers -Body $newIncident
Write-Host "  Created: $($created.values.'Incident Number') — $($created.values.Description)" -ForegroundColor Green

# ── 7. Change Request Workflow ──
Write-Host "`n[7] Change Request Workflow" -ForegroundColor Yellow
$changes = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/changes" -Headers $headers
Write-Host "  Total changes: $($changes._totalCount)"
foreach ($chg in $changes.entries) {
    $v = $chg.values
    Write-Host "    $($v.'Change Number'): $($v.Description) [$($v.Status)] Risk=$($v.'Risk Level')"
}

# Approve and implement CRQ000000003
Write-Host "`n  Approving CRQ000000003..." -ForegroundColor Yellow
$null = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/changes/CRQ000000003/approve" -Method POST -Headers $headers -Body "{}"
$null = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/changes/CRQ000000003/implement" -Method POST -Headers $headers -Body "{}"
$chg = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/changes/CRQ000000003" -Headers $headers
Write-Host "  CRQ000000003 Status: $($chg.values.Status)" -ForegroundColor Green

# ── 8. Asset Topology ──
Write-Host "`n[8] Asset Topology for FUDO-PAM" -ForegroundColor Yellow
$topo = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/assets/FUDO-PAM/topology" -Headers $headers
Write-Host "  Manages: $($topo.relationships.usedBy.Count) assets"
foreach ($rel in $topo.relationships.usedBy) {
    Write-Host "    → $($rel.'CI Name') ($($rel.Relationship))"
}
Write-Host "  Related incidents: $($topo.relatedIncidents.Count)"

# ── 9. SLA Status ──
Write-Host "`n[9] SLA Status for INC000000001" -ForegroundColor Yellow
$sla = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/sla/status/INC000000001" -Headers $headers
Write-Host "  SLA: $($sla.sla) | Response: $($sla.response.status) | Resolution: $($sla.resolution.status)"

# ── 10. Incident Statistics ──
Write-Host "`n[10] Incident Statistics" -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$RemedyUrl/api/arsys/v1/incidents/stats" -Headers $headers
Write-Host "  Total: $($stats.total)"
Write-Host "  By Priority: $(($stats.byPriority | ConvertTo-Json -Compress))"
Write-Host "  By Status: $(($stats.byStatus | ConvertTo-Json -Compress))"

# ── Cleanup: JWT Logout ──
Write-Host "`n[Cleanup] JWT Logout" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$RemedyUrl/api/jwt/logout" -Method DELETE -Headers $arHeaders
Write-Host "  Session terminated" -ForegroundColor Green

Write-Host "`n=== Remedy Integration Complete ===" -ForegroundColor Cyan
