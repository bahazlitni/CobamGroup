"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function PublicContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<
    T extends HTMLInputElement | HTMLTextAreaElement
  >(e: React.ChangeEvent<T>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // TODO: remplace par ton vrai endpoint
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'envoi du message.");
      }

      setForm(initialState);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border border-cobam-quill-grey/45 rounded-lg bg-white p-6 sm:p-8 shadow-md">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cobam-water-blue">
          Formulaire
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-cobam-dark-blue">
          Écrivez-nous
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prénom*"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Field
            label="Nom*"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="E-mail*"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Field
            label="Téléphone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <Field
          label="Sujet*"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />

        <div className="flex flex-col gap-2">
          <CustomLabel htmlFor="message">
            Message
          </CustomLabel>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={form.message}
            onChange={handleChange}
            disabled={isSubmitting}
            className="
              w-full rounded-md border border-cobam-dark-blue/20
              bg-white px-4 py-3 text-sm text-cobam-dark-blue
              outline-none transition-colors
              placeholder:text-cobam-carbon-grey/70
              focus:border-cobam-water-blue
              focus:ring-2 focus:ring-cobam-water-blue/15
              disabled:cursor-not-allowed disabled:opacity-60
            "
            placeholder="Décrivez votre besoin..."
          />
        </div>

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
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
};

function CustomLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) { 
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold text-cobam-dark-blue"
    >
      {children}
    </label>
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
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <CustomLabel htmlFor={name}>
        {label}
      </CustomLabel>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="
          h-10 w-full rounded-md border border-cobam-dark-blue/20
          bg-white px-4 text-sm text-cobam-dark-blue
          outline-none transition-colors
          placeholder:text-cobam-carbon-grey/70
          focus:border-cobam-water-blue
          focus:ring-2 focus:ring-cobam-water-blue/15
          disabled:cursor-not-allowed disabled:opacity-60
        "
      />
    </div>
  );
}