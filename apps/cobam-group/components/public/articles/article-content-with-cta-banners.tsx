"use client";

import ArticleDocumentReader from "@/components/staff/articles/article-document-reader";
import {
  getArticleContentWithCTABanners,
} from "@/features/articles/cta-banners";
import { isArticleDocumentEmpty } from "@/features/articles/document";
import type {
  ArticleCTABannerDto,
  ArticleFaqQuestionDto,
} from "@/features/articles/types";
import ArticleCTABannerRenderer from "./article-cta-banner-renderer";

type ArticleContentWithCTABannersProps = {
  introductionContent: string;
  bodyContent: string;
  conclusionContent: string;
  ctaBanners: ArticleCTABannerDto[];
  faqQuestions: ArticleFaqQuestionDto[];
};

export default function ArticleContentWithCTABanners({
  introductionContent,
  bodyContent,
  conclusionContent,
  ctaBanners,
  faqQuestions,
}: ArticleContentWithCTABannersProps) {
  const chunks = getArticleContentWithCTABanners(bodyContent, ctaBanners);
  const hasIntroduction = !isArticleDocumentEmpty(introductionContent);
  const hasConclusion = !isArticleDocumentEmpty(conclusionContent);

  return (
    <div className="space-y-10">
      {hasIntroduction ? <ArticleDocumentReader content={introductionContent} /> : null}

      {chunks.map((chunk) =>
        chunk.type === "content" ? (
          <ArticleDocumentReader key={chunk.key} content={chunk.content} />
        ) : (
          <ArticleCTABannerRenderer key={chunk.key} banner={chunk.banner} />
        ),
      )}

      {hasConclusion ? <ArticleDocumentReader content={conclusionContent} /> : null}

      {faqQuestions.length > 0 ? (
        <section className="space-y-5 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Questions fréquentes
          </h2>
          <div className="space-y-5">
            {faqQuestions.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
                <ArticleDocumentReader content={item.content} className="mt-3" emptyLabel="" />
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
