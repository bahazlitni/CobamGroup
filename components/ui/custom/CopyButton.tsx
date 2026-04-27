import { AnimatedUISize } from "@/components/ui/custom/animated-ui.shared";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import type { ButtonVariant } from "@/components/ui/custom/AnimatedUIButton"
import { toast } from "sonner";

interface AnimatedUICopyButtonProps {
    errorText?: string;
    successText?: string;
    onCopy?: (copiedText: string) => void
    value: string
    size?: AnimatedUISize
    variant?: ButtonVariant
}

async function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

export default function AnimatedUICopyButton({
    successText="Texte copié.",
    errorText="Impossible de copier le texte.",
    onCopy,
    value,
    size="xs",
    variant="light",
}: AnimatedUICopyButtonProps){
    const handleCopy = async () => {
        try {
            await copyText(value);
            toast.success(successText);
            onCopy?.(value);

        } catch {
            toast.error(errorText);
        }
    }
    return <AnimatedUIButton
        size={size}
        variant={variant}
        onClick={handleCopy}
        icon="copy"
    />

}