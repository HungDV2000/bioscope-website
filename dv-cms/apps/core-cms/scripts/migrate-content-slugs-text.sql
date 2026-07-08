-- Drop legacy select/enum junction tables for contentTypes & attachTo.
-- Field đã chuyển sang text + hasMany; Payload push sẽ tạo *_texts tables.
-- Safe khi junction tables trống. Run: pnpm db:fix-content-slugs-enum

BEGIN;

DROP TABLE IF EXISTS tax_definitions_content_types CASCADE;
DROP TYPE IF EXISTS enum_tax_definitions_content_types CASCADE;

DROP TABLE IF EXISTS field_groups_attach_to CASCADE;
DROP TYPE IF EXISTS enum_field_groups_attach_to CASCADE;

COMMIT;
