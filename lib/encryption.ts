// lib/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  
  const key = crypto.pbkdf2Sync(
    process.env.ENCRYPTION_KEY!,
    salt,
    100000,
    KEY_LENGTH,
    'sha256'
  )
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ])
  
  const tag = cipher.getAuthTag()
  
  return Buffer.concat([
    salt,
    iv,
    tag,
    encrypted
  ]).toString('base64')
}

export function decrypt(encryptedText: string): string {
  const buffer = Buffer.from(encryptedText, 'base64')
  
  const salt = buffer.subarray(0, SALT_LENGTH)
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const tag = buffer.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  )
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  
  const key = crypto.pbkdf2Sync(
    process.env.ENCRYPTION_KEY!,
    salt,
    100000,
    KEY_LENGTH,
    'sha256'
  )
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8')
}