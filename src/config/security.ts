export const SECURITY_CONFIG = {
  jwt: {
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
    algorithm: "HS256" as const,
  },
  password: {
    minLength: 12,
    saltRounds: 12,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  rateLimit: {
    global: { windowMs: 15 * 60 * 1000, max: 100 },
    auth: { windowMs: 15 * 60 * 1000, max: 10 },
    api: { windowMs: 60 * 1000, max: 60 },
  },
  cors: {
    allowedOrigins: [
      process.env.FRONTEND_URL ?? "http://localhost:5173",
      "https://vanguard.apermeann.com",
    ],
    allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
  session: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    maxConcurrentSessions: 5,
  },
}
