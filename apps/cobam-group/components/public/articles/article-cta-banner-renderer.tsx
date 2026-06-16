"use client";

import Image from "next/image";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import type { AnimatedIconName } from "@/components/ui/custom/AnimatedIcon";
import {
  getArticleCtaBannerAspectRatioCss,
} from "@/features/articles/cta-banners";
import type { ArticleCTABannerDto } from "@/features/articles/types";
import { cn } from "@/lib/utils";

const ANIMATED_ICON_NAMES = new Set<AnimatedIconName>([
  "none",
  "loader",
  "arrow-right",
  "arrow-left",
  "arrow-up",
  "arrow-down",
  "chevron-right",
  "chevron-left",
  "chevron-up",
  "chevron-down",
  "external-link",
  "plus",
  "paper-plane",
  "restart",
  "pause",
  "play",
  "save",
  "delete",
  "trash",
  "modify",
  "check",
  "check-circle",
  "close",
  "search",
  "filter",
  "upload",
  "download",
  "user",
  "users",
  "shield",
  "tag",
  "tags",
  "package",
  "image",
  "image-stack",
  "video",
  "audio",
  "file",
  "file-text",
  "warning",
  "info",
  "mail",
  "phone",
  "calendar",
  "clock",
  "globe",
  "home",
  "settings",
  "folder",
  "folder-open",
  "star",
  "heart",
  "lock",
  "unlock",
  "eye",
  "eye-off",
  "badge-check",
  "copy",
  "ellipsis",
]);

function normalizeIconCode(iconCode: string | null | undefined): AnimatedIconName {
  const normalized = iconCode?.trim() as AnimatedIconName | undefined;

  return normalized && ANIMATED_ICON_NAMES.has(normalized) ? normalized : "arrow-right";
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

type ArticleCTABannerRendererProps = {
  banner: ArticleCTABannerDto;
  className?: string;
};

export default function ArticleCTABannerRenderer({
  banner,
  className,
}: ArticleCTABannerRendererProps) {
  const ratio = getArticleCtaBannerAspectRatioCss(banner.horizontalAspectRatio);
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
          className="object-cover transition-transform duration-700 group-hover/article-cta:scale-[1.03]"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-[#14202e]/92 via-[#14202e]/64 to-[#14202e]/22" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/8" />

      <div className="relative z-10 flex h-full min-h-64 flex-col justify-end p-6 text-white sm:p-8 lg:p-10">
        <div className="max-w-2xl">
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
            <div className="mt-6 flex flex-wrap gap-3">
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
