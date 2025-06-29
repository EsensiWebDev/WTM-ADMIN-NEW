interface ImageGridProps {
  images: {
    title: string;
    src?: string;
    alt?: string;
  }[];
  className?: string;
}

export function ImageGrid({ images, className }: ImageGridProps) {
  return (
    <div className={`w-full grid gap-4 md:gap-6 ${className}`}>
      {/* Mobile Layout: Single column */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {images.map((image, index) => (
          <div key={image.title} className="flex flex-col">
            <p className="font-medium tracking-tight mb-2">{image.title}</p>
            <div className="w-full aspect-square rounded-lg border border-dashed flex justify-center items-center text-lg">
              {image.src ? (
                <img
                  src={image.src}
                  alt={image.alt || image.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-muted-foreground">Image</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tablet Layout: 2 columns */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={image.title} className="flex flex-col">
            <p className="font-medium tracking-tight mb-2">{image.title}</p>
            <div className="w-full aspect-square rounded-lg border border-dashed flex justify-center items-center text-lg">
              {image.src ? (
                <img
                  src={image.src}
                  alt={image.alt || image.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-muted-foreground">Image</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout: 3x2 grid with first item spanning 2 rows */}
      <div className="hidden lg:grid grid-cols-3 grid-rows-2 gap-6">
        {images.map((image, index) => {
          const isFirst = index === 0;
          const gridClasses = isFirst
            ? "row-span-2 h-full flex flex-col"
            : "flex flex-col";

          return (
            <div key={image.title} className={gridClasses}>
              <p className="font-medium tracking-tight mb-2">{image.title}</p>
              <div
                className={`w-full rounded-lg border border-dashed flex justify-center items-center text-lg ${
                  isFirst ? "aspect-[9/16]" : "h-full"
                }`}
              >
                {image.src ? (
                  <img
                    src={image.src}
                    alt={image.alt || image.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-muted-foreground">Image</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
