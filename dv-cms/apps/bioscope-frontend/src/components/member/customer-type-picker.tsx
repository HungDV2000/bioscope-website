'use client'

import { Building2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerType } from '@/lib/member/types'

export type CustomerTypeStrings = {
  legend: string
  business: string
  businessHint: string
  individual: string
  individualHint: string
}

/**
 * Chọn loại khách hàng. Quyết định form hiện những trường nào: khách doanh
 * nghiệp cần tên công ty (bắt buộc), mã số thuế, chức vụ; khách cá nhân chỉ cần
 * họ tên và liên hệ.
 */
export function CustomerTypePicker({
  t,
  value,
  onChange,
  compact = false,
}: {
  t: CustomerTypeStrings
  value: CustomerType
  onChange: (v: CustomerType) => void
  /** Bản gọn cho popup chật chỗ: bỏ dòng mô tả phụ. */
  compact?: boolean
}) {
  const opts: { key: CustomerType; label: string; hint: string; Icon: typeof Building2 }[] = [
    { key: 'business', label: t.business, hint: t.businessHint, Icon: Building2 },
    { key: 'individual', label: t.individual, hint: t.individualHint, Icon: User },
  ]

  return (
    <fieldset>
      <legend className="text-[12.5px] font-semibold text-ink/55">{t.legend}</legend>
      <div className={cn('mt-1.5 grid gap-2', compact ? 'grid-cols-2' : 'sm:grid-cols-2')}>
        {opts.map(({ key, label, hint, Icon }) => {
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors',
                active
                  ? 'border-primary bg-primary-tint/60 text-primary-dark'
                  : 'border-primary-border bg-white text-ink/70 hover:bg-mist/50',
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', active ? 'text-primary' : 'text-ink/40')} />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold">{label}</span>
                {!compact && <span className="mt-0.5 block text-[11.5px] leading-snug opacity-70">{hint}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
