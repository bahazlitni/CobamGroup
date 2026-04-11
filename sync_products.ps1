$DB="postgresql://admin:%5BCobamGroup%5D.%3F.7796%21@localhost:5432/cobamgroup"

psql $DB -c "TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;"

psql $DB -c "\copy public.products (
  id, sku, slug, kind, name, description, description_seo,
  brand, base_price_amount, vat_rate, stock, stock_unit,
  visibility, price_visibility, stock_visibility,
  lifecycle, commercial_mode, tags,
  datasheet_media_id, created_at, updated_at
) FROM 'C:/dev/cobam-group/products_sync.csv' WITH CSV HEADER ENCODING 'UTF8'"

psql $DB -c "
SELECT setval(
  pg_get_serial_sequence('public.products', 'id'),
  COALESCE((SELECT MAX(id) FROM public.products), 1),
  true
);"