import { useMediaObjectUrl } from "@/features/media/hooks/use-media-object-url";
import { Size } from "@/lib/types";
import Image from "next/image";

interface Props {
  mediaId?: number | null;
  initials?: string;
  size: Size;
}

const SIZE_STYLES: Record<Size, string> = {
  sm: "w-10 h-10 text-xs",
  md: "w-14 h-14 text-sm",
  lg: "w-20 h-20 text-base",
  xl: "w-32 h-32 text-lg",
  "2xl": "w-48 h-48 text-xl",
};

function FallbackInitials({ initials }: { initials?: string }) {
  const value = initials ? initials.toUpperCase().trim() : "??";
  return <>{value}</>;
}

function AvatarSkeleton({ size }: { size: Size }) {
  const sizeClass = SIZE_STYLES[size] ?? SIZE_STYLES.sm;
  return (
    <div
      className={`rounded-full border border-slate-300 animate-pulse ${sizeClass}`}
    />
  );
}

export default function Avatar({ size, mediaId, initials }: Props) {
  const sizeClass = SIZE_STYLES[size] ?? SIZE_STYLES.sm;

  const { objectUrl, isLoading } = useMediaObjectUrl(
    mediaId === undefined ? null : mediaId,
    "thumbnail"
  );

  if (isLoading) {
    return <AvatarSkeleton size={size} />;
  }

  console.log(sizeClass)

  return (
    <div
      className={`${sizeClass} overflow-hidden grid place-items-center rounded-full border border-slate-300 text-slate-500 bg-slate-100`}
    >
      {objectUrl ? (
        <Image
          draggable={false}
          width={512}
          height={512}
          src={objectUrl}
          alt="Avatar"
          className="object-cover w-full h-full"
        />
      ) : (
        <p className="font-bold">
          <FallbackInitials initials={initials} />
        </p>
      )}
    </div>
  );
}
