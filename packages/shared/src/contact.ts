export const COBAM_CONTACT_DETAILS = {
  email: "contact@cobamgroup.com",
  whatsapp: "+216 26833110",
  phoneFixed: "+216 75731731",
  phoneMobile: "+216 26833110",
  canonicalPhoneMobile: "21626833110",
  canonicalPhoneFixed: "21675731731",
  canonicalPhoneWhatsapp: "21626833110",
} as const;

export const COBAM_OPENING_HOURS = [
  {
    label: "Lundi - Samedi",
    value: "8h30 - 19h00",
    closed: false,
  },
  {
    label: "Dimanche",
    value: "Fermé",
    closed: true,
  },
] as const;

export const COBAM_SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/cobamgrp",
    handle: "cobamgrp",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/cobamgroup/",
    handle: "@cobamgroup",
  },
  {
    label: "Youtube",
    href: "https://www.youtube.com/@cobamgroup",
    handle: "@cobamgroup",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cobam-group/",
    handle: "cobam-group",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@cobam.group",
    handle: "@cobam.group",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/cobamgroup/",
    handle: "cobamgroup",
  },
] as const;

export function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function getWhatsAppHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function getMailtoHref({
  email = COBAM_CONTACT_DETAILS.email,
  subject,
  body,
}: {
  email?: string;
  subject?: string;
  body?: string;
} = {}) {
  const params = new URLSearchParams();

  if (subject) {
    params.set("subject", subject);
  }

  if (body) {
    params.set("body", body);
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}
