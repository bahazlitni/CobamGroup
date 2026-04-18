"use client";

import { MapPin, UserCircle, Phone, BookUser } from "lucide-react";
import { COBAM_CONTACT_DETAILS, getPhoneHref } from "@/data/contact-details";
import { cn } from "@/lib/utils";
import { useNavbarVisibility } from "@/layout/navbar-visibility";

export default function TopBar() {
  const { isNavbarHidden } = useNavbarVisibility();

  return (
    <div
      className={cn(
        "bg-cobam-dark-blue text-white text-xs py-2 px-4 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isNavbarHidden
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Service client */}
        <div className="flex items-center gap-2 text-cobam-quill-grey">
          <Phone size={12} />
          <span>Service Client :</span>
          <a
            href={getPhoneHref(COBAM_CONTACT_DETAILS.phoneMobile)}
            className="text-cobam-water-blue hover:underline font-semibold"
          >
            {COBAM_CONTACT_DETAILS.phoneMobile}
          </a>
        </div>

        {/* Right: Quick access */}
        <div className="flex items-center gap-5">
          <a href="/#nos-agences" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
            <MapPin size={12} />
            Nos Agences
          </a>
          <a href="/login/staff" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
            <UserCircle size={12} />
            Espace Team
          </a>
          <a href="/login/staff" className="flex items-center gap-1 text-cobam-quill-grey hover:text-cobam-water-blue transition-colors">
            <BookUser size={12} />
            Annuaire Cobam
          </a>
        </div>
      </div>
    </div>
  );
}
