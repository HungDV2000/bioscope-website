'use client'

import { useConfig, usePreferences } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useRouter } from 'next/navigation.js'
import { useEffect } from 'react'

/** Mở Media bằng chế độ thư mục (grid thumbnail) thay vì bảng danh sách. */
export const MediaLibraryRedirect: React.FC = () => {
  const { config } = useConfig()
  const { setPreference } = usePreferences()
  const router = useRouter()

  useEffect(() => {
    const foldersSlug = config.folders?.slug ?? 'payload-folders'
    const path = `/collections/media/${foldersSlug}`

    void setPreference('collection-media', { listViewType: 'folders' })

    router.replace(
      formatAdminURL({
        adminRoute: config.routes.admin,
        path: path as `/${string}`,
      }),
    )
  }, [config, router, setPreference])

  return null
}

export default MediaLibraryRedirect
