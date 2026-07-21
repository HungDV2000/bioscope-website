'use client'

import { useConfig, usePreferences, useEditDepth } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Mở Media bằng chế độ thư mục (grid thumbnail) thay vì bảng danh sách.
 *
 * Đây là một PROVIDER, không phải `views.list`. Trước kia nó được gắn vào
 * `Media.admin.components.views.list` — nhưng drawer "Chọn từ thư viện" của
 * trường upload dùng lại đúng list view đó, nên component (vốn render `null`)
 * làm drawer TRẮNG TRƠN. Là provider thì nó chạy song song, luôn render
 * `children`, và chỉ hành động khi đang ở đúng route danh sách Media.
 */
export const MediaLibraryRedirect: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { config } = useConfig()
  const { setPreference } = usePreferences()
  const router = useRouter()
  const pathname = usePathname()
  const editDepth = useEditDepth()

  useEffect(() => {
    // Trong drawer (upload/relationship picker) — tuyệt đối không điều hướng.
    if (editDepth > 0) return

    const adminRoute = config.routes.admin
    const listPath = formatAdminURL({ adminRoute, path: '/collections/media' })
    const norm = (s: string) => s.replace(/\/+$/, '')

    // Chỉ redirect khi URL hiện tại đúng là trang danh sách Media. Khi component
    // được render trong drawer, pathname vẫn là trang đang mở (vd trang sửa Page)
    // nên điều kiện này false và ta bỏ qua an toàn.
    if (!pathname || norm(pathname) !== norm(listPath)) return

    const foldersSlug = config.folders?.slug ?? 'payload-folders'

    void setPreference('collection-media', { listViewType: 'folders' })

    router.replace(
      formatAdminURL({
        adminRoute,
        path: `/collections/media/${foldersSlug}` as `/${string}`,
      }),
    )
  }, [config, router, setPreference, editDepth, pathname])

  // Provider: luôn render children, nếu không cả admin sẽ trắng.
  return <>{children}</>
}

export default MediaLibraryRedirect
