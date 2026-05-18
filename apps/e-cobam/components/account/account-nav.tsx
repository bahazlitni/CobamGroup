import Link from "next/link";
import { Bell, CreditCard, LayoutDashboard, MapPin, PackageCheck, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const links = [
  { href: "/compte", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/compte/profil", label: "Profil", icon: UserRound },
  { href: "/compte/adresses", label: "Adresses", icon: MapPin },
  { href: "/compte/commandes", label: "Commandes", icon: PackageCheck },
  { href: "/compte/paiements", label: "Paiements", icon: CreditCard },
  { href: "/compte/notifications", label: "Notifications", icon: Bell },
];

export function AccountNav({ active }: { active: string }) {
  return (
    <Card className="h-fit p-2">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "focus-visible:outline-ec-blue inline-flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
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
  );
}
