"use client";

interface LoaderVideoProps {
  className?: string;
}

export default function CGLoader({
  className = "",
}: LoaderVideoProps) {
  return (
    <video
      src="/videos/loading/loader.webm"
      width={209/3}
      height={112/3}
      autoPlay
      loop
      muted
      playsInline
      className={className}
    />
  );
}