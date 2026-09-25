'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

/**
 * Trình phát ngay trên trang chi tiết bản ghi âm.
 *
 * Payload chỉ hiện tên file cho upload không phải ảnh; người duyệt phải bấm
 * tải về rồi mở bằng app khác — chậm và để lại file giọng nói trên máy họ.
 * Phát thẳng trong admin thì nghe xong chọn "Đạt"/"Loại" luôn.
 */
export const AudioPreview: React.FC = () => {
  const url = useFormFields(([fields]) => fields.url?.value as string | undefined)
  const mime = useFormFields(([fields]) => fields.mimeType?.value as string | undefined)
  if (!url) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <audio controls preload="metadata" style={{ width: '100%' }}>
        <source src={url} {...(mime ? { type: mime.replace(/^video\//, 'audio/') } : {})} />
      </audio>
    </div>
  )
}
