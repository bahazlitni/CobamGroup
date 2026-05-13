"use client";

import { useRef } from "react";
import Image from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";

type ParallaxImageProps = {
  src: string;
  alt: string;
  sizes?: string;
};

export default function ParallaxImage({ src, alt, sizes }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-[-20%]">
        <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-105">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={sizes}
          />
        </div>
      </motion.div>
    </div>
  );
}
