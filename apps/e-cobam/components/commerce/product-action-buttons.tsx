"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type ProductActionSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type ProductActionChange = "added" | "removed";

type ProductActionSizeConfig = {
  height: string;
  paddingX: string;
  iconOnlySize: string;
  iconSize: string;
  textSize: string;
  gap: string;
  radius: string;
};

export const productActionSizeMap: Record<ProductActionSize, ProductActionSizeConfig> = {
  xs: {
    height: "h-8",
    paddingX: "px-3",
    iconOnlySize: "size-8",
    iconSize: "size-3.5",
    textSize: "text-xs",
    gap: "gap-1.5",
    radius: "rounded-xl",
  },
  sm: {
    height: "h-9",
    paddingX: "px-3.5",
    iconOnlySize: "size-9",
    iconSize: "size-4",
    textSize: "text-xs",
    gap: "gap-2",
    radius: "rounded-xl",
  },
  md: {
    height: "h-10",
    paddingX: "px-4",
    iconOnlySize: "size-10",
    iconSize: "size-4",
    textSize: "text-sm",
    gap: "gap-2",
    radius: "rounded-2xl",
  },
  lg: {
    height: "h-12",
    paddingX: "px-5",
    iconOnlySize: "size-12",
    iconSize: "size-5",
    textSize: "text-sm",
    gap: "gap-2.5",
    radius: "rounded-2xl",
  },
  xl: {
    height: "h-14",
    paddingX: "px-6",
    iconOnlySize: "size-14",
    iconSize: "size-5",
    textSize: "text-base",
    gap: "gap-3",
    radius: "rounded-[1.15rem]",
  },
  "2xl": {
    height: "h-16",
    paddingX: "px-7",
    iconOnlySize: "size-16",
    iconSize: "size-6",
    textSize: "text-lg",
    gap: "gap-3",
    radius: "rounded-[1.35rem]",
  },
};

const iconMotion = {
  initial: { opacity: 0, y: 7, scale: 0.82, rotate: -8 },
  animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
  exit: { opacity: 0, y: -7, scale: 0.86, rotate: 8 },
};

const labelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const sparkleParticles = [
  { x: -18, y: -18, rotate: -18, scale: 0.82 },
  { x: 0, y: -24, rotate: 18, scale: 0.68 },
  { x: 19, y: -15, rotate: 38, scale: 0.78 },
  { x: 24, y: 5, rotate: 72, scale: 0.58 },
  { x: 12, y: 22, rotate: 26, scale: 0.74 },
  { x: -12, y: 22, rotate: -36, scale: 0.62 },
  { x: -24, y: 3, rotate: -72, scale: 0.72 },
];

export const CART_ACTION_ANIMATION_EVENT = "e-cobam-cart-action-animation";
export const FAVORITES_ACTION_ANIMATION_EVENT = "e-cobam-favorites-action-animation";

export function emitCartActionAnimation(action: ProductActionChange) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(CART_ACTION_ANIMATION_EVENT, { detail: { action } }));
}

export function emitFavoritesActionAnimation(action: ProductActionChange) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(FAVORITES_ACTION_ANIMATION_EVENT, { detail: { action } }));
}

function useTransientFlag(duration = 520) {
  const [runKey, setRunKey] = useState(0);
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    active,
    runKey,
    trigger() {
      setRunKey((current) => current + 1);
      setActive(true);

      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setActive(false);
        timeoutRef.current = null;
      }, duration);
    },
  };
}

function FavoriteSparkles({ active, runKey }: { active: boolean; runKey: number }) {
  return (
    <AnimatePresence>
      {active ? (
        <span
          key={runKey}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
        >
          {sparkleParticles.map((particle, index) => (
            <motion.span
              key={`${runKey}-${index}`}
              className={cn(
                "absolute left-1/2 top-1/2 size-1.5 rounded-[2px] bg-ec-blue",
                index % 2 === 0 && "rounded-full bg-sky-300",
              )}
              initial={{
                opacity: 0,
                x: "-50%",
                y: "-50%",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: `calc(-50% + ${particle.x}px)`,
                y: `calc(-50% + ${particle.y}px)`,
                scale: [0, particle.scale, 0.12],
                rotate: particle.rotate,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.48,
                delay: index * 0.025,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </span>
      ) : null}
    </AnimatePresence>
  );
}

function ActionLabel({ children, stateKey }: { children: string; stateKey: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={stateKey}
        className="whitespace-nowrap"
        variants={labelMotion}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

type ProductActionButtonBaseProps = {
  size?: ProductActionSize;
  iconOnly?: boolean;
  disabled?: boolean;
  className?: string;
};

export type AddToCartButtonProps = ProductActionButtonBaseProps & {
  isInCart: boolean;
  onToggle: () => void | Promise<void>;
  onAddedToCartAnimation?: () => void;
  onRemovedFromCartAnimation?: () => void;
};

export function AddToCartButton({
  isInCart,
  onToggle,
  size = "md",
  iconOnly = false,
  disabled = false,
  className,
  onAddedToCartAnimation,
  onRemovedFromCartAnimation,
}: AddToCartButtonProps) {
  const reducedMotion = useReducedMotion();
  const [isHandling, setIsHandling] = useState(false);
  const successPulse = useTransientFlag(560);
  const sizeConfig = productActionSizeMap[size];
  const stateKey = isInCart ? "cart-added" : "cart-idle";
  const label = isInCart ? "Dans le panier" : "Ajouter au panier";

  async function handleClick() {
    if (disabled || isHandling) {
      return;
    }

    const nextState = !isInCart;
    setIsHandling(true);

    try {
      await onToggle();

      if (nextState) {
        if (!reducedMotion) {
          successPulse.trigger();
        }
        onAddedToCartAnimation?.();
      } else {
        onRemovedFromCartAnimation?.();
      }
    } catch {
      return;
    } finally {
      setIsHandling(false);
    }
  }

  return (
    <motion.button
      type="button"
      aria-label={iconOnly ? (isInCart ? "Retirer du panier" : "Ajouter au panier") : undefined}
      aria-pressed={isInCart}
      disabled={disabled || isHandling}
      onClick={() => void handleClick()}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      animate={successPulse.active && !reducedMotion ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={
        successPulse.active && !reducedMotion
          ? { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
          : { type: "spring", stiffness: 520, damping: 28 }
      }
      className={cn(
        "relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden border font-black shadow-[0_14px_32px_rgba(20,32,46,0.16)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        iconOnly
          ? `${sizeConfig.iconOnlySize} rounded-full p-0`
          : `${sizeConfig.height} ${sizeConfig.paddingX} ${sizeConfig.gap} ${sizeConfig.radius} ${sizeConfig.textSize}`,
        isInCart
          ? "border-ec-blue bg-ec-blue text-white hover:bg-ec-blue/90"
          : "border-ec-ink bg-ec-ink text-white hover:border-ec-blue hover:bg-ec-blue",
        className,
      )}
    >
      <AnimatePresence>
        {successPulse.active && !reducedMotion ? (
          <motion.span
            key={successPulse.runKey}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.34)_45%,transparent_70%)]"
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <span className={cn("relative z-10 inline-flex items-center", iconOnly ? "" : sizeConfig.gap)}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={stateKey}
            className="inline-grid shrink-0 place-items-center"
            variants={iconMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: isInCart ? 620 : 420, damping: 24 }
            }
          >
            {isInCart ? (
              <Check className={sizeConfig.iconSize} aria-hidden="true" strokeWidth={2.8} />
            ) : (
              <ShoppingBag className={sizeConfig.iconSize} aria-hidden="true" />
            )}
          </motion.span>
        </AnimatePresence>

        {!iconOnly ? <ActionLabel stateKey={stateKey}>{label}</ActionLabel> : null}
      </span>
    </motion.button>
  );
}

export type AddToFavoritesButtonProps = ProductActionButtonBaseProps & {
  isFavorite: boolean;
  onToggle: () => void | Promise<void>;
  onAddedToFavoritesAnimation?: () => void;
  onRemovedFromFavoritesAnimation?: () => void;
};

export function AddToFavoritesButton({
  isFavorite,
  onToggle,
  size = "md",
  iconOnly = false,
  disabled = false,
  className,
  onAddedToFavoritesAnimation,
  onRemovedFromFavoritesAnimation,
}: AddToFavoritesButtonProps) {
  const reducedMotion = useReducedMotion();
  const [isHandling, setIsHandling] = useState(false);
  const sparkles = useTransientFlag(620);
  const removePulse = useTransientFlag(260);
  const sizeConfig = productActionSizeMap[size];
  const stateKey = isFavorite ? "favorite-active" : "favorite-idle";
  const label = isFavorite ? "Dans les favoris" : "Ajouter aux favoris";

  async function handleClick() {
    if (disabled || isHandling) {
      return;
    }

    const nextState = !isFavorite;
    setIsHandling(true);

    try {
      await onToggle();

      if (nextState) {
        if (!reducedMotion) {
          sparkles.trigger();
        }
        onAddedToFavoritesAnimation?.();
      } else {
        if (!reducedMotion) {
          removePulse.trigger();
        }
        onRemovedFromFavoritesAnimation?.();
      }
    } catch {
      return;
    } finally {
      setIsHandling(false);
    }
  }

  return (
    <motion.button
      type="button"
      aria-label={iconOnly ? (isFavorite ? "Retirer des favoris" : "Ajouter aux favoris") : undefined}
      aria-pressed={isFavorite}
      disabled={disabled || isHandling}
      onClick={() => void handleClick()}
      whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      className={cn(
        "relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden border font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        iconOnly
          ? `${sizeConfig.iconOnlySize} rounded-full p-0`
          : `${sizeConfig.height} ${sizeConfig.paddingX} ${sizeConfig.gap} ${sizeConfig.radius} ${sizeConfig.textSize}`,
        isFavorite
          ? "border-ec-blue/35 bg-ec-blue/10 text-ec-blue hover:border-ec-blue/50"
          : "border-ec-line bg-white text-ec-ink hover:border-ec-blue/35 hover:text-ec-blue",
        className,
      )}
    >
      <span className={cn("relative z-10 inline-flex items-center", iconOnly ? "" : sizeConfig.gap)}>
        <span className="relative inline-grid shrink-0 place-items-center">
          <FavoriteSparkles active={sparkles.active && !reducedMotion} runKey={sparkles.runKey} />
          <motion.span
            key={`${stateKey}-${sparkles.runKey}-${removePulse.runKey}`}
            className="inline-grid place-items-center"
            animate={
              reducedMotion
                ? { scale: 1 }
                : sparkles.active
                  ? { scale: [1, 1.34, 0.92, 1] }
                  : removePulse.active
                    ? { scale: [1, 0.82, 1] }
                    : { scale: 1 }
            }
            transition={
              sparkles.active || removePulse.active
                ? { duration: sparkles.active ? 0.48 : 0.24, ease: [0.22, 1, 0.36, 1] }
                : { type: "spring", stiffness: 620, damping: 22 }
            }
          >
            <Heart
              className={cn(sizeConfig.iconSize, "transition-colors duration-200")}
              fill={isFavorite ? "currentColor" : "transparent"}
              aria-hidden="true"
            />
          </motion.span>
        </span>

        {!iconOnly ? <ActionLabel stateKey={stateKey}>{label}</ActionLabel> : null}
      </span>
    </motion.button>
  );
}
