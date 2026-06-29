'use client'

import { useState } from 'react'
import type { Ingredient } from '@/lib/content'
import { DocGating } from './doc-gating'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'

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
        }
      : {
          benefits: 'Công dụng nổi bật',
          manufacturer: 'Nhà sản xuất',
          origin: 'Xuất xứ',
          forms: 'Dạng bào chế phù hợp',
          disclaimer: '* Liều dùng và phối hợp chỉ mang tính tham khảo — vui lòng liên hệ chuyên gia kỹ thuật.',
          suggested: 'Liều gợi ý',
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
          <div className="space-y-5">
            <p className="text-[15px] leading-relaxed text-ink/70">{ingredient.overview ?? ingredient.shortDesc}</p>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">{copy.benefits}</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {ingredient.benefits.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-primary-tint px-3.5 py-1.5 text-[13px] font-medium text-primary-dark"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            {ingredient.manufacturer && (
              <p className="text-[14px] text-ink/60">
                {copy.manufacturer}: <strong className="text-ink/80">{ingredient.manufacturer}</strong> · {copy.origin}{' '}
                {ingredient.origin}
              </p>
            )}
          </div>
        )}

        {tab === 'technical' && (
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
        )}

        {tab === 'docs' && <DocGating ingredient={ingredient.name} />}

        {tab === 'applications' && (
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
        )}
      </div>
    </div>
  )
}
