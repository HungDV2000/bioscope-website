import type { Block, Field } from 'payload'

/**
 * Section blocks for the static (non-home) pages — About, Solutions, etc.
 * Field names mirror the frontend i18n shape (messages.<page>.<section>) so the
 * page can overlay CMS values onto the static fallback, exactly like the home
 * blocks. Added to the Pages `layout` field by bioscopePlugin.
 */

const T = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', localized: true, ...(label ? { label } : {}) })
const A = (name: string, label?: Record<string, string>): Field => ({ name, type: 'textarea', localized: true, ...(label ? { label } : {}) })
const LIST = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', hasMany: true, localized: true, ...(label ? { label } : {}) })

// ── About page ─────────────────────────────────────────────────────────────

export const AboutMissionBlock: Block = {
  slug: 'aboutMission',
  interfaceName: 'AboutMissionBlock',
  labels: { singular: { en: 'About · Mission', vi: 'Về chúng tôi · Sứ mệnh' }, plural: { en: 'About · Mission', vi: 'Về chúng tôi · Sứ mệnh' } },
  fields: [
    {
      name: 'mission',
      type: 'array',
      label: { en: 'Mission cards (3)', vi: 'Thẻ sứ mệnh (3)' },
      admin: { description: { en: 'The three mission cards.', vi: 'Ba thẻ sứ mệnh.' } },
      fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })],
    },
  ],
}

export const AboutDifferentiationBlock: Block = {
  slug: 'aboutDifferentiation',
  interfaceName: 'AboutDifferentiationBlock',
  labels: { singular: { en: 'About · Differentiation', vi: 'Về chúng tôi · Khác biệt' }, plural: { en: 'About · Differentiation', vi: 'Về chúng tôi · Khác biệt' } },
  fields: [
    T('eyebrow'),
    LIST('bullets', { en: 'Bullets', vi: 'Gạch đầu dòng' }),
    A('quote'), T('quoteHighlight'), A('quoteAfter'),
    T('company'), T('companyRole'),
  ],
}

export const AboutJourneyBlock: Block = {
  slug: 'aboutJourney',
  interfaceName: 'AboutJourneyBlock',
  labels: { singular: { en: 'About · Journey', vi: 'Về chúng tôi · Hành trình' }, plural: { en: 'About · Journey', vi: 'Về chúng tôi · Hành trình' } },
  fields: [
    T('eyebrow'), T('title'), T('subtitle'), A('description'),
    { name: 'stats', type: 'array', label: { en: 'Stats (labels)', vi: 'Chỉ số (nhãn)' }, fields: [T('label', { en: 'Label', vi: 'Nhãn' })] },
    T('highlight'), T('highlightBold'),
  ],
}

export const AboutPartnersBlock: Block = {
  slug: 'aboutPartners',
  interfaceName: 'AboutPartnersBlock',
  labels: { singular: { en: 'About · Partners', vi: 'Về chúng tôi · Đối tác' }, plural: { en: 'About · Partners', vi: 'Về chúng tôi · Đối tác' } },
  fields: [T('eyebrow'), T('title'), A('description')],
}

/** All static-page section blocks, appended to the Pages layout. */
export const PAGE_BLOCKS: Block[] = [
  AboutMissionBlock,
  AboutDifferentiationBlock,
  AboutJourneyBlock,
  AboutPartnersBlock,
]

export const PAGE_BLOCK_SLUGS = PAGE_BLOCKS.map((b) => b.slug)
