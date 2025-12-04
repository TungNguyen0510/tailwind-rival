"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipProps {
  /**
   * Content to display inside the chip
   */
  children: React.ReactNode;
  /**
   * Callback function when chip is removed
   */
  onRemove?: () => void;
  /**
   * Whether to show the remove button
   * @default true (if onRemove is provided)
   */
  showRemove?: boolean;
  /**
   * Additional className for the chip container
   */
  className?: string;
  /**
   * Inline styles for the chip container
   */
  style?: React.CSSProperties;
}

/**
 * Generic Chip component for displaying content as a chip/badge.
 * Optionally includes a remove button (X) to delete the chip.
 *
 * @param children - Content to display inside the chip
 * @param onRemove - Callback function when remove button is clicked (optional)
 * @param showRemove - Whether to show the remove button (default: true if onRemove is provided)
 * @param className - Additional CSS classes
 */
const Chip = ({
  children,
  onRemove,
  showRemove,
  className,
  style,
}: ChipProps) => {
  // Show remove button by default if onRemove is provided
  const shouldShowRemove =
    showRemove !== undefined ? showRemove : onRemove !== undefined;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border",
        "border-black/10 dark:border-white/10",
        className
      )}
      style={style}
    >
      <span className="flex flex-row items-center gap-1">{children}</span>
      {shouldShowRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "ml-0.5 rounded-full p-0.5 hover:bg-black/20 dark:hover:bg-white/20 transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-black/50 dark:focus:ring-white/50"
          )}
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export { Chip };
