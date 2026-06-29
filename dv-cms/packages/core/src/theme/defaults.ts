import type { AdminTheme, ResolvedFrontendTheme } from './types'

/** Bioscope frontend design tokens — aligned with `bioscope-frontend/globals.css`. */
export const DEFAULT_FRONTEND_THEME: Omit<
  ResolvedFrontendTheme,
  'fontGoogleId' | 'fontGoogleUrl' | 'fontCssFamily'
> = {
  primaryColor: '#008e4d',
  primaryDark: '#036f3d',
  primaryTint: '#eef6f1',
  primaryBorder: '#cfe3d8',
  accentColor: '#f58e33',
  accentSoft: '#fff4e8',
  ink: '#101814',
  mist: '#f4f8f6',
  fontFamily: 'be-vietnam-pro',
  radiusLg: 16,
  radiusXl: 24,
  radius2xl: 28,
}

/** Admin dashboard tokens (maps to `--dv-*` + Payload radius scale). */
export const DEFAULT_ADMIN_THEME: Required<AdminTheme> = {
  primaryColor: '#008e4d',
  primaryDark: '#036f3d',
  accentColor: '#f58e33',
  sidebarBackground: '#f4f8f6',
  radius: 12,
  fontFamily: 'be-vietnam-pro',
}
