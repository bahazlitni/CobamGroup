import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "À propos",
  description:
    "Découvrez l'histoire, la vision, les valeurs et les équipes de COBAM GROUP depuis 1994.",
  path: "/a-propos",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
