import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

type ResourceItem = {
  slug?: string
  title: string
  category: string
  desc: string
  gated: boolean
  href?: string
}

export function ResourceItemCard({ item, delay = 0 }: { item: ResourceItem; delay?: number }) {
  const inner = (
    <article className="flex h-full flex-col rounded-[1.5rem] border border-primary-border/60 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-primary">{item.category}</span>
        {item.gated ? (
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold text-accent">
            Cần đăng ký
          </span>
        ) : (
          <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-[10px] font-bold text-primary-dark">
            Public
          </span>
        )}
      </div>
      <h3 className="mt-3 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink/60">{item.desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary/70">
        Sắp ra mắt
        {item.href && <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />}
      </span>
    </article>
  )

  return (
    <Reveal delay={delay}>
      {item.href ? (
        <Link href={item.href} className="block h-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </Reveal>
  )
}
