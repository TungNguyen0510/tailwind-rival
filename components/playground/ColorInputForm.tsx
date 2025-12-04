"use client";

import { useState, KeyboardEvent } from "react";
import { ColorChip } from "@/components/ui/color-chip";

interface ColorInputFormProps {
  colors: string[];
  onColorsChange: (colors: string[]) => void;
}

/**
 * Component for inputting Tailwind CSS color classes.
 * Displays colors as chips with their background colors and allows removal.
 * Chips are rendered inline inside a single input-like container.
 *
 * @param colors - Array of Tailwind color strings (e.g., "blue-500", "red-200")
 * @param onColorsChange - Callback function when colors array changes
 */
const ColorInputForm = ({ colors, onColorsChange }: ColorInputFormProps) => {
  const [inputValue, setInputValue] = useState("");

  /**
   * Validates if the input is a valid Tailwind color format.
   * Supported formats:
   * - color-name-number (e.g., blue-500, red-200, green-100)
   * - color-name (e.g., blue, red) -> will be normalized to color-name-500
   *
   * @param value - The input string to validate
   * @returns true if valid, false otherwise
   */
  const isValidTailwindColor = (value: string): boolean => {
    // Pattern: color-name or color-name-number
    // e.g., "blue" or "blue-500"
    const tailwindColorPattern = /^[a-z]+(?:-\d+)?$/;
    return tailwindColorPattern.test(value.trim());
  };

  /**
   * Handles adding a new color when Enter is pressed or input loses focus.
   */
  const handleAddColor = () => {
    const trimmedValue = inputValue.trim().toLowerCase();

    if (!trimmedValue) return;

    // Validate format
    if (!isValidTailwindColor(trimmedValue)) {
      return;
    }

    const match = trimmedValue.match(/^([a-z]+)(?:-(\d+))?$/);
    if (!match) return;

    const baseColor = match[1];
    const shade = match[2] ?? "500";

    const normalizedValue =
      !match[2] && (baseColor === "white" || baseColor === "black")
        ? baseColor
        : `${baseColor}-${shade}`;

    // Check if color already exists
    if (colors.includes(normalizedValue)) {
      setInputValue("");
      return;
    }

    // Add color to array
    onColorsChange([...colors, normalizedValue]);
    setInputValue("");
  };

  /**
   * Handles key press events in the input field.
   * Adds color on Enter key press.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddColor();
    }
  };

  /**
   * Removes a color from the colors array.
   *
   * @param colorToRemove - The color string to remove
   */
  const handleRemoveColor = (colorToRemove: string) => {
    onColorsChange(colors.filter((color) => color !== colorToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-card-foreground/10 bg-transparent px-1 py-1 text-base shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring md:text-sm">
        {colors.map((color) => (
          <ColorChip
            key={color}
            color={color}
            onRemove={() => handleRemoveColor(color)}
          />
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAddColor}
          placeholder={
            colors.length === 0
              ? "Enter Tailwind color (e.g., red-200, blue-500)"
              : ""
          }
          className="flex-1 min-w-[120px] border-none bg-transparent ml-2 px-0 py-1 text-sm text-card-foreground placeholder:text-card-foreground/50 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default ColorInputForm;
