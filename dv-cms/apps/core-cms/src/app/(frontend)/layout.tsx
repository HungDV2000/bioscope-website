import React from 'react'

export const metadata = {
  title: 'Bioscope Vietnam',
  description: 'Thông báo trạng thái dịch vụ trực tuyến',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
