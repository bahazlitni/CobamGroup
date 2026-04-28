"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

type OtpVisualState = "idle" | "error" | "success";

interface StaffOtpChallengeProps {
  email: string;
  length?: number;
  disabled?: boolean;
  loading?: boolean;
  visualState?: OtpVisualState;
  statusText?: string | null;
  onVerify: (code: string) => void | Promise<void>;
}

export default function OTPInput({
  email,
  length = 6,
  disabled = false,
  loading = false,
  visualState = "idle",
  statusText,
  onVerify,
}: StaffOtpChallengeProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array(length).fill("")
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [allSelected, setAllSelected] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const code = useMemo(() => digits.join(""), [digits]);

  // Deselect when clicking outside
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
    if (disabled || loading) return;

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
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();

    if (disabled || loading) return;

    const pasted = e.clipboardData.getData("text").trim();
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

  const handleCopy = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!allSelected) return;
    e.preventDefault();
    await navigator.clipboard.writeText(code);
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (disabled || loading) return;

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl + A
    if (isCtrlOrMeta && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setAllSelected(true);
      return;
    }

    // Ctrl + C
    if (isCtrlOrMeta && e.key.toLowerCase() === "c") {
      if (allSelected) {
        e.preventDefault();
        await navigator.clipboard.writeText(code);
      }
      return;
    }

    // Ctrl + V → allow native paste
    if (isCtrlOrMeta && e.key.toLowerCase() === "v") {
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();

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

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      resetSelection();
      focusCell(index - 1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      resetSelection();
      focusCell(index + 1);
      return;
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      await handleDigitInput(index, e.key);
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
    }
  };

  const getCellClass = (index: number) => {
    const base =
      "aspect-square w-14 rounded-2xl border text-center text-xl font-bold transition-all";

    if (disabled || loading) {
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase text-cobam-water-blue">
          Vérification OTP
        </p>
        <h2 className="text-3xl font-bold text-cobam-dark-blue">
          Code de sécurité
        </h2>
      </div>

        <motion.div
            ref={wrapperRef}
            animate={visualState === "error" ? { x: [0, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex gap-3 justify-between"
        >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            value={digit}
            inputMode="numeric"
            disabled={disabled || loading}
            className={getCellClass(index)}
            onFocus={() => setFocusedIndex(index)}
            onChange={(e) => handleDigitInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            onCopy={handleCopy}
            onDoubleClick={() => setAllSelected(true)}
          />
        ))}
      </motion.div>

        <div className="min-h-6">
            {statusText && (
            <motion.p
                key={statusText}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className={[
                "flex items-center justify-center gap-2 text-xs font-semibold",
                visualState === "error" && "text-red-600",
                visualState === "success" && "text-emerald-600",
                visualState === "idle" && "text-cobam-carbon-grey",
                ]
                .filter(Boolean)
                .join(" ")}
            >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {statusText}
            </motion.p>
            )}
        </div>
    </div>
  );
}