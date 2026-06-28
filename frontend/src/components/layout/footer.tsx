import Link from "next/link";
import { Linkedin, Youtube, Facebook, Mail } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { Logo } from "./logo";

const COLS = [
  { title: "Nguyên liệu", href: "/nguyen-lieu", links: ["Danh mục nguyên liệu", "Nguyên liệu mới", "Thư viện nguyên liệu", "Chứng nhận"] },
  { title: "Giải pháp", href: "/dich-vu-odm", links: ["Giải pháp theo lợi ích", "Giải pháp theo công thức", "Giải pháp theo ứng dụng", "Giải pháp tùy chỉnh"] },
  { title: "Đồng kiến tạo", href: "/dich-vu-odm", links: ["Quy trình đồng kiến tạo", "Câu chuyện thành công", "Tham gia chương trình", "Gửi yêu cầu"] },
  { title: "Nghiên cứu & Phát triển", href: "/cong-nghe", links: ["Công nghệ", "Công bố nghiên cứu", "Bằng sáng chế", "Hồ sơ năng lực"] },
  { title: "Tài nguyên", href: "/blog", links: ["Kiến thức chuyên môn", "Sách trắng", "Hội thảo trực tuyến", "Các buổi thảo luận"] },
  { title: "Về chúng tôi", href: "/gioi-thieu", links: ["Giới thiệu", "Đội ngũ", "Sự nghiệp", "Liên hệ"] },
] as const;

export function Footer({ locale }: { locale: Locale }) {
  const p = (path: string) => `/${locale}${path}`;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="container-bs grid gap-9 py-14 lg:grid-cols-[1.4fr_repeat(6,1fr)]">
        <div>
          <Link href={p("")}>
            <Logo className="h-10" />
          </Link>
          <p className="mt-3.5 max-w-[230px] text-[13px] leading-relaxed text-neutral-500">
            Đối tác đổi mới sáng tạo trong chăm sóc sức khỏe.
          </p>
          <div className="mt-4 flex gap-2.5">
            {[
              { Icon: Linkedin, label: "LinkedIn" },
              { Icon: Youtube, label: "YouTube" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: Mail, label: "Email" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-[14px] font-bold text-primary-dark">{col.title}</h4>
            <ul className="mt-3.5 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href={p(col.href)} className="text-[13px] text-neutral-600 transition-colors hover:text-primary">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-100">
        <div className="container-bs flex flex-col gap-3 py-5 text-[13px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Bioscope. Tất cả quyền được bảo lưu.</p>
          <div className="flex flex-wrap gap-5">
            <Link href={p("/chinh-sach-bao-mat")} className="hover:text-primary">Chính sách bảo mật</Link>
            <Link href={p("/cau-hoi-thuong-gap")} className="hover:text-primary">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
