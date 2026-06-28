import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

type Props = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'accent' | 'outline' | 'ghost'
  icon?: boolean
  className?: string
}

/** Island button with nested button-in-button trailing icon. */
export function Button({
  href,
  children,
  variant = 'primary',
  icon = true,
  className,
}: Props) {
  const base =
    `group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 text-[15px] font-semibold transition-all duration-500 active:scale-[0.98] ${EASE}`
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft',
    accent: 'bg-accent text-white hover:brightness-95 shadow-soft',
    outline:
      'border border-primary-border bg-white text-ink hover:border-primary/40',
    ghost: 'bg-primary-tint text-primary-dark hover:bg-primary-border/60',
  }
  const iconWrap = {
    primary: 'bg-white/15',
    accent: 'bg-white/20',
    outline: 'bg-primary-tint text-primary',
    ghost: 'bg-white text-primary',
  }

  return (
    <Link href={href} className={cn(base, variants[variant], !icon && 'pr-6', className)}>
      <span>{children}</span>
      {icon && (
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500',
            'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105',
            EASE,
            iconWrap[variant],
          )}
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </span>
      )}
    </Link>
  )
}
