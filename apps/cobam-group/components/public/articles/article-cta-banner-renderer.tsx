"use client";

import Image from "next/image";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { ANIMATED_ICON_NAMES, type AnimatedIconName } from "@/components/ui/custom/AnimatedIcon";
import {
  getArticleCtaBannerAnchorOption,
  getArticleCtaBannerAspectRatioCss,
} from "@/features/articles/cta-banners";
import type { ArticleCTABannerDto } from "@/features/articles/types";
import { cn } from "@/lib/utils";

const ANIMATED_ICON_NAME_SET = new Set<string>(ANIMATED_ICON_NAMES);

function normalizeIconCode(iconCode: string | null | undefined): AnimatedIconName {
  const normalized = iconCode?.trim() as AnimatedIconName | undefined;

  return normalized && ANIMATED_ICON_NAME_SET.has(normalized) ? normalized : "arrow-right";
}

function getSafePublicHref(href: string | null | undefined): string | null {
  const trimmed = href?.trim();

  if (!trimmed || /^\s*javascript:/i.test(trimmed)) {
    return null;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function getAnchorLayoutClasses(anchor: ArticleCTABannerDto["anchor"]) {
  const option = getArticleCtaBannerAnchorOption(anchor);
  const justifyClass =
    option.row === 0 ? "justify-start" : option.row === 1 ? "justify-center" : "justify-end";
  const itemsClass =
    option.col === 0 ? "items-start" : option.col === 1 ? "items-center" : "items-end";
  const textClass =
    option.col === 0 ? "text-left" : option.col === 1 ? "text-center" : "text-right";
  const overlayClass =
    option.col === 0
      ? "bg-gradient-to-r from-[#14202e]/94 via-[#14202e]/62 to-[#14202e]/18"
      : option.col === 2
        ? "bg-gradient-to-l from-[#14202e]/94 via-[#14202e]/62 to-[#14202e]/18"
        : "bg-[#14202e]/54";

  return {
    justifyClass,
    itemsClass,
    textClass,
    overlayClass,
  };
}

type ArticleCTABannerRendererProps = {
  banner: ArticleCTABannerDto;
  className?: string;
};

export default function ArticleCTABannerRenderer({
  banner,
  className,
}: ArticleCTABannerRendererProps) {
  const ratio = getArticleCtaBannerAspectRatioCss(banner.horizontalAspectRatio);
  const anchorClasses = getAnchorLayoutClasses(banner.anchor);
  const validButtons = banner.buttons
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((button) => ({
      ...button,
      href: getSafePublicHref(button.href ?? banner.href),
    }))
    .filter((button) => button.href && (button.text?.trim() || button.iconCode?.trim()))
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "group/article-cta relative my-10 overflow-hidden rounded-[28px] border border-white/20",
        "shadow-[0_24px_70px_rgba(20,32,46,0.18)]",
        className,
      )}
      style={{
        backgroundColor: banner.backgroundColor,
        aspectRatio: ratio,
      }}
    >
      {banner.imageUrl ? (
        <Image
          src={banner.imageUrl}
          alt={banner.imageAlt ?? banner.title}
          fill
          sizes="(max-width: 768px) 92vw, 768px"
          unoptimized
          className="object-cover transition-transform duration-700 group-hover/article-cta:scale-[1.03]"
        />
      ) : null}

      <div className={cn("absolute inset-0", anchorClasses.overlayClass)} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/8" />

      <div
        className={cn(
          "relative z-10 flex h-full min-h-64 flex-col p-6 text-white sm:p-8 lg:p-10",
          anchorClasses.justifyClass,
          anchorClasses.itemsClass,
        )}
      >
        <div className={cn("max-w-2xl", anchorClasses.textClass)}>
          <h2
            className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {banner.title}
          </h2>

          {banner.description ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/82 sm:text-base">
              {banner.description}
            </p>
          ) : null}

          {validButtons.length > 0 ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {validButtons.map((button, index) => (
                <AnimatedUIButton
                  key={`${button.sortOrder}-${button.href}`}
                  href={button.href!}
                  target={isExternalHref(button.href!) ? "_blank" : undefined}
                  variant={index === 0 ? "light" : "outline-dark"}
                  icon={normalizeIconCode(button.iconCode)}
                  iconPosition="right"
                  size="md"
                  className={index === 0 ? "border-white bg-white" : "border-white/35"}
                >
                  {button.text?.trim() || "Découvrir"}
                </AnimatedUIButton>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
