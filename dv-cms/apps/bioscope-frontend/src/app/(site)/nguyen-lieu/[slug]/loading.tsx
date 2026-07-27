import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading trang chi tiết nguyên liệu — bố cục 2 cột: nội dung + ảnh/thông số.
 */
export default function IngredientDetailLoading() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white pt-24 lg:pt-28">
      <div className="container-bs relative pb-16">
        <Skeleton className="h-4 w-56" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Cột nội dung */}
          <div>
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="mt-4 h-5 w-full max-w-xl" />
            <div className="mt-8 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {['w-20', 'w-24', 'w-16', 'w-28'].map((w, i) => (
                <Skeleton key={i} className={`h-8 rounded-full ${w}`} />
              ))}
            </div>
          </div>
          {/* Cột ảnh + thông số */}
          <div>
            <Skeleton className="aspect-square w-full rounded-[2rem]" />
            <div className="mt-5 space-y-3 rounded-[1.5rem] border border-primary-border/50 p-5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
