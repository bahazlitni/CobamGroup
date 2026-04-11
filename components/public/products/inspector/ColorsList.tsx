import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resolveColorHex } from "@/lib/static_tables/colors";
import { cn } from "@/lib/utils";
import { DerivedColorOption } from "./utils";

function ColorBlob({
  option,
  active,
  onClick,
}: {
  option: DerivedColorOption;
  active: boolean;
  onClick: () => void;
}) {
  const resolvedHex =
    option.reference?.hexValue ??
    resolveColorHex(option.label) ??
    resolveColorHex(option.key);
  const hasFailure = !resolvedHex;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="rounded-full"
          aria-label={option.label}
        >
          <span
            className={cn(
              "block h-11 w-11 rounded-full border transition",
              active ? "ring-2 ring-cobam-water-blue/25" : "",
              hasFailure ? "border-2 border-red-500 bg-black" : "border-slate-200",
            )}
            style={
              hasFailure
                ? undefined
                : {
                    backgroundColor: resolvedHex ?? undefined,
                  }
            }
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>{option.label}</TooltipContent>
    </Tooltip>
  );
}

interface ColorsListProps {
    activeKey?: string 
    colors: DerivedColorOption[]
    onSelect?: (colorKey: string) => void
}

export default function ColorsList({onSelect, activeKey, colors}: ColorsListProps){
    if(!colors.length) return null;
    const label = `Couleur${colors.length === 1 ? "" : "s"}`
    return <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <div className="flex flex-wrap gap-4">
        {colors.map((color) => (
            <ColorBlob
                key={color.key}
                option={color}
                active={activeKey !== undefined && activeKey === color.key}
                onClick={() => onSelect?.(color.key)}
            />
        ))}
        </div>
    </div>
}
