import type { TextField } from 'payload'

import { validateHexColor } from './validateHexColor.js'

const HEX_COLOR_FIELD = '@dv/cms-core/fields#HexColorField'

export const hexColorField = (
  name: string,
  label: { en: string; vi: string },
  defaultValue: string,
  description?: { en: string; vi: string },
): TextField => ({
  name,
  type: 'text',
  label,
  defaultValue,
  validate: validateHexColor,
  admin: {
    description,
    components: {
      Field: HEX_COLOR_FIELD,
    },
  },
})
