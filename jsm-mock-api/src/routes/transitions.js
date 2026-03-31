const express = require('express');
const store = require('../data/store');
const router = express.Router();

function findIssue(idOrKey) {
  return store.issues.find((i) => i.id === idOrKey || i.key === idOrKey);
}

// GET /rest/api/2/issue/:issueIdOrKey/transitions
router.get('/:issueIdOrKey/transitions', (req, res) => {
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  const typeName = issue.fields.issuetype.name;
  const currentStatus = issue.fields.status.name;
  const wf = store.transitions[typeName] || [];
  const available = wf
    .filter((t) => t.from === currentStatus)
    .map((t) => ({
      id: t.id,
      name: t.name,
      to: { id: t.id, name: t.to },
      hasScreen: false,
      isGlobal: false,
      isInitial: false,
      isConditional: false,
    }));
  res.json({ expand: 'transitions', transitions: available });
});

// POST /rest/api/2/issue/:issueIdOrKey/transitions
router.post('/:issueIdOrKey/transitions', (req, res) => {
  const issue = findIssue(req.params.issueIdOrKey);
  if (!issue) return res.status(404).json({ errorMessages: ['Issue Does Not Exist'], errors: {} });
  const { transition } = req.body;
  if (!transition || !transition.id)
    return res.status(400).json({ errorMessages: ['transition.id is required'], errors: {} });
  const typeName = issue.fields.issuetype.name;
  const currentStatus = issue.fields.status.name;
  const wf = store.transitions[typeName] || [];
  const t = wf.find((t) => t.id === transition.id && t.from === currentStatus);
  if (!t)
    return res
      .status(400)
      .json({
        errorMessages: [`Transition ${transition.id} is not valid from status "${currentStatus}"`],
        errors: {},
      });
  issue.fields.status = { id: t.id, name: t.to };
  issue.fields.updated = new Date().toISOString().replace('Z', '+0000');
  // Fire webhooks
  store.webhooks.forEach((wh) => {
    if (wh.events.includes('jira:issue_updated') || wh.events.includes('*')) {
      console.log(`[WEBHOOK] Firing transition to ${wh.url} for ${issue.key}`);
    }
  });
  res.status(204).send();
});

module.exports = router;
