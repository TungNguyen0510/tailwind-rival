"use client";

import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { getTailwindColorValue, getTextColorClass } from "@/utils/utils";

interface ColorChipProps {
  color: string;
  onRemove?: () => void;
  /**
   * Whether to show the remove button
   * @default true (if onRemove is provided)
   */
  showRemove?: boolean;
  className?: string;
}

/**
 * ColorChip component displays a Tailwind color as a chip with background color.
 * Uses the generic Chip component and adds color-specific styling via inline styles.
 *
 * @param color - Tailwind color string (e.g., "blue-500")
 * @param onRemove - Callback function when remove button is clicked (optional)
 * @param showRemove - Whether to show the remove button (default: true if onRemove is provided)
 * @param className - Additional CSS classes
 */
const ColorChip = ({
  color,
  onRemove,
  showRemove,
  className,
}: ColorChipProps) => {
  const backgroundColor = getTailwindColorValue(color);
  const textColorClass = getTextColorClass(color, backgroundColor);

  const style: React.CSSProperties = backgroundColor
    ? {
        backgroundColor,
        color: textColorClass === "text-white" ? "#ffffff" : "#111111",
      }
    : {};

  return (
    <Chip
      onRemove={onRemove}
      showRemove={showRemove}
      className={cn(
        textColorClass === "text-white" ? "text-white" : "text-black",
        className
      )}
      style={style}
    >
      {color}
    </Chip>
  );
};

export { ColorChip };
