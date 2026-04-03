import Image from "next/image";

interface BrandLogoProps {
  name: string; imageUrl: string;
}

export default function BrandLogo({ name, imageUrl }: BrandLogoProps) {
  return (
    <div className="flex items-center justify-center bg-white border border-gray-100 rounded-xl hover:border-cobam-water-blue/40 hover:shadow-md transition-all group">
      <Image
        src={imageUrl}
        alt={name}
        width={480}
        height={270}
        className="object-contain h-32"
      />
    </div>
  );
}
