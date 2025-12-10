/**
 * Tailwind CSS documentation and descriptions
 * Provides hover information for all utility classes
 */

interface TailwindDoc {
  description: string;
  css?: string;
  category: string;
}

/**
 * Get documentation for a Tailwind class
 */
export function getTailwindDocumentation(className: string): TailwindDoc | null {
  // Layout & Display
  if (className === 'block') return { description: 'Sets display to block', css: 'display: block;', category: 'Layout' };
  if (className === 'inline-block') return { description: 'Sets display to inline-block', css: 'display: inline-block;', category: 'Layout' };
  if (className === 'inline') return { description: 'Sets display to inline', css: 'display: inline;', category: 'Layout' };
  if (className === 'flex') return { description: 'Creates a flex container', css: 'display: flex;', category: 'Flexbox' };
  if (className === 'inline-flex') return { description: 'Creates an inline flex container', css: 'display: inline-flex;', category: 'Flexbox' };
  if (className === 'grid') return { description: 'Creates a grid container', css: 'display: grid;', category: 'Grid' };
  if (className === 'inline-grid') return { description: 'Creates an inline grid container', css: 'display: inline-grid;', category: 'Grid' };
  if (className === 'hidden') return { description: 'Hides the element', css: 'display: none;', category: 'Layout' };
  if (className === 'container') return { description: 'Sets max-width based on breakpoints', css: 'max-width: 100%; responsive breakpoints', category: 'Layout' };

  // Flexbox
  if (className === 'flex-row') return { description: 'Sets flex direction to row', css: 'flex-direction: row;', category: 'Flexbox' };
  if (className === 'flex-col') return { description: 'Sets flex direction to column', css: 'flex-direction: column;', category: 'Flexbox' };
  if (className === 'flex-wrap') return { description: 'Allows flex items to wrap', css: 'flex-wrap: wrap;', category: 'Flexbox' };
  if (className === 'flex-nowrap') return { description: 'Prevents flex items from wrapping', css: 'flex-wrap: nowrap;', category: 'Flexbox' };

  if (className === 'items-start') return { description: 'Aligns items to the start', css: 'align-items: flex-start;', category: 'Flexbox' };
  if (className === 'items-center') return { description: 'Centers items vertically', css: 'align-items: center;', category: 'Flexbox' };
  if (className === 'items-end') return { description: 'Aligns items to the end', css: 'align-items: flex-end;', category: 'Flexbox' };
  if (className === 'items-baseline') return { description: 'Aligns items to baseline', css: 'align-items: baseline;', category: 'Flexbox' };
  if (className === 'items-stretch') return { description: 'Stretches items to fill', css: 'align-items: stretch;', category: 'Flexbox' };

  if (className === 'justify-start') return { description: 'Justifies content to start', css: 'justify-content: flex-start;', category: 'Flexbox' };
  if (className === 'justify-center') return { description: 'Centers content horizontally', css: 'justify-content: center;', category: 'Flexbox' };
  if (className === 'justify-end') return { description: 'Justifies content to end', css: 'justify-content: flex-end;', category: 'Flexbox' };
  if (className === 'justify-between') return { description: 'Distributes with space between', css: 'justify-content: space-between;', category: 'Flexbox' };
  if (className === 'justify-around') return { description: 'Distributes with space around', css: 'justify-content: space-around;', category: 'Flexbox' };
  if (className === 'justify-evenly') return { description: 'Distributes evenly', css: 'justify-content: space-evenly;', category: 'Flexbox' };

  // Spacing - Dynamic
  const spacingMatch = className.match(/^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y)-(.+)$/);
  if (spacingMatch) {
    const [, prop, value] = spacingMatch;
    const propNames: Record<string, string> = {
      p: 'padding', px: 'padding-left & padding-right', py: 'padding-top & padding-bottom',
      pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left',
      m: 'margin', mx: 'margin-left & margin-right', my: 'margin-top & margin-bottom',
      mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left',
      gap: 'gap', 'gap-x': 'column-gap', 'gap-y': 'row-gap',
    };

    const remValue = value === 'auto' ? 'auto' : parseFloat(value) * 0.25;
    const cssValue = value === 'auto' ? 'auto' : `${remValue}rem (${parseFloat(value) * 4}px)`;

    return {
      description: `Sets ${propNames[prop]} to ${cssValue}`,
      css: `${propNames[prop]}: ${remValue}${value === 'auto' ? '' : 'rem'};`,
      category: 'Spacing',
    };
  }

  // Sizing
  const sizeMatch = className.match(/^(w|h|size)-(.+)$/);
  if (sizeMatch) {
    const [, prop, value] = sizeMatch;
    const propName = prop === 'size' ? 'width & height' : prop === 'w' ? 'width' : 'height';

    let cssValue = value;
    if (value === 'full') cssValue = '100%';
    else if (value === 'screen') cssValue = prop === 'w' ? '100vw' : '100vh';
    else if (value === 'auto') cssValue = 'auto';
    else if (value === 'min') cssValue = 'min-content';
    else if (value === 'max') cssValue = 'max-content';
    else if (value === 'fit') cssValue = 'fit-content';
    else if (value.includes('/')) cssValue = `${(parseFloat(value.split('/')[0]) / parseFloat(value.split('/')[1]) * 100).toFixed(3)}%`;
    else cssValue = `${parseFloat(value) * 0.25}rem (${parseFloat(value) * 4}px)`;

    return {
      description: `Sets ${propName} to ${cssValue}`,
      css: `${propName}: ${cssValue};`,
      category: 'Sizing',
    };
  }

  // Typography
  const textSizeMatch = className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/);
  if (textSizeMatch) {
    const sizes: Record<string, string> = {
      xs: '0.75rem (12px)', sm: '0.875rem (14px)', base: '1rem (16px)',
      lg: '1.125rem (18px)', xl: '1.25rem (20px)', '2xl': '1.5rem (24px)',
      '3xl': '1.875rem (30px)', '4xl': '2.25rem (36px)', '5xl': '3rem (48px)',
      '6xl': '3.75rem (60px)', '7xl': '4.5rem (72px)', '8xl': '6rem (96px)', '9xl': '8rem (128px)',
    };
    return {
      description: `Sets font size to ${sizes[textSizeMatch[1]]}`,
      css: `font-size: ${sizes[textSizeMatch[1]]};`,
      category: 'Typography',
    };
  }

  const fontWeightMatch = className.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/);
  if (fontWeightMatch) {
    const weights: Record<string, string> = {
      thin: '100', extralight: '200', light: '300', normal: '400',
      medium: '500', semibold: '600', bold: '700', extrabold: '800', black: '900',
    };
    return {
      description: `Sets font weight to ${weights[fontWeightMatch[1]]}`,
      css: `font-weight: ${weights[fontWeightMatch[1]]};`,
      category: 'Typography',
    };
  }

  if (className === 'text-left') return { description: 'Aligns text to the left', css: 'text-align: left;', category: 'Typography' };
  if (className === 'text-center') return { description: 'Centers text', css: 'text-align: center;', category: 'Typography' };
  if (className === 'text-right') return { description: 'Aligns text to the right', css: 'text-align: right;', category: 'Typography' };
  if (className === 'text-justify') return { description: 'Justifies text', css: 'text-align: justify;', category: 'Typography' };

  if (className === 'underline') return { description: 'Underlines text', css: 'text-decoration: underline;', category: 'Typography' };
  if (className === 'line-through') return { description: 'Adds line through text', css: 'text-decoration: line-through;', category: 'Typography' };
  if (className === 'no-underline') return { description: 'Removes text decoration', css: 'text-decoration: none;', category: 'Typography' };

  if (className === 'uppercase') return { description: 'Transforms text to uppercase', css: 'text-transform: uppercase;', category: 'Typography' };
  if (className === 'lowercase') return { description: 'Transforms text to lowercase', css: 'text-transform: lowercase;', category: 'Typography' };
  if (className === 'capitalize') return { description: 'Capitalizes text', css: 'text-transform: capitalize;', category: 'Typography' };

  // Colors
  const colorMatch = className.match(/^(bg|text|border|ring)-(.+)-(\d+)$/);
  if (colorMatch) {
    const [, type, color, shade] = colorMatch;
    const types: Record<string, string> = {
      bg: 'background', text: 'text color', border: 'border color', ring: 'ring color',
    };
    return {
      description: `Sets ${types[type]} to ${color}-${shade}`,
      css: `${type === 'text' ? 'color' : type === 'bg' ? 'background-color' : `${type}-color`}: var(--color-${color}-${shade});`,
      category: 'Colors',
    };
  }

  // Borders
  const borderMatch = className.match(/^border(-(\d+))?$/);
  if (borderMatch) {
    const width = borderMatch[2] || '1';
    return {
      description: `Sets border width to ${width}px`,
      css: `border-width: ${width}px;`,
      category: 'Borders',
    };
  }

  const roundedMatch = className.match(/^rounded(-(.+))?$/);
  if (roundedMatch) {
    const sizes: Record<string, string> = {
      '': '0.25rem', none: '0', sm: '0.125rem', md: '0.375rem',
      lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px',
    };
    const size = roundedMatch[2] || '';
    return {
      description: `Sets border radius to ${sizes[size] || size}`,
      css: `border-radius: ${sizes[size] || size};`,
      category: 'Borders',
    };
  }

  // Effects
  const shadowMatch = className.match(/^shadow(-(.+))?$/);
  if (shadowMatch) {
    const size = shadowMatch[2] || 'default';
    return {
      description: `Applies ${size} shadow effect`,
      css: `box-shadow: var(--shadow-${size});`,
      category: 'Effects',
    };
  }

  const opacityMatch = className.match(/^opacity-(\d+)$/);
  if (opacityMatch) {
    const value = parseInt(opacityMatch[1]) / 100;
    return {
      description: `Sets opacity to ${value}`,
      css: `opacity: ${value};`,
      category: 'Effects',
    };
  }

  // Position
  if (className === 'static') return { description: 'Sets position to static', css: 'position: static;', category: 'Position' };
  if (className === 'fixed') return { description: 'Sets position to fixed', css: 'position: fixed;', category: 'Position' };
  if (className === 'absolute') return { description: 'Sets position to absolute', css: 'position: absolute;', category: 'Position' };
  if (className === 'relative') return { description: 'Sets position to relative', css: 'position: relative;', category: 'Position' };
  if (className === 'sticky') return { description: 'Sets position to sticky', css: 'position: sticky;', category: 'Position' };

  // Transitions
  if (className === 'transition') return { description: 'Adds transition to all properties', css: 'transition: all 150ms;', category: 'Transitions' };
  if (className.startsWith('transition-')) {
    const prop = className.replace('transition-', '');
    return { description: `Adds transition to ${prop}`, css: `transition-property: ${prop};`, category: 'Transitions' };
  }

  const durationMatch = className.match(/^duration-(\d+)$/);
  if (durationMatch) {
    return {
      description: `Sets transition duration to ${durationMatch[1]}ms`,
      css: `transition-duration: ${durationMatch[1]}ms;`,
      category: 'Transitions',
    };
  }

  // Cursor
  if (className === 'cursor-pointer') return { description: 'Changes cursor to pointer', css: 'cursor: pointer;', category: 'Interactivity' };
  if (className === 'cursor-not-allowed') return { description: 'Changes cursor to not-allowed', css: 'cursor: not-allowed;', category: 'Interactivity' };
  if (className === 'pointer-events-none') return { description: 'Disables pointer events', css: 'pointer-events: none;', category: 'Interactivity' };
  if (className === 'select-none') return { description: 'Prevents text selection', css: 'user-select: none;', category: 'Interactivity' };

  // Overflow
  if (className === 'overflow-hidden') return { description: 'Hides overflow', css: 'overflow: hidden;', category: 'Overflow' };
  if (className === 'overflow-auto') return { description: 'Auto overflow', css: 'overflow: auto;', category: 'Overflow' };
  if (className === 'overflow-scroll') return { description: 'Scroll overflow', css: 'overflow: scroll;', category: 'Overflow' };

  // Responsive variants
  const responsiveMatch = className.match(/^(sm|md|lg|xl|2xl):(.+)$/);
  if (responsiveMatch) {
    const [, breakpoint, innerClass] = responsiveMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      const breakpoints: Record<string, string> = {
        sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
      };
      return {
        description: `${innerDoc.description} (on ${breakpoint} screens and up)`,
        css: `@media (min-width: ${breakpoints[breakpoint]}) { ${innerDoc.css} }`,
        category: `Responsive (${breakpoint}+ / ${breakpoints[breakpoint]}+)`,
      };
    }
  }

  // Container queries (@container variants)
  const containerMatch = className.match(/^@(sm|md|lg|xl|2xl):(.+)$/);
  if (containerMatch) {
    const [, size, innerClass] = containerMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when container is ${size}+)`,
        css: `@container (min-width: ${size}) { ${innerDoc.css} }`,
        category: `Container Query (@${size})`,
      };
    }
  }

  // Dark mode variant
  const darkMatch = className.match(/^dark:(.+)$/);
  if (darkMatch) {
    const innerDoc = getTailwindDocumentation(darkMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (in dark mode)`,
        css: `.dark & { ${innerDoc.css} }`,
        category: 'Dark Mode',
      };
    }
  }

  // Group variants
  const groupMatch = className.match(/^group-(hover|focus|active):(.+)$/);
  if (groupMatch) {
    const [, state, innerClass] = groupMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when parent .group is ${state})`,
        css: `.group:${state} & { ${innerDoc.css} }`,
        category: `Group (${state})`,
      };
    }
  }

  // Peer variants
  const peerMatch = className.match(/^peer-(checked|focus|disabled|invalid|valid|placeholder-shown):(.+)$/);
  if (peerMatch) {
    const [, state, innerClass] = peerMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when sibling .peer is ${state})`,
        css: `.peer:${state} ~ & { ${innerDoc.css} }`,
        category: `Peer (${state})`,
      };
    }
  }

  // Pseudo-class variants (hover, focus, active, etc.)
  const pseudoMatch = className.match(/^(hover|focus|active|visited|target|focus-within|focus-visible|disabled|enabled|checked|indeterminate|default|required|valid|invalid|in-range|out-of-range|placeholder-shown|autofill|read-only):(.+)$/);
  if (pseudoMatch) {
    const [, pseudo, innerClass] = pseudoMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      const descriptions: Record<string, string> = {
        hover: 'on hover',
        focus: 'when focused',
        active: 'when active',
        visited: 'when visited',
        target: 'when targeted',
        'focus-within': 'when focus within',
        'focus-visible': 'when focus visible',
        disabled: 'when disabled',
        enabled: 'when enabled',
        checked: 'when checked',
        indeterminate: 'when indeterminate',
        default: 'when default',
        required: 'when required',
        valid: 'when valid',
        invalid: 'when invalid',
        'in-range': 'when in range',
        'out-of-range': 'when out of range',
        'placeholder-shown': 'when placeholder shown',
        autofill: 'when autofilled',
        'read-only': 'when read-only',
      };
      return {
        description: `${innerDoc.description} (${descriptions[pseudo] || pseudo})`,
        css: `&:${pseudo} { ${innerDoc.css} }`,
        category: `Pseudo-class (${pseudo})`,
      };
    }
  }

  // First/Last/Odd/Even child variants
  const childMatch = className.match(/^(first|last|odd|even|first-of-type|last-of-type):(.+)$/);
  if (childMatch) {
    const [, variant, innerClass] = childMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      const selectors: Record<string, string> = {
        first: 'first-child',
        last: 'last-child',
        odd: 'nth-child(odd)',
        even: 'nth-child(even)',
        'first-of-type': 'first-of-type',
        'last-of-type': 'last-of-type',
      };
      return {
        description: `${innerDoc.description} (${variant} child)`,
        css: `&:${selectors[variant]} { ${innerDoc.css} }`,
        category: `Child Selector (${variant})`,
      };
    }
  }

  // Print variant
  const printMatch = className.match(/^print:(.+)$/);
  if (printMatch) {
    const innerDoc = getTailwindDocumentation(printMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when printing)`,
        css: `@media print { ${innerDoc.css} }`,
        category: 'Print',
      };
    }
  }

  // Motion variants
  const motionMatch = className.match(/^motion-(safe|reduce):(.+)$/);
  if (motionMatch) {
    const [, preference, innerClass] = motionMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      const mediaQuery = preference === 'reduce' ? 'prefers-reduced-motion: reduce' : 'prefers-reduced-motion: no-preference';
      return {
        description: `${innerDoc.description} (when motion ${preference})`,
        css: `@media (${mediaQuery}) { ${innerDoc.css} }`,
        category: `Motion (${preference})`,
      };
    }
  }

  // RTL/LTR variants
  const directionMatch = className.match(/^(rtl|ltr):(.+)$/);
  if (directionMatch) {
    const [, direction, innerClass] = directionMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (in ${direction.toUpperCase()} mode)`,
        css: `[dir="${direction}"] & { ${innerDoc.css} }`,
        category: `Direction (${direction.toUpperCase()})`,
      };
    }
  }

  // Data attributes
  const dataMatch = className.match(/^data-\[([^=]+)=([^\]]+)\]:(.+)$/);
  if (dataMatch) {
    const [, attr, value, innerClass] = dataMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when data-${attr}="${value}")`,
        css: `&[data-${attr}="${value}"] { ${innerDoc.css} }`,
        category: 'Data Attribute',
      };
    }
  }

  // Aria attributes
  const ariaMatch = className.match(/^aria-(disabled|selected|checked|expanded|hidden|current):(.+)$/);
  if (ariaMatch) {
    const [, attr, innerClass] = ariaMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when aria-${attr}="true")`,
        css: `&[aria-${attr}="true"] { ${innerDoc.css} }`,
        category: `ARIA (${attr})`,
      };
    }
  }

  // Supports queries
  const supportsMatch = className.match(/^supports-\[([^\]]+)\]:(.+)$/);
  if (supportsMatch) {
    const [, query, innerClass] = supportsMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when browser supports ${query})`,
        css: `@supports (${query}) { ${innerDoc.css} }`,
        category: 'Supports Query',
      };
    }
  }

  // Before/After pseudo-elements
  const pseudoElementMatch = className.match(/^(before|after):(.+)$/);
  if (pseudoElementMatch) {
    const [, element, innerClass] = pseudoElementMatch;
    const innerDoc = getTailwindDocumentation(innerClass);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (on ::${element})`,
        css: `&::${element} { ${innerDoc.css} }`,
        category: `Pseudo-element (::${element})`,
      };
    }
  }

  // Marker pseudo-element
  const markerMatch = className.match(/^marker:(.+)$/);
  if (markerMatch) {
    const innerDoc = getTailwindDocumentation(markerMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (on list marker)`,
        css: `&::marker { ${innerDoc.css} }`,
        category: 'Pseudo-element (::marker)',
      };
    }
  }

  // Selection pseudo-element
  const selectionMatch = className.match(/^selection:(.+)$/);
  if (selectionMatch) {
    const innerDoc = getTailwindDocumentation(selectionMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (on text selection)`,
        css: `&::selection { ${innerDoc.css} }`,
        category: 'Pseudo-element (::selection)',
      };
    }
  }

  // File input button
  const fileMatch = className.match(/^file:(.+)$/);
  if (fileMatch) {
    const innerDoc = getTailwindDocumentation(fileMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (on file input button)`,
        css: `&::file-selector-button { ${innerDoc.css} }`,
        category: 'Pseudo-element (::file-selector-button)',
      };
    }
  }

  // Placeholder
  const placeholderMatch = className.match(/^placeholder:(.+)$/);
  if (placeholderMatch) {
    const innerDoc = getTailwindDocumentation(placeholderMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (on placeholder)`,
        css: `&::placeholder { ${innerDoc.css} }`,
        category: 'Pseudo-element (::placeholder)',
      };
    }
  }

  // Empty pseudo-class
  const emptyMatch = className.match(/^empty:(.+)$/);
  if (emptyMatch) {
    const innerDoc = getTailwindDocumentation(emptyMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when empty)`,
        css: `&:empty { ${innerDoc.css} }`,
        category: 'Pseudo-class (empty)',
      };
    }
  }

  // Open state
  const openMatch = className.match(/^open:(.+)$/);
  if (openMatch) {
    const innerDoc = getTailwindDocumentation(openMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (when open)`,
        css: `&[open] { ${innerDoc.css} }`,
        category: 'State (open)',
      };
    }
  }

  // Backdrop pseudo-element
  const backdropMatch = className.match(/^backdrop:(.+)$/);
  if (backdropMatch) {
    const innerDoc = getTailwindDocumentation(backdropMatch[1]);
    if (innerDoc) {
      return {
        description: `${innerDoc.description} (on dialog backdrop)`,
        css: `&::backdrop { ${innerDoc.css} }`,
        category: 'Pseudo-element (::backdrop)',
      };
    }
  }

  // Logical properties (Tailwind v4)
  const logicalMatch = className.match(/^(ps|pe|ms|me|border-s|border-e)-?(\d+)?$/);
  if (logicalMatch) {
    const [, prop, value] = logicalMatch;
    const propNames: Record<string, string> = {
      ps: 'padding-inline-start',
      pe: 'padding-inline-end',
      ms: 'margin-inline-start',
      me: 'margin-inline-end',
      'border-s': 'border-inline-start',
      'border-e': 'border-inline-end',
    };
    const cssValue = value ? `${parseFloat(value) * 0.25}rem` : '1px';
    return {
      description: `Sets ${propNames[prop]} to ${cssValue}`,
      css: `${propNames[prop]}: ${cssValue};`,
      category: 'Logical Properties',
    };
  }

  // Default fallback
  return {
    description: `Tailwind CSS utility class: ${className}`,
    css: '',
    category: 'Utility',
  };
}
