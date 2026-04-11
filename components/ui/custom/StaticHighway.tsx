"use client";

import { motion } from "framer-motion";

type StaticHighwayProps = {
  direction?: "left" | "right";
};

export default function StaticHighway({ direction = "left" }: StaticHighwayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 w-px bg-cobam-water-blue/20"
        style={{
          left: direction === "left" ? "3rem" : "auto",
          right: direction === "right" ? "3rem" : "auto",
        }}
      >
        <div className="absolute top-0 w-[1px] h-[200px] bg-gradient-to-b from-transparent via-cobam-water-blue to-transparent animate-blob-fall opacity-50" />
      </motion.div>
    </div>
  );
}
