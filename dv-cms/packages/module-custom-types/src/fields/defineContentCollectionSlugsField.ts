import type { TextField } from 'payload'

const FIELD = '@dv/module-custom-types/fields#ContentCollectionSlugsField'

type Overrides = Omit<Partial<TextField>, 'type' | 'hasMany'>

/**
 * Multi-select collection slugs — options load runtime từ config.
 * Dùng `text` + hasMany (không dùng `select`) để tránh Postgres ENUM rỗng khi push schema.
 */
export const contentCollectionSlugsField = (
  name: string,
  overrides: Overrides = {},
): TextField => {
  const { admin, ...rest } = overrides

  return {
    name,
    type: 'text',
    hasMany: true,
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
