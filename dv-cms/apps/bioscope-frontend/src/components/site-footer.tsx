import Image from 'next/image'
import Link from 'next/link'
import { Globe, MessageCircle, Share2, Send } from 'lucide-react'

const COLS = [
  {
    title: 'Nguyên liệu',
    links: [
      { label: 'Thực phẩm chức năng', href: '/nguyen-lieu' },
      { label: 'Mỹ phẩm', href: '/nguyen-lieu' },
      { label: 'Dược phẩm', href: '/nguyen-lieu' },
      { label: 'Chiết xuất thực vật', href: '/nguyen-lieu' },
    ],
  },
  {
    title: 'Giải pháp',
    links: [
      { label: 'Cung cấp nguyên liệu', href: '/giai-phap/cung-cap-nguyen-lieu' },
      { label: 'Phát triển công thức ODM', href: '/giai-phap/phat-trien-cong-thuc-odm' },
      { label: 'Đồng kiến tạo', href: '/giai-phap/dong-kien-tao-toan-hanh-trinh' },
    ],
  },
  {
    title: 'Công ty',
    links: [
      { label: 'Về chúng tôi', href: '/ve-chung-toi' },
      { label: 'Nghiên cứu & Phát triển', href: '/rd' },
      { label: 'Case study', href: '/case-study' },
      { label: 'Tài nguyên', href: '/tai-nguyen' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Liên hệ', href: '/lien-he' },
      { label: 'Yêu cầu mẫu thử', href: '/lien-he' },
      { label: 'Câu hỏi thường gặp', href: '/cau-hoi-thuong-gap' },
      { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
    ],
  },
]

const SOCIAL = [Globe, MessageCircle, Share2, Send]

export function SiteFooter() {
  return (
    <footer className="border-t border-primary-border/50 bg-mist">
      <div className="container-bs grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Image src="/logo.avif" alt="Bioscope" width={150} height={42} className="h-10 w-auto" />
          <p className="mt-5 text-[14px] leading-relaxed text-ink/60">
            Đối tác được lựa chọn của Việt Nam cho nguyên liệu cao cấp và đổi mới
            đột phá ngành Dược phẩm, Thực phẩm chức năng và Mỹ phẩm.
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIAL.map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-primary-border bg-white text-ink/50 transition-colors duration-300 hover:text-primary"
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[14px] text-ink/65 transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-border/50">
        <div className="container-bs flex flex-col items-center justify-between gap-2 py-5 text-[12.5px] text-ink/45 sm:flex-row">
          <span>© 2026 Bioscope. Bảo lưu mọi quyền.</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/chinh-sach-bao-mat" className="transition-colors hover:text-primary">
              Chính sách bảo mật
            </Link>
            <span aria-hidden>·</span>
            <Link href="/dieu-khoan-su-dung" className="transition-colors hover:text-primary">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
