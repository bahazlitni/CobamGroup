CREATE OR REPLACE FUNCTION "_article_faq_try_jsonb"("raw_value" TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN "raw_value"::jsonb;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION "_article_faq_normalize_plain_text"("raw_value" TEXT)
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT btrim(
    regexp_replace(
      regexp_replace(
        regexp_replace(COALESCE("raw_value", ''), E'[ \t]+\n', E'\n', 'g'),
        E'\n{3,}',
        E'\n\n',
        'g'
      ),
      E'[ \t]{2,}',
      ' ',
      'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION "_article_faq_jsonb_plain_text"("node" JSONB)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  "node_type" TEXT;
  "child" JSONB;
  "result" TEXT := '';
  "alt_text" TEXT;
BEGIN
  IF "node" IS NULL THEN
    RETURN '';
  END IF;

  IF jsonb_typeof("node") = 'string' THEN
    RETURN COALESCE("node" #>> '{}', '');
  END IF;

  IF jsonb_typeof("node") = 'array' THEN
    FOR "child" IN SELECT "value" FROM jsonb_array_elements("node")
    LOOP
      "result" := "result" || "_article_faq_jsonb_plain_text"("child");
    END LOOP;

    RETURN "result";
  END IF;

  IF jsonb_typeof("node") <> 'object' THEN
    RETURN '';
  END IF;

  "node_type" := "node"->>'type';

  IF "node_type" = 'text' THEN
    RETURN COALESCE("node"->>'text', '');
  END IF;

  IF "node_type" = 'hardBreak' THEN
    RETURN E'\n';
  END IF;

  IF "node_type" = 'image' THEN
    "alt_text" := btrim(COALESCE("node"#>>'{attrs,alt}', ''));
    RETURN CASE WHEN "alt_text" <> '' THEN ' ' || "alt_text" || ' ' ELSE '' END;
  END IF;

  IF jsonb_typeof("node"->'content') = 'array' THEN
    FOR "child" IN SELECT "value" FROM jsonb_array_elements("node"->'content')
    LOOP
      "result" := "result" || "_article_faq_jsonb_plain_text"("child");
    END LOOP;
  END IF;

  IF "node_type" = ANY (
    ARRAY[
      'paragraph',
      'heading',
      'blockquote',
      'bulletList',
      'orderedList',
      'listItem',
      'table',
      'tableRow',
      'tableCell',
      'tableHeader',
      'horizontalRule'
    ]
  ) THEN
    "result" := "result" || E'\n';
  END IF;

  RETURN "result";
END;
$$;

CREATE OR REPLACE FUNCTION "_article_faq_plain_text_from_content"("raw_value" TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  "parsed" JSONB;
  "next_parsed" JSONB;
  "inner_text" TEXT;
  "depth" INTEGER := 0;
  "plain_text" TEXT;
BEGIN
  "parsed" := "_article_faq_try_jsonb"("raw_value");

  IF "parsed" IS NULL THEN
    RETURN "_article_faq_normalize_plain_text"("raw_value");
  END IF;

  WHILE jsonb_typeof("parsed") = 'string' AND "depth" < 3 LOOP
    "inner_text" := "parsed" #>> '{}';
    "next_parsed" := "_article_faq_try_jsonb"("inner_text");

    IF "next_parsed" IS NULL THEN
      RETURN "_article_faq_normalize_plain_text"("inner_text");
    END IF;

    "parsed" := "next_parsed";
    "depth" := "depth" + 1;
  END LOOP;

  "plain_text" := "_article_faq_normalize_plain_text"(
    "_article_faq_jsonb_plain_text"("parsed")
  );

  IF "plain_text" = '' AND jsonb_typeof("parsed") = 'object' THEN
    IF ("parsed" ? 'type') OR ("parsed" ? 'content') THEN
      RETURN '';
    END IF;

    RETURN "_article_faq_normalize_plain_text"("raw_value");
  END IF;

  IF "plain_text" = '' AND jsonb_typeof("parsed") = 'array' THEN
    RETURN "_article_faq_normalize_plain_text"("raw_value");
  END IF;

  IF "plain_text" = '' AND jsonb_typeof("parsed") NOT IN ('object', 'array') THEN
    RETURN "_article_faq_normalize_plain_text"("raw_value");
  END IF;

  RETURN "plain_text";
END;
$$;

UPDATE "article_faq_questions"
SET "content" = "_article_faq_plain_text_from_content"("content");

DROP FUNCTION IF EXISTS "_article_faq_plain_text_from_content"(TEXT);
DROP FUNCTION IF EXISTS "_article_faq_jsonb_plain_text"(JSONB);
DROP FUNCTION IF EXISTS "_article_faq_normalize_plain_text"(TEXT);
DROP FUNCTION IF EXISTS "_article_faq_try_jsonb"(TEXT);
