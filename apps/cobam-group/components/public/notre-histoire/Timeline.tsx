import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { notreHistoire } from "@/data/notre-histoire";


const ITEM_WIDTH = 140; // Width of each timeline item block

// Flatten data into a linear sequence of frames for easier sequential playback
const FLATTENED_SEQUENCE = notreHistoire.flatMap((yearData, yearIndex) =>
  yearData.imageUrls.map((imageUrl, imageIndex) => {
    // Calculate reading time: 3000ms + 50ms per character of text (event + description)
    const textLength = (yearData.event?.length || 0) + (yearData.description?.length || 0);
    const duration = 3000 + (50 * textLength);

    return {
      yearIndex,
      imageIndex,
      totalImagesInYear: yearData.imageUrls.length,
      imageUrl,
      duration,
      ...yearData,
    };
  })
);


export default function Timeline(){
    // Playback state
    const [globalIndex, setGlobalIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    
    // Progress bar state (0 to 100)
    const [progress, setProgress] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const timelineControls = useAnimation();
    const progressStartTime = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const activeFrame = FLATTENED_SEQUENCE[globalIndex];
    const activeYearIndex = isFinished ? notreHistoire.length - 1 : activeFrame?.yearIndex;

    // --- AUTOPLAY & PROGRESS BAR LOGIC ---
    useEffect(() => {
        if (!isPlaying || isFinished || !activeFrame) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        return;
        }

        const currentDuration = activeFrame.duration;
        progressStartTime.current = performance.now();

        const animateProgress = (time: number) => {
        if (!progressStartTime.current) progressStartTime.current = time;
        const elapsed = time - progressStartTime.current;
        
        const percentage = Math.min((elapsed / currentDuration) * 100, 100);
        setProgress(percentage);

        if (elapsed >= currentDuration) {
            // Time to move to next frame
            setGlobalIndex((prev) => {
            if (prev + 1 >= FLATTENED_SEQUENCE.length) {
                setIsFinished(true);
                setIsPlaying(false);
                return prev;
            }
            return prev + 1;
            });
            setProgress(0);
            progressStartTime.current = performance.now(); // Reset for next frame
        }
        
        rafRef.current = requestAnimationFrame(animateProgress);
        };

        rafRef.current = requestAnimationFrame(animateProgress);

        return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [globalIndex, isPlaying, isFinished, activeFrame]);

    // --- TIMELINE CENTERING ---
    useEffect(() => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.offsetWidth;
        const targetX = containerWidth / 2 - ITEM_WIDTH / 2 - activeYearIndex * ITEM_WIDTH;
        
        timelineControls.start({
        x: targetX,
        transition: { type: "spring", stiffness: 300, damping: 30 },
        });
    }, [activeYearIndex, timelineControls]);

    // --- NAVIGATION HANDLERS ---
    const goToNext = () => {
        setIsPlaying(false);
        setProgress(0);
        if (isFinished) return;
        if (globalIndex + 1 >= FLATTENED_SEQUENCE.length) {
        setIsFinished(true);
        } else {
        setGlobalIndex(globalIndex + 1);
        }
    };

    const goToPrev = () => {
        setIsPlaying(false);
        setProgress(0);
        if (isFinished) {
        setIsFinished(false);
        return;
        }
        setGlobalIndex((prev) => Math.max(0, prev - 1));
    };

    const goToFirst = () => {
        setIsPlaying(false);
        setIsFinished(false);
        setProgress(0);
        setGlobalIndex(0);
    };

    const goToLast = () => {
        setIsPlaying(false);
        setIsFinished(false);
        setProgress(0);
        setGlobalIndex(FLATTENED_SEQUENCE.length - 1);
    };

    const handleReplay = () => {
        setIsFinished(false);
        setGlobalIndex(0);
        setProgress(0);
        setIsPlaying(true);
    };

    const handleMilestoneClick = (yearIndex: number) => {
        setIsPlaying(false);
        setIsFinished(false);
        setProgress(0);
        // Find the first globalIndex that matches this year
        const newGlobalIndex = FLATTENED_SEQUENCE.findIndex((f) => f.yearIndex === yearIndex);
        if (newGlobalIndex !== -1) setGlobalIndex(newGlobalIndex);
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!containerRef.current) return;
        setIsPlaying(false);

        const containerWidth = containerRef.current.offsetWidth;
        const currentX = info.offset.x + (containerWidth / 2 - ITEM_WIDTH / 2 - activeYearIndex * ITEM_WIDTH);
        const draggedYearIndex = Math.round((containerWidth / 2 - ITEM_WIDTH / 2 - currentX) / ITEM_WIDTH);
        const newYearIndex = Math.max(0, Math.min(draggedYearIndex, notreHistoire.length - 1));
        
        handleMilestoneClick(newYearIndex);
    };


    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-16 flex flex-col gap-12 font-montserrat overflow-hidden">
        {/* --- TOP PANEL --- */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
            
            {/* Text Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-[260px]">
            <AnimatePresence mode="wait">
                {!isFinished ? (
                <motion.div
                    key={`text-${activeFrame.yearIndex}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col gap-4"
                >
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-cobam-water-blue leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    Année {activeFrame.year} <br />
                    <span className="text-2xl lg:text-3xl font-bold text-cobam-dark-blue mt-2 block">
                        {activeFrame.event}
                    </span>
                    </h2>
                    <p className="text-cobam-carbon-grey leading-relaxed mt-2 text-lg">
                    {activeFrame.description}
                    </p>
                </motion.div>
                ) : (
                <motion.div
                    key="finished-text"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4"
                >
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-cobam-dark-blue leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    Et ce n'est que le début.
                    </h2>
                    <p className="text-cobam-carbon-grey leading-relaxed mt-2 text-lg">
                    Merci d'avoir parcouru notre histoire. Nous continuons de bâtir l'avenir avec vous.
                    </p>
                </motion.div>
                )}

            </AnimatePresence>
            </div>

            {/* Cinematic Display (Image + Progress) */}
            <div className="w-full sm:w-3/5 relative aspect-video overflow-hidden bg-cobam-dark-blue border border-gray-200">
            
            <AnimatePresence mode="wait">
                {!isFinished ? (
                <motion.div
                    key={`img-${globalIndex}`}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Image
                    src={activeFrame.imageUrl || "/images/placeholder.png"}
                    alt={activeFrame.event}
                    fill
                    className="object-cover"
                    priority
                    />
                    
                    {/* Segmented Image Indicator */}
                    {activeFrame.totalImagesInYear > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {Array.from({ length: activeFrame.totalImagesInYear }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === activeFrame.imageIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                            }`}
                        />
                        ))}
                    </div>
                    )}
                </motion.div>
                ) : (
                <motion.div
                    key="finished-img"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-cobam-dark-blue text-white"
                >
                    <RotateCcw className="w-12 h-10 text-cobam-water-blue mb-4 opacity-80" />
                    <button 
                    onClick={handleReplay}
                    className="px-6 py-3 bg-cobam-water-blue hover:bg-cobam-water-blue/80 text-white font-bold rounded-lg transition-colors tracking-wide uppercase text-sm"
                    >
                    Rejouer l'histoire
                    </button>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Continuous Progress Bar (Top Edge) */}
            {!isFinished && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
                <div 
                    className="h-full bg-cobam-water-blue transition-none" 
                    style={{ width: `${progress}%` }} 
                />
                </div>
            )}
            </div>
        </div>

        {/* --- CONTROLS ROW --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 border-b border-gray-200 pb-4">
            <h3 className="text-cobam-dark-blue font-bold tracking-widest uppercase text-sm">
            Chronologie
            </h3>
            
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            <button onClick={goToFirst} className="p-2 rounded-full text-cobam-carbon-grey hover:bg-cobam-light-bg hover:text-cobam-dark-blue transition-colors" aria-label="First">
                <SkipBack size={16} />
            </button>
            <button onClick={goToPrev} disabled={globalIndex === 0 && !isFinished} className="p-2 rounded-full text-cobam-carbon-grey hover:bg-cobam-light-bg hover:text-cobam-dark-blue disabled:opacity-30 transition-colors">
                <ChevronLeft size={20} />
            </button>
            
            <div className="w-px h-5 bg-gray-200 mx-1" />
            
            <button
                onClick={() => {
                if (isFinished) handleReplay();
                else setIsPlaying(!isPlaying);
                }}
                className="p-2.5 rounded-full bg-cobam-light-bg text-cobam-dark-blue hover:text-cobam-water-blue transition-colors"
            >
                {isFinished ? <RotateCcw size={18} /> : isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <div className="w-px h-5 bg-gray-200 mx-1" />

            <button onClick={goToNext} disabled={isFinished} className="p-2 rounded-full text-cobam-carbon-grey hover:bg-cobam-light-bg hover:text-cobam-dark-blue disabled:opacity-30 transition-colors">
                <ChevronRight size={20} />
            </button>
            <button onClick={goToLast} className="p-2 rounded-full text-cobam-carbon-grey hover:bg-cobam-light-bg hover:text-cobam-dark-blue transition-colors" aria-label="Last">
                <SkipForward size={16} />
            </button>
            </div>
        </div>




        {/* --- DRAGGABLE TIMELINE --- */}
        <div 
            ref={containerRef} 
            className="relative w-full h-[140px] cursor-grab active:cursor-grabbing"
        >
            {/* Center Guide Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-cobam-water-blue/30 to-transparent pointer-events-none z-0" />

            <motion.div
            drag="x"
            dragConstraints={containerRef}
            onDragEnd={handleDragEnd}
            animate={timelineControls}
            className="absolute top-0 left-0 h-full flex items-center z-10"
            style={{ width: `${notreHistoire.length * ITEM_WIDTH}px` }}
            >
            {/* Main Track Line */}
            <div className="absolute top-[50px] left-0 right-0 h-[2px] bg-gray-200 -z-10" />

            {notreHistoire.map((item, idx) => {
                const isActive = activeYearIndex === idx;

                return (
                <div
                    key={item.year}
                    onClick={() => handleMilestoneClick(idx)}
                    className="relative flex flex-col items-center justify-start h-full group"
                    style={{ width: ITEM_WIDTH }}
                >
                    {/* Event Label */}
                    <div className="h-[30px] flex items-end justify-center mb-[10px] w-[120px]">
                    <span
                        className={`text-[10px] text-center font-semibold leading-tight px-2 transition-all duration-500 ${
                        isActive
                            ? "text-cobam-dark-blue opacity-100 translate-y-0"
                            : "text-cobam-carbon-grey opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                        }`}
                    >
                        {item.event}
                    </span>
                    </div>

                    {/* Stable Dot */}
                    <div className="relative flex items-center justify-center w-6 h-6">
                    {isActive && (
                        <motion.div
                        layoutId="activeRing"
                        className="absolute inset-0 rounded-full border border-cobam-water-blue/40 bg-cobam-water-blue/10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <div
                        className={`w-3 h-3 rounded-full z-10 transition-colors duration-300 ${
                        isActive ? "bg-cobam-water-blue" : "bg-gray-300 group-hover:bg-gray-400"
                        }`}
                    />
                    </div>

                    {/* Pin */}
                    <div
                    className={`w-[2px] transition-all duration-300 mt-1 ${
                        isActive ? "h-[24px] bg-cobam-water-blue" : "h-[16px] bg-gray-200 group-hover:bg-gray-300"
                    }`}
                    />

                    {/* Year Label */}
                    <span
                    className={`mt-2 text-sm transition-all duration-300 ${
                        isActive ? "text-cobam-dark-blue font-bold scale-110" : "text-cobam-carbon-grey font-medium"
                    }`}
                    >
                        {item.year}
                    </span>
                </div>
                );
            })}
            </motion.div>
        </div>
        </div>
    );
}
