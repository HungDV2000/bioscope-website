'use client'

import { useId, useMemo, useState } from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'

/**
 * Ô nhập mật khẩu dùng chung: nút con mắt + thanh đánh giá độ mạnh + ô nhập lại.
 *
 * Gom về một chỗ thay vì chép vào từng form (popup, trang đăng ký, trang tài
 * khoản) — luật độ mạnh chỉ có MỘT bản, sửa một lần là mọi nơi giống nhau.
 */

export type PasswordStrings = {
  show: string
  hide: string
  /** 5 nhãn theo thứ tự yếu → mạnh. */
  levels: [string, string, string, string, string]
  confirmLabel: string
  mismatch: string
  match: string
}

export const passwordStringsVi: PasswordStrings = {
  show: 'Hiện mật khẩu',
  hide: 'Ẩn mật khẩu',
  levels: ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'],
  confirmLabel: 'Nhập lại mật khẩu',
  mismatch: 'Mật khẩu nhập lại chưa khớp.',
  match: 'Mật khẩu khớp.',
}

export const passwordStringsEn: PasswordStrings = {
  show: 'Show password',
  hide: 'Hide password',
  levels: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'],
  confirmLabel: 'Confirm password',
  mismatch: 'Passwords do not match.',
  match: 'Passwords match.',
}

/**
 * Chuỗi hay bị dùng làm mật khẩu. Không có danh sách này thì "Password123!"
 * đủ mọi loại ký tự và bị chấm "Rất mạnh", trong khi nó nằm đầu mọi từ điển
 * dò mật khẩu — chấm điểm cao là nói dối người dùng.
 */
const COMMON = [
  'password', 'matkhau', '123456', '12345678', 'qwerty', 'abc123', 'iloveyou',
  'admin', 'welcome', 'letmein', 'monkey', 'dragon', 'bioscope', 'vietnam',
]

/** Chuỗi tăng/giảm liên tiếp kiểu "abcd", "4321" — dài ≥ 4 thì coi là mẫu yếu. */
function hasSequence(s: string): boolean {
  const low = s.toLowerCase()
  let run = 1
  for (let i = 1; i < low.length; i++) {
    const d = low.charCodeAt(i) - low.charCodeAt(i - 1)
    run = d === 1 || d === -1 ? run + 1 : 1
    if (run >= 4) return true
  }
  return false
}

/** Điểm 0–4. Trả kèm lý do để hiển thị gợi ý cụ thể thay vì chỉ một con số. */
export function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; longEnough: boolean } {
  const longEnough = pw.length >= 8
  if (!pw) return { score: 0, longEnough: false }

  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (pw.length >= 16) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^\w\s]/.test(pw)) s++

  const low = pw.toLowerCase()
  if (COMMON.some((c) => low.includes(c))) s -= 3
  if (hasSequence(pw)) s -= 1
  if (/^(.)\1+$/.test(pw)) s = 0 // toàn một ký tự
  if (!longEnough) s = Math.min(s, 1) // dưới 8 ký tự thì không bao giờ quá "Yếu"

  return { score: Math.max(0, Math.min(4, s)) as 0 | 1 | 2 | 3 | 4, longEnough }
}

const BAR = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-600', 'bg-green-600']
const TEXT = ['text-red-600', 'text-orange-600', 'text-amber-600', 'text-lime-700', 'text-green-700']

function EyeToggle({ shown, onToggle, t }: { shown: boolean; onToggle: () => void; t: PasswordStrings }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      // tabIndex -1: bấm Tab từ ô mật khẩu phải sang ô kế tiếp, không mắc kẹt ở nút này.
      tabIndex={-1}
      aria-label={shown ? t.hide : t.show}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink/40 transition-colors hover:text-ink/70"
    >
      {shown ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
    </button>
  )
}

export function PasswordField({
  t,
  id,
  name = 'password',
  label,
  hint,
  inputClass,
  labelClass,
  autoComplete = 'new-password',
  required = true,
  minLength,
  /** Hiện thanh độ mạnh (dùng khi ĐẶT mật khẩu, không dùng khi đăng nhập). */
  strength = false,
  /** Hiện ô nhập lại ngay bên dưới. */
  confirm = false,
  confirmName = 'passwordConfirm',
  confirmLabel,
  value,
  onValueChange,
}: {
  t: PasswordStrings
  id: string
  name?: string
  label: string
  hint?: string
  inputClass: string
  labelClass: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  strength?: boolean
  confirm?: boolean
  confirmName?: string
  /** Ghi đè nhãn ô nhập lại khi form đã có chuỗi dịch riêng. */
  confirmLabel?: string
  value?: string
  onValueChange?: (v: string) => void
}) {
  const [shown, setShown] = useState(false)
  const [shownConfirm, setShownConfirm] = useState(false)
  const [inner, setInner] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const meterId = useId()

  const pw = value ?? inner
  const setPw = (v: string) => {
    if (onValueChange) onValueChange(v)
    else setInner(v)
  }

  const { score } = useMemo(() => scorePassword(pw), [pw])
  const mismatch = confirm && confirmValue.length > 0 && confirmValue !== pw

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={name}
            type={shown ? 'text' : 'password'}
            required={required}
            minLength={minLength}
            autoComplete={autoComplete}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={`${inputClass} pr-11`}
          />
          <EyeToggle shown={shown} onToggle={() => setShown((s) => !s)} t={t} />
        </div>

        {strength && pw.length > 0 && (
          <div className="mt-2" aria-live="polite">
            <div className="flex gap-1" role="presentation">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i < score ? BAR[score] : 'bg-primary-border/50'}`}
                />
              ))}
            </div>
            <p id={meterId} className={`mt-1 text-[11.5px] font-medium ${TEXT[score]}`}>
              {t.levels[score]}
            </p>
          </div>
        )}
        {hint && <p className="mt-1 text-[11.5px] text-ink/40">{hint}</p>}
      </div>

      {confirm && (
        <div>
          <label htmlFor={`${id}-confirm`} className={labelClass}>
            {confirmLabel ?? t.confirmLabel}
          </label>
          <div className="relative">
            <input
              id={`${id}-confirm`}
              name={confirmName}
              type={shownConfirm ? 'text' : 'password'}
              required={required}
              autoComplete="new-password"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              className={`${inputClass} pr-11 ${mismatch ? 'border-red-300' : ''}`}
            />
            <EyeToggle shown={shownConfirm} onToggle={() => setShownConfirm((s) => !s)} t={t} />
          </div>
          {confirmValue.length > 0 && (
            <p
              className={`mt-1 flex items-center gap-1 text-[11.5px] ${mismatch ? 'text-red-600' : 'text-green-700'}`}
              aria-live="polite"
            >
              {mismatch ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              {mismatch ? t.mismatch : t.match}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
