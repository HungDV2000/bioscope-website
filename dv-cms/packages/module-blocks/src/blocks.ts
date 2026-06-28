import type { Block } from 'payload'

const linkArray: Block['fields'][number] = {
  name: 'links',
  type: 'array',
  labels: { singular: 'Link', plural: 'Links' },
  fields: [
    { name: 'label', type: 'text', localized: true, required: true },
    { name: 'href', type: 'text', required: true },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
      ],
    },
  ],
}

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'heading', type: 'text', localized: true, required: true },
    { name: 'subheading', type: 'textarea', localized: true },
    { name: 'media', type: 'upload', relationTo: 'media' },
    linkArray,
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Rich Text', plural: 'Rich Text' },
  fields: [{ name: 'content', type: 'richText', localized: true }],
}

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Stats', plural: 'Stats' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'suffix', type: 'text', localized: true },
        { name: 'label', type: 'text', localized: true, required: true },
      ],
    },
  ],
}

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'columns', type: 'select', defaultValue: '3', options: ['2', '3', '4'] },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Tên icon (lucide) hoặc emoji.' } },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'layout', type: 'select', defaultValue: 'grid', options: ['grid', 'carousel', 'masonry'] },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', localized: true },
      ],
    },
  ],
}

export const CTABlock: Block = {
  slug: 'cta',
  interfaceName: 'CTABlock',
  labels: { singular: 'CTA', plural: 'CTAs' },
  fields: [
    { name: 'heading', type: 'text', localized: true, required: true },
    { name: 'text', type: 'textarea', localized: true },
    { name: 'background', type: 'select', defaultValue: 'tint', options: ['tint', 'solid', 'image'] },
    { name: 'image', type: 'upload', relationTo: 'media' },
    linkArray,
  ],
}

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    { name: 'url', type: 'text', required: true, admin: { description: 'YouTube/Vimeo/MP4 URL.' } },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    { name: 'caption', type: 'text', localized: true },
  ],
}

export const LogoCloudBlock: Block = {
  slug: 'logoCloud',
  interfaceName: 'LogoCloudBlock',
  labels: { singular: 'Logo Cloud', plural: 'Logo Clouds' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'logos',
      type: 'array',
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media', required: true },
        { name: 'name', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}

/** Every available block, keyed by slug for selection. */
export const ALL_BLOCKS: Block[] = [
  HeroBlock,
  RichTextBlock,
  StatsBlock,
  FeatureGridBlock,
  GalleryBlock,
  CTABlock,
  VideoEmbedBlock,
  LogoCloudBlock,
]

export type BlockSlug =
  | 'hero'
  | 'richText'
  | 'stats'
  | 'featureGrid'
  | 'gallery'
  | 'cta'
  | 'videoEmbed'
  | 'logoCloud'

/** Pick a subset of blocks by slug (undefined = all). */
export const pickBlocks = (slugs?: BlockSlug[]): Block[] =>
  slugs ? ALL_BLOCKS.filter((b) => slugs.includes(b.slug as BlockSlug)) : ALL_BLOCKS
