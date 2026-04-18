"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  useAnimationFrame,
  PanInfo
} from "framer-motion";
import { getTeamMemberFullname, notreEquipe, resolveTeamMemberUrl, TeamMember } from "@/data/notre-equipe";
import { PremiumImageWrapper } from "@/components/ui/custom/PremiumImageWrapper";
import Magnetic from "@/components/ui/custom/Magnetic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 300;
const GAP = 20; 
const ITEM_WIDTH = CARD_WIDTH + GAP;

export default function TeamCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const standardMembers = notreEquipe.filter(m => !m.isVIP);
  const totalWidth = standardMembers.length * ITEM_WIDTH;
  
  const scrollX = useMotionValue(0);
  const smoothScrollX = useSpring(scrollX, {
    damping: 50,
    stiffness: 400,
    mass: 1,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const driftVelocity = -0.25; // Decreased speed for a more subtle drift

  useAnimationFrame(() => {
    if (!isHovered && !isDragging) {
      scrollX.set(scrollX.get() + driftVelocity);
    }
  });

  const onPan = (event: any, info: PanInfo) => {
    scrollX.set(scrollX.get() + info.delta.x);
    smoothScrollX.set(scrollX.get()); 
  };

  const scrollBy = (direction: "left" | "right") => {
    const amount = ITEM_WIDTH * 2;
    const target = scrollX.get() + (direction === "left" ? amount : -amount);
    scrollX.set(target);
  };

  if (standardMembers.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="relative group/carousel w-full overflow-hidden py-10 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 flex justify-between z-30 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500">
        <button
          onClick={() => scrollBy("left")}
          className="p-3 rounded-full bg-white shadow-lg text-cobam-dark-blue transition-all hover:scale-110 active:scale-95 pointer-events-auto border border-cobam-quill-grey/10 hover:bg-cobam-water-blue hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => scrollBy("right")}
          className="p-3 rounded-full bg-white shadow-lg text-cobam-dark-blue transition-all hover:scale-110 active:scale-95 pointer-events-auto border border-cobam-quill-grey/10 hover:bg-cobam-water-blue hover:text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <motion.div
        className="flex gap-5 cursor-grab active:cursor-grabbing h-[480px] items-center"
        onPanStart={() => setIsDragging(true)}
        onPanEnd={() => setIsDragging(false)}
        onPan={onPan}
      >
        {standardMembers.map((member, index) => (
          <TeamMemberCard 
            key={getTeamMemberFullname(member)} 
            member={member} 
            index={index} 
            scrollX={smoothScrollX}
            totalWidth={totalWidth}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function TeamMemberCard({ 
  member, 
  index, 
  scrollX, 
  totalWidth,
  isStatic = false
}: { 
  member: TeamMember; 
  index?: number; 
  scrollX?: any; 
  totalWidth?: number;
  isStatic?: boolean;
}) {
  const fullname = getTeamMemberFullname(member);
  const initialOffset = (index || 0) * ITEM_WIDTH;
  
  const wrappedX = useTransform(scrollX || useMotionValue(0), (v: number) => {
    if (isStatic) return 0;
    const range = totalWidth || 10000;
    const offset = (v + initialOffset) % range;
    return offset < -CARD_WIDTH ? offset + range : offset;
  });

  return (
    <motion.div 
      style={!isStatic ? { x: wrappedX, position: "absolute", left: 0 } : {}}
      className={cn("w-[260px] sm:w-[300px] flex-shrink-0", isStatic && "!w-full sm:!w-[300px]")}
    >
      <Magnetic strength={10} className="block w-full">
        <div className="group relative w-full overflow-hidden rounded-2xl aspect-[4/5] bg-white border border-cobam-quill-grey/20 transition-all duration-700 hover:border-cobam-water-blue/40 shadow-sm hover:shadow-xl">
          <PremiumImageWrapper className="h-full">
            <Image
              src={resolveTeamMemberUrl(member)}
              alt={fullname}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="300px"
              draggable={false}
            />
          </PremiumImageWrapper>
          
          {/* Minimalist modern overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cobam-water-blue font-bold mb-1 opacity-90">
              {member.jobTitle}
            </p>
            <h4 className="text-white text-lg font-bold tracking-tight">
              {fullname}
            </h4>
          </div>
        </div>
      </Magnetic>
    </motion.div>
  );
}
