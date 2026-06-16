"use client";

import Link from "next/link";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/b2b/auth-shell";

export default function RegisterPage() {
  const params = useParams();
  const locale = (params.locale as Locale) ?? "vi";
  const t = getDictionary(locale);
  const [loading, setLoading] = useState(false);

  const field =
    "h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-primary focus:bg-white";

  const labels =
    locale === "vi"
      ? {
          company: "Tên công ty",
          name: "Người liên hệ",
          email: "Email công việc",
          phone: "Số điện thoại",
          password: "Mật khẩu",
          note: "Tài khoản B2B cần được Bioscope phê duyệt trước khi kích hoạt.",
        }
      : {
          company: "Company name",
          name: "Contact person",
          email: "Work email",
          phone: "Phone number",
          password: "Password",
          note: "B2B accounts require Bioscope approval before activation.",
        };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: POST {NEXT_PUBLIC_CMS_URL}/api/b2b/register → status=pending
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    alert(
      locale === "vi"
        ? "Demo: đăng ký sẽ kết nối Payload CMS (trạng thái chờ duyệt) ở giai đoạn backend."
        : "Demo: registration will connect to Payload CMS (pending approval) during the backend phase."
    );
  };

  return (
    <AuthShell locale={locale}>
      <div className="mb-2 inline-flex rounded-full bg-primary-tint px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
        B2B
      </div>
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-[1.65rem]">
        {locale === "vi" ? "Đăng ký đối tác" : "Partner registration"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{labels.note}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input required placeholder={labels.company} className={field} />
        <div className="grid gap-4 sm:grid-cols-2">
          <input required placeholder={labels.name} className={field} />
          <input placeholder={labels.phone} className={field} />
        </div>
        <input required type="email" placeholder={labels.email} className={field} />
        <input
          required
          type="password"
          placeholder={labels.password}
          className={field}
        />
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "..." : t.cta.register}
          <UserPlus className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        {locale === "vi" ? "Đã có tài khoản?" : "Already have an account?"}{" "}
        <Link
          href={`/${locale}/b2b/login`}
          className="font-semibold text-primary hover:underline"
        >
          {t.cta.login}
        </Link>
      </p>
    </AuthShell>
  );
}
