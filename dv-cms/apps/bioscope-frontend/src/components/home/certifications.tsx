import { Award, Globe2 } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const CERT_ICON = Award

const CERTS = [
  { name: 'GMP', sub: 'Nhà máy đạt chuẩn' },
  { name: 'ISO 22000', sub: 'Quản lý an toàn thực phẩm' },
  { name: 'HACCP', sub: 'Hệ thống quản lý ATTP' },
  { name: 'Halal', sub: 'Đạt chứng nhận' },
  { name: 'Kosher', sub: 'Đạt chứng nhận' },
  { name: '50+', sub: 'Quốc gia phân phối', icon: Globe2 },
]

export function Certifications() {
  return (
    <section className="bg-white py-10">
      <div className="container-bs">
        <Reveal>
          <h2 className="text-[15px] font-extrabold uppercase tracking-[0.1em] text-ink">
            Chất lượng bạn có thể tin tưởng
          </h2>
          <p className="mt-2 text-[14px] text-ink/55">Đạt chuẩn toàn cầu cao nhất — GMP, ISO 22000, HACCP, Halal, Kosher.</p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-5 grid grid-cols-2 gap-y-6 rounded-[1.75rem] border border-primary-border/60 bg-mist/40 px-6 py-7 sm:grid-cols-3 lg:grid-cols-6">
            {CERTS.map(({ name, sub, icon: ItemIcon }) => {
              const Icon = ItemIcon ?? CERT_ICON
              return (
              <div key={name} className="flex items-center gap-3 px-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary-border bg-white text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div>
                  <div className="text-[15px] font-extrabold leading-none text-ink">{name}</div>
                  <div className="mt-1 text-[11.5px] font-medium leading-tight text-ink/50">{sub}</div>
                </div>
              </div>
            )})}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
