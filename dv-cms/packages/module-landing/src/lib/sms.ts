import type { Payload } from 'payload'
import { SLUGS } from '../constants.js'

type Settings = {
  otpProvider?: 'log' | 'esms' | 'speedsms'
  smsTemplate?: string
  brand?: string
  esms?: { apiKey?: string; secretKey?: string; brandname?: string; smsType?: string }
  speedsms?: { accessToken?: string; sender?: string; smsType?: string }
  otpPerPhonePerHour?: number
  otpPerIpPerHour?: number
  serverIp?: string
}

export async function getLandingSettings(payload: Payload): Promise<Settings> {
  try {
    return (await payload.findGlobal({ slug: SLUGS.settings, depth: 0, overrideAccess: true })) as Settings
  } catch {
    return {}
  }
}

export type SendResult = { delivered: boolean; provider: string; error?: string }

/**
 * Gửi tin OTP qua nhà cung cấp đang chọn trong "Cài đặt landing".
 *
 * Mọi lỗi được trả về chứ không ném: phía gọi quyết định báo gì cho khách.
 * Nội dung tin và số điện thoại KHÔNG ghi ra log ở chế độ gửi thật — log hay
 * được chuyển ra hệ thống giám sát bên ngoài, còn mã OTP thì còn hiệu lực.
 */
export async function sendSms(payload: Payload, phone: string, code: string): Promise<SendResult> {
  const s = await getLandingSettings(payload)
  const provider = s.otpProvider ?? 'log'
  const text = (s.smsTemplate || 'Ma xac thuc {brand} cua ban la {code}. Ma het han sau 5 phut.')
    .replaceAll('{code}', code)
    .replaceAll('{brand}', s.brand || 'Bioscope')

  if (provider === 'log') {
    payload.logger.warn(`[landing][OTP thử nghiệm] ${phone} → ${code}  (chưa cấu hình SMS thật, xem Cài đặt landing)`)
    return { delivered: true, provider }
  }

  try {
    if (provider === 'esms') {
      const cfg = s.esms ?? {}
      if (!cfg.apiKey || !cfg.secretKey) return { delivered: false, provider, error: 'esms_not_configured' }
      // eSMS REST v4 — CodeResult "100" là đã nhận yêu cầu gửi.
      const res = await fetch('https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ApiKey: cfg.apiKey,
          SecretKey: cfg.secretKey,
          Phone: phone,
          Content: text,
          Brandname: cfg.brandname || undefined,
          SmsType: cfg.smsType || '2',
          IsUnicode: '0',
        }),
        signal: AbortSignal.timeout(10_000),
      })
      const data = (await res.json().catch(() => ({}))) as { CodeResult?: string; ErrorMessage?: string }
      if (data.CodeResult === '100') return { delivered: true, provider }
      payload.logger.error(`[landing] eSMS từ chối: ${data.CodeResult} ${data.ErrorMessage ?? ''}`)
      return { delivered: false, provider, error: `esms_${data.CodeResult ?? res.status}` }
    }

    if (provider === 'speedsms') {
      const cfg = s.speedsms ?? {}
      if (!cfg.accessToken) return { delivered: false, provider, error: 'speedsms_not_configured' }
      const res = await fetch('https://api.speedsms.vn/index.php/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${cfg.accessToken}:x`).toString('base64')}`,
        },
        body: JSON.stringify({
          to: [phone],
          content: text,
          sms_type: Number(cfg.smsType || 3),
          sender: cfg.sender || undefined,
        }),
        signal: AbortSignal.timeout(10_000),
      })
      const data = (await res.json().catch(() => ({}))) as { status?: string; message?: string; code?: string }
      if (data.status === 'success') return { delivered: true, provider }
      payload.logger.error(`[landing] SpeedSMS từ chối: ${data.code ?? res.status} ${data.message ?? ''}`)
      return { delivered: false, provider, error: `speedsms_${data.code ?? res.status}` }
    }
  } catch (err) {
    payload.logger.error(`[landing] Gửi SMS lỗi (${provider}): ${String(err)}`)
    return { delivered: false, provider, error: 'network' }
  }

  return { delivered: false, provider, error: 'unknown_provider' }
}
