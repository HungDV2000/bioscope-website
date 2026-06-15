"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-bs flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-heading text-6xl font-extrabold text-primary/20">
        !
      </span>
      <h1 className="mt-4 font-heading text-2xl font-bold">
        Đã xảy ra lỗi / Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-neutral-500">
        Vui lòng thử tải lại trang.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
        <Link
          href="/vi"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <Home className="h-4 w-4" />
          Về trang chủ
        </Link>
      </div>
    </section>
  );
}
