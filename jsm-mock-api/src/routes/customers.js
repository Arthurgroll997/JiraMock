const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const router = express.Router();

// List customers
router.get('/customer', (req, res) => {
  res.json({
    size: store.customers.length,
    start: 0,
    limit: 50,
    isLastPage: true,
    values: store.customers,
  });
});

// Create customer
router.post('/customer', (req, res) => {
  const customer = {
    accountId: uuidv4(),
    displayName: req.body.displayName,
    emailAddress: req.body.email || req.body.emailAddress,
    active: true,
  };
  store.customers.push(customer);
  res.status(201).json(customer);
});

// List organizations
router.get('/organization', (req, res) => {
  res.json({
    size: store.organizations.length,
    start: 0,
    limit: 50,
    isLastPage: true,
    values: store.organizations,
  });
});

// Create organization
router.post('/organization', (req, res) => {
  const org = {
    id: String(store.organizations.length + 1),
    name: req.body.name,
    links: {
      self: `http://localhost:${process.env.PORT || 8448}/rest/servicedeskapi/organization/${store.organizations.length + 1}`,
    },
  };
  store.organizations.push(org);
  res.status(201).json(org);
});

// Get org members
router.get('/organization/:orgId/user', (req, res) => {
  const members = store.customers.filter((c) => c.organizationId === req.params.orgId);
  res.json({ size: members.length, start: 0, limit: 50, isLastPage: true, values: members });
});

module.exports = router;
