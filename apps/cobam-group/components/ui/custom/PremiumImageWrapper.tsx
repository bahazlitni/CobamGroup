"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PremiumImageWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ scale }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
