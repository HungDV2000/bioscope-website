'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Nguyên liệu', href: '/nguyen-lieu' },
  { label: 'Giải pháp', href: '/giai-phap' },
  { label: 'Đồng kiến tạo', href: '/dong-kien-tao' },
  { label: 'Nghiên cứu & Phát triển', href: '/rd' },
  { label: 'Tài nguyên', href: '/tai-nguyen' },
  { label: 'Về chúng tôi', href: '/ve-chung-toi' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-40 border-b border-primary-border/40 bg-white/90 backdrop-blur-md">
      <div className="container-bs flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/logo.avif" alt="Bioscope" width={150} height={42} priority className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[14px] font-medium text-ink/75 transition-colors duration-300 hover:bg-primary-tint hover:text-primary-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden text-[13px] font-semibold text-ink/55 transition-colors hover:text-primary sm:block">
            VI<span className="text-ink/25"> / EN</span>
          </button>
          <Link
            href="/lien-he"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white shadow-soft transition-colors duration-300 hover:bg-primary-dark sm:inline-flex"
          >
            Yêu cầu mẫu thử
            <FlaskConical className="h-4 w-4" strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary-tint text-primary-dark lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 top-[72px] z-30 flex flex-col overflow-y-auto bg-white px-6 pb-10 pt-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ul className="flex flex-col gap-1">
          {NAV.map((item, i) => (
            <li
              key={item.href}
              className={cn(
                'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              )}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }}
            >
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-primary-border/40 py-4 text-xl font-bold tracking-tight text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/lien-he"
          onClick={() => setOpen(false)}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white"
        >
          Yêu cầu mẫu thử
          <FlaskConical className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </div>
    </>
  )
}
