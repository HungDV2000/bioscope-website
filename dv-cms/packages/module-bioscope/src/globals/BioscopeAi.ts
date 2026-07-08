import type { GlobalConfig, Field } from 'payload'
import { anyone, isAdminOrEditor } from '@dv/cms-core'

/** Ping the frontend to revalidate the Bioscope AI page after an edit. */
async function revalidateAi() {
  const base = process.env.FRONTEND_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!base) return
  try {
    await fetch(`${base}/api/revalidate?secret=${encodeURIComponent(secret ?? '')}&path=${encodeURIComponent('/bioscope-ai')}`, {
      method: 'POST',
    })
  } catch {
    /* frontend may be offline in dev */
  }
}

const T = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', localized: true, ...(label ? { label } : {}) })
const A = (name: string, label?: Record<string, string>): Field => ({ name, type: 'textarea', localized: true, ...(label ? { label } : {}) })
const LIST = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', hasMany: true, localized: true, ...(label ? { label } : {}) })
const group = (name: string, label: Record<string, string>, fields: Field[]): Field => ({ name, type: 'group', label, fields })
const arr = (name: string, label: Record<string, string>, fields: Field[]): Field => ({ name, type: 'array', label, fields })

/**
 * Bioscope AI page content. Mirrors the frontend `messages.aiAssistantPage`
 * shape so the page renders from the CMS with static i18n as fallback.
 */
export const BioscopeAi: GlobalConfig = {
  slug: 'bioscope-ai',
  label: { en: 'Bioscope AI page', vi: 'Trang Bioscope AI' },
  admin: {
    group: 'Bioscope',
    description: { en: 'Bioscope AI page content.', vi: 'Nội dung trang Bioscope AI.' },
  },
  access: { read: anyone, update: isAdminOrEditor },
  hooks: { afterChange: [async () => revalidateAi()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Intro', vi: 'Mở đầu' },
          fields: [
            T('status', { en: 'Status badge', vi: 'Nhãn trạng thái' }),
            A('statusDesc', { en: 'Status description', vi: 'Mô tả trạng thái' }),
            A('introQuote', { en: 'Intro quote', vi: 'Trích dẫn mở đầu' }),
            arr('stats', { en: 'Stats', vi: 'Số liệu' }, [T('value', { en: 'Value', vi: 'Giá trị' }), T('label', { en: 'Label', vi: 'Nhãn' })]),
          ],
        },
        {
          label: { en: 'Chat preview', vi: 'Xem trước chat' },
          fields: [T('previewEyebrow'), T('previewTitle'), A('previewDesc')],
        },
        {
          label: { en: 'Use cases', vi: 'Tình huống' },
          fields: [
            T('useCasesTitle'),
            A('useCasesDesc'),
            arr('useCases', { en: 'Use cases', vi: 'Tình huống' }, [
              T('persona', { en: 'Persona', vi: 'Đối tượng' }),
              A('scenario', { en: 'Scenario', vi: 'Bối cảnh' }),
              A('example', { en: 'Example', vi: 'Ví dụ' }),
            ]),
          ],
        },
        {
          label: { en: 'Capabilities', vi: 'Năng lực' },
          fields: [
            T('capabilitiesTitle'),
            A('capabilitiesDesc'),
            arr('capabilities', { en: 'Capabilities', vi: 'Năng lực' }, [
              T('title', { en: 'Title', vi: 'Tiêu đề' }),
              A('desc', { en: 'Description', vi: 'Mô tả' }),
              LIST('bullets', { en: 'Bullets', vi: 'Gạch đầu dòng' }),
            ]),
          ],
        },
        {
          label: { en: 'Compare', vi: 'So sánh' },
          fields: [
            T('compareTitle'),
            A('compareDesc'),
            T('compareGeneric', { en: 'Generic AI heading', vi: 'Tiêu đề AI thường' }),
            T('compareBioscope', { en: 'Bioscope AI heading', vi: 'Tiêu đề Bioscope AI' }),
            LIST('genericItems', { en: 'Generic AI items', vi: 'Mục AI thường' }),
            LIST('bioscopeItems', { en: 'Bioscope AI items', vi: 'Mục Bioscope AI' }),
          ],
        },
        {
          label: { en: 'Strengths', vi: 'Thế mạnh' },
          fields: [
            T('strengthsTitle'),
            A('strengthsDesc'),
            arr('strengths', { en: 'Strengths', vi: 'Thế mạnh' }, [
              T('title', { en: 'Title', vi: 'Tiêu đề' }),
              A('desc', { en: 'Description', vi: 'Mô tả' }),
            ]),
          ],
        },
        {
          label: { en: 'Notify / CTA', vi: 'Đăng ký / CTA' },
          fields: [
            T('notifyTitle'),
            A('notifyDesc'),
            T('notifyPlaceholder'),
            T('notifyButton'),
            T('contactCta'),
            T('backHome'),
          ],
        },
      ],
    },
  ],
}
