import { Reveal } from '@/components/ui/reveal'
import type { LegalSection } from '@/lib/content'

export function LegalContent({
  intro,
  sections,
  updated,
}: {
  intro: string
  sections: LegalSection[]
  updated: string
}) {
  return (
    <div className="w-full">
      <Reveal>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink/45">{updated}</p>
        <p className="mt-4 text-[16px] leading-relaxed text-ink/70">{intro}</p>
      </Reveal>
      <div className="mt-10 space-y-8">
        {sections.map((section, i) => (
          <Reveal key={section.title} delay={i * 0.04}>
            <section className="border-b border-primary-border/40 pb-8 last:border-0 last:pb-0">
              <h2 className="text-[17px] font-bold text-ink">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((p) => (
                  <p key={p} className="text-[15px] leading-relaxed text-ink/65">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
