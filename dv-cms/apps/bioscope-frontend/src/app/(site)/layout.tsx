import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getFooterContent } from '@/lib/cms/footer'
import { LocaleProvider } from '@/lib/i18n/context'
import { getMessages } from '@/lib/i18n/messages'
import { getLocale } from '@/lib/i18n/server'
import { getNavigation } from '@/lib/cms/navigation'
import { RefreshOnSave } from '@/components/live-preview/refresh-on-save'
import { ChatWidget } from '@/components/chat/chat-widget'
import { AuthModal } from '@/components/member/auth-modal'
import { ClickToFocus } from '@/components/live-preview/click-to-focus'
import { CMS_URL } from '@/lib/payload'

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = getMessages(locale)
  // Header menu + footer columns from the CMS (falls back to static i18n).
  // Nội dung chân trang (thông tin công ty, bản tin, mạng xã hội) lấy riêng từ
  // Site Settings — hai lời gọi chạy song song để không cộng dồn độ trễ.
  const [nav, footer] = await Promise.all([getNavigation(locale), getFooterContent(locale)])

  const skipLabel = locale === 'en' ? 'Skip to main content' : 'Bỏ qua tới nội dung chính'

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <RefreshOnSave serverURL={CMS_URL} />
      <ClickToFocus />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-[14px] focus:font-semibold focus:text-white"
      >
        {skipLabel}
      </a>
      <SiteHeader items={nav?.header} />
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <SiteFooter columns={nav?.footerColumns} footer={footer} />
      <ChatWidget />
      <AuthModal />
    </LocaleProvider>
  )
}
