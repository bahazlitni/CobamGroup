"use client"
import { Input } from "@/components/ui/input";
import { ComponentProps, useState } from "react";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { Eye } from "lucide-react";

type PanelInputProps = ComponentProps<typeof Input>;

export default function PanelPasswordInput(props: PanelInputProps) {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const handleToggle = () => {
        setIsVisible(!isVisible);
    }

    const inputType = isVisible ? "text" : "password"
    const variant = isVisible ? "secondary" : "outline"

    return <div className="flex flex-row gap-5">
        <Input
            type={inputType}
            className="h-12 rounded-md border-cobam-grey px-4 text-base"
            {...props}
        />
        <AnimatedUIButton onClick={handleToggle} size="lg" variant={variant}>
            <Eye className="h-4 w-4"/>
        </AnimatedUIButton>
    </div>
}