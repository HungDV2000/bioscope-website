import { Reveal } from '@/components/ui/reveal'

type FaqItem = { q: string; a: string }
type FaqGroup = { title: string; items: FaqItem[] }

export function FaqList({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="w-full space-y-10">
      {groups.map((group, gi) => (
        <Reveal key={group.title} delay={gi * 0.05}>
          <div>
            <h2 className="text-[17px] font-bold text-ink">{group.title}</h2>
            <div className="mt-5 divide-y divide-primary-border/50 rounded-[1.5rem] border border-primary-border/60 bg-white">
              {group.items.map((item) => (
                <details key={item.q} className="group px-6 py-5">
                  <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {item.q}
                      <span className="mt-0.5 shrink-0 text-[18px] font-light text-primary transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink/65">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

export function FaqListSimple({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-primary-border/50 rounded-[1.5rem] border border-primary-border/60 bg-white">
      {items.map((item) => (
        <details key={item.q} className="group px-6 py-5">
          <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-4">
              {item.q}
              <span className="mt-0.5 shrink-0 text-[18px] font-light text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 text-[14px] leading-relaxed text-ink/65">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
