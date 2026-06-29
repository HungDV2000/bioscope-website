-- Fix branding.font_family before Payload converts column to enum (google font slug).
-- Old seed stored CSS stack e.g. "Be Vietnam Pro", system-ui, sans-serif — invalid for enum.
-- Usage: pnpm db:fix-branding-font

BEGIN;

UPDATE branding
SET font_family = 'be-vietnam-pro'
WHERE font_family IS NULL
   OR font_family = ''
   OR font_family LIKE '%Be Vietnam Pro%'
   OR font_family LIKE '%,%';

COMMIT;
