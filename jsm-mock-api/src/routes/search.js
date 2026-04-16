const express = require('express');
const store = require('../data/store');
const router = express.Router();
const BASE = `http://localhost:${process.env.PORT || 8448}`;

function parseJQL(jql) {
  if (!jql || !jql.trim()) return { filters: [], orderBy: null, orderDir: 'ASC' };
  let orderBy = null,
    orderDir = 'ASC';
  let filterPart = jql;
  const orderMatch = jql.match(/\s+ORDER\s+BY\s+(\w+)\s*(ASC|DESC)?\s*$/i);
  if (orderMatch) {
    orderBy = orderMatch[1].toLowerCase();
    orderDir = (orderMatch[2] || 'ASC').toUpperCase();
    filterPart = jql.substring(0, orderMatch.index);
  }
  // Split by AND/OR (simple tokenizer)
  const tokens = [];
  const parts = filterPart.split(/\s+(AND|OR)\s+/i);
  let currentOp = 'AND';
  for (const part of parts) {
    if (part.toUpperCase() === 'AND') {
      currentOp = 'AND';
      continue;
    }
    if (part.toUpperCase() === 'OR') {
      currentOp = 'OR';
      continue;
    }
    const m = part.trim().match(/^(\w+)\s*(=|!=|~|IN|NOT\s+IN|IS)\s*(.+)$/i);
    if (m) {
      let value = m[3].trim().replace(/^["']|["']$/g, '');
      // Handle IN (value1, value2)
      let values = null;
      if (m[2].toUpperCase().includes('IN')) {
        values = value
          .replace(/[()]/g, '')
          .split(',')
          .map((v) => v.trim().replace(/^["']|["']$/g, ''));
      }
      tokens.push({
        field: m[1].toLowerCase(),
        op: m[2].toUpperCase().trim(),
        value,
        values,
        combinator: currentOp,
      });
    }
    currentOp = 'AND';
  }
  return { filters: tokens, orderBy, orderDir };
}

function getFieldValue(issue, field) {
  switch (field) {
    case 'project':
      return issue.fields.project ? issue.fields.project.key : '';
    case 'issuetype':
      return issue.fields.issuetype ? issue.fields.issuetype.name : '';
    case 'priority':
      return issue.fields.priority ? issue.fields.priority.name : '';
    case 'status':
      return issue.fields.status ? issue.fields.status.name : '';
    case 'assignee':
      return issue.fields.assignee ? issue.fields.assignee.key : '';
    case 'reporter':
      return issue.fields.reporter ? issue.fields.reporter.key : '';
    case 'key':
      return issue.key;
    case 'summary':
      return issue.fields.summary || '';
    case 'created':
      return issue.fields.created || '';
    case 'updated':
      return issue.fields.updated || '';
    case 'labels':
      return Array.isArray(issue.fields.labels) ? issue.fields.labels : [];
    default:
      return issue.fields[field] || '';
  }
}

function matchFilter(issue, filter) {
  const raw = getFieldValue(issue, filter.field);
  const isArray = Array.isArray(raw);
  const val = isArray ? raw.map((v) => String(v).toLowerCase()) : [String(raw).toLowerCase()];
  const target = filter.value.toLowerCase();
  switch (filter.op) {
    case '=':
      return val.some((v) => v === target);
    case '!=':
      return val.every((v) => v !== target);
    case '~':
      return val.some((v) => v.includes(target));
    case 'IS':
      return target === 'empty' ? val.length === 0 || val.every((v) => !v) : val.some((v) => !!v);
    case 'IN':
      return filter.values
        ? filter.values.some((fv) => val.some((v) => v === fv.toLowerCase()))
        : false;
    case 'NOT IN':
      return filter.values
        ? !filter.values.some((fv) => val.some((v) => v === fv.toLowerCase()))
        : true;
    default:
      return true;
  }
}

// POST /rest/api/2/search
router.post('/', (req, res) => {
  const jql = req.body.jql || '';
  const startAt = req.body.startAt || 0;
  const maxResults = Math.min(req.body.maxResults || 50, 1000);
  const { filters, orderBy, orderDir } = parseJQL(jql);

  let results = store.issues;
  if (filters.length > 0) {
    results = results.filter((issue) => {
      let pass = matchFilter(issue, filters[0]);
      for (let i = 1; i < filters.length; i++) {
        const f = filters[i];
        if (f.combinator === 'OR') pass = pass || matchFilter(issue, f);
        else pass = pass && matchFilter(issue, f);
      }
      return pass;
    });
  }

  if (orderBy) {
    results.sort((a, b) => {
      const va = String(getFieldValue(a, orderBy));
      const vb = String(getFieldValue(b, orderBy));
      const cmp = va.localeCompare(vb);
      return orderDir === 'DESC' ? -cmp : cmp;
    });
  }

  const total = results.length;
  const paged = results.slice(startAt, startAt + maxResults);

  res.json({
    expand: 'schema,names',
    startAt,
    maxResults,
    total,
    issues: paged.map((i) => ({
      id: i.id,
      key: i.key,
      self: `${BASE}/rest/api/2/issue/${i.id}`,
      fields: i.fields,
    })),
  });
});

// Also support GET for convenience
router.get('/', (req, res) => {
  const jql = req.query.jql || '';
  const startAt = parseInt(req.query.startAt) || 0;
  const maxResults = Math.min(parseInt(req.query.maxResults) || 50, 1000);
  const { filters, orderBy, orderDir } = parseJQL(jql);
  let results = store.issues;
  if (filters.length > 0) {
    results = results.filter((issue) => {
      let pass = matchFilter(issue, filters[0]);
      for (let i = 1; i < filters.length; i++) {
        const f = filters[i];
        if (f.combinator === 'OR') pass = pass || matchFilter(issue, f);
        else pass = pass && matchFilter(issue, f);
      }
      return pass;
    });
  }
  if (orderBy) {
    results.sort((a, b) => {
      const cmp = String(getFieldValue(a, orderBy)).localeCompare(
        String(getFieldValue(b, orderBy)),
      );
      return orderDir === 'DESC' ? -cmp : cmp;
    });
  }
  const total = results.length;
  const paged = results.slice(startAt, startAt + maxResults);
  res.json({
    expand: 'schema,names',
    startAt,
    maxResults,
    total,
    issues: paged.map((i) => ({
      id: i.id,
      key: i.key,
      self: `${BASE}/rest/api/2/issue/${i.id}`,
      fields: i.fields,
    })),
  });
});

module.exports = router;
