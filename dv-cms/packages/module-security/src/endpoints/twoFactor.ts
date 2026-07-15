/**
 * Two-factor (TOTP) endpoints. Enrollment + a stateless session-verification
 * cookie used by the post-login <TwoFactorGate>. All routes require an
 * authenticated user (req.user); enable/verify additionally check the code.
 */

import type { Endpoint, PayloadRequest } from 'payload'
import { createHmac } from 'node:crypto'
import { generateSecret, otpauthUri, verifyTotp } from '../lib/totp.js'

const COOKIE = 'dv2fa'
const COOKIE_TTL_MS = 12 * 60 * 60 * 1000 // 12h

function secret(): string {
  return process.env.PAYLOAD_SECRET || 'dev-secret'
}

/** Signed value binding the 2FA-verified state to a user id + expiry. */
export function sign2faCookie(userId: string | number, exp: number): string {
  const payload = `${userId}.${exp}`
  const mac = createHmac('sha256', secret()).update(payload).digest('hex').slice(0, 32)
  return `${payload}.${mac}`
}

export function verify2faCookie(value: string | undefined, userId: string | number): boolean {
  if (!value) return false
  const parts = value.split('.')
  if (parts.length !== 3) return false
  const [uid, exp, mac] = parts
  if (uid !== String(userId)) return false
  if (Number(exp) < Date.now()) return false
  const expected = createHmac('sha256', secret()).update(`${uid}.${exp}`).digest('hex').slice(0, 32)
  return mac === expected
}

async function body(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    // Payload may have pre-parsed the body onto req.data; otherwise read json.
    if (req.data && typeof req.data === 'object') return req.data as Record<string, unknown>
    const j = await (req as unknown as { json?: () => Promise<unknown> }).json?.()
    return (j as Record<string, unknown>) ?? {}
  } catch {
    return {}
  }
}

const requireUser = (req: PayloadRequest) => {
  if (!req.user) throw new Error('unauthorized')
  return req.user as { id: string | number; email?: string; twoFactorSecret?: string; twoFactorPendingSecret?: string }
}

/**
 * Update the auth user with the 2FA fields. These are injected dynamically by
 * the plugin, so the generated collection type doesn't know them — cast the
 * data through `never` to bypass the typed overload safely.
 */
function updateUser(req: PayloadRequest, id: string | number, data: Record<string, unknown>) {
  return req.payload.update({ collection: 'users', id, data: data as never, overrideAccess: true })
}

// POST /security/2fa/setup — create a pending secret, return provisioning info.
export const twoFactorSetup: Endpoint = {
  path: '/security/2fa/setup',
  method: 'post',
  handler: async (req) => {
    try {
      const user = requireUser(req)
      const sec = generateSecret()
      await updateUser(req, user.id, { twoFactorPendingSecret: sec })
      const issuer = process.env.TWO_FACTOR_ISSUER || 'Bioscope CMS'
      return Response.json({ secret: sec, otpauthUri: otpauthUri(sec, user.email ?? String(user.id), issuer) })
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 401 })
    }
  },
}

// POST /security/2fa/enable { token } — verify the pending secret and enable.
export const twoFactorEnable: Endpoint = {
  path: '/security/2fa/enable',
  method: 'post',
  handler: async (req) => {
    try {
      const user = requireUser(req)
      const { token } = await body(req)
      const pending = user.twoFactorPendingSecret
      if (!pending) return Response.json({ error: 'Chưa khởi tạo 2FA.' }, { status: 400 })
      if (!verifyTotp(pending, String(token ?? ''))) {
        return Response.json({ error: 'Mã không đúng.' }, { status: 400 })
      }
      await updateUser(req, user.id, { twoFactorEnabled: true, twoFactorSecret: pending, twoFactorPendingSecret: null })
      return Response.json({ ok: true })
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 401 })
    }
  },
}

// POST /security/2fa/disable { token } — turn 2FA off (requires a valid code).
export const twoFactorDisable: Endpoint = {
  path: '/security/2fa/disable',
  method: 'post',
  handler: async (req) => {
    try {
      const user = requireUser(req)
      const { token } = await body(req)
      if (user.twoFactorSecret && !verifyTotp(user.twoFactorSecret, String(token ?? ''))) {
        return Response.json({ error: 'Mã không đúng.' }, { status: 400 })
      }
      await updateUser(req, user.id, { twoFactorEnabled: false, twoFactorSecret: null, twoFactorPendingSecret: null })
      return Response.json({ ok: true })
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 401 })
    }
  },
}

// POST /security/2fa/verify { token } — validate a code for the current session,
// setting the signed gate cookie so the admin UI unlocks.
export const twoFactorVerify: Endpoint = {
  path: '/security/2fa/verify',
  method: 'post',
  handler: async (req) => {
    try {
      const user = requireUser(req)
      const { token } = await body(req)
      if (!user.twoFactorSecret || !verifyTotp(user.twoFactorSecret, String(token ?? ''))) {
        return Response.json({ error: 'Mã không đúng.' }, { status: 400 })
      }
      const exp = Date.now() + COOKIE_TTL_MS
      const value = sign2faCookie(user.id, exp)
      return Response.json(
        { ok: true },
        {
          headers: {
            'set-cookie': `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(COOKIE_TTL_MS / 1000)}`,
          },
        },
      )
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 401 })
    }
  },
}

// GET /security/2fa/status — whether the current session needs to pass 2FA.
export const twoFactorStatus: Endpoint = {
  path: '/security/2fa/status',
  method: 'get',
  handler: async (req) => {
    const user = req.user as { id?: string | number; twoFactorEnabled?: boolean } | undefined
    if (!user?.id) return Response.json({ required: false, enabled: false })
    const cookieHeader = req.headers?.get?.('cookie') ?? ''
    const match = cookieHeader.match(new RegExp(`${COOKIE}=([^;]+)`))
    const verified = verify2faCookie(match?.[1], user.id)
    return Response.json({
      enabled: Boolean(user.twoFactorEnabled),
      required: Boolean(user.twoFactorEnabled) && !verified,
    })
  },
}

export const twoFactorEndpoints: Endpoint[] = [
  twoFactorSetup,
  twoFactorEnable,
  twoFactorDisable,
  twoFactorVerify,
  twoFactorStatus,
]
