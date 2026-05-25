"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

const quantityDigitVariants: Variants = {
  enter: (motionDirection: 1 | -1) => ({
    y: motionDirection === 1 ? -12 : 12,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (motionDirection: 1 | -1) => ({
    y: motionDirection === 1 ? 12 : -12,
    opacity: 0,
    scale: 0.92,
  }),
};

function QuantityStepButton({
  delta,
  label,
  children,
  disabled,
  onPointerStart,
  onKeyboardStep,
  onStop,
}: {
  delta: number;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onPointerStart: (delta: number, event: PointerEvent<HTMLButtonElement>) => void;
  onKeyboardStep: (delta: number) => void;
  onStop: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.9 }}
      disabled={disabled}
      className="text-ec-muted hover:text-ec-ink grid size-14 shrink-0 place-items-center font-sans transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ec-blue/25 disabled:pointer-events-none disabled:opacity-45"
      onPointerDown={(event) => onPointerStart(delta, event)}
      onPointerUp={onStop}
      onPointerCancel={onStop}
      onPointerLeave={onStop}
      onBlur={onStop}
      onClick={(event) => {
        if (event.detail === 0) {
          onKeyboardStep(delta);
        }
      }}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}

export function QuantityStepper({
  value,
  onChange,
  className,
  disabled = false,
  min = 1,
}: {
  value: number;
  onChange: (nextValue: number) => void;
  className?: string;
  disabled?: boolean;
  min?: 0 | 1;
}) {
  const [draft, setDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const repeatDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestValueRef = useRef(value);
  const inputValue = isEditing ? draft : String(value);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const stopRepeat = useCallback(() => {
    if (repeatDelayRef.current) {
      clearTimeout(repeatDelayRef.current);
      repeatDelayRef.current = null;
    }

    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  const setNextValue = useCallback(
    (nextValue: number) => {
      const normalized = Math.max(min, Math.floor(nextValue));
      setDirection(normalized >= value ? 1 : -1);
      latestValueRef.current = normalized;
      onChange(normalized);
    },
    [min, onChange, value],
  );

  const stepBy = useCallback(
    (delta: number) => {
      setNextValue(latestValueRef.current + delta);
    },
    [setNextValue],
  );

  useEffect(() => stopRepeat, [stopRepeat]);

  function startRepeat(delta: number, event: PointerEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    event.preventDefault();
    inputRef.current?.blur();
    setIsEditing(false);
    stepBy(delta);
    stopRepeat();

    repeatDelayRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => stepBy(delta), 82);
    }, 280);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.currentTarget.value.replace(/\D/g, "");
    setDraft(digits);

    if (digits) {
      setNextValue(Number(digits));
    }
  }

  function commitDraft() {
    if (!draft) {
      setDraft(String(value));
      return;
    }

    const next = Math.max(min, Number(draft));
    setNextValue(next);
    setDraft(String(next));
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepBy(1);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(-1);
    }

    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  }

  return (
    <motion.div
      layout
      className={cn(
        "border-ec-line flex h-14 w-full items-center justify-between overflow-hidden border bg-white",
        disabled && "opacity-65",
        className,
      )}
    >
      <QuantityStepButton
        delta={-1}
        label="Diminuer la quantite"
        disabled={disabled || value <= min}
        onPointerStart={startRepeat}
        onKeyboardStep={stepBy}
        onStop={stopRepeat}
      >
        <Minus className="size-4" />
      </QuantityStepButton>
      <span className="relative h-full min-w-0 flex-1 overflow-hidden">
        <input
          ref={inputRef}
          value={inputValue}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => {
            setDraft(String(value));
            setIsEditing(true);
          }}
          onBlur={() => {
            setIsEditing(false);
            commitDraft();
          }}
          onKeyDown={handleInputKeyDown}
          inputMode="numeric"
          pattern="[0-9]*"
          role="spinbutton"
          aria-label="Quantite"
          aria-valuemin={min}
          aria-valuenow={value}
          className={cn(
            "text-ec-ink h-full w-full bg-transparent px-1 text-center text-sm font-black outline-none [appearance:textfield] disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            !isEditing && "text-transparent caret-transparent",
          )}
        />
        {!isEditing ? (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-black text-ec-ink">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.span
                key={value}
                custom={direction}
                variants={quantityDigitVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 520, damping: 30 }}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : null}
      </span>
      <QuantityStepButton
        delta={1}
        label="Augmenter la quantite"
        disabled={disabled}
        onPointerStart={startRepeat}
        onKeyboardStep={stepBy}
        onStop={stopRepeat}
      >
        <Plus className="size-4" />
      </QuantityStepButton>
    </motion.div>
  );
}
