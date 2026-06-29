import type { Validate } from 'payload'

const HEX_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/

/** Validates #RGB or #RRGGBB hex strings stored in text fields. */
export const validateHexColor: Validate<string> = (value) => {
  if (!value) return true
  return HEX_RE.test(value) || 'Mã màu hex không hợp lệ (vd: #008E4D)'
}

export const normalizeHexForPicker = (value?: string | null): string => {
  if (!value || !HEX_RE.test(value)) return '#000000'
  if (value.length === 4) {
    const [, r, g, b] = value
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  return value.toUpperCase()
}
