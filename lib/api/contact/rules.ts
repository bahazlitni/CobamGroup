export const MAX_FIRSTNAME = 64;
export const MAX_LASTNAME  = 64;
export const MAX_EMAIL     = 256;
export const MAX_PHONE     = 32;
export const MAX_SUBJECT   = 256;
export const MAX_MESSAGE   = 1024;

export const FIRSTNAME_REQUIRED = true;
export const LASTNAME_REQUIRED  = true;
export const EMAIL_REQUIRED     = true;
export const PHONE_REQUIRED     = false;
export const SUBJECT_REQUIRED   = true;
export const MESSAGE_REQUIRED   = false;

export const CONTACT_NAME_PATTERN = /^[\p{L}\p{M}' -]+$/u;

export function isValidContactName(value: string) {
  return CONTACT_NAME_PATTERN.test(value.trim());
}
