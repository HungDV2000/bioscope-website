import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const plusJakartaBody = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bioscope.vn"),
  title: {
    default: "Bioscope Vietnam — Nguyên liệu & Giải pháp công thức ngành Dược",
    template: "%s | Bioscope Vietnam",
  },
  description:
    "Công ty Cổ phần Bioscope Việt Nam — đối tác tin cậy về nguyên liệu cao cấp, công nghệ nano độc quyền và dịch vụ ODM cho ngành Dược phẩm, Thực phẩm chức năng và Mỹ phẩm.",
  keywords: [
    "Bioscope",
    "nguyên liệu dược",
    "thực phẩm chức năng",
    "mỹ phẩm",
    "ODM",
    "công nghệ nano",
  ],
  openGraph: {
    type: "website",
    siteName: "Bioscope Vietnam",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${plusJakartaBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
