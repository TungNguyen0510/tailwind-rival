/**
 * Arbitrary value validation for Tailwind CSS
 * Validates JIT arbitrary values like bg-[#color], w-[100px], etc.
 */

/**
 * Validate arbitrary color values
 */
export function isValidColor(value: string): boolean {
  // Hex colors
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) {
    return true;
  }

  // RGB/RGBA
  if (/^rgba?\([^)]+\)$/.test(value)) {
    return true;
  }

  // HSL/HSLA
  if (/^hsla?\([^)]+\)$/.test(value)) {
    return true;
  }

  // Named colors
  const namedColors = ['transparent', 'currentColor', 'inherit', 'black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gray', 'orange'];
  if (namedColors.includes(value.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Validate arbitrary length values
 */
export function isValidLength(value: string): boolean {
  // Units: px, rem, em, %, vh, vw, vmin, vmax, ch, ex
  if (/^\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/.test(value)) {
    return true;
  }

  // Calc expression
  if (/^calc\([^)]+\)$/.test(value)) {
    return true;
  }

  // CSS variables
  if (/^var\(--[^)]+\)$/.test(value)) {
    return true;
  }

  return false;
}

/**
 * Validate arbitrary value based on property type
 */
export function validateArbitraryValue(className: string): { valid: boolean; message?: string } {
  const match = className.match(/^([a-z-]+)-\[([^\]]+)\]$/);

  if (!match) {
    return { valid: true }; // Not an arbitrary value
  }

  const [, property, value] = match;

  // Color properties
  const colorProps = ['bg', 'text', 'border', 'ring', 'shadow', 'from', 'via', 'to', 'decoration', 'divide', 'outline', 'caret', 'accent', 'placeholder'];
  if (colorProps.includes(property)) {
    if (!isValidColor(value)) {
      return {
        valid: false,
        message: `Invalid color value: ${value}. Use hex (#rgb, #rrggbb), rgb(), hsl(), or named colors.`,
      };
    }
  }

  // Length properties
  const lengthProps = ['w', 'h', 'min-w', 'max-w', 'min-h', 'max-h', 'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'gap', 'space-x', 'space-y'];
  if (lengthProps.includes(property)) {
    if (!isValidLength(value)) {
      return {
        valid: false,
        message: `Invalid length value: ${value}. Use units like px, rem, em, %, vh, vw, or calc().`,
      };
    }
  }

  return { valid: true };
}

/**
 * Detect conflicting Tailwind classes
 * 
 * Identifies when multiple classes affect the same CSS property,
 * which typically means only the last one will take effect.
 * 
 * @param classes - Array of Tailwind class names
 * @returns Array of conflict objects with conflicting classes and reason
 */
export function detectConflicts(classes: string[]): Array<{ classes: string[]; reason: string }> {
  const conflicts: Array<{ classes: string[]; reason: string }> = [];

  // Group classes by CSS property category
  const displays: string[] = [];
  const positions: string[] = [];
  const textSizes: string[] = [];
  const fontWeights: string[] = [];
  const textColors: string[] = [];
  const bgColors: string[] = [];
  const borderColors: string[] = [];
  const borderWidths: string[] = [];
  const borderRadii: string[] = [];
  const shadows: string[] = [];
  const opacities: string[] = [];
  const zIndices: string[] = [];
  const widths: string[] = [];
  const heights: string[] = [];
  const sizes: string[] = [];
  const gaps: string[] = [];
  const flexDirections: string[] = [];
  const flexWraps: string[] = [];
  const alignItems: string[] = [];
  const justifyContent: string[] = [];
  const textAligns: string[] = [];
  const overflows: string[] = [];
  const objectFits: string[] = [];

  // Padding/Margin - need more granular detection
  const paddings: Record<string, string[]> = { all: [], x: [], y: [], t: [], r: [], b: [], l: [] };
  const margins: Record<string, string[]> = { all: [], x: [], y: [], t: [], r: [], b: [], l: [] };

  // Iterate through classes and categorize them
  for (const className of classes) {
    // Display property (display: block, flex, grid, etc.)
    if (['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden', 'table', 'table-row', 'table-cell', 'flow-root', 'contents'].includes(className)) {
      displays.push(className);
    }

    // Position property (position: relative, absolute, etc.)
    if (['static', 'fixed', 'absolute', 'relative', 'sticky'].includes(className)) {
      positions.push(className);
    }

    // Text size (font-size)
    if (className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/)) {
      textSizes.push(className);
    }

    // Font weight (font-weight: 100-900)
    if (className.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)) {
      fontWeights.push(className);
    }

    // Text color (including palette colors and arbitrary values)
    if (className.match(/^text-([a-z]+-\d+|white|black|transparent|current|inherit)$/) ||
      className.match(/^text-\[[^\]]+\]$/)) {
      textColors.push(className);
    }

    // Background color (including palette colors and arbitrary values)
    if (className.match(/^bg-([a-z]+-\d+|white|black|transparent|current|inherit)$/) ||
      className.match(/^bg-\[[^\]]+\]$/)) {
      bgColors.push(className);
    }

    // Border color
    if (className.match(/^border-([a-z]+-\d+|white|black|transparent|current)$/) ||
      className.match(/^border-\[[^\]]+\]$/)) {
      borderColors.push(className);
    }

    // Border width (border-width property)
    if (className === 'border' || className.match(/^border-[0-9]+$/)) {
      borderWidths.push(className);
    }

    // Border radius (border-radius property)
    if (className.match(/^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/)) {
      borderRadii.push(className);
    }

    // Box shadow (box-shadow property)
    if (className.match(/^shadow(-none|-sm|-md|-lg|-xl|-2xl|-inner)?$/)) {
      shadows.push(className);
    }

    // Opacity (opacity: 0-100)
    if (className.match(/^opacity-\d+$/)) {
      opacities.push(className);
    }

    // Z-index (z-index property)
    if (className.match(/^z-\d+$/)) {
      zIndices.push(className);
    }

    // Width (including fractions and arbitrary values)
    if (className.match(/^w-([0-9]+|auto|full|screen|min|max|fit|\d+\/\d+)$/) ||
      className.match(/^w-\[[^\]]+\]$/)) {
      widths.push(className);
    }

    // Height (including fractions and arbitrary values)
    if (className.match(/^h-([0-9]+|auto|full|screen|min|max|fit|\d+\/\d+)$/) ||
      className.match(/^h-\[[^\]]+\]$/)) {
      heights.push(className);
    }

    // Size (sets both width and height - Tailwind v3.4+)
    if (className.match(/^size-([0-9]+|auto|full|screen|min|max|fit|\d+\/\d+)$/) ||
      className.match(/^size-\[[^\]]+\]$/)) {
      sizes.push(className);
    }

    // Gap (for flex/grid gap)
    if (className.match(/^gap-[0-9.]+$/)) {
      gaps.push(className);
    }

    // Flex direction (flex-direction property)
    if (['flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse'].includes(className)) {
      flexDirections.push(className);
    }

    // Flex wrap (flex-wrap property)
    if (['flex-wrap', 'flex-wrap-reverse', 'flex-nowrap'].includes(className)) {
      flexWraps.push(className);
    }

    // Align items (align-items property)
    if (['items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'].includes(className)) {
      alignItems.push(className);
    }

    // Justify content (justify-content property)
    if (['justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'].includes(className)) {
      justifyContent.push(className);
    }

    // Text alignment (text-align property)
    if (['text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end'].includes(className)) {
      textAligns.push(className);
    }

    // Overflow (overflow property)
    if (className.match(/^overflow-(auto|hidden|visible|scroll)$/)) {
      overflows.push(className);
    }

    // Object fit (object-fit property for images/videos)
    if (className.match(/^object-(contain|cover|fill|none|scale-down)$/)) {
      objectFits.push(className);
    }

    // Padding detection (handles all directions)
    if (className.match(/^p-[0-9.]+$/)) paddings.all.push(className);
    if (className.match(/^px-[0-9.]+$/)) paddings.x.push(className);
    if (className.match(/^py-[0-9.]+$/)) paddings.y.push(className);
    if (className.match(/^pt-[0-9.]+$/)) paddings.t.push(className);
    if (className.match(/^pr-[0-9.]+$/)) paddings.r.push(className);
    if (className.match(/^pb-[0-9.]+$/)) paddings.b.push(className);
    if (className.match(/^pl-[0-9.]+$/)) paddings.l.push(className);

    // Margin detection (handles all directions, including auto)
    if (className.match(/^m-([0-9.]+|auto)$/)) margins.all.push(className);
    if (className.match(/^mx-([0-9.]+|auto)$/)) margins.x.push(className);
    if (className.match(/^my-([0-9.]+|auto)$/)) margins.y.push(className);
    if (className.match(/^mt-([0-9.]+|auto)$/)) margins.t.push(className);
    if (className.match(/^mr-([0-9.]+|auto)$/)) margins.r.push(className);
    if (className.match(/^mb-([0-9.]+|auto)$/)) margins.b.push(className);
    if (className.match(/^ml-([0-9.]+|auto)$/)) margins.l.push(className);
  }

  // Report conflicts for all categories
  if (displays.length > 1) {
    conflicts.push({ classes: displays, reason: 'Multiple display values' });
  }

  if (positions.length > 1) {
    conflicts.push({ classes: positions, reason: 'Multiple position values' });
  }

  if (textSizes.length > 1) {
    conflicts.push({ classes: textSizes, reason: 'Multiple text sizes' });
  }

  if (fontWeights.length > 1) {
    conflicts.push({ classes: fontWeights, reason: 'Multiple font weights' });
  }

  if (textColors.length > 1) {
    conflicts.push({ classes: textColors, reason: 'Multiple text colors' });
  }

  if (bgColors.length > 1) {
    conflicts.push({ classes: bgColors, reason: 'Multiple background colors' });
  }

  if (borderColors.length > 1) {
    conflicts.push({ classes: borderColors, reason: 'Multiple border colors' });
  }

  if (borderWidths.length > 1) {
    conflicts.push({ classes: borderWidths, reason: 'Multiple border widths' });
  }

  if (borderRadii.length > 1) {
    conflicts.push({ classes: borderRadii, reason: 'Multiple border radii' });
  }

  if (shadows.length > 1) {
    conflicts.push({ classes: shadows, reason: 'Multiple shadows' });
  }

  if (opacities.length > 1) {
    conflicts.push({ classes: opacities, reason: 'Multiple opacity values' });
  }

  if (zIndices.length > 1) {
    conflicts.push({ classes: zIndices, reason: 'Multiple z-index values' });
  }

  if (widths.length > 1) {
    conflicts.push({ classes: widths, reason: 'Multiple width values' });
  }

  if (heights.length > 1) {
    conflicts.push({ classes: heights, reason: 'Multiple height values' });
  }

  if (sizes.length > 1) {
    conflicts.push({ classes: sizes, reason: 'Multiple size values (width & height)' });
  }

  if (gaps.length > 1) {
    conflicts.push({ classes: gaps, reason: 'Multiple gap values' });
  }

  if (flexDirections.length > 1) {
    conflicts.push({ classes: flexDirections, reason: 'Multiple flex directions' });
  }

  if (flexWraps.length > 1) {
    conflicts.push({ classes: flexWraps, reason: 'Multiple flex wrap values' });
  }

  if (alignItems.length > 1) {
    conflicts.push({ classes: alignItems, reason: 'Multiple align-items values' });
  }

  if (justifyContent.length > 1) {
    conflicts.push({ classes: justifyContent, reason: 'Multiple justify-content values' });
  }

  if (textAligns.length > 1) {
    conflicts.push({ classes: textAligns, reason: 'Multiple text-align values' });
  }

  if (overflows.length > 1) {
    conflicts.push({ classes: overflows, reason: 'Multiple overflow values' });
  }

  if (objectFits.length > 1) {
    conflicts.push({ classes: objectFits, reason: 'Multiple object-fit values' });
  }

  // Check padding conflicts
  if (paddings.all.length > 1) {
    conflicts.push({ classes: paddings.all, reason: 'Multiple padding values' });
  }
  if (paddings.x.length > 1) {
    conflicts.push({ classes: paddings.x, reason: 'Multiple padding-x values' });
  }
  if (paddings.y.length > 1) {
    conflicts.push({ classes: paddings.y, reason: 'Multiple padding-y values' });
  }
  if (paddings.t.length > 1) {
    conflicts.push({ classes: paddings.t, reason: 'Multiple padding-top values' });
  }
  if (paddings.r.length > 1) {
    conflicts.push({ classes: paddings.r, reason: 'Multiple padding-right values' });
  }
  if (paddings.b.length > 1) {
    conflicts.push({ classes: paddings.b, reason: 'Multiple padding-bottom values' });
  }
  if (paddings.l.length > 1) {
    conflicts.push({ classes: paddings.l, reason: 'Multiple padding-left values' });
  }

  // Check margin conflicts
  if (margins.all.length > 1) {
    conflicts.push({ classes: margins.all, reason: 'Multiple margin values' });
  }
  if (margins.x.length > 1) {
    conflicts.push({ classes: margins.x, reason: 'Multiple margin-x values' });
  }
  if (margins.y.length > 1) {
    conflicts.push({ classes: margins.y, reason: 'Multiple margin-y values' });
  }
  if (margins.t.length > 1) {
    conflicts.push({ classes: margins.t, reason: 'Multiple margin-top values' });
  }
  if (margins.r.length > 1) {
    conflicts.push({ classes: margins.r, reason: 'Multiple margin-right values' });
  }
  if (margins.b.length > 1) {
    conflicts.push({ classes: margins.b, reason: 'Multiple margin-bottom values' });
  }
  if (margins.l.length > 1) {
    conflicts.push({ classes: margins.l, reason: 'Multiple margin-left values' });
  }

  return conflicts;
}
