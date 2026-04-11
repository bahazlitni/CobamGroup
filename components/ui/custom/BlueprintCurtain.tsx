"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BlueprintCurtain() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0, pointerEvents: "none" }}
      transition={{ delay: 2.5, duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col pointer-events-auto"
      aria-hidden="true"
    >
      {/* Top Half */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: "-100%" }}
        transition={{ delay: 1.5, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        className="relative h-1/2 w-full bg-[#14202e] border-b border-cobam-water-blue/20"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(10, 141, 193, 0.4) 0%, transparent 70%)' }} />
      </motion.div>

      {/* Bottom Half */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: "100%" }}
        transition={{ delay: 1.5, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        className="relative h-1/2 w-full bg-[#14202e]"
      />

      {/* The drawing plotter line */}
      <motion.div
        initial={{ width: "0%", left: "50%" }}
        animate={{ width: "100%", left: "0%" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/2 h-px bg-white z-[101] -translate-y-1/2"
      >
        <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" />
      </motion.div>
    </motion.div>
  );
}
