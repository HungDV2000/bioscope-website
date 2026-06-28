import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ textAlign: 'center' }}>
      <h1 style={{ marginBottom: 8 }}>Bioscope CMS</h1>
      <p style={{ color: '#5B6661', marginBottom: 16 }}>Headless CMS · Payload 3</p>
      <Link
        href="/admin"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: '#0E6147',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
        }}
      >
        Vào Admin →
      </Link>
    </main>
  )
}
