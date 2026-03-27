const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const router = express.Router();

// POST /webhooks — Register webhook
router.post('/', (req, res) => {
  const webhook = {
    id: uuidv4(),
    url: req.body.url,
    formName: req.body.formName || '*',
    events: req.body.events || ['create', 'update', 'delete'],
    active: true,
    created: new Date().toISOString()
  };
  store.webhooks.push(webhook);
  res.status(201).json(webhook);
});

// GET /webhooks — List webhooks
router.get('/', (req, res) => {
  res.json({ webhooks: store.webhooks });
});

// DELETE /webhooks/:id
router.delete('/:id', (req, res) => {
  const idx = store.webhooks.findIndex(w => w.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: [{ messageType: 'ERROR', messageText: 'Webhook not found', messageNumber: 302 }] });
  store.webhooks.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
