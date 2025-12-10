/**
 * Tailwind CSS IntelliSense using @tailwindcss/browser@4
 * Dynamically extracts ALL utility classes from Tailwind v4
 */

interface TailwindClass {
  name: string;
  css: string;
  variants?: string[];
}

let tailwindClassesCache: Map<string, TailwindClass> | null = null;
let isLoading = false;

/**
 * Load Tailwind CSS browser module and extract all utility classes
 */
export async function loadTailwindClasses(): Promise<Map<string, TailwindClass>> {
  // Return cache if already loaded
  if (tailwindClassesCache) {
    return tailwindClassesCache;
  }

  // Prevent multiple simultaneous loads
  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return tailwindClassesCache!;
  }

  isLoading = true;

  try {
    // Load @tailwindcss/browser from CDN
    const response = await fetch('https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4');
    const code = await response.text();

    // Create a module context
    const module = { exports: {} };
    const exports = module.exports;

    // Execute the Tailwind browser code
    const fn = new Function('module', 'exports', code);
    fn(module, exports);

    // @ts-ignore
    const tailwind = module.exports.default || module.exports;

    // Extract all utility classes by processing a comprehensive HTML template
    const comprehensiveClasses = generateComprehensiveClassList();

    // Compile with Tailwind to get CSS and understand which classes exist
    const result = await tailwind.compile(
      `@import "tailwindcss";`,
      comprehensiveClasses
    );

    // Parse the generated CSS to extract class definitions
    const classes = parseGeneratedCSS(result.css);

    tailwindClassesCache = classes;
    return classes;
  } catch (error) {
    console.error('Failed to load Tailwind classes:', error);
    // Fallback to empty map
    tailwindClassesCache = new Map();
    return tailwindClassesCache;
  } finally {
    isLoading = false;
  }
}

/**
 * Generate a comprehensive list of Tailwind classes to extract
 */
function generateComprehensiveClassList(): string {
  const classes: string[] = [];

  // Layout
  classes.push('block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden');

  // Flexbox
  classes.push('flex-row', 'flex-col', 'flex-wrap', 'items-center', 'justify-center', 'gap-4');

  // Spacing (comprehensive)
  for (let i = 0; i <= 96; i += 1) {
    classes.push(`p-${i}`, `m-${i}`, `px-${i}`, `py-${i}`, `mx-${i}`, `my-${i}`);
    classes.push(`pt-${i}`, `pb-${i}`, `pl-${i}`, `pr-${i}`);
    classes.push(`mt-${i}`, `mb-${i}`, `ml-${i}`, `mr-${i}`);
  }

  // Sizing
  for (let i = 0; i <= 96; i += 1) {
    classes.push(`w-${i}`, `h-${i}`, `size-${i}`);
  }
  classes.push('w-full', 'w-screen', 'w-auto', 'w-min', 'w-max', 'w-fit');
  classes.push('h-full', 'h-screen', 'h-auto', 'h-min', 'h-max', 'h-fit');
  classes.push('size-full', 'size-screen', 'size-auto', 'size-min', 'size-max', 'size-fit');

  // Typography
  classes.push('text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl');
  classes.push('font-thin', 'font-normal', 'font-medium', 'font-semibold', 'font-bold');
  classes.push('text-left', 'text-center', 'text-right');

  // Colors
  const colors = ['gray', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo'];
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  for (const color of colors) {
    for (const shade of shades) {
      classes.push(`text-${color}-${shade}`, `bg-${color}-${shade}`, `border-${color}-${shade}`);
    }
  }

  // Borders
  classes.push('border', 'border-2', 'border-4', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-full');

  // Effects
  classes.push('shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl');
  classes.push('opacity-0', 'opacity-50', 'opacity-100');

  // Position
  classes.push('static', 'fixed', 'absolute', 'relative', 'sticky');
  classes.push('top-0', 'right-0', 'bottom-0', 'left-0', 'inset-0');

  // Responsive variants
  const responsiveClasses = ['sm', 'md', 'lg', 'xl', '2xl'].map(bp =>
    [`${bp}:block`, `${bp}:flex`, `${bp}:grid`, `${bp}:hidden`, `${bp}:text-lg`]
  ).flat();
  classes.push(...responsiveClasses);

  // Pseudo-class variants (hover, focus, active, etc.)
  const pseudoStates = ['hover', 'focus', 'active', 'visited', 'target', 'focus-within', 'focus-visible'];
  const pseudoClasses = pseudoStates.map(state =>
    [`${state}:bg-blue-500`, `${state}:text-white`, `${state}:scale-105`, `${state}:opacity-100`]
  ).flat();
  classes.push(...pseudoClasses);

  // Form state variants
  const formStates = ['disabled', 'enabled', 'checked', 'indeterminate', 'default', 'required', 'valid', 'invalid', 'in-range', 'out-of-range', 'placeholder-shown', 'autofill', 'read-only'];
  const formClasses = formStates.map(state =>
    [`${state}:opacity-50`, `${state}:cursor-not-allowed`, `${state}:bg-gray-100`]
  ).flat();
  classes.push(...formClasses);

  // Dark mode variants
  const darkModeClasses = [
    'dark:bg-black', 'dark:bg-gray-900', 'dark:bg-gray-800',
    'dark:text-white', 'dark:text-gray-100', 'dark:text-gray-200',
    'dark:border-gray-700', 'dark:border-gray-600',
  ];
  classes.push(...darkModeClasses);

  // Group variants
  const groupVariants = [
    'group-hover:opacity-100', 'group-hover:scale-110', 'group-hover:translate-x-1',
    'group-focus:opacity-100', 'group-active:scale-95',
  ];
  classes.push(...groupVariants);

  // Peer variants
  const peerVariants = [
    'peer-checked:bg-blue-500', 'peer-focus:ring-2', 'peer-disabled:opacity-50',
    'peer-invalid:border-red-500', 'peer-placeholder-shown:opacity-0',
  ];
  classes.push(...peerVariants);

  // Container queries (@container variants for Tailwind v4)
  const containerVariants = ['sm', 'md', 'lg', 'xl', '2xl'].map(size =>
    [`@${size}:flex`, `@${size}:grid`, `@${size}:block`, `@${size}:hidden`]
  ).flat();
  classes.push(...containerVariants);

  // First/Last/Odd/Even child variants
  const childVariants = [
    'first:rounded-t-lg', 'last:rounded-b-lg',
    'odd:bg-gray-50', 'even:bg-white',
    'first-of-type:mt-0', 'last-of-type:mb-0',
  ];
  classes.push(...childVariants);

  // Print variant
  const printClasses = ['print:hidden', 'print:block', 'print:text-black'];
  classes.push(...printClasses);

  // Motion variants
  const motionClasses = [
    'motion-safe:animate-spin', 'motion-reduce:animate-none',
    'motion-safe:transition-all', 'motion-reduce:transition-none',
  ];
  classes.push(...motionClasses);

  // RTL/LTR variants
  const directionClasses = [
    'rtl:text-right', 'ltr:text-left',
    'rtl:mr-2', 'ltr:ml-2',
  ];
  classes.push(...directionClasses);

  // Data attributes variants
  const dataVariants = [
    'data-[state=open]:block', 'data-[state=closed]:hidden',
    'data-[active=true]:bg-blue-500', 'data-[disabled=true]:opacity-50',
  ];
  classes.push(...dataVariants);

  // Aria attributes variants
  const ariaVariants = [
    'aria-disabled:opacity-50', 'aria-selected:bg-blue-500',
    'aria-checked:bg-green-500', 'aria-expanded:rotate-180',
    'aria-hidden:invisible', 'aria-current:font-bold',
  ];
  classes.push(...ariaVariants);

  // Supports queries
  const supportsVariants = [
    'supports-[display:grid]:grid', 'supports-[backdrop-filter]:backdrop-blur',
  ];
  classes.push(...supportsVariants);

  // Before/After pseudo-elements
  const pseudoElements = [
    'before:content-[""]', 'after:content-[""]',
    'before:absolute', 'after:absolute',
    'before:block', 'after:block',
  ];
  classes.push(...pseudoElements);

  // Marker pseudo-element (for list items)
  const markerVariants = [
    'marker:text-blue-500', 'marker:text-sm',
  ];
  classes.push(...markerVariants);

  // Selection pseudo-element
  const selectionVariants = [
    'selection:bg-blue-200', 'selection:text-white',
  ];
  classes.push(...selectionVariants);

  // File input button
  const fileVariants = [
    'file:mr-4', 'file:py-2', 'file:px-4',
    'file:rounded', 'file:border-0',
    'file:bg-blue-50', 'file:text-blue-700',
  ];
  classes.push(...fileVariants);

  // Placeholder
  const placeholderVariants = [
    'placeholder:text-gray-400', 'placeholder:italic',
    'placeholder:text-sm', 'placeholder:opacity-50',
  ];
  classes.push(...placeholderVariants);

  // Empty pseudo-class
  const emptyVariants = [
    'empty:hidden', 'empty:p-0',
  ];
  classes.push(...emptyVariants);

  // Open/Closed states (for <details> and <dialog>)
  const openClosedVariants = [
    'open:block', 'open:opacity-100',
  ];
  classes.push(...openClosedVariants);

  // Backdrop pseudo-element (for dialogs)
  const backdropVariants = [
    'backdrop:bg-black', 'backdrop:opacity-50',
  ];
  classes.push(...backdropVariants);

  // Logical properties (Tailwind v4)
  const logicalProps = [
    'ps-4', 'pe-4', 'ms-2', 'me-2',
    'border-s', 'border-e',
  ];
  classes.push(...logicalProps);

  // Size utilities (Tailwind v4 - combined width and height)
  for (const val of [1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96]) {
    classes.push(`size-${val}`);
  }

  return `<div class="${classes.join(' ')}"></div>`;
}

/**
 * Parse generated CSS to extract class definitions
 */
function parseGeneratedCSS(css: string): Map<string, TailwindClass> {
  const classes = new Map<string, TailwindClass>();

  // Simple regex to extract class names and their CSS
  const classRegex = /\.([a-z0-9\-_\\\/:\[\]]+)\s*\{([^}]+)\}/gi;

  let match;
  while ((match = classRegex.exec(css)) !== null) {
    const [, className, cssContent] = match;

    // Clean up class name (remove escapes)
    const cleanClassName = className.replace(/\\/g, '');

    classes.set(cleanClassName, {
      name: cleanClassName,
      css: cssContent.trim(),
    });
  }

  return classes;
}

/**
 * Get completion suggestions for a given prefix
 */
export function getTailwindCompletions(
  prefix: string,
  classes: Map<string, TailwindClass>
): Array<{ label: string; detail: string; documentation: string }> {
  const suggestions: Array<{ label: string; detail: string; documentation: string }> = [];

  const lowerPrefix = prefix.toLowerCase();

  for (const [className, classData] of Array.from(classes.entries())) {
    // Match by prefix
    if (className.toLowerCase().startsWith(lowerPrefix)) {
      suggestions.push({
        label: className,
        detail: `Tailwind v4 Utility`,
        documentation: classData.css || 'Tailwind CSS utility class',
      });
    }
  }

  // Sort by relevance
  suggestions.sort((a, b) => {
    // Exact match first
    if (a.label === prefix) return -1;
    if (b.label === prefix) return 1;

    // Shorter matches first
    if (a.label.length !== b.label.length) {
      return a.label.length - b.label.length;
    }

    // Alphabetical
    return a.label.localeCompare(b.label);
  });

  return suggestions;
}

/**
 * Simple approach: Use a predefined comprehensive list
 * This is faster than parsing CSS and covers most use cases
 */
export async function getQuickTailwindClasses(): Promise<string[]> {
  try {
    // Load from CDN a pre-generated list if available
    // For now, we'll generate a comprehensive static list
    return generateQuickClassList();
  } catch {
    return generateQuickClassList();
  }
}

function generateQuickClassList(): string[] {
  const classes: string[] = [];

  // Layout & Display
  classes.push('block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden', 'table', 'flow-root');

  // Container
  classes.push('container');

  // Flexbox & Grid
  const flexDirections = ['flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse'];
  const flexWrap = ['flex-wrap', 'flex-wrap-reverse', 'flex-nowrap'];
  const alignItems = ['items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'];
  const justifyContent = ['justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'];
  const alignContent = ['content-start', 'content-end', 'content-center', 'content-between', 'content-around', 'content-evenly'];

  classes.push(...flexDirections, ...flexWrap, ...alignItems, ...justifyContent, ...alignContent);

  // Spacing
  const spacingValues = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];
  const spacingProps = ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'];
  const gapProps = ['gap', 'gap-x', 'gap-y'];

  for (const prop of spacingProps) {
    for (const val of spacingValues) {
      classes.push(`${prop}-${val}`);
    }
    if (prop.startsWith('m')) {
      classes.push(`${prop}-auto`);
    }
  }

  for (const prop of gapProps) {
    for (const val of spacingValues) {
      classes.push(`${prop}-${val}`);
    }
  }

  // Sizing
  const sizeValues = [...spacingValues, 'auto', 'full', 'screen', 'min', 'max', 'fit'];
  for (const val of sizeValues) {
    classes.push(`w-${val}`, `h-${val}`);
  }

  // Fractions for width/height
  const fractions = ['1/2', '1/3', '2/3', '1/4', '2/4', '3/4', '1/5', '2/5', '3/5', '4/5'];
  for (const frac of fractions) {
    classes.push(`w-${frac}`, `h-${frac}`);
  }

  // Typography
  const textSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
  const fontWeights = ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'];
  const textAlign = ['left', 'center', 'right', 'justify'];

  for (const size of textSizes) {
    classes.push(`text-${size}`);
  }
  for (const weight of fontWeights) {
    classes.push(`font-${weight}`);
  }
  for (const align of textAlign) {
    classes.push(`text-${align}`);
  }

  classes.push('underline', 'line-through', 'no-underline', 'uppercase', 'lowercase', 'capitalize', 'normal-case');

  // Colors - Generate for common colors
  const colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  classes.push('text-white', 'text-black', 'bg-white', 'bg-black', 'bg-transparent', 'border-white', 'border-black');

  for (const color of colors) {
    for (const shade of shades) {
      classes.push(`text-${color}-${shade}`, `bg-${color}-${shade}`, `border-${color}-${shade}`);
    }
  }

  // Borders
  classes.push('border', 'border-0', 'border-2', 'border-4', 'border-8');
  classes.push('border-t', 'border-r', 'border-b', 'border-l');
  classes.push('rounded', 'rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full');

  // Effects
  classes.push('shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner', 'shadow-none');

  for (let i = 0; i <= 100; i += 5) {
    classes.push(`opacity-${i}`);
  }

  // Position
  classes.push('static', 'fixed', 'absolute', 'relative', 'sticky');
  classes.push('inset-0', 'top-0', 'right-0', 'bottom-0', 'left-0');

  // Z-index
  for (const z of [0, 10, 20, 30, 40, 50]) {
    classes.push(`z-${z}`);
  }

  // Transitions
  classes.push('transition', 'transition-none', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform');
  classes.push('duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000');
  classes.push('ease-linear', 'ease-in', 'ease-out', 'ease-in-out');

  // Transforms
  for (const val of [0, 50, 75, 90, 95, 100, 105, 110, 125, 150]) {
    classes.push(`scale-${val}`);
  }

  // Interactivity
  classes.push('cursor-auto', 'cursor-pointer', 'cursor-not-allowed', 'pointer-events-none', 'pointer-events-auto', 'select-none', 'select-text', 'select-all');

  // Overflow
  classes.push('overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll');
  classes.push('overflow-x-auto', 'overflow-y-auto', 'overflow-x-hidden', 'overflow-y-hidden');

  return classes;
}
