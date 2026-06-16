import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

// Serif display thanh lịch cho Voerbon (md gọi "Madefor + serif pairing")
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-voerbon",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voērbon — Mindful Wellness (Demo)",
  description:
    "Trang chủ demo phong cách Voerbon — wellness tông đất ấm (terracotta · amber · burgundy).",
  robots: { index: false },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={playfair.variable}>{children}</div>;
}
