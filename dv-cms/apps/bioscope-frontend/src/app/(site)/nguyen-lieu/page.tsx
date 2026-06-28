import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { Catalog } from '@/components/ingredients/catalog'
import { Reveal } from '@/components/ui/reveal'
import { INGREDIENTS, INGREDIENT_PAGE_INTRO } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Danh mục nguyên liệu chuyên biệt',
  description:
    'Hơn 100 nguyên liệu hiệu suất cao cho Dược phẩm, Thực phẩm chức năng và Mỹ phẩm — đầy đủ tài liệu kỹ thuật, sẵn mẫu thử.',
}

export default function IngredientsPage() {
  return (
    <>
      <PageHero
        eyebrow="Nguyên liệu"
        title="Danh mục nguyên liệu chuyên biệt"
        description="Hơn 100 nguyên liệu hiệu suất cao cho Dược phẩm, Thực phẩm chức năng và Mỹ phẩm — đầy đủ tài liệu kỹ thuật, sẵn mẫu thử."
        crumbs={[{ label: 'Nguyên liệu' }]}
        image="powder"
      />
      <section className="border-b border-primary-border/40 bg-mist/30 py-10">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.5rem] font-bold text-ink sm:text-[1.75rem]">{INGREDIENT_PAGE_INTRO.title}</h2>
            <p className="mt-4 max-w-3xl text-[14.5px] leading-relaxed text-ink/65">
              {INGREDIENT_PAGE_INTRO.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {INGREDIENT_PAGE_INTRO.quickFilters.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-primary-border bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-ink/60"
                >
                  {f}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <Catalog items={INGREDIENTS} />
    </>
  )
}
