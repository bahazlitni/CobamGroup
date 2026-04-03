import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import SectionHeader from "@/components/ui/custom/SectionHeader";
import { COBAM_SOCIAL_LINKS } from "@/data/contact-details";

export default function SuivezNousSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                preTitle="Réseaux sociaux"
                title="Suivez-nous"
                description="Restez informés de nos dernières actualités et promotions."
                centered
                />
                <div className="flex flex-wrap justify-center gap-4">
                    {COBAM_SOCIAL_LINKS.map((social, idx) => {
                        return (
                        <AnimatedUIButton
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-20 h-20 aspect-square rounded-full"
                        >
                            <social.Icon className="h-8 w-8 text-cobam-water-blue transition-transform group-hover:scale-110" />
                        </AnimatedUIButton>
                        );
                    })}
                    </div>
            </div>
        </section>
    );
}