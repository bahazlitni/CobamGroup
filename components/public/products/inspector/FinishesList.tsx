import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PublicProductFinishReference } from "@/features/products/types";
import { Finish } from "@/lib/static_tables/finishes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { DerivedFinishOption } from "./utils";

function FinishBlob({
  option,
  active,
  onClick,
}: {
  option: DerivedFinishOption;
  active: boolean;
  onClick: () => void;
}) {
  const hasFailure = option.hasFailure;
  const finishImageUrl = option.imageUrl ?? null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="rounded-full"
          aria-label={option.label}
        >
          {finishImageUrl ? (
            <span
              className={cn(
                "relative block h-12 w-12 overflow-hidden rounded-full border bg-white",
                active ? "ring-2 ring-cobam-water-blue/50" : "",
                hasFailure ? "border-2 border-red-500" : "border-slate-200",
              )}
            >
              <Image
                src={finishImageUrl}
                alt={option.label}
                fill
                sizes="48px"
                className="object-cover"
              />
            </span>
          ) : (
            <span
              className={cn(
                "block h-12 w-12 rounded-full border",
                active ? "ring-2 ring-cobam-water-blue/25" : "",
                hasFailure ? "border-2 border-red-500" : "border-slate-200",
              )}
              style={{
                backgroundColor: option.colorHex ?? "#0f172a",
              }}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{option.label}</TooltipContent>
    </Tooltip>
  );
}

interface FinishesListProps {
    activeKey?: string 
    finishes: DerivedFinishOption[]
    onSelect?: (colorKey: string) => void
}

export default function FinishesList({onSelect, activeKey, finishes}: FinishesListProps){
    if(!finishes.length) return null;
    const label = `Finition${finishes.length === 1 ? "" : "s"}`
    return <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <div className="flex flex-wrap gap-4">
        {finishes.map((finish: DerivedFinishOption) => (
            <FinishBlob
              option={finish}
              active={activeKey !== undefined && activeKey === finish.key}
              onClick={() => onSelect?.(finish.key)}
            />
        ))}
        </div>
    </div>
}
