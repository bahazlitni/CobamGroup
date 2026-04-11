import { AnimatedUIButton } from "./Buttons";

interface SectionHeaderProps {
  preTitle?: string;
  title: string;
  description?: string;
  centered?: boolean;
  titleTextColor?: string;
  descriptionTextColor?: string;
  voirPlusLink?: string;
}

export default function SectionHeader({
  preTitle,
  title,
  description,
  centered = false,
  titleTextColor,
  descriptionTextColor,
  voirPlusLink = "",
}: SectionHeaderProps) {
  return (
    <div className={`relative mb-12 ${centered ? "text-center" : ""}`}>
      {preTitle && (
        <p className="text-cobam-water-blue text-[11px] font-semibold tracking-[0.38em] uppercase mb-4">
          {preTitle}
        </p>
      )}
      <h2
        className={`text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-tight ${
          titleTextColor ?? "text-cobam-dark-blue"
        }`}
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-base mt-5 leading-relaxed max-w-2xl ${
            centered ? "mx-auto" : ""
          } ${
            descriptionTextColor ?? "text-cobam-carbon-grey"
          }`}
        >
          {description}
        </p>
      )}
      <div
        className={`mt-5 h-px w-16 bg-cobam-water-blue/60 ${
          centered ? "mx-auto" : ""
        }`}
      />
      {voirPlusLink ? (
        <AnimatedUIButton
          icon="plus"
          variant="ghost"
          className="!absolute !right-0 !top-0"
          href={voirPlusLink}
        >
          Voir Plus
        </AnimatedUIButton>
      ) : null}
    </div>
  );
}
