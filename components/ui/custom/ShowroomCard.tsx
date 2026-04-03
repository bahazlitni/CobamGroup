// @/components/ui/custom/ShowroomCard.tsx
"use client";

import { MapPin, Phone, Clock, Navigation } from "lucide-react";

const SHOWROOMS: Record<
  string,
  {
    name: string;
    address: string;
    phone: string;
    hours: string;
    mapQuery: string;
  }
> = {
  "houmt-souk": {
    name: "Cobam Houmt Souk",
    address: "Houmt Souk, Djerba, Tunisie",
    phone: "+216 26 833 101",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "COBAM+Group+(Maison+&+Decors)+Djerba+Tunisia",
  },
  midoun: {
    name: "Cobam Midoun",
    address: "Midoun, Djerba, Tunisie",
    phone: "+216 26 833 104",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "Cobam+Midoun+Djerba+Tunisia",
  },
  centrale: {
    name: "Cobam Central",
    address: "Tunis Centre, Tunisie",
    phone: "+216 26 833 102",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "Cobam+Group-Siege+Djerba+Tunisia",
  },
  ceram: {
    name: "Cobam Céram",
    address: "Zone Industrielle, Djerba, Tunisie",
    phone: "+216 26 833 103",
    hours: "Lun–Sam : 8h00–18h00",
    mapQuery: "Cobam+Ceram+Djerba+Tunisia",
  },
};

interface ShowroomCardProps {
  location: string;
}

export default function ShowroomCard({ location }: ShowroomCardProps) {
  const { name, address, phone, hours, mapQuery } = SHOWROOMS[location];
  const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.02] border border-slate-200/50">
      <div className="relative h-40 w-full overflow-hidden">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          title={`Carte - ${name}`}
          className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-cobam-dark-blue group-hover:text-cobam-water-blue transition-colors">
          {name}
        </h3>
        <div className="mt-3 space-y-2 text-sm text-cobam-carbon-grey">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-cobam-water-blue" />
            <span>{address}</span>
          </div>
          <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-cobam-water-blue transition">
            <Phone size={14} className="text-cobam-water-blue" />
            <span>{phone}</span>
          </a>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-cobam-water-blue" />
            <span>{hours}</span>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cobam-water-blue/30 bg-white/50 py-2 text-xs font-bold text-cobam-water-blue transition-all hover:bg-cobam-water-blue hover:text-white"
        >
          <Navigation size={14} />
          Itinéraire
        </a>
      </div>
    </div>
  );
}