// lib/session.ts
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret'
)

export async function createSession(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}