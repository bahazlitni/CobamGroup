"use client";

import { COBAM_CONTACT_DETAILS } from "@/data/contact-details";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const WHATSAPP_NUMBER = COBAM_CONTACT_DETAILS.canonicalPhoneWhatsapp;

export function WhatsAppPopup() {
  const [open, setOpen] = useState(false);

  const message = encodeURIComponent(
    "Bonjour COBAM Group, je souhaite obtenir plus d'informations."
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="mb-4 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-green-600 px-5 py-4 text-white">
              <div>
                <p className="font-semibold">COBAM Group</p>
                <p className="text-sm text-white/80">
                  Discussion WhatsApp
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-full p-1 transition hover:bg-white/15"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5 text-sm text-cobam-carbon-grey">
              <div className="rounded-2xl bg-cobam-light-bg p-4">
                Bonjour 👋
                <br />
                Comment pouvons-nous vous aider aujourd’hui ?
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-full bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Démarrer la discussion
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Ouvrir WhatsApp"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow-xl transition hover:bg-green-700"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="size-7" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="size-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}