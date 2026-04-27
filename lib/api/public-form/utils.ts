import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type FormErrors = Partial<Record<keyof FormState, string>>;

export const FORM_TYPES = ["devis", "contact"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export type FormRules = {
  MAX_FIRSTNAME: number;
  MAX_LASTNAME: number;
  MAX_EMAIL: number;
  MAX_SUBJECT: number;
  MAX_MESSAGE: number;
  FIRSTNAME_REQUIRED: boolean;
  LASTNAME_REQUIRED: boolean;
  EMAIL_REQUIRED: boolean;
  PHONE_REQUIRED: boolean;
  SUBJECT_REQUIRED: boolean;
  MESSAGE_REQUIRED: boolean;
  HAS_FIRSTNAME: boolean;
  HAS_LASTNAME: boolean;
  HAS_PHONE: boolean;
  HAS_EMAIL: boolean;
  HAS_SUBJECT: boolean;
  HAS_MESSAGE: boolean;
  IS_DISABLED_FIRSTNAME: boolean;
  IS_DISABLED_LASTNAME: boolean;
  IS_DISABLED_PHONE: boolean;
  IS_DISABLED_EMAIL: boolean;
  IS_DISABLED_SUBJECT: boolean;
  IS_DISABLED_MESSAGE: boolean;
};

export type PublicFormConfig = {
  type: FormType;
  rules: FormRules;
  toEmailEnv: string;
  fromEmailEnv: string;
  fromNameEnv: string;
  defaultFromName: string;
  staffSubjectPrefix: string;
  staffTitle: string;
  acknowledgementSubjectPrefix: string;
  acknowledgementIntro: string;
  successMessage: string;
  failureMessage: string;
};

export const FORM_INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_NAME_PATTERN = /^[\p{L}\p{M}' -]+$/u;

export const DEVIS_RULES: FormRules = {
  MAX_FIRSTNAME: 64,
  MAX_LASTNAME: 64,
  MAX_EMAIL: 256,
  MAX_SUBJECT: 256,
  MAX_MESSAGE: 1024,
  FIRSTNAME_REQUIRED: true,
  LASTNAME_REQUIRED: true,
  PHONE_REQUIRED: true,
  EMAIL_REQUIRED: false,
  SUBJECT_REQUIRED: true,
  MESSAGE_REQUIRED: false,
  HAS_FIRSTNAME: true,
  HAS_LASTNAME: true,
  HAS_PHONE: true,
  HAS_EMAIL: true,
  HAS_SUBJECT: true,
  HAS_MESSAGE: true,
  IS_DISABLED_FIRSTNAME: false,
  IS_DISABLED_LASTNAME: false,
  IS_DISABLED_PHONE: false,
  IS_DISABLED_EMAIL: false,
  IS_DISABLED_SUBJECT: true,
  IS_DISABLED_MESSAGE: false,
};

export const CONTACT_RULES: FormRules = {
  MAX_FIRSTNAME: 64,
  MAX_LASTNAME: 64,
  MAX_EMAIL: 256,
  MAX_SUBJECT: 256,
  MAX_MESSAGE: 1024,
  FIRSTNAME_REQUIRED: true,
  LASTNAME_REQUIRED: true,
  EMAIL_REQUIRED: false,
  PHONE_REQUIRED: true,
  SUBJECT_REQUIRED: true,
  MESSAGE_REQUIRED: false,
  HAS_FIRSTNAME: true,
  HAS_LASTNAME: true,
  HAS_PHONE: true,
  HAS_EMAIL: true,
  HAS_SUBJECT: true,
  HAS_MESSAGE: true,
  IS_DISABLED_FIRSTNAME: false,
  IS_DISABLED_LASTNAME: false,
  IS_DISABLED_PHONE: false,
  IS_DISABLED_EMAIL: false,
  IS_DISABLED_SUBJECT: false,
  IS_DISABLED_MESSAGE: false,
};

export const PUBLIC_FORM_CONFIGS = {
  contact: {
    type: "contact",
    rules: CONTACT_RULES,
    toEmailEnv: "CONTACT_TO_EMAIL",
    fromEmailEnv: "CONTACT_FROM_EMAIL",
    fromNameEnv: "CONTACT_FROM_NAME",
    defaultFromName: "Contact | Cobam Group",
    staffSubjectPrefix: "Contact",
    staffTitle: "Nouvelle soumission du formulaire de contact",
    acknowledgementSubjectPrefix: "Accusé de réception",
    acknowledgementIntro:
      "Nous avons bien reçu votre message et vous remercions d’avoir contacté COBAM GROUP.",
    successMessage: "Votre message a bien été envoyé.",
    failureMessage: "Impossible d’envoyer le message pour le moment.",
  },
  devis: {
    type: "devis",
    rules: DEVIS_RULES,
    toEmailEnv: "DEVIS_TO_EMAIL",
    fromEmailEnv: "DEVIS_FROM_EMAIL",
    fromNameEnv: "DEVIS_FROM_NAME",
    defaultFromName: "Devis | Cobam Group",
    staffSubjectPrefix: "Devis",
    staffTitle: "Nouvelle demande de devis",
    acknowledgementSubjectPrefix: "Accusé de réception de votre demande de devis",
    acknowledgementIntro:
      "Nous avons bien reçu votre demande de devis et vous remercions d’avoir contacté COBAM GROUP.",
    successMessage: "Votre demande de devis a bien été envoyée.",
    failureMessage: "Impossible d’envoyer la demande de devis pour le moment.",
  },
} satisfies Record<FormType, PublicFormConfig>;

export function getPublicFormConfig(type: FormType) {
  return PUBLIC_FORM_CONFIGS[type];
}

export function isValidContactName(value: string) {
  return CONTACT_NAME_PATTERN.test(value.trim());
}

export function formatRequireLabel(name: string, required: boolean) {
  return name + (required ? "*" : "");
}

export function validateForm(form: FormState, rules: FormRules): FormErrors {
  const errors: FormErrors = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const subject = form.subject.trim();
  const message = form.message.trim();

  if (rules.HAS_FIRSTNAME && rules.FIRSTNAME_REQUIRED && !firstName) {
    errors.firstName = "Le prenom est obligatoire.";
  } else if (rules.HAS_FIRSTNAME && firstName && !isValidContactName(firstName)) {
    errors.firstName = "Le prenom doit contenir uniquement des lettres.";
  }

  if (rules.HAS_LASTNAME && rules.LASTNAME_REQUIRED && !lastName) {
    errors.lastName = "Le nom est obligatoire.";
  } else if (rules.HAS_LASTNAME && lastName && !isValidContactName(lastName)) {
    errors.lastName = "Le nom doit contenir uniquement des lettres.";
  }

  if (rules.HAS_EMAIL && rules.EMAIL_REQUIRED && !email) {
    errors.email = "L'e-mail est obligatoire.";
  } else if (rules.HAS_EMAIL && email && !emailPattern.test(email)) {
    errors.email = "Entrez une adresse e-mail valide.";
  }

  if (rules.HAS_PHONE && rules.PHONE_REQUIRED && !phone) {
    errors.phone = "Le téléphone est obligatoire.";
  } else if (rules.HAS_PHONE && phone && !isValidPhoneNumber(phone)) {
    errors.phone = "Entrez un numero de téléphone valide.";
  }

  if (rules.HAS_SUBJECT && rules.SUBJECT_REQUIRED && !subject) {
    errors.subject = "Le sujet est obligatoire.";
  }

  if (rules.HAS_MESSAGE && rules.MESSAGE_REQUIRED && !message) {
    errors.message = "Le message est obligatoire.";
  }

  return errors;
}

function optionalStringSchema(max: number, required: boolean, fieldName: string) {
  return z
    .string()
    .trim()
    .max(max, `${fieldName} is too long`)
    .refine((value) => !required || value.length > 0, {
      message: `${fieldName} is required`,
    });
}

function nameSchema(fieldName: string, max: number, required: boolean) {
  return optionalStringSchema(max, required, fieldName).refine(
    (value) => value.length === 0 || isValidContactName(value),
    {
      message: `${fieldName} must contain letters only`,
    },
  );
}

function emailSchema(max: number, required: boolean) {
  return optionalStringSchema(max, required, "Email").refine(
    (value) => value.length === 0 || emailPattern.test(value),
    {
      message: "Email must be valid",
    },
  );
}

function phoneSchema(required: boolean) {
  return z
    .string()
    .trim()
    .max(32, "Phone is too long")
    .refine((value) => !required || value.length > 0, {
      message: "Phone is required",
    })
    .refine((value) => value.length === 0 || isValidPhoneNumber(value), {
      message: "Phone must be a valid international phone number",
    });
}

export function buildSchema(formRules: FormRules) {
  const shape: Record<string, z.ZodTypeAny> = {
    type: z.enum(FORM_TYPES),
    website: z.string().optional(),
  };

  if (formRules.HAS_FIRSTNAME) {
    shape.firstName = nameSchema(
      "Firstname",
      formRules.MAX_FIRSTNAME,
      formRules.FIRSTNAME_REQUIRED,
    );
  }

  if (formRules.HAS_LASTNAME) {
    shape.lastName = nameSchema(
      "Lastname",
      formRules.MAX_LASTNAME,
      formRules.LASTNAME_REQUIRED,
    );
  }

  if (formRules.HAS_EMAIL) {
    shape.email = emailSchema(formRules.MAX_EMAIL, formRules.EMAIL_REQUIRED);
  }

  if (formRules.HAS_PHONE) {
    shape.phone = phoneSchema(formRules.PHONE_REQUIRED);
  }

  if (formRules.HAS_SUBJECT) {
    shape.subject = optionalStringSchema(
      formRules.MAX_SUBJECT,
      formRules.SUBJECT_REQUIRED,
      "Subject",
    );
  }

  if (formRules.HAS_MESSAGE) {
    shape.message = optionalStringSchema(
      formRules.MAX_MESSAGE,
      formRules.MESSAGE_REQUIRED,
      "Message",
    );
  }

  return z.object(shape);
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
