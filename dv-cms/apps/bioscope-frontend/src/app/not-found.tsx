import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-6 text-center">
      <div>
        <div className="text-[80px] font-extrabold tracking-tight text-primary">404</div>
        <p className="mt-2 text-[18px] font-semibold text-ink">Không tìm thấy trang</p>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] text-ink/60">
          Trang bạn tìm có thể đã được di chuyển hoặc không tồn tại.
        </p>
        <div className="mt-7 flex justify-center">
          <Button href="/">Về trang chủ</Button>
        </div>
      </div>
    </main>
  )
}
