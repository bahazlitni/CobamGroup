import { ProductCardSkeleton } from "@/components/commerce/product-card";

export default function Loading() {
  return (
    <main className="commerce-container py-10">
      <div className="h-72 animate-pulse rounded-[2rem] bg-ec-stone" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
