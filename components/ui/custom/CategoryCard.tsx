import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  imageUrl: string;
}

export default function CategoryCard({
  title,
  description,
  href,
  imageUrl,
}: CategoryCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-cobam-light-bg overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-cobam-dark-blue font-bold text-lg mb-2 group-hover:text-cobam-water-blue transition-colors">
          {title}
        </h3>
        <p className="text-cobam-carbon-grey text-sm leading-relaxed flex-1">
          {description}
        </p>
        <div className="flex items-center gap-1 mt-4 text-cobam-water-blue text-sm font-semibold">
          Voir les produits
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
}
