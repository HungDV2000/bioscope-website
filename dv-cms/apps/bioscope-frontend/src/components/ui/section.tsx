import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-tint px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-dark',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function LeafDivider() {
  return (
    <div className="mt-5 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-16 bg-primary-border" />
      <Leaf className="h-4 w-4 -rotate-45 text-primary" strokeWidth={1.6} />
      <span className="h-px w-16 bg-primary-border" />
    </div>
  )
}
