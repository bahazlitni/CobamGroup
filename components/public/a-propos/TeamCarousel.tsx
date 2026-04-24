"use client";

import Image from "next/image";
import { getTeamMemberFullname, notreEquipe, resolveTeamMemberUrl, TeamMember } from "@/data/notre-equipe";
import { PremiumImageWrapper } from "@/components/ui/custom/PremiumImageWrapper";
import Magnetic from "@/components/ui/custom/Magnetic";
import RailCarousel from "@/components/ui/custom/RailCarousel";
import { cn } from "@/lib/utils";

export default function TeamCarousel() {
  const standardMembers = notreEquipe.filter((member) => !member.isVIP);

  if (standardMembers.length === 0) {
    return null;
  }

  return (
    <RailCarousel
      autoScroll={true}
      autoScrollSpeed={80}
      autoScrollDirection="rtl"
      showButtons="on-hover"
      allowDrag={true}
      applyPhysics={true}
      modularScroll={true}
      className="py-6"
      viewportClassName="px-1 py-4"
      trackClassName="gap-5"
    >
      {standardMembers.map((member) => (
        <TeamMemberCard key={getTeamMemberFullname(member)} member={member} />
      ))}
    </RailCarousel>
  );
}

export function TeamMemberCard({
  member,
  isStatic = false,
}: {
  member: TeamMember;
  isStatic?: boolean;
}) {
  const fullname = getTeamMemberFullname(member);

  return (
    <div className={cn("w-[260px] sm:w-[300px] flex-shrink-0", isStatic && "w-full sm:w-[300px]")}>
      <Magnetic strength={10} className="block w-full">
        <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-cobam-quill-grey/20 bg-white shadow-sm transition-all duration-700 hover:border-cobam-water-blue/40 hover:shadow-xl">
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

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 pt-20">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cobam-water-blue opacity-90">
              {member.jobTitle}
            </p>
            <h4 className="text-lg font-bold tracking-tight text-white">{fullname}</h4>
          </div>
        </div>
      </Magnetic>
    </div>
  );
}
