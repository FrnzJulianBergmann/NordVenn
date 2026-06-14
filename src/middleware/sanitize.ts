import { Request, Response, NextFunction } from "express"
import DOMPurify from "isomorphic-dompurify"

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = deepSanitize(req.body)
  }
  next()
}

function deepSanitize(obj: any): any {
  if (typeof obj === "string") return DOMPurify.sanitize(obj.trim())
  if (Array.isArray(obj)) return obj.map(deepSanitize)
  if (obj && typeof obj === "object") {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepSanitize(v)]))
  }
  return obj
}
