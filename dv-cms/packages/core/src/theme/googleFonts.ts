export type GoogleFontOption = {
  id: string
  label: { en: string; vi: string }
  family: string
  googleName: string
  weights: string
  subsets: string
}

export const DEFAULT_GOOGLE_FONT_ID = 'be-vietnam-pro'

/** Curated Google Fonts for Bioscope sites (includes Be Vietnam Pro). */
export const GOOGLE_FONTS: GoogleFontOption[] = [
  {
    id: 'be-vietnam-pro',
    label: { en: 'Be Vietnam Pro', vi: 'Be Vietnam Pro' },
    family: 'Be Vietnam Pro',
    googleName: 'Be+Vietnam+Pro',
    weights: '400;500;600;700;800',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'inter',
    label: { en: 'Inter', vi: 'Inter' },
    family: 'Inter',
    googleName: 'Inter',
    weights: '400;500;600;700',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'plus-jakarta-sans',
    label: { en: 'Plus Jakarta Sans', vi: 'Plus Jakarta Sans' },
    family: 'Plus Jakarta Sans',
    googleName: 'Plus+Jakarta+Sans',
    weights: '400;500;600;700;800',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'dm-sans',
    label: { en: 'DM Sans', vi: 'DM Sans' },
    family: 'DM Sans',
    googleName: 'DM+Sans',
    weights: '400;500;600;700',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'manrope',
    label: { en: 'Manrope', vi: 'Manrope' },
    family: 'Manrope',
    googleName: 'Manrope',
    weights: '400;500;600;700;800',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'nunito-sans',
    label: { en: 'Nunito Sans', vi: 'Nunito Sans' },
    family: 'Nunito Sans',
    googleName: 'Nunito+Sans',
    weights: '400;500;600;700;800',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'open-sans',
    label: { en: 'Open Sans', vi: 'Open Sans' },
    family: 'Open Sans',
    googleName: 'Open+Sans',
    weights: '400;500;600;700',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'roboto',
    label: { en: 'Roboto', vi: 'Roboto' },
    family: 'Roboto',
    googleName: 'Roboto',
    weights: '400;500;700',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'source-sans-3',
    label: { en: 'Source Sans 3', vi: 'Source Sans 3' },
    family: 'Source Sans 3',
    googleName: 'Source+Sans+3',
    weights: '400;500;600;700',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'work-sans',
    label: { en: 'Work Sans', vi: 'Work Sans' },
    family: 'Work Sans',
    googleName: 'Work+Sans',
    weights: '400;500;600;700',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'montserrat',
    label: { en: 'Montserrat', vi: 'Montserrat' },
    family: 'Montserrat',
    googleName: 'Montserrat',
    weights: '400;500;600;700',
    subsets: 'latin,vietnamese',
  },
  {
    id: 'lato',
    label: { en: 'Lato', vi: 'Lato' },
    family: 'Lato',
    googleName: 'Lato',
    weights: '400;700',
    subsets: 'latin,vietnamese',
  },
]

const BY_ID = Object.fromEntries(GOOGLE_FONTS.map((f) => [f.id, f])) as Record<string, GoogleFontOption>

const quoteFamily = (name: string) => (name.includes(' ') ? `"${name}"` : name)

export const getGoogleFont = (id?: string | null): GoogleFontOption =>
  BY_ID[id ?? ''] ?? BY_ID[DEFAULT_GOOGLE_FONT_ID]

/** Maps stored slug (or legacy CSS string) → font id. */
export const resolveGoogleFontId = (value?: string | null): string => {
  if (!value) return DEFAULT_GOOGLE_FONT_ID
  if (BY_ID[value]) return value
  const hit = GOOGLE_FONTS.find((f) => value.includes(f.family))
  return hit?.id ?? DEFAULT_GOOGLE_FONT_ID
}

export const googleFontCssFamily = (value?: string | null): string => {
  const font = getGoogleFont(resolveGoogleFontId(value))
  return `${quoteFamily(font.family)}, ui-sans-serif, system-ui, sans-serif`
}

export const googleFontStylesheetUrl = (value?: string | null): string => {
  const font = getGoogleFont(resolveGoogleFontId(value))
  return `https://fonts.googleapis.com/css2?family=${font.googleName}:wght@${font.weights}&display=swap`
}
