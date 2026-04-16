"use client";

import { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Loader2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import {
  EMAIL_REQUIRED,
  FIRSTNAME_REQUIRED,
  isValidContactName,
  LASTNAME_REQUIRED,
  MAX_EMAIL,
  MAX_FIRSTNAME,
  MAX_LASTNAME,
  MAX_MESSAGE,
  MAX_PHONE,
  MAX_SUBJECT,
  MESSAGE_REQUIRED,
  PHONE_REQUIRED,
  SUBJECT_REQUIRED,
} from "@/lib/api/contact/rules";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const subject = form.subject.trim();
  const message = form.message.trim();

  if (FIRSTNAME_REQUIRED && !firstName) {
    errors.firstName = "Le prénom est obligatoire.";
  } else if (firstName && !isValidContactName(firstName)) {
    errors.firstName = "Le prénom doit contenir uniquement des lettres.";
  }

  if (LASTNAME_REQUIRED && !lastName) {
    errors.lastName = "Le nom est obligatoire.";
  } else if (lastName && !isValidContactName(lastName)) {
    errors.lastName = "Le nom doit contenir uniquement des lettres.";
  }

  if (EMAIL_REQUIRED && !email) {
    errors.email = "L'e-mail est obligatoire.";
  } else if (email && !emailPattern.test(email)) {
    errors.email = "Entrez une adresse e-mail valide.";
  }

  if (PHONE_REQUIRED && !phone) {
    errors.phone = "Le telephone est obligatoire.";
  } else if (phone && !isValidPhoneNumber(phone)) {
    errors.phone = "Entrez un numero de telephone valide.";
  }

  if (SUBJECT_REQUIRED && !subject) {
    errors.subject = "Le sujet est obligatoire.";
  }

  if (MESSAGE_REQUIRED && !message) {
    errors.message = "Le message est obligatoire.";
  }

  return errors;
}

export default function PublicContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof FormState>(name: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];
      return next;
    });
    setStatusMessage(null);
  }

  function handleChange<
    T extends HTMLInputElement | HTMLTextAreaElement,
  >(e: React.ChangeEvent<T>) {
    const { name, value } = e.target;
    setField(name as keyof FormState, value);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const nextValue = value
      .split("")
      .filter((char) => isValidContactName(char) || char.trim() === "")
      .join("");

    setField(name as "firstName" | "lastName", nextValue);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("Veuillez corriger les champs indiqués.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'envoi du message.");
      }

      setForm(initialState);
      setErrors({});
      setStatusMessage("Votre message a bien été envoyé.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Impossible d'envoyer le message pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cobam-water-blue">
          Formulaire
        </p>
        <h2 className="text-3xl font-light mb-8" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Envoyez-nous un message
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prénom*"
            name="firstName"
            value={form.firstName}
            onChange={handleNameChange}
            required={FIRSTNAME_REQUIRED}
            disabled={isSubmitting}
            maxLength={MAX_FIRSTNAME}
            autoComplete="given-name"
            error={errors.firstName}
          />
          <Field
            label="Nom*"
            name="lastName"
            value={form.lastName}
            onChange={handleNameChange}
            required={LASTNAME_REQUIRED}
            disabled={isSubmitting}
            maxLength={MAX_LASTNAME}
            autoComplete="family-name"
            error={errors.lastName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="E-mail*"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required={EMAIL_REQUIRED}
            disabled={isSubmitting}
            maxLength={MAX_EMAIL}
            autoComplete="email"
            error={errors.email}
          />
          <PhoneField
            label="Telephone"
            value={form.phone}
            onChange={(value) => setField("phone", value ?? "")}
            required={PHONE_REQUIRED}
            disabled={isSubmitting}
            error={errors.phone}
          />
        </div>

        <Field
          label="Sujet*"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required={SUBJECT_REQUIRED}
          disabled={isSubmitting}
          maxLength={MAX_SUBJECT}
          error={errors.subject}
        />

        <div>
          <CustomLabel htmlFor="message">Message</CustomLabel>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={form.message}
            onChange={handleChange}
            required={MESSAGE_REQUIRED}
            maxLength={MAX_MESSAGE}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className="
              w-full border-b border-cobam-quill-grey/60
              bg-transparent py-3 text-base text-[#14202e]
              outline-none transition-colors
              placeholder:text-[#5e5e5e]/50
              focus:border-[#0a8dc1]
              disabled:cursor-not-allowed disabled:opacity-60
            "
            placeholder="Décrivez votre besoin..."
          />
          <FieldError id="message-error" message={errors.message} />
        </div>

        {statusMessage ? (
          <p className="text-sm font-medium text-cobam-dark-blue">
            {statusMessage}
          </p>
        ) : null}

        <div className="flex justify-end">
          <AnimatedUIButton
            type="submit"
            size="lg"
            variant="secondary"
            icon={isSubmitting ? "none" : "paper-plane"}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <span className="inline-flex items-center gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Envoi en cours..." : "Envoyer"}
            </span>
          </AnimatedUIButton>
        </div>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  autoComplete?: string;
  error?: string;
};

function CustomLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-cobam-dark-blue">
      {children}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  maxLength,
  autoComplete,
  error,
}: FieldProps) {
  const errorId = `${name}-error`;

  return (
    <div>
      <CustomLabel htmlFor={name}>{label}</CustomLabel>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="
          w-full border-b border-cobam-quill-grey/60
          bg-transparent py-2 text-base text-[#14202e]
          outline-none transition-colors
          placeholder:text-[#5e5e5e]/50
          focus:border-[#0a8dc1]
          disabled:cursor-not-allowed disabled:opacity-60
        "
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function PhoneField({
  label,
  value,
  onChange,
  required,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
  required: boolean;
  disabled: boolean;
  error?: string;
}) {
  return (
    <div>
      <CustomLabel htmlFor="phone">{label}</CustomLabel>
      <PhoneInput
        id="phone"
        name="phone"
        international
        defaultCountry="TN"
        countryCallingCodeEditable={false}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={MAX_PHONE}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "phone-error" : undefined}
        className="
          public-contact-phone-input
          border-b border-cobam-quill-grey/60 py-2 text-base
          transition-colors focus-within:border-[#0a8dc1]
        "
      />
      <FieldError id="phone-error" message={error} />
    </div>
  );
}
