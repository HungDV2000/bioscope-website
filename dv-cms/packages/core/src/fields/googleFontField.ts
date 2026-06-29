import type { SelectField } from 'payload'

import { DEFAULT_GOOGLE_FONT_ID, GOOGLE_FONTS } from '../theme/googleFonts.js'

export const googleFontField = (
  name: string,
  label: { en: string; vi: string },
  defaultValue: string = DEFAULT_GOOGLE_FONT_ID,
  description?: { en: string; vi: string },
): SelectField => ({
  name,
  type: 'select',
  label,
  defaultValue,
  required: true,
  admin: {
    description,
    isClearable: false,
  },
  options: GOOGLE_FONTS.map((font) => ({
    label: font.label,
    value: font.id,
  })),
})
