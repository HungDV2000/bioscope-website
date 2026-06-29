import type { Payload } from 'payload'

import type { Id } from './seedHelpers.js'
import { upsertLocalized } from './seedHelpers.js'

type FieldOption = { value: string; labelVi: string; labelEn: string }

type FieldDef = {
  name: string
  type: 'text' | 'email' | 'textarea' | 'tel' | 'select'
  labelVi: string
  labelEn: string
  required?: boolean
  options?: FieldOption[]
}

const lexicalParagraph = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [
          { type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 },
        ],
      },
    ],
  },
})

function buildFields(locale: 'vi' | 'en', defs: FieldDef[]) {
  return defs.map((f) => ({
    name: f.name,
    type: f.type,
    required: f.required ?? false,
    label: locale === 'vi' ? f.labelVi : f.labelEn,
    ...(f.options
      ? {
          options: f.options.map((o) => ({
            value: o.value,
            label: locale === 'vi' ? o.labelVi : o.labelEn,
          })),
        }
      : {}),
  }))
}

async function ensureForm(
  payload: Payload,
  title: string,
  fieldDefs: FieldDef[],
  confirmation: { vi: string; en: string },
  emails: { to: string; subject?: string }[],
): Promise<Id> {
  const vi = {
    title,
    fields: buildFields('vi', fieldDefs),
    confirmationMessage: lexicalParagraph(confirmation.vi),
    emails,
  }
  const en = {
    fields: buildFields('en', fieldDefs),
    confirmationMessage: lexicalParagraph(confirmation.en),
  }

  return upsertLocalized(payload, 'forms', { title: { equals: title } }, { vi, en })
}

/** Seed form builder — Liên hệ, Yêu cầu mẫu thử, Đăng ký Bioscope AI. */
export async function seedForms(payload: Payload, log: (m: string) => void): Promise<void> {
  const contactFields: FieldDef[] = [
    {
      name: 'need',
      type: 'select',
      required: true,
      labelVi: 'Nhu cầu',
      labelEn: 'Your need',
      options: [
        { value: 'nguyen-lieu', labelVi: 'Cung cấp nguyên liệu', labelEn: 'Ingredient supply' },
        { value: 'odm', labelVi: 'ODM / Phát triển công thức', labelEn: 'ODM / Formulation' },
        { value: 'dong-kien-tao', labelVi: 'Đồng kiến tạo thương hiệu', labelEn: 'Brand co-creation' },
      ],
    },
    { name: 'name', type: 'text', required: true, labelVi: 'Họ tên', labelEn: 'Full name' },
    { name: 'company', type: 'text', labelVi: 'Công ty', labelEn: 'Company' },
    { name: 'email', type: 'email', required: true, labelVi: 'Email công việc', labelEn: 'Work email' },
    { name: 'phone', type: 'tel', labelVi: 'Số điện thoại', labelEn: 'Phone' },
    { name: 'message', type: 'textarea', labelVi: 'Nội dung / Yêu cầu', labelEn: 'Message / Request' },
  ]

  await ensureForm(
    payload,
    'Liên hệ Bioscope',
    contactFields,
    {
      vi: 'Cảm ơn bạn! Đội ngũ Bioscope sẽ phản hồi trong vòng 24 giờ làm việc.',
      en: 'Thank you! The Bioscope team will respond within 24 business hours.',
    },
    [{ to: 'info@bioscope.vn', subject: '[Website] Lượt gửi form Liên hệ mới' }],
  )

  const sampleFields: FieldDef[] = [
    { name: 'ingredient', type: 'text', required: true, labelVi: 'Nguyên liệu quan tâm', labelEn: 'Ingredient of interest' },
    { name: 'quantity', type: 'text', labelVi: 'Số lượng / MOQ dự kiến', labelEn: 'Expected quantity / MOQ' },
    { name: 'name', type: 'text', required: true, labelVi: 'Họ tên', labelEn: 'Full name' },
    { name: 'company', type: 'text', required: true, labelVi: 'Công ty', labelEn: 'Company' },
    { name: 'email', type: 'email', required: true, labelVi: 'Email công việc', labelEn: 'Work email' },
    { name: 'phone', type: 'tel', labelVi: 'Số điện thoại', labelEn: 'Phone' },
    { name: 'notes', type: 'textarea', labelVi: 'Ghi chú thêm', labelEn: 'Additional notes' },
  ]

  await ensureForm(
    payload,
    'Yêu cầu mẫu thử',
    sampleFields,
    {
      vi: 'Đã ghi nhận yêu cầu mẫu thử. Chúng tôi sẽ xác nhận tình trạng tồn kho và gửi hướng dẫn tiếp theo qua email.',
      en: 'Your sample request has been received. We will confirm availability and follow up by email.',
    },
    [{ to: 'info@bioscope.vn', subject: '[Website] Yêu cầu mẫu thử mới' }],
  )

  const aiNotifyFields: FieldDef[] = [
    { name: 'email', type: 'email', required: true, labelVi: 'Email công việc', labelEn: 'Work email' },
    { name: 'company', type: 'text', labelVi: 'Công ty / Nhãn hàng', labelEn: 'Company / Brand' },
    { name: 'role', type: 'text', labelVi: 'Vai trò (Formulator, R&D…)', labelEn: 'Role (Formulator, R&D…)' },
  ]

  await ensureForm(
    payload,
    'Đăng ký sớm Bioscope AI',
    aiNotifyFields,
    {
      vi: 'Cảm ơn bạn đã đăng ký! Chúng tôi sẽ ưu tiên mời các nhãn hàng và formulator đăng ký sớm.',
      en: 'Thanks for signing up! We will prioritize early access for registered brands and formulators.',
    },
    [{ to: 'info@bioscope.vn', subject: '[Website] Đăng ký Bioscope AI' }],
  )

  log('forms: Liên hệ Bioscope, Yêu cầu mẫu thử, Đăng ký sớm Bioscope AI')
}
