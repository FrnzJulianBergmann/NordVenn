// export.js routes
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const exportLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 3 });

router.post('/export/request', exportLimiter, async (req, res) => {
  try {
    const result = await req.exportService.exportUserData(req.user.id, req.body.options);
    res.json({ success: true, downloadUrl: result.downloadUrl });
  } catch (err) {
    res.status(500).json({ error: 'Export failed', message: err.message });
  }
});

router.get('/export/status/:exportId', async (req, res) => {
  const log = await req.db.exportLogs.findById(req.params.exportId);
  if (!log || log.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
  res.json(log);
});

module.exports = router;
