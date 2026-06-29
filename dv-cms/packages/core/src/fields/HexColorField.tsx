'use client'

import React from 'react'
import { FieldError, FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

import { normalizeHexForPicker, validateHexColor } from './validateHexColor.js'

export const HexColorField: React.FC<TextFieldClientProps> = ({ field, path, readOnly }) => {
  const { value, setValue, showError } = useField<string>({ path, validate: validateHexColor })

  const hex = typeof value === 'string' ? value : ''
  const pickerValue = normalizeHexForPicker(hex)

  return (
    <div className="dv-hex-color field-type">
      <FieldLabel htmlFor={path} label={field.label} required={field.required} />
      <div className="dv-hex-color__row">
        <input
          id={`${path}-picker`}
          type="color"
          className="dv-hex-color__picker"
          value={pickerValue}
          disabled={Boolean(readOnly)}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          aria-label="Chọn màu"
        />
        <input
          id={path}
          type="text"
          className="dv-hex-color__text"
          value={hex}
          placeholder="#008E4D"
          disabled={Boolean(readOnly)}
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
        />
        <span
          className="dv-hex-color__swatch"
          style={{ backgroundColor: pickerValue }}
          aria-hidden
        />
      </div>
      {showError && <FieldError showError={showError} />}
    </div>
  )
}

export default HexColorField
