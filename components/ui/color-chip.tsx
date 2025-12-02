"use client";

import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { getTailwindColorValue } from "@/constants/tailwind-color";

interface ColorChipProps {
  /**
   * Tailwind color string (e.g., "blue-500", "red-200")
   */
  color: string;
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
}

/**
 * Determines text color (black or white) based on color brightness.
 * Uses a simple heuristic for common Tailwind colors.
 *
 * @param color - The Tailwind color string
 * @returns "text-white" or "text-black"
 */
const getTextColorClass = (color: string): string => {
  // Special cases for colors without shade (e.g., white, black)
  if (color === "white") return "text-black";
  if (color === "black") return "text-white";

  // Extract number from color
  const match = color.match(/-(\d+)$/);
  if (!match) return "text-black";

  const shade = parseInt(match[1], 10);
  // Colors with shade >= 500 are generally dark, use white text
  // Colors with shade < 500 are generally light, use black text
  return shade >= 500 ? "text-white" : "text-black";
};

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
  const textColorClass = getTextColorClass(color);

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
