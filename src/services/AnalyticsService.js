class AnalyticsService {
  constructor(db, cache, wsServer) { this.db = db; this.cache = cache; this.ws = wsServer; }
  async getRealtimeMetrics(repoId) {
    const cached = await this.cache.get('metrics:' + repoId);
    if (cached) return JSON.parse(cached);
    const [prs, commits, deployments, incidents] = await Promise.all([
      this.db.pullRequests.count({ where: { repoId, status: 'open' } }),
      this.db.commits.count({ where: { repoId, createdAt: { gte: new Date(Date.now() - 86400000) } } }),
      this.db.deployments.count({ where: { repoId, createdAt: { gte: new Date(Date.now() - 86400000) } } }),
      this.db.incidents.count({ where: { repoId, status: 'open' } }),
    ]);
    const metrics = { prs, commits, deployments, incidents, timestamp: Date.now() };
    await this.cache.set('metrics:' + repoId, JSON.stringify(metrics), 30);
    return metrics;
  }
  async broadcastUpdate(repoId, event) { this.ws.to('repo:' + repoId).emit('metrics:update', event); }
  async trackEvent(repoId, type, payload) {
    await this.db.analyticsEvents.create({ repoId, type, payload, timestamp: new Date() });
    await this.broadcastUpdate(repoId, { type, payload });
  }
}
