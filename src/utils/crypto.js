const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;
const hashPassword = async (plain) => await bcrypt.hash(plain, SALT_ROUNDS);
const verifyPassword = async (plain, hash) => await bcrypt.compare(plain, hash);
const generateToken = (length = 32) => require('crypto').randomBytes(length).toString('hex');
const constantTimeCompare = (a, b) => { if (a.length !== b.length) return false; return require('crypto').timingSafeEqual(Buffer.from(a), Buffer.from(b)); };
module.exports = { hashPassword, verifyPassword, generateToken, constantTimeCompare };
