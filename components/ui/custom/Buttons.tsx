"use client";

import { motion } from "framer-motion";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import AnimatedIcon, { type AnimatedIconName } from "./AnimatedIcon";
import {
  getActiveColors,
  getAnimatedButtonSizeStyles,
  getDefaultColors,
  getHoverColors,
  prefixStateClasses,
  type AnimatedUISize,
  type ButtonSizeStyles,
  type StaffColorName,
} from "./animated-ui.shared";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "outline-dark"
  | "ghost-dark"
  | "dark"
  | "light";

type IconPosition = "left" | "right";

type VariantClasses = {
  root: string;
  text: string;
  iconColor?: StaffColorName;
  iconState?: "default" | "hover" | "active";
  iconClassName?: string;
};

export function getButtonSizes(
  size: AnimatedUISize = "md",
): ButtonSizeStyles {
  return getAnimatedButtonSizeStyles(size);
}

function getDefaultVariantColor(
  variant: ButtonVariant,
  color?: StaffColorName,
): StaffColorName {
  if (color) {
    return color;
  }

  switch (variant) {
    case "primary":
    case "dark":
      return "primary";
    case "secondary":
      return "secondary";
    case "ghost":
    case "outline":
      return "primary";
    case "light":
      return "default";
    case "outline-dark":
    case "ghost-dark":
      return "default";
    default:
      return "default";
  }
}

function getUIButtonVariantClasses(
  variant: ButtonVariant,
  color?: StaffColorName,
): VariantClasses {
  const resolvedColor = getDefaultVariantColor(variant, color);
  const defaultColors = getDefaultColors(resolvedColor);
  const hoverColors = getHoverColors(resolvedColor);
  const activeColors = getActiveColors(resolvedColor);

  switch (variant) {
    case "primary":
    case "secondary":
    case "dark":
      return {
        root: cn(
          activeColors.bgColor,
          activeColors.outlineColor,
          activeColors.textColor,
          "border shadow-sm",
          "hover:brightness-95 active:brightness-90",
          "focus-visible:ring-cobam-water-blue/20",
        ),
        text: activeColors.textColor,
        iconColor: resolvedColor,
        iconState: "active",
      };

    case "light":
      return {
        root: cn(
          "border",
          defaultColors.bgColor,
          defaultColors.outlineColor,
          defaultColors.textColor,
          prefixStateClasses("hover", hoverColors.bgColor),
          prefixStateClasses("hover", hoverColors.outlineColor),
          prefixStateClasses("active", activeColors.bgColor),
          prefixStateClasses("active", activeColors.outlineColor),
          "focus-visible:ring-cobam-water-blue/12",
        ),
        text: cn(
          defaultColors.textColor,
          prefixStateClasses("group-hover", hoverColors.textColor),
          prefixStateClasses("group-active", activeColors.textColor),
        ),
        iconColor: resolvedColor,
        iconState: "default",
      };

    case "outline":
      return {
        root: cn(
          "border bg-transparent",
          defaultColors.outlineColor,
          defaultColors.textColor,
          prefixStateClasses("hover", hoverColors.bgColor),
          prefixStateClasses("hover", hoverColors.outlineColor),
          "focus-visible:ring-cobam-water-blue/15",
        ),
        text: cn(
          defaultColors.textColor,
          prefixStateClasses("group-hover", hoverColors.textColor),
        ),
        iconColor: resolvedColor,
        iconState: "default",
      };

    case "ghost":
      return {
        root: cn(
          "border border-transparent bg-transparent",
          defaultColors.textColor,
          prefixStateClasses("hover", hoverColors.bgColor),
          "focus-visible:ring-cobam-water-blue/12",
        ),
        text: cn(
          defaultColors.textColor,
          prefixStateClasses("group-hover", hoverColors.textColor),
        ),
        iconColor: resolvedColor,
        iconState: "default",
      };

    case "outline-dark":
      return {
        root: cn(
          "border border-white/20 bg-transparent text-white",
          "hover:border-white/35 hover:bg-white/8",
          "focus-visible:ring-white/15",
        ),
        text: "text-white",
        iconClassName: "text-white/80 group-hover:text-white",
      };

    case "ghost-dark":
      return {
        root: cn(
          "border border-transparent bg-transparent text-white/95",
          "hover:border-white/12 hover:bg-white/8",
          "focus-visible:ring-white/12",
        ),
        text: "text-white/95",
        iconClassName: "text-white/75 group-hover:text-white",
      };
  }
}

type AnimatedUIButtonBaseProps = {
  children?: ReactNode;
  size?: AnimatedUISize;
  variant?: ButtonVariant;
  color?: StaffColorName;
  icon?: AnimatedIconName;
  iconPosition?: IconPosition;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  loading?: boolean;
  loadingText?: ReactNode;
  fullWidth?: boolean;
};

type MotionUnsafeAnchorProps =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

type MotionUnsafeButtonProps =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

type AnimatedUIButtonAsButtonProps = AnimatedUIButtonBaseProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | MotionUnsafeButtonProps
  > & {
    href?: undefined;
  };

type AnimatedUIButtonAsLinkProps = AnimatedUIButtonBaseProps &
  Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "children" | MotionUnsafeAnchorProps
  > & {
    href: string;
  };

export type AnimatedUIButtonProps =
  | AnimatedUIButtonAsButtonProps
  | AnimatedUIButtonAsLinkProps;

export function AnimatedUIButton({
  children,
  size = "md",
  variant = "outline",
  color,
  icon = "none",
  iconPosition = "right",
  className,
  iconClassName,
  textClassName,
  loading = false,
  loadingText = "Chargement...",
  fullWidth = false,
  ...props
}: AnimatedUIButtonProps) {
  const { px, py, textSize, rounded, gap, minHeight } = getButtonSizes(size);
  const variantClasses = getUIButtonVariantClasses(variant, color);
  const isLink = "href" in props && typeof props.href === "string";
  const isDisabled = !isLink && (props.disabled || loading);
  const hasChildren = children != null;
  const shouldRenderIcon = icon !== "none" && !loading;

  const renderIcon = shouldRenderIcon ? (
    <AnimatedIcon
      icon={icon}
      size={size}
      mode="asButtonChild"
      color={variantClasses.iconColor ?? getDefaultVariantColor(variant, color)}
      state={variantClasses.iconState ?? "default"}
      className={cn(variantClasses.iconClassName, iconClassName)}
    />
  ) : null;

  const renderLoader = (
    <AnimatedIcon
      icon="loader"
      size={size}
      mode="asButtonChild"
      color={variantClasses.iconColor ?? getDefaultVariantColor(variant, color)}
      state={variantClasses.iconState ?? "default"}
      className={cn(variantClasses.iconClassName, iconClassName)}
    />
  );

  const sharedClassName = cn(
    "group relative inline-flex items-center justify-center overflow-hidden",
    "font-semibold tracking-[0.02em] select-none whitespace-nowrap",
    "transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-65",
    "will-change-transform",
    fullWidth && "w-full",
    px,
    py,
    textSize,
    rounded,
    hasChildren && (shouldRenderIcon || loading) ? gap : undefined,
    minHeight,
    variantClasses.root,
    className,
  );

  const content = loading ? (
    <>
      {renderLoader}
      {loadingText ? (
        <span
          className={cn(
            "relative z-10 transition-colors duration-300",
            variantClasses.text,
            textClassName,
          )}
        >
          {loadingText}
        </span>
      ) : null}
    </>
  ) : (
    <>
      {iconPosition === "left" ? renderIcon : null}

      {hasChildren ? (
        <span
          className={cn(
            "relative z-10 transition-colors duration-300",
            variantClasses.text,
            textClassName,
          )}
        >
          {children}
        </span>
      ) : null}

      {iconPosition === "right" ? renderIcon : null}
    </>
  );

  if (isLink) {
    const { href, target, rel, onClick, ...anchorProps } =
      props as AnimatedUIButtonAsLinkProps;

    return (
      <motion.a
        href={href}
        target={target}
        rel={target === "_blank" ? (rel ?? "noopener noreferrer") : rel}
        initial="rest"
        animate="rest"
        whileHover={!loading ? "hover" : "rest"}
        whileTap={!loading ? { scale: 0.985 } : undefined}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(
          sharedClassName,
          loading && "pointer-events-none opacity-65",
        )}
        onClick={loading ? (event) => event.preventDefault() : onClick}
        {...anchorProps}
      >
        {content}
      </motion.a>
    );
  }

  const {
    type = "button",
    form,
    ...buttonProps
  } = props as AnimatedUIButtonAsButtonProps;

  return (
    <motion.button
      form={form}
      type={type}
      disabled={isDisabled}
      initial="rest"
      animate="rest"
      whileHover={!isDisabled ? "hover" : "rest"}
      whileTap={!isDisabled ? { scale: 0.985 } : undefined}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={sharedClassName}
      {...buttonProps}
    >
      {content}
    </motion.button>
  );
}
