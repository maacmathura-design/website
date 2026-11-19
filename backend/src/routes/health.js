const express = require('express');

/** GET /api/health: liveness plus whether email delivery is working. Exposes no configuration. */
function createHealthRouter({ mailer }) {
  const router = express.Router();

  router.get(['/api/health', '/health'], (req, res) => {
    const mail = mailer.status;
    res.status(200).json({
      status: mail === 'ready' || mail === 'unverified' ? 'ok' : 'degraded',
      mail,
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  return router;
}

module.exports = { createHealthRouter };
