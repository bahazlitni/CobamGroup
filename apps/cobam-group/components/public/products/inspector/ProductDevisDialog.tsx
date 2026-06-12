"use client";

import { useMemo, useState } from "react";
import PublicForm from "@/components/public/forms/public-form";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductDevisDialogProps {
  productName: string;
  sku: string;
  triggerLabel?: string;
  title?: string;
  description?: string;
  submitText?: string;
}

export default function ProductDevisDialog({
  productName,
  sku,
  triggerLabel = "Demander un devis",
  title = "Demande de devis produit",
  description = "Le produit est deja renseigne. Ajoutez vos coordonnees pour recevoir un devis ou un retour de notre equipe.",
  submitText = "Envoyer la demande de devis",
}: ProductDevisDialogProps) {
  const [open, setOpen] = useState(false);
  const subject = `${productName} (SKU: ${sku})`;
  const initialValues = useMemo(() => ({ subject }), [subject]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatedUIButton
        size="lg"
        variant="secondary"
        type="button"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </AnimatedUIButton>

      <DialogContent className="max-h-[92vh] w-[min(94vw,760px)] overflow-y-auto rounded-[1.5rem] p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-6 pr-16">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="px-12 pb-6 pt-5">
          <PublicForm
            noHeader
            type="devis"
            title={title}
            submitText={submitText}
            submittingText="Envoi en cours..."
            initialValues={initialValues}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
