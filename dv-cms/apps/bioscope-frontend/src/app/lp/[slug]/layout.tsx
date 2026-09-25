import { Be_Vietnam_Pro, Fraunces } from 'next/font/google'

/**
 * Font riêng của landing, tự host qua next/font (CSP chỉ cho font 'self').
 * Biến CSS `--font-gh-sans` / `--font-gh-fraunces` được landing-theme.css dùng.
 */
const sans = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-gh-sans',
  display: 'swap',
})
const serif = Fraunces({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-gh-fraunces',
  display: 'swap',
})

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${sans.variable} ${serif.variable}`}>{children}</div>
}
