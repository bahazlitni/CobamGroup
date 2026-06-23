import fs from "node:fs";
import path from "node:path";

type TiptapNode = {
  type: string;
  content?: TiptapNode[];
  text?: string;
};

type ProductSeed = {
  sku: string;
  name: string;
  displayName: string;
  slug: string;
  price: string;
  stock: string;
  titleSeo: string;
  descriptionSeo: string;
  tags: string[];
  description: string[];
  familySortOrder: number;
  attributes: Array<{
    key: string;
    value: string;
  }>;
  media: Array<{
    id: bigint;
    role: "GALLERY" | "TECHNICAL";
    name: string;
    altText: string;
    sortOrder: number;
  }>;
};

const BRAND_SLUG = "deutsch-color";
const PRODUCT_TYPE_SLUG = "materiau-batiment-jardin";
const SUBCATEGORY_SLUG = "adjuvants";
const FAMILY_SLUG = "latex-deutsch-color";

const EXTRA_TEMPLATE_ATTRIBUTES = [
  { key: "substrate_text", groupSlug: "caracteristiques", sortOrder: 60 },
  { key: "consumption_text", groupSlug: "caracteristiques", sortOrder: 70 },
  { key: "shelf_life_months", groupSlug: "caracteristiques", sortOrder: 80 },
] as const;

const family = {
  slug: FAMILY_SLUG,
  name: "Latex Deutsch Color",
  description:
    "Famille Latex Deutsch Color en bidons de 1L et 5L, utilisée comme adjuvant pour améliorer l'adhérence, l'élasticité et l'imperméabilité des mortiers à base de ciment.",
  descriptionSeo:
    "Latex Deutsch Color en bidons 1L et 5L pour améliorer mortiers, colles cimentaires, adhérence et imperméabilité.",
  mainImageMediaId: 1717n,
  defaultSku: "00202558",
};

const commonTechnicalAttributes = [
  {
    key: "application_area",
    value: "Accrochage, amélioration des mortiers et colles cimentaires",
  },
  {
    key: "substrate_text",
    value: "Mortiers, béton, enduits cimentaires et colles à carrelage",
  },
  {
    key: "consumption_text",
    value: "1 à 3 kg pour 25 kg de mortier selon l'usage",
  },
  { key: "shelf_life_months", value: "18" },
] as const;

const products: ProductSeed[] = [
  {
    sku: "00202558",
    name: "LATEX BIDON 1L DEUTSCH COLOR",
    displayName: "Latex bidon 1L Deutsch Color",
    slug: "latex-bidon-1l-deutsch-color-00202558",
    price: "14.250",
    stock: "14",
    titleSeo: "Latex bidon 1L Deutsch Color",
    descriptionSeo:
      "Latex Deutsch Color 1L, adjuvant pour mortiers cimentaires améliorant l'adhérence, l'élasticité et l'imperméabilité.",
    tags: [
      "deutsch",
      "color",
      "latex",
      "bidon",
      "1l",
      "1kg",
      "adjuvant",
      "mortier",
      "ciment",
      "accrochage",
      "impermeabilite",
      "elasticite",
      "colle",
      "carrelage",
      "construction",
    ],
    description: [
      "Le Latex Deutsch Color est un adjuvant liquide destiné à améliorer les mortiers à base de ciment. Il renforce l'adhérence, l'élasticité et la résistance à l'eau des préparations utilisées pour les travaux de pose, de reprise ou de réparation.",
      "Ce format 1L convient aux petits chantiers et aux interventions ponctuelles. Il peut être utilisé comme couche d'accrochage entre ancien et nouveau mortier ou pour améliorer les colles et mortiers cimentaires.",
    ],
    familySortOrder: 0,
    attributes: [
      { key: "product_line", value: "Latex" },
      { key: "packaging_volume_l", value: "1" },
      { key: "dimensions_text", value: "Bidon 1 kg / 1 L" },
      ...commonTechnicalAttributes,
    ],
    media: [
      {
        id: 1717n,
        role: "GALLERY",
        name: "LATEX BIDON 1L DEUTSCH COLOR",
        altText: "Bidon 1L de Latex Deutsch Color pour mortiers cimentaires",
        sortOrder: 1,
      },
      {
        id: 1720n,
        role: "TECHNICAL",
        name: "Fiche technique",
        altText: "Fiche technique du Latex bidon 1L Deutsch Color",
        sortOrder: 10,
      },
    ],
  },
  {
    sku: "00202541",
    name: "LATEX BIDON 5L DEUTSCH COLOR",
    displayName: "Latex bidon 5L Deutsch Color",
    slug: "latex-bidon-5l-deutsch-color-00202541",
    price: "72.000",
    stock: "1",
    titleSeo: "Latex bidon 5L Deutsch Color",
    descriptionSeo:
      "Latex Deutsch Color 5L pour améliorer l'adhérence, l'élasticité et l'imperméabilité des mortiers cimentaires.",
    tags: [
      "deutsch",
      "color",
      "latex",
      "bidon",
      "5l",
      "5kg",
      "adjuvant",
      "mortier",
      "ciment",
      "accrochage",
      "impermeabilite",
      "elasticite",
      "colle",
      "carrelage",
      "construction",
    ],
    description: [
      "Le Latex Deutsch Color est un polymère synthétique liquide utilisé pour renforcer les mortiers et colles à base de ciment. Il améliore l'accrochage, la maniabilité, l'élasticité et l'imperméabilité des préparations.",
      "Le bidon 5L est adapté aux chantiers nécessitant une quantité plus importante d'adjuvant. Il s'utilise notamment pour les couches d'accrochage, les reprises de mortier et les mortiers cimentaires soumis à l'humidité.",
    ],
    familySortOrder: 1,
    attributes: [
      { key: "product_line", value: "Latex" },
      { key: "packaging_volume_l", value: "5" },
      { key: "dimensions_text", value: "Bidon 5 kg / 5 L" },
      ...commonTechnicalAttributes,
    ],
    media: [
      {
        id: 1718n,
        role: "GALLERY",
        name: "LATEX BIDON 5L DEUTSCH COLOR",
        altText: "Bidon 5L de Latex Deutsch Color pour mortiers cimentaires",
        sortOrder: 1,
      },
      {
        id: 1719n,
        role: "TECHNICAL",
        name: "Fiche technique",
        altText: "Fiche technique du Latex bidon 5L Deutsch Color",
        sortOrder: 10,
      },
    ],
  },
];

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key]) {
      continue;
    }

    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function doc(paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  } satisfies TiptapNode;
}

function serializeTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].join(" ");
}

function assertLength(label: string, value: string, maxLength: number) {
  if (value.length > maxLength) {
    throw new Error(`${label} is too long (${value.length}/${maxLength}): ${value}`);
  }
}

function validateSeedData() {
  const skus = new Set<string>();
  const slugs = new Set<string>();
  const mediaIds = new Set<bigint>();

  for (const product of products) {
    if (skus.has(product.sku)) {
      throw new Error(`Duplicate SKU in seed data: ${product.sku}`);
    }

    if (slugs.has(product.slug)) {
      throw new Error(`Duplicate slug in seed data: ${product.slug}`);
    }

    skus.add(product.sku);
    slugs.add(product.slug);
    assertLength(`titleSeo ${product.sku}`, product.titleSeo, 60);
    assertLength(`descriptionSeo ${product.sku}`, product.descriptionSeo, 160);

    for (const media of product.media) {
      if (mediaIds.has(media.id)) {
        throw new Error(`Media ID is assigned twice: ${media.id.toString()}`);
      }

      mediaIds.add(media.id);
    }
  }
}

function requireRecord<T>(record: T | null | undefined, message: string): T {
  if (!record) {
    throw new Error(message);
  }

  return record;
}

loadEnvFile(path.join(process.cwd(), "apps/cobam-group/.env"));
validateSeedData();

const [
  { prisma },
  {
    ProductAvailability,
    ProductKind,
    ProductLifecycle,
    ProductMediaRole,
    StockUnit,
  },
] = await Promise.all([import("@cobam/db"), import("@prisma/client")]);

const result = await prisma.$transaction(
  async (tx) => {
    const [brand, productType, subcategory] = await Promise.all([
      tx.organization.findUnique({
        where: { slug: BRAND_SLUG },
        select: { id: true, slug: true, name: true },
      }),
      tx.productType.findUnique({
        where: { slug: PRODUCT_TYPE_SLUG },
        select: { id: true, slug: true, displayName: true },
      }),
      tx.productSubcategory.findFirst({
        where: { slug: SUBCATEGORY_SLUG },
        select: { id: true, slug: true, name: true },
      }),
    ]);

    const brandRecord = requireRecord(brand, `Brand not found: ${BRAND_SLUG}`);
    const productTypeRecord = requireRecord(
      productType,
      `Product type not found: ${PRODUCT_TYPE_SLUG}`,
    );
    const subcategoryRecord = requireRecord(
      subcategory,
      `Subcategory not found: ${SUBCATEGORY_SLUG}`,
    );

    const attributeGroups = await tx.productAttributeGroup.findMany({
      where: { productTypeId: productTypeRecord.id },
      select: { id: true, slug: true },
    });
    const attributeGroupBySlug = new Map(
      attributeGroups.map((group) => [group.slug, group]),
    );

    for (const templateAttribute of EXTRA_TEMPLATE_ATTRIBUTES) {
      const definition = requireRecord(
        await tx.productAttributeDefinition.findUnique({
          where: { key: templateAttribute.key },
          select: { id: true },
        }),
        `Attribute definition not found: ${templateAttribute.key}`,
      );
      const group = requireRecord(
        attributeGroupBySlug.get(templateAttribute.groupSlug),
        `Attribute group not found: ${templateAttribute.groupSlug}`,
      );

      await tx.productTypeAttribute.upsert({
        where: {
          productTypeId_attributeDefinitionId: {
            productTypeId: productTypeRecord.id,
            attributeDefinitionId: definition.id,
          },
        },
        create: {
          productTypeId: productTypeRecord.id,
          attributeDefinitionId: definition.id,
          attributeGroupId: group.id,
          isRequired: false,
          isFilterable: false,
          sortOrder: templateAttribute.sortOrder,
        },
        update: {
          attributeGroupId: group.id,
          isFilterable: false,
          sortOrder: templateAttribute.sortOrder,
        },
      });
    }

    const templateAttributes = await tx.productTypeAttribute.findMany({
      where: { productTypeId: productTypeRecord.id },
      select: {
        attributeGroup: {
          select: { id: true, name: true, sortOrder: true },
        },
        attributeDefinition: {
          select: {
            id: true,
            key: true,
            label: true,
            unit: true,
            inputType: true,
          },
        },
        isRequired: true,
        isFilterable: true,
        sortOrder: true,
      },
    });
    const templateAttributeByKey = new Map(
      templateAttributes.map((attribute) => [
        attribute.attributeDefinition.key,
        attribute,
      ]),
    );

    await tx.productFamily.upsert({
      where: { slug: family.slug },
      create: {
        slug: family.slug,
        name: family.name,
        description: family.description,
        descriptionSeo: family.descriptionSeo,
        mainImageMediaId: family.mainImageMediaId,
      },
      update: {
        name: family.name,
        description: family.description,
        descriptionSeo: family.descriptionSeo,
        mainImageMediaId: family.mainImageMediaId,
      },
    });

    const familyRecord = requireRecord(
      await tx.productFamily.findUnique({
        where: { slug: family.slug },
        select: { id: true },
      }),
      `Family not found after upsert: ${family.slug}`,
    );

    const productResults: Array<{
      id: bigint;
      sku: string;
      slug: string;
      action: "inserted" | "updated";
    }> = [];

    for (const product of products) {
      const existing = await tx.product.findUnique({
        where: { sku: product.sku },
        select: { id: true },
      });

      const data = {
        brandId: brandRecord.id,
        productTypeId: productTypeRecord.id,
        kind: ProductKind.VARIANT,
        lifecycle: ProductLifecycle.ACTIVE,
        slug: product.slug,
        name: product.name,
        displayName: product.displayName,
        richTextDescription: doc(product.description),
        titleSeo: product.titleSeo,
        descriptionSeo: product.descriptionSeo,
        tags: serializeTags(product.tags),
        stockAvailable: product.stock,
        stockUnit: StockUnit.PIECE,
        stockAvailability: ProductAvailability.IN_STOCK,
        basePriceTtcTnd: product.price,
        currentPriceTtcTnd: product.price,
      };

      const record = existing
        ? await tx.product.update({
            where: { id: existing.id },
            data,
            select: { id: true, sku: true, slug: true },
          })
        : await tx.product.create({
            data: {
              ...data,
              sku: product.sku,
            },
            select: { id: true, sku: true, slug: true },
          });

      productResults.push({
        id: record.id,
        sku: record.sku,
        slug: record.slug,
        action: existing ? "updated" : "inserted",
      });

      await tx.productSubcategoryLink.upsert({
        where: {
          productId_subcategoryId: {
            productId: record.id,
            subcategoryId: subcategoryRecord.id,
          },
        },
        create: {
          productId: record.id,
          subcategoryId: subcategoryRecord.id,
        },
        update: {},
      });

      await tx.productFamilyMember.upsert({
        where: {
          familyId_productId: {
            familyId: familyRecord.id,
            productId: record.id,
          },
        },
        create: {
          familyId: familyRecord.id,
          productId: record.id,
          sortOrder: product.familySortOrder,
        },
        update: {
          sortOrder: product.familySortOrder,
        },
      });

      const attributeKeys = product.attributes.map((attribute) => attribute.key);

      await tx.productAttribute.deleteMany({
        where: {
          productId: record.id,
          name: { in: attributeKeys },
        },
      });

      for (const attribute of product.attributes) {
        const templateAttribute = requireRecord(
          templateAttributeByKey.get(attribute.key),
          `Template attribute not found for ${product.sku}: ${attribute.key}`,
        );
        const definition = templateAttribute.attributeDefinition;
        const group = templateAttribute.attributeGroup;

        await tx.productAttribute.create({
          data: {
            productId: record.id,
            attributeDefId: definition.id,
            attributeGroupId: group?.id ?? null,
            name: definition.key,
            label: definition.label,
            value: attribute.value,
            unit: definition.unit,
            inputType: definition.inputType,
            isRequired: templateAttribute.isRequired,
            isFilterable: templateAttribute.isFilterable,
            groupName: group?.name ?? null,
            groupSortOrder: group?.sortOrder ?? 0,
            sortOrder: templateAttribute.sortOrder,
          },
        });
      }

      for (const media of product.media) {
        await tx.media.update({
          where: { id: media.id },
          data: {
            altText: media.altText,
            title: media.name,
          },
        });

        await tx.productMedia.upsert({
          where: {
            productId_mediaId: {
              productId: record.id,
              mediaId: media.id,
            },
          },
          create: {
            productId: record.id,
            mediaId: media.id,
            role:
              media.role === "GALLERY"
                ? ProductMediaRole.GALLERY
                : ProductMediaRole.TECHNICAL,
            name: media.name,
            altText: media.altText,
            sortOrder: media.sortOrder,
          },
          update: {
            role:
              media.role === "GALLERY"
                ? ProductMediaRole.GALLERY
                : ProductMediaRole.TECHNICAL,
            name: media.name,
            altText: media.altText,
            sortOrder: media.sortOrder,
          },
        });
      }
    }

    return productResults;
  },
  { timeout: 60_000 },
);

const validationProducts = await prisma.product.findMany({
  where: { sku: { in: products.map((product) => product.sku) } },
  orderBy: { sku: "asc" },
  select: {
    id: true,
    sku: true,
    slug: true,
    displayName: true,
    titleSeo: true,
    descriptionSeo: true,
    stockAvailable: true,
    basePriceTtcTnd: true,
    brand: { select: { name: true } },
    productType: { select: { displayName: true } },
    subcategories: {
      select: { subcategory: { select: { name: true } } },
    },
    media: {
      select: { role: true, mediaId: true, name: true, altText: true },
      orderBy: { sortOrder: "asc" },
    },
    attributes: {
      select: { name: true, value: true },
      orderBy: [{ groupSortOrder: "asc" }, { sortOrder: "asc" }],
    },
    familyMembership: {
      select: {
        sortOrder: true,
        family: { select: { name: true } },
      },
    },
  },
});

if (validationProducts.length !== products.length) {
  throw new Error(
    `Validation failed: expected ${products.length} products, got ${validationProducts.length}.`,
  );
}

for (const product of validationProducts) {
  if (!product.titleSeo || product.titleSeo.length > 60) {
    throw new Error(`Validation failed: invalid SEO title for ${product.sku}.`);
  }

  if (!product.descriptionSeo || product.descriptionSeo.length > 160) {
    throw new Error(`Validation failed: invalid SEO description for ${product.sku}.`);
  }

  if (product.media.length !== 2) {
    throw new Error(`Validation failed: expected 2 media links for ${product.sku}.`);
  }

  if (!product.familyMembership) {
    throw new Error(`Validation failed: missing family membership for ${product.sku}.`);
  }
}

console.log(
  JSON.stringify(
    {
      products: result.map((product) => ({
        ...product,
        id: product.id.toString(),
      })),
      validation: validationProducts.map((product) => ({
        id: product.id.toString(),
        sku: product.sku,
        slug: product.slug,
        displayName: product.displayName,
        brand: product.brand?.name ?? null,
        productType: product.productType.displayName,
        subcategories: product.subcategories.map((link) => link.subcategory.name),
        mediaCount: product.media.length,
        attributes: product.attributes.map((attribute) => [
          attribute.name,
          attribute.value,
        ]),
        family: product.familyMembership?.family.name ?? null,
      })),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
