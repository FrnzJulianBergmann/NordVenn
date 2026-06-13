// sessionHandler.js
const activeSessions = new Map();

const createSession = (userId, token) => {
  activeSessions.set(userId, { token, createdAt: Date.now() });
};

const invalidateSession = (userId) => {
  activeSessions.delete(userId);
};

const isSessionValid = (userId, token) => {
  const session = activeSessions.get(userId);
  return session && session.token === token;
};

module.exports = { createSession, invalidateSession, isSessionValid };
