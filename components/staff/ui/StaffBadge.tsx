"use client";

import { motion } from "framer-motion";
import type { ComponentProps } from "react";
import AnimatedIcon, {
  type AnimatedIconName,
} from "@/components/ui/custom/AnimatedIcon";
import {
  getActiveColors,
  getDefaultColors,
  getHoverColors,
  getStaffBadgeSizeStyles,
  prefixStateClasses,
  type AnimatedUISize,
  type StaffColorName,
} from "@/components/ui/custom/animated-ui.shared";
import { cn } from "@/lib/utils";

type StaffBadgeProps = Omit<
  ComponentProps<"span">,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
> & {
  size?: AnimatedUISize;
  color?: StaffColorName;
  icon?: AnimatedIconName;
  iconPosition?: "left" | "right";
  iconClassName?: string;
};

export default function StaffBadge({
  children,
  size = "md",
  color = "default",
  icon,
  iconPosition = "left",
  className,
  iconClassName,
  ...props
}: StaffBadgeProps) {
  const { px, py, textSize, rounded, gap } = getStaffBadgeSizeStyles(size);
  const defaultColors = getDefaultColors(color);
  const hoverColors = getHoverColors(color);
  const activeColors = getActiveColors(color);

  const iconNode = icon ? (
    <AnimatedIcon
      icon={icon}
      size={size}
      mode="asBadgeChild"
      color={color}
      className={iconClassName}
    />
  ) : null;

  return (
    <motion.span
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={cn(
        "group/badge inline-flex w-fit shrink-0 items-center justify-center border font-medium whitespace-nowrap transition-colors duration-200",
        px,
        py,
        textSize,
        rounded,
        children && iconNode ? gap : undefined,
        defaultColors.outlineColor,
        defaultColors.bgColor,
        defaultColors.textColor,
        prefixStateClasses("hover", hoverColors.outlineColor),
        prefixStateClasses("hover", hoverColors.bgColor),
        prefixStateClasses("hover", hoverColors.textColor),
        prefixStateClasses("active", activeColors.outlineColor),
        prefixStateClasses("active", activeColors.bgColor),
        prefixStateClasses("active", activeColors.textColor),
        className,
      )}
      {...props}
    >
      {iconPosition === "left" ? iconNode : null}
      {children != null ? <span>{children}</span> : null}
      {iconPosition === "right" ? iconNode : null}
    </motion.span>
  );
}
