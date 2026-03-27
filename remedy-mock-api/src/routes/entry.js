const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const router = express.Router();

// Parse Remedy qualification string: 'Field' = "Value" AND 'Field2' LIKE "%val%"
function parseQualification(q) {
  if (!q) return null;
  const conditions = [];
  // Split on AND/OR (simplified — handles most common cases)
  const parts = q.split(/\b(AND|OR)\b/i);
  let logic = 'AND';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (/^AND$/i.test(part)) { logic = 'AND'; continue; }
    if (/^OR$/i.test(part)) { logic = 'OR'; continue; }
    if (!part) continue;
    // Match: 'Field Name' OP "Value" or 'Field Name' OP 123
    const m = part.match(/^'([^']+)'\s*(=|!=|<|>|<=|>=|LIKE)\s*"([^"]*)"$/i)
           || part.match(/^'([^']+)'\s*(=|!=|<|>|<=|>=|LIKE)\s*(\S+)$/i);
    if (m) {
      conditions.push({ field: m[1], op: m[2].toUpperCase(), value: m[3], logic: conditions.length > 0 ? logic : 'AND' });
    }
  }
  return conditions.length > 0 ? conditions : null;
}

function matchesCondition(entry, cond) {
  const val = entry[cond.field];
  if (val === undefined) return false;
  const sVal = String(val);
  const cVal = cond.value;
  switch (cond.op) {
    case '=': return sVal === cVal;
    case '!=': return sVal !== cVal;
    case '<': return sVal < cVal;
    case '>': return sVal > cVal;
    case '<=': return sVal <= cVal;
    case '>=': return sVal >= cVal;
    case 'LIKE': {
      const pattern = cVal.replace(/%/g, '.*').replace(/_/g, '.');
      return new RegExp(`^${pattern}$`, 'i').test(sVal);
    }
    default: return false;
  }
}

function applyQualification(entries, conditions) {
  if (!conditions) return entries;
  return entries.filter(entry => {
    let result = matchesCondition(entry, conditions[0]);
    for (let i = 1; i < conditions.length; i++) {
      const c = conditions[i];
      const m = matchesCondition(entry, c);
      if (c.logic === 'OR') result = result || m;
      else result = result && m;
    }
    return result;
  });
}

function formatEntry(formName, entry, req) {
  const idField = entry['Entry ID'] || entry['Request ID'] || Object.values(entry)[0];
  return {
    values: { ...entry },
    _links: {
      self: [{ href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/${encodeURIComponent(formName)}/${idField}` }]
    }
  };
}

// GET /api/arsys/v1/entry/:formName — List entries
router.get('/:formName', (req, res) => {
  const formName = decodeURIComponent(req.params.formName);
  const form = store.forms[formName];
  if (!form) {
    return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: `Form ${formName} not found`, messageNumber: 302 }] });
  }

  let entries = [...form];
  // Qualification string
  if (req.query.q) {
    const conditions = parseQualification(req.query.q);
    entries = applyQualification(entries, conditions);
  }
  // Field selection
  const fields = req.query.fields ? req.query.fields.split(',').map(f => f.trim()) : null;
  // Sorting
  if (req.query.sort) {
    const [sortField, sortDir] = req.query.sort.split('.');
    entries.sort((a, b) => {
      const av = a[sortField] || '', bv = b[sortField] || '';
      return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }
  // Pagination
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 100;
  const total = entries.length;
  entries = entries.slice(offset, offset + limit);

  const result = entries.map(e => {
    const formatted = formatEntry(formName, e, req);
    if (fields) {
      const filtered = {};
      fields.forEach(f => { if (formatted.values[f] !== undefined) filtered[f] = formatted.values[f]; });
      formatted.values = filtered;
    }
    return formatted;
  });

  res.json({ entries: result, _links: { self: [{ href: `${req.protocol}://${req.get('host')}${req.originalUrl}` }] }, _totalCount: total });
});

// GET /api/arsys/v1/entry/:formName/:entryId — Get single entry
router.get('/:formName/:entryId', (req, res) => {
  const formName = decodeURIComponent(req.params.formName);
  const form = store.forms[formName];
  if (!form) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: `Form ${formName} not found`, messageNumber: 302 }] });

  const entry = form.find(e => (e['Entry ID'] || e['Request ID']) === req.params.entryId);
  if (!entry) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Entry not found', messageNumber: 302 }] });

  res.json({ values: { ...entry }, _links: { self: [{ href: `${req.protocol}://${req.get('host')}${req.originalUrl}` }] } });
});

// POST /api/arsys/v1/entry/:formName — Create entry
router.post('/:formName', (req, res) => {
  const formName = decodeURIComponent(req.params.formName);
  if (!store.forms[formName]) store.forms[formName] = [];

  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const entry = { 'Request ID': uuidv4().replace(/-/g, '').slice(0, 15), ...req.body.values || req.body, 'Create Date': ts, 'Modified Date': ts };
  store.forms[formName].push(entry);

  const id = entry['Entry ID'] || entry['Request ID'];
  res.status(201)
    .set('Location', `/api/arsys/v1/entry/${encodeURIComponent(formName)}/${id}`)
    .json({ values: { ...entry }, _links: { self: [{ href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/${encodeURIComponent(formName)}/${id}` }] } });
});

// PUT /api/arsys/v1/entry/:formName/:entryId — Update entry
router.put('/:formName/:entryId', (req, res) => {
  const formName = decodeURIComponent(req.params.formName);
  const form = store.forms[formName];
  if (!form) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: `Form ${formName} not found`, messageNumber: 302 }] });

  const idx = form.findIndex(e => (e['Entry ID'] || e['Request ID']) === req.params.entryId);
  if (idx < 0) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Entry not found', messageNumber: 302 }] });

  const updates = req.body.values || req.body;
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  form[idx] = { ...form[idx], ...updates, 'Modified Date': ts };
  res.status(204).send();
});

// DELETE /api/arsys/v1/entry/:formName/:entryId — Delete entry
router.delete('/:formName/:entryId', (req, res) => {
  const formName = decodeURIComponent(req.params.formName);
  const form = store.forms[formName];
  if (!form) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: `Form ${formName} not found`, messageNumber: 302 }] });

  const idx = form.findIndex(e => (e['Entry ID'] || e['Request ID']) === req.params.entryId);
  if (idx < 0) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Entry not found', messageNumber: 302 }] });

  form.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
