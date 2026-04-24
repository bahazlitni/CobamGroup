import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promotions",
  description:
    "Consultez les promotions, offres et opportunites speciales proposees par COBAM GROUP.",
  alternates: {
    canonical: "/promotions",
  },
};

export default function PromotionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-4 text-3xl font-bold">Promotions</h1>
      <p className="mb-6 text-gray-700">Coming Soon</p>
    </div>
  );
}
