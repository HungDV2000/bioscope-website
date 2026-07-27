import { PageHeroSkeleton, CardGridSkeleton, Skeleton } from '@/components/ui/skeleton'

/**
 * Loading riêng cho trang Nguyên liệu — trang nặng nhất (hàng nghìn mục + facet).
 * Giữ chỗ đúng bố cục: hero, đoạn giới thiệu, khối lọc, rồi lưới thẻ.
 */
export default function IngredientsLoading() {
  return (
    <>
      <PageHeroSkeleton />

      {/* Đoạn giới thiệu */}
      <section className="border-b border-primary-border/40 bg-mist/30 py-10">
        <div className="container-bs">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="mt-4 h-4 w-full max-w-3xl" />
          <Skeleton className="mt-2.5 h-4 w-full max-w-2xl" />
        </div>
      </section>

      {/* Khối lọc + lưới thẻ */}
      <section className="container-bs py-12">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-primary-border/60 bg-mist/50 p-6">
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['w-16', 'w-24', 'w-20', 'w-28', 'w-16', 'w-24', 'w-28', 'w-20'].map((w, i) => (
              <Skeleton key={i} className={`h-8 rounded-full ${w}`} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2.5">
          <Skeleton className="h-7 w-40 rounded-full" />
        </div>

        <CardGridSkeleton count={9} />
      </section>
    </>
  )
}
