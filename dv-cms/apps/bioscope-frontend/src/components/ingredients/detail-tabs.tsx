'use client'

import { useState } from 'react'
import { CheckCircle2, FileQuestion, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Ingredient } from '@/lib/content'
import { DocGating } from './doc-gating'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'

/** Friendly empty state so tabs without data don't render a blank box. */
function EmptyState({ text, cta }: { text: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary-border/70 bg-mist/30 px-6 py-12 text-center">
      <FileQuestion className="h-8 w-8 text-primary/50" strokeWidth={1.5} />
      <p className="max-w-sm text-[14px] text-ink/55">{text}</p>
      <Link
        href="/lien-he"
        className="mt-1 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        {cta}
      </Link>
    </div>
  )
}

type TabId = 'overview' | 'technical' | 'docs' | 'applications'

export function DetailTabs({ ingredient }: { ingredient: Ingredient }) {
  const { locale } = useLocale()

  const tabs: { id: TabId; label: string }[] =
    locale === 'en'
      ? [
          { id: 'overview', label: 'Overview' },
          { id: 'technical', label: 'Technical' },
          { id: 'docs', label: 'Documents' },
          { id: 'applications', label: 'Applications' },
        ]
      : [
          { id: 'overview', label: 'Tổng quan' },
          { id: 'technical', label: 'Kỹ thuật' },
          { id: 'docs', label: 'Tài liệu' },
          { id: 'applications', label: 'Ứng dụng' },
        ]

  const copy =
    locale === 'en'
      ? {
          benefits: 'Key benefits',
          manufacturer: 'Manufacturer',
          origin: 'Origin',
          forms: 'Suitable dosage forms',
          disclaimer:
            '* Dosage and combinations are for reference only — please contact our technical experts.',
          suggested: 'Suggested dosage',
          emptyTech: 'Technical specifications for this material are available on request.',
          emptyApp: 'Application guidance for this material is available on request.',
          contact: 'Request information',
        }
      : {
          benefits: 'Công dụng nổi bật',
          manufacturer: 'Nhà sản xuất',
          origin: 'Xuất xứ',
          forms: 'Dạng bào chế phù hợp',
          disclaimer: '* Liều dùng và phối hợp chỉ mang tính tham khảo — vui lòng liên hệ chuyên gia kỹ thuật.',
          suggested: 'Liều gợi ý',
          emptyTech: 'Thông số kỹ thuật của nguyên liệu này sẽ được cung cấp khi bạn yêu cầu.',
          emptyApp: 'Hướng dẫn ứng dụng của nguyên liệu này sẽ được cung cấp khi bạn yêu cầu.',
          contact: 'Yêu cầu thông tin',
        }

  const [tab, setTab] = useState<TabId>('overview')

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-primary-border/60">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'relative px-4 py-3 text-[14.5px] font-semibold transition-colors duration-300',
              tab === id ? 'text-primary' : 'text-ink/50 hover:text-ink',
            )}
          >
            {label}
            {tab === id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="pt-7">
        {tab === 'overview' && (
          <div className="space-y-7">
            {(ingredient.overview ?? ingredient.shortDesc) && (
              <div className="space-y-3 text-[15px] leading-relaxed text-ink/70">
                {(ingredient.overview ?? ingredient.shortDesc).split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
            {ingredient.benefits.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">
                  <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.8} />
                  {copy.benefits}
                </h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ingredient.benefits.map((b) => (
                    <div
                      key={b}
                      className="flex items-start gap-3 rounded-2xl border border-primary-border/50 bg-white px-4 py-3.5 text-[14px] leading-snug text-ink/75"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.8} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {ingredient.manufacturer && (
              <p className="text-[14px] text-ink/60">
                {copy.manufacturer}: <strong className="text-ink/80">{ingredient.manufacturer}</strong> · {copy.origin}{' '}
                {ingredient.origin}
              </p>
            )}
          </div>
        )}

        {tab === 'technical' &&
          (ingredient.specs.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-primary-border/60">
              {ingredient.specs.map((s, i) => (
                <div
                  key={s.label}
                  className={cn('grid grid-cols-[1fr_1.4fr] gap-4 px-5 py-3.5 text-[14px]', i % 2 === 0 ? 'bg-mist/40' : 'bg-white')}
                >
                  <span className="font-medium text-ink/55">{s.label}</span>
                  <span className="font-semibold text-ink">{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text={copy.emptyTech} cta={copy.contact} />
          ))}

        {tab === 'docs' && <DocGating ingredient={ingredient.name} />}

        {tab === 'applications' &&
          (ingredient.applications.length > 0 ? (
            <div className="space-y-5">
              <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">{copy.forms}</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {ingredient.applications.map((a) => (
                  <div
                    key={a}
                    className="rounded-2xl border border-primary-border/60 bg-white px-5 py-4 text-[14.5px] font-semibold text-ink"
                  >
                    {a}
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-ink/45">
                {copy.disclaimer}
                {ingredient.suggestedDosage && (
                  <span className="mt-2 block text-ink/55">
                    {copy.suggested}: {ingredient.suggestedDosage}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <EmptyState text={copy.emptyApp} cta={copy.contact} />
          ))}
      </div>
    </div>
  )
}
