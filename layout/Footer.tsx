"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import FooterColumn from "@/components/ui/custom/FooterColumn";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerInfo = [
  { label: "Mentions Légales", href: "#" },
  { label: "CGV", href: "#" },
  { label: "Politique de confidentialité", href: "#" },
];

const footerUseful = [
  { label: "Carrières", href: "#" },
  { label: "Devenir Partenaire", href: "#" },
  { label: "Catalogues PDF", href: "#" },
];

const slogans = ["Depuis 1994", "Maisons de rêve"];

export default function Footer() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade + slide out
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % slogans.length);
        // Fade + slide in
        setVisible(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer id="contact" className="bg-cobam-dark-blue pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Col 1 - About */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Image
              src="/images/logos/cobam-group/logo-vector-sinceless-white.svg"
              alt="COBAM GROUP"
              width={843}
              height={289}
              className="object-contain h-16 w-auto"
            />

            {/* Animated slogan */}
            <div className="h-8 overflow-hidden">
              <p
                className="text-cobam-water-blue text-m text-center font-bold transition-all duration-400 ease-in-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                {slogans[index]}
              </p>
            </div>

            <div className="flex gap-4 mt-2">
              {[
                { icon: FaFacebook, href: "https://facebook.com/cobamgrp", label: "Facebook" },
                { icon: FaInstagram, href: "https://instagram.com/cobamgroup/", label: "Instagram" },
                { icon: FaLinkedin, href: "https://linkedin.com/company/cobam-group/", label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-gray-400 hover:text-cobam-water-blue transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 - Informations */}
          <FooterColumn title="Informations" links={footerInfo} />

          {/* Col 3 - Liens Utiles */}
          <FooterColumn title="Liens Utiles" links={footerUseful} />

          {/* Col 4 - Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase">
              Contact
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-cobam-water-blue flex-shrink-0" />
                <span>Siège Social, Houmt Souk, Djerba, Tunisie</span>
              </li>
              <li>
                <a
                  href="tel:+21626833101"
                  className="flex items-center gap-2 hover:text-cobam-water-blue transition-colors"
                >
                  <Phone size={14} className="text-cobam-water-blue flex-shrink-0" />
                  +216 26 833 101
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@cobamgroup.com"
                  className="flex items-center gap-2 hover:text-cobam-water-blue transition-colors"
                >
                  <Mail size={14} className="text-cobam-water-blue flex-shrink-0" />
                  contact@cobamgroup.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} COBAM GROUP. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
