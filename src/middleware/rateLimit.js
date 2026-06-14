const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../db/redis');
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, store: new RedisStore({ client: redis }), message: { error: 'Too many attempts, try again in 15 minutes' }, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, store: new RedisStore({ client: redis }), standardHeaders: true });
const strictLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, store: new RedisStore({ client: redis }), message: { error: 'Rate limit exceeded' } });
module.exports = { authLimiter, apiLimiter, strictLimiter };
