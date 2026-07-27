import { PageHeroSkeleton, Skeleton } from '@/components/ui/skeleton'

/**
 * Loading mặc định cho MỌI trang trong nhóm (site).
 *
 * Next.js tự bọc route bằng <Suspense> và hiện file này trong lúc server
 * component đang lấy dữ liệu (CMS). Route con nào cần dáng riêng thì đặt
 * loading.tsx của nó — như nguyên-liệu (lưới lọc) — còn lại dùng chung khung
 * hero + đoạn nội dung này.
 */
export default function SiteLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <section className="container-bs py-14">
        <Skeleton className="h-7 w-64" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </section>
    </>
  )
}
