'use client'

import React, { useCallback, useMemo } from 'react'
import { SelectInput, useConfig, useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'

import { listSelectableContentCollections } from '../lib/collection-options.js'

export const ContentCollectionSlugsField: React.FC<SelectFieldClientProps> = (props) => {
  const { field, path: pathFromProps, readOnly, validate } = props
  const { config } = useConfig()

  const {
    name,
    admin: {
      className,
      description,
      isClearable = true,
      isSortable = true,
      placeholder,
    } = {},
    hasMany = true,
    label,
    localized,
    required,
  } = field

  const options = useMemo(
    () => listSelectableContentCollections(config.collections),
    [config.collections],
  )

  const memoizedValidate = useCallback(
    (value: unknown, validationOptions: Parameters<NonNullable<typeof validate>>[1]) => {
      if (typeof validate === 'function') {
        return validate(value, {
          ...validationOptions,
          hasMany,
          options,
          required,
        })
      }
    },
    [validate, required, hasMany, options],
  )

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    disabled,
    path,
    setValue,
    showError,
    value,
  } = useField({
    potentiallyStalePath: pathFromProps,
    validate: memoizedValidate,
  })

  const onChange = useCallback(
    (selectedOption: unknown) => {
      if (readOnly || disabled) return

      let newValue: string | string[] | null = null
      if (selectedOption && hasMany) {
        if (Array.isArray(selectedOption)) {
          newValue = selectedOption.map((option) => String((option as { value: string }).value))
        } else {
          newValue = []
        }
      } else if (selectedOption && !Array.isArray(selectedOption)) {
        newValue = String((selectedOption as { value: string }).value)
      }

      setValue(newValue)
    },
    [readOnly, disabled, hasMany, setValue],
  )

  return (
    <SelectInput
      AfterInput={AfterInput}
      BeforeInput={BeforeInput}
      className={className}
      Description={Description}
      description={description}
      Error={Error}
      hasMany={hasMany}
      isClearable={isClearable}
      isSortable={isSortable}
      Label={Label}
      label={label}
      localized={localized}
      name={name}
      onChange={onChange}
      options={options}
      path={path}
      placeholder={placeholder}
      readOnly={readOnly || disabled}
      required={required}
      showError={showError}
      value={value}
    />
  )
}

export default ContentCollectionSlugsField
