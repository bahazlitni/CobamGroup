// @/components/ui/custom/ShowroomCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, ArrowRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type CobamLocation = "houmt-souk" | "midoun" | "siege" | "ceram"
const SHOWROOMS: Record<
  CobamLocation,
  {
    name: string;
    address: string;
    phone: string;
    mapQuery: string;
    image: string;
    city: string;
  }
> = {
  "houmt-souk": {
    name: "Cobam Group - Houmt Souk",
    city: "Djerba",
    address: "À côté du rond-point Chiraa, BP 396, Av. Salah Ben youssef, Houmt Souk 4116 - Djerba",
    phone: "+216 26 833 101",
    mapQuery: "COBAM+(Maison+&+Décor)+Djerba+Tunisia",
    image: "/images/showrooms/houmt-souk.png",
  },
  siege: {
    name: "Cobam Group - Siège",
    city: "Djerba",
    address: "Km 3, Route Houmt Souk-Midoun, 4180 - Djerba",
    phone: "+216 26 833 102",
    mapQuery: "33.8548547+10.894053",
    image: "/images/showrooms/siege.png",
  },
  ceram: {
    name: "Cobam Group - Céram",
    city: "Djerba",
    address: "Km 1.5, Marché de gros, Route Houmt Souk-Midoun BP 396, 4116 - Djerba",
    phone: "+216 26 833 103",
    mapQuery: "Cobam+Ceram+Djerba+Tunisia",
    image: "/images/showrooms/ceram.png",
  },
  midoun: {
    name: "Cobam Group - Midoun",
    city: "Djerba",
    address: "Av. Ali Belhouane Rte Mahboubine, 4116 - Djerba",
    phone: "+216 26 833 104",
    mapQuery: "Cobam+Midoun+Djerba+Tunisia",
    image: "/images/showrooms/midoun.png",
  },
};

interface ShowroomCardProps {
  location: CobamLocation;
  index: number;
}

export default function ShowroomCard({ location, index }: ShowroomCardProps) {
  const showroom = SHOWROOMS[location];
  const [showMap, setShowMap] = useState(false);

  if (!showroom) return null;

  const { name, address, phone, mapQuery, image, city } = showroom;
  const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const formattedIndex = (index + 1).toString().padStart(2, "0");

  return (
    <div 
      className="group relative flex flex-col bg-white overflow-visible"
      onMouseEnter={() => setShowMap(true)}
      onMouseLeave={() => setShowMap(false)}
    >
      {/* Numbering & City Accent */}
      <div className="absolute -top-4 -left-4 z-30 flex flex-col items-center">
        <span className="text-[4rem] font-playfair font-normal leading-none text-cobam-dark-blue/5 select-none pointer-events-none">
          {formattedIndex}
        </span>
      </div>

      {/* Media Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-cobam-light-bg shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-700 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
        <AnimatePresence mode="wait">
          {!showMap ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cobam-dark-blue/80 via-transparent to-transparent" />
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10"
            >
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title={`Carte - ${name}`}
                className="absolute inset-0 h-full w-full brightness-90 contrast-125 transition-all"
              />
              <div className="absolute inset-0 bg-cobam-dark-blue/10 pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Labels on Image */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-20 pointer-events-none">
          {!showMap &&
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-1"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-medium">
              {city}
            </p>
            <h3 className="text-2xl font-light text-white font-playfair tracking-wide">
              {name}
            </h3>
          </motion.div>}

          <div className="mt-4 h-[1px] w-0 bg-cobam-water-blue transition-all duration-700 group-hover:w-full opacity-60" />
        </div>

        {/* Map Toggle Indicator */}
        <div className="absolute top-4 right-4 z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
             <ExternalLink size={14} className="text-cobam-dark-blue" />
          </div>
        </div>
      </div>

      {/* Info Details Section */}
      <div className="mt-8 space-y-6 px-2">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-4 group/item">
            <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-cobam-water-blue/40 transition-all group-hover/item:scale-150 group-hover/item:bg-cobam-water-blue" />
            <div className="space-y-1">
               <p className="text-[9px] uppercase tracking-widest text-cobam-carbon-grey/60 font-bold">Localisation</p>
               <p className="text-[13px] leading-relaxed text-cobam-dark-blue font-light">{address}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-cobam-quill-grey/20">
          <a 
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 group/link"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cobam-quill-grey/30 group-hover/link:border-cobam-water-blue transition-colors">
              <Phone size={12} className="text-cobam-dark-blue group-hover/link:text-cobam-water-blue" />
            </div>
            <span className="text-[12px] font-medium text-cobam-dark-blue tracking-tight">{phone}</span>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cobam-water-blue group/nav"
          >
            <span>Itinéraire</span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover/nav:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
}

