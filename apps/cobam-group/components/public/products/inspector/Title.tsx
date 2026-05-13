import AnimatedUICopyButton from "@/components/ui/custom/CopyButton";

export default function Title({title}: {title?: string}){
    if(!title) return null;
    return <h1 className="w-fit inline-flex items-center gap-3 text-3xl font-semibold tracking-[-0.04em] text-cobam-dark-blue sm:text-4xl">
        {title}
        <AnimatedUICopyButton
            value={title}
            successText="Titre copié."
            errorText="Impossible de copier le titre produit."
        />
    </h1>
}