import { PremiumReveal } from "./PremiumReveal";
import { PremiumImageWrapper } from "./PremiumImageWrapper";

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
  return (
    <section className={`relative overflow-hidden bg-white text-[#14202e] py-24 sm:py-32 border-b border-cobam-quill-grey/30 pt-32 sm:pt-40 ${className || ""}`}>
      {/* Decorative architectural line */}
      <div className="absolute left-6 md:left-12 top-0 bottom-0 w-[1px] bg-cobam-quill-grey/30 hidden md:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
        <PremiumReveal blur direction="up">
          <p className="mb-6 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.4em] text-cobam-carbon-grey">
            {subtitle}
          </p>

          <h1
            className="mb-8 max-w-4xl text-4xl leading-[1.1] sm:text-5xl lg:text-7xl font-light"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {title}
          </h1>

          <p className="max-w-2xl text-lg font-light leading-relaxed text-cobam-carbon-grey">
            {description}
          </p>
        </PremiumReveal>
      </div>
    </section>
  );
}
