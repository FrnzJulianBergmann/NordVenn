import { body, validationResult } from "express-validator"
import { Request, Response, NextFunction } from "express"

export const validateLoginInput = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    next()
  },
]

export const validateRegisterInput = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 12 }),
  body("name").trim().isLength({ min: 2, max: 50 }).escape(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    next()
  },
]
