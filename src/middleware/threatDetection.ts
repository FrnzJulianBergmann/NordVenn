import { Request, Response, NextFunction } from "express"

const SUSPICIOUS_PATTERNS = [
  /(<script|javascript:|data:text\/html)/i,
  /(union\s+select|drop\s+table|insert\s+into)/i,
  /(\.\.\/|\.\.\\ )/,
  /(exec\s*\(|eval\s*\()/i,
]

export function threatDetection(req: Request, res: Response, next: NextFunction) {
  const payload = JSON.stringify({ body: req.body, query: req.query, params: req.params })

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(payload)) {
      console.warn()
      return res.status(400).json({ error: "Invalid request", code: "THREAT_DETECTED" })
    }
  }

  next()
}

export function enforceHttps(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "production" && !req.secure && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(301, "https://" + req.headers.host + req.url)
  }
  next()
}
