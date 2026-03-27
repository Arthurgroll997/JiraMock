const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const router = express.Router();

// GET /rest/servicedeskapi/request/:requestId/approval
router.get('/request/:requestId/approval', (req, res) => {
  const issue = store.issues.find(i => i.key === req.params.requestId || i.id === req.params.requestId);
  if (!issue) return res.status(404).json({ errorMessages: ['Request not found'], errors: {} });
  const approvals = store.approvals.filter(a => a.issueKey === issue.key);
  res.json({ size: approvals.length, start: 0, limit: 50, isLastPage: true, values: approvals });
});

// POST /rest/servicedeskapi/request/:requestId/approval
router.post('/request/:requestId/approval', (req, res) => {
  const issue = store.issues.find(i => i.key === req.params.requestId || i.id === req.params.requestId);
  if (!issue) return res.status(404).json({ errorMessages: ['Request not found'], errors: {} });
  const approval = {
    id: uuidv4(),
    issueKey: issue.key,
    status: 'pending',
    approvers: (req.body.approvers || []).map(a => ({ key: a.key || a, displayName: (store.users.find(u => u.key === (a.key || a)) || {}).displayName || a, decision: 'pending' })),
    requiredApprovers: req.body.requiredApprovers || 1,
    created: new Date().toISOString(),
  };
  store.approvals.push(approval);
  res.status(201).json(approval);
});

// POST approve
router.post('/request/:requestId/approval/:approvalId/approve', (req, res) => {
  const approval = store.approvals.find(a => a.id === req.params.approvalId);
  if (!approval) return res.status(404).json({ errorMessages: ['Approval not found'], errors: {} });
  const userKey = (req.jiraUser && req.jiraUser.key) || 'admin';
  const approver = approval.approvers.find(a => a.key === userKey);
  if (approver) approver.decision = 'approved';
  const approvedCount = approval.approvers.filter(a => a.decision === 'approved').length;
  if (approvedCount >= approval.requiredApprovers) approval.status = 'approved';
  res.json(approval);
});

// POST decline
router.post('/request/:requestId/approval/:approvalId/decline', (req, res) => {
  const approval = store.approvals.find(a => a.id === req.params.approvalId);
  if (!approval) return res.status(404).json({ errorMessages: ['Approval not found'], errors: {} });
  const userKey = (req.jiraUser && req.jiraUser.key) || 'admin';
  const approver = approval.approvers.find(a => a.key === userKey);
  if (approver) approver.decision = 'declined';
  approval.status = 'declined';
  res.json(approval);
});

module.exports = router;
