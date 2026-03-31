const express = require('express');
const store = require('../data/store');
const router = express.Router();

const FORM = 'HPD:Help Desk';

// GET /incidents — List with filtering
router.get('/', (req, res) => {
  let entries = [...store.forms[FORM]];
  if (req.query.status) entries = entries.filter((e) => e['Status'] === req.query.status);
  if (req.query.priority) entries = entries.filter((e) => e['Priority'] === req.query.priority);
  if (req.query.assignee) entries = entries.filter((e) => e['Assignee'] === req.query.assignee);
  if (req.query.group) entries = entries.filter((e) => e['Assigned Group'] === req.query.group);
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 100;
  res.json({
    entries: entries.slice(offset, offset + limit).map((e) => ({
      values: { ...e },
      _links: {
        self: [
          {
            href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/${encodeURIComponent(FORM)}/${e['Entry ID']}`,
          },
        ],
      },
    })),
    _totalCount: entries.length,
  });
});

// GET /incidents/stats
router.get('/stats', (req, res) => {
  const entries = store.forms[FORM];
  const byStatus = {},
    byPriority = {},
    byGroup = {};
  entries.forEach((e) => {
    byStatus[e['Status']] = (byStatus[e['Status']] || 0) + 1;
    byPriority[e['Priority']] = (byPriority[e['Priority']] || 0) + 1;
    byGroup[e['Assigned Group']] = (byGroup[e['Assigned Group']] || 0) + 1;
  });
  res.json({ total: entries.length, byStatus, byPriority, byGroup });
});

// GET /incidents/:id
router.get('/:id', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Incident Number'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Incident not found', messageNumber: 302 }],
      });
  res.json({
    values: { ...entry },
    _links: { self: [{ href: `${req.protocol}://${req.get('host')}${req.originalUrl}` }] },
  });
});

// POST /incidents/:id/assign
router.post('/:id/assign', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Incident Number'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Incident not found', messageNumber: 302 }],
      });
  if (req.body.assignee) entry['Assignee'] = req.body.assignee;
  if (req.body.group) entry['Assigned Group'] = req.body.group;
  entry['Status'] = 'Assigned';
  entry['Modified Date'] = new Date().toISOString().replace('T', ' ').slice(0, 19);
  res.json({ values: { ...entry } });
});

// POST /incidents/:id/resolve
router.post('/:id/resolve', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Incident Number'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Incident not found', messageNumber: 302 }],
      });
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  entry['Status'] = 'Resolved';
  entry['Resolution'] = req.body.resolution || '';
  entry['Status_Reason'] = req.body.reason || 'No Further Action Required';
  entry['Last Resolved Date'] = ts;
  entry['Modified Date'] = ts;
  res.json({ values: { ...entry } });
});

// POST /incidents/:id/reopen
router.post('/:id/reopen', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Incident Number'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Incident not found', messageNumber: 302 }],
      });
  entry['Status'] = 'Assigned';
  entry['Resolution'] = '';
  entry['Status_Reason'] = '';
  entry['Last Resolved Date'] = '';
  entry['Modified Date'] = new Date().toISOString().replace('T', ' ').slice(0, 19);
  res.json({ values: { ...entry } });
});

// POST /incidents/:id/worknotes
router.post('/:id/worknotes', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Incident Number'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Incident not found', messageNumber: 302 }],
      });
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const note = `[${ts}] ${req.body.submitter || 'system'}: ${req.body.note || ''}`;
  entry['Work Notes'] = entry['Work Notes'] ? `${entry['Work Notes']}\n${note}` : note;
  entry['Modified Date'] = ts;
  res.json({ values: { ...entry } });
});

module.exports = router;
