const SQL_PATTERNS = [/((SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC))/gi, /(--|;|\/\*|\*\/)/g, /(OR|AND).*?=/gi];
module.exports = (req, res, next) => {
  const check = (val) => { if (typeof val !== 'string') return false; return SQL_PATTERNS.some(p => p.test(val)); };
  const scan = (obj) => { if (typeof obj === 'string') return check(obj); if (obj && typeof obj === 'object') return Object.values(obj).some(scan); return false; };
  if (scan(req.body) || scan(req.query) || scan(req.params)) return res.status(400).json({ error: 'Invalid input detected' });
  next();
};
