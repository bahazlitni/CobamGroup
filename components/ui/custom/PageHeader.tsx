import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";

export default function PageHeader({
  className,
  subtitle,
  title,
  description,
  themeColor,
}: {
  className?: string;
  subtitle: string;
  title: string;
  description: string;
  themeColor?: string | null;
}) {
  const resolvedThemeColor = normalizeThemeColor(themeColor);

  return (
    <section
      className={`relative flex items-center overflow-hidden bg-cobam-dark-blue text-white ${className || ""}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${withThemeAlpha(
          resolvedThemeColor,
          0.18,
        )}, rgba(11, 37, 69, 0.96) 50%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div
          className="absolute -left-10 -top-16 h-72 w-72 rounded-full"
          style={{ backgroundColor: withThemeAlpha(resolvedThemeColor, 0.42) }}
        />
        <div
          className="absolute bottom-0 right-10 h-64 w-64 rounded-full"
          style={{ backgroundColor: withThemeAlpha(resolvedThemeColor, 0.16) }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <p
          className="mb-4 text-xs font-bold uppercase tracking-[0.35em]"
          style={{ color: resolvedThemeColor }}
        >
          {subtitle}
        </p>

        <h1
          className="mb-6 max-w-2xl text-3xl font-bold sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {title}
        </h1>

        <p className="max-w-2xl text-base text-white/80 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
