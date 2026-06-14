import rateLimit from "express-rate-limit"

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests", code: "RATE_LIMIT_EXCEEDED" },
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many auth attempts", code: "AUTH_RATE_LIMIT" },
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "API rate limit exceeded", code: "API_RATE_LIMIT" },
})
