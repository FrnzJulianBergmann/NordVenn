const helmet = require('helmet');
module.exports = helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'https:'], connectSrc: ["'self'", 'https://api.stripe.com'] } },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true, xssFilter: true, frameguard: { action: 'deny' },
});
