const express = require('express');
const store = require('../data/store');
const router = express.Router();

const FORM = 'SLA:SLADefinition';

router.get('/', (req, res) => {
  res.json({
    entries: store.forms[FORM].map((e) => ({
      values: { ...e },
      _links: {
        self: [
          {
            href: `${req.protocol}://${req.get('host')}/api/arsys/v1/entry/${encodeURIComponent(FORM)}/${e['Entry ID']}`,
          },
        ],
      },
    })),
    _totalCount: store.forms[FORM].length,
  });
});

// GET /sla/status/:incidentId — SLA status for an incident
router.get('/status/:incidentId', (req, res) => {
  const incident = store.forms['HPD:Help Desk'].find(
    (e) =>
      e['Incident Number'] === req.params.incidentId || e['Entry ID'] === req.params.incidentId,
  );
  if (!incident)
    return res
      .status(404)
      .json({
        error: [{ messageType: 'ERROR', messageText: 'Incident not found', messageNumber: 302 }],
      });

  const sla = store.forms[FORM].find((s) => s['Priority'] === incident['Priority']);
  if (!sla)
    return res.json({
      incident: incident['Incident Number'],
      sla: null,
      message: 'No SLA definition for this priority',
    });

  const created = new Date(incident['Create Date'].replace(' ', 'T') + 'Z');
  const now = new Date();
  const elapsedMin = Math.floor((now - created) / 60000);
  const responseTarget = sla['Response Time (Minutes)'];
  const resolutionTarget = sla['Resolution Time (Hours)'] * 60;

  res.json({
    incident: incident['Incident Number'],
    priority: incident['Priority'],
    sla: sla['Name'],
    response: {
      targetMinutes: responseTarget,
      elapsedMinutes: elapsedMin,
      breached: elapsedMin > responseTarget && incident['Status'] === 'New',
      status:
        incident['Status'] === 'New'
          ? elapsedMin > responseTarget
            ? 'Breached'
            : 'Within SLA'
          : 'Met',
    },
    resolution: {
      targetMinutes: resolutionTarget,
      elapsedMinutes: elapsedMin,
      breached:
        elapsedMin > resolutionTarget && !['Resolved', 'Closed'].includes(incident['Status']),
      status: ['Resolved', 'Closed'].includes(incident['Status'])
        ? 'Met'
        : elapsedMin > resolutionTarget
          ? 'Breached'
          : 'Within SLA',
    },
  });
});

module.exports = router;
