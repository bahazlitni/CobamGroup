import type { ArticleCTABannerDto } from "./types";
import {
  isArticleDocumentEmpty,
  parseArticleContent,
  serializeArticleContent,
  type ArticleDocument,
} from "./document";

export const ARTICLE_CTA_BANNER_ASPECT_RATIOS = [
  { value: "SQUARE", label: "Carré", css: "1 / 1" },
  { value: "RATIO_21_10", label: "21:10", css: "21 / 10" },
  { value: "RATIO_16_9", label: "16:9", css: "16 / 9" },
  { value: "RATIO_16_10", label: "16:10", css: "16 / 10" },
  { value: "RATIO_5_4", label: "5:4", css: "5 / 4" },
  { value: "RATIO_4_3", label: "4:3", css: "4 / 3" },
  { value: "RATIO_3_2", label: "3:2", css: "3 / 2" },
  { value: "RATIO_7_5", label: "7:5", css: "7 / 5" },
  { value: "RATIO_2_1", label: "2:1", css: "2 / 1" },
] as const;

export type ArticleContentWithCTABannerChunk =
  | {
      type: "content";
      key: string;
      content: string;
    }
  | {
      type: "cta";
      key: string;
      banner: ArticleCTABannerDto;
    };

function clampPosition(position: number) {
  if (!Number.isFinite(position)) {
    return 50;
  }

  return Math.min(100, Math.max(0, Math.round(position)));
}

export function getArticleCtaBannerAspectRatioCss(
  ratio: ArticleCTABannerDto["horizontalAspectRatio"],
) {
  return (
    ARTICLE_CTA_BANNER_ASPECT_RATIOS.find((option) => option.value === ratio)?.css ?? "21 / 10"
  );
}

export function sortArticleCtaBanners<T extends ArticleCTABannerDto>(banners: readonly T[]): T[] {
  return [...banners].sort((left, right) => {
    const positionDelta =
      clampPosition(left.approxPositionPercentage) -
      clampPosition(right.approxPositionPercentage);

    if (positionDelta !== 0) {
      return positionDelta;
    }

    const titleDelta = left.title.localeCompare(right.title, "fr", {
      sensitivity: "base",
    });

    if (titleDelta !== 0) {
      return titleDelta;
    }

    return left.id - right.id;
  });
}

function createDocumentChunk(nodes: ArticleDocument["content"]): string | null {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }

  const serialized = serializeArticleContent({
    type: "doc",
    content: nodes,
  });

  return isArticleDocumentEmpty(serialized) ? null : serialized;
}

export function getArticleContentWithCTABanners(
  content: string,
  banners: readonly ArticleCTABannerDto[],
): ArticleContentWithCTABannerChunk[] {
  const sortedBanners = sortArticleCtaBanners(banners);

  if (sortedBanners.length === 0) {
    return [{ type: "content", key: "content-full", content }];
  }

  const document = parseArticleContent(content);
  const nodes = Array.isArray(document.content) ? document.content : [];
  const buckets = new Map<number, ArticleCTABannerDto[]>();

  sortedBanners.forEach((banner) => {
    const insertionIndex = Math.round(
      (clampPosition(banner.approxPositionPercentage) / 100) * nodes.length,
    );
    const clampedIndex = Math.min(nodes.length, Math.max(0, insertionIndex));
    const bucket = buckets.get(clampedIndex) ?? [];

    bucket.push(banner);
    buckets.set(clampedIndex, bucket);
  });

  const chunks: ArticleContentWithCTABannerChunk[] = [];
  let pendingNodes: ArticleDocument["content"] = [];

  const flushPendingNodes = (key: string) => {
    const serialized = createDocumentChunk(pendingNodes);

    if (serialized) {
      chunks.push({
        type: "content",
        key,
        content: serialized,
      });
    }

    pendingNodes = [];
  };

  for (let index = 0; index <= nodes.length; index += 1) {
    if (index > 0) {
      pendingNodes = [...(pendingNodes ?? []), nodes[index - 1]];
    }

    const bannersAtIndex = buckets.get(index);

    if (!bannersAtIndex?.length) {
      continue;
    }

    flushPendingNodes(`content-before-${index}`);

    bannersAtIndex.forEach((banner) => {
      chunks.push({
        type: "cta",
        key: `cta-${banner.id}`,
        banner,
      });
    });
  }

  flushPendingNodes("content-after-last-cta");

  return chunks;
}
