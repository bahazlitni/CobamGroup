// @/components/ui/custom/StatBadge.tsx
"use client";

interface StatBadgeProps {
  value: string;
  label: string;
  delay?: number;
}

export default function StatBadge({ value, label, delay = 0 }: StatBadgeProps) {
  return (
    <div
      className="px-12 py-4 text-center transition-all duration-500 hover:scale-105"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
        {value}
      </div>
      <div className="text-sm sm:text-base font-medium text-cobam-quill-grey">
        {label}
      </div>
    </div>
  );
}