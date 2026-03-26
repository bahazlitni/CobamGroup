"use client";

import { Home, MapPin, UserCircle, ShoppingCart, FileText, Phone } from "lucide-react";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const path = usePathname();
  const showEspacePro = !(path.includes("/login/staff") || path.includes("/espace/staff"));

  if(path.startsWith('/espace/staff')) return null;

  return (
    <div className="bg-cobam-dark-blue text-white text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Service client */}
        <div className="flex items-center gap-2 text-cobam-quill-grey">
          <Phone size={12} />
          <span>Service Client :</span>
          <a href="tel:+21626833101" className="text-cobam-water-blue hover:underline font-semibold">
            +216 26 833 101
          </a>
        </div>

        {/* Right: Quick access */}
        <div className="flex items-center gap-5">
          <a href="#nos-agences" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
            <MapPin size={12} />
            Nos Agences
          </a>
          {showEspacePro ? (
            <a href="/login/staff" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
              <UserCircle size={12} />
              Espace Staff
            </a>
          ) :
          <a href="/" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
              <Home size={12} />
              Accueil
            </a>}
          <a href="#devis" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
            <FileText size={12} />
            Devis
          </a>
          <a href="#panier" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
            <ShoppingCart size={12} />
            Panier
          </a>
        </div>
      </div>
    </div>
  );
}
