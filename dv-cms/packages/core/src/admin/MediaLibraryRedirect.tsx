'use client'

import { useConfig, usePreferences, useEditDepth } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Mở Media bằng chế độ thư mục (grid thumbnail) thay vì bảng danh sách. */
export const MediaLibraryRedirect: React.FC = () => {
  const { config } = useConfig()
  const { setPreference } = usePreferences()
  const router = useRouter()
  // >0 means this list is rendered inside a drawer (the "choose from library"
  // picker of an upload/relationship field). Never redirect there — that would
  // navigate the whole admin away instead of letting the user pick an image.
  const editDepth = useEditDepth()

  useEffect(() => {
    if (editDepth > 0) return

    const foldersSlug = config.folders?.slug ?? 'payload-folders'
    const path = `/collections/media/${foldersSlug}`

    void setPreference('collection-media', { listViewType: 'folders' })

    router.replace(
      formatAdminURL({
        adminRoute: config.routes.admin,
        path: path as `/${string}`,
      }),
    )
  }, [config, router, setPreference, editDepth])

  return null
}

export default MediaLibraryRedirect
