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

type TabId = 'overview' | 'technical' | 'regulatory' | 'research' | 'docs' | 'applications'

/** Regulatory status value (CMS select) → localized label. */
const STATUS_LABEL: Record<string, { vi: string; en: string }> = {
  fda_gras: { vi: 'FDA GRAS', en: 'FDA GRAS' },
  efsa: { vi: 'EFSA (EU)', en: 'EFSA (EU)' },
  vn_moh: { vi: 'Bộ Y tế VN cho phép', en: 'Vietnam MoH permitted' },
  novel_food: { vi: 'Novel Food', en: 'Novel Food' },
}

export function DetailTabs({ ingredient }: { ingredient: Ingredient }) {
  const { locale } = useLocale()
  const en = locale === 'en'

  // Technical group → spec rows, appended after the free-form `specs` table.
  const tech = ingredient.technical
  const techRows: { label: string; value: string }[] = tech
    ? (
        [
          ['CAS', tech.casNumber],
          [en ? 'HS code' : 'Mã HS', tech.hsCode],
          [en ? 'E-number' : 'Mã E', tech.eNumber],
          [en ? 'Assay / purity' : 'Hàm lượng / độ tinh khiết', tech.assay],
          [en ? 'Standardized to' : 'Chuẩn hoá theo', tech.standardization],
          [en ? 'Appearance' : 'Dạng & ngoại quan', tech.appearance],
          [en ? 'Solubility' : 'Độ tan', tech.solubility],
          [en ? 'Particle size' : 'Kích thước hạt', tech.particleSize],
          [en ? 'Shelf life' : 'Hạn dùng', tech.shelfLife],
          [en ? 'Storage' : 'Điều kiện bảo quản', tech.storage],
          [en ? 'Packaging' : 'Quy cách đóng gói', tech.packaging],
          [en ? 'Lead time' : 'Thời gian giao hàng', tech.leadTime],
        ] as const
      )
        .filter(([, v]) => Boolean(v))
        .map(([label, value]) => ({ label, value: value as string }))
    : []

  const allSpecs = [...ingredient.specs, ...techRows]

  const reg = ingredient.regulatory
  const hasRegulatory = Boolean(
    reg && ((reg.status?.length ?? 0) > 0 || reg.registrationNo || reg.usageLimit || (reg.documents?.length ?? 0) > 0),
  )
  const res = ingredient.research
  const hasResearch = Boolean(res && (res.mechanism || (res.studies?.length ?? 0) > 0))

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: en ? 'Overview' : 'Tổng quan' },
    { id: 'technical', label: en ? 'Technical' : 'Kỹ thuật' },
    // Only surface these when the CMS actually has content for them.
    ...(hasRegulatory ? [{ id: 'regulatory' as TabId, label: en ? 'Regulatory' : 'Pháp lý' }] : []),
    ...(hasResearch ? [{ id: 'research' as TabId, label: en ? 'Research' : 'Nghiên cứu' }] : []),
    { id: 'docs', label: en ? 'Documents' : 'Tài liệu' },
    { id: 'applications', label: en ? 'Applications' : 'Ứng dụng' },
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
          (allSpecs.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-primary-border/60">
              {allSpecs.map((s, i) => (
                <div
                  key={`${s.label}-${i}`}
                  className={cn('grid grid-cols-[1fr_1.4fr] gap-4 px-5 py-3.5 text-[14px]', i % 2 === 0 ? 'bg-mist/40' : 'bg-white')}
                >
                  <span className="font-medium text-ink/55">{s.label}</span>
                  <span className="font-semibold text-ink">{s.value}</span>
                </div>
              ))}
              {tech?.incompatibility && (
                <p className="border-t border-primary-border/60 bg-accent-soft/60 px-5 py-3.5 text-[13.5px] leading-relaxed text-ink/70">
                  <strong className="text-ink/85">{en ? 'Handling notes: ' : 'Lưu ý phối trộn: '}</strong>
                  {tech.incompatibility}
                </p>
              )}
            </div>
          ) : (
            <EmptyState text={copy.emptyTech} cta={copy.contact} />
          ))}

        {tab === 'regulatory' && reg && (
          <div className="space-y-5">
            {(reg.status?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {reg.status!.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary-border bg-primary-tint px-3.5 py-1.5 text-[13px] font-semibold text-primary-dark"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                    {STATUS_LABEL[s]?.[en ? 'en' : 'vi'] ?? s}
                  </span>
                ))}
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border border-primary-border/60">
              {reg.registrationNo && (
                <div className="grid grid-cols-[1fr_1.4fr] gap-4 bg-mist/40 px-5 py-3.5 text-[14px]">
                  <span className="font-medium text-ink/55">{en ? 'Registration no.' : 'Số công bố'}</span>
                  <span className="font-semibold text-ink">{reg.registrationNo}</span>
                </div>
              )}
              {reg.usageLimit && (
                <div className="grid grid-cols-[1fr_1.4fr] gap-4 bg-white px-5 py-3.5 text-[14px]">
                  <span className="font-medium text-ink/55">{en ? 'Permitted usage level' : 'Ngưỡng sử dụng'}</span>
                  <span className="font-semibold text-ink">{reg.usageLimit}</span>
                </div>
              )}
            </div>
            {(reg.documents?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">
                  {en ? 'Certificates' : 'Chứng nhận'}
                </h4>
                <ul className="space-y-2">
                  {reg.documents!.map((doc) => (
                    <li key={doc.url}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-primary-border/60 bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                      >
                        <FileQuestion className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                        {doc.title || (en ? 'Document' : 'Tài liệu')}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'research' && res && (
          <div className="space-y-6">
            {res.mechanism && (
              <div className="space-y-2">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">
                  {en ? 'Mechanism of action' : 'Cơ chế tác dụng'}
                </h4>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/75">{res.mechanism}</p>
              </div>
            )}
            {(res.studies?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">
                  {en ? 'Clinical studies' : 'Nghiên cứu lâm sàng'}
                </h4>
                <ul className="space-y-3">
                  {res.studies!.map((s, i) => (
                    <li key={`${s.title}-${i}`} className="rounded-2xl border border-primary-border/60 bg-white p-5">
                      <p className="text-[14.5px] font-semibold text-ink">{s.title}</p>
                      {s.summary && <p className="mt-1.5 text-[14px] leading-relaxed text-ink/65">{s.summary}</p>}
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-[13px] font-semibold text-primary underline underline-offset-2"
                        >
                          {en ? 'View study' : 'Xem nghiên cứu'}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
