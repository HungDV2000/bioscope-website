/**
 * Bóc tách trình duyệt / hệ điều hành / loại thiết bị từ chuỗi User-Agent.
 *
 * Tự viết thay vì kéo thêm thư viện: chỉ cần mức "đủ dùng để sales biết khách
 * đang dùng gì". Không nhận ra được thì trả undefined chứ không đoán bừa.
 */
export type UaInfo = {
  browser?: string
  browserVersion?: string
  os?: string
  device?: 'desktop' | 'mobile' | 'tablet' | 'bot'
}

const BROWSERS: [RegExp, string][] = [
  // Thứ tự quan trọng: Edge/Opera/Samsung đều chứa "Chrome" trong UA.
  [/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
  [/OPR\/([\d.]+)/, 'Opera'],
  [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
  [/CriOS\/([\d.]+)/, 'Chrome (iOS)'],
  [/FxiOS\/([\d.]+)/, 'Firefox (iOS)'],
  [/Chrome\/([\d.]+)/, 'Chrome'],
  [/Firefox\/([\d.]+)/, 'Firefox'],
  [/Version\/([\d.]+).*Safari/, 'Safari'],
]

const OSES: [RegExp, string][] = [
  [/Windows NT 10\.0/, 'Windows 10/11'],
  [/Windows NT ([\d.]+)/, 'Windows'],
  [/Android ([\d.]+)/, 'Android'],
  [/(?:iPhone|iPad); CPU (?:iPhone )?OS ([\d_]+)/, 'iOS'],
  [/Mac OS X ([\d_.]+)/, 'macOS'],
  [/CrOS/, 'ChromeOS'],
  [/Linux/, 'Linux'],
]

export function parseUserAgent(ua: string): UaInfo {
  if (!ua) return {}
  if (/bot|crawler|spider|crawling|headless/i.test(ua)) return { device: 'bot' }

  const out: UaInfo = {}

  for (const [re, name] of BROWSERS) {
    const m = ua.match(re)
    if (m) {
      out.browser = name
      out.browserVersion = m[1]?.split('.').slice(0, 2).join('.')
      break
    }
  }

  for (const [re, name] of OSES) {
    const m = ua.match(re)
    if (m) {
      const ver = m[1]?.replace(/_/g, '.').split('.').slice(0, 2).join('.')
      out.os = ver && name !== 'Windows 10/11' ? `${name} ${ver}` : name
      break
    }
  }

  out.device = /iPad|Tablet/i.test(ua)
    ? 'tablet'
    : /Mobi|Android|iPhone/i.test(ua)
      ? 'mobile'
      : 'desktop'

  return out
}
