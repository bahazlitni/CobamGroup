import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type PanelInputProps = ComponentProps<typeof Input>;

interface Props extends PanelInputProps {
    fullWidth?: boolean
}

export default function PanelInput({fullWidth=false, ...props}: Props) {
    return <Input
        className={cn("h-12 rounded-md border-cobam-grey px-4 text-base border border-slate-300", fullWidth ? "w-full" : "w-auto")}
        
        {...props}
    />
}