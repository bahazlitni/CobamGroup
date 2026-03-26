import Image from "next/image";
import { StaffBadge } from "@/components/staff/ui";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  category: string;
  href: string;
  isNew?: boolean;
  isPromo?: boolean;
  imageUrl: string;
}

export default function ProductCard({
  name,
  category,
  href,
  isNew,
  isPromo,
  imageUrl,
}: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {isNew ? (
          <StaffBadge size="md" color="secondary" icon="star">
            Nouveau
          </StaffBadge>
        ) : null}
        {isPromo ? (
          <StaffBadge size="md" color="red" icon="warning">
            Promo
          </StaffBadge>
        ) : null}
      </div>

      <div className="relative h-56 overflow-hidden bg-cobam-light-bg">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-cobam-dark-blue/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            className="bg-cobam-water-blue font-bold text-white hover:bg-white hover:text-cobam-water-blue"
            asChild
          >
            <a href={href}>Demande de devis</a>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <p className="mb-1 text-xs font-semibold tracking-wider text-cobam-water-blue uppercase">
          {category}
        </p>
        <h3 className="text-sm font-bold text-cobam-dark-blue">{name}</h3>
      </div>
    </div>
  );
}
