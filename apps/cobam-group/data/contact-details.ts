import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import {
  COBAM_CONTACT_DETAILS,
  COBAM_OPENING_HOURS,
  COBAM_SOCIAL_LINKS as COBAM_SOCIAL_LINK_DATA,
  getPhoneHref,
  getWhatsAppHref,
} from "@cobam/shared/contact";

export { COBAM_CONTACT_DETAILS, COBAM_OPENING_HOURS, getPhoneHref, getWhatsAppHref };

const SOCIAL_ICONS = {
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  Youtube: FaYoutube,
  LinkedIn: FaLinkedin,
  TikTok: FaTiktok,
  Pinterest: FaPinterest,
} as const;

export const COBAM_SOCIAL_LINKS = COBAM_SOCIAL_LINK_DATA.map((social) => ({
  ...social,
  Icon: SOCIAL_ICONS[social.label],
}));
