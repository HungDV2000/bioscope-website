/**
 * RFC 6238 TOTP (time-based one-time password) using only node:crypto — no
 * external dependency. Compatible with Google Authenticator / Authy / 1Password.
 */

import { createHmac, randomBytes } from 'node:crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/** Encode bytes to RFC 4648 base32 (no padding). */
export function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

/** Decode an RFC 4648 base32 string (ignores spaces/padding/case). */
export function base32Decode(str: string): Buffer {
  const clean = str.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

/** Generate a new random base32 secret (default 20 bytes / 160 bits). */
export function generateSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes))
}

/** HOTP value for a given counter. */
function hotp(secret: Buffer, counter: number, digits = 6): string {
  const buf = Buffer.alloc(8)
  // Write the 64-bit counter big-endian (high 32 bits are ~always 0 for TOTP).
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  buf.writeUInt32BE(counter >>> 0, 4)
  const hmac = createHmac('sha1', secret).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return (code % 10 ** digits).toString().padStart(digits, '0')
}

/** Current TOTP for a base32 secret. */
export function totp(secretBase32: string, atMs = Date.now(), period = 30, digits = 6): string {
  const counter = Math.floor(atMs / 1000 / period)
  return hotp(base32Decode(secretBase32), counter, digits)
}

/**
 * Verify a user-supplied token against the secret, allowing ±`window` periods
 * (default ±1 → tolerates ~30s clock skew). Constant-ish time over the window.
 */
export function verifyTotp(
  secretBase32: string,
  token: string,
  { window = 1, period = 30, digits = 6, atMs = Date.now() }: { window?: number; period?: number; digits?: number; atMs?: number } = {},
): boolean {
  const clean = (token ?? '').replace(/\s/g, '')
  if (!/^\d{6,8}$/.test(clean)) return false
  const secret = base32Decode(secretBase32)
  const counter = Math.floor(atMs / 1000 / period)
  let ok = false
  for (let i = -window; i <= window; i++) {
    if (hotp(secret, counter + i, digits) === clean) ok = true
  }
  return ok
}

/** Build the otpauth:// provisioning URI for QR / manual entry. */
export function otpauthUri(secretBase32: string, account: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
