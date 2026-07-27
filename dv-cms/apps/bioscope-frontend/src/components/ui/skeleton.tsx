import { cn } from '@/lib/utils'

/**
 * Skeleton — khối xám nhấp nháy giữ chỗ trong lúc route đang tải.
 *
 * Dùng chung một primitive để mọi màn hình loading trông đồng nhất (cùng bo
 * góc, cùng nhịp animate-pulse, cùng tông với nền mist/primary-tint của web).
 * Đặt `aria-hidden` vì đây chỉ là hiệu ứng thị giác — trình đọc màn hình bỏ qua.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-primary-tint', className)}
    />
  )
}

/** Ảnh hero + tiêu đề + mô tả — khớp bố cục <PageHero>. */
export function PageHeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-mist pt-32 lg:pt-40">
      <div className="container-bs relative grid items-center gap-10 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Skeleton className="mb-6 h-4 w-40" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mt-4 h-10 w-1/2" />
          <Skeleton className="mt-6 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2.5 h-4 w-full max-w-md" />
        </div>
        <Skeleton className="hidden aspect-[4/3] w-full rounded-[2rem] lg:block" />
      </div>
    </section>
  )
}

/** Lưới thẻ giữ chỗ — dùng cho các trang danh sách (nguyên liệu, giải pháp...). */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-[1.5rem] border border-primary-border/50 bg-white p-5"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
