"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  maxStars?: number;
  className?: string;
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  (
    {
      value = 0,
      onChange,
      readonly = false,
      maxStars = 5,
      className,
      ...props
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const handleClick = (index: number) => {
      if (readonly) return;
      const newValue = index + 1;
      onChange?.(newValue);
    };

    const handleMouseEnter = (index: number) => {
      if (readonly) return;
      setHoverValue(index + 1);
    };

    const handleMouseLeave = () => {
      if (readonly) return;
      setHoverValue(null);
    };

    const displayValue = hoverValue ?? value;

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= displayValue;

          return (
            <button
              key={index}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "text-2xl transition-colors focus:outline-none",
                readonly
                  ? "cursor-default"
                  : "cursor-pointer hover:text-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:rounded-sm",
                isActive ? "text-yellow-500" : "text-muted-foreground"
              )}
              aria-label={`Rate ${starValue} out of ${maxStars} stars`}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  }
);

StarRating.displayName = "StarRating";

export { StarRating };
