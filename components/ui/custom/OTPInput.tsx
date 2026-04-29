"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";

type OtpVisualState = "idle" | "error" | "success";

interface StaffOtpChallengeProps {
  email: string;
  length?: number;
  disabled?: boolean;
  loading?: boolean;
  visualState?: OtpVisualState;
  statusText?: string | null;
  onVerify: (code: string) => void | Promise<void>;
  onBack?: () => void;
  onResend?: () => void | Promise<void>;
  resending?: boolean;
  resendCooldownSeconds?: number;
  backLabel?: string;
  resendLabel?: string;
  resendLoadingText?: string;
}

export default function OTPInput({
  email,
  length = 6,
  disabled = false,
  loading = false,
  visualState = "idle",
  statusText,
  onVerify,
  onBack,
  onResend,
  resending = false,
  resendCooldownSeconds = 30,
  backLabel = "Retour",
  resendLabel = "Renvoyer le code",
  resendLoadingText = "Renvoi...",
}: StaffOtpChallengeProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [allSelected, setAllSelected] = useState(false);
  const [resendCooldownRemaining, setResendCooldownRemaining] = useState(
    () => Math.max(0, resendCooldownSeconds),
  );

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const code = useMemo(() => digits.join(""), [digits]);
  const isLocked = disabled || loading || resending;
  const isResendCoolingDown = resendCooldownRemaining > 0;

  useEffect(() => {
    setDigits(Array(length).fill(""));
    setFocusedIndex(0);
    setAllSelected(false);
    setResendCooldownRemaining(Math.max(0, resendCooldownSeconds));
  }, [length, email, resendCooldownSeconds]);

  useEffect(() => {
    if (resendCooldownRemaining <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldownRemaining]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setAllSelected(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const focusCell = (index: number) => {
    const safe = Math.max(0, Math.min(index, length - 1));
    inputsRef.current[safe]?.focus();
    setFocusedIndex(safe);
  };

  const findNextEmptyCell = (from: number, arr = digits) => {
    for (let i = from; i < length; i++) {
      if (!arr[i]) return i;
    }
    for (let i = 0; i < length; i++) {
      if (!arr[i]) return i;
    }
    return length - 1;
  };

  const resetSelection = () => {
    if (allSelected) setAllSelected(false);
  };

  const verifyIfComplete = async (nextDigits: string[]) => {
    if (!nextDigits.includes("")) {
      await onVerify(nextDigits.join(""));
    }
  };

  const clearAll = () => {
    setDigits(Array(length).fill(""));
    setAllSelected(false);
    focusCell(0);
  };

  const handleDigitInput = async (index: number, value: string) => {
    if (isLocked) return;

    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    resetSelection();

    const next = [...digits];
    next[index] = digit;

    setDigits(next);

    if (!next.includes("")) {
      await verifyIfComplete(next);
      return;
    }

    focusCell(findNextEmptyCell(index + 1, next));
  };

  const handlePaste = async (
    event: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    event.preventDefault();

    if (isLocked) return;

    const pasted = event.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasted)) return;

    resetSelection();

    const next = [...digits];
    const clipped = pasted.slice(0, length - index);

    for (let i = 0; i < clipped.length; i++) {
      next[index + i] = clipped[i];
    }

    setDigits(next);

    if (!next.includes("")) {
      await verifyIfComplete(next);
      return;
    }

    focusCell(findNextEmptyCell(index + clipped.length, next));
  };

  const handleCopy = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (!allSelected) return;
    event.preventDefault();
    await navigator.clipboard.writeText(code);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (isLocked) return;

    const isCtrlOrMeta = event.ctrlKey || event.metaKey;

    if (isCtrlOrMeta && event.key.toLowerCase() === "a") {
      event.preventDefault();
      setAllSelected(true);
      return;
    }

    if (isCtrlOrMeta && event.key.toLowerCase() === "c") {
      if (allSelected) {
        event.preventDefault();
        await navigator.clipboard.writeText(code);
      }
      return;
    }

    if (isCtrlOrMeta && event.key.toLowerCase() === "v") {
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();

      if (allSelected) {
        clearAll();
        return;
      }

      resetSelection();

      const next = [...digits];

      if (next[index]) {
        next[index] = "";
        setDigits(next);
        focusCell(index);
        return;
      }

      const prev = Math.max(0, index - 1);
      next[prev] = "";
      setDigits(next);
      focusCell(prev);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      resetSelection();
      focusCell(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      resetSelection();
      focusCell(index + 1);
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      await handleDigitInput(index, event.key);
      return;
    }

    if (event.key.length === 1) {
      event.preventDefault();
    }
  };

  const getCellClass = (index: number) => {
    const base =
      "aspect-square w-11 rounded-lg border text-center text-lg font-bold transition-all sm:w-14 sm:text-xl";

    if (isLocked) {
      return `${base} opacity-50 border-cobam-dark-blue/20`;
    }

    if (visualState === "success") {
      return `${base} border-green-500 text-green-600`;
    }

    if (visualState === "error") {
      return `${base} border-red-500 text-red-600`;
    }

    if (allSelected || focusedIndex === index) {
      return `${base} border-cobam-water-blue ring-2 ring-cobam-water-blue/30`;
    }

    return `${base} border-cobam-dark-blue/50`;
  };

  const handleResend = async () => {
    if (!onResend || isLocked || isResendCoolingDown) {
      return;
    }

    await onResend();
    setResendCooldownRemaining(Math.max(0, resendCooldownSeconds));
  };

  return (
    <div className="space-y-6 p-6 sm:p-10">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cobam-water-blue">
          Vérification OTP
        </p>
        <h2 className="text-3xl font-bold text-cobam-dark-blue">
          Code de sécurité
        </h2>
        {email ? (
          <p className="text-sm text-cobam-carbon-grey">Code envoyé à {email}</p>
        ) : null}
      </div>

      <div className="space-y-6">
        <motion.div
          ref={wrapperRef}
          animate={visualState === "error" ? { x: [0, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex w-full justify-center gap-2 sm:gap-3"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              value={digit}
              inputMode="numeric"
              disabled={isLocked}
              className={getCellClass(index)}
              onFocus={() => setFocusedIndex(index)}
              onChange={(event) => handleDigitInput(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPaste={(event) => handlePaste(event, index)}
              onCopy={handleCopy}
              onDoubleClick={() => setAllSelected(true)}
              aria-label={`Chiffre ${index + 1} du code OTP`}
            />
          ))}
        </motion.div>

        <div className="min-h-6">
          {statusText ? (
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className={[
                "flex items-center justify-center gap-2 text-center text-xs font-semibold",
                visualState === "error" && "text-red-600",
                visualState === "success" && "text-emerald-600",
                visualState === "idle" && "text-cobam-carbon-grey",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {statusText}
            </motion.p>
          ) : null}
        </div>
      </div>

      {onBack || onResend ? (
        <div className="flex flex-wrap justify-center gap-3">
          {onBack ? (
            <AnimatedUIButton
              type="button"
              variant="secondary"
              icon="arrow-left"
              disabled={isLocked}
              onClick={onBack}
            >
              {backLabel}
            </AnimatedUIButton>
          ) : null}

          {onResend ? (
            <AnimatedUIButton
              type="button"
              variant="outline"
              icon="paper-plane"
              disabled={disabled || loading || resending || isResendCoolingDown}
              loading={resending}
              loadingText={resendLoadingText}
              onClick={() => void handleResend()}
            >
              {isResendCoolingDown
                ? `${resendLabel} (${resendCooldownRemaining}s)`
                : resendLabel}
            </AnimatedUIButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
