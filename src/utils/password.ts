import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}

export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 12) return { valid: false, reason: "Minimum 12 characters" }
  if (!/[A-Z]/.test(password)) return { valid: false, reason: "Needs uppercase letter" }
  if (!/[0-9]/.test(password)) return { valid: false, reason: "Needs number" }
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, reason: "Needs special character" }
  return { valid: true }
}
