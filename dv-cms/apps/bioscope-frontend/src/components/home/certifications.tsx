'use client'

import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'
import type { SectionMedia } from '@/lib/cms/home'
import { RichOrText } from '@/components/ui/rich-text'
import { useTrackScroll } from '@/lib/use-track-scroll'

/** Certification logos from /public/images/certificates (drag + auto-scroll, full colour). */
const CERTS = [
  { src: 'Goed-omega-3.png', alt: 'GOED Omega-3' },
  { src: 'ISO-Certified-01-1.webp', alt: 'ISO Certified' },
  { src: 'Konsultan-ISO-22000.png', alt: 'ISO 22000' },
  { src: 'gmp.png', alt: 'GMP' },
  { src: 'haccp.jpg', alt: 'HACCP' },
  { src: 'halal.webp', alt: 'Halal' },
  { src: 'KOHER-1.jpg', alt: 'Kosher' },
  { src: 'nsf-international-logo.jpg', alt: 'NSF International' },
  { src: 'friend_of_the_sea-02.png', alt: 'Friend of the Sea' },
  { src: 'cropped-v-label-logo-1.webp', alt: 'V-Label Vegan' },
  { src: 'csm_2017-global-compact-logo_93e4bff8ac.webp', alt: 'UN Global Compact' },
  { src: 'global.jpg', alt: 'Global G.A.P' },
  { src: 'E_SDG-goals_icons-individual-rgb-03-300x300.png', alt: 'SDG 3 — Good health' },
  { src: 'E_SDG-goals_icons-individual-rgb-09.png', alt: 'SDG 9 — Industry & innovation' },
  { src: 'E_SDG-goals_icons-individual-rgb-12-300x300.png', alt: 'SDG 12 — Responsible consumption' },
  { src: 'E_SDG-goals_icons-individual-rgb-14-300x300.png', alt: 'SDG 14 — Life below water' },
]

export function Certifications({ media }: { media?: SectionMedia }) {
  const { t } = useLocale()
  const c = t.home.certifications
  const { ref, dragProps, hoverProps } = useTrackScroll(true, 0.4)
  // Prefer CMS-managed logos when the block provides them; else the built-in set.
  const cmsLogos = (media?.items ?? []).filter((it) => it.image)
  const logos = cmsLogos.length
    ? cmsLogos.map((it, i) => ({ src: it.image as string, alt: CERTS[i]?.alt ?? '' }))
    : CERTS.map((cert) => ({ src: `/images/certificates/${cert.src}`, alt: cert.alt }))
  // Duplicate the list so the auto-scroll loops seamlessly.
  const track = [...logos, ...logos]

  return (
    <section className="bg-white py-10">
      <div className="container-bs">
        <Reveal>
          <h2 className="text-[15px] font-extrabold uppercase tracking-[0.1em] text-ink">{c.title}</h2>
          <RichOrText value={media?.descRich} fallback={c.description} className="mt-2 text-[14px] text-ink/55" />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="group/marquee relative mt-6 overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-mist/40 py-7">
            {/* fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-mist/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-mist/90 to-transparent" />

            <div
              ref={ref}
              {...dragProps}
              {...hoverProps}
              className="flex cursor-grab select-none items-center gap-4 overflow-x-auto px-4 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
            >
              {track.map((cert, i) => (
                <div
                  key={`${cert.src}-${i}`}
                  className="flex h-20 w-[150px] shrink-0 items-center justify-center rounded-2xl border border-primary-border/50 bg-white px-5"
                >
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    width={130}
                    height={64}
                    unoptimized
                    draggable={false}
                    className="max-h-14 w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
