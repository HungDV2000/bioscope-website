import { getLocale } from '@/lib/i18n/server'
import { LocaleProvider } from '@/lib/i18n/context'
import { getMessages } from '@/lib/i18n/messages'

export default async function MemberRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = getMessages(locale)

  return (
    <LocaleProvider locale={locale} messages={messages}>
      {children}
    </LocaleProvider>
  )
}
