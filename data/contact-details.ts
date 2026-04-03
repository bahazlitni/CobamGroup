import { FaFacebook, FaInstagram, FaLinkedin, FaPinterest, FaTiktok, FaYoutube } from "react-icons/fa";

export const COBAM_CONTACT_DETAILS = {
  email: "contact@cobamgroup.com",
  whatsapp: "+216 26833110",
  phoneFixed: "+216 75731731",
  phoneMobile: "+216 26833110",
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
    label: "Instagram",
    href: "https://www.instagram.com/cobamgroup/",
    handle: "@cobamgroup",
    Icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/cobamgrp",
    handle: "cobamgrp",
    Icon: FaFacebook,
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/cobamgroup/",
    handle: "cobamgroup",
    Icon: FaPinterest,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cobam-group/",
    handle: "cobam-group",
    Icon: FaLinkedin,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@cobam.group",
    handle: "@cobam.group",
    Icon: FaTiktok,
  },
] as const;

export function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function getWhatsAppHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
