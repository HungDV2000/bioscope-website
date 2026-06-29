import Image from 'next/image'
import { Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { ABOUT_PRODUCT_PROCESS } from '@/lib/content'

const STEP_ICONS = [Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp] as const

export function AboutProductProcess() {
  const { title, description, image, imageAlt, steps } = ABOUT_PRODUCT_PROCESS

  return (
    <section className="bg-mist py-16 lg:py-20">
      <div className="container-bs">
        <Reveal className="text-center">
          <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/65">{description}</p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <div className="overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white shadow-card">
            <Image
              src={image}
              alt={imageAlt}
              width={1920}
              height={1080}
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="h-auto w-full"
              unoptimized
            />
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i]
            return (
              <Reveal key={step.n} delay={0.1 + i * 0.06}>
                <div className="h-full rounded-[1.5rem] border border-primary-border/60 bg-white p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <span className="text-[12px] font-bold text-primary/50">{step.n}</span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold leading-snug text-ink">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/60">{step.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
