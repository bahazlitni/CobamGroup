-- Correct product model assignments found after reviewing the product/model report.
-- These are intentionally narrow data fixes: each update targets recognizable
-- product names and only rows still sitting in the previously wrong model.

-- Tiles and porcelain stoneware classified as generic building material or sink.
UPDATE "products"
SET "product_type_id" = 4
WHERE "product_type_id" IN (28, 32)
  AND (
    "name" ILIKE 'GRE.60 CIMENTO%CARTHAGO'
    OR "name" = 'GRE.60/120 POLI TREVI 1C ETILE'
    OR "name" ILIKE 'GRE.30/60%PIERRE DE BALI%UNDEFASA'
  );

-- Glass paste sheet belongs with mosaics/decor/listels.
UPDATE "products"
SET "product_type_id" = 3
WHERE "product_type_id" = 32
  AND "name" ILIKE 'PATE DE VERRE 25 PIERRE DE BALI%';

-- Bathroom mirrors were caught by "mosaique" or "cadre" wording.
UPDATE "products"
SET "product_type_id" = 13
WHERE "product_type_id" IN (3, 39)
  AND "name" ILIKE 'MIR %LED%';

-- Paint product classified as generic building material.
UPDATE "products"
SET "product_type_id" = 35
WHERE "product_type_id" = 32
  AND "name" ILIKE 'PEINTURE HYDRO%';

-- Drainage accessories classified as lavabo/sink products.
UPDATE "products"
SET "product_type_id" = 29
WHERE "product_type_id" IN (11, 28)
  AND (
    "name" ILIKE 'BONDE LAVABO%'
    OR "name" ILIKE 'BONDE EVIER%'
    OR "name" ILIKE 'SIPHON LAVABO%'
    OR "name" ILIKE 'SIPHON DE LAVABO%'
    OR "name" ILIKE 'VIDAGE EVIER%'
  );

-- Vanity cabinet bundle classified as a plain vanity top.
UPDATE "products"
SET "product_type_id" = 15
WHERE "product_type_id" = 9
  AND "name" ILIKE 'MEUB.S B %PLAN VASQUE%MIROIR%';

-- Bathtub wooden board classified as the bathtub itself.
UPDATE "products"
SET "product_type_id" = 25
WHERE "product_type_id" = 27
  AND "name" ILIKE 'PLANCHE EN BOIS POUR BAIGNOIRE%';

-- Wall-mounted lavabo mixer trim, sold without the concealed body.
UPDATE "products"
SET "product_type_id" = 19
WHERE "product_type_id" = 16
  AND "name" ILIKE 'MIT.LAVABO%SANS CORPS%JAQUAR';
