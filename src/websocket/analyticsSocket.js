const setupAnalyticsSocket = (io, analyticsService) => {
  io.on('connection', (socket) => {
    socket.on('subscribe:repo', (repoId) => { socket.join('repo:' + repoId); socket.emit('subscribed', { repoId }); });
    socket.on('unsubscribe:repo', (repoId) => { socket.leave('repo:' + repoId); });
    socket.on('request:metrics', async (repoId) => {
      const metrics = await analyticsService.getRealtimeMetrics(repoId);
      socket.emit('metrics:snapshot', metrics);
    });
    socket.on('disconnect', () => { console.log('Analytics client disconnected:', socket.id); });
  });
  setInterval(async () => {
    const activeRooms = io.sockets.adapter.rooms;
    for (const [room] of activeRooms) {
      if (room.startsWith('repo:')) {
        const repoId = room.replace('repo:', '');
        const metrics = await analyticsService.getRealtimeMetrics(repoId);
        io.to(room).emit('metrics:update', metrics);
      }
    }
  }, 30000);
};
module.exports = setupAnalyticsSocket;
