"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/b2b/auth-shell";

export default function LoginPage() {
  const params = useParams();
  const locale = (params.locale as Locale) ?? "vi";
  const t = getDictionary(locale);
  const [loading, setLoading] = useState(false);

  const field =
    "h-12 w-full rounded-md border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: POST {NEXT_PUBLIC_CMS_URL}/api/b2b/login → set cookie
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    alert(
      locale === "vi"
        ? "Demo: chức năng đăng nhập sẽ kết nối Payload CMS ở giai đoạn backend."
        : "Demo: login will connect to Payload CMS during the backend phase."
    );
  };

  return (
    <AuthShell locale={locale}>
      <h1 className="font-heading text-2xl font-bold">
        {locale === "vi" ? "Đăng nhập tài khoản B2B" : "Sign in to your B2B account"}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {locale === "vi"
          ? "Truy cập tài liệu kỹ thuật và báo giá dành riêng cho đối tác."
          : "Access technical documents and partner-only quotes."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input required type="email" placeholder="Email" className={field} />
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            required
            type="password"
            placeholder={locale === "vi" ? "Mật khẩu" : "Password"}
            className={field}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-neutral-600">
            <input type="checkbox" className="rounded border-neutral-300" />
            {locale === "vi" ? "Ghi nhớ" : "Remember me"}
          </label>
          <Link href="#" className="font-medium text-primary hover:underline">
            {locale === "vi" ? "Quên mật khẩu?" : "Forgot password?"}
          </Link>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "..." : t.cta.login}
          <LogIn className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        {locale === "vi" ? "Chưa có tài khoản?" : "Don't have an account?"}{" "}
        <Link
          href={`/${locale}/b2b/register`}
          className="font-semibold text-primary hover:underline"
        >
          {t.cta.register}
        </Link>
      </p>
    </AuthShell>
  );
}
