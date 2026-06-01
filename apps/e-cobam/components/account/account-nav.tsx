import Link from "next/link";
import { Bell, CreditCard, LogOut, MapPin, PackageCheck, ShieldCheck, UserRound } from "lucide-react";

import { logoutCustomerAction } from "@/app/(app)/compte/actions";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const links = [
  { href: "/compte/profil", label: "Profil", icon: UserRound },
  { href: "/compte/securite", label: "Sécurité", icon: ShieldCheck },
  { href: "/compte/adresses", label: "Adresses", icon: MapPin },
  { href: "/compte/commandes", label: "Commandes", icon: PackageCheck },
  { href: "/compte/paiements", label: "Paiements", icon: CreditCard },
  { href: "/compte/notifications", label: "Notifications", icon: Bell },
];

export function AccountNav({ active }: { active: string }) {
  return (
    <div className="space-y-3">
      <Card className="h-fit p-2">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "focus-visible:outline-ec-blue inline-flex min-w-max items-center gap-3 px-4 py-3 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  active === link.href
                    ? "bg-ec-ink text-white"
                    : "text-ec-muted hover:bg-ec-paper hover:text-ec-ink",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </Card>
      <form action={logoutCustomerAction}>
        <button
          type="submit"
          className={cn(
            "border-ec-line text-ec-ink hover:border-ec-ink hover:bg-ec-ink inline-flex h-12 w-full items-center justify-center gap-3 border bg-white px-4 text-sm font-black transition hover:text-white",
            "focus-visible:outline-ec-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
