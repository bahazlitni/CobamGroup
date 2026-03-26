interface StatBadgeProps {
  value: string;
  label: string;
}

export default function StatBadge({ value, label }: StatBadgeProps) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <span
        className="text-4xl sm:text-5xl font-bold text-white mb-2"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        {value}
      </span>
      <span className="text-cobam-quill-grey text-sm font-medium tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}
