// Tailwind class order priority (lower = earlier in output)
// Based on Tailwind's recommended class order
const TAILWIND_ORDER = {
    // Layout
    "absolute": 10, "block": 10, "contents": 10, "fixed": 10, "flex": 10,
    "grid": 10, "hidden": 10, "inline": 10, "inline-block": 10, "inline-flex": 10,
    "inline-grid": 10, "relative": 10, "static": 10, "sticky": 10,

    // Positioning
    "bottom-": 20, "inset-": 20, "left-": 20, "right-": 20, "top-": 20,

    // Z-index
    "z-": 25,

    // Flexbox/Grid container
    "basis-": 30, "flex-": 30, "grid-cols-": 30, "grid-rows-": 30,

    // Flexbox/Grid alignment
    "content-": 40, "items-": 40, "justify-": 40, "place-": 40, "self-": 40,

    // Flexbox/Grid children
    "col-": 45, "grow": 45, "order-": 45, "row-": 45, "shrink": 45,

    // Gap
    "gap-": 50,

    // Spacing - margin
    "-m-": 60, "-mx-": 60, "-my-": 60, "m-": 60, "mb-": 60, "ml-": 60,
    "mr-": 60, "mt-": 60, "mx-": 60, "my-": 60,

    // Spacing - padding
    "p-": 70, "pb-": 70, "pl-": 70, "pr-": 70, "pt-": 70, "px-": 70, "py-": 70,

    // Sizing
    "h-": 80, "max-h-": 80, "max-w-": 80, "min-h-": 80, "min-w-": 80,
    "size-": 80, "w-": 80,

    // Typography
    "align-": 90, "antialiased": 90, "break-": 90, "capitalize": 90, "decoration-": 90,
    "font-": 90, "hyphens-": 90, "italic": 90, "leading-": 90, "line-clamp-": 90,
    "list-": 90, "lowercase": 90, "normal-case": 90, "not-italic": 90,
    "ordinal": 90, "text-": 90, "tracking-": 90, "truncate": 90,
    "underline": 90, "uppercase": 90, "whitespace-": 90,

    // Backgrounds
    "bg-": 100,

    // Borders
    "border": 110, "border-": 110, "divide-": 110, "outline-": 110,
    "ring-": 110, "rounded": 110, "rounded-": 110,

    // Effects
    "blur": 120, "blur-": 120, "brightness-": 120, "contrast-": 120, "drop-shadow": 120,
    "grayscale": 120, "hue-rotate-": 120, "invert": 120, "opacity-": 120,
    "saturate-": 120, "sepia": 120, "shadow": 120, "shadow-": 120,

    // Transitions
    "animate-": 130, "delay-": 130, "duration-": 130, "ease-": 130,
    "transition": 130, "transition-": 130,

    // Transforms
    "-rotate-": 140, "-scale-": 140, "-skew-": 140, "-translate-": 140,
    "origin-": 140, "rotate-": 140, "scale-": 140, "skew-": 140,
    "transform": 140, "translate-": 140,

    // Interactivity
    "accent-": 150, "appearance-": 150, "caret-": 150, "cursor-": 150,
    "pointer-events-": 150, "resize": 150, "scroll-": 150, "select-": 150,
    "snap-": 150, "touch-": 150, "will-change-": 150,

    // SVG
    "fill-": 160, "stroke-": 160,

    // Accessibility
    "sr-only": 170,
};

// Common Tailwind class patterns for detection
const TAILWIND_PATTERNS = [
    // Layout
    /^(flex|grid|block|inline|hidden|absolute|relative|fixed|sticky)$/,
    // Flexbox/Grid
    /^(items|justify|content|self|place)-(start|end|center|between|around|evenly|stretch|baseline)$/,
    /^(flex|grid)-(row|col|wrap|nowrap|grow|shrink)/, /^(col|row)-span-/,
    /^gap-/, /^order-/,
    // Spacing
    /^-?[mp][xytblr]?-\d/, /^-?[mp][xytblr]?-\[/,
    // Sizing
    /^[wh]-/, /^(min|max)-[wh]-/, /^size-/,
    // Typography
    /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
    /^text-(left|center|right|justify)$/, /^text-\w+-\d{2,3}$/,
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    /^font-(sans|serif|mono)$/, /^leading-/, /^tracking-/,
    /^(uppercase|lowercase|capitalize|normal-case)$/,
    /^(truncate|line-clamp-)/,
    // Colors
    /^(bg|text|border|ring|divide|outline|fill|stroke)-(transparent|current|inherit)$/,
    /^(bg|text|border|ring|divide|outline|fill|stroke)-\w+-\d{2,3}$/,
    /^(bg|text|border|ring|divide|outline|fill|stroke)-(white|black)$/,
    // Borders
    /^rounded(-|$)/, /^border(-|$)/, /^ring(-|$)/, /^outline(-|$)/,
    // Effects
    /^shadow(-|$)/, /^opacity-/, /^blur(-|$)/,
    // Transitions
    /^transition(-|$)/, /^duration-/, /^ease-/, /^delay-/, /^animate-/,
    // Transforms
    /^-?(rotate|scale|skew|translate)-/, /^origin-/, /^transform$/,
    // Filters
    /^(grayscale|sepia|invert|brightness|contrast|saturate|hue-rotate)(-|$)/,
    // Interactivity
    /^cursor-/, /^select-/, /^pointer-events-/,
    // Responsive/State prefixes (these come at the end)
    /^(sm|md|lg|xl|2xl):/, /^(hover|focus|active|disabled|group-hover):/,
    /^(dark|light):/,
];

// Minimum number of Tailwind-like classes to consider a string as class-related
const MIN_TAILWIND_MATCHES = 2;

// Default thresholds for classname-multiline rule (shared across rules)
export const DEFAULT_MAX_CLASS_COUNT = 3;
export const DEFAULT_MAX_CLASS_LENGTH = 80;

/**
 * Check if a class string looks like Tailwind CSS classes
 * @param {string} classString - The string to check
 * @returns {boolean} - True if the string appears to contain Tailwind classes
 */
export const looksLikeTailwindClasses = (classString) => {
    if (!classString || typeof classString !== "string") return false;

    const classes = classString.trim().split(/\s+/).filter(Boolean);

    if (classes.length === 0) return false;

    let tailwindMatches = 0;

    for (const cls of classes) {
        // Check against Tailwind patterns
        for (const pattern of TAILWIND_PATTERNS) {
            if (pattern.test(cls)) {
                tailwindMatches += 1;
                break;
            }
        }

        // Check against known order prefixes
        for (const prefix of Object.keys(TAILWIND_ORDER)) {
            if (cls === prefix.replace("-", "") || cls.startsWith(prefix)) {
                tailwindMatches += 1;
                break;
            }
        }
    }

    // Consider it Tailwind if at least MIN_TAILWIND_MATCHES classes match
    // or if more than 50% of classes match Tailwind patterns
    return tailwindMatches >= MIN_TAILWIND_MATCHES
        || (classes.length > 0 && tailwindMatches / classes.length > 0.5);
};

/**
 * Check if a variable name or context suggests class-related content
 * @param {string} name - Variable or property name
 * @returns {boolean} - True if the name suggests class content
 */
export const isClassRelatedName = (name) => /class/i.test(name);

/**
 * Smart check: either name suggests classes OR content looks like Tailwind
 * @param {string} name - Variable name (can be null)
 * @param {string} content - String content to check
 * @returns {boolean} - True if this appears to be class-related
 */
export const isClassRelated = (name, content) => isClassRelatedName(name || "") || looksLikeTailwindClasses(content);

/**
 * Get the order priority for a Tailwind class
 * @param {string} cls - The class name
 * @returns {number} - The order priority (lower = earlier)
 */
export const getClassOrder = (cls) => {
    // Check for responsive/state variants - they go at the end
    if (/^(sm|md|lg|xl|2xl):/.test(cls)) return 200;

    if (/^(hover|focus|active|disabled|visited|first|last|odd|even|group-):/.test(cls)) return 210;

    if (/^dark:/.test(cls)) return 220;

    // Check exact matches first
    if (TAILWIND_ORDER[cls] !== undefined) return TAILWIND_ORDER[cls];

    // Check prefix matches
    for (const [prefix, order] of Object.entries(TAILWIND_ORDER)) {
        if (prefix.endsWith("-") && cls.startsWith(prefix)) return order;
    }

    // Unknown classes go before variants but after known classes
    return 180;
};

/**
 * Sort Tailwind classes according to recommended order
 * @param {string} classString - Space-separated class string
 * @returns {string} - Sorted class string
 */
export const sortTailwindClasses = (classString) => {
    if (!classString || typeof classString !== "string") return classString;

    const classes = classString.trim().split(/\s+/).filter(Boolean);

    if (classes.length <= 1) return classString;

    const sorted = [...classes].sort((a, b) => {
        const orderA = getClassOrder(a);
        const orderB = getClassOrder(b);

        if (orderA !== orderB) return orderA - orderB;

        // Same priority - sort alphabetically for consistency
        return a.localeCompare(b);
    });

    return sorted.join(" ");
};

/**
 * Check if classes need reordering
 * @param {string} classString - Space-separated class string
 * @returns {boolean} - True if classes are not in correct order
 */
export const needsReordering = (classString) => {
    if (!classString || typeof classString !== "string") return false;

    // Normalize whitespace (newlines, multiple spaces) to single spaces for comparison
    const normalized = classString.trim().split(/\s+/).filter(Boolean).join(" ");
    const sorted = sortTailwindClasses(normalized);

    return normalized !== sorted;
};
