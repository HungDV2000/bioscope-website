import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { Button } from '@/components/ui/button'
import { ResourceItemCard } from '@/components/resources/item-card'
import {
  RESOURCE_CATEGORIES,
  CASE_STUDIES,
  getResourceCategory,
  getResourceItemsForCategory,
} from '@/lib/content'

export function generateStaticParams() {
  return RESOURCE_CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cat = getResourceCategory(slug)
  if (!cat) return {}
  return { title: `${cat.title} — Tài nguyên`, description: cat.shortDesc }
}

export default async function ResourceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cat = getResourceCategory(slug)
  if (!cat) notFound()

  const items = cat.useCaseStudies
    ? CASE_STUDIES.map((c) => ({
        slug: c.slug,
        title: c.brand,
        category: 'Case Study',
        desc: c.summary ?? c.problem,
        gated: false,
        href: `/case-study/${c.slug}`,
      }))
    : getResourceItemsForCategory(slug).map((i) => ({ ...i, href: undefined }))

  return (
    <>
      <PageHero
        eyebrow="Tài nguyên"
        title={cat.title}
        description={cat.shortDesc}
        crumbs={[
          { label: 'Tài nguyên', href: '/tai-nguyen' },
          { label: cat.title },
        ]}
        image={cat.image}
      />

      <section className="bg-white pb-16 pt-16">
        <div className="container-bs">
          <Reveal>
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink/70">{cat.description}</p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.length > 0 ? (
              items.map((item, i) => <ResourceItemCard key={item.title} item={item} delay={i * 0.05} />)
            ) : (
              <Reveal>
                <div className="col-span-full rounded-[1.5rem] border border-dashed border-primary-border/60 bg-mist/30 px-8 py-12 text-center">
                  <p className="text-[15px] font-semibold text-ink">Nội dung đang được cập nhật</p>
                  <p className="mt-2 text-[14px] text-ink/55">
                    Đăng ký nhận tin để không bỏ lỡ khi có tài liệu mới trong danh mục này.
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/tai-nguyen"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Quay lại Tài nguyên
            </Link>
            {cat.useCaseStudies && (
              <Button href="/case-study" variant="outline">
                Xem tất cả Case Study
              </Button>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
