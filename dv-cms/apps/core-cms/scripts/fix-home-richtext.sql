-- Fix: convert any home-block `description` stored as a jsonb STRING into a
-- proper Lexical richText object (preserves the text). Idempotent — only touches
-- rows where jsonb_typeof(description)='string'. Run after the textarea→richText
-- change if the admin shows "value passed to the Lexical editor is not an object".
--
--   docker compose exec db sh -c 'psql -U dvcms -d dvcms' < apps/core-cms/scripts/fix-home-richtext.sql
--   (or: docker compose exec -T db psql -U dvcms -d dvcms < apps/core-cms/scripts/fix-home-richtext.sql)

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'pages_blocks_home_hero_locales','pages_blocks_home_process_locales',
    'pages_blocks_home_categories_locales','pages_blocks_home_certifications_locales',
    'pages_blocks_home_ai_promo_locales','pages_blocks_home_cta_locales',
    '_pages_v_blocks_home_hero_locales','_pages_v_blocks_home_process_locales',
    '_pages_v_blocks_home_categories_locales','_pages_v_blocks_home_certifications_locales',
    '_pages_v_blocks_home_ai_promo_locales','_pages_v_blocks_home_cta_locales'
  ] LOOP
    IF to_regclass(t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format($f$
      UPDATE %I SET description = jsonb_build_object('root', jsonb_build_object(
        'type','root','format','','indent',0,'version',1,'direction','ltr',
        'children', jsonb_build_array(jsonb_build_object(
          'type','paragraph','version',1,'format','','indent',0,'direction','ltr','textFormat',0,
          'children', jsonb_build_array(jsonb_build_object(
            'type','text','version',1,'text', description #>> '{}','format',0,'style','','mode','normal','detail',0))))))
      WHERE jsonb_typeof(description) = 'string'
    $f$, t);
  END LOOP;
END $$;
