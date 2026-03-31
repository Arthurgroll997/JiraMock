const { v4: uuidv4 } = require('uuid');
const store = require('./store');

function seed() {
  const ts = '2026-03-27T20:00:00.000+0000';

  // ── Users ──
  store.users = [
    {
      key: 'admin',
      displayName: 'System Administrator',
      emailAddress: 'admin@pamlab.local',
      active: true,
    },
    { key: 'j.doe', displayName: 'John Doe', emailAddress: 'j.doe@pamlab.local', active: true },
    {
      key: 'a.smith',
      displayName: 'Alice Smith',
      emailAddress: 'a.smith@pamlab.local',
      active: true,
    },
    {
      key: 'b.wilson',
      displayName: 'Bob Wilson',
      emailAddress: 'b.wilson@pamlab.local',
      active: true,
    },
    {
      key: 'c.jones',
      displayName: 'Carol Jones',
      emailAddress: 'c.jones@pamlab.local',
      active: true,
    },
    {
      key: 'svc-integration',
      displayName: 'Service Integration',
      emailAddress: 'svc-integration@pamlab.local',
      active: true,
    },
    {
      key: 'svc-fudo-sync',
      displayName: 'Fudo Sync Service',
      emailAddress: 'svc-fudo-sync@pamlab.local',
      active: true,
    },
    {
      key: 'svc-matrix42',
      displayName: 'Matrix42 Sync Service',
      emailAddress: 'svc-matrix42@pamlab.local',
      active: true,
    },
    {
      key: 't.developer',
      displayName: 'Tom Developer',
      emailAddress: 't.developer@pamlab.local',
      active: true,
    },
    {
      key: 'l.leaving',
      displayName: 'Lisa Leaving',
      emailAddress: 'l.leaving@pamlab.local',
      active: false,
    },
  ];

  // ── Projects ──
  store.projects = [
    {
      id: '1',
      key: 'ITSM',
      name: 'IT Service Management',
      projectTypeKey: 'service_desk',
      lead: { key: 'j.doe', displayName: 'John Doe' },
    },
    {
      id: '2',
      key: 'SEC',
      name: 'Security',
      projectTypeKey: 'service_desk',
      lead: { key: 'b.wilson', displayName: 'Bob Wilson' },
    },
  ];

  // ── Transitions (workflow definitions) ──
  store.transitions = {
    Incident: [
      { from: 'Open', to: 'In Progress', id: '21', name: 'Start Progress' },
      { from: 'In Progress', to: 'Waiting for Customer', id: '31', name: 'Pending Customer' },
      { from: 'In Progress', to: 'Resolved', id: '41', name: 'Resolve' },
      { from: 'Waiting for Customer', to: 'In Progress', id: '22', name: 'Resume Progress' },
      { from: 'Resolved', to: 'Closed', id: '51', name: 'Close' },
      { from: 'Resolved', to: 'In Progress', id: '23', name: 'Reopen' },
    ],
    'Service Request': [
      { from: 'Open', to: 'Waiting for Approval', id: '61', name: 'Request Approval' },
      { from: 'Waiting for Approval', to: 'In Progress', id: '62', name: 'Approve & Start' },
      { from: 'Waiting for Approval', to: 'Open', id: '63', name: 'Decline' },
      { from: 'In Progress', to: 'Completed', id: '64', name: 'Complete' },
      { from: 'Completed', to: 'Closed', id: '65', name: 'Close' },
    ],
    Change: [
      { from: 'Open', to: 'Planning', id: '71', name: 'Start Planning' },
      { from: 'Planning', to: 'Awaiting Approval', id: '72', name: 'Submit for Approval' },
      { from: 'Awaiting Approval', to: 'Implementing', id: '73', name: 'Approve' },
      { from: 'Awaiting Approval', to: 'Open', id: '74', name: 'Reject' },
      { from: 'Implementing', to: 'Review', id: '75', name: 'Implementation Done' },
      { from: 'Review', to: 'Closed', id: '76', name: 'Close' },
      { from: 'Review', to: 'Implementing', id: '77', name: 'Rework' },
    ],
  };

  // Helper to build user ref
  function userRef(key) {
    const u = store.users.find((u) => u.key === key);
    return u ? { key: u.key, displayName: u.displayName, emailAddress: u.emailAddress } : null;
  }

  // ── Issues ──
  let idCounter = 10000;
  function makeIssue(
    key,
    typeName,
    priorityId,
    priorityName,
    summary,
    description,
    statusName,
    assigneeKey,
    reporterKey,
    extra,
  ) {
    idCounter++;
    return {
      id: String(idCounter),
      key,
      fields: {
        summary,
        description,
        issuetype: {
          id: String(
            ['Incident', 'Service Request', 'Change', 'Problem', 'Task', 'Sub-task'].indexOf(
              typeName,
            ) + 1,
          ),
          name: typeName,
        },
        priority: { id: String(priorityId), name: priorityName },
        status: { id: String(Math.floor(Math.random() * 100)), name: statusName },
        project: store.projects.find((p) => p.key === key.split('-')[0]),
        assignee: userRef(assigneeKey),
        reporter: userRef(reporterKey),
        created: ts,
        updated: ts,
        labels: [],
        components: [],
        ...(extra || {}),
      },
    };
  }

  store.issues = [
    makeIssue(
      'ITSM-1',
      'Incident',
      1,
      'Blocker',
      'Database server unreachable',
      'DB-PROD (10.0.1.20) is not responding to health checks. All applications depending on this server are affected.',
      'Open',
      'j.doe',
      'a.smith',
    ),
    makeIssue(
      'ITSM-2',
      'Incident',
      2,
      'Critical',
      'VPN authentication failures',
      'Multiple users reporting VPN authentication failures since 08:00. Affects remote workers.',
      'In Progress',
      'j.doe',
      'c.jones',
    ),
    makeIssue(
      'ITSM-3',
      'Incident',
      3,
      'Major',
      'ERP application slow response',
      'ERP application response times exceeding 10 seconds. Users in Finance department most affected.',
      'In Progress',
      'a.smith',
      'l.leaving',
    ),
    makeIssue(
      'ITSM-4',
      'Incident',
      4,
      'Minor',
      'Printer not responding Floor 2',
      'Floor 2 network printer is offline. Low impact, affects ~10 users.',
      'Open',
      'j.doe',
      't.developer',
    ),
    makeIssue(
      'ITSM-5',
      'Incident',
      2,
      'Critical',
      'Fudo PAM session recording gap',
      'Gap in session recordings detected between 02:00-04:00. Security audit compliance risk.',
      'In Progress',
      'b.wilson',
      'svc-fudo-sync',
    ),
    makeIssue(
      'ITSM-6',
      'Incident',
      3,
      'Major',
      'Password rotation failed for svc accounts',
      'Scheduled password rotation for service accounts svc-integration and svc-matrix42 failed.',
      'Open',
      'b.wilson',
      'svc-fudo-sync',
    ),
    makeIssue(
      'ITSM-7',
      'Change',
      2,
      'Critical',
      'Upgrade Fudo PAM to v6.2',
      'Upgrade Fudo PAM appliance from v6.1 to v6.2. Includes security patches and new MFA integration.',
      'Awaiting Approval',
      'b.wilson',
      'c.jones',
    ),
    makeIssue(
      'ITSM-8',
      'Change',
      1,
      'Blocker',
      'Patch critical vulnerability on DC01',
      'Emergency patch for CVE-2026-1234 on Domain Controller DC01.',
      'Implementing',
      'j.doe',
      'b.wilson',
    ),
    makeIssue(
      'ITSM-9',
      'Change',
      3,
      'Major',
      'Add new server to PAM monitoring',
      'Add FILE-SRV01 to Fudo PAM monitoring scope.',
      'Planning',
      'b.wilson',
      'j.doe',
    ),
    makeIssue(
      'ITSM-10',
      'Change',
      2,
      'Critical',
      'AD group restructuring for RBAC',
      'Restructure Active Directory groups to align with new RBAC model.',
      'Open',
      'j.doe',
      'c.jones',
    ),
    makeIssue(
      'SEC-1',
      'Service Request',
      3,
      'Major',
      'Privileged access request for new engineer',
      'New engineer Tom Developer needs privileged access to APP-ERP and DB-PROD.',
      'Waiting for Approval',
      't.developer',
      'c.jones',
    ),
    makeIssue(
      'SEC-2',
      'Service Request',
      1,
      'Blocker',
      'Emergency access revocation',
      'Revoke all privileged access for Lisa Leaving immediately. Employee termination in progress.',
      'In Progress',
      'b.wilson',
      'c.jones',
    ),
    makeIssue(
      'SEC-3',
      'Service Request',
      3,
      'Major',
      'Password vault onboarding',
      'Onboard service accounts svc-integration and svc-matrix42 into Fudo PAM password vault.',
      'Open',
      'b.wilson',
      'b.wilson',
    ),
  ];

  // ── Organizations ──
  store.organizations = [
    {
      id: '1',
      name: 'PAMlab Corp',
      links: { self: 'http://localhost:8448/rest/servicedeskapi/organization/1' },
    },
    {
      id: '2',
      name: 'PAMlab Engineering',
      links: { self: 'http://localhost:8448/rest/servicedeskapi/organization/2' },
    },
    {
      id: '3',
      name: 'PAMlab Finance',
      links: { self: 'http://localhost:8448/rest/servicedeskapi/organization/3' },
    },
  ];

  // ── Customers ──
  store.customers = store.users
    .filter((u) => !u.key.startsWith('svc-'))
    .map((u, i) => ({
      accountId: String(i + 1),
      displayName: u.displayName,
      emailAddress: u.emailAddress,
      active: u.active,
      organizationId:
        u.key === 'l.leaving' ? '3' : u.key === 'a.smith' || u.key === 't.developer' ? '2' : '1',
    }));

  // ── Assets ──
  store.assets.schemas = [{ id: '1', name: 'PAMlab Infrastructure', objectCount: 5 }];
  store.assets.object_types = [
    { id: '1', name: 'Server', schemaId: '1', objectCount: 3 },
    { id: '2', name: 'Network Device', schemaId: '1', objectCount: 0 },
    { id: '3', name: 'Security Appliance', schemaId: '1', objectCount: 2 },
  ];
  store.assets.objects = [
    {
      id: '1',
      objectType: { id: '1', name: 'Server' },
      name: 'DC01',
      attributes: [
        { name: 'IP Address', value: '10.0.1.10' },
        { name: 'OS', value: 'Windows Server 2022' },
        { name: 'Location', value: 'DC1-Rack-A1' },
        { name: 'Status', value: 'Active' },
      ],
    },
    {
      id: '2',
      objectType: { id: '1', name: 'Server' },
      name: 'DB-PROD',
      attributes: [
        { name: 'IP Address', value: '10.0.1.20' },
        { name: 'OS', value: 'Ubuntu 22.04 LTS' },
        { name: 'Location', value: 'DC1-Rack-A2' },
        { name: 'Status', value: 'Active' },
      ],
    },
    {
      id: '3',
      objectType: { id: '1', name: 'Server' },
      name: 'APP-ERP',
      attributes: [
        { name: 'IP Address', value: '10.0.1.30' },
        { name: 'OS', value: 'Red Hat Enterprise Linux 9' },
        { name: 'Location', value: 'DC1-Rack-B1' },
        { name: 'Status', value: 'Active' },
      ],
    },
    {
      id: '4',
      objectType: { id: '3', name: 'Security Appliance' },
      name: 'FILE-SRV01',
      attributes: [
        { name: 'IP Address', value: '10.0.1.40' },
        { name: 'OS', value: 'Windows Server 2022' },
        { name: 'Location', value: 'DC1-Rack-B2' },
        { name: 'Status', value: 'Active' },
      ],
    },
    {
      id: '5',
      objectType: { id: '3', name: 'Security Appliance' },
      name: 'FUDO-PAM',
      attributes: [
        { name: 'IP Address', value: '10.0.1.50' },
        { name: 'OS', value: 'Fudo PAM Appliance 6.1' },
        { name: 'Location', value: 'DC1-Rack-C1' },
        { name: 'Status', value: 'Active' },
      ],
    },
  ];

  // ── SLA Policies ──
  store.sla_policies = [
    {
      id: '1',
      name: 'P1 - Blocker',
      priority: 'Blocker',
      responseTimeMinutes: 60,
      resolutionTimeMinutes: 240,
    },
    {
      id: '2',
      name: 'P2 - Critical',
      priority: 'Critical',
      responseTimeMinutes: 240,
      resolutionTimeMinutes: 480,
    },
    {
      id: '3',
      name: 'P3 - Major',
      priority: 'Major',
      responseTimeMinutes: 480,
      resolutionTimeMinutes: 1440,
    },
    {
      id: '4',
      name: 'P4 - Minor/Trivial',
      priority: 'Minor',
      responseTimeMinutes: 1440,
      resolutionTimeMinutes: 4320,
    },
  ];

  // ── Queues ──
  store.queues = [
    { id: '1', name: 'All Open', jql: 'status != Closed', serviceDeskId: '1' },
    { id: '2', name: 'My Assigned', jql: 'assignee = currentUser()', serviceDeskId: '1' },
    { id: '3', name: 'Unassigned', jql: 'assignee is EMPTY', serviceDeskId: '1' },
    {
      id: '4',
      name: 'SLA Breached',
      jql: 'status != Closed AND priority in (Blocker, Critical)',
      serviceDeskId: '1',
    },
    { id: '5', name: 'Security Queue', jql: 'project = SEC', serviceDeskId: '1' },
  ];

  // ── Approvals for SEC-1 ──
  store.approvals = [
    {
      id: '1',
      issueKey: 'SEC-1',
      status: 'pending',
      approvers: [{ key: 'c.jones', displayName: 'Carol Jones', decision: 'pending' }],
      requiredApprovers: 1,
      created: ts,
    },
    {
      id: '2',
      issueKey: 'ITSM-7',
      status: 'pending',
      approvers: [
        { key: 'c.jones', displayName: 'Carol Jones', decision: 'pending' },
        { key: 'j.doe', displayName: 'John Doe', decision: 'pending' },
      ],
      requiredApprovers: 2,
      created: ts,
    },
  ];

  console.log(
    `[SEED] Loaded: ${store.users.length} users, ${store.issues.length} issues, ${store.assets.objects.length} assets, ${store.organizations.length} orgs`,
  );
}

module.exports = seed;
