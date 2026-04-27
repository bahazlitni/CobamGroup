"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import FormError from "@/components/ui/custom/FormError";
import FormField from "@/components/ui/custom/FormField";
import FormLabel from "@/components/ui/custom/FormLabel";
import {
  FORM_INITIAL_STATE,
  type FormErrors,
  type FormState,
  type FormType,
  formatRequireLabel,
  getPublicFormConfig,
  isValidContactName,
  validateForm,
} from "@/lib/api/public-form/utils";

export interface PublicFormProps {
  type?: FormType;
  title?: string;
  submitText?: string;
  submittingText?: string;
  initialValues?: Partial<FormState>;
  noHeader?: boolean
}

export default function PublicForm({
  type = "contact",
  title,
  submitText,
  submittingText,
  initialValues,
  noHeader=false,
}: PublicFormProps) {
  const initialFormState = useMemo<FormState>(
    () => ({
      ...FORM_INITIAL_STATE,
      ...initialValues,
    }),
    [
      initialValues?.firstName,
      initialValues?.lastName,
      initialValues?.email,
      initialValues?.phone,
      initialValues?.subject,
      initialValues?.message,
    ],
  );
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = getPublicFormConfig(type);
  const rules = config.rules;
  const resolvedTitle =
    title ?? (type === "devis" ? "Demande de devis" : "Nous contacter");
  const resolvedSubmitText =
    submitText ??
    (type === "devis" ? "Envoyer la demande" : "Envoyer le message");
  const resolvedSubmittingText = submittingText ?? "Envoi en cours...";

  useEffect(() => {
    setForm(initialFormState);
    setErrors({});
    setStatusMessage(null);
  }, [initialFormState]);

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

  function handleChange<T extends HTMLInputElement | HTMLTextAreaElement>(
    event: React.ChangeEvent<T>,
  ) {
    const { name, value } = event.target;
    setField(name as keyof FormState, value);
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const nextValue = value
      .split("")
      .filter((char) => isValidContactName(char) || char.trim() === "")
      .join("");

    setField(name as "firstName" | "lastName", nextValue);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validateForm(form, rules);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("Veuillez corriger les champs indiques.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);

      const response = await fetch("/api/public-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          firstName: rules.HAS_FIRSTNAME ? form.firstName.trim() : "",
          lastName: rules.HAS_LASTNAME ? form.lastName.trim() : "",
          email: rules.HAS_EMAIL ? form.email.trim() : "",
          phone: rules.HAS_PHONE ? form.phone.trim() : "",
          subject: rules.HAS_SUBJECT ? form.subject.trim() : "",
          message: rules.HAS_MESSAGE ? form.message.trim() : "",
          website: "",
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Erreur lors de l'envoi du message.",
        );
      }

      setForm(initialFormState);
      setErrors({});
      setStatusMessage(
        typeof payload?.message === "string"
          ? payload.message
          : config.successMessage,
      );
    } catch (error) {
      console.error(error);
      setStatusMessage(config.failureMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      {noHeader ? null : <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cobam-water-blue">
          Formulaire
        </p>
        <h2
          className="mb-8 text-3xl font-light"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {resolvedTitle}
        </h2>
      </div>}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-8 sm:grid-cols-2">
          {rules.HAS_FIRSTNAME ? (
            <FormField
              label={formatRequireLabel("Prénom", rules.FIRSTNAME_REQUIRED)}
              name="firstName"
              value={form.firstName}
              onChange={handleNameChange}
              required={rules.FIRSTNAME_REQUIRED}
              disabled={isSubmitting || rules.IS_DISABLED_FIRSTNAME}
              maxLength={rules.MAX_FIRSTNAME}
              autoComplete="given-name"
              error={errors.firstName}
            />
          ) : null}

          {rules.HAS_LASTNAME ? (
            <FormField
              label={formatRequireLabel("Nom", rules.LASTNAME_REQUIRED)}
              name="lastName"
              value={form.lastName}
              onChange={handleNameChange}
              required={rules.LASTNAME_REQUIRED}
              disabled={isSubmitting || rules.IS_DISABLED_LASTNAME}
              maxLength={rules.MAX_LASTNAME}
              autoComplete="family-name"
              error={errors.lastName}
            />
          ) : null}
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {rules.HAS_EMAIL ? (
            <FormField
              label={formatRequireLabel("E-mail", rules.EMAIL_REQUIRED)}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required={rules.EMAIL_REQUIRED}
              disabled={isSubmitting || rules.IS_DISABLED_EMAIL}
              maxLength={rules.MAX_EMAIL}
              autoComplete="email"
              error={errors.email}
            />
          ) : null}

          {rules.HAS_PHONE ? (
            <FormField
              type="phone"
              label={formatRequireLabel("Téléphone", rules.PHONE_REQUIRED)}
              name="phone"
              value={form.phone}
              onChange={(value: unknown) =>
                setField("phone", typeof value === "string" ? value : "")
              }
              required={rules.PHONE_REQUIRED}
              disabled={isSubmitting || rules.IS_DISABLED_PHONE}
              error={errors.phone}
            />
          ) : null}
        </div>

        {rules.HAS_SUBJECT ? (
          <FormField
            label={formatRequireLabel("Sujet", rules.SUBJECT_REQUIRED)}
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required={rules.SUBJECT_REQUIRED}
            disabled={isSubmitting || rules.IS_DISABLED_SUBJECT}
            maxLength={rules.MAX_SUBJECT}
            error={errors.subject}
          />
        ) : null}

        {rules.HAS_MESSAGE ? (
          <div>
            <FormLabel htmlFor="message">
              {formatRequireLabel("Message", rules.MESSAGE_REQUIRED)}
            </FormLabel>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={form.message}
              onChange={handleChange}
              required={rules.MESSAGE_REQUIRED}
              maxLength={rules.MAX_MESSAGE}
              disabled={isSubmitting || rules.IS_DISABLED_MESSAGE}
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
              placeholder="Decrivez votre besoin..."
            />
            <FormError id="message-error" message={errors.message} />
          </div>
        ) : null}

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
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? resolvedSubmittingText : resolvedSubmitText}
            </span>
          </AnimatedUIButton>
        </div>
      </form>
    </div>
  );
}
