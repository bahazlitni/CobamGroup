import fs from "node:fs";
import path from "node:path";

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
};

type ProductSeed = {
  sku: string;
  name: string;
  displayName: string;
  slug: string;
  brandSlug: "sopal" | "jaquar";
  kind: "SINGLE" | "VARIANT";
  familySlug?: string;
  familySortOrder?: number;
  price: string;
  stock: string;
  titleSeo: string;
  descriptionSeo: string;
  tags: string[];
  description: string[];
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

type FamilySeed = {
  slug: string;
  name: string;
  description: string;
  descriptionSeo: string;
  mainImageMediaId: bigint;
  defaultSku: string;
};

const PRODUCT_TYPE_SLUG = "douchette-tete-bras-flexible";
const SUBCATEGORY_SLUGS = ["robinetterie", "espace-douche"] as const;

const EXTRA_TEMPLATE_ATTRIBUTES = [
  { key: "shape", groupSlug: "caracteristiques", sortOrder: 15 },
  { key: "length_cm", groupSlug: "caracteristiques", sortOrder: 20 },
  { key: "mounting_type", groupSlug: "caracteristiques", sortOrder: 25 },
] as const;

const REQUIRED_FINISHES = [
  { key: "CHROME", label: "Chrome", color: "#C8CDD0" },
  { key: "MATT_BLACK", label: "Noir mat", color: "#111111" },
  { key: "DORE_BROSSE", label: "Doré brossé", color: "#C8A24A" },
] as const;

const families: FamilySeed[] = [
  {
    slug: "jaquar-bras-de-douche-mural-carre-ali-sha-455l400",
    name: "Bras de douche mural carré ALI-SHA-455L400 Jaquar",
    description:
      "Famille de bras de douche muraux carrés Jaquar ALI-SHA-455L400, proposés en finitions noir mat et chromé pour composer une douche contemporaine.",
    descriptionSeo:
      "Bras de douche muraux carrés Jaquar ALI-SHA-455L400 en finitions noir mat et chromé pour tête de douche.",
    mainImageMediaId: 1700n,
    defaultSku: "00216661",
  },
  {
    slug: "jaquar-bras-de-douche-mural-rond-479l450",
    name: "Bras de douche mural rond 479L450 Jaquar",
    description:
      "Famille de bras de douche muraux ronds Jaquar 479L450, pensée pour installer une tête de douche avec une ligne fine et élégante.",
    descriptionSeo:
      "Bras de douche muraux ronds Jaquar 479L450 en finitions chromé et doré brossé pour espace douche.",
    mainImageMediaId: 1709n,
    defaultSku: "00232784",
  },
];

const products: ProductSeed[] = [
  {
    sku: "00178822",
    name: "BRAS DE DOUCHE CARRE MURAL G1/2 L360 90° SOPAL",
    displayName: "Bras de douche mural carré L360 chromé Sopal",
    slug: "bras-de-douche-mural-carre-l360-sopal-00178822",
    brandSlug: "sopal",
    kind: "SINGLE",
    price: "360.900",
    stock: "4",
    titleSeo: "Bras de douche mural carré L360 chromé Sopal",
    descriptionSeo:
      "Bras de douche mural carré Sopal L360 en laiton chromé, adapté aux têtes de douche avec raccord G1/2.",
    tags: [
      "sopal",
      "bras",
      "douche",
      "mural",
      "carre",
      "chrome",
      "laiton",
      "robinetterie",
      "espace",
      "salle",
      "bain",
      "g1-2",
      "l360",
      "accessoire",
    ],
    description: [
      "Ce bras de douche mural carré Sopal permet d'installer une tête de douche avec une ligne nette et contemporaine. Sa finition chromée s'intègre facilement dans une salle de bain moderne et reste simple à entretenir au quotidien.",
      "Sa conception en laiton et son raccord G1/2 en font une solution adaptée aux installations murales de douche. Le format L360 offre une portée confortable pour positionner la douche de tête.",
    ],
    attributes: [
      { key: "shower_set_type", value: "Bras de douche" },
      { key: "model_reference", value: "1051A04" },
      { key: "shape", value: "Carré" },
      { key: "length_cm", value: "36" },
      { key: "mounting_type", value: "Mural" },
      { key: "dimensions_text", value: "L360" },
      { key: "connection_size", value: 'G1/2"' },
      { key: "finish", value: "Chrome" },
      { key: "material", value: "Laiton" },
      { key: "application_area", value: "Douche" },
    ],
    media: [
      {
        id: 1697n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE CARRE MURAL G1-2 L360 90° SOPAL [1]",
        altText: "Bras de douche mural carré chromé Sopal",
        sortOrder: 1,
      },
      {
        id: 1698n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE CARRE MURAL G1-2 L360 90° SOPAL [2]",
        altText: "Bras de douche carré Sopal avec tête de douche",
        sortOrder: 2,
      },
      {
        id: 1699n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE CARRE MURAL G1-2 L360 90° SOPAL [3]",
        altText: "Schéma du bras de douche mural carré Sopal",
        sortOrder: 3,
      },
      {
        id: 1712n,
        role: "TECHNICAL",
        name: "Fiche technique",
        altText: "Fiche technique du bras de douche mural carré Sopal",
        sortOrder: 10,
      },
    ],
  },
  {
    sku: "00216661",
    name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-BLM-455L400 JAQUAR",
    displayName:
      "Bras de douche mural carré ALI-SHA-BLM-455L400 noir mat Jaquar",
    slug: "bras-de-douche-mural-carre-ali-sha-blm-455l400-jaquar-00216661",
    brandSlug: "jaquar",
    kind: "VARIANT",
    familySlug: "jaquar-bras-de-douche-mural-carre-ali-sha-455l400",
    familySortOrder: 0,
    price: "218.530",
    stock: "2",
    titleSeo: "Bras douche carré noir mat ALI-SHA-BLM Jaquar",
    descriptionSeo:
      "Bras de douche mural carré 400 mm en finition noir mat, idéal pour installer une tête de douche Jaquar contemporaine.",
    tags: [
      "jaquar",
      "bras",
      "douche",
      "mural",
      "carre",
      "noir",
      "mat",
      "laiton",
      "robinetterie",
      "espace",
      "salle",
      "bain",
      "400mm",
      "ali-sha-blm-455l400",
      "accessoire",
    ],
    description: [
      "Ce bras de douche mural carré Jaquar accompagne une tête de douche avec une esthétique sobre et architecturale. Sa finition noir mat crée un rendu moderne, particulièrement adapté aux salles de bain contemporaines.",
      "Le format 400 mm offre une bonne portée depuis le mur pour positionner la douche de tête. Sa composition en laiton répond aux exigences d'un accessoire de robinetterie durable.",
    ],
    attributes: [
      { key: "shower_set_type", value: "Bras de douche" },
      { key: "model_reference", value: "ALI-SHA-BLM-455L400" },
      { key: "shape", value: "Carré" },
      { key: "length_cm", value: "40" },
      { key: "mounting_type", value: "Mural" },
      { key: "dimensions_text", value: "400 mm" },
      { key: "finish", value: "Noir mat" },
      { key: "material", value: "Laiton" },
      { key: "application_area", value: "Douche" },
    ],
    media: [
      {
        id: 1700n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-BLM-455L400 JAQUAR [1]",
        altText: "Bras de douche mural carré noir mat Jaquar",
        sortOrder: 1,
      },
      {
        id: 1701n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-BLM-455L400 JAQUAR [2]",
        altText: "Bras de douche carré noir mat Jaquar avec dimensions",
        sortOrder: 2,
      },
      {
        id: 1702n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-BLM-455L400 JAQUAR [3]",
        altText: "Bras de douche mural carré Jaquar noir mat installé",
        sortOrder: 3,
      },
      {
        id: 1713n,
        role: "TECHNICAL",
        name: "Fiche technique",
        altText: "Fiche technique du bras de douche carré noir mat Jaquar",
        sortOrder: 10,
      },
    ],
  },
  {
    sku: "00206792",
    name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-CHR-455L400 JAQUAR",
    displayName: "Bras de douche mural carré ALI-SHA-CHR-455L400 chromé Jaquar",
    slug: "bras-de-douche-mural-carre-ali-sha-chr-455l400-jaquar-00206792",
    brandSlug: "jaquar",
    kind: "VARIANT",
    familySlug: "jaquar-bras-de-douche-mural-carre-ali-sha-455l400",
    familySortOrder: 1,
    price: "156.610",
    stock: "3",
    titleSeo: "Bras douche carré chromé ALI-SHA-CHR Jaquar",
    descriptionSeo:
      "Bras de douche mural carré 400 mm chromé Jaquar, conçu pour une tête de douche avec finition brillante et durable.",
    tags: [
      "jaquar",
      "bras",
      "douche",
      "mural",
      "carre",
      "chrome",
      "laiton",
      "robinetterie",
      "espace",
      "salle",
      "bain",
      "400mm",
      "ali-sha-chr-455l400",
      "accessoire",
    ],
    description: [
      "Ce bras de douche mural carré Jaquar permet de compléter une installation de douche avec une finition chromée brillante. Ses lignes droites apportent un style net et facile à associer aux robinetteries modernes.",
      "Avec sa longueur de 400 mm et sa conception en laiton, il offre une base stable pour installer une tête de douche murale dans une salle de bain résidentielle ou professionnelle.",
    ],
    attributes: [
      { key: "shower_set_type", value: "Bras de douche" },
      { key: "model_reference", value: "ALI-SHA-CHR-455L400" },
      { key: "shape", value: "Carré" },
      { key: "length_cm", value: "40" },
      { key: "mounting_type", value: "Mural" },
      { key: "dimensions_text", value: "400 mm" },
      { key: "finish", value: "Chrome" },
      { key: "material", value: "Laiton" },
      { key: "application_area", value: "Douche" },
    ],
    media: [
      {
        id: 1703n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-CHR-455L400 JAQUAR [1]",
        altText: "Bras de douche mural carré chromé Jaquar",
        sortOrder: 1,
      },
      {
        id: 1704n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-CHR-455L400 JAQUAR [2]",
        altText: "Bras de douche carré chromé Jaquar avec dimensions",
        sortOrder: 2,
      },
      {
        id: 1705n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL CARRE ALI-SHA-CHR-455L400 JAQUAR [3]",
        altText: "Bras de douche mural carré Jaquar chromé installé",
        sortOrder: 3,
      },
      {
        id: 1714n,
        role: "TECHNICAL",
        name: "Fiche technique",
        altText: "Fiche technique du bras de douche carré chromé Jaquar",
        sortOrder: 10,
      },
    ],
  },
  {
    sku: "00206785",
    name: "BRAS DE DOUCHE MURAL ROND ORP-SHA-CHR-479L450 JAQUAR",
    displayName: "Bras de douche mural rond ORP-SHA-CHR-479L450 chromé Jaquar",
    slug: "bras-de-douche-mural-rond-orp-sha-chr-479l450-jaquar-00206785",
    brandSlug: "jaquar",
    kind: "VARIANT",
    familySlug: "jaquar-bras-de-douche-mural-rond-479l450",
    familySortOrder: 1,
    price: "94.700",
    stock: "1",
    titleSeo: "Bras douche rond chromé ORP-SHA-479L450 Jaquar",
    descriptionSeo:
      "Bras de douche mural rond 450 mm chromé Jaquar, adapté aux installations de douche avec tête murale.",
    tags: [
      "jaquar",
      "bras",
      "douche",
      "mural",
      "rond",
      "chrome",
      "inox",
      "laiton",
      "robinetterie",
      "espace",
      "salle",
      "bain",
      "450mm",
      "orp-sha-chr-479l450",
      "accessoire",
    ],
    description: [
      "Ce bras de douche mural rond Jaquar apporte une ligne discrète et élégante pour installer une tête de douche. Sa finition chromée convient aux salles de bain classiques comme aux ambiances plus contemporaines.",
      "La longueur de 450 mm permet de déporter confortablement la tête de douche depuis le mur. La fiche technique indique une composition associant tube inox AISI 304 et pièces en laiton.",
    ],
    attributes: [
      { key: "shower_set_type", value: "Bras de douche" },
      { key: "model_reference", value: "ORP-SHA-CHR-479L450" },
      { key: "shape", value: "Rond" },
      { key: "length_cm", value: "45" },
      { key: "mounting_type", value: "Mural" },
      { key: "dimensions_text", value: "450 mm" },
      { key: "finish", value: "Chrome" },
      { key: "material", value: "Inox AISI 304 et laiton" },
      { key: "application_area", value: "Douche" },
    ],
    media: [
      {
        id: 1706n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL ROND ORP-SHA-CHR-479L450 JAQUAR [1]",
        altText: "Bras de douche mural rond chromé Jaquar",
        sortOrder: 1,
      },
      {
        id: 1707n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL ROND ORP-SHA-CHR-479L450 JAQUAR [2]",
        altText: "Bras de douche rond chromé Jaquar avec dimensions",
        sortOrder: 2,
      },
      {
        id: 1708n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL ROND ORP-SHA-CHR-479L450 JAQUAR [3]",
        altText: "Bras de douche mural rond Jaquar chromé installé",
        sortOrder: 3,
      },
      {
        id: 1715n,
        role: "TECHNICAL",
        name: "Fiche technique",
        altText: "Fiche technique du bras de douche rond chromé Jaquar",
        sortOrder: 10,
      },
    ],
  },
  {
    sku: "00232784",
    name: "BRAS DE DOUCHE MURAL ROND SHA-GBP-479L450 OPAL JAQUAR",
    displayName:
      "Bras de douche mural rond SHA-GBP-479L450 Opal doré brossé Jaquar",
    slug: "bras-de-douche-mural-rond-sha-gbp-479l450-opal-jaquar-00232784",
    brandSlug: "jaquar",
    kind: "VARIANT",
    familySlug: "jaquar-bras-de-douche-mural-rond-479l450",
    familySortOrder: 0,
    price: "156.610",
    stock: "2",
    titleSeo: "Bras douche rond Opal doré SHA-GBP Jaquar",
    descriptionSeo:
      "Bras de douche mural rond 450 mm Jaquar Opal en finition doré brossé, pour une douche élégante et coordonnée.",
    tags: [
      "jaquar",
      "bras",
      "douche",
      "mural",
      "rond",
      "opal",
      "dore",
      "brosse",
      "inox",
      "laiton",
      "robinetterie",
      "espace",
      "salle",
      "bain",
      "450mm",
      "sha-gbp-479l450",
      "accessoire",
    ],
    description: [
      "Ce bras de douche mural rond Jaquar Opal met en valeur la douche avec une finition doré brossé chaleureuse. Il convient aux salles de bain où les détails de robinetterie participent pleinement au style de l'espace.",
      "Son format 450 mm offre une portée confortable pour la tête de douche. La composition technique combine un tube inox AISI 304 et des éléments en laiton, selon la fiche fabricant.",
    ],
    attributes: [
      { key: "shower_set_type", value: "Bras de douche" },
      { key: "model_reference", value: "SHA-GBP-479L450" },
      { key: "shape", value: "Rond" },
      { key: "length_cm", value: "45" },
      { key: "mounting_type", value: "Mural" },
      { key: "dimensions_text", value: "450 mm" },
      { key: "finish", value: "Doré brossé" },
      { key: "material", value: "Inox AISI 304 et laiton" },
      { key: "application_area", value: "Douche" },
    ],
    media: [
      {
        id: 1709n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL ROND SHA-GBP-479L450 OPAL JAQUAR [1]",
        altText: "Bras de douche mural rond doré brossé Jaquar Opal",
        sortOrder: 1,
      },
      {
        id: 1710n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL ROND SHA-GBP-479L450 OPAL JAQUAR [2]",
        altText: "Bras de douche rond doré brossé Jaquar avec dimensions",
        sortOrder: 2,
      },
      {
        id: 1711n,
        role: "GALLERY",
        name: "BRAS DE DOUCHE MURAL ROND SHA-GBP-479L450 OPAL JAQUAR [3]",
        altText: "Bras de douche mural rond Jaquar Opal installé",
        sortOrder: 3,
      },
      {
        id: 1716n,
        role: "TECHNICAL",
        name: "Fiche technique",
        altText: "Fiche technique du bras de douche rond Opal Jaquar",
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
    ProductTypeAttributeInputType,
    StockUnit,
  },
] = await Promise.all([import("@cobam/db"), import("@prisma/client")]);

const result = await prisma.$transaction(
  async (tx) => {
    const productType = requireRecord(
      await tx.productType.findUnique({
        where: { slug: PRODUCT_TYPE_SLUG },
        select: { id: true, slug: true },
      }),
      `Product type not found: ${PRODUCT_TYPE_SLUG}`,
    );

    const brandRecords = await tx.organization.findMany({
      where: { slug: { in: ["sopal", "jaquar"] }, isProductBrand: true },
      select: { id: true, slug: true },
    });
    const brandBySlug = new Map(brandRecords.map((brand) => [brand.slug, brand]));

    for (const brandSlug of ["sopal", "jaquar"] as const) {
      requireRecord(brandBySlug.get(brandSlug), `Brand not found: ${brandSlug}`);
    }

    const subcategories = await tx.productSubcategory.findMany({
      where: { slug: { in: [...SUBCATEGORY_SLUGS] } },
      select: { id: true, slug: true },
    });
    const subcategoryBySlug = new Map(
      subcategories.map((subcategory) => [subcategory.slug, subcategory]),
    );

    for (const subcategorySlug of SUBCATEGORY_SLUGS) {
      requireRecord(
        subcategoryBySlug.get(subcategorySlug),
        `Subcategory not found: ${subcategorySlug}`,
      );
    }

    for (const finish of REQUIRED_FINISHES) {
      await tx.productFinish.upsert({
        where: { key: finish.key },
        create: finish,
        update: {
          label: finish.label,
          color: finish.color,
        },
      });
    }

    const attributeGroups = await tx.productAttributeGroup.findMany({
      where: { productTypeId: productType.id },
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
            productTypeId: productType.id,
            attributeDefinitionId: definition.id,
          },
        },
        create: {
          productTypeId: productType.id,
          attributeDefinitionId: definition.id,
          attributeGroupId: group.id,
          isRequired: false,
          isFilterable: true,
          sortOrder: templateAttribute.sortOrder,
        },
        update: {
          attributeGroupId: group.id,
          isFilterable: true,
          sortOrder: templateAttribute.sortOrder,
        },
      });
    }

    const templateAttributes = await tx.productTypeAttribute.findMany({
      where: { productTypeId: productType.id },
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

    for (const family of families) {
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
    }

    const productResults: Array<{
      id: bigint;
      sku: string;
      slug: string;
      action: "inserted" | "updated";
    }> = [];

    for (const product of products) {
      const brand = requireRecord(
        brandBySlug.get(product.brandSlug),
        `Brand not found: ${product.brandSlug}`,
      );
      const existing = await tx.product.findUnique({
        where: { sku: product.sku },
        select: { id: true },
      });

      const data = {
        brandId: brand.id,
        productTypeId: productType.id,
        kind:
          product.kind === "SINGLE"
            ? ProductKind.SINGLE
            : ProductKind.VARIANT,
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

      for (const subcategorySlug of SUBCATEGORY_SLUGS) {
        const subcategory = requireRecord(
          subcategoryBySlug.get(subcategorySlug),
          `Subcategory not found: ${subcategorySlug}`,
        );

        await tx.productSubcategoryLink.upsert({
          where: {
            productId_subcategoryId: {
              productId: record.id,
              subcategoryId: subcategory.id,
            },
          },
          create: {
            productId: record.id,
            subcategoryId: subcategory.id,
          },
          update: {},
        });
      }

      if (product.familySlug) {
        const family = requireRecord(
          await tx.productFamily.findUnique({
            where: { slug: product.familySlug },
            select: { id: true },
          }),
          `Family not found: ${product.familySlug}`,
        );

        await tx.productFamilyMember.upsert({
          where: {
            familyId_productId: {
              familyId: family.id,
              productId: record.id,
            },
          },
          create: {
            familyId: family.id,
            productId: record.id,
            sortOrder: product.familySortOrder ?? 0,
          },
          update: {
            sortOrder: product.familySortOrder ?? 0,
          },
        });
      }

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
            inputType:
              definition.inputType as typeof ProductTypeAttributeInputType.TEXT,
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

    for (const family of families) {
      const defaultProduct = requireRecord(
        await tx.product.findUnique({
          where: { sku: family.defaultSku },
          select: { id: true },
        }),
        `Default product not found for family ${family.slug}: ${family.defaultSku}`,
      );

      await tx.productFamily.update({
        where: { slug: family.slug },
        data: { defaultProductId: defaultProduct.id },
      });
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
    currentPriceTtcTnd: true,
    brand: { select: { name: true } },
    productType: { select: { displayName: true } },
    subcategories: {
      select: { subcategory: { select: { name: true } } },
      orderBy: { subcategoryId: "asc" },
    },
    media: {
      select: { role: true, mediaId: true, name: true, altText: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    },
    attributes: {
      select: { name: true, value: true },
      orderBy: [{ groupSortOrder: "asc" }, { sortOrder: "asc" }],
    },
    familyMembership: {
      select: {
        sortOrder: true,
        family: { select: { slug: true, name: true, defaultProductId: true } },
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

  if (product.media.length < 4) {
    throw new Error(`Validation failed: missing media for ${product.sku}.`);
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
