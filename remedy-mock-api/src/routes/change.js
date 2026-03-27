const express = require('express');
const store = require('../data/store');
const router = express.Router();

const FORM = 'CHG:Infrastructure Change';

router.get('/', (req, res) => {
  let entries = [...store.forms[FORM]];
  if (req.query.status) entries = entries.filter(e => e['Status'] === req.query.status);
  if (req.query.type) entries = entries.filter(e => e['Change Type'] === req.query.type);
  if (req.query.risk) entries = entries.filter(e => e['Risk Level'] === req.query.risk);
  res.json({
    entries: entries.map(e => ({
      values: { ...e },
      _links: { self: [{ href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/${encodeURIComponent(FORM)}/${e['Entry ID']}` }] }
    })),
    _totalCount: entries.length
  });
});

router.get('/:id', (req, res) => {
  const entry = store.forms[FORM].find(e => e['Change Number'] === req.params.id || e['Entry ID'] === req.params.id);
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Change request not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

function updateChange(id, updates) {
  const entry = store.forms[FORM].find(e => e['Change Number'] === id || e['Entry ID'] === id);
  if (!entry) return null;
  Object.assign(entry, updates, { 'Modified Date': new Date().toISOString().replace('T', ' ').slice(0, 19) });
  return entry;
}

router.post('/:id/schedule', (req, res) => {
  const entry = updateChange(req.params.id, { 'Status': 'Scheduled', 'Scheduled Start Date': req.body.startDate || '', 'Scheduled End Date': req.body.endDate || '' });
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Change request not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

router.post('/:id/approve', (req, res) => {
  const entry = updateChange(req.params.id, { 'Status': 'Approved', 'Approval Status': 'Approved' });
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Change request not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

router.post('/:id/reject', (req, res) => {
  const entry = updateChange(req.params.id, { 'Status': 'Rejected', 'Approval Status': 'Rejected', 'Reject Reason': req.body.reason || '' });
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Change request not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

router.post('/:id/implement', (req, res) => {
  const entry = updateChange(req.params.id, { 'Status': 'Implementation In Progress' });
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Change request not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

router.post('/:id/complete', (req, res) => {
  const entry = updateChange(req.params.id, { 'Status': 'Completed', 'Completion Notes': req.body.notes || '' });
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Change request not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

// GET /:id/tasks — list tasks for a change (mock: returns empty or generated)
router.get('/:id/tasks', (req, res) => {
  const entry = store.forms[FORM].find(e => e['Change Number'] === req.params.id || e['Entry ID'] === req.params.id);
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Change request not found', messageNumber: 302 }] });
  res.json({
    entries: [
      { values: { 'Task ID': 'TAS000000000001', 'Summary': `Pre-implementation checks for ${entry['Change Number']}`, 'Status': 'Assigned', 'Assignee': entry['Assignee'], 'Priority': entry['Priority'] } },
      { values: { 'Task ID': 'TAS000000000002', 'Summary': `Execute change ${entry['Change Number']}`, 'Status': 'Pending', 'Assignee': entry['Assignee'], 'Priority': entry['Priority'] } },
      { values: { 'Task ID': 'TAS000000000003', 'Summary': `Post-implementation verification for ${entry['Change Number']}`, 'Status': 'Pending', 'Assignee': entry['Assignee'], 'Priority': entry['Priority'] } },
    ],
    _totalCount: 3
  });
});

module.exports = router;
