import { Clock3, Mail, MessageCircle, Phone } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import PublicContactForm from "@/components/public/contact/public-contact-form";
import {
  COBAM_CONTACT_DETAILS,
  COBAM_OPENING_HOURS,
  COBAM_SOCIAL_LINKS,
  getPhoneHref,
  getWhatsAppHref,
} from "@/data/contact-details";

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
  {
    label: "Tél mobile",
    value: COBAM_CONTACT_DETAILS.phoneMobile,
    href: getPhoneHref(COBAM_CONTACT_DETAILS.phoneMobile),
    Icon: Phone,
  },
];

export default function ContactPage() {
  return (
    <main className="text-cobam-dark-blue">
      <section className="border-b border-cobam-quill-grey/45">
        <div className="border-cobam-quill-grey/45 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cobam-water-blue">
              Contact
            </p>
            <h1
              className="mt-4 text-4xl font-semibold sm:text-5xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Toujours à votre service.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-cobam-carbon-grey">
              E-mail, téléphone ou WhatsApp. Choisissez le moyen qui vous convient.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AnimatedUIButton
                href={`mailto:${COBAM_CONTACT_DETAILS.email}`}
                size="lg"
                variant="primary"
                icon="arrow-right"
              >
                Envoyer un e-mail
              </AnimatedUIButton>
              <AnimatedUIButton
                href={getWhatsAppHref(COBAM_CONTACT_DETAILS.whatsapp)}
                size="lg"
                variant="outline"
                icon="arrow-right"
              >
                Ouvrir WhatsApp
              </AnimatedUIButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cobam-light-bg">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
          <div className="space-y-6">
            <div className="border border-cobam-quill-grey/45 rounded-lg bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-cobam-dark-blue">
                Coordonnées
              </h2>
              <div className="mt-5 space-y-3">
                {contactChannels.map(({ label, value, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={label === "WhatsApp" ? "_blank" : undefined}
                    rel={label === "WhatsApp" ? "noreferrer" : undefined}
                    className="flex items-start gap-3 rounded-lg border border-cobam-dark-blue/20 px-4 py-4 transition-colors hover:border-cobam-water-blue/40"
                  >
                    <div className="rounded-xl bg-cobam-light-bg p-2 text-cobam-water-blue">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-cobam-carbon-grey">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-cobam-dark-blue">
                        {value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="border border-cobam-quill-grey/45 rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center gap-3 ">
                <div className="rounded-xl bg-cobam-light-bg p-2 text-cobam-water-blue">
                  <Clock3 className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-cobam-dark-blue">
                  Horaires
                </h2>
              </div>
              <div className="mt-5 space-y-3">
                {COBAM_OPENING_HOURS.map((slot) => (
                  <div
                    key={slot.label}
                    className="flex items-center justify-between rounded-lg border border-cobam-dark-blue/20 px-4 py-3"
                  >
                    <span className="text-sm text-cobam-dark-blue">
                      {slot.label}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        slot.closed ? "text-cobam-carbon-grey" : "text-cobam-dark-blue"
                      }`}
                    >
                      {slot.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-cobam-quill-grey/45 rounded-lg bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-cobam-dark-blue">
                Réseaux sociaux
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {COBAM_SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-cobam-dark-blue/20 text-cobam-dark-blue transition-colors hover:border-cobam-water-blue/35 hover:text-cobam-water-blue"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <PublicContactForm />
        </div>
      </section>
    </main>
  );
}
