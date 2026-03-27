const express = require('express');
const store = require('../data/store');
const router = express.Router();

const FORM = 'AST:ComputerSystem';

router.get('/', (req, res) => {
  let entries = [...store.forms[FORM]];
  if (req.query.status) entries = entries.filter(e => e['Status'] === req.query.status);
  if (req.query.category) entries = entries.filter(e => e['Category'] === req.query.category);
  if (req.query.environment) entries = entries.filter(e => e['Environment'] === req.query.environment);
  res.json({
    entries: entries.map(e => ({
      values: { ...e },
      _links: { self: [{ href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/${encodeURIComponent(FORM)}/${e['Entry ID']}` }] }
    })),
    _totalCount: entries.length
  });
});

router.get('/:id', (req, res) => {
  const entry = store.forms[FORM].find(e => e['CI Name'] === req.params.id || e['Entry ID'] === req.params.id || e['Asset Tag'] === req.params.id);
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Asset not found', messageNumber: 302 }] });
  res.json({ values: { ...entry } });
});

// GET /:id/topology — relationships for an asset
router.get('/:id/topology', (req, res) => {
  const entry = store.forms[FORM].find(e => e['CI Name'] === req.params.id || e['Entry ID'] === req.params.id);
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Asset not found', messageNumber: 302 }] });
  const ciName = entry['CI Name'];
  // Build mock relationships from incidents and changes referencing this CI
  const incidents = store.forms['HPD:Help Desk'].filter(i => i['CI Name'] === ciName);
  const changes = store.forms['CHG:Infrastructure Change'].filter(c => c['CI Name'] === ciName);
  const dependsOn = [];
  const usedBy = [];
  // Simple topology: all servers depend on DC01, FUDO-PAM manages all
  const allAssets = store.forms[FORM];
  if (ciName === 'DC01') {
    allAssets.filter(a => a['CI Name'] !== 'DC01').forEach(a => usedBy.push({ 'CI Name': a['CI Name'], 'Relationship': 'Used by' }));
  } else {
    dependsOn.push({ 'CI Name': 'DC01', 'Relationship': 'Depends on' });
  }
  if (ciName === 'FUDO-PAM') {
    allAssets.filter(a => a['CI Name'] !== 'FUDO-PAM').forEach(a => usedBy.push({ 'CI Name': a['CI Name'], 'Relationship': 'Manages' }));
  }

  res.json({
    asset: ciName,
    relationships: { dependsOn, usedBy },
    relatedIncidents: incidents.map(i => ({ 'Incident Number': i['Incident Number'], 'Description': i['Description'], 'Status': i['Status'] })),
    relatedChanges: changes.map(c => ({ 'Change Number': c['Change Number'], 'Description': c['Description'], 'Status': c['Status'] })),
  });
});

module.exports = router;
