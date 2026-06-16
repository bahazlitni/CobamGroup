"use client";

import ArticleDocumentReader from "@/components/staff/articles/article-document-reader";
import {
  getArticleContentWithCTABanners,
} from "@/features/articles/cta-banners";
import type { ArticleCTABannerDto } from "@/features/articles/types";
import ArticleCTABannerRenderer from "./article-cta-banner-renderer";

type ArticleContentWithCTABannersProps = {
  content: string;
  ctaBanners: ArticleCTABannerDto[];
};

export default function ArticleContentWithCTABanners({
  content,
  ctaBanners,
}: ArticleContentWithCTABannersProps) {
  const chunks = getArticleContentWithCTABanners(content, ctaBanners);

  return (
    <div>
      {chunks.map((chunk) =>
        chunk.type === "content" ? (
          <ArticleDocumentReader key={chunk.key} content={chunk.content} />
        ) : (
          <ArticleCTABannerRenderer key={chunk.key} banner={chunk.banner} />
        ),
      )}
    </div>
  );
}
