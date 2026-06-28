'use client'

import { useState } from 'react'
import type { Ingredient } from '@/lib/content'
import { DocGating } from './doc-gating'
import { cn } from '@/lib/utils'

const TABS = ['Tổng quan', 'Kỹ thuật', 'Tài liệu', 'Ứng dụng'] as const
type Tab = (typeof TABS)[number]

export function DetailTabs({ ingredient }: { ingredient: Ingredient }) {
  const [tab, setTab] = useState<Tab>('Tổng quan')

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-primary-border/60">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative px-4 py-3 text-[14.5px] font-semibold transition-colors duration-300',
              tab === t ? 'text-primary' : 'text-ink/50 hover:text-ink',
            )}
          >
            {t}
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="pt-7">
        {tab === 'Tổng quan' && (
          <div className="space-y-5">
            <p className="text-[15px] leading-relaxed text-ink/70">
              {ingredient.overview ?? ingredient.shortDesc}
            </p>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">Công dụng nổi bật</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {ingredient.benefits.map((b) => (
                  <span key={b} className="rounded-full bg-primary-tint px-3.5 py-1.5 text-[13px] font-medium text-primary-dark">
                    {b}
                  </span>
                ))}
              </div>
            </div>
            {ingredient.manufacturer && (
              <p className="text-[14px] text-ink/60">
                Nhà sản xuất: <strong className="text-ink/80">{ingredient.manufacturer}</strong> · Xuất xứ{' '}
                {ingredient.origin}
              </p>
            )}
          </div>
        )}

        {tab === 'Kỹ thuật' && (
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

        {tab === 'Tài liệu' && <DocGating ingredient={ingredient.name} />}

        {tab === 'Ứng dụng' && (
          <div className="space-y-5">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">Dạng bào chế phù hợp</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              {ingredient.applications.map((a) => (
                <div key={a} className="rounded-2xl border border-primary-border/60 bg-white px-5 py-4 text-[14.5px] font-semibold text-ink">
                  {a}
                </div>
              ))}
            </div>
            <p className="text-[13px] text-ink/45">
              * Liều dùng và phối hợp chỉ mang tính tham khảo — vui lòng liên hệ chuyên gia kỹ thuật.
              {ingredient.suggestedDosage && (
                <span className="mt-2 block text-ink/55">
                  Liều gợi ý: {ingredient.suggestedDosage}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
