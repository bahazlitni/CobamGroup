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
        <p className="text-cobam-water-blue text-xs font-bold tracking-[0.3em] uppercase mb-3">
          {preTitle}
        </p>
      )}
      <h2
        className={`text-3xl sm:text-4xl font-bold leading-tight ${
          titleTextColor ?? "text-cobam-dark-blue"
        }`}
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-base mt-4 leading-relaxed max-w-2xl ${
            centered ? "mx-auto" : ""
          } ${
            descriptionTextColor ?? "text-black"
          }`}
        >
          {description}
        </p>
      )}
      <div
        className={`mt-4 h-0.5 w-12 bg-cobam-water-blue ${
          centered ? "mx-auto" : ""
        }`}
      />
      { voirPlusLink && <AnimatedUIButton icon="plus" variant="ghost" className="!absolute !right-0 !top-0" href={voirPlusLink} > 
        Voir Plus
      </AnimatedUIButton> }
    </div>
  );
}
