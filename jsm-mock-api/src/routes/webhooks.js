const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const router = express.Router();

// Register webhook
router.post('/', (req, res) => {
  const wh = { id: uuidv4(), url: req.body.url, events: req.body.events || ['*'], name: req.body.name || 'webhook', created: new Date().toISOString() };
  store.webhooks.push(wh);
  res.status(201).json(wh);
});

// List webhooks
router.get('/', (req, res) => {
  res.json(store.webhooks);
});

// Delete webhook
router.delete('/:webhookId', (req, res) => {
  const idx = store.webhooks.findIndex(w => w.id === req.params.webhookId);
  if (idx === -1) return res.status(404).json({ errorMessages: ['Webhook not found'], errors: {} });
  store.webhooks.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
