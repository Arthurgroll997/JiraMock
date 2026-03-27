const express = require('express');
const store = require('../data/store');
const router = express.Router();

router.get('/', (req, res) => {
  let entries = [...store.forms['CTM:People']];
  if (req.query.status) entries = entries.filter(e => e['Status'] === req.query.status);
  if (req.query.department) entries = entries.filter(e => e['Department'] === req.query.department);
  res.json({
    entries: entries.map(e => ({
      values: { ...e },
      _links: { self: [{ href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/CTM%3APeople/${e['Request ID']}` }] }
    })),
    _totalCount: entries.length
  });
});

router.get('/groups', (req, res) => {
  const groups = store.forms['CTM:Support Group'];
  res.json({
    entries: groups.map(g => ({
      values: { ...g },
      _links: { self: [{ href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/CTM%3ASupport%20Group/${g['Request ID']}` }] }
    })),
    _totalCount: groups.length
  });
});

router.get('/groups/:name/members', (req, res) => {
  const group = store.forms['CTM:Support Group'].find(g => g['Group Name'] === req.params.name || g['Group ID'] === req.params.name);
  if (!group) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Support group not found', messageNumber: 302 }] });
  // Find people in this group's department or matching group name
  const members = store.forms['CTM:People'].filter(p => p['Department'] === group['Group Name'] || p['Department'] === group['Description']);
  res.json({ group: group['Group Name'], members: members.map(m => ({ 'Login ID': m['Login ID'], 'Full Name': `${m['First Name']} ${m['Last Name']}`, 'Email Address': m['Email Address'] })) });
});

router.get('/:id', (req, res) => {
  const entry = store.forms['CTM:People'].find(e => e['Login ID'] === req.params.id || e['Person ID'] === req.params.id || e['Request ID'] === req.params.id);
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Person not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

module.exports = router;
