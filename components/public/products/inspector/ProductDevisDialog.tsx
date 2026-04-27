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
}

export default function ProductDevisDialog({
  productName,
  sku,
}: ProductDevisDialogProps) {
  const [open, setOpen] = useState(false);
  const subject = `${productName} (SKU: ${sku})`;
  const initialValues = useMemo(() => ({ subject }), [subject]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatedUIButton
        size="md"
        variant="outline"
        type="button"
        onClick={() => setOpen(true)}
      >
        Demander
      </AnimatedUIButton>

      <DialogContent className="max-h-[92vh] w-[min(94vw,760px)] overflow-y-auto rounded-[1.5rem] p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-6 pr-16">
          <DialogTitle>Demande de devis</DialogTitle>
          <DialogDescription>
            Le produit est déjà renseigné. Ajoutez vos coordonnées pour recevoir
            un retour de notre équipe.
          </DialogDescription>
        </DialogHeader>

        <div className="px-12 pb-6 pt-5">
          <PublicForm
            noHeader
            type="devis"
            title="Demande de devis"
            submitText="Envoyer la demande"
            submittingText="Envoi en cours..."
            initialValues={initialValues}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
