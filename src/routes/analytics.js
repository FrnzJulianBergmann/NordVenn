const express = require('express');
const router = express.Router();
router.get('/repos/:id/analytics/realtime', async (req, res) => {
  const metrics = await req.analyticsService.getRealtimeMetrics(req.params.id);
  res.json(metrics);
});
router.get('/repos/:id/analytics/history', async (req, res) => {
  const { from, to, granularity = 'hour' } = req.query;
  const events = await req.db.analyticsEvents.findAll({ where: { repoId: req.params.id, timestamp: { gte: new Date(from), lte: new Date(to) } }, order: [['timestamp', 'ASC']] });
  res.json({ data: events, granularity });
});
router.get('/repos/:id/analytics/contributors', async (req, res) => {
  const stats = await req.db.commits.findAll({ where: { repoId: req.params.id }, attributes: ['author', [req.db.sequelize.fn('COUNT', '*'), 'count']], group: ['author'], order: [[req.db.sequelize.literal('count'), 'DESC']], limit: 10 });
  res.json({ data: stats });
});
module.exports = router;
