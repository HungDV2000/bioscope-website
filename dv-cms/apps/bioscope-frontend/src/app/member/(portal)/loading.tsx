import { Skeleton } from '@/components/ui/skeleton'

/** Loading khu cổng thành viên (kiểm tra phiên + lấy dữ liệu tài liệu). */
export default function MemberPortalLoading() {
  return (
    <div className="container-bs py-16">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-4 h-4 w-80" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-primary-border/50 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
