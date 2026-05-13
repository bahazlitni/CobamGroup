import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A propos",
  description:
    "Decouvrez l'histoire, la vision, les valeurs et les equipes de COBAM GROUP depuis 1994.",
  alternates: {
    canonical: "/a-propos",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
