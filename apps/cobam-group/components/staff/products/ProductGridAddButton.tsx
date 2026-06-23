import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridAddButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export default function ProductGridAddButton({
  label,
  onClick,
  className,
}: ProductGridAddButtonProps) {
  return (
    <button
        type="button"
        onClick={() => onClick()}
        className={cn(
          "min-h-52 gap-6 group hover:border-cobam-water-blue hover:bg-cobam-water-blue/5 flex aspect-square flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center transition",
          className,
        )}
    >
        <span className="h-14 w-14 flex items-center justify-center rounded-full border border-slate-300 text-cobam-water-blue transition group-hover:border-cobam-water-blue group-hover:bg-cobam-water-blue/10 group-hover:text-cobam-water-blue">
            <Plus className="h-6 w-6" />
        </span>
        <p className="text-cobam-dark-blue text-sm font-semibold">{label}</p>
    </button>
  );
}
