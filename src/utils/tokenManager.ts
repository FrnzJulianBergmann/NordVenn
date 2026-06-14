import jwt from "jsonwebtoken"
import { createClient } from "redis"

const redis = createClient({ url: process.env.REDIS_URL })
const JWT_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateAccessToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" })
}

export function generateRefreshToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" })
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const isRevoked = await redis.get("revoked:" + token)
    if (isRevoked) return null
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch { return null }
}

export async function revokeToken(token: string) {
  const decoded = jwt.decode(token) as TokenPayload
  const ttl = (decoded?.exp ?? 0) - Math.floor(Date.now() / 1000)
  if (ttl > 0) await redis.setEx("revoked:" + token, ttl, "1")
}

export async function revokeAllUserTokens(userId: string) {
  await redis.set("revoke_user:" + userId, Date.now().toString())
}
