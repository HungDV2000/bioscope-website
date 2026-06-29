import type { SelectField } from 'payload'

const FIELD = '@dv/module-custom-types/fields#ContentCollectionSlugsField'

type Overrides = Omit<Partial<SelectField>, 'type' | 'options'>

/** Multi-select collection slugs — mọi content type trong hệ thống (core + custom CPT). */
export const contentCollectionSlugsField = (
  name: string,
  overrides: Overrides = {},
): SelectField => {
  const { admin, ...rest } = overrides

  return {
    name,
    type: 'select',
    hasMany: true,
    options: [],
    ...rest,
    admin: {
      ...admin,
      components: {
        ...admin?.components,
        Field: FIELD,
      },
    },
  }
}
