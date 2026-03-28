// Generate random test user data
function generateTestUser() {
  const id = Math.random().toString(36).slice(2, 7);
  return {
    username: `test-${id}`,
    fullName: `Test User ${id.toUpperCase()}`,
    firstName: 'Test',
    lastName: `User-${id}`,
    email: `test-${id}@corp.local`,
    department: 'Engineering',
    title: 'Test Account',
  };
}

// Replace template variables and known user data with test data
export function prepareTestRun(script: string): { script: string; testUser: ReturnType<typeof generateTestUser>; cleanup: CleanupPlan } {
  const user = generateTestUser();
  let modified = script;

  // Replace known demo user names (order matters: specific before generic)
  const replacements: [RegExp, string][] = [
    [/s\.connor@corp\.local/gi, user.email],
    [/s\.connor/gi, user.username],
    [/Sarah Connor/g, user.fullName],
    [/Sarah/g, user.firstName],
    [/Connor/g, user.lastName],
    [/l\.leaving/gi, user.username],
    [/Lisa Leaving/g, user.fullName],
    [/t\.developer/gi, user.username],
    [/Tom Developer/g, user.fullName],
    [/j\.doe/gi, user.username],
    [/John Doe/g, user.fullName],
  ];

  for (const [pattern, replacement] of replacements) {
    modified = modified.replace(pattern, replacement);
  }

  // Build cleanup plan
  const cleanup: CleanupPlan = {
    adUsers: [user.username],
    adGroupMemberships: [],
    fudoUsers: [],
    tickets: [],
  };

  return { script: modified, testUser: user, cleanup };
}

export interface CleanupPlan {
  adUsers: string[];
  adGroupMemberships: { group: string; user: string }[];
  fudoUsers: string[];
  tickets: string[];
}

// Inspect API response and track created resources in the cleanup plan
export function trackCreatedResources(url: string, method: string, responseBody: unknown, cleanup: CleanupPlan) {
  if (!responseBody || typeof responseBody !== 'object') return;
  const body = responseBody as Record<string, unknown>;

  // AD create user → track sAMAccountName
  if (method === 'POST' && /\/api\/ad\/api\/users/i.test(url) && body.sAMAccountName) {
    const sam = String(body.sAMAccountName);
    if (!cleanup.adUsers.includes(sam)) cleanup.adUsers.push(sam);
  }

  // AD add-to-group → track membership
  const groupMatch = url.match(/\/api\/ad\/api\/groups\/([^/]+)\/members/i);
  if (method === 'POST' && groupMatch) {
    const group = decodeURIComponent(groupMatch[1]);
    const user = body.sAMAccountName ? String(body.sAMAccountName) : '';
    if (user && !cleanup.adGroupMemberships.some(m => m.group === group && m.user === user)) {
      cleanup.adGroupMemberships.push({ group, user });
    }
  }

  // Fudo create user → track id
  if (method === 'POST' && /\/api\/fudo\/api\/v2\/users/i.test(url) && body.id) {
    const id = String(body.id);
    if (!cleanup.fudoUsers.includes(id)) cleanup.fudoUsers.push(id);
  }

  // Matrix42 ticket → track ID
  if (method === 'POST' && /\/api\/matrix42/i.test(url) && body.ID) {
    cleanup.tickets.push(String(body.ID));
  }

  // ServiceNow ticket → track result.sys_id
  if (method === 'POST' && /\/api\/snow/i.test(url)) {
    const result = body.result as Record<string, unknown> | undefined;
    if (result?.sys_id) cleanup.tickets.push(String(result.sys_id));
  }
}

// Execute cleanup after test run
export async function executeCleanup(cleanup: CleanupPlan, apiFetch: (url: string, method: string, body?: unknown) => Promise<{ status: number; statusText: string; data: unknown; time: number }>): Promise<string[]> {
  const log: string[] = [];

  // Remove from AD groups
  for (const m of cleanup.adGroupMemberships) {
    await apiFetch(`/api/ad/api/groups/${m.group}/members/${m.user}`, 'DELETE');
    log.push(`Removed ${m.user} from ${m.group}`);
  }

  // Delete AD users
  for (const u of cleanup.adUsers) {
    await apiFetch(`/api/ad/api/users/${u}`, 'DELETE');
    log.push(`Deleted AD user ${u}`);
  }

  // Delete Fudo users
  for (const id of cleanup.fudoUsers) {
    await apiFetch(`/api/fudo/api/v2/users/${id}`, 'DELETE');
    log.push(`Deleted Fudo user ${id}`);
  }

  return log;
}
