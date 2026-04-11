"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  // useSpring for buttery smooth cursor trailing
  const springConfig = { damping: 25, stiffness: 400, mass: 0.2 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const mouseMove = (e: MouseEvent) => {
      setIsHidden(false);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleCustomEnter = (e: CustomEvent) => {
      setCursorText(e.detail || "");
      setIsHovered(true);
    };

    const handleCustomLeave = () => {
      setIsHovered(false);
      setCursorText("");
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("cursor_enter" as any, handleCustomEnter);
    window.addEventListener("cursor_leave" as any, handleCustomLeave);
    
    document.addEventListener("mouseleave", () => setIsHidden(true));
    document.addEventListener("mouseenter", () => setIsHidden(false));

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("cursor_enter" as any, handleCustomEnter);
      window.removeEventListener("cursor_leave" as any, handleCustomLeave);
    };
  }, [cursorX, cursorY]);

  if (isHidden) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className={`pointer-events-none fixed left-0 top-0 z-[120] flex items-center justify-center rounded-full transition-[width,height,background-color,border] duration-300 ease-out will-change-transform ${
        isHovered
          ? "h-24 w-24 bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-2xl mix-blend-normal"
          : "h-3 w-3 bg-white mix-blend-exclusion"
      }`}
    >
      <motion.span 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
        className="text-[10px] uppercase tracking-widest font-semibold"
      >
        {cursorText}
      </motion.span>
    </motion.div>
  );
}
