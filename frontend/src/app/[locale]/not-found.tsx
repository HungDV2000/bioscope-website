import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-bs flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-heading text-7xl font-extrabold text-primary/20 sm:text-9xl">
        404
      </span>
      <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
        Không tìm thấy trang / Page not found
      </h1>
      <p className="mt-3 max-w-md text-neutral-500">
        Trang bạn tìm có thể đã được di chuyển hoặc không tồn tại. <br />
        The page you are looking for may have moved or no longer exists.
      </p>
      <Link
        href="/vi"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        <Home className="h-4 w-4" />
        Về trang chủ / Back to home
      </Link>
    </section>
  );
}
