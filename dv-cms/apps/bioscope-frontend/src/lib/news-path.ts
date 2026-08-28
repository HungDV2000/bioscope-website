import type { Locale } from '@/lib/i18n/config'

/**
 * Địa chỉ trang Bản tin theo ngôn ngữ.
 *
 * Một chỗ duy nhất quyết định đường dẫn, để không phải nhớ sửa rải rác khi đổi
 * slug. Trang cũ /tai-nguyen/blog-chuyen-mon vẫn chuyển hướng về đây.
 */
export const newsBase = (locale: Locale): '/ban-tin' | '/news' =>
  locale === 'en' ? '/news' : '/ban-tin'

export const newsPostPath = (locale: Locale, slug: string) => `${newsBase(locale)}/${slug}`
