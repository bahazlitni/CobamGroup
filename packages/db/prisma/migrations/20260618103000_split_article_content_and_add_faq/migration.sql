-- Split the legacy single article content document into explicit introduction/body/conclusion
-- sections and add ordered FAQ questions.
-- Slugs are intentionally untouched.

ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "introduction_content" TEXT,
  ADD COLUMN IF NOT EXISTS "body_content" TEXT,
  ADD COLUMN IF NOT EXISTS "conclusion_content" TEXT;

CREATE TABLE IF NOT EXISTS "article_faq_questions" (
  "id" BIGSERIAL PRIMARY KEY,
  "article_id" BIGINT NOT NULL,
  "question" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "article_faq_questions" DROP CONSTRAINT IF EXISTS "article_faq_questions_article_id_fkey";
ALTER TABLE "article_faq_questions"
  ADD CONSTRAINT "article_faq_questions_article_id_fkey"
    FOREIGN KEY ("article_id") REFERENCES "articles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "article_faq_questions_article_id_idx"
  ON "article_faq_questions"("article_id");
CREATE INDEX IF NOT EXISTS "article_faq_questions_article_id_sort_order_idx"
  ON "article_faq_questions"("article_id", "sort_order");

CREATE OR REPLACE FUNCTION "_article_migration_empty_doc"()
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT '{"type":"doc","content":[{"type":"paragraph"}]}'::TEXT;
$$;

CREATE OR REPLACE FUNCTION "_article_migration_node_text"("node" JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  "result" TEXT := '';
  "child" JSONB;
BEGIN
  IF "node" IS NULL THEN
    RETURN '';
  END IF;

  IF "node"->>'type' = 'text' THEN
    RETURN COALESCE("node"->>'text', '');
  END IF;

  IF jsonb_typeof("node"->'content') = 'array' THEN
    FOR "child" IN SELECT "value" FROM jsonb_array_elements("node"->'content')
    LOOP
      "result" := CONCAT_WS(' ', "result", "_article_migration_node_text"("child"));
    END LOOP;
  END IF;

  RETURN BTRIM(regexp_replace("result", '\s+', ' ', 'g'));
END;
$$;

CREATE OR REPLACE FUNCTION "_article_migration_normalize_text"("value" TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT BTRIM(regexp_replace(
    translate(
      lower(COALESCE("value", '')),
      'àáâäãåçèéêëìíîïñòóôöõùúûüýÿœæ',
      'aaaaaaceeeeiiiinooooouuuuyyoeae'
    ),
    '\s+',
    ' ',
    'g'
  ));
$$;

CREATE OR REPLACE FUNCTION "_article_migration_doc_from_nodes"("nodes" JSONB)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN "nodes" IS NULL OR jsonb_typeof("nodes") <> 'array' OR jsonb_array_length("nodes") = 0
      THEN "_article_migration_empty_doc"()
    ELSE jsonb_build_object('type', 'doc', 'content', "nodes")::TEXT
  END;
$$;

CREATE OR REPLACE FUNCTION "_article_migration_slice_nodes"(
  "nodes" JSONB,
  "start_index" INTEGER,
  "end_index" INTEGER
)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(jsonb_agg("node" ORDER BY "ordinality"), '[]'::JSONB)
  FROM jsonb_array_elements(COALESCE("nodes", '[]'::JSONB)) WITH ORDINALITY AS "items"("node", "ordinality")
  WHERE "ordinality" BETWEEN GREATEST("start_index", 1) AND GREATEST("end_index", 0);
$$;

DO $$
DECLARE
  "empty_doc" TEXT := "_article_migration_empty_doc"();
  "article_record" RECORD;
  "document" JSONB;
  "nodes" JSONB;
  "node_count" INTEGER;
  "intro_heading_index" INTEGER;
  "conclusion_heading_index" INTEGER;
  "first_heading_index" INTEGER;
  "first_heading_after_intro_index" INTEGER;
  "intro_nodes" JSONB;
  "body_nodes" JSONB;
  "conclusion_nodes" JSONB;
  "method" TEXT;
  "warning_reason" TEXT;
  "warnings" JSONB := '[]'::JSONB;
BEGIN
  FOR "article_record" IN
    SELECT "id", "slug", "title", "content"
    FROM "articles"
    WHERE "introduction_content" IS NULL
       OR "body_content" IS NULL
       OR "conclusion_content" IS NULL
  LOOP
    "method" := 'structured_headings';
    "warning_reason" := NULL;

    BEGIN
      "document" := "article_record"."content"::JSONB;
    EXCEPTION WHEN OTHERS THEN
      "document" := jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'content', jsonb_build_array(
              jsonb_build_object('type', 'text', 'text', COALESCE("article_record"."content", ''))
            )
          )
        )
      );
      "method" := 'legacy_text_fallback';
      "warning_reason" := 'Legacy content was not valid article JSON; moved as body text.';
    END;

    IF jsonb_typeof("document"->'content') = 'array' THEN
      "nodes" := "document"->'content';
    ELSE
      "nodes" := '[]'::JSONB;
      "method" := 'empty_or_invalid_document';
      "warning_reason" := COALESCE("warning_reason", 'Article document had no top-level content array.');
    END IF;

    "node_count" := jsonb_array_length("nodes");

    SELECT "ordinality"::INTEGER INTO "intro_heading_index"
    FROM jsonb_array_elements("nodes") WITH ORDINALITY AS "items"("node", "ordinality")
    WHERE "node"->>'type' = 'heading'
      AND "_article_migration_normalize_text"("_article_migration_node_text"("node")) ~ '^(introduction|intro)($|[[:space:][:punct:]])'
    ORDER BY "ordinality"
    LIMIT 1;

    SELECT "ordinality"::INTEGER INTO "conclusion_heading_index"
    FROM jsonb_array_elements("nodes") WITH ORDINALITY AS "items"("node", "ordinality")
    WHERE "node"->>'type' = 'heading'
      AND "_article_migration_normalize_text"("_article_migration_node_text"("node")) ~ '^(conclusion|conclusions|en conclusion|pour conclure)($|[[:space:][:punct:]])'
    ORDER BY "ordinality" DESC
    LIMIT 1;

    SELECT "ordinality"::INTEGER INTO "first_heading_index"
    FROM jsonb_array_elements("nodes") WITH ORDINALITY AS "items"("node", "ordinality")
    WHERE "node"->>'type' = 'heading'
      AND (
        "conclusion_heading_index" IS NULL
        OR "ordinality"::INTEGER < "conclusion_heading_index"
      )
    ORDER BY "ordinality"
    LIMIT 1;

    IF "intro_heading_index" IS NOT NULL THEN
      SELECT "ordinality"::INTEGER INTO "first_heading_after_intro_index"
      FROM jsonb_array_elements("nodes") WITH ORDINALITY AS "items"("node", "ordinality")
      WHERE "node"->>'type' = 'heading'
        AND "ordinality"::INTEGER > "intro_heading_index"
        AND (
          "conclusion_heading_index" IS NULL
          OR "ordinality"::INTEGER < "conclusion_heading_index"
        )
      ORDER BY "ordinality"
      LIMIT 1;
    ELSE
      "first_heading_after_intro_index" := NULL;
    END IF;

    IF "intro_heading_index" IS NOT NULL AND "conclusion_heading_index" IS NOT NULL THEN
      "intro_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        "intro_heading_index" + 1,
        COALESCE("first_heading_after_intro_index", "conclusion_heading_index") - 1
      );
      "body_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        COALESCE("first_heading_after_intro_index", "intro_heading_index" + 1),
        "conclusion_heading_index" - 1
      );
      "conclusion_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        "conclusion_heading_index" + 1,
        "node_count"
      );
    ELSIF "conclusion_heading_index" IS NOT NULL THEN
      "method" := 'conclusion_heading_only';
      "warning_reason" := COALESCE("warning_reason", 'No explicit Introduction heading; introduction was inferred from leading content.');
      "intro_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        1,
        COALESCE(NULLIF("first_heading_index", 1), 2) - 1
      );
      "body_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        COALESCE("first_heading_index", 1),
        "conclusion_heading_index" - 1
      );
      "conclusion_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        "conclusion_heading_index" + 1,
        "node_count"
      );
    ELSIF "intro_heading_index" IS NOT NULL THEN
      "method" := 'introduction_heading_only';
      "warning_reason" := COALESCE("warning_reason", 'No explicit Conclusion heading; conclusion was left empty.');
      "intro_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        "intro_heading_index" + 1,
        COALESCE("first_heading_after_intro_index", "node_count" + 1) - 1
      );
      "body_nodes" := "_article_migration_slice_nodes"(
        "nodes",
        COALESCE("first_heading_after_intro_index", "intro_heading_index" + 1),
        "node_count"
      );
      "conclusion_nodes" := '[]'::JSONB;
    ELSIF "node_count" >= 4 THEN
      "method" := 'paragraph_boundary_heuristic';
      "warning_reason" := COALESCE("warning_reason", 'No explicit Introduction/Conclusion headings; first and last top-level blocks were inferred.');
      "intro_nodes" := "_article_migration_slice_nodes"("nodes", 1, 1);
      "body_nodes" := "_article_migration_slice_nodes"("nodes", 2, "node_count" - 1);
      "conclusion_nodes" := "_article_migration_slice_nodes"("nodes", "node_count", "node_count");
    ELSE
      "method" := 'body_only';
      "warning_reason" := COALESCE("warning_reason", 'No clear article structure; legacy content was moved to body only.');
      "intro_nodes" := '[]'::JSONB;
      "body_nodes" := "nodes";
      "conclusion_nodes" := '[]'::JSONB;
    END IF;

    IF "_article_migration_node_text"(jsonb_build_object('content', "body_nodes")) = ''
       AND "node_count" > 0 THEN
      "body_nodes" := "nodes";
      "warning_reason" := COALESCE("warning_reason", 'Body section would have been empty; legacy content was kept in body.');
    END IF;

    UPDATE "articles"
    SET
      "introduction_content" = "_article_migration_doc_from_nodes"("intro_nodes"),
      "body_content" = "_article_migration_doc_from_nodes"("body_nodes"),
      "conclusion_content" = "_article_migration_doc_from_nodes"("conclusion_nodes")
    WHERE "id" = "article_record"."id";

    IF "warning_reason" IS NOT NULL THEN
      "warnings" := "warnings" || jsonb_build_array(jsonb_build_object(
        'id', "article_record"."id",
        'slug', "article_record"."slug",
        'title', "article_record"."title",
        'method', "method",
        'warning', "warning_reason"
      ));
    END IF;
  END LOOP;

  IF jsonb_array_length("warnings") > 0 THEN
    RAISE WARNING 'Article content split warnings: %', "warnings"::TEXT;
  END IF;
END $$;

UPDATE "articles"
SET
  "introduction_content" = COALESCE("introduction_content", "_article_migration_empty_doc"()),
  "body_content" = COALESCE("body_content", "_article_migration_empty_doc"()),
  "conclusion_content" = COALESCE("conclusion_content", "_article_migration_empty_doc"());

ALTER TABLE "articles"
  ALTER COLUMN "introduction_content" SET NOT NULL,
  ALTER COLUMN "body_content" SET NOT NULL,
  ALTER COLUMN "conclusion_content" SET NOT NULL,
  DROP COLUMN IF EXISTS "content";

DROP FUNCTION IF EXISTS "_article_migration_slice_nodes"(JSONB, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS "_article_migration_doc_from_nodes"(JSONB);
DROP FUNCTION IF EXISTS "_article_migration_normalize_text"(TEXT);
DROP FUNCTION IF EXISTS "_article_migration_node_text"(JSONB);
DROP FUNCTION IF EXISTS "_article_migration_empty_doc"();
