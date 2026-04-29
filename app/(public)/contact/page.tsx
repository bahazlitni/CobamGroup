import { Clock3, Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import StaticHighway from "@/components/ui/custom/StaticHighway";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import PublicContactForm from "@/components/public/forms/public-form";
import {
  COBAM_CONTACT_DETAILS,
  COBAM_OPENING_HOURS,
  COBAM_SOCIAL_LINKS,
  getPhoneHref,
  getWhatsAppHref,
} from "@/data/contact-details";
import { PremiumReveal } from "@/components/ui/custom/PremiumReveal";

const contactChannels = [
  {
    label: "E-mail",
    value: COBAM_CONTACT_DETAILS.email,
    href: `mailto:${COBAM_CONTACT_DETAILS.email}`,
    Icon: Mail,
  },
  {
    label: "WhatsApp",
    value: COBAM_CONTACT_DETAILS.whatsapp,
    href: getWhatsAppHref(COBAM_CONTACT_DETAILS.whatsapp),
    Icon: MessageCircle,
  },
  {
    label: "Tél fixe",
    value: COBAM_CONTACT_DETAILS.phoneFixed,
    href: getPhoneHref(COBAM_CONTACT_DETAILS.phoneFixed),
    Icon: Phone,
  },
];

export default function ContactPage() {
  return (
    <main className="relative text-cobam-dark-blue bg-white min-h-screen">
      <StaticHighway direction="right" />
      <section className="relative overflow-hidden bg-cobam-light-bg py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <PremiumReveal direction="up" blur>
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-cobam-carbon-grey">
                Contact
              </p>
              <h1
                className="mt-6 text-5xl font-light sm:text-6xl lg:text-7xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Parlez-nous de <br/> votre projet.
              </h1>
              <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-cobam-carbon-grey">
                Qu'il s'agisse de conseils en aménagement, de commandes spécifiques 
                ou d'un accompagnement personnalisé pour vos chantiers, nos experts 
                sont à votre écoute.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <AnimatedUIButton
                  href={`mailto:${COBAM_CONTACT_DETAILS.email}`}
                  size="xl"
                  variant="dark"
                  icon="arrow-right"
                >
                  Envoyer un message
                </AnimatedUIButton>
                <AnimatedUIButton
                  href={getWhatsAppHref(COBAM_CONTACT_DETAILS.whatsapp)}
                  size="xl"
                  variant="outline"
                  icon="arrow-right"
                >
                  Contacter via WhatsApp
                </AnimatedUIButton>
              </div>
            </div>
          </PremiumReveal>
        </div>
      </section>

      <section className="relative py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:px-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-12">
            
            <PremiumReveal direction="right" blur delay={0.3}>
              <h2 className="text-2xl font-normal flex items-center gap-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Horaires d'ouverture
              </h2>
              <div className="mt-6 space-y-3 rounded-lg border border-cobam-quill-grey/40 bg-cobam-light-bg p-6">
                {COBAM_OPENING_HOURS.map((slot) => (
                  <div
                    key={slot.label}
                    className="flex items-center justify-between border-b border-cobam-quill-grey/40 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-cobam-dark-blue/80">
                      {slot.label}
                    </span>
                    <span
                      className={`text-sm ${
                        slot.closed ? "text-cobam-carbon-grey" : "text-cobam-dark-blue font-semibold"
                      }`}
                    >
                      {slot.value}
                    </span>
                  </div>
                ))}
              </div>
            </PremiumReveal>
            
            <PremiumReveal direction="right" blur delay={0.1}>
              <h2 className="text-2xl font-normal" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Coordonnées
              </h2>
              <div className="mt-8 grid gap-4">
                {contactChannels.map(({ label, value, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={label === "WhatsApp" ? "_blank" : undefined}
                    rel={label === "WhatsApp" ? "noreferrer" : undefined}
                    className="group flex flex-col gap-2 rounded-lg border border-cobam-quill-grey/40 bg-cobam-light-bg p-6 transition-colors hover:border-cobam-water-blue/40 hover:bg-white"
                  >
                    <Icon className="h-5 w-5 text-cobam-water-blue transition-transform group-hover:scale-110" />
                    <div>
                      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-cobam-carbon-grey">
                        {label}
                      </p>
                      <p className="mt-1 text-base font-medium text-cobam-dark-blue">
                        {value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </PremiumReveal>

            <PremiumReveal direction="right" blur delay={0.2}>
              <h2 className="text-2xl font-normal" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Réseaux sociaux
              </h2>
              <div className="mt-6 flex flex-wrap gap-4">
                {COBAM_SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-cobam-quill-grey/40 bg-cobam-light-bg text-cobam-dark-blue transition-colors hover:border-cobam-water-blue hover:text-cobam-water-blue"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </PremiumReveal>
          </div>

          <PremiumReveal direction="up" blur delay={0.4}>
            <div className="rounded-3xl bg-cobam-light-bg p-8 shadow-sm sm:p-12">
              <PublicContactForm />
            </div>
          </PremiumReveal>
        </div>
      </section>
    </main>
  );
}
