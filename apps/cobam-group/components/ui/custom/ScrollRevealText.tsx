"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type WordProps = {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
};

const Word = ({ children, progress, range }: WordProps) => {
  const characters = children.split("");
  const amount = range[1] - range[0];
  const step = amount / children.length;

  return (
    <span className="relative mr-3 mt-3 inline-block">
      {characters.map((char, i) => {
        const start = range[0] + i * step;
        const end = range[0] + (i + 1) * step;
        return (
          <Character key={`${i}-${char}`} progress={progress} range={[start, end]}>
            {char}
          </Character>
        );
      })}
    </span>
  );
};

const Character = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <span className="relative inline-block">
      <span className="absolute opacity-10">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
};

export default function ScrollRevealText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const element = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ["start 80%", "end 20%"],
  });

  const words = text.split(" ");
  return (
    <div ref={element} className={cn("flex flex-wrap text-4xl sm:text-5xl lg:text-6xl text-inherit", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={`${i}-${word}`} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </div>
  );
}
