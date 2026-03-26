import { Star } from "lucide-react";

interface TestimonialCardProps {
  text: string;
  author: string;
  rating?: number;
}

export default function TestimonialCard({
  text,
  author,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-cobam-carbon-grey text-sm leading-relaxed italic flex-1">
        "{text}"
      </p>
      <div className="pt-4 border-t border-gray-100">
        <span className="text-cobam-dark-blue font-bold text-sm">{author}</span>
      </div>
    </div>
  );
}
