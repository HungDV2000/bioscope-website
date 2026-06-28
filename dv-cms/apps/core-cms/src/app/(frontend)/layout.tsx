import React from 'react'

export const metadata = {
  title: 'Bioscope CMS',
  description: 'Headless CMS for Bioscope Vietnam',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </body>
    </html>
  )
}
