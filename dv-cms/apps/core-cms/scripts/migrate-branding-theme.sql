-- Add website theme columns + admin sidebar (safe — keeps existing primary_color, etc.)
-- Usage: psql "$DATABASE_URI" -f scripts/migrate-branding-theme.sql

BEGIN;

ALTER TABLE branding
  ADD COLUMN IF NOT EXISTS frontend_theme_primary_color varchar DEFAULT '#008e4d',
  ADD COLUMN IF NOT EXISTS frontend_theme_primary_dark varchar DEFAULT '#036f3d',
  ADD COLUMN IF NOT EXISTS frontend_theme_primary_tint varchar DEFAULT '#eef6f1',
  ADD COLUMN IF NOT EXISTS frontend_theme_primary_border varchar DEFAULT '#cfe3d8',
  ADD COLUMN IF NOT EXISTS frontend_theme_accent_color varchar DEFAULT '#f58e33',
  ADD COLUMN IF NOT EXISTS frontend_theme_accent_soft varchar DEFAULT '#fff4e8',
  ADD COLUMN IF NOT EXISTS frontend_theme_ink varchar DEFAULT '#101814',
  ADD COLUMN IF NOT EXISTS frontend_theme_mist varchar DEFAULT '#f4f8f6',
  ADD COLUMN IF NOT EXISTS frontend_theme_font_family varchar DEFAULT 'be-vietnam-pro',
  ADD COLUMN IF NOT EXISTS frontend_theme_radius_lg numeric DEFAULT 16,
  ADD COLUMN IF NOT EXISTS frontend_theme_radius_xl numeric DEFAULT 24,
  ADD COLUMN IF NOT EXISTS frontend_theme_radius2xl numeric DEFAULT 28,
  ADD COLUMN IF NOT EXISTS sidebar_background varchar DEFAULT '#f4f8f6';

COMMIT;
