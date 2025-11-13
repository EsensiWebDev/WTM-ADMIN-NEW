import { HotelGalleryProps } from "@/app/(dashboard)/hotel-listing/create/types";
import Image from "next/image";

function ImageItem({
  src,
  className = "",
  overlay,
}: {
  src: string;
  className?: string;
  overlay?: React.ReactNode;
}) {
  return (
    <div
      className={`group relative aspect-1/1 overflow-hidden rounded ${className}`}
    >
      <Image
        alt="Hotel image"
        src={src}
        className="absolute size-full object-cover group-hover:opacity-75"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {overlay}
    </div>
  );
}

export function HotelGallery({
  images = [],
  maxDisplay = 5,
}: HotelGalleryProps) {
  if (!images.length) return null;

  // Calculate how many images to show and how many are hidden
  const showCount = Math.min(images.length, maxDisplay);
  const hiddenCount = images.length - showCount;
  const mainImage = images[0];
  const galleryImages = images.slice(1, showCount - (hiddenCount > 0 ? 1 : 0));
  const moreImage = images[showCount - 1];

  return (
    <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-4 sm:grid-rows-2 sm:gap-x-6 lg:gap-6">
      {/* Main image */}
      <ImageItem
        src={mainImage}
        className="sm:col-span-2 sm:row-span-2 sm:aspect-square"
      />

      {/* Gallery images */}
      {galleryImages.map((src, i) => (
        <ImageItem key={src + i} src={src} className="sm:aspect-auto" />
      ))}

      {/* More images overlay */}
      {hiddenCount > 0 && (
        <ImageItem
          src={moreImage}
          className="sm:aspect-auto"
          overlay={
            <>
              <div
                className="absolute inset-0 bg-black opacity-50"
                aria-hidden
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <span className="text-5xl text-white">+{hiddenCount}</span>
              </div>
            </>
          }
        />
      )}
    </div>
  );
}
