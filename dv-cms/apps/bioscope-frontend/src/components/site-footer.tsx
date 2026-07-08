'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Globe, MessageCircle, Share2, Send } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'

const SOCIAL: { Icon: typeof Globe; label: string }[] = [
  { Icon: Globe, label: 'Website' },
  { Icon: MessageCircle, label: 'Zalo' },
  { Icon: Share2, label: 'LinkedIn' },
  { Icon: Send, label: 'Telegram' },
]

const FOOTER_HREFS = [
  ['/nguyen-lieu', '/nguyen-lieu', '/nguyen-lieu', '/nguyen-lieu'],
  ['/giai-phap/cung-cap-nguyen-lieu', '/giai-phap/phat-trien-cong-thuc-odm', '/giai-phap/dong-kien-tao-toan-hanh-trinh'],
  ['/ve-chung-toi', '/rd', '/case-study', '/tai-nguyen'],
  ['/lien-he', '/lien-he', '/cau-hoi-thuong-gap', '/chinh-sach-bao-mat', '/member/login'],
] as const

type Col = { title: string; links: { label: string; href: string }[] }

export function SiteFooter({ columns }: { columns?: Col[] }) {
  const { t } = useLocale()
  // Footer columns from the CMS `navigation` global (falls back to static i18n).
  const fallback: Col[] = (['ingredients', 'solutions', 'company', 'support'] as const).map((key, c) => ({
    title: t.footer.cols[key].title,
    links: t.footer.cols[key].links.map((label, i) => ({ label, href: FOOTER_HREFS[c][i] ?? '#' })),
  }))
  const cols = columns && columns.length > 0 ? columns : fallback

  return (
    <footer className="border-t border-primary-border/50 bg-mist">
      <div className="container-bs grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Image src="/logo.avif" alt="Bioscope" width={150} height={42} className="h-10 w-auto" />
          <p className="mt-5 text-[14px] leading-relaxed text-ink/60">{t.footer.tagline}</p>
          <div className="mt-6 flex gap-2">
            {SOCIAL.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-primary-border bg-white text-ink/50 transition-colors duration-300 hover:text-primary"
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] text-ink/65 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-border/50">
        <div className="container-bs flex flex-col items-center justify-between gap-2 py-5 text-[12.5px] text-ink/45 sm:flex-row">
          <span>{t.footer.copyright}</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/chinh-sach-bao-mat" className="transition-colors hover:text-primary">
              {t.footer.privacy}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/dieu-khoan-su-dung" className="transition-colors hover:text-primary">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
