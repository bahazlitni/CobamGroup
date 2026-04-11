import { AnimatedUIButton } from "@/components/ui/custom/Buttons";

export default function DatasheetLink({url}: {url:string}){
    return <div className="w-fit">
        <AnimatedUIButton
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        variant="secondary"
        icon="download"
        iconPosition="right"
    >
        Fiche technique
        </AnimatedUIButton>
    </div>
}