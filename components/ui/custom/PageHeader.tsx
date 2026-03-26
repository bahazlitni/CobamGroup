export default function PageHeader({ className, subtitle, title, description }: { className?: string; subtitle: string; title: string; description: string }) {
    return (
    <section className={`flex items-center bg-cobam-dark-blue text-white relative overflow-hidden ${className || ''}`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-72 h-72 rounded-full bg-cobam-water-blue/80 absolute -top-16 -left-10" />
            <div className="w-64 h-64 rounded-full bg-white absolute bottom-0 right-10" />
        </div>

        <div className="max-w-5xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <p className="text-cobam-water-blue text-xs font-bold tracking-[0.35em] uppercase mb-4">
            {subtitle}
            </p>

            <h1
            className="max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair), serif" }}
            >
            {title}
            </h1>

            <p className="text-white/80 text-base sm:text-lg max-w-2xl">
            {description}
            </p>
        </div>
    </section>
    );
}