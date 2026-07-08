import { NextResponse } from 'next/server'
import { CMS_URL } from '@/lib/payload'
import { rateLimit, clientIp } from '@/lib/rate-limit'

/** Resolve a form's id by title, cached per server instance. */
const FORM_IDS = new Map<string, number>()

async function resolveFormId(title: string): Promise<number | null> {
  if (FORM_IDS.has(title)) return FORM_IDS.get(title)!
  try {
    const res = await fetch(
      `${CMS_URL}/api/forms?where[title][equals]=${encodeURIComponent(title)}&limit=1&depth=0`,
      { signal: AbortSignal.timeout(3000) },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { docs?: { id: number }[] }
    const id = data.docs?.[0]?.id ?? null
    if (id != null) FORM_IDS.set(title, id)
    return id
  } catch {
    return null
  }
}

const isEmail = (v: unknown) => typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)

export async function POST(req: Request) {
  // Basic abuse protection: 5 submissions / minute / IP.
  const limit = rateLimit(`form-submit:${clientIp(req)}`, 5, 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: { formTitle?: string; data?: Record<string, unknown>; website?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  // Honeypot: real users never fill the hidden `website` field — drop silently as success.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true })
  }

  const { formTitle, data } = body
  if (!formTitle || !data || typeof data !== 'object') {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }
  if (!isEmail(data.email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 422 })
  }

  const formId = await resolveFormId(formTitle)
  if (formId == null) {
    return NextResponse.json({ ok: false, error: 'form_not_found' }, { status: 404 })
  }

  const submissionData = Object.entries(data)
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([field, value]) => ({ field, value: String(value) }))

  try {
    const res = await fetch(`${CMS_URL}/api/form-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form: formId, submissionData }),
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 502 })
  } catch {
    return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
