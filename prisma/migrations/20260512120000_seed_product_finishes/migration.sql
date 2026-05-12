-- Seed product finishes from the provided media list.
-- image_media_id is intentionally left untouched so images can be assigned manually.

INSERT INTO "product_finishes" (
  "key",
  "label",
  "color",
  "created_at",
  "updated_at"
)
VALUES
  ('SOPAL_GREEN', $$Vert Sopal$$, '#3E5B45', now(), now()),
  ('SOPAL_BLUE', $$Bleu Sopal$$, '#5A6F9B', now(), now()),
  ('ROSE_GOLD_PVD', $$Or rosé PVD$$, '#6B3925', now(), now()),
  ('BRIGHT_ROSE_GOLD_PVD', $$Or rosé brillant PVD$$, '#8E6B3D', now(), now()),
  ('MATT_GOLD_PVD', $$Or mat PVD$$, '#8A6F3C', now(), now()),
  ('BRIGHT_GOLD_PVD', $$Or brillant PVD$$, '#A4863E', now(), now()),
  ('MATT_BLACK', $$Noir mat$$, '#242424', now(), now()),
  ('POLISHED_NICKEL', $$Nickel poli$$, '#B5AA84', now(), now()),
  ('BRUSHED_NICKEL', $$Nickel brossé$$, '#8E8366', now(), now()),
  ('GRAPHITE', $$Graphite$$, '#444444', now(), now()),
  ('COOL_SUNRISE_GOLD', $$Doré - Cool Sunrise$$, '#B79A61', now(), now()),
  ('BRUSHED_COOL_SUNRISE_GOLD', $$Doré - Cool Sunrise brossé$$, '#7F6843', now(), now()),
  ('ANTIQUE_COPPER', $$Cuivre antique$$, '#7B5946', now(), now()),
  ('CHROME', $$Chrome$$, '#969696', now(), now()),
  ('BLACK_CHROME', $$Chrome noir$$, '#171717', now(), now()),
  ('BRUSHED_WARM_SUNSET_BRONZE', $$Bronze - Warm Sunset brossé$$, '#8A592F', now(), now()),
  ('WHITE', $$Blanc$$, '#F4F4F4', now(), now()),
  ('WHITE_CHROME', $$Blanc chrome$$, '#D9D9D9', now(), now()),
  ('ANTHRACITE_HARD_GRAPHITE', $$Anthracite - graphite dur$$, '#5C5653', now(), now()),
  ('BRUSHED_ANTHRACITE_HARD_GRAPHITE', $$Anthracite - graphite dur brossé$$, '#4F4C49', now(), now()),
  ('ANTHRACITE_SATIN_GRAPHITE', $$Anthracite - graphite satiné$$, '#50504E', now(), now()),
  ('STAINLESS_STEEL', $$Acier inoxydable$$, '#919596', now(), now())
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = now();
