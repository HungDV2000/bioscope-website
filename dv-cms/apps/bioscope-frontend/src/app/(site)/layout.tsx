import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LocaleProvider } from '@/lib/i18n/context'
import { getMessages } from '@/lib/i18n/messages'
import { getLocale } from '@/lib/i18n/server'

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = getMessages(locale)

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </LocaleProvider>
  )
}
