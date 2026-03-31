const express = require('express');
const store = require('../data/store');
const router = express.Router();

const FORM = 'WOI:WorkOrder';

router.get('/', (req, res) => {
  let entries = [...store.forms[FORM]];
  if (req.query.status) entries = entries.filter((e) => e['Status'] === req.query.status);
  res.json({
    entries: entries.map((e) => ({
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

router.get('/:id', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Work Order ID'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Work order not found', messageNumber: 302 }],
      });
  res.json({ values: { ...entry } });
});

router.post('/:id/assign', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Work Order ID'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Work order not found', messageNumber: 302 }],
      });
  if (req.body.assignee) entry['Assignee'] = req.body.assignee;
  if (req.body.group) entry['Assigned Group'] = req.body.group;
  entry['Status'] = 'Assigned';
  entry['Modified Date'] = new Date().toISOString().replace('T', ' ').slice(0, 19);
  res.json({ values: { ...entry } });
});

router.post('/:id/complete', (req, res) => {
  const entry = store.forms[FORM].find(
    (e) => e['Work Order ID'] === req.params.id || e['Entry ID'] === req.params.id,
  );
  if (!entry)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Work order not found', messageNumber: 302 }],
      });
  entry['Status'] = 'Completed';
  entry['Completion Notes'] = req.body.notes || '';
  entry['Modified Date'] = new Date().toISOString().replace('T', ' ').slice(0, 19);
  res.json({ values: { ...entry } });
});

module.exports = router;
