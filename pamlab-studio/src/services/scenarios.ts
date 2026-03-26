import type { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Provision a new employee with AD account, server access via Fudo PAM, and ESM service catalog entry.',
    systems: ['Active Directory', 'Fudo PAM', 'Matrix42 ESM'],
    steps: [
      'Create AD user account',
      'Add user to security groups',
      'Create Fudo PAM user',
      'Assign server access in Fudo',
      'Create ESM ticket for onboarding',
    ],
    template: `# Onboarding Scenario
$fudoBase = "http://localhost:8443"
$matrixBase = "http://localhost:8444"
$adBase = "http://localhost:8445"

# Step 1: Create AD User
$adUser = @{
  username = "jdoe"
  firstName = "John"
  lastName = "Doe"
  email = "jdoe@corp.local"
  department = "Engineering"
}
Invoke-RestMethod -Uri "$adBase/api/users" -Method POST -Body ($adUser | ConvertTo-Json) -ContentType "application/json"

# Step 2: Add to Groups
Invoke-RestMethod -Uri "$adBase/api/groups/engineers/members" -Method POST -Body '{"username":"jdoe"}' -ContentType "application/json"

# Step 3: Create Fudo PAM User
$pamUser = @{
  name = "jdoe"
  email = "jdoe@corp.local"
}
Invoke-RestMethod -Uri "$fudoBase/api/v2/users" -Method POST -Body ($pamUser | ConvertTo-Json) -ContentType "application/json"

# Step 4: Create Access Request
$request = @{
  user_id = 1
  server_id = 1
  justification = "New employee onboarding"
}
Invoke-RestMethod -Uri "$fudoBase/api/v2/access-requests" -Method POST -Body ($request | ConvertTo-Json) -ContentType "application/json"

# Step 5: Create ESM Ticket
$ticket = @{
  title = "Onboarding: John Doe"
  description = "New employee onboarding - Engineering"
  priority = "medium"
  category = "onboarding"
}
Invoke-RestMethod -Uri "$matrixBase/api/tickets" -Method POST -Body ($ticket | ConvertTo-Json) -ContentType "application/json"
`,
  },
  {
    id: 'offboarding',
    name: 'Offboarding',
    description: 'Revoke all access for a departing employee across all systems.',
    systems: ['Active Directory', 'Fudo PAM', 'Matrix42 ESM'],
    steps: [
      'Disable AD account',
      'Remove from all groups',
      'Revoke Fudo PAM sessions',
      'Delete Fudo PAM user',
      'Create ESM offboarding ticket',
    ],
    template: `# Offboarding Scenario
$fudoBase = "http://localhost:8443"
$matrixBase = "http://localhost:8444"
$adBase = "http://localhost:8445"

# Step 1: Disable AD Account
Invoke-RestMethod -Uri "$adBase/api/users/jdoe/disable" -Method POST -ContentType "application/json"

# Step 2: Remove from Groups
Invoke-RestMethod -Uri "$adBase/api/groups/engineers/members/jdoe" -Method DELETE

# Step 3: Revoke Active Sessions
Invoke-RestMethod -Uri "$fudoBase/api/v2/sessions/revoke" -Method POST -Body '{"user_id":1}' -ContentType "application/json"

# Step 4: Delete PAM User
Invoke-RestMethod -Uri "$fudoBase/api/v2/users/1" -Method DELETE

# Step 5: ESM Ticket
$ticket = @{
  title = "Offboarding: John Doe"
  description = "Employee departure - revoke all access"
  priority = "high"
  category = "offboarding"
}
Invoke-RestMethod -Uri "$matrixBase/api/tickets" -Method POST -Body ($ticket | ConvertTo-Json) -ContentType "application/json"
`,
  },
  {
    id: 'role-change',
    name: 'Role Change',
    description: 'Update group memberships and access when an employee changes roles.',
    systems: ['Active Directory', 'Fudo PAM'],
    steps: [
      'Remove from old groups',
      'Add to new groups',
      'Update Fudo access policies',
    ],
    template: `# Role Change Scenario
$fudoBase = "http://localhost:8443"
$adBase = "http://localhost:8445"

# Step 1: Remove from old group
Invoke-RestMethod -Uri "$adBase/api/groups/engineering/members/jdoe" -Method DELETE

# Step 2: Add to new group
Invoke-RestMethod -Uri "$adBase/api/groups/management/members" -Method POST -Body '{"username":"jdoe"}' -ContentType "application/json"

# Step 3: Update Fudo access
Invoke-RestMethod -Uri "$fudoBase/api/v2/access-requests" -Method POST -Body '{"user_id":1,"server_id":2,"justification":"Role change to management"}' -ContentType "application/json"
`,
  },
  {
    id: 'jit-access',
    name: 'JIT Access',
    description: 'Just-In-Time privileged access request with automatic expiry.',
    systems: ['Fudo PAM', 'Matrix42 ESM'],
    steps: [
      'Create access request with time limit',
      'Approve request',
      'Log ESM ticket',
    ],
    template: `# JIT Access Scenario
$fudoBase = "http://localhost:8443"
$matrixBase = "http://localhost:8444"

# Step 1: Create time-limited access request
$request = @{
  user_id = 1
  server_id = 1
  justification = "Emergency maintenance - 2h window"
  duration_minutes = 120
}
Invoke-RestMethod -Uri "$fudoBase/api/v2/access-requests" -Method POST -Body ($request | ConvertTo-Json) -ContentType "application/json"

# Step 2: Approve request
Invoke-RestMethod -Uri "$fudoBase/api/v2/access-requests/1/approve" -Method POST -ContentType "application/json"

# Step 3: Log in ESM
$ticket = @{
  title = "JIT Access: Emergency Maintenance"
  description = "Time-limited access granted for 2 hours"
  priority = "high"
  category = "access-request"
}
Invoke-RestMethod -Uri "$matrixBase/api/tickets" -Method POST -Body ($ticket | ConvertTo-Json) -ContentType "application/json"
`,
  },
  {
    id: 'emergency-revoke',
    name: 'Emergency Revoke',
    description: 'Immediately revoke all sessions and access for a compromised account.',
    systems: ['Fudo PAM', 'Active Directory'],
    steps: [
      'Kill all active sessions',
      'Lock AD account',
      'Revoke all access',
    ],
    template: `# Emergency Revoke Scenario
$fudoBase = "http://localhost:8443"
$adBase = "http://localhost:8445"

# Step 1: Kill all active sessions
Invoke-RestMethod -Uri "$fudoBase/api/v2/sessions/revoke" -Method POST -Body '{"user_id":1}' -ContentType "application/json"

# Step 2: Lock AD Account
Invoke-RestMethod -Uri "$adBase/api/users/jdoe/disable" -Method POST -ContentType "application/json"

# Step 3: Revoke all pending access requests
Invoke-RestMethod -Uri "$fudoBase/api/v2/access-requests/revoke-all" -Method POST -Body '{"user_id":1}' -ContentType "application/json"
`,
  },
  {
    id: 'password-rotation',
    name: 'Password Rotation',
    description: 'Rotate passwords for service accounts across systems.',
    systems: ['Active Directory', 'Fudo PAM'],
    steps: [
      'Generate new password',
      'Update AD password',
      'Update Fudo credentials',
    ],
    template: `# Password Rotation Scenario
$fudoBase = "http://localhost:8443"
$adBase = "http://localhost:8445"

# Step 1: Reset AD Password
Invoke-RestMethod -Uri "$adBase/api/users/svc-account/reset-password" -Method POST -Body '{"newPassword":"NewSecure!Pass123"}' -ContentType "application/json"

# Step 2: Update Fudo PAM credentials
Invoke-RestMethod -Uri "$fudoBase/api/v2/servers/1/credentials" -Method PUT -Body '{"password":"NewSecure!Pass123"}' -ContentType "application/json"
`,
  },
  {
    id: 'audit-report',
    name: 'Audit Report',
    description: 'Gather data from all systems for a compliance audit report.',
    systems: ['Fudo PAM', 'Matrix42 ESM', 'Active Directory'],
    steps: [
      'Fetch all users from AD',
      'Fetch Fudo session logs',
      'Fetch ESM tickets',
    ],
    template: `# Audit Report Scenario
$fudoBase = "http://localhost:8443"
$matrixBase = "http://localhost:8444"
$adBase = "http://localhost:8445"

# Step 1: Get all AD users
Invoke-RestMethod -Uri "$adBase/api/users" -Method GET

# Step 2: Get Fudo session logs
Invoke-RestMethod -Uri "$fudoBase/api/v2/sessions" -Method GET

# Step 3: Get all ESM tickets
Invoke-RestMethod -Uri "$matrixBase/api/tickets" -Method GET

# Step 4: Get Fudo users
Invoke-RestMethod -Uri "$fudoBase/api/v2/users" -Method GET

# Step 5: Get AD groups
Invoke-RestMethod -Uri "$adBase/api/groups" -Method GET
`,
  },
];
