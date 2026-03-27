const express = require('express');
const store = require('../data/store');
const router = express.Router();

// List queues
router.get('/servicedesk/:serviceDeskId/queue', (req, res) => {
  const queues = store.queues.filter(q => q.serviceDeskId === req.params.serviceDeskId);
  res.json({ size: queues.length, start: 0, limit: 50, isLastPage: true, values: queues });
});

// Get queue issues (simplified - returns all matching based on queue name)
router.get('/servicedesk/:serviceDeskId/queue/:queueId/issue', (req, res) => {
  const queue = store.queues.find(q => q.id === req.params.queueId);
  if (!queue) return res.status(404).json({ errorMessages: ['Queue not found'], errors: {} });
  let issues = store.issues;
  if (queue.name === 'All Open') issues = issues.filter(i => i.fields.status.name !== 'Closed');
  else if (queue.name === 'Unassigned') issues = issues.filter(i => !i.fields.assignee);
  else if (queue.name === 'Security Queue') issues = issues.filter(i => i.key.startsWith('SEC-'));
  else if (queue.name === 'SLA Breached') issues = issues.filter(i => i.fields.status.name !== 'Closed' && (i.fields.priority.name === 'Blocker' || i.fields.priority.name === 'Critical'));
  res.json({ size: issues.length, start: 0, limit: 50, isLastPage: true, values: issues.map(i => ({ id: i.id, key: i.key, fields: i.fields })) });
});

// SLA tracking
router.get('/request/:requestId/sla', (req, res) => {
  const issue = store.issues.find(i => i.key === req.params.requestId || i.id === req.params.requestId);
  if (!issue) return res.status(404).json({ errorMessages: ['Request not found'], errors: {} });
  const priority = issue.fields.priority.name;
  const policy = store.sla_policies.find(p => p.priority === priority) || store.sla_policies[2];
  const created = new Date(issue.fields.created);
  const now = new Date();
  const elapsedMinutes = (now - created) / 60000;
  const responseBreached = elapsedMinutes > policy.responseTimeMinutes;
  const resolutionBreached = elapsedMinutes > policy.resolutionTimeMinutes;
  const resolutionRemaining = Math.max(0, policy.resolutionTimeMinutes - elapsedMinutes);
  const resolutionPct = Math.min(100, (elapsedMinutes / policy.resolutionTimeMinutes) * 100);

  res.json({
    size: 2, start: 0, limit: 50, isLastPage: true,
    values: [
      { name: 'Time to first response', completedCycles: { breached: responseBreached ? 1 : 0 }, ongoingCycle: { breached: responseBreached, elapsedTime: { millis: elapsedMinutes * 60000, friendly: `${Math.floor(elapsedMinutes)}m` }, remainingTime: { millis: Math.max(0, (policy.responseTimeMinutes - elapsedMinutes) * 60000), friendly: `${Math.max(0, Math.floor(policy.responseTimeMinutes - elapsedMinutes))}m` }, goalDuration: { millis: policy.responseTimeMinutes * 60000 }, percentageElapsed: Math.min(100, (elapsedMinutes / policy.responseTimeMinutes) * 100) } },
      { name: 'Time to resolution', completedCycles: { breached: resolutionBreached ? 1 : 0 }, ongoingCycle: { breached: resolutionBreached, elapsedTime: { millis: elapsedMinutes * 60000, friendly: `${Math.floor(elapsedMinutes)}m` }, remainingTime: { millis: resolutionRemaining * 60000, friendly: `${Math.floor(resolutionRemaining)}m` }, goalDuration: { millis: policy.resolutionTimeMinutes * 60000 }, percentageElapsed: resolutionPct } },
    ],
  });
});

module.exports = router;
