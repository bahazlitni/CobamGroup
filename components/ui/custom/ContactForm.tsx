"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Linkedin } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Siège Social",
    details: ["Houmt Souk, Djerba", "Médenine, Tunisie"],
  },
  {
    icon: Phone,
    title: "Téléphone",
    details: ["+216 26 833 101", "+216 75 650 000"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["contact@cobamgroup.com", "devis@cobamgroup.com"],
  },
  {
    icon: Clock,
    title: "Horaires d'ouverture",
    details: ["Lundi - Samedi : 08h00 - 18h00", "Dimanche : Fermé"],
  },
];

const socials = [
  { icon: Facebook, href: "https://facebook.com/cobamgrp", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/cobamgroup/", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/cobam-group/", label: "LinkedIn" },
];

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  return (
    <section id="contact" className="relative py-24 bg-cobam-light-bg">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-cobam-water-blue font-bold tracking-[0.25em] text-sm uppercase mb-3">
            Contactez-nous
          </p>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-cobam-dark-blue mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Discutons de votre projet
          </h2>
          <p className="text-cobam-carbon-grey text-lg">
            Notre équipe d'experts est à votre disposition pour vous accompagner et répondre à toutes vos questions.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-0 lg:shadow-xl lg:rounded-[2.5rem] overflow-hidden border border-gray-100/50">
          
          {/* LEFT COLUMN: Contact Info (Solid Dark Blue) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 relative bg-cobam-dark-blue text-white p-10 sm:p-12 lg:p-14 rounded-3xl lg:rounded-none lg:rounded-l-[2.5rem]"
          >
            <div className="relative z-10 h-full flex flex-col">
              <h3 className="text-2xl font-bold mb-10" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Informations
              </h3>

              <div className="flex flex-col gap-8 flex-1">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 transition-colors duration-300 group-hover:bg-cobam-water-blue group-hover:border-cobam-water-blue">
                      <info.icon className="w-5 h-5 text-cobam-water-blue group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/90 text-sm tracking-wider uppercase mb-1.5">
                        {info.title}
                      </h4>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-cobam-quill-grey text-sm leading-relaxed">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-sm text-cobam-quill-grey mb-4 font-medium">Suivez-nous sur les réseaux</p>
                <div className="flex items-center gap-4">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-cobam-water-blue hover:text-white transition-all duration-300 hover:-translate-y-1"
                    >
                      <social.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Contact Form (Solid White) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 bg-white p-10 sm:p-12 lg:p-16 rounded-3xl lg:rounded-none lg:rounded-r-[2.5rem] shadow-sm lg:shadow-none border border-gray-100 lg:border-none"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-semibold text-cobam-dark-blue">
                    Prénom <span className="text-cobam-water-blue">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    className="w-full bg-cobam-light-bg border border-gray-200 text-cobam-dark-blue text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/50 focus:border-cobam-water-blue transition-all"
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-semibold text-cobam-dark-blue">
                    Nom <span className="text-cobam-water-blue">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    className="w-full bg-cobam-light-bg border border-gray-200 text-cobam-dark-blue text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/50 focus:border-cobam-water-blue transition-all"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-cobam-dark-blue">
                    Email <span className="text-cobam-water-blue">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full bg-cobam-light-bg border border-gray-200 text-cobam-dark-blue text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/50 focus:border-cobam-water-blue transition-all"
                    placeholder="exemple@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-cobam-dark-blue">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full bg-cobam-light-bg border border-gray-200 text-cobam-dark-blue text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/50 focus:border-cobam-water-blue transition-all"
                    placeholder="+216 00 000 000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-cobam-dark-blue">
                  Sujet de votre demande <span className="text-cobam-water-blue">*</span>
                </label>
                <select
                  id="subject"
                  required
                  defaultValue=""
                  className="w-full bg-cobam-light-bg border border-gray-200 text-cobam-dark-blue text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/50 focus:border-cobam-water-blue transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%235e5e5e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="devis">Demande de devis</option>
                  <option value="information">Information produit</option>
                  <option value="partenariat">Devenir partenaire</option>
                  <option value="recrutement">Recrutement</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-cobam-dark-blue">
                  Message <span className="text-cobam-water-blue">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="w-full bg-cobam-light-bg border border-gray-200 text-cobam-dark-blue text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/50 focus:border-cobam-water-blue transition-all resize-none"
                  placeholder="Décrivez votre projet ou votre demande..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cobam-dark-blue text-white font-bold text-sm px-8 py-4 rounded-xl overflow-hidden transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                <div className="absolute inset-0 bg-cobam-water-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10">
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </span>
                {!isSubmitting && (
                  <Send size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                )}
              </button>
              
              <p className="text-xs text-cobam-carbon-grey mt-2">
                En soumettant ce formulaire, vous acceptez que vos données soient traitées pour vous recontacter.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
