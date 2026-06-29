import { getFrontendFontStylesheetUrl, getFrontendThemeCss } from '@/lib/branding'

/** Injects CMS-managed frontend design tokens + Google Font from branding. */
export async function CmsThemeStyle() {
  const [css, fontUrl] = await Promise.all([getFrontendThemeCss(), getFrontendFontStylesheetUrl()])

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontUrl} />
      <style id="cms-theme-vars" dangerouslySetInnerHTML={{ __html: css }} />
    </>
  )
}
