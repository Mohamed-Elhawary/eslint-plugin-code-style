import fs from "fs";
import nodePath from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(nodePath.join(__dirname, "package.json"), "utf8"));

/**
 * ═══════════════════════════════════════════════════════════════
 * Tailwind CSS Class Utilities
 * ═══════════════════════════════════════════════════════════════
 *
 * Shared utilities for detecting and ordering Tailwind CSS classes.
 * Used by classname-* rules for smart detection and auto-ordering.
 */

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
const DEFAULT_MAX_CLASS_COUNT = 3;
const DEFAULT_MAX_CLASS_LENGTH = 80;

/**
 * Check if a class string looks like Tailwind CSS classes
 * @param {string} classString - The string to check
 * @returns {boolean} - True if the string appears to contain Tailwind classes
 */
const looksLikeTailwindClasses = (classString) => {
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
const isClassRelatedName = (name) => /class/i.test(name);

/**
 * Smart check: either name suggests classes OR content looks like Tailwind
 * @param {string} name - Variable name (can be null)
 * @param {string} content - String content to check
 * @returns {boolean} - True if this appears to be class-related
 */
const isClassRelated = (name, content) => isClassRelatedName(name || "") || looksLikeTailwindClasses(content);

/**
 * Get the order priority for a Tailwind class
 * @param {string} cls - The class name
 * @returns {number} - The order priority (lower = earlier)
 */
const getClassOrder = (cls) => {
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
const sortTailwindClasses = (classString) => {
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
const needsReordering = (classString) => {
    if (!classString || typeof classString !== "string") return false;

    // Normalize whitespace (newlines, multiple spaces) to single spaces for comparison
    const normalized = classString.trim().split(/\s+/).filter(Boolean).join(" ");
    const sorted = sortTailwindClasses(normalized);

    return normalized !== sorted;
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Array Items Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce array formatting based on item count. Items within
 *   maxItems threshold on one line, more items each on its own line.
 *
 * Options:
 *   { maxItems: 3 } - Maximum items on single line (default: 3)
 *
 * ✓ Good:
 *   const arr = [1, 2, 3];
 *   const arr = [
 *       item1,
 *       item2,
 *       item3,
 *       item4,
 *   ];
 *
 * ✗ Bad:
 *   const arr = [1, 2, 3, 4, 5];
 *   const arr = [item1,
 *       item2, item3];
 */
const arrayItemsPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxItems = options.maxItems !== undefined ? options.maxItems : 3;

        return {
            ArrayExpression(node) {
                const { elements } = node;

                // Skip empty arrays
                if (elements.length === 0) return;

                // Skip hook dependency arrays (handled by hook-deps-per-line rule)
                if (node.parent
                    && node.parent.type === "CallExpression"
                    && node.parent.callee
                    && node.parent.callee.type === "Identifier"
                    && /^use[A-Z]/.test(node.parent.callee.name)) {
                    const args = node.parent.arguments;

                    // Dependency array is typically the last argument
                    if (args[args.length - 1] === node) return;
                }

                // Skip arrays with spread elements or complex nested structures
                const hasComplexElement = elements.some((el) => {
                    if (!el) return false;

                    return el.type === "SpreadElement"
                        || el.type === "ObjectExpression"
                        || el.type === "ArrayExpression"
                        || el.type === "ArrowFunctionExpression"
                        || el.type === "FunctionExpression";
                });

                if (hasComplexElement) return;

                const openBracket = sourceCode.getFirstToken(node);
                const closeBracket = sourceCode.getLastToken(node);

                if (!openBracket || !closeBracket) return;

                const firstElement = elements[0];
                const lastElement = elements[elements.length - 1];

                if (!firstElement || !lastElement) return;

                // Check if array is a property value that should be on same line as key
                if (node.parent && node.parent.type === "Property") {
                    const colonToken = sourceCode.getTokenBefore(node);

                    if (colonToken && colonToken.value === ":") {
                        if (openBracket.loc.start.line !== colonToken.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [colonToken.range[1], openBracket.range[0]],
                                    " ",
                                ),
                                message: "Array should start on same line as property key",
                                node: openBracket,
                            });
                        }
                    }
                }

                // Calculate base indent from parent or current line
                let baseIndent = "";

                if (node.parent && node.parent.type === "Property") {
                    const propLine = sourceCode.lines[node.parent.loc.start.line - 1];

                    baseIndent = propLine.match(/^\s*/)[0];
                } else {
                    const arrayLine = sourceCode.lines[node.loc.start.line - 1];

                    baseIndent = arrayLine.match(/^\s*/)[0];
                }

                const itemIndent = baseIndent + "    ";

                // maxItems or less items: should be on one line with no extra spaces
                if (elements.length <= maxItems) {
                    const isMultiLine = node.loc.start.line !== node.loc.end.line;

                    // Check for spaces inside brackets on single line arrays
                    if (!isMultiLine) {
                        const textAfterOpen = sourceCode.text.slice(openBracket.range[1], firstElement.range[0]);
                        const textBeforeClose = sourceCode.text.slice(lastElement.range[1], closeBracket.range[0]);

                        // Check for space after opening bracket or space before closing bracket
                        // textBeforeClose might be "" or ", " or " " - any space is not allowed
                        const hasSpaceAfterOpen = textAfterOpen.length > 0;
                        const hasSpaceBeforeClose = textBeforeClose.includes(" ");

                        if (hasSpaceAfterOpen || hasSpaceBeforeClose) {
                            const itemsText = elements
                                .filter((el) => el !== null)
                                .map((el) => sourceCode.getText(el))
                                .join(", ");

                            context.report({
                                fix: (fixer) => fixer.replaceText(
                                    node,
                                    `[${itemsText}]`,
                                ),
                                message: "No spaces inside array brackets",
                                node,
                            });
                        }

                        return;
                    }

                    // Multi-line with 3 or less - collapse to one line
                    const itemsText = elements
                        .filter((el) => el !== null)
                        .map((el) => sourceCode.getText(el))
                        .join(", ");
                    const singleLine = `[${itemsText}]`;

                    if (singleLine.length <= 100) {
                        context.report({
                            fix: (fixer) => fixer.replaceText(
                                node,
                                singleLine,
                            ),
                            message: `Array with ≤${maxItems} simple items should be single line: [a, b, c]. Multi-line only for >${maxItems} items or complex values`,
                            node,
                        });
                    }

                    return;
                }

                // More than maxItems: each on its own line
                // Check for empty line after opening bracket
                if (firstElement.loc.start.line > openBracket.loc.end.line + 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], firstElement.range[0]],
                            "\n" + itemIndent,
                        ),
                        message: "No empty line after opening bracket",
                        node: firstElement,
                    });
                } else if (openBracket.loc.end.line === firstElement.loc.start.line) {
                    // First element on same line as bracket - move to new line
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], firstElement.range[0]],
                            "\n" + itemIndent,
                        ),
                        message: "First array item should be on its own line",
                        node: firstElement,
                    });
                }

                // Check each element is on its own line and no empty lines between
                for (let i = 0; i < elements.length - 1; i += 1) {
                    const current = elements[i];
                    const next = elements[i + 1];

                    if (!current || !next) continue;

                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    if (current.loc.end.line === next.loc.start.line) {
                        if (commaToken) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [commaToken.range[1], next.range[0]],
                                    "\n" + itemIndent,
                                ),
                                message: "Each array item should be on its own line",
                                node: next,
                            });
                        }
                    } else if (next.loc.start.line > current.loc.end.line + 1) {
                        // Empty lines between elements
                        if (commaToken) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [commaToken.range[1], next.range[0]],
                                    "\n" + itemIndent,
                                ),
                                message: "No empty lines between array items",
                                node: next,
                            });
                        }
                    }
                }

                // Check for empty line before closing bracket
                const tokenBeforeClose = sourceCode.getTokenBefore(closeBracket);

                if (closeBracket.loc.start.line > lastElement.loc.end.line + 1) {
                    const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                    context.report({
                        fix: (fixer) => {
                            if (hasTrailingComma) {
                                return fixer.replaceTextRange(
                                    [tokenBeforeClose.range[1], closeBracket.range[0]],
                                    "\n" + baseIndent,
                                );
                            }

                            return fixer.replaceTextRange(
                                [lastElement.range[1], closeBracket.range[0]],
                                ",\n" + baseIndent,
                            );
                        },
                        message: "No empty line before closing bracket",
                        node: closeBracket,
                    });
                } else if (closeBracket.loc.start.line === lastElement.loc.end.line) {
                    // Closing bracket on same line as last element
                    const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                    context.report({
                        fix: (fixer) => {
                            if (hasTrailingComma) {
                                return fixer.replaceTextRange(
                                    [tokenBeforeClose.range[1], closeBracket.range[0]],
                                    "\n" + baseIndent,
                                );
                            }

                            return fixer.replaceTextRange(
                                [lastElement.range[1], closeBracket.range[0]],
                                ",\n" + baseIndent,
                            );
                        },
                        message: "Closing bracket should be on its own line",
                        node: closeBracket,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce array formatting based on item count (default: ≤3 on one line, >3 each on new line)" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxItems: {
                        default: 3,
                        description: "Maximum items to keep on single line (default: 3)",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Array Callback Destructure
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When destructuring parameters in array method callbacks (map,
 *   filter, find, etc.), put each property on its own line when
 *   there are 2 or more properties.
 *
 * ✓ Good:
 *   items.map(({
 *       name,
 *       value,
 *   }) => name + value);
 *
 * ✗ Bad:
 *   items.map(({ name, value }) => name + value);
 */
const arrayCallbackDestructure = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const arrayMethods = [
            "map", "filter", "find", "findIndex", "findLast", "findLastIndex",
            "some", "every", "forEach", "reduce", "reduceRight", "flatMap",
            "sort", "toSorted",
        ];

        const checkDestructuringHandler = (pattern, callNode) => {
            if (pattern.type !== "ObjectPattern") return;

            const properties = pattern.properties.filter((p) => p.type === "Property");

            // Only enforce multiline when 2+ properties
            if (properties.length < 2) return;

            const firstProp = properties[0];
            const lastProp = properties[properties.length - 1];
            const closeBrace = sourceCode.getLastToken(pattern);

            // Calculate indent based on the call expression
            const callLine = sourceCode.lines[callNode.loc.start.line - 1];
            const baseIndent = callLine.match(/^\s*/)[0];
            const propIndent = baseIndent + "        ";

            // Check if all properties are on the same line (need full reformat)
            if (firstProp.loc.start.line === lastProp.loc.end.line) {
                context.report({
                    fix(fixer) {
                        const openBrace = sourceCode.getFirstToken(pattern);

                        const propsText = properties
                            .map((prop) => propIndent + sourceCode.getText(prop))
                            .join(",\n");

                        return fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{\n${propsText},\n${baseIndent}    }`,
                        );
                    },
                    message: "Destructured properties in array callback should each be on their own line when there are 2 or more properties",
                    node: pattern,
                });

                return;
            }

            // Check if closing brace is on the same line as last property (needs fixing)
            if (closeBrace.loc.start.line === lastProp.loc.end.line) {
                context.report({
                    fix(fixer) {
                        // Add trailing comma if missing and move closing brace to new line
                        const tokenBeforeClose = sourceCode.getTokenBefore(closeBrace);
                        const hasTrailingComma = tokenBeforeClose.value === ",";

                        if (hasTrailingComma) {
                            return fixer.replaceTextRange(
                                [tokenBeforeClose.range[1], closeBrace.range[0]],
                                "\n" + baseIndent + "    ",
                            );
                        }

                        return fixer.replaceTextRange(
                            [lastProp.range[1], closeBrace.range[0]],
                            ",\n" + baseIndent + "    ",
                        );
                    },
                    message: "Closing brace should be on its own line in multiline destructuring",
                    node: closeBrace,
                });
            }
        };

        return {
            CallExpression(node) {
                // Check if this is an array method call
                if (node.callee.type !== "MemberExpression") return;

                const methodName = node.callee.property && node.callee.property.name;

                if (!arrayMethods.includes(methodName)) return;

                // Check the callback argument (usually the first argument)
                const callback = node.arguments[0];

                if (!callback) return;

                if (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression") {
                    // Check each parameter
                    callback.params.forEach((param) => {
                        checkDestructuringHandler(param, node);
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce multiline destructuring in array method callbacks (map, filter, find, etc.) when there are 2+ properties" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Array Objects On New Lines
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   In arrays of objects, each object should start on a new line
 *   for better readability.
 *
 * ✓ Good:
 *   const items = [
 *       { id: 1, name: "first" },
 *       { id: 2, name: "second" },
 *   ];
 *
 * ✗ Bad:
 *   const items = [{ id: 1, name: "first" },
 *       { id: 2, name: "second" }];
 */
const arrayObjectsOnNewLines = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ArrayExpression(node) {
                const elements = node.elements;

                // Only apply to arrays with object elements
                if (elements.length === 0) return;

                // Check if all non-null elements are objects
                const objectElements = elements.filter((el) => el && el.type === "ObjectExpression");

                if (objectElements.length === 0) return;

                // Skip single-line arrays (intentionally compact)
                if (node.loc.start.line === node.loc.end.line) return;

                const openBracket = sourceCode.getFirstToken(node);

                // Check first object element
                const firstElement = elements[0];

                if (firstElement && firstElement.type === "ObjectExpression") {
                    // Check if [ and { are on the same line
                    if (openBracket.loc.end.line === firstElement.loc.start.line) {
                        const openBrace = sourceCode.getFirstToken(firstElement);
                        const indent = " ".repeat(openBracket.loc.start.column + 4);

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBracket.range[1], openBrace.range[0]],
                                "\n" + indent,
                            ),
                            message: "First object in array should start on a new line",
                            node: firstElement,
                        });
                    }
                }

                // Check closing bracket - should be on its own line
                const closeBracket = sourceCode.getLastToken(node);
                const lastElement = elements[elements.length - 1];

                if (lastElement && lastElement.type === "ObjectExpression") {
                    const lastBrace = sourceCode.getLastToken(lastElement);
                    const tokenAfterBrace = sourceCode.getTokenAfter(lastBrace);

                    // Skip trailing comma if present
                    let tokenBeforeCloseBracket = tokenAfterBrace;

                    if (tokenAfterBrace && tokenAfterBrace.value === ",") {
                        tokenBeforeCloseBracket = sourceCode.getTokenAfter(tokenAfterBrace);
                    }

                    // Check if } (or },) and ] are on same line - they should NOT be
                    if (lastBrace.loc.end.line === closeBracket.loc.start.line) {
                        const indent = " ".repeat(openBracket.loc.start.column);

                        context.report({
                            fix: (fixer) => {
                                // Find the actual content between last element and ]
                                const textBetween = sourceCode.text.slice(lastElement.range[1], closeBracket.range[0]);
                                const hasComma = textBetween.includes(",");

                                if (hasComma) {
                                    // Replace from after the object to before ]
                                    return fixer.replaceTextRange(
                                        [lastElement.range[1], closeBracket.range[0]],
                                        ",\n" + indent,
                                    );
                                }

                                return fixer.replaceTextRange(
                                    [lastElement.range[1], closeBracket.range[0]],
                                    ",\n" + indent,
                                );
                            },
                            message: "Closing bracket should be on its own line after array of objects",
                            node: closeBracket,
                        });
                    }
                }

                // Check each subsequent object starts on a new line
                for (let i = 1; i < elements.length; i++) {
                    const prevElement = elements[i - 1];
                    const currentElement = elements[i];

                    if (!currentElement || currentElement.type !== "ObjectExpression") continue;
                    if (!prevElement) continue;

                    // Get the comma after previous element
                    const commaToken = sourceCode.getTokenAfter(prevElement);

                    if (!commaToken || commaToken.value !== ",") continue;

                    // Check if previous element's closing and current element's opening are on same line
                    if (commaToken.loc.end.line === currentElement.loc.start.line) {
                        const indent = " ".repeat(openBracket.loc.start.column + 4);
                        const openBrace = sourceCode.getFirstToken(currentElement);

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], openBrace.range[0]],
                                "\n" + indent,
                            ),
                            message: "Each object in array should start on a new line",
                            node: currentElement,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce array of objects to have each object on a new line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Arrow Function Block Body
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Arrow functions with complex logic should use block body.
 *   Ensures consistent formatting when function body needs
 *   multiple statements or complex expressions.
 *
 * ✓ Good:
 *   () => {
 *       doSomething();
 *       return value;
 *   }
 *
 * ✗ Bad:
 *   () => (doSomething(), value)
 */
const arrowFunctionBlockBody = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isJsxRelatedArrowHandler = (node) => {
            // Traverse up the tree to check if this arrow function is eventually
            // inside a JSX attribute (directly or nested in objects/arrays)
            // OR inside a table column definition (cell/header property in array)
            let parent = node.parent;
            let depth = 0;
            const maxDepth = 15;
            let foundCellProperty = false;
            let foundArrayExpression = false;

            while (parent && depth < maxDepth) {
                // Found JSX attribute - this is JSX-related
                if (parent.type === "JSXExpressionContainer") {
                    const grandParent = parent.parent;

                    if (grandParent && grandParent.type === "JSXAttribute") return true;
                }

                // Track if we're inside a "cell" or "header" property (table column pattern)
                if (parent.type === "Property" && parent.key && parent.key.type === "Identifier") {
                    const propName = parent.key.name;

                    if (propName === "cell" || propName === "header") {
                        foundCellProperty = true;
                    }
                }

                // Track if we're inside an ArrayExpression
                if (parent.type === "ArrayExpression") {
                    foundArrayExpression = true;
                }

                // If we found both cell property and array, this is a table column definition
                if (foundCellProperty && foundArrayExpression) return true;

                // Continue traversing through valid container types
                if (
                    parent.type === "Property" ||
                    parent.type === "ObjectExpression" ||
                    parent.type === "ArrayExpression" ||
                    parent.type === "CallExpression" ||
                    parent.type === "ArrowFunctionExpression"
                ) {
                    parent = parent.parent;
                    depth += 1;

                    continue;
                }

                // Stop at other node types
                break;
            }

            return false;
        };

        const checkArrowFunctionHandler = (node) => {
            if (!isJsxRelatedArrowHandler(node)) return;

            // Only check expression bodies (not block bodies)
            if (node.body.type === "BlockStatement") return;

            const body = node.body;

            // Skip ObjectExpression - common pattern for sx prop: (theme) => ({...})
            if (body.type === "ObjectExpression") return;

            // Get the arrow token to check positioning
            const arrowToken = sourceCode.getTokenBefore(body, (t) => t.value === "=>");

            if (!arrowToken) return;

            // Skip if body starts on the same line as => (already valid implicit return)
            // This handles cases like: prop={(x) => x.map({\n  ...\n})}
            if (body.loc.start.line === arrowToken.loc.start.line) return;

            // Check if already wrapped in parentheses - skip if so
            const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

            if (tokenAfterArrow && tokenAfterArrow.value === "(") return;

            // Get text between arrow and body (the newline + whitespace)
            const textBetween = sourceCode.getText().slice(arrowToken.range[1], body.range[0]);

            // Only fix if there's actually a newline between => and body
            if (!textBetween.includes("\n")) return;

            // For ConditionalExpression (ternary) or multiline bodies:
            // Just move the START to the same line as =>, don't collapse the whole body
            if (body.type === "ConditionalExpression" || body.loc.start.line !== body.loc.end.line) {
                // Get the first token of the body to move just that part
                const firstBodyToken = sourceCode.getFirstToken(body);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [arrowToken.range[1], firstBodyToken.range[0]],
                        " ",
                    ),
                    message: "Arrow function body should start on same line as =>",
                    node: body,
                });

                return;
            }

            // Single-line body that starts on a new line after => - move it to same line
            // This handles cases like:
            // cell: ({ row }) =>
            //     optionsData.account.status.badges?.[row.getValue("status")]
            // Should become:
            // cell: ({ row }) => optionsData.account.status.badges?.[row.getValue("status")]
            const bodyText = sourceCode.getText(body);

            context.report({
                fix: (fixer) => fixer.replaceTextRange(
                    [arrowToken.range[1], body.range[1]],
                    ` ${bodyText}`,
                ),
                message: "Arrow function body should start on same line as =>",
                node: body,
            });
        };

        return { ArrowFunctionExpression: checkArrowFunctionHandler };
    },
    meta: {
        docs: { description: "Enforce parentheses for arrow functions in JSX props with multiline expressions (preserves implicit return)" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Arrow Function Simple JSX
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simplify arrow functions returning simple JSX to single line
 *   by removing unnecessary parentheses and line breaks.
 *
 * ✓ Good:
 *   export const X = ({ children }) => <Sidebar>{children}</Sidebar>;
 *
 * ✗ Bad:
 *   export const X = ({ children }) => (
 *       <Sidebar>{children}</Sidebar>
 *   );
 */
const arrowFunctionSimpleJsx = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if JSX is simple enough to be on one line
        const isSimpleJsxHandler = (jsxNode) => {
            if (jsxNode.type !== "JSXElement" && jsxNode.type !== "JSXFragment") return false;

            // Check if JSX has no attributes or only simple attributes
            if (jsxNode.type === "JSXElement" && jsxNode.openingElement.attributes.length > 1) {
                return false;
            }

            // Check attributes are simple (no multiline expressions)
            if (jsxNode.type === "JSXElement") {
                for (const attr of jsxNode.openingElement.attributes) {
                    if (attr.type === "JSXSpreadAttribute") return false;

                    if (attr.value && attr.value.type === "JSXExpressionContainer") {
                        const expr = attr.value.expression;

                        // Skip complex expressions
                        if (expr.type === "ObjectExpression" || expr.type === "ArrayExpression") {
                            return false;
                        }

                        if (expr.type === "ArrowFunctionExpression" || expr.type === "FunctionExpression") {
                            return false;
                        }
                    }
                }
            }

            // Check children
            const children = jsxNode.children.filter((child) => {
                if (child.type === "JSXText") {
                    return child.value.trim().length > 0;
                }

                return true;
            });

            // No children (self-closing) is simple
            if (children.length === 0) return true;

            if (children.length === 1) {
                const child = children[0];

                // Simple text like <Sidebar>text</Sidebar>
                if (child.type === "JSXText") return true;

                // Simple expression like {children} or {value}
                if (child.type === "JSXExpressionContainer") {
                    const expr = child.expression;

                    if (expr.type === "Identifier") return true;

                    if (expr.type === "MemberExpression") return true;

                    if (expr.type === "Literal") return true;
                }

                // Nested JSX elements are NOT simple
                // e.g., <DashboardLayout><Outlet /></DashboardLayout> is NOT simple
            }

            return false;
        };

        // Get simplified JSX text (without extra whitespace)
        const getSimplifiedJsxTextHandler = (jsxNode) => {
            const text = sourceCode.getText(jsxNode);

            // Remove extra whitespace between tags
            return text
                .replace(/>\s+</g, "><")
                .replace(/>\s+\{/g, ">{")
                .replace(/\}\s+</g, "}<")
                .replace(/\s+$/g, "")
                .replace(/^\s+/g, "");
        };

        return {
            ArrowFunctionExpression(node) {
                const { body } = node;

                // Only handle JSX bodies
                if (body.type !== "JSXElement" && body.type !== "JSXFragment") return;

                // Skip if already on one line
                if (node.loc.start.line === node.loc.end.line) return;

                // Check if JSX is simple
                if (!isSimpleJsxHandler(body)) return;

                // Get the simplified JSX text
                const jsxText = getSimplifiedJsxTextHandler(body);

                // Check if result would be reasonably short (< 120 chars)
                const arrowStart = sourceCode.getText(node).split("=>")[0] + "=> ";
                const totalLength = arrowStart.length + jsxText.length + 1;

                if (totalLength > 120) return;

                // Check if there are parentheses around the body
                const tokenBeforeBody = sourceCode.getTokenBefore(body);
                const tokenAfterBody = sourceCode.getTokenAfter(body);
                const hasParens = tokenBeforeBody
                    && tokenBeforeBody.value === "("
                    && tokenAfterBody
                    && tokenAfterBody.value === ")";

                if (hasParens) {
                    // Replace from ( to ) with just the JSX
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBeforeBody.range[0], tokenAfterBody.range[1]],
                            jsxText,
                        ),
                        message: "Simple JSX should be on same line as arrow function without parentheses",
                        node: body,
                    });
                } else {
                    // Just collapse the multiline JSX
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            body,
                            jsxText,
                        ),
                        message: "Simple JSX should be on same line as arrow function",
                        node: body,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Simplify arrow functions returning simple JSX to single line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Arrow Function Simplify
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simplify arrow functions that have a single return statement
 *   by using implicit return instead of block body.
 *
 * ✓ Good:
 *   () => value
 *   (x) => x * 2
 *   items.map(item => item.name)
 *
 * ✗ Bad:
 *   () => { return value; }
 *   (x) => { return x * 2; }
 *   items.map(item => { return item.name; })
 */
const arrowFunctionSimplify = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isJsxAttributeArrowHandler = (node) => {
            let parent = node.parent;

            if (parent && parent.type === "JSXExpressionContainer") {
                parent = parent.parent;

                if (parent && parent.type === "JSXAttribute") return true;
            }

            return false;
        };

        // Check if a call expression can be simplified to a single line
        // e.g., dispatch(downloadEventPhoto(overlayImage)) or handler(value)
        const canSimplifyToOneLineHandler = (expr) => {
            if (expr.type !== "CallExpression") return false;

            const { arguments: args, callee } = expr;

            // Callee must be simple identifier or member expression
            if (callee.type !== "Identifier" && callee.type !== "MemberExpression") return false;

            // No arguments - can simplify: fn()
            if (args.length === 0) return true;

            // Single argument
            if (args.length === 1) {
                const arg = args[0];

                // Simple identifier: dispatch(action)
                if (arg.type === "Identifier") return true;

                // Simple literal: handler("value") or handler(123)
                if (arg.type === "Literal") return true;

                // Nested call with simple args: dispatch(downloadPhoto(id))
                if (arg.type === "CallExpression") return canSimplifyToOneLineHandler(arg);

                // Member expression: dispatch(actions.doSomething)
                if (arg.type === "MemberExpression") return true;
            }

            return false;
        };

        // Build simplified text for a call expression
        const buildSimplifiedTextHandler = (expr) => {
            if (expr.type !== "CallExpression") return sourceCode.getText(expr);

            const calleeName = sourceCode.getText(expr.callee);
            const argsText = expr.arguments.map((arg) => {
                if (arg.type === "CallExpression") return buildSimplifiedTextHandler(arg);

                return sourceCode.getText(arg);
            }).join(", ");

            return `${calleeName}(${argsText})`;
        };

        // Check if an expression is simple enough to be on one line
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return false;

            // Simple types that can always be one-lined
            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;
            if (expr.type === "ThisExpression") return true;

            // Member expressions: obj.prop, this.value
            if (expr.type === "MemberExpression") {
                return isSimpleExpressionHandler(expr.object) && isSimpleExpressionHandler(expr.property);
            }

            // Unary expressions: !x, -x
            if (expr.type === "UnaryExpression") {
                return isSimpleExpressionHandler(expr.argument);
            }

            // Simple call expressions with simple arguments
            if (expr.type === "CallExpression") {
                if (expr.arguments.length > 2) return false;

                return expr.arguments.every(isSimpleExpressionHandler);
            }

            // Object/Array expressions - keep multiline format but still simplify
            if (expr.type === "ObjectExpression" || expr.type === "ArrayExpression") {
                return true;
            }

            return false;
        };

        const checkArrowFunctionHandler = (node) => {
            if (node.body.type !== "BlockStatement") return;

            const { body } = node.body;

            if (body.length !== 1) return;

            const statement = body[0];

            // Handle ExpressionStatement (for onClick={() => { doSomething() }} or simple side-effect functions)
            if (statement.type === "ExpressionStatement") {
                const expression = statement.expression;

                // Check if already on single line
                if (expression.loc.start.line === expression.loc.end.line) {
                    const expressionText = sourceCode.getText(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            expressionText,
                        ),
                        message: "Arrow function with single statement should use expression body: () => expression instead of () => { expression }",
                        node: node.body,
                    });

                    return;
                }

                // Check if multi-line expression can be simplified to one line
                if (canSimplifyToOneLineHandler(expression)) {
                    const simplifiedText = buildSimplifiedTextHandler(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            simplifiedText,
                        ),
                        message: "Arrow function with simple nested call should be simplified to one line",
                        node: node.body,
                    });

                    return;
                }

                // Check for call expression with multiline object/array argument
                if (expression.type === "CallExpression") {
                    const expressionText = sourceCode.getText(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            expressionText,
                        ),
                        message: "Arrow function with single statement should use expression body",
                        node: node.body,
                    });
                }

                return;
            }

            // Handle ReturnStatement: () => { return x } should become () => x
            if (statement.type === "ReturnStatement") {
                const returnValue = statement.argument;

                // No return value: () => { return; } - keep as is (explicit void return)
                if (!returnValue) return;

                // Check if the return value is simple enough to inline
                const returnText = sourceCode.getText(returnValue);

                // For object literals, wrap in parentheses: () => ({ key: value })
                if (returnValue.type === "ObjectExpression") {
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            `(${returnText})`,
                        ),
                        message: "Arrow function with single return should use expression body: () => value instead of () => { return value }",
                        node: node.body,
                    });

                    return;
                }

                // For simple expressions, just use the value directly
                if (isSimpleExpressionHandler(returnValue)) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            returnText,
                        ),
                        message: "Arrow function with single return should use expression body: () => value instead of () => { return value }",
                        node: node.body,
                    });

                    return;
                }

                // For other expressions (JSX, complex calls, etc.), still simplify but keep formatting
                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node.body,
                        returnText,
                    ),
                    message: "Arrow function with single return should use expression body: () => value instead of () => { return value }",
                    node: node.body,
                });
            }
        };

        // Check for JSX expression closing brace on wrong line
        const checkJsxExpressionClosingHandler = (node) => {
            const expression = node.expression;

            // Only check arrow functions with call expression body
            if (expression.type !== "ArrowFunctionExpression") return;
            if (expression.body.type === "BlockStatement") return;
            if (expression.body.type !== "CallExpression") return;

            const callExpr = expression.body;
            const lastArg = callExpr.arguments[callExpr.arguments.length - 1];

            if (!lastArg) return;

            // Check if last argument is multiline object/array
            if (lastArg.type !== "ObjectExpression" && lastArg.type !== "ArrayExpression") return;
            if (lastArg.loc.start.line === lastArg.loc.end.line) return;

            // Get the closing tokens: ) of call, } of JSX expression
            const callCloseParen = sourceCode.getLastToken(callExpr);
            const jsxCloseBrace = sourceCode.getLastToken(node);

            if (!callCloseParen || !jsxCloseBrace) return;
            if (callCloseParen.value !== ")" || jsxCloseBrace.value !== "}") return;

            // Check if ) and } are on different lines
            if (callCloseParen.loc.end.line !== jsxCloseBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [callCloseParen.range[1], jsxCloseBrace.range[0]],
                        "",
                    ),
                    message: "JSX expression closing brace should be on same line as function call: )}",
                    node: jsxCloseBrace,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            JSXExpressionContainer: checkJsxExpressionClosingHandler,
        };
    },
    meta: {
        docs: { description: "Simplify arrow functions with single return to expression body: () => { return x } becomes () => x" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Curried Arrow Same Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Curried arrow function body must start on the same line as
 *   the arrow (=>), not on a new line.
 *
 * ✓ Good:
 *   const fn = () => async (dispatch) => {
 *       dispatch(action);
 *   };
 *
 * ✗ Bad:
 *   const fn = () =>
 *       async (dispatch) => {
 *           dispatch(action);
 *       };
 */
const curriedArrowSameLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ArrowFunctionExpression(node) {
                const { body } = node;

                // Only check if body is another arrow function (curried)
                // or an async arrow function (CallExpression with async)
                if (body.type !== "ArrowFunctionExpression") return;

                // Get the arrow token =>
                const arrowToken = sourceCode.getTokenBefore(
                    body,
                    (token) => token.value === "=>",
                );

                if (!arrowToken) return;

                // Get the first token of the body (could be 'async' or '(')
                const bodyFirstToken = sourceCode.getFirstToken(body);

                if (!bodyFirstToken) return;

                // Check if they're on the same line
                if (arrowToken.loc.end.line !== bodyFirstToken.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [arrowToken.range[1], bodyFirstToken.range[0]],
                            " ",
                        ),
                        message: "Curried arrow function should start on the same line as =>",
                        node: body,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce curried arrow function to start on same line as =>" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Assignment Value Same Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   The value in an assignment should start on the same line as
 *   the equals sign, not on a new line.
 *
 * ✓ Good:
 *   const name = "John";
 *   const data = {
 *       key: "value",
 *   };
 *
 * ✗ Bad:
 *   const name =
 *       "John";
 *   const data =
 *       {
 *           key: "value",
 *       };
 */
const assignmentValueSameLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkVariableDeclarationHandler = (node) => {
            const kindToken = sourceCode.getFirstToken(node); // const, let, var

            if (!kindToken) return;

            node.declarations.forEach((declarator) => {
                const { id, init } = declarator;

                // Check 1: const/let/var and variable name/pattern should be on same line
                // For first declarator, check against the kind token
                const isFirstDeclarator = node.declarations[0] === declarator;

                if (isFirstDeclarator) {
                    // For simple identifiers: const dispatch = ...
                    if (id.type === "Identifier") {
                        if (kindToken.loc.end.line !== id.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [kindToken.range[1], id.range[0]],
                                    " ",
                                ),
                                message: "Variable name should be on the same line as declaration keyword",
                                node: id,
                            });

                            return;
                        }
                    }

                    // For destructuring: const { x } = ... or const [ x ] = ...
                    if (id.type === "ObjectPattern" || id.type === "ArrayPattern") {
                        const openBracket = sourceCode.getFirstToken(id);

                        if (kindToken.loc.end.line !== openBracket.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [kindToken.range[1], openBracket.range[0]],
                                    " ",
                                ),
                                message: "Destructuring pattern should be on the same line as declaration keyword",
                                node: openBracket,
                            });

                            return;
                        }
                    }
                }

                if (!init) return;

                const equalToken = sourceCode.getTokenBefore(
                    init,
                    (t) => t.value === "=",
                );

                if (!equalToken) return;

                // Check 2: Variable/pattern and = should be on same line
                if (id.loc.end.line !== equalToken.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [id.range[1], equalToken.range[0]],
                            " ",
                        ),
                        message: "Assignment operator should be on the same line as variable",
                        node: equalToken,
                    });

                    return;
                }

                // Check 3: = and init value should be on same line
                if (init.loc.start.line > equalToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [equalToken.range[1], init.range[0]],
                            " ",
                        ),
                        message: "Value should be on the same line as the assignment operator",
                        node: init,
                    });
                }
            });
        };

        return { VariableDeclaration: checkVariableDeclarationHandler };
    },
    meta: {
        docs: { description: "Enforce assignment value on same line as equals sign" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Block Statement Newlines
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Block statements should have proper newlines after the opening
 *   brace and before the closing brace.
 *
 * ✓ Good:
 *   if (condition) {
 *       doSomething();
 *   }
 *
 * ✗ Bad:
 *   if (condition) { doSomething(); }
 *   if (condition) {doSomething();}
 */
const blockStatementNewlines = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkBlockStatementHandler = (node) => {
            const { body } = node;

            if (body.length === 0) return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);
            const firstStatement = body[0];
            const lastStatement = body[body.length - 1];
            const contentIndent = " ".repeat(firstStatement.loc.start.column);
            const braceIndent = " ".repeat(openBrace.loc.start.column);

            // Check if first statement is on same line as opening brace
            if (openBrace.loc.end.line === firstStatement.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstStatement.range[0]],
                        "\n" + contentIndent,
                    ),
                    message: "Statement should be on its own line after opening brace",
                    node: firstStatement,
                });
            }

            // Check if closing brace is on same line as last statement
            if (closeBrace.loc.start.line === lastStatement.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastStatement.range[1], closeBrace.range[0]],
                        "\n" + braceIndent,
                    ),
                    message: "Closing brace should be on its own line",
                    node: closeBrace,
                });
            }
        };

        return { BlockStatement: checkBlockStatementHandler };
    },
    meta: {
        docs: { description: "Enforce newlines after opening brace and before closing brace in blocks" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Comment Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Comments should have proper spacing: a space after the opening
 *   delimiter (// or block comment opener), and proper blank lines
 *   around comment blocks.
 *
 * ✓ Good:
 *   // This is a comment
 *   [block] This is a block comment [/block]
 *
 * ✗ Bad:
 *   //This is a comment (missing space)
 *   [block]No space after opener[/block]
 */
const commentFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Program(node) {
                const comments = sourceCode.getAllComments();

                if (comments.length === 0) return;

                const firstToken = sourceCode.getFirstToken(node);

                // Check each comment for internal spacing and syntax
                comments.forEach((comment) => {
                    const { type, value } = comment;

                    if (type === "Block") {
                        // Check if this is a single-line block comment (should be converted to //)
                        const isSingleLine = !value.includes("\n");

                        if (isSingleLine) {
                            // Skip ESLint directive comments (eslint-disable, eslint-enable, etc.)
                            const trimmedValue = value.trim();
                            const isEslintDirective = /^eslint-disable|^eslint-enable|^eslint-disable-next-line|^eslint-disable-line/.test(trimmedValue);

                            if (isEslintDirective) {
                                // Allow /* */ syntax for ESLint directives
                                return;
                            }

                            // Single-line block comment should use // syntax
                            context.report({
                                fix: (fixer) => fixer.replaceText(comment, `// ${trimmedValue}`),
                                loc: comment.loc,
                                message: "Single-line comments should use // syntax instead of /* */",
                            });
                        } else {
                            // Multi-line block comment: check spacing
                            const needsStartSpace = value.length > 0 && !value.startsWith(" ") && !value.startsWith("*") && !value.startsWith("\n");
                            const needsEndSpace = value.length > 0 && !value.endsWith(" ") && !value.endsWith("*") && !value.endsWith("\n");

                            if (needsStartSpace || needsEndSpace) {
                                let newValue = value;

                                if (needsStartSpace) newValue = " " + newValue;

                                if (needsEndSpace) newValue = newValue + " ";

                                context.report({
                                    fix: (fixer) => fixer.replaceText(comment, `/*${newValue}*/`),
                                    loc: comment.loc,
                                    message: "Block comment should have space after /* and before */",
                                });
                            }
                        }
                    } else if (type === "Line") {
                        // Line comment: // ...
                        // Check if missing space after //
                        const needsSpace = value.length > 0 && !value.startsWith(" ") && !value.startsWith("/");

                        if (needsSpace) {
                            context.report({
                                fix: (fixer) => fixer.replaceText(comment, `// ${value}`),
                                loc: comment.loc,
                                message: "Line comment should have space after //",
                            });
                        }
                    }

                    // Check inline comments at end of code lines - should have exactly 1 space before
                    const tokenBefore = sourceCode.getTokenBefore(comment, { includeComments: false });

                    if (tokenBefore && tokenBefore.loc.end.line === comment.loc.start.line) {
                        // This is an inline comment at the end of a code line
                        const spaceBetween = comment.range[0] - tokenBefore.range[1];

                        if (spaceBetween !== 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenBefore.range[1], comment.range[0]],
                                    " ",
                                ),
                                loc: comment.loc,
                                message: "Inline comment should have exactly one space before it",
                            });
                        }
                    }
                });

                if (!firstToken) return;

                // Get only comments at the very top of the file (before any code)
                const topComments = comments.filter((comment) => comment.loc.end.line < firstToken.loc.start.line
                    || (comment.loc.start.line === 1 && firstToken.loc.start.line === 1 && comment.range[1] < firstToken.range[0]));

                // Check top-of-file comments: no blank lines between them
                if (topComments.length > 1) {
                    for (let i = 0; i < topComments.length - 1; i += 1) {
                        const current = topComments[i];
                        const next = topComments[i + 1];
                        const linesBetween = next.loc.start.line - current.loc.end.line;

                        if (linesBetween > 1) {
                            // There's a blank line between top comments - remove it
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [current.range[1], next.range[0]],
                                    "\n",
                                ),
                                loc: next.loc,
                                message: "No blank lines allowed between top-of-file comments",
                            });
                        }
                    }
                }

                // Check spacing between top-of-file comments and first code
                if (topComments.length > 0) {
                    const lastTopComment = topComments[topComments.length - 1];

                    // First code could be import, or any other statement
                    if (firstToken.loc.start.line === lastTopComment.loc.end.line + 1) {
                        // No empty line between last top comment and code - need one
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastTopComment, "\n"),
                            loc: firstToken.loc,
                            message: "Expected empty line between top-of-file comments and code",
                        });
                    } else if (firstToken.loc.start.line === lastTopComment.loc.end.line) {
                        // Code is on the same line as comment
                        context.report({
                            fix: (fixer) => fixer.insertTextBefore(firstToken, "\n\n"),
                            loc: firstToken.loc,
                            message: "Code should be on a new line after top-of-file comments",
                        });
                    }
                }

            },
        };
    },
    meta: {
        docs: { description: "Enforce comment spacing and formatting" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Call Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No space between function name and opening parenthesis.
 *
 * ✓ Good:
 *   useDispatch()
 *   myFunction(arg)
 *
 * ✗ Bad:
 *   useDispatch ()
 *   myFunction (arg)
 */
const functionCallSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkCallSpacingHandler = (node, callee) => {
            // Get the last token of the callee (function name or member expression)
            const calleeLastToken = sourceCode.getLastToken(callee);

            // For calls with type arguments (generics), check space before <
            // e.g., axiosClient.get <Type>() should be axiosClient.get<Type>()
            if (node.typeArguments || node.typeParameters) {
                const typeArgs = node.typeArguments || node.typeParameters;
                const openAngle = sourceCode.getFirstToken(typeArgs);

                if (openAngle && openAngle.value === "<") {
                    const textBeforeAngle = sourceCode.text.slice(calleeLastToken.range[1], openAngle.range[0]);

                    if (/\s/.test(textBeforeAngle)) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [calleeLastToken.range[1], openAngle.range[0]],
                                "",
                            ),
                            message: "No space between function name and generic type arguments",
                            node: openAngle,
                        });
                    }
                }

                // Also check space between closing > and opening (
                const closeAngle = sourceCode.getLastToken(typeArgs);
                const openParen = sourceCode.getTokenAfter(typeArgs);

                if (openParen && openParen.value === "(") {
                    const textBetween = sourceCode.text.slice(closeAngle.range[1], openParen.range[0]);

                    if (/\s/.test(textBetween)) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeAngle.range[1], openParen.range[0]],
                                "",
                            ),
                            message: "No space between generic type arguments and opening parenthesis",
                            node: openParen,
                        });
                    }
                }

                return;
            }

            // Get the opening parenthesis
            const openParen = sourceCode.getTokenAfter(callee);

            if (!openParen || openParen.value !== "(") return;

            // Check if there's space between callee and opening paren
            const textBetween = sourceCode.text.slice(calleeLastToken.range[1], openParen.range[0]);

            if (textBetween.length > 0) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [calleeLastToken.range[1], openParen.range[0]],
                        "",
                    ),
                    message: "No space between function name and opening parenthesis",
                    node: openParen,
                });
            }
        };

        return {
            CallExpression(node) {
                checkCallSpacingHandler(node, node.callee);
            },

            NewExpression(node) {
                checkCallSpacingHandler(node, node.callee);
            },
        };
    },
    meta: {
        docs: { description: "Enforce no space between function name and opening parenthesis" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Declaration Style
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce function expressions (arrow functions) instead of
 *   function declarations. Auto-fixes by converting to const
 *   arrow function expressions.
 *
 * ✓ Good:
 *   const getToken = (): string | null => getCookie(tokenKey);
 *   const clearAuth = (): void => {
 *       removeToken();
 *       clearStorage();
 *   };
 *
 * ✗ Bad:
 *   function getToken(): string | null { return getCookie(tokenKey); }
 *   function clearAuth(): void {
 *       removeToken();
 *       clearStorage();
 *   }
 */
const functionDeclarationStyle = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            FunctionDeclaration(node) {
                if (!node.id) return;

                const name = node.id.name;

                // Build the params text
                const paramsText = node.params.map((p) => sourceCode.getText(p)).join(", ");

                // Build return type annotation if present
                let returnType = "";

                if (node.returnType) {
                    returnType = sourceCode.getText(node.returnType);
                }

                // Build type parameters if present (generics)
                // For arrow functions in TSX files, use trailing comma to avoid JSX ambiguity: <T,>
                let typeParams = "";

                if (node.typeParameters) {
                    const typeParamsText = sourceCode.getText(node.typeParameters);

                    // Add trailing comma if single type parameter to avoid JSX parsing issues
                    // <T> becomes <T,> but <T, U> stays as is
                    if (node.typeParameters.params && node.typeParameters.params.length === 1) {
                        // Check if it already has a trailing comma
                        const innerText = typeParamsText.slice(1, -1).trim();

                        if (!innerText.endsWith(",")) {
                            typeParams = `<${innerText},>`;
                        } else {
                            typeParams = typeParamsText;
                        }
                    } else {
                        typeParams = typeParamsText;
                    }
                }

                // Check if async
                const isAsync = node.async;
                const asyncPrefix = isAsync ? "async " : "";

                // Get the body text
                const bodyText = sourceCode.getText(node.body);

                // Check for export keywords
                const parentNode = node.parent;
                const isExported = parentNode && parentNode.type === "ExportNamedDeclaration";

                const exportPrefix = isExported ? "export " : "";

                context.report({
                    fix(fixer) {
                        const fixTarget = isExported ? parentNode : node;

                        // For arrow functions with generics: const fn = <T,>(param: T) => ...
                        const replacement = `${exportPrefix}const ${name} = ${typeParams}${asyncPrefix}(${paramsText})${returnType} => ${bodyText};`;

                        return fixer.replaceText(fixTarget, replacement);
                    },
                    message: `Expected a function expression. Use \`const ${name} = ${typeParams}${asyncPrefix}(${paramsText})${returnType} => ...\` instead.`,
                    node: node.id,
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce arrow function expressions instead of function declarations" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function names should follow naming conventions: camelCase,
 *   starting with a verb, and ending with "Handler" suffix.
 *   Auto-fixes PascalCase functions to camelCase.
 *   Auto-fixes handleXxx to xxxHandler (avoids "handleClickHandler").
 *
 * ✓ Good:
 *   function getUserDataHandler() {}
 *   function clickHandler() {}
 *   function isValidEmailHandler() {}
 *   const submitHandler = () => {};
 *
 * ✗ Bad (auto-fixed):
 *   function GetUserData() {}    // → getUserDataHandler
 *   function handleClick() {}    // → clickHandler (not handleClickHandler)
 *   function getUserData() {}    // → getUserDataHandler
 *   const FetchStatus = () => {} // → fetchStatusHandler
 */
const functionNamingConvention = {
    create(context) {
        const componentNameRegex = /^[A-Z][a-zA-Z0-9]*$/;

        const handlerRegex = /Handler$/;

        const hookRegex = /^use[A-Z]/;

        // Comprehensive list of English verbs commonly used in function names
        // Organized by category for maintainability
        const verbPrefixes = [
            // CRUD & Data operations
            "get", "set", "fetch", "load", "save", "create", "update", "delete", "remove", "add",
            "insert", "append", "prepend", "push", "pop", "shift", "unshift", "put", "patch",
            // Boolean checks
            "is", "has", "can", "should", "will", "did", "was", "were", "does", "do",
            // Validation
            "check", "validate", "verify", "confirm", "ensure", "assert", "test", "match",
            // Search & Filter
            "find", "search", "filter", "sort", "map", "reduce", "merge", "split", "join",
            "query", "lookup", "locate", "detect", "identify", "discover", "scan", "probe",
            // Transformation
            "parse", "format", "convert", "transform", "normalize", "serialize", "deserialize",
            "encode", "decode", "encrypt", "decrypt", "hash", "sign", "compress", "decompress",
            "stringify", "objectify", "flatten", "unflatten", "transpose", "invert",
            // String manipulation
            "strip", "trim", "pad", "wrap", "unwrap", "sanitize", "escape", "unescape",
            "capitalize", "lowercase", "uppercase", "camel", "snake", "kebab", "truncate",
            "replace", "substitute", "interpolate", "template", "render",
            // Display & UI
            "display", "show", "hide", "toggle", "enable", "disable", "activate", "deactivate",
            "highlight", "focus", "blur", "select", "deselect", "expand", "collapse", "resize",
            "animate", "transition", "fade", "slide", "zoom", "rotate", "scale",
            // Lifecycle
            "open", "close", "start", "stop", "init", "setup", "reset", "clear", "destroy",
            "mount", "unmount", "attach", "detach", "bind", "unbind", "dispose", "cleanup",
            "register", "unregister", "install", "uninstall", "configure", "reconfigure",
            // Network & Communication
            "connect", "disconnect", "subscribe", "unsubscribe", "listen", "emit", "broadcast",
            "send", "receive", "request", "respond", "submit", "cancel", "abort", "poll",
            "download", "upload", "import", "export", "sync", "stream", "pipe",
            // File & I/O
            "read", "write", "copy", "move", "clone", "extract", "archive", "restore", "backup",
            // Computation
            "build", "make", "generate", "compute", "calculate", "process", "execute", "run",
            "evaluate", "analyze", "measure", "benchmark", "profile", "optimize",
            "count", "sum", "avg", "min", "max", "clamp", "round", "floor", "ceil", "abs",
            "increment", "decrement", "multiply", "divide", "mod", "negate",
            // Invocation
            "apply", "call", "invoke", "trigger", "fire", "dispatch", "emit", "raise", "signal",
            // Auth
            "login", "logout", "authenticate", "authorize", "grant", "revoke", "permit", "deny",
            // Navigation
            "navigate", "redirect", "route", "scroll", "jump", "go", "back", "forward",
            "refresh", "reload", "restore",
            // Logging
            "log", "warn", "error", "debug", "trace", "print", "dump", "inspect",
            // Error handling
            "throw", "catch", "resolve", "reject", "retry", "await", "recover", "fallback", "forgot",
            // Performance
            "debounce", "throttle", "memoize", "cache", "batch", "queue", "defer", "delay",
            "schedule", "preload", "prefetch", "lazy",
            // Events (note: "handle" is NOT included - handleXxx is auto-fixed to xxxHandler)
            "on", "click", "change", "input", "press", "drag", "drop",
            "hover", "enter", "leave", "touch", "swipe", "pinch", "tap",
            // Comparison
            "compare", "diff", "equal", "differ", "overlap", "intersect", "union", "exclude",
            // Grouping
            "group", "ungroup", "partition", "chunk", "segment", "categorize", "classify",
            // Ordering
            "order", "reorder", "arrange", "reverse", "shuffle", "randomize", "pick", "sample",
            // Validation state
            "lock", "unlock", "freeze", "unfreeze", "seal", "mark", "unmark", "flag", "unflag",
            // Misc common verbs
            "use", "require", "need", "want", "try", "attempt", "ensure", "guarantee",
            "prepare", "finalize", "complete", "finish", "end", "begin", "continue", "resume",
            "pause", "suspend", "interrupt", "break", "skip", "ignore", "include", "exclude",
            "accept", "decline", "approve", "reject", "confirm", "dismiss", "acknowledge",
            "assign", "allocate", "distribute", "collect", "gather", "aggregate", "accumulate",
            "populate", "fill", "empty", "drain", "flush", "purge", "prune", "clean", "sanitize",
            "compose", "decompose", "assemble", "disassemble", "construct", "deconstruct",
        ];

        const startsWithVerbHandler = (name) => verbPrefixes.some((verb) => name.startsWith(verb));

        // Case-insensitive check for verb prefix (to catch PascalCase like "GetForStatus")
        const startsWithVerbCaseInsensitiveHandler = (name) => {
            const lowerName = name.toLowerCase();

            return verbPrefixes.some((verb) => lowerName.startsWith(verb));
        };

        // Convert PascalCase to camelCase
        const toCamelCaseHandler = (name) => name[0].toLowerCase() + name.slice(1);

        const endsWithHandler = (name) => handlerRegex.test(name);

        // Check if a node contains JSX (making it a React component)
        const containsJsxHandler = (node) => {
            if (!node) return false;

            if (node.type === "JSXElement" || node.type === "JSXFragment") return true;

            if (node.type === "BlockStatement") {
                for (const statement of node.body) {
                    if (statement.type === "ReturnStatement" && statement.argument) {
                        if (containsJsxHandler(statement.argument)) return true;
                    }

                    if (statement.type === "IfStatement") {
                        if (containsJsxHandler(statement.consequent)) return true;
                        if (statement.alternate && containsJsxHandler(statement.alternate)) return true;
                    }
                }
            }

            if (node.type === "ConditionalExpression") {
                return containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);
            }

            if (node.type === "LogicalExpression") {
                return containsJsxHandler(node.left) || containsJsxHandler(node.right);
            }

            if (node.type === "ParenthesizedExpression") {
                return containsJsxHandler(node.expression);
            }

            return false;
        };

        // Check if function is a React component (PascalCase + returns JSX)
        const isReactComponentHandler = (node, name) => {
            if (!name || !/^[A-Z]/.test(name)) return false;

            return containsJsxHandler(node.body);
        };

        const checkFunctionHandler = (node) => {
            let name = null;
            let identifierNode = null;

            if (node.type === "FunctionDeclaration" && node.id) {
                name = node.id.name;
                identifierNode = node.id;
            } else if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
                if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id) {
                    name = node.parent.id.name;
                    identifierNode = node.parent.id;
                } else if (node.parent && node.parent.type === "CallExpression") {
                    // Check for useCallback wrapped functions: const login = useCallback(() => {...}, [])
                    // Note: Skip useMemo - it returns computed values, not action functions
                    const callExpr = node.parent;
                    const callee = callExpr.callee;

                    // Only check useCallback (not useMemo, useEffect, etc.)
                    if (callee && callee.type === "Identifier" && callee.name === "useCallback") {
                        // Check if the function is the first argument to useCallback
                        if (callExpr.arguments && callExpr.arguments[0] === node) {
                            // Check if the CallExpression is the init of a VariableDeclarator
                            if (callExpr.parent && callExpr.parent.type === "VariableDeclarator" && callExpr.parent.id) {
                                name = callExpr.parent.id.name;
                                identifierNode = callExpr.parent.id;
                            }
                        }
                    }
                }
            }

            if (!name || !identifierNode) return;

            // Skip hooks
            if (/^use[A-Z]/.test(name)) return;

            // Skip React components (PascalCase + returns JSX)
            if (isReactComponentHandler(node, name)) return;

            // Check PascalCase functions that are NOT React components
            if (/^[A-Z]/.test(name)) {
                // If starts with a verb (case-insensitive), it should be camelCase
                if (startsWithVerbCaseInsensitiveHandler(name)) {
                    const camelCaseName = toCamelCaseHandler(name);
                    const identifierNode = node.id || node.parent.id;

                    context.report({
                        fix(fixer) {
                            const scope = context.sourceCode
                                ? context.sourceCode.getScope(node)
                                : context.getScope();

                            const variable = scope.variables.find((v) => v.name === name)
                                || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                            if (!variable) return fixer.replaceText(identifierNode, camelCaseName);

                            const fixes = [];
                            const fixedRanges = new Set();

                            variable.references.forEach((ref) => {
                                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                if (!fixedRanges.has(rangeKey)) {
                                    fixedRanges.add(rangeKey);
                                    fixes.push(fixer.replaceText(ref.identifier, camelCaseName));
                                }
                            });

                            return fixes;
                        },
                        message: `Function "${name}" should be camelCase. Use "${camelCaseName}" instead of "${name}"`,
                        node: node.id || node.parent.id,
                    });
                }

                // Skip other PascalCase names (likely React components)
                return;
            }

            const hasVerbPrefix = startsWithVerbHandler(name);
            const hasHandlerSuffix = endsWithHandler(name);
            const startsWithHandle = /^handle[A-Z]/.test(name);

            // Special case: handleXxx -> xxxHandler (to avoid handleClickHandler)
            if (startsWithHandle && !hasHandlerSuffix) {
                const identifierNode = node.id || node.parent.id;
                // Remove "handle" prefix and add "Handler" suffix: handleClick -> clickHandler
                const baseName = name.slice(6); // Remove "handle"
                const newName = baseName[0].toLowerCase() + baseName.slice(1) + "Handler";

                context.report({
                    fix(fixer) {
                        const scope = context.sourceCode
                            ? context.sourceCode.getScope(node)
                            : context.getScope();

                        const variable = scope.variables.find((v) => v.name === name)
                            || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                        if (!variable) return fixer.replaceText(identifierNode, newName);

                        const fixes = [];
                        const fixedRanges = new Set();

                        const addFixHandler = (nodeToFix) => {
                            const rangeKey = `${nodeToFix.range[0]}-${nodeToFix.range[1]}`;

                            if (!fixedRanges.has(rangeKey)) {
                                fixedRanges.add(rangeKey);
                                fixes.push(fixer.replaceText(nodeToFix, newName));
                            }
                        };

                        variable.defs.forEach((def) => {
                            addFixHandler(def.name);
                        });

                        variable.references.forEach((ref) => {
                            addFixHandler(ref.identifier);
                        });

                        return fixes;
                    },
                    message: `Function "${name}" should be "${newName}" (handleXxx → xxxHandler to avoid redundant "handleXxxHandler")`,
                    node: identifierNode,
                });
                return;
            }

            if (!hasVerbPrefix && !hasHandlerSuffix) {
                context.report({
                    message: `Function "${name}" should start with a verb (get, set, fetch, etc.) AND end with "Handler" (e.g., getDataHandler, clickHandler)`,
                    node: identifierNode,
                });
            } else if (!hasVerbPrefix) {
                context.report({
                    message: `Function "${name}" should start with a verb (get, set, fetch, handle, click, submit, etc.)`,
                    node: identifierNode,
                });
            } else if (!hasHandlerSuffix) {
                const newName = `${name}Handler`;

                context.report({
                    fix(fixer) {
                        const scope = context.sourceCode
                            ? context.sourceCode.getScope(node)
                            : context.getScope();

                        // Find all references to this variable in the scope
                        const variable = scope.variables.find((v) => v.name === name)
                            || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                        if (!variable) return fixer.replaceText(identifierNode, newName);

                        const fixes = [];
                        const fixedRanges = new Set();

                        // Helper to add fix only if not already fixed (avoid overlapping fixes)
                        const addFixHandler = (nodeToFix) => {
                            const rangeKey = `${nodeToFix.range[0]}-${nodeToFix.range[1]}`;

                            if (!fixedRanges.has(rangeKey)) {
                                fixedRanges.add(rangeKey);
                                fixes.push(fixer.replaceText(nodeToFix, newName));
                            }
                        };

                        // Fix the definition
                        variable.defs.forEach((def) => {
                            addFixHandler(def.name);
                        });

                        // Fix all references
                        variable.references.forEach((ref) => {
                            addFixHandler(ref.identifier);
                        });

                        return fixes;
                    },
                    message: `Function "${name}" should end with "Handler" suffix (e.g., ${newName})`,
                    node: identifierNode,
                });
            }
        };

        // Check class methods (MethodDefinition)
        const checkMethodHandler = (node) => {
            // Skip constructors
            if (node.kind === "constructor") return;

            // Skip getters and setters - they're property accessors, not action methods
            if (node.kind === "get" || node.kind === "set") return;

            const { key } = node;

            // Only check methods with Identifier keys (skip computed properties like [Symbol.iterator])
            if (key.type !== "Identifier") return;

            const name = key.name;

            // Skip hooks
            if (/^use[A-Z]/.test(name)) return;

            // Skip React lifecycle methods
            const lifecycleMethods = [
                "render", "componentDidMount", "componentDidUpdate", "componentWillUnmount",
                "shouldComponentUpdate", "getSnapshotBeforeUpdate", "componentDidCatch",
                "getDerivedStateFromProps", "getDerivedStateFromError",
            ];

            if (lifecycleMethods.includes(name)) return;

            const hasVerbPrefix = startsWithVerbHandler(name);
            const hasHandlerSuffix = endsWithHandler(name);

            if (!hasVerbPrefix && !hasHandlerSuffix) {
                context.report({
                    message: `Method "${name}" should start with a verb (get, set, fetch, handle, etc.) AND end with "Handler" (e.g., getDataHandler, handleClickHandler)`,
                    node: key,
                });
            } else if (!hasVerbPrefix) {
                context.report({
                    message: `Method "${name}" should start with a verb (get, set, fetch, handle, click, submit, etc.)`,
                    node: key,
                });
            } else if (!hasHandlerSuffix) {
                const newName = `${name}Handler`;

                context.report({
                    fix(fixer) {
                        // For class methods, we need to find all references manually
                        // This is simpler than functions since class methods are typically accessed via this.methodName
                        const fixes = [fixer.replaceText(key, newName)];

                        // Find all references to this method in the class body
                        const classBody = node.parent;

                        if (classBody && classBody.type === "ClassBody") {
                            // Find usages like this.methodName or super.methodName
                            const classNode = classBody.parent;

                            if (classNode) {
                                const visited = new Set();

                                const searchPatternHandler = (n) => {
                                    // Avoid circular references and already visited nodes
                                    if (!n || typeof n !== "object" || visited.has(n)) return;

                                    visited.add(n);

                                    if (n.type === "MemberExpression" &&
                                        n.property &&
                                        n.property.type === "Identifier" &&
                                        n.property.name === name &&
                                        n.object &&
                                        (n.object.type === "ThisExpression" || n.object.type === "Super")) {
                                        // Don't fix the definition itself
                                        if (n.property !== key) {
                                            fixes.push(fixer.replaceText(n.property, newName));
                                        }
                                    }

                                    // Recursively search only AST child properties (skip parent, tokens, etc.)
                                    const childKeys = ["body", "declarations", "expression", "left", "right",
                                        "callee", "arguments", "object", "property", "consequent", "alternate",
                                        "test", "init", "update", "params", "elements", "properties", "value",
                                        "key", "argument", "block", "handler", "finalizer", "cases"];

                                    for (const childKey of childKeys) {
                                        const child = n[childKey];

                                        if (child) {
                                            if (Array.isArray(child)) {
                                                child.forEach((item) => searchPatternHandler(item));
                                            } else {
                                                searchPatternHandler(child);
                                            }
                                        }
                                    }
                                };

                                searchPatternHandler(classNode);
                            }
                        }

                        return fixes;
                    },
                    message: `Method "${name}" should end with "Handler" suffix (e.g., ${newName})`,
                    node: key,
                });
            }
        };

        // Check functions destructured from custom hooks: const { logout } = useAuth()
        // Valid: onLogout, logoutAction, logoutHandler
        // Invalid: logout (should be logoutHandler)
        const checkDestructuredHookFunctionHandler = (node) => {
            // Check if this is destructuring from a hook call: const { ... } = useXxx()
            if (!node.init || node.init.type !== "CallExpression") return;
            if (!node.id || node.id.type !== "ObjectPattern") return;

            const callee = node.init.callee;

            // Check if it's a hook call (starts with "use")
            if (!callee || callee.type !== "Identifier" || !hookRegex.test(callee.name)) return;

            // Action verbs that are clearly function names (not noun-like)
            // These are verbs that when used alone as a name, clearly indicate an action/function
            const actionVerbs = [
                // Auth actions
                "login", "logout", "authenticate", "authorize", "signup", "signout", "signin",
                // CRUD actions (when standalone, not as prefix)
                "submit", "reset", "clear", "refresh", "reload", "retry",
                // Toggle/state actions
                "toggle", "enable", "disable", "activate", "deactivate",
                "show", "hide", "open", "close", "expand", "collapse",
                // Navigation
                "navigate", "redirect", "goBack", "goForward",
                // Increment/decrement
                "increment", "decrement", "increase", "decrease",
                // Other common hook function names
                "connect", "disconnect", "subscribe", "unsubscribe",
                "start", "stop", "pause", "resume", "cancel", "abort",
                "select", "deselect", "check", "uncheck",
                "add", "remove", "insert", "delete", "update",
            ];

            // Check each destructured property
            node.id.properties.forEach((prop) => {
                if (prop.type !== "Property" || prop.key.type !== "Identifier") return;

                const name = prop.key.name;

                // Get the local variable name (value node for non-shorthand, key for shorthand)
                const valueNode = prop.value || prop.key;
                const localName = valueNode.type === "Identifier" ? valueNode.name : name;

                // Skip if local name starts with "on" (like onLogout, onClick)
                if (/^on[A-Z]/.test(localName)) return;

                // Skip if local name ends with "Action" (like logoutAction)
                if (/Action$/.test(localName)) return;

                // Skip if local name ends with "Handler" (like logoutHandler)
                if (handlerRegex.test(localName)) return;

                // Skip boolean-like names (is, has, can, should, etc.)
                const booleanPrefixes = ["is", "has", "can", "should", "will", "did", "was", "were", "does"];

                if (booleanPrefixes.some((prefix) => localName.startsWith(prefix) && localName.length > prefix.length && /[A-Z]/.test(localName[prefix.length]))) return;

                // Only flag if the name is exactly an action verb or starts with one followed by uppercase
                const isActionVerb = actionVerbs.some((verb) =>
                    localName === verb || (localName.startsWith(verb) && localName.length > verb.length && /[A-Z]/.test(localName[verb.length])));

                if (!isActionVerb) return;

                // This is a function name without proper prefix/suffix
                // Add Handler suffix: logout -> logoutHandler
                const suggestedName = localName + "Handler";

                context.report({
                    fix(fixer) {
                        const fixes = [];
                        const sourceCode = context.sourceCode || context.getSourceCode();

                        if (prop.shorthand) {
                            // Shorthand: { logout } -> { logout: logoutHandler }
                            // Replace the entire property with key: newValue format
                            fixes.push(fixer.replaceText(prop, `${name}: ${suggestedName}`));
                        } else {
                            // Non-shorthand: { logout: myVar } -> { logout: myVarHandler }
                            // Just replace the value identifier
                            fixes.push(fixer.replaceText(valueNode, suggestedName));
                        }

                        // Find and rename all usages of the local variable
                        const scope = sourceCode.getScope
                            ? sourceCode.getScope(node)
                            : context.getScope();

                        // Helper to find variable in scope chain
                        const findVariableHandler = (s, varName) => {
                            const v = s.variables.find((variable) => variable.name === varName);

                            if (v) return v;
                            if (s.upper) return findVariableHandler(s.upper, varName);

                            return null;
                        };

                        const variable = findVariableHandler(scope, localName);

                        if (variable) {
                            const fixedRanges = new Set();

                            // Add the definition range to avoid double-fixing
                            if (valueNode.range) {
                                fixedRanges.add(`${valueNode.range[0]}-${valueNode.range[1]}`);
                            }

                            // Fix all references
                            variable.references.forEach((ref) => {
                                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                if (!fixedRanges.has(rangeKey)) {
                                    fixedRanges.add(rangeKey);
                                    fixes.push(fixer.replaceText(ref.identifier, suggestedName));
                                }
                            });
                        }

                        return fixes;
                    },
                    message: `Function "${localName}" destructured from hook should end with "Handler" suffix. Use "${suggestedName}" instead`,
                    node: valueNode,
                });
            });
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            MethodDefinition: checkMethodHandler,
            VariableDeclarator: checkDestructuredHookFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce function and method names to start with a verb AND end with Handler" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Params Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When function parameters span multiple lines, each parameter
 *   should be on its own line with consistent indentation.
 *
 * ✓ Good:
 *   function test(
 *       param1,
 *       param2,
 *       param3,
 *   ) {}
 *
 * ✗ Bad:
 *   function test(param1,
 *       param2, param3) {}
 */
const functionParamsPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const getCleanParamTextHandler = (param) => {
            if (param.type === "ObjectPattern") {
                const props = param.properties.map((prop) => {
                    if (prop.type === "RestElement") {
                        return `...${getCleanParamTextHandler(prop.argument)}`;
                    }

                    const key = sourceCode.getText(prop.key);

                    // Recursively clean nested patterns
                    let value;

                    if (prop.value) {
                        if (prop.value.type === "ObjectPattern" || prop.value.type === "ArrayPattern" || prop.value.type === "AssignmentPattern") {
                            value = getCleanParamTextHandler(prop.value);
                        } else {
                            value = sourceCode.getText(prop.value).replace(/\s+/g, " ").trim();
                        }
                    } else {
                        value = key;
                    }

                    // Check if shorthand (key and value are the same identifier)
                    const isShorthand = prop.shorthand || (prop.value && prop.value.type === "Identifier" && prop.value.name === prop.key.name);

                    if (isShorthand) {
                        // For shorthand with default value, use the value (includes default)
                        return prop.value && prop.value.type === "AssignmentPattern" ? value : key;
                    }

                    return `${key}: ${value}`;
                });

                let result = `{ ${props.join(", ")} }`;

                // Preserve type annotation if present
                if (param.typeAnnotation) {
                    let typeText = sourceCode.getText(param.typeAnnotation);
                    const typeAnnotation = param.typeAnnotation.typeAnnotation;

                    // For single-member inline types, collapse to one line
                    if (typeAnnotation) {
                        let members = null;

                        if (typeAnnotation.type === "TSTypeLiteral") {
                            members = typeAnnotation.members;
                        } else if (typeAnnotation.type === "TSIntersectionType") {
                            const typeLiteral = typeAnnotation.types.find((t) => t.type === "TSTypeLiteral");

                            if (typeLiteral) {
                                members = typeLiteral.members;
                            }
                        }

                        if (members && members.length === 1) {
                            // Normalize whitespace to collapse to one line, remove trailing comma
                            typeText = typeText.replace(/\s+/g, " ").trim().replace(/,\s*}/, " }").replace(/,\s*&/, " &");
                        }
                    }

                    result += typeText;
                }

                return result;
            }

            if (param.type === "ArrayPattern") {
                const elems = param.elements.map((el) => {
                    if (el === null) return "";

                    return getCleanParamTextHandler(el);
                });

                return `[${elems.join(", ")}]`;
            }

            if (param.type === "AssignmentPattern") {
                const leftText = getCleanParamTextHandler(param.left);
                const rightText = sourceCode.getText(param.right).replace(/\s+/g, " ").trim();

                return `${leftText} = ${rightText}`;
            }

            if (param.type === "RestElement") {
                return `...${getCleanParamTextHandler(param.argument)}`;
            }

            return sourceCode.getText(param).replace(/\s+/g, " ").trim();
        };

        // Check if a pattern (or any nested pattern) has 2+ properties
        const hasComplexPatternHandler = (pattern) => {
            if (!pattern) return false;

            if (pattern.type === "AssignmentPattern") {
                return hasComplexPatternHandler(pattern.left);
            }

            if (pattern.type === "ObjectPattern") {
                // Check if this pattern has 2+ properties
                if (pattern.properties.length >= 2) return true;

                // Check if type annotation has 2+ members (TSTypeLiteral)
                if (pattern.typeAnnotation && pattern.typeAnnotation.typeAnnotation) {
                    const typeAnnotation = pattern.typeAnnotation.typeAnnotation;

                    if (typeAnnotation.type === "TSTypeLiteral" && typeAnnotation.members.length >= 2) {
                        return true;
                    }

                    // Also check intersection types for TSTypeLiteral with 2+ members
                    if (typeAnnotation.type === "TSIntersectionType") {
                        const typeLiteral = typeAnnotation.types.find((t) => t.type === "TSTypeLiteral");

                        if (typeLiteral && typeLiteral.members.length >= 2) {
                            return true;
                        }
                    }
                }

                // Check nested patterns
                for (const prop of pattern.properties) {
                    if (prop.type === "Property" && prop.value) {
                        if (hasComplexPatternHandler(prop.value)) return true;
                    }
                }
            }

            if (pattern.type === "ArrayPattern") {
                const elements = pattern.elements.filter((el) => el !== null);

                if (elements.length >= 2) return true;

                // Check nested patterns
                for (const el of elements) {
                    if (hasComplexPatternHandler(el)) return true;
                }
            }

            return false;
        };

        // Returns true only if any param has 2+ destructured properties (including nested)
        const hasComplexDestructuredParamHandler = (params) => params.some((param) => hasComplexPatternHandler(param));

        const checkDestructuredParamHandler = (param, baseIndent) => {
            let pattern = param;

            if (param.type === "AssignmentPattern") {
                pattern = param.left;
            }

            // Only enforce multi-line for 2+ destructured properties
            if (pattern.type === "ObjectPattern") {
                const properties = pattern.properties;

                // Check if this pattern needs multiline:
                // - Has 2+ properties itself, OR
                // - Any nested pattern has 2+ properties (is complex)
                const hasComplexNested = properties.some((prop) => {
                    if (prop.type === "Property" && prop.value) {
                        return hasComplexPatternHandler(prop.value);
                    }

                    return false;
                });

                const needsMultiline = properties.length >= 2 || hasComplexNested;

                // Check nested patterns first (regardless of this pattern's property count)
                for (const prop of properties) {
                    if (prop.type === "Property" && prop.value) {
                        // Calculate indent for nested pattern
                        const nestedIndent = baseIndent + 4;

                        checkDestructuredParamHandler(prop.value, nestedIndent);
                    }
                }

                if (!needsMultiline) return;

                const openBrace = sourceCode.getFirstToken(pattern);
                // Don't use getLastToken(pattern) - for ObjectPattern with typeAnnotation,
                // the pattern's range includes the type annotation, so getLastToken would
                // return the last token of the type, not the closing brace.
                // Instead, find the "}" token after the last property.
                const lastProp = properties[properties.length - 1];
                let closeBrace = sourceCode.getTokenAfter(lastProp);

                while (closeBrace && closeBrace.value !== "}") {
                    closeBrace = sourceCode.getTokenAfter(closeBrace);
                }
                const propIndent = " ".repeat(baseIndent + 4);
                const braceIndent = " ".repeat(baseIndent);

                if (openBrace.loc.end.line === properties[0].loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], properties[0].range[0]],
                            "\n" + propIndent,
                        ),
                        message: "First destructured property should be on its own line when complex destructuring",
                        node: properties[0],
                    });
                }

                if (closeBrace.loc.start.line === properties[properties.length - 1].loc.end.line) {
                    // Check if pattern has a type annotation (it's on pattern, not param for AssignmentPattern)
                    const hasTypeAnnotation = pattern.typeAnnotation;

                    context.report({
                        fix: (fixer) => {
                            if (hasTypeAnnotation) {
                                // Include the closing brace in the replacement to avoid conflicts
                                // with componentPropsInlineType rule
                                return fixer.replaceTextRange(
                                    [properties[properties.length - 1].range[1], closeBrace.range[1]],
                                    ",\n" + braceIndent + "}",
                                );
                            }

                            return fixer.replaceTextRange(
                                [properties[properties.length - 1].range[1], closeBrace.range[0]],
                                ",\n" + braceIndent,
                            );
                        },
                        message: "Closing brace should be on its own line when complex destructuring",
                        node: closeBrace,
                    });
                }

                for (let i = 0; i < properties.length - 1; i += 1) {
                    const current = properties[i];

                    const next = properties[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(
                            current,
                            (token) => token.value === ",",
                        );

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + propIndent,
                            ),
                            message: "Each destructured property should be on its own line when complex destructuring",
                            node: next,
                        });
                    }
                }
            }

            // Only enforce multi-line for 2+ destructured array elements
            if (pattern.type === "ArrayPattern") {
                const elements = pattern.elements.filter((el) => el !== null);

                // Check nested patterns first
                for (const el of elements) {
                    if (el) {
                        const nestedIndent = baseIndent + 4;

                        checkDestructuredParamHandler(el, nestedIndent);
                    }
                }

                if (elements.length < 2) return;

                const openBracket = sourceCode.getFirstToken(pattern);
                const closeBracket = sourceCode.getLastToken(pattern);
                const elemIndent = " ".repeat(baseIndent + 4);
                const bracketIndent = " ".repeat(baseIndent);

                if (openBracket.loc.end.line === elements[0].loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], elements[0].range[0]],
                            "\n" + elemIndent,
                        ),
                        message: "First destructured element should be on its own line when 2+ elements",
                        node: elements[0],
                    });
                }

                if (closeBracket.loc.start.line === elements[elements.length - 1].loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [elements[elements.length - 1].range[1], closeBracket.range[0]],
                            ",\n" + bracketIndent,
                        ),
                        message: "Closing bracket should be on its own line when 2+ elements",
                        node: closeBracket,
                    });
                }

                for (let i = 0; i < elements.length - 1; i += 1) {
                    const current = elements[i];
                    const next = elements[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(
                            current,
                            (token) => token.value === ",",
                        );

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + elemIndent,
                            ),
                            message: "Each destructured element should be on its own line when 2+ elements",
                            node: next,
                        });
                    }
                }
            }
        };

        // Check if arrow function is a callback argument
        const isCallbackArrowHandler = (node) => {
            if (node.type !== "ArrowFunctionExpression") return false;

            const { parent } = node;

            return parent && parent.type === "CallExpression" && parent.arguments.includes(node);
        };

        const checkFunctionHandler = (node) => {
            const params = node.params;

            if (params.length === 0) return;

            const isCallback = isCallbackArrowHandler(node);

            // Find opening paren
            let openParen = sourceCode.getFirstToken(node);

            while (openParen && openParen.value !== "(") {
                openParen = sourceCode.getTokenAfter(openParen);
            }

            if (!openParen) return;

            const lastParam = params[params.length - 1];
            const closeParen = sourceCode.getTokenAfter(lastParam, (t) => t.value === ")");

            if (!closeParen) return;

            const firstParam = params[0];
            const isMultiLine = openParen.loc.end.line !== closeParen.loc.start.line;
            const paramsText = params.map((p) => getCleanParamTextHandler(p)).join(", ");
            const currentText = sourceCode.text.slice(
                openParen.range[1],
                closeParen.range[0],
            );

            // Callback arrow functions with 2+ params: each param on its own line
            // This handles both simple params (item, index) and mixed params ({ item }, index)
            if (isCallback && params.length >= 2) {
                // Calculate proper indent based on line's base indentation, not the paren column
                // This ensures consistent indentation for callbacks in method chains
                const lineText = sourceCode.lines[openParen.loc.start.line - 1];
                const lineIndent = lineText.match(/^(\s*)/)[1].length;
                const paramIndent = " ".repeat(lineIndent + 4);
                const parenIndent = " ".repeat(lineIndent);

                // Check if first param is on same line as opening paren
                if (openParen.loc.end.line === firstParam.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], firstParam.range[0]],
                            "\n" + paramIndent,
                        ),
                        message: "Callback arrow with 2+ params: first param should be on its own line",
                        node: firstParam,
                    });
                }

                // Check if closing paren is on same line as last param
                if (closeParen.loc.start.line === lastParam.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastParam.range[1], closeParen.range[0]],
                            ",\n" + parenIndent,
                        ),
                        message: "Callback arrow with 2+ params: closing paren should be on its own line",
                        node: closeParen,
                    });
                }

                // Check each param is on its own line
                for (let i = 0; i < params.length - 1; i += 1) {
                    const current = params[i];
                    const next = params[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(
                            current,
                            (token) => token.value === ",",
                        );

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + paramIndent,
                            ),
                            message: "Callback arrow with 2+ params: each param should be on its own line",
                            node: next,
                        });
                    }
                }

                return;
            }

            // Skip single-param callback arrow functions (handled by opening-brackets-same-line)
            if (isCallback) return;

            // 1-2 simple params without complex destructuring: keep on same line
            if (params.length <= 2 && !hasComplexDestructuredParamHandler(params)) {
                const needsSpacingFix = !isMultiLine && params.length > 1 && currentText !== paramsText;

                if (isMultiLine || needsSpacingFix) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], closeParen.range[0]],
                            paramsText,
                        ),
                        message: isMultiLine
                            ? "Function parameters should be on same line when 2 or fewer without complex destructuring"
                            : "Missing space after comma between parameters",
                        node,
                    });
                }

                return;
            }

            // 3+ params OR has destructuring: each param on its own line
            const paramIndent = " ".repeat(firstParam.loc.start.column);
            const parenIndent = " ".repeat(openParen.loc.start.column);

            // Skip opening brace check for single ObjectPattern param (handled by opening-brackets-same-line)
            const isSingleObjectPattern = params.length === 1 && (firstParam.type === "ObjectPattern" || (firstParam.type === "AssignmentPattern" && firstParam.left.type === "ObjectPattern"));

            if (!isSingleObjectPattern && openParen.loc.end.line === firstParam.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], firstParam.range[0]],
                        "\n" + paramIndent,
                    ),
                    message: "First parameter should be on its own line when more than 2 parameters or has destructuring",
                    node: firstParam,
                });
            }

            // Skip closing paren check for single ObjectPattern param (opening-brackets-same-line keeps }) together)
            if (!isSingleObjectPattern && closeParen.loc.start.line === lastParam.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastParam.range[1], closeParen.range[0]],
                        ",\n" + parenIndent,
                    ),
                    message: "Closing parenthesis should be on its own line when more than 2 parameters or has destructuring",
                    node: closeParen,
                });
            }

            for (let i = 0; i < params.length - 1; i += 1) {
                const current = params[i];
                const next = params[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + paramIndent,
                        ),
                        message: "Each parameter should be on its own line when more than 2 parameters or has destructuring",
                        node: next,
                    });
                }
            }

            // Check nested destructuring inside each param
            for (const p of params) {
                const pIndent = p.loc.start.column;

                checkDestructuredParamHandler(p, pIndent);
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce function parameters on separate lines when more than 2" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Hook Callback Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce consistent formatting for React hooks like useEffect,
 *   useCallback, useMemo with callback and dependency array.
 *
 * ✓ Good:
 *   useEffect(
 *       () => { doSomething(); },
 *       [dep1, dep2],
 *   );
 *
 * ✗ Bad:
 *   useEffect(() => { doSomething(); }, [dep1, dep2]);
 */
const hookCallbackFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Hooks that take callback + deps array pattern
        const hooksWithDeps = [
            "useEffect",
            "useLayoutEffect",
            "useCallback",
            "useMemo",
            "useImperativeHandle",
        ];

        return {
            CallExpression(node) {
                const { callee } = node;

                // Check if this is a hook call
                if (callee.type !== "Identifier" || !hooksWithDeps.includes(callee.name)) return;

                const args = node.arguments;

                if (args.length === 0) return;

                const firstArg = args[0];

                // First argument should be arrow function or function expression
                if (firstArg.type !== "ArrowFunctionExpression" && firstArg.type !== "FunctionExpression") return;

                const openParen = sourceCode.getTokenAfter(callee);

                if (!openParen || openParen.value !== "(") return;

                // Check 1: Arrow function should start on new line after (
                if (openParen.loc.end.line === firstArg.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], firstArg.range[0]],
                            "\n        ",
                        ),
                        message: `${callee.name} callback should start on a new line after opening parenthesis`,
                        node: firstArg,
                    });
                }

                // Check 2: If there's a second argument (deps array), it should be on its own line
                if (args.length >= 2) {
                    const secondArg = args[1];
                    const commaAfterFirst = sourceCode.getTokenAfter(firstArg);

                    if (commaAfterFirst && commaAfterFirst.value === ",") {
                        // Deps array should be on new line after the comma
                        if (commaAfterFirst.loc.end.line === secondArg.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [commaAfterFirst.range[1], secondArg.range[0]],
                                    "\n        ",
                                ),
                                message: `${callee.name} dependency array should be on a new line`,
                                node: secondArg,
                            });
                        }
                    }

                    // Check 3: Closing paren should be on its own line after deps array
                    const lastArg = args[args.length - 1];
                    let closeParen = sourceCode.getTokenAfter(lastArg);

                    // Skip trailing comma
                    if (closeParen && closeParen.value === ",") {
                        closeParen = sourceCode.getTokenAfter(closeParen);
                    }

                    if (closeParen && closeParen.value === ")") {
                        if (lastArg.loc.end.line === closeParen.loc.start.line) {
                            // Get the token before closeParen to check for trailing comma
                            const tokenBeforeClose = sourceCode.getTokenBefore(closeParen);
                            const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                            if (!hasTrailingComma) {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [lastArg.range[1], closeParen.range[0]],
                                        ",\n    ",
                                    ),
                                    message: `${callee.name} closing parenthesis should be on a new line`,
                                    node: closeParen,
                                });
                            } else {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [tokenBeforeClose.range[1], closeParen.range[0]],
                                        "\n    ",
                                    ),
                                    message: `${callee.name} closing parenthesis should be on a new line`,
                                    node: closeParen,
                                });
                            }
                        }
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent formatting for React hooks (useEffect, useCallback, etc.)" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Hook Deps Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   React hook dependency arrays with more than maxDeps dependencies
 *   should have each dependency on its own line.
 *
 * Options:
 *   { maxDeps: 2 } - Maximum dependencies on single line (default: 2)
 *
 * ✓ Good:
 *   useEffect(() => {}, [dep1, dep2])
 *   useEffect(() => {}, [
 *       dep1,
 *       dep2,
 *       dep3,
 *   ])
 *
 * ✗ Bad:
 *   useEffect(() => {}, [dep1, dep2, dep3, dep4])
 */
const hookDepsPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxDeps = options.maxDeps !== undefined ? options.maxDeps : 2;

        const hookNames = [
            "useEffect",
            "useCallback",
            "useMemo",
            "useLayoutEffect",
            "useImperativeHandle",
        ];

        const checkHookCallHandler = (node) => {
            // Skip non-hook calls
            if (node.callee.type !== "Identifier" || !hookNames.includes(node.callee.name)) {
                return;
            }

            // Get the dependencies array (last argument for hooks)
            const depsArg = node.arguments[node.arguments.length - 1];

            // Skip if no deps array or not an array
            if (!depsArg || depsArg.type !== "ArrayExpression") {
                return;
            }

            const elements = depsArg.elements.filter(Boolean);

            if (elements.length === 0) return;

            const openBracket = sourceCode.getFirstToken(depsArg);
            const closeBracket = sourceCode.getLastToken(depsArg);
            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            // If maxDeps or fewer dependencies, they should be on the same line
            if (elements.length <= maxDeps) {
                const isMultiLine = openBracket.loc.end.line !== closeBracket.loc.start.line;

                if (isMultiLine) {
                    const elementsText = elements.map((el) => sourceCode.getText(el)).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], closeBracket.range[0]],
                            elementsText,
                        ),
                        message: `Hook dependencies with ≤${maxDeps} items should be single line: [dep1, dep2]. Multi-line only for >${maxDeps} dependencies`,
                        node: depsArg,
                    });
                }

                return;
            }

            // More than maxDeps dependencies - each on its own line
            const elementIndent = " ".repeat(openBracket.loc.start.column + 4);
            const bracketIndent = " ".repeat(openBracket.loc.start.column);

            if (openBracket.loc.end.line === firstElement.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBracket.range[1], firstElement.range[0]],
                        "\n" + elementIndent,
                    ),
                    message: `First dependency should be on its own line when more than ${maxDeps}`,
                    node: firstElement,
                });
            }

            if (closeBracket.loc.start.line === lastElement.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastElement.range[1], closeBracket.range[0]],
                        ",\n" + bracketIndent,
                    ),
                    message: `Closing bracket should be on its own line when more than ${maxDeps} dependencies`,
                    node: closeBracket,
                });
            }

            for (let i = 0; i < elements.length - 1; i += 1) {
                const current = elements[i];
                const next = elements[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(current);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + elementIndent,
                        ),
                        message: `Each dependency should be on its own line when more than ${maxDeps}`,
                        node: next,
                    });
                }
            }
        };

        return { CallExpression: checkHookCallHandler };
    },
    meta: {
        docs: { description: "Enforce each hook dependency on its own line when exceeding threshold (default: >2)" },
        fixable: "whitespace",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxDeps: {
                        default: 2,
                        description: "Maximum dependencies to keep on single line (default: 2)",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: useState Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When useState holds a boolean value, the state variable name
 *   should start with a valid boolean prefix (is, has, with, without).
 *
 * ✓ Good:
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [hasError, setHasError] = useState(false);
 *   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAuth());
 *
 * ✗ Bad:
 *   const [loading, setLoading] = useState(false);
 *   const [authenticated, setAuthenticated] = useState<boolean>(true);
 *   const [error, setError] = useState<boolean>(false);
 */
const useStateNamingConvention = {
    create(context) {
        const options = context.options[0] || {};

        // Boolean prefixes handling (same pattern as prop-naming-convention)
        const defaultBooleanPrefixes = ["is", "has", "with", "without"];
        const booleanPrefixes = options.booleanPrefixes || [
            ...defaultBooleanPrefixes,
            ...(options.extendBooleanPrefixes || []),
        ];

        const allowPastVerbBoolean = options.allowPastVerbBoolean || false;
        const allowContinuousVerbBoolean = options.allowContinuousVerbBoolean || false;

        // Pattern to check if name starts with valid boolean prefix followed by capital letter
        const booleanPrefixPattern = new RegExp(`^(${booleanPrefixes.join("|")})[A-Z]`);

        // Pattern for past verb booleans (ends with -ed: disabled, selected, checked, etc.)
        const pastVerbPattern = /^[a-z]+ed$/;

        // Pattern for continuous verb booleans (ends with -ing: loading, saving, etc.)
        const continuousVerbPattern = /^[a-z]+ing$/;

        // Words that suggest "has" prefix instead of "is"
        const hasKeywords = [
            "children", "content", "data", "error", "errors", "items",
            "permission", "permissions", "value", "values",
        ];

        // Convert name to appropriate boolean prefix
        const toBooleanNameHandler = (name) => {
            const lowerName = name.toLowerCase();
            const prefix = hasKeywords.some((k) => lowerName.includes(k)) ? "has" : "is";

            return prefix + name[0].toUpperCase() + name.slice(1);
        };

        // Convert setter name based on new state name
        const toSetterNameHandler = (stateName) => "set" + stateName[0].toUpperCase() + stateName.slice(1);

        // Check if name is a valid boolean state name
        const isValidBooleanNameHandler = (name) => {
            // Starts with valid prefix
            if (booleanPrefixPattern.test(name)) return true;

            // Allow past verb booleans if option is enabled (disabled, selected, checked, etc.)
            if (allowPastVerbBoolean && pastVerbPattern.test(name)) return true;

            // Allow continuous verb booleans if option is enabled (loading, saving, etc.)
            if (allowContinuousVerbBoolean && continuousVerbPattern.test(name)) return true;

            return false;
        };

        // Check if the useState initial value indicates boolean
        const isBooleanValueHandler = (arg) => {
            if (!arg) return false;

            // Direct boolean literal: useState(false) or useState(true)
            if (arg.type === "Literal" && typeof arg.value === "boolean") return true;

            // Arrow function returning boolean: useState(() => checkAuth())
            // We can't reliably determine return type, so skip these unless typed
            return false;
        };

        // Check if the useState has boolean type annotation
        const hasBooleanTypeAnnotationHandler = (node) => {
            // useState<boolean>(...) or useState<boolean | null>(...)
            if (node.typeParameters && node.typeParameters.params && node.typeParameters.params.length > 0) {
                const typeParam = node.typeParameters.params[0];

                if (typeParam.type === "TSBooleanKeyword") return true;

                // Check union types: boolean | null, boolean | undefined
                if (typeParam.type === "TSUnionType") {
                    return typeParam.types.some((t) => t.type === "TSBooleanKeyword");
                }
            }

            return false;
        };

        return {
            CallExpression(node) {
                // Check if it's a useState call
                if (node.callee.type !== "Identifier" || node.callee.name !== "useState") return;

                // Check if it's in a variable declaration with array destructuring
                if (!node.parent || node.parent.type !== "VariableDeclarator") return;
                if (!node.parent.id || node.parent.id.type !== "ArrayPattern") return;

                const arrayPattern = node.parent.id;

                // Must have at least the state variable (first element)
                if (!arrayPattern.elements || arrayPattern.elements.length < 1) return;

                const stateElement = arrayPattern.elements[0];
                const setterElement = arrayPattern.elements[1];

                if (!stateElement || stateElement.type !== "Identifier") return;

                const stateName = stateElement.name;

                // Check if this is a boolean useState
                const isBooleanState = (node.arguments && node.arguments.length > 0 && isBooleanValueHandler(node.arguments[0]))
                    || hasBooleanTypeAnnotationHandler(node);

                if (!isBooleanState) return;

                // Check if state name follows boolean naming convention
                if (isValidBooleanNameHandler(stateName)) return;

                const suggestedStateName = toBooleanNameHandler(stateName);
                const suggestedSetterName = toSetterNameHandler(suggestedStateName);

                context.report({
                    fix(fixer) {
                        const fixes = [];
                        const scope = context.sourceCode
                            ? context.sourceCode.getScope(node)
                            : context.getScope();

                        // Helper to find variable in scope
                        const findVariableHandler = (s, name) => {
                            const v = s.variables.find((variable) => variable.name === name);

                            if (v) return v;
                            if (s.upper) return findVariableHandler(s.upper, name);

                            return null;
                        };

                        // Fix state variable
                        const stateVar = findVariableHandler(scope, stateName);
                        const stateFixedRanges = new Set();

                        // Fix definition first
                        const stateDefRangeKey = `${stateElement.range[0]}-${stateElement.range[1]}`;

                        stateFixedRanges.add(stateDefRangeKey);
                        fixes.push(fixer.replaceText(stateElement, suggestedStateName));

                        // Fix all usages
                        if (stateVar) {
                            stateVar.references.forEach((ref) => {
                                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                if (!stateFixedRanges.has(rangeKey)) {
                                    stateFixedRanges.add(rangeKey);
                                    fixes.push(fixer.replaceText(ref.identifier, suggestedStateName));
                                }
                            });
                        }

                        // Fix setter if exists
                        if (setterElement && setterElement.type === "Identifier") {
                            const setterName = setterElement.name;
                            const setterVar = findVariableHandler(scope, setterName);
                            const setterFixedRanges = new Set();

                            // Fix definition first
                            const setterDefRangeKey = `${setterElement.range[0]}-${setterElement.range[1]}`;

                            setterFixedRanges.add(setterDefRangeKey);
                            fixes.push(fixer.replaceText(setterElement, suggestedSetterName));

                            // Fix all usages
                            if (setterVar) {
                                setterVar.references.forEach((ref) => {
                                    const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                    if (!setterFixedRanges.has(rangeKey)) {
                                        setterFixedRanges.add(rangeKey);
                                        fixes.push(fixer.replaceText(ref.identifier, suggestedSetterName));
                                    }
                                });
                            }
                        }

                        return fixes;
                    },
                    message: `Boolean state "${stateName}" should start with a valid prefix (${booleanPrefixes.join(", ")}). Use "${suggestedStateName}" instead.`,
                    node: stateElement,
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce boolean useState variables to start with is/has/with/without prefix" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    allowContinuousVerbBoolean: {
                        default: false,
                        description: "Allow continuous verb boolean state without prefix (e.g., loading, saving)",
                        type: "boolean",
                    },
                    allowPastVerbBoolean: {
                        default: false,
                        description: "Allow past verb boolean state without prefix (e.g., disabled, selected)",
                        type: "boolean",
                    },
                    booleanPrefixes: {
                        description: "Replace default boolean prefixes entirely",
                        items: { type: "string" },
                        type: "array",
                    },
                    extendBooleanPrefixes: {
                        default: [],
                        description: "Add additional prefixes to the defaults (is, has, with, without)",
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: If Statement Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   If statements should have consistent formatting with the
 *   opening brace on the same line as the condition and else
 *   on the same line as the closing brace.
 *
 *
 * ✓ Good:
 *   if (condition) {
 *       doSomething();
 * 
 *       doMore();
 *   } else {
 *       doOther();
 * 
 *       doAnother();
 *   }
 *
 * ✗ Bad:
 *   if (condition)
 *   {
 *       doSomething();
 *       doMore();
 *   }
 *   else
 *   {
 *       doOther();
 *       doAnother();
 *   }
 */
const ifStatementFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Conditions that should be on single line
        const isSimpleConditionHandler = (testNode, testText) => {
            const simpleTypes = [
                "Identifier",
                "MemberExpression",
                "UnaryExpression",
                "Literal",
            ];

            if (simpleTypes.includes(testNode.type)) return true;

            // Simple call expression like fn() or obj.method()
            if (testNode.type === "CallExpression" && testNode.arguments.length === 0) {
                return true;
            }

            // LogicalExpression - collapse if it's short enough to fit on one line
            // BUT skip if it has intentional multiline formatting (operator at start of line)
            if (testNode.type === "LogicalExpression") {
                // Check for intentional multiline format (operator at start of line after newline)
                // This pattern indicates multiline-if-conditions has intentionally formatted it
                if (/\n\s*(\|\||&&)/.test(testText)) {
                    return false; // Intentionally multilined, don't collapse
                }

                // "Short enough" means under 80 characters for the condition itself
                const conditionLength = testText.replace(/\s+/g, " ").trim().length;

                return conditionLength <= 80;
            }

            return false;
        };

        const checkIfStatement = (node) => {
            const { consequent, test } = node;

            // Skip braceless if statements - they don't have a block body
            const hasBlockBody = consequent.type === "BlockStatement";

            const ifToken = sourceCode.getFirstToken(node);

            const openParen = sourceCode.getTokenAfter(
                ifToken,
                (t) => t.value === "(",
            );

            const closeParen = sourceCode.getTokenAfter(
                test,
                (t) => t.value === ")",
            );

            if (!openParen || !closeParen) {
                return;
            }

            // Only look for opening brace if the if statement has a block body
            const openBrace = hasBlockBody
                ? sourceCode.getFirstToken(consequent)
                : null;

            // Check if "if" and "(" are on different lines
            if (ifToken.loc.end.line !== openParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [ifToken.range[1], openParen.range[0]],
                        " ",
                    ),
                    message: "Opening parenthesis should be on the same line as 'if'",
                    node: openParen,
                });

                return;
            }

            // Check for conditions that span multiple lines - collapse to single line if short enough
            const conditionSpansMultipleLines = openParen.loc.end.line !== closeParen.loc.start.line;
            const testText = sourceCode.getText(test);

            if (conditionSpansMultipleLines && isSimpleConditionHandler(test, testText)) {
                // Normalize whitespace in condition text
                const normalizedText = testText.replace(/\s+/g, " ").trim();

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], closeParen.range[0]],
                        normalizedText,
                    ),
                    message: "If condition should be on a single line",
                    node: test,
                });

                return;
            }

            // Check if ")" and "{" are on different lines (only for block body if statements)
            if (openBrace && closeParen.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeParen.range[1], openBrace.range[0]],
                        " ",
                    ),
                    message: "Opening brace should be on the same line as closing parenthesis",
                    node: openBrace,
                });
            }
        };

        return { IfStatement: checkIfStatement };
    },
    meta: {
        docs: { description: "Ensure if statement has proper formatting: if (...) {" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: If-Else Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces proper spacing between if statements and if-else chains:
 *   1. Consecutive if statements with block bodies must have an empty line between them
 *   2. Single-line if and else should NOT have empty lines between them
 *
 * ✓ Good:
 *   if (!hasValidParams) return null;
 *
 *   if (status === "loading") {
 *       return <Loading />;
 *   }
 *
 *   if (status === "error") {
 *       return <Error />;
 *   }
 *
 *   if (error) prom.reject(error);
 *   else prom.resolve(token);
 *
 * ✗ Bad:
 *   if (!hasValidParams) return null;
 *   if (status === "loading") {
 *       return <Loading />;
 *   }
 *   if (status === "error") {
 *       return <Error />;
 *   }
 *
 *   if (error) prom.reject(error);
 *
 *   else prom.resolve(token);
 */
const ifElseSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if an if statement is single-line (no block body or block on same line)
        const isSingleLineIfHandler = (node) => {
            if (node.type !== "IfStatement") return false;

            const { consequent } = node;

            // If consequent is not a block, it's single-line
            if (consequent.type !== "BlockStatement") return true;

            // If it's a block, check if the entire block is on one line
            return consequent.loc.start.line === consequent.loc.end.line;
        };

        // Check single-line if-else should not have empty lines between if and else
        const checkSingleLineIfElseHandler = (node) => {
            const { alternate } = node;

            if (!alternate) return;

            // Only check single-line if statements
            if (!isSingleLineIfHandler(node)) return;

            // Find the closing of the consequent
            const { consequent } = node;

            const closingToken = consequent.type === "BlockStatement"
                ? sourceCode.getLastToken(consequent)
                : sourceCode.getLastToken(consequent);

            // Find the else keyword
            const elseKeyword = sourceCode.getTokenAfter(
                closingToken,
                (t) => t.value === "else",
            );

            if (!elseKeyword) return;

            // Check if there's an empty line between the consequent and else
            const linesBetween = elseKeyword.loc.start.line - closingToken.loc.end.line;

            if (linesBetween > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closingToken.range[1], elseKeyword.range[0]],
                        "\n" + " ".repeat(elseKeyword.loc.start.column),
                    ),
                    message: "No empty line allowed between single-line if and else",
                    node: elseKeyword,
                });
            }
        };

        // Check consecutive if statements in a block
        const checkConsecutiveIfsHandler = (node) => {
            const { body } = node;

            if (!body || !Array.isArray(body)) return;

            for (let i = 0; i < body.length - 1; i += 1) {
                const current = body[i];
                const next = body[i + 1];

                // Only check if current is an if statement
                if (current.type !== "IfStatement") continue;

                // Only check if next is an if statement
                if (next.type !== "IfStatement") continue;

                // Get the actual end of current (could be alternate/else-if chain)
                let currentEnd = current;

                while (currentEnd.alternate && currentEnd.alternate.type === "IfStatement") {
                    currentEnd = currentEnd.alternate;
                }

                // If current ends with an else block (not else-if), use the alternate
                const endNode = currentEnd.alternate || currentEnd.consequent;

                // Check if either the current if (or its last branch) has a block body
                const currentHasBlock = endNode.type === "BlockStatement";

                // Check if the next if has a block body
                const nextHasBlock = next.consequent.type === "BlockStatement";

                // Require empty line if either has a block body
                if (currentHasBlock || nextHasBlock) {
                    const linesBetween = next.loc.start.line - endNode.loc.end.line;

                    if (linesBetween === 1) {
                        // No empty line between them - needs one
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(
                                endNode,
                                "\n",
                            ),
                            message: "Expected empty line between consecutive if statements with block bodies",
                            node: next,
                        });
                    }
                }
            }
        };

        return {
            BlockStatement: checkConsecutiveIfsHandler,
            IfStatement: checkSingleLineIfElseHandler,
            Program: checkConsecutiveIfsHandler,
        };
    },
    meta: {
        docs: { description: "Enforce proper spacing between if statements and if-else chains" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Multiline If Conditions
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When an if statement has multiple conditions that span
 *   multiple lines, each condition should be on its own line.
 *   Nested groups with >maxOperands are formatted multiline inline.
 *   Groups exceeding nesting level 2 are extracted to variables.
 *
 * Options:
 *   { maxOperands: 3 } - Maximum operands on single line (default: 3)
 *
 * ✓ Good (nested group with >3 operands - multiline inline):
 *   if ((
 *       a
 *       || b
 *       || c
 *       || d
 *   ) && e) {}
 *
 * ✓ Good (≤2 nesting level):
 *   if ((a && b) || c) {}                    // Level 1
 *   if ((a && (b || c)) || d) {}             // Level 2
 *
 * ✗ Bad (>2 nesting level - auto-fixed by extraction):
 *   if ((a && (b || (c && d))) || e) {}
 *   // Fixed to:
 *   // const isCAndD = (c && d);
 *   // if ((a && (b || isCAndD)) || e) {}
 */
const multilineIfConditions = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxOperands = options.maxOperands !== undefined ? options.maxOperands : 3;
        const maxNestingLevel = 2; // Fixed at 2 - not configurable to avoid overly complex conditions

        const isParenthesizedHandler = (node) => {
            const tokenBefore = sourceCode.getTokenBefore(node);
            const tokenAfter = sourceCode.getTokenAfter(node);

            if (!tokenBefore || !tokenAfter) return false;

            if (tokenBefore.value === "(" && tokenAfter.value === ")") {
                // Check if this is the if statement's own parens
                if (node.parent.type === "IfStatement" && node.parent.test === node) {
                    const beforeLeft = sourceCode.getTokenBefore(tokenBefore);

                    if (beforeLeft && beforeLeft.value === "if") return false;
                }

                return true;
            }

            return false;
        };

        const getSourceTextWithGroupsHandler = (node) => {
            let start = node.range[0];
            let end = node.range[1];
            let left = sourceCode.getTokenBefore(node);
            let right = sourceCode.getTokenAfter(node);

            while (left && left.value === "(" && right && right.value === ")") {
                if (node.parent.type === "IfStatement" && node.parent.test === node) {
                    const beforeLeft = sourceCode.getTokenBefore(left);

                    if (beforeLeft && beforeLeft.value === "if") break;
                }

                start = left.range[0];
                end = right.range[1];
                left = sourceCode.getTokenBefore(left);
                right = sourceCode.getTokenAfter(right);
            }

            return sourceCode.text.slice(start, end);
        };

        const collectOperandsHandler = (node) => {
            const operands = [];

            const collectHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    collectHelperHandler(n.left);
                    collectHelperHandler(n.right);
                } else {
                    operands.push(n);
                }
            };

            collectHelperHandler(node);

            return operands;
        };

        // Calculate max nesting depth of parenthesized groups in a logical expression
        // Level 0: a && b (no groups)
        // Level 1: (a && b) || c (one group at top)
        // Level 2: (a && (b || c)) || d (group inside group)
        const getNestingDepthHandler = (node, currentDepth = 0) => {
            if (node.type !== "LogicalExpression") return currentDepth;

            let maxDepth = currentDepth;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftDepth = isParenthesizedHandler(node.left)
                    ? getNestingDepthHandler(node.left, currentDepth + 1)
                    : getNestingDepthHandler(node.left, currentDepth);
                maxDepth = Math.max(maxDepth, leftDepth);
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightDepth = isParenthesizedHandler(node.right)
                    ? getNestingDepthHandler(node.right, currentDepth + 1)
                    : getNestingDepthHandler(node.right, currentDepth);
                maxDepth = Math.max(maxDepth, rightDepth);
            }

            return maxDepth;
        };

        // Find the deepest nested parenthesized group that exceeds maxNestingLevel
        const findDeepNestedGroupHandler = (node, currentDepth = 0, parentInfo = null) => {
            if (node.type !== "LogicalExpression") return null;

            let deepestGroup = null;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftIsParen = isParenthesizedHandler(node.left);
                const newDepth = leftIsParen ? currentDepth + 1 : currentDepth;

                if (leftIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    deepestGroup = {
                        node: node.left,
                        depth: newDepth,
                        parent: node,
                        side: "left",
                    };
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.left, newDepth, { node, side: "left" });
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightIsParen = isParenthesizedHandler(node.right);
                const newDepth = rightIsParen ? currentDepth + 1 : currentDepth;

                if (rightIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    const rightGroup = {
                        node: node.right,
                        depth: newDepth,
                        parent: node,
                        side: "right",
                    };
                    if (!deepestGroup || rightGroup.depth > deepestGroup.depth) {
                        deepestGroup = rightGroup;
                    }
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.right, newDepth, { node, side: "right" });
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            return deepestGroup;
        };

        // Count operands inside a group, ignoring the outer parentheses of the group itself
        // This is used to count operands INSIDE a parenthesized group
        const countOperandsInsideGroupHandler = (node) => {
            if (node.type !== "LogicalExpression") return 1;

            let count = 0;
            const countHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    countHelperHandler(n.left);
                    countHelperHandler(n.right);
                } else {
                    count += 1;
                }
            };

            // Start by recursing into children directly (ignoring outer parens)
            countHelperHandler(node.left);
            countHelperHandler(node.right);

            return count;
        };

        // Find a nested parenthesized group that has >maxOperands operands
        // Returns the first such group found (for extraction to variable)
        const findNestedGroupExceedingMaxOperandsHandler = (node) => {
            if (node.type !== "LogicalExpression") return null;

            // Check if this node is a parenthesized group with >maxOperands
            if (isParenthesizedHandler(node)) {
                const insideCount = countOperandsInsideGroupHandler(node);
                if (insideCount > maxOperands) {
                    return node;
                }
            }

            // Recursively check children
            if (node.left.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.left);
                if (found) return found;
            }
            if (node.right.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.right);
                if (found) return found;
            }

            return null;
        };

        const checkIfStatementHandler = (node) => {
            const { test } = node;

            if (test.type !== "LogicalExpression") return;

            const operands = collectOperandsHandler(test);
            const openParen = sourceCode.getTokenBefore(test);
            const closeParen = sourceCode.getTokenAfter(test);

            if (!openParen || !closeParen) return;

            // Check for excessive nesting depth
            const nestingDepth = getNestingDepthHandler(test);

            if (nestingDepth > maxNestingLevel) {
                const deepGroup = findDeepNestedGroupHandler(test);

                if (deepGroup) {
                    const groupText = getSourceTextWithGroupsHandler(deepGroup.node);

                    // Generate a more descriptive variable name based on condition structure
                    const getConditionNameHandler = (n) => {
                        if (n.type === "LogicalExpression") {
                            const leftName = getConditionNameHandler(n.left);
                            const rightName = getConditionNameHandler(n.right);
                            const opName = n.operator === "&&" ? "And" : "Or";

                            return `${leftName}${opName}${rightName}`;
                        }
                        if (n.type === "Identifier") {
                            return n.name.charAt(0).toUpperCase() + n.name.slice(1);
                        }
                        if (n.type === "BinaryExpression" || n.type === "CallExpression" || n.type === "MemberExpression") {
                            return "Expr";
                        }

                        return "Cond";
                    };

                    // Generate unique variable name
                    let varName = `is${getConditionNameHandler(deepGroup.node)}`;
                    // Limit length and sanitize
                    if (varName.length > 30) {
                        varName = "isNestedCondition";
                    }

                    context.report({
                        fix: (fixer) => {
                            const fixes = [];

                            // Get the line before the if statement for inserting the variable
                            const ifLine = node.loc.start.line;
                            const lineStart = sourceCode.getIndexFromLoc({ line: ifLine, column: 0 });
                            const lineText = sourceCode.lines[ifLine - 1];
                            const indent = lineText.match(/^\s*/)[0];

                            // Insert variable declaration before the if statement
                            fixes.push(fixer.insertTextBeforeRange(
                                [lineStart, lineStart],
                                `const ${varName} = ${groupText};\n${indent}`,
                            ));

                            // Replace the nested group with the variable name in the condition
                            // We need to replace including the parentheses around the group
                            const tokenBefore = sourceCode.getTokenBefore(deepGroup.node);
                            const tokenAfter = sourceCode.getTokenAfter(deepGroup.node);

                            if (tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")") {
                                fixes.push(fixer.replaceTextRange(
                                    [tokenBefore.range[0], tokenAfter.range[1]],
                                    varName,
                                ));
                            } else {
                                fixes.push(fixer.replaceText(deepGroup.node, varName));
                            }

                            return fixes;
                        },
                        message: `Condition nesting depth (${nestingDepth}) exceeds maximum (${maxNestingLevel}). Extract deeply nested condition to a variable.`,
                        node: deepGroup.node,
                    });

                    return; // Don't process other rules for this statement
                }
            }

            const isMultiLine = openParen.loc.start.line !== closeParen.loc.end.line;

            // Check if a BinaryExpression is split across lines (left/operator/right not on same line)
            const isBinaryExpressionSplitHandler = (n) => {
                if (n.type !== "BinaryExpression") return false;

                const { left, right } = n;

                // Check if left ends on different line than right starts
                if (left.loc.end.line !== right.loc.start.line) return true;

                // Recursively check nested binary expressions
                if (isBinaryExpressionSplitHandler(left)) return true;
                if (isBinaryExpressionSplitHandler(right)) return true;

                return false;
            };

            // Collapse a BinaryExpression to single line
            const buildBinaryExpressionSingleLineHandler = (n) => {
                if (n.type === "BinaryExpression") {
                    const leftText = buildBinaryExpressionSingleLineHandler(n.left);
                    const rightText = buildBinaryExpressionSingleLineHandler(n.right);

                    return `${leftText} ${n.operator} ${rightText}`;
                }

                return sourceCode.getText(n);
            };

            // Check if any nested parenthesized group has >maxOperands - format multiline inline
            const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(test);
            if (nestedGroupExceeding) {
                // Get indentation for formatting
                const lineText = sourceCode.lines[node.loc.start.line - 1];
                const parenIndent = lineText.match(/^\s*/)[0];
                const contentIndent = parenIndent + "    ";

                // Build multiline text for operands inside a nested group
                // isOuterGroup=true means we're at the target group itself (ignore its own parentheses)
                // Also recursively expands any inner nested groups with >maxOperands
                const buildNestedMultilineHandler = (n, isOuterGroup = false, currentIndent = contentIndent) => {
                    if (n.type === "LogicalExpression" && (isOuterGroup || !isParenthesizedHandler(n))) {
                        const leftText = buildNestedMultilineHandler(n.left, false, currentIndent);
                        const rightText = buildNestedMultilineHandler(n.right, false, currentIndent);

                        return `${leftText}\n${currentIndent}${n.operator} ${rightText}`;
                    }

                    // Check if this is a parenthesized group with >maxOperands - also expand it
                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        const innerCount = countOperandsInsideGroupHandler(n);
                        if (innerCount > maxOperands) {
                            const innerIndent = currentIndent + "    ";
                            const buildInner = (inner) => {
                                if (inner.type === "LogicalExpression" && !isParenthesizedHandler(inner)) {
                                    const l = buildInner(inner.left);
                                    const r = buildInner(inner.right);

                                    return `${l}\n${innerIndent}${inner.operator} ${r}`;
                                }

                                return getSourceTextWithGroupsHandler(inner);
                            };

                            const innerLeft = buildInner(n.left);
                            const innerRight = buildInner(n.right);

                            return `(\n${innerIndent}${innerLeft}\n${innerIndent}${n.operator} ${innerRight}\n${currentIndent})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Build the full condition with nested group formatted multiline
                const buildFullConditionHandler = (n, targetNode) => {
                    if (n === targetNode) {
                        // This is the nested group - format it multiline
                        // Pass true to ignore outer parentheses check
                        const nestedText = buildNestedMultilineHandler(n, true);

                        return `(\n${contentIndent}${nestedText}\n${parenIndent})`;
                    }

                    if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                        const leftText = buildFullConditionHandler(n.left, targetNode);
                        const rightText = buildFullConditionHandler(n.right, targetNode);

                        return `${leftText} ${n.operator} ${rightText}`;
                    }

                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        // Check if this contains the target
                        const containsTargetHandler = (node, target) => {
                            if (node === target) return true;
                            if (node.type === "LogicalExpression") {
                                return containsTargetHandler(node.left, target) || containsTargetHandler(node.right, target);
                            }

                            return false;
                        };

                        if (containsTargetHandler(n, targetNode)) {
                            const innerText = buildFullConditionHandler(n, targetNode);

                            return `(${innerText})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Check if already correctly formatted
                // Collect operands INSIDE the nested group (not treating the group itself as 1 operand)
                const collectInsideGroupHandler = (node) => {
                    const operands = [];
                    const collectHelper = (n) => {
                        if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                            collectHelper(n.left);
                            collectHelper(n.right);
                        } else {
                            operands.push(n);
                        }
                    };

                    // Start from children directly, ignoring outer parentheses
                    if (node.type === "LogicalExpression") {
                        collectHelper(node.left);
                        collectHelper(node.right);
                    }

                    return operands;
                };

                const nestedOperands = collectInsideGroupHandler(nestedGroupExceeding);
                const allOnDifferentLines = nestedOperands.every((op, i) => {
                    if (i === 0) return true;

                    return op.loc.start.line !== nestedOperands[i - 1].loc.start.line;
                });

                if (!allOnDifferentLines) {
                    context.report({
                        fix: (fixer) => {
                            const newCondition = buildFullConditionHandler(test, nestedGroupExceeding);

                            // Replace just the content between if statement's parens
                            return fixer.replaceTextRange(
                                [openParen.range[1], closeParen.range[0]],
                                newCondition,
                            );
                        },
                        message: `Nested condition with >${maxOperands} operands should be formatted multiline`,
                        node: nestedGroupExceeding,
                    });

                    return;
                }
            }

            // maxOperands or fewer operands: keep on single line
            // BUT skip if any nested group has >maxOperands (already expanded or needs expansion)
            if (operands.length <= maxOperands) {
                // Check if any nested parenthesized group has >maxOperands (should stay multiline)
                const hasExpandedNestedGroup = findNestedGroupExceedingMaxOperandsHandler(test);
                if (hasExpandedNestedGroup) {
                    return; // Don't collapse - nested group needs multiline
                }

                // Check if all operands START on the same line
                const firstOperandStartLine = operands[0].loc.start.line;
                const allOperandsStartOnSameLine = operands.every(
                    (op) => op.loc.start.line === firstOperandStartLine,
                );

                // Check if any BinaryExpression operand is split across lines
                const hasSplitBinaryExpression = operands.some(
                    (op) => isBinaryExpressionSplitHandler(op),
                );

                if (!allOperandsStartOnSameLine || hasSplitBinaryExpression) {
                    context.report({
                        fix: (fixer) => {
                            const buildSameLineHandler = (n) => {
                                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                    const leftText = buildSameLineHandler(n.left);
                                    const rightText = buildSameLineHandler(n.right);

                                    return `${leftText} ${n.operator} ${rightText}`;
                                }

                                // Handle split BinaryExpressions
                                if (n.type === "BinaryExpression" && isBinaryExpressionSplitHandler(n)) {
                                    return buildBinaryExpressionSingleLineHandler(n);
                                }

                                return getSourceTextWithGroupsHandler(n);
                            };

                            return fixer.replaceTextRange(
                                [openParen.range[0], closeParen.range[1]],
                                `(${buildSameLineHandler(test)})`,
                            );
                        },
                        message: `If conditions with ≤${maxOperands} operands should be single line: if (a && b && c). Multi-line only for >${maxOperands} operands`,
                        node: test,
                    });
                }

                return;
            }

            // Helper to check if any operator is at end of line (wrong position)
            const hasOperatorAtEndOfLineHandler = (n) => {
                if (n.type !== "LogicalExpression") return false;

                const operatorToken = sourceCode.getTokenAfter(
                    n.left,
                    (t) => t.value === "||" || t.value === "&&",
                );

                if (operatorToken) {
                    // Check if there's a newline after the operator
                    const tokenAfterOperator = sourceCode.getTokenAfter(operatorToken);

                    if (tokenAfterOperator && operatorToken.loc.end.line < tokenAfterOperator.loc.start.line) {
                        // Operator is at end of line - this is wrong
                        return true;
                    }
                }

                // Recursively check nested logical expressions
                if (hasOperatorAtEndOfLineHandler(n.left)) return true;
                if (hasOperatorAtEndOfLineHandler(n.right)) return true;

                return false;
            };

            // More than maxOperands: each on its own line
            let isCorrectionNeeded = !isMultiLine;

            if (isMultiLine) {
                for (let i = 0; i < operands.length - 1; i += 1) {
                    if (operands[i].loc.end.line === operands[i + 1].loc.start.line) {
                        isCorrectionNeeded = true;
                        break;
                    }
                }

                if (openParen.loc.end.line === operands[0].loc.start.line) {
                    isCorrectionNeeded = true;
                }

                // Check if any operator is at end of line (should be at beginning)
                if (!isCorrectionNeeded && hasOperatorAtEndOfLineHandler(test)) {
                    isCorrectionNeeded = true;
                }
            }

            if (isCorrectionNeeded) {
                context.report({
                    fix: (fixer) => {
                        // Get the indentation of the if statement line
                        const lineText = sourceCode.lines[node.loc.start.line - 1];
                        const parenIndent = lineText.match(/^\s*/)[0];
                        const indent = parenIndent + "    ";
                        const nestedIndent = indent + "    ";

                        // Build multiline, also expanding nested groups with >maxOperands
                        const buildMultilineHandler = (n, currentIndent) => {
                            if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                const leftText = buildMultilineHandler(n.left, currentIndent);
                                const rightText = buildMultilineHandler(n.right, currentIndent);

                                return `${leftText}\n${currentIndent}${n.operator} ${rightText}`;
                            }

                            // Check if this is a parenthesized group with >maxOperands - expand it too
                            if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                                const innerCount = countOperandsInsideGroupHandler(n);
                                if (innerCount > maxOperands) {
                                    // Expand this nested group
                                    const innerIndent = currentIndent + "    ";
                                    const buildInnerHandler = (inner) => {
                                        if (inner.type === "LogicalExpression" && !isParenthesizedHandler(inner)) {
                                            const l = buildInnerHandler(inner.left);
                                            const r = buildInnerHandler(inner.right);

                                            return `${l}\n${innerIndent}${inner.operator} ${r}`;
                                        }

                                        return getSourceTextWithGroupsHandler(inner);
                                    };

                                    const innerLeft = buildInnerHandler(n.left);
                                    const innerRight = buildInnerHandler(n.right);

                                    return `(\n${innerIndent}${innerLeft}\n${innerIndent}${n.operator} ${innerRight}\n${currentIndent})`;
                                }
                            }

                            return getSourceTextWithGroupsHandler(n);
                        };

                        return fixer.replaceTextRange(
                            [openParen.range[0], closeParen.range[1]],
                            `(\n${indent}${buildMultilineHandler(test, indent)}\n${parenIndent})`,
                        );
                    },
                    message: `If conditions with more than ${maxOperands} operands should be multiline, with each operand on its own line`,
                    node: test,
                });
            }
        };

        const checkPropertyHandler = (node) => {
            const { value } = node;

            // Only handle Property nodes where value is a LogicalExpression
            if (!value || value.type !== "LogicalExpression") return;

            const operands = collectOperandsHandler(value);

            // Need at least 2 operands to apply formatting
            if (operands.length < 2) return;

            const valueStartLine = value.loc.start.line;
            const valueEndLine = value.loc.end.line;
            const isMultiLine = valueStartLine !== valueEndLine;

            // Check if a BinaryExpression is split across lines (left/operator/right not on same line)
            const isBinaryExpressionSplitHandler = (n) => {
                if (n.type !== "BinaryExpression") return false;

                const { left, right } = n;

                // Check if left ends on different line than right starts
                if (left.loc.end.line !== right.loc.start.line) return true;

                // Recursively check nested binary expressions
                if (isBinaryExpressionSplitHandler(left)) return true;
                if (isBinaryExpressionSplitHandler(right)) return true;

                return false;
            };

            // Collapse a BinaryExpression to single line
            const buildBinaryExpressionSingleLineHandler = (n) => {
                if (n.type === "BinaryExpression") {
                    const leftText = buildBinaryExpressionSingleLineHandler(n.left);
                    const rightText = buildBinaryExpressionSingleLineHandler(n.right);

                    return `${leftText} ${n.operator} ${rightText}`;
                }

                return sourceCode.getText(n);
            };

            // Check if any nested parenthesized group has >maxOperands
            // For properties, if nested group exceeds, skip single-line formatting (let multiline handle it)
            const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(value);

            // maxOperands or fewer operands AND no nested group exceeds maxOperands: keep on single line
            if (operands.length <= maxOperands && !nestedGroupExceeding) {
                // Check if all operands START on the same line
                const firstOperandStartLine = operands[0].loc.start.line;
                const allOperandsStartOnSameLine = operands.every(
                    (op) => op.loc.start.line === firstOperandStartLine,
                );

                // Check if any BinaryExpression operand is split across lines
                const hasSplitBinaryExpression = operands.some(
                    (op) => isBinaryExpressionSplitHandler(op),
                );

                if (!allOperandsStartOnSameLine || hasSplitBinaryExpression) {
                    context.report({
                        fix: (fixer) => {
                            const buildSameLineHandler = (n) => {
                                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                    const leftText = buildSameLineHandler(n.left);
                                    const rightText = buildSameLineHandler(n.right);

                                    return `${leftText} ${n.operator} ${rightText}`;
                                }

                                // Handle split BinaryExpressions
                                if (n.type === "BinaryExpression" && isBinaryExpressionSplitHandler(n)) {
                                    return buildBinaryExpressionSingleLineHandler(n);
                                }

                                return getSourceTextWithGroupsHandler(n);
                            };

                            return fixer.replaceText(value, buildSameLineHandler(value));
                        },
                        message: `Property conditions with ≤${maxOperands} operands should be single line: condition: a && b && c. Multi-line only for >${maxOperands} operands`,
                        node: value,
                    });
                }

                return;
            }

            // More than maxOperands: each on its own line
            let isCorrectionNeeded = !isMultiLine;

            if (isMultiLine) {
                for (let i = 0; i < operands.length - 1; i += 1) {
                    if (operands[i].loc.end.line === operands[i + 1].loc.start.line) {
                        isCorrectionNeeded = true;
                        break;
                    }
                }
            }

            if (isCorrectionNeeded) {
                context.report({
                    fix: (fixer) => {
                        // Get the indentation of the property
                        const propertyLine = sourceCode.lines[node.loc.start.line - 1];
                        const propertyIndent = propertyLine.match(/^\s*/)[0];
                        const indent = propertyIndent + "    ";

                        const buildMultilineHandler = (n) => {
                            if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                const leftText = buildMultilineHandler(n.left);
                                const rightText = buildMultilineHandler(n.right);

                                return `${leftText}\n${indent}${n.operator} ${rightText}`;
                            }

                            return getSourceTextWithGroupsHandler(n);
                        };

                        return fixer.replaceText(value, buildMultilineHandler(value));
                    },
                    message: `Property conditions with more than ${maxOperands} operands should be multiline, with each operand on its own line`,
                    node: value,
                });
            }
        };

        return {
            IfStatement: checkIfStatementHandler,
            Property: checkPropertyHandler,
        };
    },
    meta: {
        docs: { description: "Enforce multiline if/property conditions when exceeding threshold (default: >3 operands)" },
        fixable: "whitespace",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxOperands: {
                        default: 3,
                        description: "Maximum operands to keep on single line (default: 3). Also applies to nested groups.",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Ternary Condition Multiline
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Formats ternary expressions based on condition operand count:
 *   - ≤maxOperands (default: 3): Always collapse to single line
 *   - >maxOperands: Format multiline with each operand on its own line
 *   - Simple parenthesized nested ternaries (≤maxOperands) count as 1 operand
 *   - Complex nested ternaries (>maxOperands) are skipped (format manually)
 *   - Nested groups with >maxOperands are formatted multiline inline
 *   - Groups exceeding nesting level 2 are extracted to variables
 *
 * Options:
 *   { maxOperands: 3 } - Maximum operands to keep on single line (default: 3)
 *
 * ✓ Good (≤3 operands - single line):
 *   const x = a && b && c ? "yes" : "no";
 *   const url = lang === "ar" ? "/ar/path" : "/en/path";
 *   const inputType = showToggle ? (showPwd ? "text" : "password") : type;
 *
 * ✓ Good (>3 operands - multiline):
 *   const x = variant === "ghost"
 *       || variant === "ghost-danger"
 *       || variant === "muted"
 *       || variant === "primary"
 *       ? "value1"
 *       : "value2";
 *
 * ✗ Bad (≤3 operands split across lines):
 *   const x = a && b && c
 *       ? "yes"
 *       : "no";
 *
 * ✗ Bad (>3 operands on single line):
 *   const x = variant === "ghost" || variant === "ghost-danger" || variant === "muted" || variant === "primary" ? "value1" : "value2";
 */
const ternaryConditionMultiline = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxOperands = options.maxOperands ?? 3;
        const maxNestingLevel = 2; // Fixed at 2 - not configurable to avoid overly complex conditions

        // Check if node is wrapped in parentheses
        const isParenthesizedHandler = (node) => {
            const tokenBefore = sourceCode.getTokenBefore(node);
            const tokenAfter = sourceCode.getTokenAfter(node);

            if (!tokenBefore || !tokenAfter) return false;

            return tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        // Get source text including any surrounding parentheses
        const getSourceTextWithGroupsHandler = (node) => {
            let start = node.range[0];
            let end = node.range[1];
            let left = sourceCode.getTokenBefore(node);
            let right = sourceCode.getTokenAfter(node);

            while (left && left.value === "(" && right && right.value === ")") {
                start = left.range[0];
                end = right.range[1];
                left = sourceCode.getTokenBefore(left);
                right = sourceCode.getTokenAfter(right);
            }

            return sourceCode.text.slice(start, end);
        };

        // Collect all operands from a logical expression
        const collectOperandsHandler = (node) => {
            const operands = [];

            const collectHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    collectHelperHandler(n.left);
                    collectHelperHandler(n.right);
                } else {
                    operands.push(n);
                }
            };

            collectHelperHandler(node);

            return operands;
        };

        // Calculate max nesting depth of parenthesized groups in a logical expression
        // Level 0: a && b (no groups)
        // Level 1: (a && b) || c (one group at top)
        // Level 2: (a && (b || c)) || d (group inside group)
        const getNestingDepthHandler = (node, currentDepth = 0) => {
            if (node.type !== "LogicalExpression") return currentDepth;

            let maxDepth = currentDepth;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftDepth = isParenthesizedHandler(node.left)
                    ? getNestingDepthHandler(node.left, currentDepth + 1)
                    : getNestingDepthHandler(node.left, currentDepth);
                maxDepth = Math.max(maxDepth, leftDepth);
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightDepth = isParenthesizedHandler(node.right)
                    ? getNestingDepthHandler(node.right, currentDepth + 1)
                    : getNestingDepthHandler(node.right, currentDepth);
                maxDepth = Math.max(maxDepth, rightDepth);
            }

            return maxDepth;
        };

        // Find the deepest nested parenthesized group that exceeds maxNestingLevel
        const findDeepNestedGroupHandler = (node, currentDepth = 0) => {
            if (node.type !== "LogicalExpression") return null;

            let deepestGroup = null;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftIsParen = isParenthesizedHandler(node.left);
                const newDepth = leftIsParen ? currentDepth + 1 : currentDepth;

                if (leftIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    deepestGroup = {
                        node: node.left,
                        depth: newDepth,
                        parent: node,
                        side: "left",
                    };
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.left, newDepth);
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightIsParen = isParenthesizedHandler(node.right);
                const newDepth = rightIsParen ? currentDepth + 1 : currentDepth;

                if (rightIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    const rightGroup = {
                        node: node.right,
                        depth: newDepth,
                        parent: node,
                        side: "right",
                    };
                    if (!deepestGroup || rightGroup.depth > deepestGroup.depth) {
                        deepestGroup = rightGroup;
                    }
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.right, newDepth);
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            return deepestGroup;
        };

        // Generate descriptive variable name based on condition structure
        const getConditionNameHandler = (n) => {
            if (n.type === "LogicalExpression") {
                const leftName = getConditionNameHandler(n.left);
                const rightName = getConditionNameHandler(n.right);
                const opName = n.operator === "&&" ? "And" : "Or";

                return `${leftName}${opName}${rightName}`;
            }
            if (n.type === "Identifier") {
                return n.name.charAt(0).toUpperCase() + n.name.slice(1);
            }
            if (n.type === "BinaryExpression" || n.type === "CallExpression" || n.type === "MemberExpression") {
                return "Expr";
            }

            return "Cond";
        };

        // Count operands inside a group, ignoring the outer parentheses of the group itself
        // This is used to count operands INSIDE a parenthesized group
        const countOperandsInsideGroupHandler = (node) => {
            if (node.type !== "LogicalExpression") return 1;

            let count = 0;
            const countHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    countHelperHandler(n.left);
                    countHelperHandler(n.right);
                } else {
                    count += 1;
                }
            };

            // Start by recursing into children directly (ignoring outer parens)
            countHelperHandler(node.left);
            countHelperHandler(node.right);

            return count;
        };

        // Find a nested parenthesized group that has >maxOperands operands
        // Returns the first such group found (for extraction to variable)
        const findNestedGroupExceedingMaxOperandsHandler = (node) => {
            if (node.type !== "LogicalExpression") return null;

            // Check if this node is a parenthesized group with >maxOperands
            if (isParenthesizedHandler(node)) {
                const insideCount = countOperandsInsideGroupHandler(node);
                if (insideCount > maxOperands) {
                    return node;
                }
            }

            // Recursively check children
            if (node.left.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.left);
                if (found) return found;
            }
            if (node.right.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.right);
                if (found) return found;
            }

            return null;
        };

        // Check if a BinaryExpression is split across lines
        const isBinaryExpressionSplitHandler = (n) => {
            if (n.type !== "BinaryExpression") return false;

            const { left, right } = n;

            if (left.loc.end.line !== right.loc.start.line) return true;
            if (isBinaryExpressionSplitHandler(left)) return true;
            if (isBinaryExpressionSplitHandler(right)) return true;

            return false;
        };

        // Collapse a BinaryExpression to single line
        const buildBinaryExpressionSingleLineHandler = (n) => {
            if (n.type === "BinaryExpression") {
                const leftText = buildBinaryExpressionSingleLineHandler(n.left);
                const rightText = buildBinaryExpressionSingleLineHandler(n.right);

                return `${leftText} ${n.operator} ${rightText}`;
            }

            return sourceCode.getText(n);
        };

        // Helper to check if any operator is at end of line (wrong position)
        const hasOperatorAtEndOfLineHandler = (n) => {
            if (n.type !== "LogicalExpression") return false;

            const operatorToken = sourceCode.getTokenAfter(
                n.left,
                (t) => t.value === "||" || t.value === "&&",
            );

            if (operatorToken) {
                const tokenAfterOperator = sourceCode.getTokenAfter(operatorToken);

                if (tokenAfterOperator && operatorToken.loc.end.line < tokenAfterOperator.loc.start.line) {
                    return true;
                }
            }

            if (hasOperatorAtEndOfLineHandler(n.left)) return true;
            if (hasOperatorAtEndOfLineHandler(n.right)) return true;

            return false;
        };

        // Check if the test is a simple condition (not a complex logical expression)
        const isSimpleConditionHandler = (test) => {
            if (test.type === "Identifier") return true;

            if (test.type === "MemberExpression") return true;

            if (test.type === "UnaryExpression") return true;

            if (test.type === "BinaryExpression") return true;

            if (test.type === "CallExpression") return true;

            // Logical expression with ≤maxOperands is still simple
            // BUT if any nested group has >maxOperands, it's not simple
            if (test.type === "LogicalExpression") {
                const operandCount = collectOperandsHandler(test).length;
                const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(test);
                return operandCount <= maxOperands && !nestedGroupExceeding;
            }

            return false;
        };

        // Get the full ternary as single line text (preserving parentheses around nested ternaries)
        const getTernarySingleLineHandler = (node) => {
            const testText = sourceCode.getText(node.test).replace(/\s+/g, " ").trim();
            // Use getSourceTextWithGroupsHandler to preserve parentheses around nested expressions
            const consequentText = getSourceTextWithGroupsHandler(node.consequent).replace(/\s+/g, " ").trim();
            const alternateText = getSourceTextWithGroupsHandler(node.alternate).replace(/\s+/g, " ").trim();

            return `${testText} ? ${consequentText} : ${alternateText}`;
        };

        // Get the indentation level for the line
        const getLineIndentHandler = (node) => {
            const lineText = sourceCode.lines[node.loc.start.line - 1];

            return lineText.match(/^\s*/)[0].length;
        };

        // Check if a node contains JSX elements (recursively)
        const containsJsxHandler = (n) => {
            if (!n) return false;

            if (n.type === "JSXElement" || n.type === "JSXFragment") return true;

            if (n.type === "ParenthesizedExpression") return containsJsxHandler(n.expression);

            if (n.type === "ConditionalExpression") {
                return containsJsxHandler(n.consequent) || containsJsxHandler(n.alternate);
            }

            if (n.type === "LogicalExpression") {
                return containsJsxHandler(n.left) || containsJsxHandler(n.right);
            }

            return false;
        };

        // Check if branches have complex objects (should stay multiline)
        const hasComplexObjectHandler = (n) => {
            if (n.type === "ObjectExpression" && n.properties.length >= 2) return true;

            if (n.type === "ArrayExpression" && n.elements.length >= 3) return true;

            return false;
        };

        // Check if branches contain JSX (should stay multiline)
        const hasJsxBranchesHandler = (node) => containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);

        // Check if a nested ternary has complex condition (>maxOperands)
        const hasComplexNestedTernaryHandler = (node) => {
            const checkBranch = (branch) => {
                if (branch.type === "ConditionalExpression" && isParenthesizedHandler(branch)) {
                    const nestedOperands = collectOperandsHandler(branch.test);

                    return nestedOperands.length > maxOperands;
                }

                return false;
            };

            return checkBranch(node.consequent) || checkBranch(node.alternate);
        };

        // Check if ? or : is on its own line without its value
        const isOperatorOnOwnLineHandler = (node) => {
            const questionToken = sourceCode.getTokenAfter(node.test, (t) => t.value === "?");
            const colonToken = sourceCode.getTokenAfter(node.consequent, (t) => t.value === ":");

            // Check if ? is on different line than consequent start
            if (questionToken && node.consequent.loc.start.line !== questionToken.loc.start.line) {
                return true;
            }

            // Check if : is on different line than alternate start
            if (colonToken && node.alternate.loc.start.line !== colonToken.loc.start.line) {
                return true;
            }

            return false;
        };

        // Handle simple ternaries (≤maxOperands) - collapse or format with complex nested
        const handleSimpleTernaryHandler = (node) => {
            const isOnSingleLine = node.loc.start.line === node.loc.end.line;
            const hasOperatorOnOwnLine = isOperatorOnOwnLineHandler(node);

            // Skip unparenthesized nested ternaries (parenthesized ones count as 1 operand)
            const hasUnparenthesizedNestedTernary = (node.consequent.type === "ConditionalExpression" && !isParenthesizedHandler(node.consequent))
                || (node.alternate.type === "ConditionalExpression" && !isParenthesizedHandler(node.alternate));

            if (hasUnparenthesizedNestedTernary) {
                return false;
            }

            // Skip if branches have complex objects
            if (hasComplexObjectHandler(node.consequent) || hasComplexObjectHandler(node.alternate)) {
                return false;
            }

            // Skip ternaries with JSX branches (should stay multiline for readability)
            if (hasJsxBranchesHandler(node)) {
                return false;
            }

            // Skip parenthesized nested ternaries with complex condition (>maxOperands)
            // These should be formatted manually or stay as-is
            if (hasComplexNestedTernaryHandler(node)) {
                return false;
            }

            // Skip if already on single line and no formatting issues
            if (isOnSingleLine && !hasOperatorOnOwnLine) return false;

            // Calculate what the single line would look like
            const singleLineText = getTernarySingleLineHandler(node);

            // For ≤maxOperands conditions, always collapse to single line regardless of length
            context.report({
                fix: (fixer) => fixer.replaceText(node, singleLineText),
                message: `Ternary with ≤${maxOperands} operands should be on a single line`,
                node,
            });

            return true;
        };

        // Handle complex logical expressions - format multiline
        const handleComplexLogicalTernaryHandler = (node) => {
            const { test } = node;
            const operands = collectOperandsHandler(test);
            const testStartLine = test.loc.start.line;
            const testEndLine = test.loc.end.line;
            const isMultiLine = testStartLine !== testEndLine;

            // Check if any nested parenthesized group has >maxOperands - format multiline inline
            const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(test);
            if (nestedGroupExceeding) {
                // Get indentation for formatting
                const parent = node.parent;
                let parenIndent = "";

                if (parent && parent.loc) {
                    const parentLineText = sourceCode.lines[parent.loc.start.line - 1];
                    parenIndent = parentLineText.match(/^\s*/)[0];
                }

                const contentIndent = parenIndent + "    ";

                // Build multiline text for operands inside a nested group
                // isOuterGroup=true means we're at the target group itself (ignore its own parentheses)
                // Also recursively expands any inner nested groups with >maxOperands
                const buildNestedMultilineHandler = (n, isOuterGroup = false, currentIndent = contentIndent) => {
                    if (n.type === "LogicalExpression" && (isOuterGroup || !isParenthesizedHandler(n))) {
                        const leftText = buildNestedMultilineHandler(n.left, false, currentIndent);
                        const rightText = buildNestedMultilineHandler(n.right, false, currentIndent);

                        return `${leftText}\n${currentIndent}${n.operator} ${rightText}`;
                    }

                    // Check if this is a parenthesized group with >maxOperands - also expand it
                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        const innerCount = countOperandsInsideGroupHandler(n);
                        if (innerCount > maxOperands) {
                            const innerIndent = currentIndent + "    ";
                            const buildInner = (inner) => {
                                if (inner.type === "LogicalExpression" && !isParenthesizedHandler(inner)) {
                                    const l = buildInner(inner.left);
                                    const r = buildInner(inner.right);

                                    return `${l}\n${innerIndent}${inner.operator} ${r}`;
                                }

                                return getSourceTextWithGroupsHandler(inner);
                            };

                            const innerLeft = buildInner(n.left);
                            const innerRight = buildInner(n.right);

                            return `(\n${innerIndent}${innerLeft}\n${innerIndent}${n.operator} ${innerRight}\n${currentIndent})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Build the full condition with nested group formatted multiline
                const buildFullConditionHandler = (n, targetNode) => {
                    if (n === targetNode) {
                        // This is the nested group - format it multiline
                        // Pass true to ignore outer parentheses check
                        const nestedText = buildNestedMultilineHandler(n, true);

                        return `(\n${contentIndent}${nestedText}\n${parenIndent})`;
                    }

                    if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                        const leftText = buildFullConditionHandler(n.left, targetNode);
                        const rightText = buildFullConditionHandler(n.right, targetNode);

                        return `${leftText} ${n.operator} ${rightText}`;
                    }

                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        // Check if this contains the target
                        const containsTargetHandler = (node, target) => {
                            if (node === target) return true;
                            if (node.type === "LogicalExpression") {
                                return containsTargetHandler(node.left, target) || containsTargetHandler(node.right, target);
                            }

                            return false;
                        };

                        if (containsTargetHandler(n, targetNode)) {
                            const innerText = buildFullConditionHandler(n, targetNode);

                            return `(${innerText})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Check if already correctly formatted
                // Collect operands INSIDE the nested group (not treating the group itself as 1 operand)
                const collectInsideGroupHandler = (node) => {
                    const operands = [];
                    const collectHelper = (n) => {
                        if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                            collectHelper(n.left);
                            collectHelper(n.right);
                        } else {
                            operands.push(n);
                        }
                    };

                    // Start from children directly, ignoring outer parentheses
                    if (node.type === "LogicalExpression") {
                        collectHelper(node.left);
                        collectHelper(node.right);
                    }

                    return operands;
                };

                const nestedOperands = collectInsideGroupHandler(nestedGroupExceeding);
                const allOnDifferentLines = nestedOperands.every((op, i) => {
                    if (i === 0) return true;

                    return op.loc.start.line !== nestedOperands[i - 1].loc.start.line;
                });

                if (!allOnDifferentLines) {
                    const newCondition = buildFullConditionHandler(test, nestedGroupExceeding);

                    // Get consequent and alternate text
                    const consequentText = getSourceTextWithGroupsHandler(node.consequent).replace(/\s+/g, " ").trim();
                    const alternateText = getSourceTextWithGroupsHandler(node.alternate).replace(/\s+/g, " ").trim();

                    context.report({
                        fix: (fixer) => fixer.replaceText(node, `${newCondition} ? ${consequentText} : ${alternateText}`),
                        message: `Nested condition with >${maxOperands} operands should be formatted multiline`,
                        node: nestedGroupExceeding,
                    });

                    return;
                }
            }

            // ≤maxOperands operands: collapse to single line
            // BUT skip if any nested group has >maxOperands (already expanded or needs expansion)
            if (operands.length <= maxOperands) {
                // Check if any nested parenthesized group has >maxOperands (should stay multiline)
                const hasExpandedNestedGroup = findNestedGroupExceedingMaxOperandsHandler(test);
                if (hasExpandedNestedGroup) {
                    return; // Don't collapse - nested group needs multiline
                }

                // Skip if branches have complex objects or JSX elements
                const hasComplexBranches = hasComplexObjectHandler(node.consequent) || hasComplexObjectHandler(node.alternate);

                // Skip ternaries with JSX branches (should stay multiline for readability)
                if (hasJsxBranchesHandler(node)) {
                    return;
                }

                // Skip unparenthesized nested ternaries (parenthesized ones count as 1 operand)
                const hasUnparenthesizedNestedTernary = (node.consequent.type === "ConditionalExpression" && !isParenthesizedHandler(node.consequent))
                    || (node.alternate.type === "ConditionalExpression" && !isParenthesizedHandler(node.alternate));

                // Skip parenthesized nested ternaries with complex condition (>maxOperands)
                if (hasComplexBranches || hasUnparenthesizedNestedTernary || hasComplexNestedTernaryHandler(node)) {
                    return;
                }

                // Check if already properly formatted (single line)
                const isOnSingleLine = node.loc.start.line === node.loc.end.line;
                const hasOperatorOnOwnLine = isOperatorOnOwnLineHandler(node);

                if (isOnSingleLine && !hasOperatorOnOwnLine) {
                    return;
                }

                // Collapse to single line
                const singleLineText = getTernarySingleLineHandler(node);

                context.report({
                    fix: (fixer) => fixer.replaceText(node, singleLineText),
                    message: `Ternary with ≤${maxOperands} operands should be on a single line`,
                    node,
                });

                return;
            }

            // More than maxOperands: each on its own line
            let isCorrectionNeeded = !isMultiLine;
            const parent = node.parent;

            if (isMultiLine) {
                for (let i = 0; i < operands.length - 1; i += 1) {
                    if (operands[i].loc.end.line === operands[i + 1].loc.start.line) {
                        isCorrectionNeeded = true;
                        break;
                    }
                }

                // Check if any operator is at end of line (should be at beginning)
                if (!isCorrectionNeeded && hasOperatorAtEndOfLineHandler(test)) {
                    isCorrectionNeeded = true;
                }

                // Check if ? is on same line as end of multiline condition (BAD - should be on its own line)
                if (!isCorrectionNeeded) {
                    const questionToken = sourceCode.getTokenAfter(test, (t) => t.value === "?");

                    if (questionToken && questionToken.loc.start.line === test.loc.end.line) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check for empty lines before ? (between condition and ?)
                if (!isCorrectionNeeded) {
                    const questionToken = sourceCode.getTokenAfter(test, (t) => t.value === "?");

                    if (questionToken && questionToken.loc.start.line > test.loc.end.line + 1) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check for empty lines before : (between consequent and :)
                if (!isCorrectionNeeded) {
                    const colonToken = sourceCode.getTokenAfter(node.consequent, (t) => t.value === ":");

                    if (colonToken && colonToken.loc.start.line > node.consequent.loc.end.line + 1) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check if ? or : is on its own line without its value
                if (!isCorrectionNeeded && isOperatorOnOwnLineHandler(node)) {
                    isCorrectionNeeded = true;
                }

                // Check if : is on same line as ? (both should be on their own lines for multiline)
                if (!isCorrectionNeeded) {
                    const questionToken = sourceCode.getTokenAfter(test, (t) => t.value === "?");
                    const colonToken = sourceCode.getTokenAfter(node.consequent, (t) => t.value === ":");

                    if (questionToken && colonToken && questionToken.loc.start.line === colonToken.loc.start.line) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check if first operand is not on same line as parent property key
                if (!isCorrectionNeeded && parent && parent.type === "Property" && parent.value === node) {
                    const keyEndLine = parent.key.loc.end.line;
                    const firstOperandLine = operands[0].loc.start.line;

                    if (firstOperandLine !== keyEndLine) {
                        isCorrectionNeeded = true;
                    }
                }
            }

            if (isCorrectionNeeded) {
                context.report({
                    fix: (fixer) => {
                        // Get proper base indent
                        let baseIndent;
                        let includePropertyKey = false;
                        let propertyKeyText = "";

                        // Check if parent is Property and value starts on different line
                        if (parent && parent.type === "Property" && parent.value === node) {
                            const keyEndLine = parent.key.loc.end.line;
                            const firstOperandLine = operands[0].loc.start.line;

                            if (firstOperandLine !== keyEndLine) {
                                // Need to include property key in fix
                                includePropertyKey = true;
                                propertyKeyText = sourceCode.getText(parent.key) + ": ";
                                const propertyLineText = sourceCode.lines[parent.loc.start.line - 1];

                                baseIndent = propertyLineText.match(/^\s*/)[0];
                            }
                        }

                        if (!baseIndent) {
                            const lineText = sourceCode.lines[node.loc.start.line - 1];

                            baseIndent = lineText.match(/^\s*/)[0];
                        }

                        const conditionIndent = baseIndent + "    ";

                        const buildMultilineHandler = (n) => {
                            if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                const leftText = buildMultilineHandler(n.left);
                                const rightText = buildMultilineHandler(n.right);

                                return `${leftText}\n${conditionIndent}${n.operator} ${rightText}`;
                            }

                            return getSourceTextWithGroupsHandler(n);
                        };

                        const consequentText = sourceCode.getText(node.consequent);
                        const alternateText = sourceCode.getText(node.alternate);

                        // Build multiline with ? and : each on their own lines
                        const conditionPart = buildMultilineHandler(test);
                        const newText = `${conditionPart}\n${conditionIndent}? ${consequentText}\n${conditionIndent}: ${alternateText}`;

                        if (includePropertyKey) {
                            // Replace the entire property value including fixing the key position
                            return fixer.replaceTextRange(
                                [parent.key.range[0], node.range[1]],
                                `${propertyKeyText}${newText}`,
                            );
                        }

                        return fixer.replaceText(node, newText);
                    },
                    message: `Ternary conditions with more than ${maxOperands} operands should be multiline, with each operand on its own line`,
                    node: test,
                });
            }
        };

        // Check if this ternary is a nested ternary inside another ternary's branch
        const isNestedInTernaryBranchHandler = (node) => {
            let parent = node.parent;

            // Walk up through parentheses
            while (parent && parent.type === "ParenthesizedExpression") {
                parent = parent.parent;
            }

            // Check if parent is a ternary and this node is in consequent or alternate
            if (parent && parent.type === "ConditionalExpression") {
                return parent.consequent === node || parent.alternate === node
                    || (node.parent.type === "ParenthesizedExpression"
                        && (parent.consequent === node.parent || parent.alternate === node.parent));
            }

            return false;
        };

        return {
            ConditionalExpression(node) {
                const { test } = node;

                // Skip nested ternaries that are inside another ternary's branch
                // They will be formatted by their parent ternary
                if (isNestedInTernaryBranchHandler(node)) {
                    return;
                }

                // Check for excessive nesting depth in the condition
                if (test.type === "LogicalExpression") {
                    const nestingDepth = getNestingDepthHandler(test);

                    if (nestingDepth > maxNestingLevel) {
                        const deepGroup = findDeepNestedGroupHandler(test);

                        if (deepGroup) {
                            const groupText = getSourceTextWithGroupsHandler(deepGroup.node);

                            // Generate unique variable name
                            let varName = `is${getConditionNameHandler(deepGroup.node)}`;
                            // Limit length and sanitize
                            if (varName.length > 30) {
                                varName = "isNestedCondition";
                            }

                            context.report({
                                fix: (fixer) => {
                                    const fixes = [];

                                    // Get the line before the ternary statement for inserting the variable
                                    // Find the statement that contains this ternary
                                    let statementNode = node;
                                    while (statementNode.parent && statementNode.parent.type !== "Program" && statementNode.parent.type !== "BlockStatement") {
                                        statementNode = statementNode.parent;
                                    }

                                    const ternaryLine = statementNode.loc.start.line;
                                    const lineStart = sourceCode.getIndexFromLoc({ line: ternaryLine, column: 0 });
                                    const lineText = sourceCode.lines[ternaryLine - 1];
                                    const indent = lineText.match(/^\s*/)[0];

                                    // Insert variable declaration before the statement containing the ternary
                                    fixes.push(fixer.insertTextBeforeRange(
                                        [lineStart, lineStart],
                                        `const ${varName} = ${groupText};\n${indent}`,
                                    ));

                                    // Replace the nested group with the variable name in the condition
                                    // We need to replace including the parentheses around the group
                                    const tokenBefore = sourceCode.getTokenBefore(deepGroup.node);
                                    const tokenAfter = sourceCode.getTokenAfter(deepGroup.node);

                                    if (tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")") {
                                        fixes.push(fixer.replaceTextRange(
                                            [tokenBefore.range[0], tokenAfter.range[1]],
                                            varName,
                                        ));
                                    } else {
                                        fixes.push(fixer.replaceText(deepGroup.node, varName));
                                    }

                                    return fixes;
                                },
                                message: `Ternary condition nesting depth (${nestingDepth}) exceeds maximum (${maxNestingLevel}). Extract deeply nested condition to a variable.`,
                                node: deepGroup.node,
                            });

                            return; // Don't process other rules for this statement
                        }
                    }
                }

                // First, try to collapse simple ternaries to single line
                if (isSimpleConditionHandler(test)) {
                    if (handleSimpleTernaryHandler(node)) return;
                }

                // For complex logical expressions, handle multiline formatting
                if (test.type === "LogicalExpression") {
                    handleComplexLogicalTernaryHandler(node);
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent ternary formatting based on condition operand count: ≤maxOperands collapses to single line, >maxOperands expands to multiline" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxOperands: {
                        default: 3,
                        description: "Maximum condition operands to keep ternary on single line (default: 3). Also applies to nested groups.",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Logical Expression Multiline
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce multiline formatting for logical expressions with more
 *   than maxOperands. This applies to variable declarations, return
 *   statements, assignment expressions, and other contexts.
 *
 * Options:
 *   { maxOperands: 3 } - Maximum operands on single line (default: 3)
 *
 * ✓ Good:
 *   const err = data.error
 *       || data.message
 *       || data.status
 *       || data.fallback;
 *
 * ✗ Bad:
 *   const err = data.error || data.message || data.status || data.fallback;
 */
const logicalExpressionMultiline = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxOperands = options.maxOperands !== undefined ? options.maxOperands : 3;

        // Check if node is wrapped in parentheses
        const isParenthesizedHandler = (node) => {
            const tokenBefore = sourceCode.getTokenBefore(node);
            const tokenAfter = sourceCode.getTokenAfter(node);

            if (!tokenBefore || !tokenAfter) return false;

            return tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        // Collect all operands from a logical expression (flattening non-parenthesized ones)
        const collectOperandsHandler = (node) => {
            const operands = [];

            const collectHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    collectHelperHandler(n.left);
                    collectHelperHandler(n.right);
                } else {
                    operands.push(n);
                }
            };

            collectHelperHandler(node);

            return operands;
        };

        // Get the operator between two operands
        const getOperatorHandler = (leftNode, rightNode) => {
            const tokens = sourceCode.getTokensBetween(leftNode, rightNode);
            const opToken = tokens.find((t) => t.value === "||" || t.value === "&&" || t.value === "??" || t.value === "|" || t.value === "&");

            return opToken ? opToken.value : "||";
        };

        // Check if the expression is already multiline
        const isMultilineHandler = (node) => node.loc.start.line !== node.loc.end.line;

        // Check if we're inside an if condition or ternary test (handled by other rules)
        const isInIfOrTernaryHandler = (node) => {
            let current = node.parent;

            while (current) {
                if (current.type === "IfStatement" && current.test === node) return true;

                if (current.type === "ConditionalExpression" && current.test === node) return true;

                // Stop if we hit a statement or declaration boundary
                if (current.type.includes("Statement") || current.type.includes("Declaration")) return false;

                current = current.parent;
            }

            return false;
        };

        // Handle logical expression
        const checkLogicalExpressionHandler = (node) => {
            // Only process top-level logical expressions (not nested ones)
            if (node.parent.type === "LogicalExpression" && !isParenthesizedHandler(node)) return;

            // Skip if this is in an if condition or ternary test (handled by other rules)
            if (isInIfOrTernaryHandler(node)) return;

            // Collect all operands
            const operands = collectOperandsHandler(node);

            // Case 1: Simple expression (≤maxOperands) that's multiline → collapse to single line
            if (operands.length <= maxOperands) {
                if (isMultilineHandler(node)) {
                    // Skip if any operand is itself multiline (e.g., JSX elements, function calls)
                    const hasMultilineOperand = operands.some((op) => op.loc.start.line !== op.loc.end.line);

                    if (hasMultilineOperand) return;

                    context.report({
                        fix(fixer) {
                            // Build single line: operand1 op operand2 op operand3
                            const parts = [sourceCode.getText(operands[0])];

                            for (let i = 1; i < operands.length; i++) {
                                const operator = getOperatorHandler(operands[i - 1], operands[i]);
                                parts.push(` ${operator} ${sourceCode.getText(operands[i])}`);
                            }

                            return fixer.replaceText(node, parts.join(""));
                        },
                        message: `Logical expression with ${operands.length} operands should be on a single line (max for multiline: ${maxOperands})`,
                        node,
                    });
                }

                return;
            }

            // Case 2: Complex expression (>maxOperands) → enforce multiline
            // Check if already properly multiline
            if (isMultilineHandler(node)) {
                // Check if each operand is on its own line
                let allOnOwnLines = true;

                for (let i = 1; i < operands.length; i++) {
                    if (operands[i].loc.start.line === operands[i - 1].loc.end.line) {
                        allOnOwnLines = false;
                        break;
                    }
                }

                if (allOnOwnLines) return;
            }

            // Report and fix
            context.report({
                fix(fixer) {
                    // Build the formatted expression
                    const firstOperandText = sourceCode.getText(operands[0]);

                    // Get the line containing the first operand
                    const firstToken = sourceCode.getFirstToken(operands[0]);
                    const lineStart = sourceCode.text.lastIndexOf("\n", firstToken.range[0]) + 1;
                    const lineContent = sourceCode.text.slice(lineStart, firstToken.range[0]);

                    // Extract only the whitespace indentation from the line
                    const indentMatch = lineContent.match(/^(\s*)/);
                    const baseIndent = indentMatch ? indentMatch[1] : "";

                    // Build each line: first operand, then operator + operand for each subsequent
                    const lines = [firstOperandText];

                    for (let i = 1; i < operands.length; i++) {
                        const operator = getOperatorHandler(operands[i - 1], operands[i]);
                        const operandText = sourceCode.getText(operands[i]);
                        lines.push(`${baseIndent}    ${operator} ${operandText}`);
                    }

                    // Get the full range of the expression
                    const fullText = lines.join("\n");

                    return fixer.replaceText(node, fullText);
                },
                message: `Logical expression with ${operands.length} operands should be on multiple lines (max: ${maxOperands})`,
                node,
            });
        };

        return {
            LogicalExpression: checkLogicalExpressionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce single line for ≤maxOperands, multiline for >maxOperands logical expressions" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxOperands: {
                        default: 3,
                        description: "Maximum operands to keep on single line (default: 3)",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Empty Line After Block
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Require an empty line between a closing brace `}` of a block
 *   statement (if, try, for, while, etc.) and the next statement,
 *   unless the next statement is part of the same construct (else, catch, finally).
 *
 * Note: Consecutive if statements are handled by if-else-spacing rule.
 *
 * ✓ Good:
 *   if (condition) {
 *       doSomething();
 *   }
 *
 *   const x = 1;
 *
 * ✗ Bad:
 *   if (condition) {
 *       doSomething();
 *   }
 *   const x = 1;
 */
const emptyLineAfterBlock = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if a node is a block-containing statement
        const isBlockStatementHandler = (node) => {
            const blockTypes = [
                "IfStatement",
                "ForStatement",
                "ForInStatement",
                "ForOfStatement",
                "WhileStatement",
                "DoWhileStatement",
                "TryStatement",
                "SwitchStatement",
                "WithStatement",
            ];

            return blockTypes.includes(node.type);
        };

        // Get the actual end line of a statement (including else, catch, finally)
        const getStatementEndLineHandler = (node) => {
            if (node.type === "IfStatement" && node.alternate) {
                return getStatementEndLineHandler(node.alternate);
            }

            if (node.type === "TryStatement") {
                if (node.finalizer) return node.finalizer.loc.end.line;

                if (node.handler) return node.handler.loc.end.line;
            }

            return node.loc.end.line;
        };

        return {
            "BlockStatement:exit"(node) {
                const parent = node.parent;

                // Only check for block-containing statements
                if (!parent || !isBlockStatementHandler(parent)) return;

                // Skip if this block is followed by else, catch, or finally
                if (parent.type === "IfStatement" && parent.consequent === node && parent.alternate) {
                    return;
                }

                if (parent.type === "TryStatement" && (parent.block === node || parent.handler?.body === node) && (parent.handler || parent.finalizer)) {
                    if (parent.block === node && (parent.handler || parent.finalizer)) return;

                    if (parent.handler?.body === node && parent.finalizer) return;
                }

                // Get the parent's container (the block that contains the parent statement)
                const grandparent = parent.parent;

                if (!grandparent || grandparent.type !== "BlockStatement") return;

                // Find the index of the parent statement in the grandparent's body
                const stmtIndex = grandparent.body.indexOf(parent);

                if (stmtIndex === -1 || stmtIndex === grandparent.body.length - 1) return;

                // Get the next statement
                const nextStmt = grandparent.body[stmtIndex + 1];

                // Skip consecutive if statements - handled by if-else-spacing rule
                if (parent.type === "IfStatement" && nextStmt.type === "IfStatement") {
                    return;
                }

                // Get the actual end of the current statement
                const currentEndLine = getStatementEndLineHandler(parent);
                const nextStartLine = nextStmt.loc.start.line;

                // Check if there's an empty line between them
                if (nextStartLine - currentEndLine < 2) {
                    context.report({
                        fix: (fixer) => {
                            const endToken = sourceCode.getLastToken(parent);

                            return fixer.insertTextAfter(endToken, "\n");
                        },
                        message: "Expected empty line after block statement",
                        node: nextStmt,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Require empty line between block statement closing brace and next statement" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Class Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce that class declarations must end with "Class" suffix.
 *   This distinguishes class definitions from other PascalCase names
 *   like React components or type definitions.
 *
 * ✓ Good:
 *   class ApiServiceClass { ... }
 *   class UserRepositoryClass { ... }
 *
 * ✗ Bad:
 *   class ApiService { ... }
 *   class UserRepository { ... }
 */
const classNamingConvention = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Store classes that need renaming and their references
        const classesToRename = new Map();

        // Collect all Identifier nodes that might be class references
        const collectReferencesHandler = (programNode, className) => {
            const references = [];

            const visitHandler = (node) => {
                if (!node || typeof node !== "object") return;

                // Found a matching Identifier
                if (node.type === "Identifier" && node.name === className) {
                    references.push(node);
                }

                // Recursively visit children
                for (const key in node) {
                    if (key === "parent" || key === "range" || key === "loc") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach((c) => visitHandler(c));
                    } else if (child && typeof child === "object" && child.type) {
                        visitHandler(child);
                    }
                }
            };

            visitHandler(programNode);

            return references;
        };

        return {
            ClassDeclaration(node) {
                if (!node.id || !node.id.name) return;

                const className = node.id.name;

                if (!className.endsWith("Class")) {
                    classesToRename.set(className, {
                        classIdNode: node.id,
                        newName: `${className}Class`,
                    });
                }
            },

            "Program:exit"(programNode) {
                // Process all classes that need renaming
                classesToRename.forEach(({ classIdNode, newName }, className) => {
                    // Find all references to this class in the entire program
                    const allReferences = collectReferencesHandler(programNode, className);

                    context.report({
                        fix: (fixer) => {
                            const fixes = [];

                            allReferences.forEach((ref) => {
                                fixes.push(fixer.replaceText(ref, newName));
                            });

                            return fixes;
                        },
                        message: `Class name "${className}" should end with "Class" suffix`,
                        node: classIdNode,
                    });
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce class names end with 'Class' suffix" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Class/Method Definition Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce consistent spacing in class and method definitions:
 *   - Space before opening brace { in class declarations
 *   - No space between method name and opening parenthesis (
 *   - Space before opening brace { in method definitions
 *   - Opening brace must be on same line as method signature
 *
 * ✓ Good:
 *   class ApiServiceClass {
 *       getDataHandler(): string {
 *           return "data";
 *       }
 *       async fetchUserHandler(id: string): Promise<User> {
 *           return await fetch(id);
 *       }
 *   }
 *
 * ✗ Bad:
 *   class ApiServiceClass{  // Missing space before {
 *   class ApiServiceClass
 *   {  // Opening brace on different line
 *       getDataHandler (): string {  // Space before (
 *       getDataHandler(): string{  // Missing space before {
 *       getDataHandler(): string
 *       {  // Opening brace on different line
 */
const classMethodDefinitionFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ClassDeclaration(node) {
                const classBody = node.body;

                if (!classBody) return;

                // Find the opening brace of the class body
                const openBrace = sourceCode.getFirstToken(classBody);

                if (!openBrace || openBrace.value !== "{") return;

                // Get the token before the opening brace (class name or extends clause)
                const tokenBefore = sourceCode.getTokenBefore(openBrace);

                if (!tokenBefore) return;

                // Check if opening brace is on same line as class declaration
                if (tokenBefore.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBefore.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Opening brace should be on the same line as class declaration",
                        node: openBrace,
                    });

                    return;
                }

                // Check for space before opening brace
                const textBetween = sourceCode.text.slice(tokenBefore.range[1], openBrace.range[0]);

                if (textBetween !== " ") {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBefore.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Expected single space before opening brace in class declaration",
                        node: openBrace,
                    });
                }
            },

            MethodDefinition(node) {
                const methodKey = node.key;
                const methodValue = node.value;

                if (!methodKey || !methodValue) return;

                // Check for space between method name and opening parenthesis
                // For computed properties, we need to get the ] token
                const keyLastToken = node.computed
                    ? sourceCode.getTokenAfter(methodKey, { filter: (t) => t.value === "]" })
                    : sourceCode.getLastToken(methodKey);

                if (!keyLastToken) return;

                // Find the opening parenthesis of the parameters
                let openParen = sourceCode.getTokenAfter(keyLastToken);

                // Skip over async, static, get, set keywords and * for generators
                while (openParen && openParen.value !== "(") {
                    openParen = sourceCode.getTokenAfter(openParen);
                }

                if (!openParen || openParen.value !== "(") return;

                // Get the token immediately before the opening paren (method name or modifier)
                const tokenBeforeParen = sourceCode.getTokenBefore(openParen);

                if (tokenBeforeParen) {
                    const textBeforeParen = sourceCode.text.slice(tokenBeforeParen.range[1], openParen.range[0]);

                    if (/\s/.test(textBeforeParen)) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeParen.range[1], openParen.range[0]],
                                "",
                            ),
                            message: "No space between method name and opening parenthesis",
                            node: openParen,
                        });
                    }
                }

                // Check for space before opening brace and brace on same line
                const functionBody = methodValue.body;

                if (!functionBody || functionBody.type !== "BlockStatement") return;

                const openBrace = sourceCode.getFirstToken(functionBody);

                if (!openBrace || openBrace.value !== "{") return;

                // Get the token before the opening brace (return type annotation or closing paren)
                const tokenBeforeBrace = sourceCode.getTokenBefore(openBrace);

                if (!tokenBeforeBrace) return;

                // Check if opening brace is on same line
                if (tokenBeforeBrace.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBeforeBrace.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Opening brace should be on the same line as method signature",
                        node: openBrace,
                    });

                    return;
                }

                // Check for space before opening brace
                const textBeforeBrace = sourceCode.text.slice(tokenBeforeBrace.range[1], openBrace.range[0]);

                if (textBeforeBrace !== " ") {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBeforeBrace.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Expected single space before opening brace in method definition",
                        node: openBrace,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent spacing in class and method definitions" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Enum Type Enforcement
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When a variable/parameter has a type like "ButtonVariantType",
 *   enforce using the corresponding enum "ButtonVariantEnum.VALUE"
 *   instead of string literals like "primary" or "ghost".
 *
 *   The rule detects:
 *   - Default values in destructuring: `variant = "primary"` → `variant = ButtonVariantEnum.PRIMARY`
 *   - Comparisons: `variant === "ghost"` → `variant === ButtonVariantEnum.GHOST`
 *   - Object property values matching the type
 *
 * ✓ Good:
 *   const Button = ({ variant = ButtonVariantEnum.PRIMARY }: { variant?: ButtonVariantType }) => ...
 *   if (variant === ButtonVariantEnum.GHOST) { ... }
 *
 * ✗ Bad:
 *   const Button = ({ variant = "primary" }: { variant?: ButtonVariantType }) => ...
 *   if (variant === "ghost") { ... }
 */
const enumTypeEnforcement = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Map to track variables with Type annotations and their corresponding Enum
        // e.g., "variant" -> { typeName: "ButtonVariantType", enumName: "ButtonVariantEnum" }
        const typeAnnotatedVars = new Map();

        // Convert type name to enum name: ButtonVariantType -> ButtonVariantEnum
        const getEnumNameFromTypeHandler = (typeName) => {
            if (typeName.endsWith("Type")) {
                return typeName.slice(0, -4) + "Enum";
            }

            return null;
        };

        // Convert string literal to enum member: "primary" -> "PRIMARY", "ghost-danger" -> "GHOST_DANGER"
        const toEnumMemberHandler = (str) => str.toUpperCase().replace(/-/g, "_");

        // Check if a type annotation references a Type that has a corresponding Enum
        const extractTypeInfoHandler = (typeAnnotation) => {
            if (!typeAnnotation) return null;

            const annotation = typeAnnotation.typeAnnotation;

            if (!annotation) return null;

            // Handle direct type reference: : ButtonVariantType
            if (annotation.type === "TSTypeReference" && annotation.typeName?.type === "Identifier") {
                const typeName = annotation.typeName.name;

                if (typeName.endsWith("Type")) {
                    return {
                        enumName: getEnumNameFromTypeHandler(typeName),
                        typeName,
                    };
                }
            }

            return null;
        };

        // Helper to process TSTypeLiteral members
        const processTypeLiteralMembersHandler = (members) => {
            members.forEach((member) => {
                if (member.type === "TSPropertySignature" && member.key?.type === "Identifier") {
                    const propName = member.key.name;
                    const typeInfo = extractTypeInfoHandler(member.typeAnnotation);

                    if (typeInfo) {
                        typeAnnotatedVars.set(propName, typeInfo);
                    }
                }
            });
        };

        // Track type-annotated parameters in function/component definitions
        const trackTypedParamsHandler = (params) => {
            params.forEach((param) => {
                // Handle destructured params: ({ variant }: { variant?: ButtonVariantType })
                if (param.type === "ObjectPattern" && param.typeAnnotation) {
                    const annotation = param.typeAnnotation.typeAnnotation;

                    if (annotation && annotation.type === "TSTypeLiteral") {
                        processTypeLiteralMembersHandler(annotation.members);
                    }

                    // Handle intersection types: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariantType }
                    if (annotation && annotation.type === "TSIntersectionType") {
                        annotation.types.forEach((intersectionType) => {
                            if (intersectionType.type === "TSTypeLiteral") {
                                processTypeLiteralMembersHandler(intersectionType.members);
                            }
                        });
                    }
                }

                // Handle simple typed param: (variant: ButtonVariantType)
                if (param.type === "Identifier" && param.typeAnnotation) {
                    const typeInfo = extractTypeInfoHandler(param);

                    if (typeInfo) {
                        typeAnnotatedVars.set(param.name, typeInfo);
                    }
                }
            });
        };

        return {
            // Track function parameters
            "ArrowFunctionExpression, FunctionDeclaration, FunctionExpression"(node) {
                trackTypedParamsHandler(node.params);
            },

            // Check default values in destructuring patterns
            AssignmentPattern(node) {
                // Pattern like: variant = "primary"
                if (node.left.type !== "Identifier") return;

                const varName = node.left.name;
                const typeInfo = typeAnnotatedVars.get(varName);

                if (!typeInfo) return;

                // Check if the default is a string literal
                if (node.right.type === "Literal" && typeof node.right.value === "string") {
                    const stringValue = node.right.value;
                    const enumMember = toEnumMemberHandler(stringValue);
                    const replacement = `${typeInfo.enumName}.${enumMember}`;

                    context.report({
                        fix: (fixer) => fixer.replaceText(node.right, replacement),
                        message: `Use "${replacement}" instead of string literal "${stringValue}"`,
                        node: node.right,
                    });
                }
            },

            // Check comparisons: variant === "ghost"
            BinaryExpression(node) {
                if (node.operator !== "===" && node.operator !== "!==") return;

                let varNode = null;
                let literalNode = null;

                if (node.left.type === "Identifier" && node.right.type === "Literal") {
                    varNode = node.left;
                    literalNode = node.right;
                } else if (node.right.type === "Identifier" && node.left.type === "Literal") {
                    varNode = node.right;
                    literalNode = node.left;
                }

                if (!varNode || !literalNode) return;

                if (typeof literalNode.value !== "string") return;

                const typeInfo = typeAnnotatedVars.get(varNode.name);

                if (!typeInfo) return;

                const stringValue = literalNode.value;
                const enumMember = toEnumMemberHandler(stringValue);
                const replacement = `${typeInfo.enumName}.${enumMember}`;

                context.report({
                    fix: (fixer) => fixer.replaceText(literalNode, replacement),
                    message: `Use "${replacement}" instead of string literal "${stringValue}"`,
                    node: literalNode,
                });
            },

            // Clear tracked vars when exiting function scope
            "ArrowFunctionExpression:exit"() {
                typeAnnotatedVars.clear();
            },

            "FunctionDeclaration:exit"() {
                typeAnnotatedVars.clear();
            },

            "FunctionExpression:exit"() {
                typeAnnotatedVars.clear();
            },
        };
    },
    meta: {
        docs: { description: "Enforce using enum values instead of string literals for typed variables" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Absolute Imports Only
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce absolute imports from index files only for local paths.
 *   Local paths (starting with @/) should only import from
 *   folder-level index files.
 *
 *   Exception: Files within the same module folder should use
 *   relative imports (./sibling) to avoid circular dependencies
 *   through the index file.
 *
 * Options:
 *   - aliasPrefix: string (default: "@/") - Change path alias prefix if your project uses something other than @/ (e.g., ~/, src/)
 *   - extraAllowedFolders: string[] - Add custom folders that can be imported with @/folder. Extends defaults without replacing them
 *   - extraReduxSubfolders: string[] - Add Redux subfolders importable directly (@/selectors) or nested (@/redux/selectors). Default: actions, reducers, store, thunks, types
 *   - extraDeepImportFolders: string[] - Add folders where direct file imports are allowed (@/assets/images/logo.svg). Use for folders without index files. Default: assets
 *   - allowedFolders: string[] - Completely replace the default allowed folders list. Use only if you need full control
 *   - reduxSubfolders: string[] - Completely replace the default Redux subfolders list
 *   - deepImportFolders: string[] - Completely replace the default deep import folders list
 *
 * ✓ Good:
 *   import { Button } from "@/components";
 *   import { useAuth } from "@/hooks";
 *   // Sibling import within same folder (avoids circular deps):
 *   import { helpers } from "./helpers";  (when in data/app.js importing data/helpers.js)
 *
 * ✗ Bad:
 *   import { Button } from "@/components/buttons/primary-button";
 *   import { useAuth } from "@/hooks/auth/useAuth";
 *   // Same-folder absolute import (circular dependency risk):
 *   import { helpers } from "@/data";  (when file is inside data/ folder)
 *
 * Configuration Example:
 *   "code-style/absolute-imports-only": ["error", {
 *       extraAllowedFolders: ["features", "modules"],
 *       extraDeepImportFolders: ["images", "fonts"]
 *   }]
 */
const absoluteImportsOnly = {
    create(context) {
        const options = context.options[0] || {};

        // Get the alias prefix from options or default to "@/"
        const aliasPrefix = options.aliasPrefix || "@/";

        // Default redux subfolders
        const defaultReduxSubfolders = ["actions", "reducers", "store", "thunks", "types"];

        // Redux ecosystem folders - can be standalone or inside redux folder
        // These are allowed as: @/actions, @/types, @/store, @/reducers, @/thunks
        // OR as: @/redux/actions, @/redux/types, @/redux/store, @/redux/reducers, @/redux/thunks
        const reduxSubfolders = options.reduxSubfolders
            || [...defaultReduxSubfolders, ...(options.extraReduxSubfolders || [])];

        // Default allowed folders
        const defaultAllowedFolders = [
            "@constants",
            "@strings",
            "actions",
            "apis",
            "assets",
            "atoms",
            "components",
            "config",
            "configs",
            "constants",
            "contexts",
            "data",
            "enums",
            "helpers",
            "hooks",
            "interfaces",
            "layouts",
            "lib",
            "middlewares",
            "pages",
            "providers",
            "reducers",
            "redux",
            "requests",
            "routes",
            "schemas",
            "services",
            "store",
            "strings",
            "styles",
            "theme",
            "thunks",
            "types",
            "ui",
            "utils",
            "utilities",
            "views",
        ];

        // List of allowed top-level folders (can be configured via options)
        // Use allowedFolders to replace entirely, or extraAllowedFolders to extend defaults
        const allowedFolders = options.allowedFolders
            || [...defaultAllowedFolders, ...(options.extraAllowedFolders || [])];

        // Default folders that allow deep imports
        const defaultDeepImportFolders = ["assets"];

        // Folders that allow deep imports (images, fonts, etc. don't have index files)
        // e.g., @/assets/images/logo.svg is allowed
        const deepImportFolders = options.deepImportFolders
            || [...defaultDeepImportFolders, ...(options.extraDeepImportFolders || [])];

        return {
            ImportDeclaration(node) {
                const importPath = node.source.value;

                // Skip if not a string
                if (typeof importPath !== "string") return;

                // Get the current filename
                const filename = context.filename || context.getFilename();
                const normalizedFilename = filename.replace(/\\/g, "/");

                // Check if this is an index file - index files are allowed to use relative imports
                // for re-exporting their contents
                const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

                // Check if this is an entry file (main.tsx, main.ts, etc.) - entry files are allowed
                // to use relative imports for app root and styles (e.g., ./index.css, ./app)
                const isEntryFile = /\/main\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

                // Detect if the file is inside a module folder at any depth
                // e.g., data/app.js, data/auth/login/guest.tsx are both inside "data"
                const getParentModuleFolderHandler = () => {
                    for (const folder of allowedFolders) {
                        const pattern = new RegExp(`/(${folder})/`);

                        if (pattern.test(normalizedFilename)) return folder;
                    }

                    return null;
                };

                const parentModuleFolder = getParentModuleFolderHandler();

                // 1. Disallow relative imports (starting with ./ or ../)
                // EXCEPT in index files, entry files, and sibling files within the same module folder
                if (importPath.startsWith("./") || importPath.startsWith("../")) {
                    // Always allow in index files and entry files
                    if (isIndexFile || isEntryFile) return;

                    // Allow relative imports within the same module folder (any depth)
                    // e.g., data/app.js → "./helpers", data/auth/forget-password/index.ts → "../../login/guest"
                    if (parentModuleFolder) return;

                    context.report({
                        message: `Relative imports are not allowed. Use absolute imports with "${aliasPrefix}" prefix instead.`,
                        node: node.source,
                    });

                    return;
                }

                // 2. Skip node_modules packages (bare imports without @ or starting with @scope/ but not @/)
                // Examples: "react", "react-dom", "lodash"
                if (!importPath.startsWith("@") && !importPath.startsWith(".")) {
                    return; // Node modules package
                }

                // 3. Skip scoped packages from node_modules (e.g., @mui/material, @reduxjs/toolkit)
                // These start with @ but NOT with the local alias prefix
                if (importPath.startsWith("@") && !importPath.startsWith(aliasPrefix)) {
                    return; // Scoped npm package
                }

                // 4. Check local alias imports (e.g., @/atoms, @/components)
                if (importPath.startsWith(aliasPrefix)) {
                    // Remove the alias prefix to get the path
                    const pathAfterAlias = importPath.slice(aliasPrefix.length);

                    // Split by "/" to get path segments
                    const segments = pathAfterAlias.split("/").filter((s) => s.length > 0);

                    // Must have at least one segment
                    if (segments.length === 0) {
                        context.report({
                            message: `Invalid import path "${importPath}". Specify a folder to import from.`,
                            node: node.source,
                        });

                        return;
                    }

                    // Get the first segment (folder name)
                    const folderName = segments[0];

                    // Check if it's an allowed folder
                    if (!allowedFolders.includes(folderName)) {
                        context.report({
                            message: `Unknown folder "${folderName}" in import path. Allowed folders: ${allowedFolders.join(", ")}`,
                            node: node.source,
                        });

                        return;
                    }

                    // Check if importing from own parent module folder (circular dependency risk)
                    // e.g., data/app.js importing @/data → should use relative import instead
                    if (parentModuleFolder && folderName === parentModuleFolder) {
                        const targetRelativeToModule = segments.slice(1).join("/");

                        // Deep path within own module (e.g., @/data/auth/login/guest) — auto-fixable
                        if (targetRelativeToModule) {
                            const moduleIndex = normalizedFilename.lastIndexOf(`/${parentModuleFolder}/`);
                            const fileRelativeToModule = normalizedFilename.slice(moduleIndex + parentModuleFolder.length + 2);
                            const fileDir = fileRelativeToModule.substring(0, fileRelativeToModule.lastIndexOf("/"));

                            let relativePath = nodePath.posix.relative(fileDir, targetRelativeToModule);

                            if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;

                            context.report({
                                message: `Files within "${parentModuleFolder}/" should use relative imports (e.g., "${relativePath}") instead of "${importPath}" to avoid circular dependencies.`,
                                node: node.source,
                                fix: (fixer) => fixer.replaceText(node.source, `"${relativePath}"`),
                            });

                            return;
                        }

                        // Barrel import to own module (e.g., @/data from inside data/) — report only
                        context.report({
                            message: `Files within "${parentModuleFolder}/" should use relative imports instead of "${importPath}" to avoid circular dependencies through the index file.`,
                            node: node.source,
                        });

                        return;
                    }

                    // Only one segment is allowed (import from index file)
                    // e.g., @/atoms is OK, @/atoms/menus is NOT OK
                    // EXCEPTION: Redux ecosystem - @/redux/actions, @/redux/types, etc. are allowed
                    if (segments.length > 1) {
                        // Check if this is a redux subfolder import (e.g., @/redux/actions)
                        const isReduxSubfolder = folderName === "redux"
                            && segments.length === 2
                            && reduxSubfolders.includes(segments[1]);

                        if (isReduxSubfolder) {
                            // This is allowed: @/redux/actions, @/redux/types, etc.
                            return;
                        }

                        // Check if importing deeper than allowed redux subfolder
                        // e.g., @/redux/actions/thunks is NOT allowed
                        if (folderName === "redux" && segments.length > 2) {
                            const suggestedImport = `${aliasPrefix}redux/${segments[1]}`;

                            context.report({
                                message: `Deep imports are not allowed. Import from "${suggestedImport}" instead of "${importPath}". Export the module from the folder's index file.`,
                                node: node.source,
                            });

                            return;
                        }

                        // Some folders allow deep imports (images, fonts, etc. don't have index files)
                        // e.g., @/assets/images/logo.svg is allowed
                        if (deepImportFolders.includes(folderName)) {
                            return;
                        }

                        const suggestedImport = `${aliasPrefix}${folderName}`;

                        context.report({
                            message: `Deep imports are not allowed. Import from "${suggestedImport}" instead of "${importPath}". Export the module from the folder's index file.`,
                            node: node.source,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce absolute imports from index files only for local paths, with relative imports required for files within the same module folder" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    aliasPrefix: { type: "string" },
                    allowedFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    deepImportFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraAllowedFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraDeepImportFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraReduxSubfolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    reduxSubfolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Export Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Export statements should have consistent formatting with
 *   proper spacing. Ensures `export {` is on the same line.
 *   - Collapses to single line when count <= maxSpecifiers (default 3)
 *   - Expands to multiline when count > maxSpecifiers, with each
 *     specifier on its own line
 *
 *   This rule is self-sufficient and handles both collapsing and
 *   expanding of export specifiers.
 *
 * Options:
 *   { maxSpecifiers: 3 } - Threshold for single line vs multiline
 *
 * ✓ Good:
 *   export { a, b, c };
 *   export {
 *       a,
 *       b,
 *       c,
 *       d,
 *   };
 *
 * ✗ Bad:
 *   export {a,b,c};
 *   export
 *       { a };
 *   export { a, b, c, d, e };
 */
const exportFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxSpecifiers = options.maxSpecifiers !== undefined ? options.maxSpecifiers : 3;

        const checkExportHandler = (node) => {
            const exportToken = sourceCode.getFirstToken(node);

            // Check for export with declaration (export interface, export enum, export type, export const, etc.)
            if (node.declaration) {
                const declarationFirstToken = sourceCode.getFirstToken(node.declaration);

                if (declarationFirstToken && exportToken.loc.end.line !== declarationFirstToken.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [exportToken.range[1], declarationFirstToken.range[0]],
                            " ",
                        ),
                        message: "Declaration keyword must be on the same line as 'export'",
                        node: declarationFirstToken,
                    });
                }

                return;
            }

            const specifiers = node.specifiers;

            if (specifiers.length === 0) return;

            const openBrace = sourceCode.getTokenAfter(exportToken, (t) => t.value === "{");
            const closeBrace = sourceCode.getLastToken(node, (t) => t.value === "}");

            if (!openBrace || !closeBrace) return;

            // Check if "export" and "{" are on different lines
            if (exportToken.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [exportToken.range[1], openBrace.range[0]],
                        " ",
                    ),
                    message: "Opening brace should be on the same line as 'export'",
                    node: openBrace,
                });
            }

            const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;
            const firstSpecifier = specifiers[0];
            const lastSpecifier = specifiers[specifiers.length - 1];

            // Collapse to single line if specifiers <= maxSpecifiers
            if (specifiers.length <= maxSpecifiers) {
                if (isMultiLine) {
                    const specifiersText = specifiers.map((s) => {
                        if (s.exported.name === s.local.name) return s.local.name;

                        return `${s.local.name} as ${s.exported.name}`;
                    }).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{ ${specifiersText} }`,
                        ),
                        message: `Exports with ≤${maxSpecifiers} specifiers should be single line: export { a, b, c }`,
                        node,
                    });
                }
            } else {
                // Expand to multiline if specifiers > maxSpecifiers
                const baseIndent = " ".repeat(exportToken.loc.start.column);
                const specifierIndent = baseIndent + "    ";

                // Check if first specifier is on same line as opening brace
                if (openBrace.loc.end.line === firstSpecifier.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], firstSpecifier.range[0]],
                            "\n" + specifierIndent,
                        ),
                        message: `Exports with more than ${maxSpecifiers} specifiers should have first specifier on its own line`,
                        node: firstSpecifier,
                    });
                }

                // Check if closing brace is on same line as last specifier
                if (closeBrace.loc.start.line === lastSpecifier.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastSpecifier.range[1], closeBrace.range[0]],
                            ",\n" + baseIndent,
                        ),
                        message: `Exports with more than ${maxSpecifiers} specifiers should have closing brace on its own line`,
                        node: closeBrace,
                    });
                }

                // Check each specifier is on its own line
                for (let i = 0; i < specifiers.length - 1; i += 1) {
                    const current = specifiers[i];
                    const next = specifiers[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + specifierIndent,
                            ),
                            message: `Each export specifier should be on its own line when more than ${maxSpecifiers} specifiers`,
                            node: next,
                        });
                    }
                }
            }
        };

        return { ExportNamedDeclaration: checkExportHandler };
    },
    meta: {
        docs: { description: "Format exports: export { on same line, collapse/expand specifiers based on count threshold" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxSpecifiers: {
                        default: 3,
                        description: "Maximum specifiers to keep on single line (default: 3). Exports exceeding this will be expanded to multiline.",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Import Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Import statements should have consistent formatting with
 *   proper spacing. Ensures `import {` and `} from` are on
 *   the same line.
 *   - Collapses to single line when count <= maxSpecifiers (default 3)
 *   - Expands to multiline when count > maxSpecifiers, with each
 *     specifier on its own line
 *
 *   This rule is self-sufficient and handles both collapsing and
 *   expanding of import specifiers.
 *
 * Options:
 *   { maxSpecifiers: 3 } - Threshold for single line vs multiline
 *
 * ✓ Good:
 *   import { a, b, c } from "module";
 *   import {
 *       a,
 *       b,
 *       c,
 *       d,
 *   } from "module";
 *
 * ✗ Bad:
 *   import {a,b,c} from "module";
 *   import
 *       { a } from "module";
 *   import { a, b, c, d, e } from "module";
 */
const importFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxSpecifiers = options.maxSpecifiers !== undefined ? options.maxSpecifiers : 3;

        const checkImportHandler = (node) => {
            const importToken = sourceCode.getFirstToken(node);
            const namedSpecifiers = node.specifiers.filter((s) => s.type === "ImportSpecifier");
            const defaultSpecifier = node.specifiers.find((s) => s.type === "ImportDefaultSpecifier");

            // Handle default imports: import Foo from "bar"
            if (defaultSpecifier && namedSpecifiers.length === 0) {
                const fromToken = sourceCode.getTokenBefore(node.source, (t) => t.value === "from");

                if (fromToken && importToken.loc.start.line !== node.source.loc.end.line) {
                    const defaultName = defaultSpecifier.local.name;
                    const sourcePath = node.source.raw;

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node,
                            `import ${defaultName} from ${sourcePath};`,
                        ),
                        message: "Default import should be on a single line",
                        node,
                    });
                }

                return;
            }

            // Handle named imports
            if (namedSpecifiers.length === 0) return;

            const openBrace = sourceCode.getTokenAfter(importToken, (t) => t.value === "{");
            const closeBrace = sourceCode.getTokenBefore(node.source, (t) => t.value === "}");
            const fromToken = sourceCode.getTokenBefore(node.source, (t) => t.value === "from");

            if (!openBrace || !closeBrace || !fromToken) return;

            // Check if "import" and "{" are on different lines
            if (importToken.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [importToken.range[1], openBrace.range[0]],
                        " ",
                    ),
                    message: "Opening brace should be on the same line as 'import'",
                    node: openBrace,
                });
            }

            // Check if "}" and "from" are on different lines
            if (closeBrace.loc.end.line !== fromToken.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeBrace.range[1], fromToken.range[0]],
                        " ",
                    ),
                    message: "Closing brace should be on the same line as 'from'",
                    node: fromToken,
                });
            }

            const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;
            const firstSpecifier = namedSpecifiers[0];
            const lastSpecifier = namedSpecifiers[namedSpecifiers.length - 1];

            // Collapse to single line if specifiers <= maxSpecifiers
            if (namedSpecifiers.length <= maxSpecifiers) {
                if (isMultiLine) {
                    const specifiersText = namedSpecifiers.map((s) => {
                        if (s.imported.name === s.local.name) return s.local.name;

                        return `${s.imported.name} as ${s.local.name}`;
                    }).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{ ${specifiersText} }`,
                        ),
                        message: `Imports with ≤${maxSpecifiers} specifiers should be single line: import { a, b, c } from "module"`,
                        node,
                    });
                }
            } else {
                // Expand to multiline if specifiers > maxSpecifiers
                const baseIndent = " ".repeat(importToken.loc.start.column);
                const specifierIndent = baseIndent + "    ";

                // Check if first specifier is on same line as opening brace
                if (openBrace.loc.end.line === firstSpecifier.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], firstSpecifier.range[0]],
                            "\n" + specifierIndent,
                        ),
                        message: `Imports with more than ${maxSpecifiers} specifiers should have first specifier on its own line`,
                        node: firstSpecifier,
                    });
                }

                // Check if closing brace is on same line as last specifier
                if (closeBrace.loc.start.line === lastSpecifier.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastSpecifier.range[1], closeBrace.range[0]],
                            ",\n" + baseIndent,
                        ),
                        message: `Imports with more than ${maxSpecifiers} specifiers should have closing brace on its own line`,
                        node: closeBrace,
                    });
                }

                // Check each specifier is on its own line
                for (let i = 0; i < namedSpecifiers.length - 1; i += 1) {
                    const current = namedSpecifiers[i];
                    const next = namedSpecifiers[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + specifierIndent,
                            ),
                            message: `Each import specifier should be on its own line when more than ${maxSpecifiers} specifiers`,
                            node: next,
                        });
                    }
                }
            }
        };

        return { ImportDeclaration: checkImportHandler };
    },
    meta: {
        docs: { description: "Format imports: import { on same line, } from on same line, collapse/expand specifiers based on count threshold" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxSpecifiers: {
                        default: 3,
                        description: "Maximum specifiers to keep on single line (default: 3). Imports exceeding this will be expanded to multiline.",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Import Source Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No spaces inside import path quotes. The module path should
 *   not have leading or trailing whitespace.
 *
 * ✓ Good:
 *   import { Button } from "@mui/material";
 *
 * ✗ Bad:
 *   import { Button } from " @mui/material ";
 */
const importSourceSpacing = {
    create(context) {
        return {
            ImportDeclaration(node) {
                const { source } = node;

                if (source.type !== "Literal" || typeof source.value !== "string") return;

                const sourceValue = source.value;
                const trimmed = sourceValue.trim();

                if (sourceValue !== trimmed && trimmed.length > 0) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(source, `"${trimmed}"`),
                        message: `Import path should not have extra spaces inside quotes: "${trimmed}" not "${sourceValue}"`,
                        node: source,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce no extra spaces inside import path quotes" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Module Index Exports
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Ensure module folders have index files that export all contents.
 *   Each module folder must have an index file that exports all
 *   subfolders and files in the module.
 *
 * Options:
 *   - extraModuleFolders: string[] - Add folders that should have an index.js re-exporting all public files. Use for project-specific folders like features/, modules/
 *   - extraLazyLoadFolders: string[] - Add folders exempt from index file requirements. Use for route/page components loaded via dynamic import(). Default: pages, views
 *   - extraIgnorePatterns: string[] - Add file patterns to skip when checking for index exports. Supports wildcards like *.stories.js, *.mock.js
 *   - moduleFolders: string[] - Completely replace the default module folders list. Use only if you need full control
 *   - lazyLoadFolders: string[] - Completely replace the default lazy load folders list
 *   - ignorePatterns: string[] - Completely replace the default ignore patterns list
 *
 * ✓ Good:
 *   // index.js
 *   export { Button } from "./Button";
 *   export { Input } from "./Input";
 *
 * ✗ Bad:
 *   // Missing exports in index.js
 *
 * Configuration Example:
 *   "code-style/module-index-exports": ["error", {
 *       extraModuleFolders: ["features", "modules"],
 *       extraLazyLoadFolders: ["screens"],
 *       extraIgnorePatterns: ["*.stories.js", "*.mock.js"]
 *   }]
 */
const moduleIndexExports = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const srcPath = nodePath.resolve(filename, "../../..").replace(/\\/g, "/");

        // Get options or use defaults
        const options = context.options[0] || {};

        // Default module folders
        const defaultModuleFolders = [
            "@constants",
            "@strings",
            "actions",
            "apis",
            "assets",
            "atoms",
            "components",
            "config",
            "configs",
            "constants",
            "contexts",
            "data",
            "enums",
            "helpers",
            "hooks",
            "interfaces",
            "layouts",
            "lib",
            "middlewares",
            "pages",
            "providers",
            "reducers",
            "redux",
            "requests",
            "routes",
            "schemas",
            "services",
            "store",
            "strings",
            "styles",
            "theme",
            "thunks",
            "types",
            "ui",
            "utils",
            "utilities",
            "views",
        ];

        // List of module folders (can be configured via options)
        // Use moduleFolders to replace entirely, or extraModuleFolders to extend defaults
        const moduleFolders = options.moduleFolders
            || [...defaultModuleFolders, ...(options.extraModuleFolders || [])];

        // Default lazy load folders
        const defaultLazyLoadFolders = ["pages", "views"];

        // Folders that use lazy loading and shouldn't require index exports
        // These folders typically have components loaded via dynamic import()
        const lazyLoadFolders = options.lazyLoadFolders
            || [...defaultLazyLoadFolders, ...(options.extraLazyLoadFolders || [])];

        // Default ignore patterns
        const defaultIgnorePatterns = [
            "index.js",
            "index.jsx",
            "index.ts",
            "index.tsx",
            ".DS_Store",
            "__tests__",
            "__mocks__",
            "*.test.js",
            "*.test.jsx",
            "*.test.ts",
            "*.test.tsx",
            "*.spec.js",
            "*.spec.jsx",
            "*.spec.ts",
            "*.spec.tsx",
        ];

        // Files/folders to ignore
        const ignorePatterns = options.ignorePatterns
            || [...defaultIgnorePatterns, ...(options.extraIgnorePatterns || [])];

        const shouldIgnoreHandler = (name) => ignorePatterns.some((pattern) => {
            if (pattern.includes("*")) {
                const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");

                return regex.test(name);
            }

            return name === pattern;
        });

        const getExportedSourcesHandler = (node) => {
            const exportedSources = new Set();
            const importedNames = new Map();

            if (node.type === "Program") {
                // First pass: collect all imports and their sources
                node.body.forEach((statement) => {
                    // import Foo from "./folder/file"
                    // import { Foo } from "./folder/file"
                    if (statement.type === "ImportDeclaration" && statement.source) {
                        const sourcePath = statement.source.value;

                        statement.specifiers.forEach((spec) => {
                            if (spec.local && spec.local.name) {
                                importedNames.set(
                                    spec.local.name,
                                    sourcePath,
                                );
                            }
                        });
                    }
                });

                // Second pass: check what's exported
                node.body.forEach((statement) => {
                    // export { Foo, Bar } from "./file"
                    if (statement.type === "ExportNamedDeclaration") {
                        // Track direct re-exports: export { ... } from "./path"
                        if (statement.source) {
                            const sourcePath = statement.source.value;

                            exportedSources.add(sourcePath);
                        }

                        // Track exports of imported items: export { Foo }
                        if (statement.specifiers && !statement.source) {
                            statement.specifiers.forEach((spec) => {
                                const exportedName = spec.local ? spec.local.name : spec.exported.name;

                                if (importedNames.has(exportedName)) {
                                    exportedSources.add(importedNames.get(exportedName));
                                }
                            });
                        }
                    }

                    // export * from "./file"
                    if (statement.type === "ExportAllDeclaration" && statement.source) {
                        exportedSources.add(statement.source.value);
                    }
                });
            }

            return exportedSources;
        };

        const normalizeModuleNameHandler = (name) => {
            // Remove file extension
            let normalized = name.replace(/\.(js|jsx|ts|tsx)$/, "");

            // Convert kebab-case to various formats for matching
            return normalized;
        };

        const checkIndexFileExportsHandler = (programNode, dirPath, folderName) => {
            // Get all items in the directory
            let items;

            try {
                items = fs.readdirSync(dirPath);
            } catch {
                return;
            }

            // Filter out ignored items
            const moduleItems = items.filter((item) => {
                if (shouldIgnoreHandler(item)) return false;

                const itemPath = nodePath.join(dirPath, item);

                try {
                    const stat = fs.statSync(itemPath);

                    // Include directories and JS/JSX files
                    if (stat.isDirectory()) return true;
                    if (/\.(js|jsx|ts|tsx)$/.test(item)) return true;
                } catch {
                    return false;
                }

                return false;
            });

            if (moduleItems.length === 0) return;

            // Get all sources that are being exported
            const exportedSources = getExportedSourcesHandler(programNode);

            // Check each module item
            moduleItems.forEach((item) => {
                const itemName = normalizeModuleNameHandler(item);
                const itemPath = nodePath.join(dirPath, item);
                const isDirectory = fs.statSync(itemPath).isDirectory();

                // Check if this item or any deep path from it is exported
                const isExported = Array.from(exportedSources).some((source) => {
                    // Direct matches: ./folder, ./file
                    if (source === `./${item}` || source === `./${itemName}`) {
                        return true;
                    }

                    // Deep path matches: ./folder/subfolder/file starts with ./folder
                    if (source.startsWith(`./${itemName}/`)) {
                        return true;
                    }

                    // Handle cases like ./folder/index
                    if (isDirectory && (
                        source === `./${itemName}/index`
                        || source === `./${itemName}/index.js`
                        || source === `./${itemName}/index.jsx`
                        || source === `./${itemName}/index.ts`
                        || source === `./${itemName}/index.tsx`
                    )) {
                        return true;
                    }

                    return false;
                });

                if (!isExported) {
                    context.report({
                        message: `Module "${item}" in "${folderName}" folder is not exported from index file. Add: export * from "./${itemName}"; or export { ... } from "./${itemName}";`,
                        node: programNode,
                    });
                }
            });
        };

        return {
            Program(node) {
                // Normalize the filename path
                const normalizedFilename = filename.replace(/\\/g, "/");

                // Check if this is an index file in a module folder
                const indexMatch = normalizedFilename.match(/\/src\/([^/]+)\/index\.(js|jsx|ts|tsx)$/);

                if (indexMatch) {
                    const folderName = indexMatch[1];

                    // Skip lazy-loaded folders - they use dynamic imports
                    if (lazyLoadFolders.includes(folderName)) return;

                    if (moduleFolders.includes(folderName)) {
                        const dirPath = nodePath.dirname(filename);

                        checkIndexFileExportsHandler(
                            node,
                            dirPath,
                            folderName,
                        );
                    }
                }

                // Check if this file is in a module folder but NOT the index file
                // to ensure the module folder HAS an index file
                const moduleMatch = normalizedFilename.match(/\/src\/([^/]+)\/([^/]+)\.(js|jsx|ts|tsx)$/);

                if (moduleMatch) {
                    const folderName = moduleMatch[1];
                    const fileName = moduleMatch[2];

                    if (moduleFolders.includes(folderName) && fileName !== "index") {
                        const dirPath = nodePath.dirname(filename);
                        const indexPathJs = nodePath.join(dirPath, "index.js");
                        const indexPathJsx = nodePath.join(dirPath, "index.jsx");
                        const indexPathTs = nodePath.join(dirPath, "index.ts");
                        const indexPathTsx = nodePath.join(dirPath, "index.tsx");

                        const hasIndexFile = fs.existsSync(indexPathJs)
                            || fs.existsSync(indexPathJsx)
                            || fs.existsSync(indexPathTs)
                            || fs.existsSync(indexPathTsx);

                        if (!hasIndexFile) {
                            context.report({
                                message: `Module folder "${folderName}" is missing an index file. Create an index file to export all modules.`,
                                node,
                            });
                        }
                    }
                }

                // Check for subfolder index files
                const subfolderMatch = normalizedFilename.match(/\/src\/([^/]+)\/([^/]+)\/index\.(js|jsx|ts|tsx)$/);

                if (subfolderMatch) {
                    const parentFolder = subfolderMatch[1];
                    const subFolder = subfolderMatch[2];

                    // Skip lazy-loaded folders - they use dynamic imports
                    if (lazyLoadFolders.includes(parentFolder)) return;

                    if (moduleFolders.includes(parentFolder)) {
                        const dirPath = nodePath.dirname(filename);

                        checkIndexFileExportsHandler(
                            node,
                            dirPath,
                            `${parentFolder}/${subFolder}`,
                        );
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Ensure module folders have index files that export all contents" },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    extraIgnorePatterns: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraLazyLoadFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraModuleFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    ignorePatterns: {
                        items: { type: "string" },
                        type: "array",
                    },
                    lazyLoadFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    moduleFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Index Export Style
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces consistent export formatting across all files:
 *   - Index files: no blank lines between exports, consistent style
 *   - Non-index files: require blank lines between exports
 *
 *   For index files, choose between shorthand re-exports or
 *   import-then-export pattern.
 *
 * Options:
 *   - style: "shorthand" (default) | "import-export"
 *     - "shorthand": export { a } from "./file"; (no empty lines between exports)
 *     - "import-export": import { a } from "./file"; export { a }; (single export statement)
 *
 * ✓ Good (index files - shorthand style):
 *   export { Button } from "./button";
 *   export { Input, Select } from "./form";
 *   export { Modal } from "./modal";
 *
 * ✓ Good (non-index files - blank lines required):
 *   export const foo = 1;
 *
 *   export const bar = 2;
 *
 * ✗ Bad (index files - empty lines between exports):
 *   export { Button } from "./button";
 *
 *   export { Input } from "./input";
 *
 * ✗ Bad (non-index files - no blank lines):
 *   export const foo = 1;
 *   export const bar = 2;
 *
 * Configuration Example:
 *   "code-style/index-export-style": ["error", { style: "shorthand" }]
 *   "code-style/index-export-style": ["error", { style: "import-export" }]
 */
const indexExportStyle = {
    create(context) {
        const options = context.options[0] || {};
        const preferredStyle = options.style || "shorthand";
        const sourceCode = context.sourceCode || context.getSourceCode();
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

        // For non-index files: require blank lines between exports
        if (!isIndexFile) {
            return {
                Program(node) {
                    const exports = [];

                    node.body.forEach((statement) => {
                        if (statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration") {
                            exports.push(statement);
                        }
                    });

                    if (exports.length < 2) return;

                    for (let i = 0; i < exports.length - 1; i += 1) {
                        const currentExport = exports[i];
                        const nextExport = exports[i + 1];
                        const currentEndLine = currentExport.loc.end.line;
                        const nextStartLine = nextExport.loc.start.line;

                        if (nextStartLine - currentEndLine < 2) {
                            context.report({
                                fix(fixer) {
                                    return fixer.replaceTextRange(
                                        [currentExport.range[1], nextExport.range[0]],
                                        "\n\n",
                                    );
                                },
                                message: "Require blank line between exports.",
                                node: nextExport,
                            });
                        }
                    }
                },
            };
        }

        // For index files: enforce style and no blank lines

        return {
            Program(node) {
                const imports = [];
                const shorthandExports = [];
                const standaloneExports = [];
                const importSourceMap = new Map();

                // Collect all imports and exports
                node.body.forEach((statement) => {
                    if (statement.type === "ImportDeclaration" && statement.source) {
                        imports.push(statement);

                        // Map imported names to their source
                        statement.specifiers.forEach((spec) => {
                            if (spec.local && spec.local.name) {
                                importSourceMap.set(spec.local.name, {
                                    source: statement.source.value,
                                    statement,
                                });
                            }
                        });
                    }

                    if (statement.type === "ExportNamedDeclaration") {
                        if (statement.source) {
                            // Shorthand: export { a } from "./file"
                            shorthandExports.push(statement);
                        } else if (statement.specifiers && statement.specifiers.length > 0 && !statement.declaration) {
                            // Standalone: export { a }
                            standaloneExports.push(statement);
                        }
                    }
                });

                // Skip if no exports to check
                if (shorthandExports.length === 0 && standaloneExports.length === 0) return;

                // Check for mixed styles
                const hasShorthand = shorthandExports.length > 0;
                const hasImportExport = standaloneExports.length > 0 && imports.length > 0;

                if (hasShorthand && hasImportExport) {
                    context.report({
                        message: `Mixed export styles detected. Use consistent "${preferredStyle}" style throughout the index file.`,
                        node,
                    });

                    return;
                }

                if (preferredStyle === "shorthand") {
                    // Check if using import-then-export pattern when shorthand is preferred
                    if (standaloneExports.length > 0 && imports.length > 0) {
                        // Collect all specifiers to convert
                        const allSpecifiersToConvert = [];

                        standaloneExports.forEach((exportStmt) => {
                            exportStmt.specifiers.forEach((spec) => {
                                const exportedName = spec.local ? spec.local.name : spec.exported.name;
                                const importInfo = importSourceMap.get(exportedName);

                                if (importInfo) {
                                    allSpecifiersToConvert.push({
                                        exportStmt,
                                        exportedName,
                                        importInfo,
                                        localName: spec.local ? spec.local.name : exportedName,
                                        spec,
                                    });
                                }
                            });
                        });

                        if (allSpecifiersToConvert.length > 0) {
                            context.report({
                                fix(fixer) {
                                    const fixes = [];

                                    // Group specifiers by source
                                    const bySource = new Map();

                                    allSpecifiersToConvert.forEach(({ exportedName, importInfo, localName }) => {
                                        const source = importInfo.source;

                                        if (!bySource.has(source)) {
                                            bySource.set(source, []);
                                        }

                                        if (exportedName === localName) {
                                            bySource.get(source).push(exportedName);
                                        } else {
                                            bySource.get(source).push(`${localName} as ${exportedName}`);
                                        }
                                    });

                                    // Create shorthand exports (no empty lines between them)
                                    const newExports = [];

                                    bySource.forEach((specifiers, source) => {
                                        newExports.push(`export { ${specifiers.join(", ")} } from "${source}";`);
                                    });

                                    // Remove all standalone exports
                                    standaloneExports.forEach((exportStmt) => {
                                        fixes.push(fixer.remove(exportStmt));
                                    });

                                    // Remove all imports
                                    imports.forEach((importStmt) => {
                                        fixes.push(fixer.remove(importStmt));
                                    });

                                    // Insert new shorthand exports at the beginning
                                    const firstStatement = node.body[0];

                                    if (firstStatement) {
                                        fixes.push(fixer.insertTextBefore(firstStatement, newExports.join("\n") + "\n"));
                                    }

                                    return fixes;
                                },
                                message: `Use shorthand export style: export { ... } from "source" instead of import then export.`,
                                node,
                            });
                        }
                    }

                    // Check for empty lines between shorthand exports
                    for (let i = 0; i < shorthandExports.length - 1; i += 1) {
                        const currentExport = shorthandExports[i];
                        const nextExport = shorthandExports[i + 1];
                        const currentEndLine = currentExport.loc.end.line;
                        const nextStartLine = nextExport.loc.start.line;

                        if (nextStartLine - currentEndLine > 1) {
                            context.report({
                                fix(fixer) {
                                    const textBetween = sourceCode.getText().slice(
                                        currentExport.range[1],
                                        nextExport.range[0],
                                    );

                                    // Replace multiple newlines with single newline
                                    return fixer.replaceTextRange(
                                        [currentExport.range[1], nextExport.range[0]],
                                        "\n",
                                    );
                                },
                                message: "No empty lines between shorthand exports in index files.",
                                node: nextExport,
                            });
                        }
                    }
                } else if (preferredStyle === "import-export") {
                    // Check if using shorthand when import-export is preferred
                    if (shorthandExports.length > 0) {
                        // Convert all shorthand exports to import-then-export with single export statement
                        context.report({
                            fix(fixer) {
                                const fixes = [];
                                const allImports = [];
                                const allExportNames = [];

                                shorthandExports.forEach((exportStmt) => {
                                    const source = exportStmt.source.value;
                                    const importSpecifiers = [];

                                    exportStmt.specifiers.forEach((spec) => {
                                        const imported = spec.local ? spec.local.name : spec.exported.name;
                                        const exported = spec.exported.name;

                                        importSpecifiers.push(imported);
                                        allExportNames.push(exported);
                                    });

                                    allImports.push(`import { ${importSpecifiers.join(", ")} } from "${source}";`);

                                    // Remove the shorthand export
                                    fixes.push(fixer.remove(exportStmt));
                                });

                                // Sort export names alphabetically
                                allExportNames.sort((a, b) => a.localeCompare(b));

                                // Create single export statement with proper formatting
                                let exportStatement;

                                if (allExportNames.length <= 3) {
                                    exportStatement = `export { ${allExportNames.join(", ")} };`;
                                } else {
                                    exportStatement = `export {\n    ${allExportNames.join(",\n    ")},\n};`;
                                }

                                // Insert imports and export at the beginning
                                const firstStatement = node.body[0];

                                if (firstStatement) {
                                    const newContent = allImports.join("\n") + "\n\n" + exportStatement + "\n";

                                    fixes.push(fixer.insertTextBefore(firstStatement, newContent));
                                }

                                return fixes;
                            },
                            message: `Use import-then-export style with a single export statement.`,
                            node,
                        });
                    }

                    // Check for multiple standalone exports - should be combined into one
                    if (standaloneExports.length > 1) {
                        context.report({
                            fix(fixer) {
                                const fixes = [];
                                const allExportNames = [];

                                standaloneExports.forEach((exportStmt) => {
                                    exportStmt.specifiers.forEach((spec) => {
                                        const exported = spec.exported.name;

                                        allExportNames.push(exported);
                                    });

                                    // Remove all but the last export
                                    fixes.push(fixer.remove(exportStmt));
                                });

                                // Sort export names alphabetically
                                allExportNames.sort((a, b) => a.localeCompare(b));

                                // Create single export statement
                                let exportStatement;

                                if (allExportNames.length <= 3) {
                                    exportStatement = `export { ${allExportNames.join(", ")} };`;
                                } else {
                                    exportStatement = `export {\n    ${allExportNames.join(",\n    ")},\n};`;
                                }

                                // Find last import to insert after
                                const lastImport = imports[imports.length - 1];

                                if (lastImport) {
                                    fixes.push(fixer.insertTextAfter(lastImport, "\n\n" + exportStatement));
                                }

                                return fixes;
                            },
                            message: `Combine multiple export statements into a single export statement.`,
                            node,
                        });
                    }

                    // Check for empty lines between imports
                    for (let i = 0; i < imports.length - 1; i += 1) {
                        const currentImport = imports[i];
                        const nextImport = imports[i + 1];
                        const currentEndLine = currentImport.loc.end.line;
                        const nextStartLine = nextImport.loc.start.line;

                        if (nextStartLine - currentEndLine > 1) {
                            context.report({
                                fix(fixer) {
                                    return fixer.replaceTextRange(
                                        [currentImport.range[1], nextImport.range[0]],
                                        "\n",
                                    );
                                },
                                message: "No empty lines between imports in index files.",
                                node: nextImport,
                            });
                        }
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce export formatting: blank lines in regular files, no blank lines in index files with consistent style: shorthand (default) or import-export" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    style: {
                        enum: ["shorthand", "import-export"],
                        type: "string",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Index Exports Only
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Index files (index.ts, index.tsx, index.js, index.jsx) should
 *   only contain imports and re-exports, not any code definitions.
 *   All definitions (types, interfaces, functions, variables, classes)
 *   should be moved to separate files.
 *
 * ✓ Good:
 *   // index.ts
 *   export { Button } from "./Button";
 *   export { helper } from "./utils";
 *   export type { ButtonProps } from "./types";
 *   export * from "./constants";
 *
 * ✗ Bad:
 *   // index.ts
 *   export type ButtonVariant = "primary" | "secondary";
 *   export interface ButtonProps { ... }
 *   export const CONSTANT = "value";
 *   export function helper() { ... }
 */
const indexExportsOnly = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");
        const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename)
            || /^index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

        if (!isIndexFile) return {};

        // Determine if this is a subfolder index inside a module folder
        // e.g., views/assessment/index.tsx (depth >= 2 from module folder) = subfolder index
        // vs views/index.ts (depth == 1 from module folder) = root barrel
        const moduleFolders = [
            "actions", "apis", "assets", "atoms", "components", "config", "configs",
            "constants", "contexts", "data", "enums", "helpers", "hooks", "interfaces",
            "layouts", "lib", "middlewares", "pages", "providers", "reducers", "redux",
            "requests", "routes", "schemas", "services", "store", "strings", "styles",
            "theme", "themes", "thunks", "types", "ui", "utils", "utilities", "views",
        ];
        const parts = normalizedFilename.split("/");
        const indexPos = parts.length - 1;
        let isSubfolderIndex = false;

        for (let i = 0; i < indexPos; i++) {
            if (moduleFolders.includes(parts[i])) {
                if (indexPos - i >= 2) isSubfolderIndex = true;

                break;
            }
        }

        // Helper to check if a node is an import or re-export (no inline declarations)
        const isImportOrReexportHandler = (node) => {
            const { type } = node;

            if (type === "ImportDeclaration") return true;

            if (type === "ExportNamedDeclaration") return !node.declaration;

            if (type === "ExportDefaultDeclaration") {
                return node.declaration && node.declaration.type === "Identifier";
            }

            if (type === "ExportAllDeclaration") return true;

            return false;
        };

        // Helper to check if a node contains actual code (declarations, logic)
        const hasCodeDeclarationHandler = (node) => {
            const { type } = node;

            if (type === "VariableDeclaration" || type === "FunctionDeclaration" || type === "ClassDeclaration") return true;

            if (type === "ExportNamedDeclaration" && node.declaration) return true;

            if (type === "ExportDefaultDeclaration") {
                return node.declaration && node.declaration.type !== "Identifier";
            }

            return false;
        };

        // Get a friendly description of what the disallowed node is
        const getNodeDescriptionHandler = (node) => {
            switch (node.type) {
                case "TSTypeAliasDeclaration":
                    return "Type definition";
                case "TSInterfaceDeclaration":
                    return "Interface definition";
                case "TSEnumDeclaration":
                    return "Enum definition";
                case "VariableDeclaration":
                    return "Variable declaration";
                case "FunctionDeclaration":
                    return "Function declaration";
                case "ClassDeclaration":
                    return "Class declaration";
                case "ExportNamedDeclaration":
                    if (node.declaration) return getNodeDescriptionHandler(node.declaration);

                    return "Export with inline declaration";
                case "ExportDefaultDeclaration":
                    return "Default export with inline definition";
                default:
                    return "Code";
            }
        };

        return {
            Program(programNode) {
                if (isSubfolderIndex) {
                    // Subfolder index (e.g., views/assessment/index.tsx):
                    // Must contain component code — must NOT be a barrel (re-exports only)
                    // Only one barrel per module (the root index)
                    const hasCode = programNode.body.some((node) => hasCodeDeclarationHandler(node));

                    if (!hasCode) {
                        const subfolder = parts[indexPos - 1];

                        context.report({
                            message: `Subfolder index file "${subfolder}/index" should contain component code, not just re-exports. Only the module root index file should be a barrel for imports and re-exports.`,
                            node: programNode,
                        });
                    }

                    return;
                }

                // Root module index (e.g., views/index.ts):
                // Must be barrel only — no code declarations allowed
                for (const node of programNode.body) {
                    if (!isImportOrReexportHandler(node)) {
                        const description = getNodeDescriptionHandler(node);

                        context.report({
                            message: `${description} should not be in index files. Index files should only contain imports and re-exports. Move this to a separate file.`,
                            node,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce index files as barrels (re-exports only) at module root, and as component entry points (with code) in subfolders" },
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Inline Export Declaration
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   In non-index files, enforce inline export declarations instead
 *   of declaring variables/functions separately and then exporting
 *   them with a grouped export statement at the end.
 *
 *   This does NOT apply to index files (which use barrel re-exports).
 *
 * ✓ Good:
 *   export const strings = { ... };
 *
 *   export const buttonTypeData = { button: "button" };
 *
 *   export const submitHandler = () => { ... };
 *
 * ✗ Bad:
 *   const strings = { ... };
 *   export { strings };
 *
 * ✗ Bad:
 *   const foo = 1;
 *   const bar = 2;
 *   export { foo, bar };
 *
 * Auto-fixable: Yes — adds "export" to each declaration and removes
 * the grouped export statement.
 */
const inlineExportDeclaration = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");
        const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename)
            || /^index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

        // Only apply to non-index files
        if (isIndexFile) return {};

        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Program(programNode) {
                // Find all grouped export statements: export { a, b, c };
                // These have specifiers but no source (not re-exports) and no declaration
                const groupedExports = programNode.body.filter(
                    (node) => node.type === "ExportNamedDeclaration"
                        && !node.source
                        && !node.declaration
                        && node.specifiers.length > 0,
                );

                if (groupedExports.length === 0) return;

                // Build a map of all top-level declarations: name → node
                const declarationMap = new Map();

                programNode.body.forEach((node) => {
                    if (node.type === "VariableDeclaration") {
                        node.declarations.forEach((decl) => {
                            if (decl.id && decl.id.type === "Identifier") {
                                declarationMap.set(decl.id.name, { declarationNode: node, kind: node.kind });
                            }
                        });
                    } else if (node.type === "FunctionDeclaration" && node.id) {
                        declarationMap.set(node.id.name, { declarationNode: node, kind: "function" });
                    } else if (node.type === "ClassDeclaration" && node.id) {
                        declarationMap.set(node.id.name, { declarationNode: node, kind: "class" });
                    }
                });

                groupedExports.forEach((exportNode) => {
                    // Skip if any specifier has an alias (export { a as b })
                    const hasAlias = exportNode.specifiers.some(
                        (spec) => spec.local.name !== spec.exported.name,
                    );

                    if (hasAlias) return;

                    // Check all specifiers have matching declarations
                    const allFound = exportNode.specifiers.every(
                        (spec) => declarationMap.has(spec.local.name),
                    );

                    if (!allFound) return;

                    // Check if any declaration is already exported (would cause duplicate)
                    const anyAlreadyExported = exportNode.specifiers.some((spec) => {
                        const info = declarationMap.get(spec.local.name);
                        const declNode = info.declarationNode;
                        const parent = declNode.parent;

                        // Check if declaration is inside an ExportNamedDeclaration
                        if (parent && parent.type === "ExportNamedDeclaration") return true;

                        // Check source text starts with "export"
                        const declText = sourceCode.getText(declNode);

                        return declText.startsWith("export ");
                    });

                    if (anyAlreadyExported) return;

                    context.report({
                        fix(fixer) {
                            const fixes = [];

                            // Add "export " before each declaration
                            exportNode.specifiers.forEach((spec) => {
                                const info = declarationMap.get(spec.local.name);
                                const declNode = info.declarationNode;

                                fixes.push(fixer.insertTextBefore(declNode, "export "));
                            });

                            // Remove the grouped export statement and any preceding blank line
                            const tokenBefore = sourceCode.getTokenBefore(exportNode, { includeComments: true });

                            if (tokenBefore) {
                                fixes.push(fixer.removeRange([tokenBefore.range[1], exportNode.range[1]]));
                            } else {
                                fixes.push(fixer.remove(exportNode));
                            }

                            return fixes;
                        },
                        message: "Use inline export declarations (export const x = ...) instead of grouped export statements (export { x }).",
                        node: exportNode,
                    });
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce inline export declarations instead of grouped export statements in non-index files" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Children On New Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When a JSX element has multiple children, each child should
 *   be on its own line with proper indentation.
 *
 * ✓ Good:
 *   <Container>
 *       <Header />
 *       <Content />
 *       <Footer />
 *   </Container>
 *
 * ✗ Bad:
 *   <Container><Header /><Content />
 *       <Footer /></Container>
 */
const jsxChildrenOnNewLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if an argument is simple
        const isSimpleArgHandler = (node) => {
            if (!node) return false;
            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            return false;
        };

        // Check if expression is simple (identifier, literal, member expression chain, or simple function call)
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return true;

            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;

            // Handle ChainExpression (optional chaining like user?.name)
            if (expr.type === "ChainExpression") {
                return isSimpleExpressionHandler(expr.expression);
            }

            if (expr.type === "MemberExpression") {
                // Allow nested member expressions like row.original.currency or row[field]
                let current = expr;

                while (current.type === "MemberExpression") {
                    // Allow computed access only if property is simple (identifier or literal)
                    if (current.computed) {
                        if (current.property.type !== "Identifier" && current.property.type !== "Literal") {
                            return false;
                        }
                    } else if (current.property.type !== "Identifier") {
                        return false;
                    }

                    current = current.object;
                }

                // Handle ChainExpression at the end of the chain
                if (current.type === "ChainExpression") {
                    return isSimpleExpressionHandler(current.expression);
                }

                return current.type === "Identifier";
            }

            // Allow simple function calls with 0-1 simple arguments
            if (expr.type === "CallExpression") {
                const { callee } = expr;
                const isSimpleCallee = callee.type === "Identifier" ||
                    (callee.type === "MemberExpression" &&
                     callee.object.type === "Identifier" &&
                     callee.property.type === "Identifier");

                if (!isSimpleCallee) return false;

                if (expr.arguments.length === 0) return true;
                if (expr.arguments.length === 1 && isSimpleArgHandler(expr.arguments[0])) return true;

                return false;
            }

            // Allow simple LogicalExpression (2 operands with simple left/right)
            if (expr.type === "LogicalExpression") {
                // Count operands - if more than 2, not simple
                const countOperands = (n) => {
                    if (n.type === "LogicalExpression") {
                        return countOperands(n.left) + countOperands(n.right);
                    }

                    return 1;
                };

                if (countOperands(expr) > 2) return false;

                // Check if left and right are simple
                const isSimpleSide = (n) => {
                    if (n.type === "Identifier") return true;
                    if (n.type === "Literal") return true;
                    if (n.type === "MemberExpression") return isSimpleExpressionHandler(n);
                    if (n.type === "ChainExpression" && n.expression) return isSimpleSide(n.expression);

                    return false;
                };

                return isSimpleSide(expr.left) && isSimpleSide(expr.right);
            }

            return false;
        };

        // Check if child is simple (text or simple expression like {variable})
        const isSimpleChildHandler = (child) => {
            if (child.type === "JSXText") return true;
            if (child.type === "JSXExpressionContainer") {
                return isSimpleExpressionHandler(child.expression);
            }

            return false;
        };

        const checkJSXChildrenHandler = (node, openingTag, closingTag) => {
            const { children } = node;

            // Skip self-closing elements
            if (!closingTag) return;

            // Filter out whitespace-only text children
            const significantChildren = children.filter((child) => {
                if (child.type === "JSXText") {
                    return child.value.trim() !== "";
                }

                return true;
            });

            if (significantChildren.length === 0) return;

            // Allow elements that are entirely on a single line with only simple children (text or {variable})
            const elementIsOnSingleLine = openingTag.loc.start.line === closingTag.loc.end.line;
            const hasOnlySimpleChildren = significantChildren.every(isSimpleChildHandler);

            if (elementIsOnSingleLine && hasOnlySimpleChildren) {
                // Entire element on one line with only simple children - OK
                return;
            }

            // Allow simple inline elements with single simple child
            const hasSingleSimpleChild = significantChildren.length === 1 && isSimpleChildHandler(significantChildren[0]);

            if (hasSingleSimpleChild) {
                // This is a simple inline element - don't require new lines
                return;
            }

            const firstChild = significantChildren[0];
            const lastChild = significantChildren[significantChildren.length - 1];
            const childIndent = " ".repeat(openingTag.loc.start.column + 4);
            const closingIndent = " ".repeat(openingTag.loc.start.column);

            // Check if first child is on same line as opening tag
            if (openingTag.loc.end.line === firstChild.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openingTag.range[1], firstChild.range[0]],
                        "\n" + childIndent,
                    ),
                    message: "JSX child should be on its own line",
                    node: firstChild,
                });
            }

            // Check if closing tag is on same line as last child
            // For JSXText, check if the actual content (trimmed) ends on same line
            if (closingTag.loc.start.line === lastChild.loc.end.line) {
                // If last child is text with only whitespace at the end, check the content line
                if (lastChild.type === "JSXText") {
                    const textContent = lastChild.value;
                    const trimmedEnd = textContent.trimEnd();

                    // If there's a newline in the trimmed-off part, closing tag is already on own line
                    if (textContent.slice(trimmedEnd.length).includes("\n")) {
                        return;
                    }
                }

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastChild.range[1], closingTag.range[0]],
                        "\n" + closingIndent,
                    ),
                    message: "Closing tag should be on its own line",
                    node: closingTag,
                });
            }
        };

        const checkJSXElementHandler = (node) => {
            checkJSXChildrenHandler(node, node.openingElement, node.closingElement);
        };

        const checkJSXFragmentHandler = (node) => {
            checkJSXChildrenHandler(node, node.openingFragment, node.closingFragment);
        };

        return {
            JSXElement: checkJSXElementHandler,
            JSXFragment: checkJSXFragmentHandler,
        };
    },
    meta: {
        docs: { description: "Enforce JSX children on separate lines from parent tags" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Closing Bracket Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No space before > or /> in JSX tags. The closing bracket
 *   should be directly after the last attribute or tag name.
 *
 * ✓ Good:
 *   <Button />
 *   <Button className="primary">
 *
 * ✗ Bad:
 *   <Button / >
 *   <Button className="primary" >
 */
const jsxClosingBracketSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkOpeningElementHandler = (node) => {
            const lastToken = sourceCode.getLastToken(node);

            if (!lastToken) return;

            // Check for > or />
            if (lastToken.value !== ">" && lastToken.value !== "/>") return;

            const tokenBefore = sourceCode.getTokenBefore(lastToken);

            if (!tokenBefore) return;

            // Check if there's whitespace between the last attribute/name and >
            if (tokenBefore.loc.end.line === lastToken.loc.start.line) {
                // Same line - check for space
                if (lastToken.range[0] - tokenBefore.range[1] > 0) {
                    const textBetween = sourceCode.text.slice(
                        tokenBefore.range[1],
                        lastToken.range[0],
                    );

                    if (/^\s+$/.test(textBetween)) {
                        context.report({
                            fix: (fixer) => fixer.removeRange([tokenBefore.range[1], lastToken.range[0]]),
                            message: `No space allowed before '${lastToken.value}' in JSX tag`,
                            node: lastToken,
                        });
                    }
                }
            }
        };

        return {
            JSXOpeningElement: checkOpeningElementHandler,
            JSXClosingElement: checkOpeningElementHandler,
        };
    },
    meta: {
        docs: { description: "No space before > or /> in JSX tags" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Element Child New Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX element children (nested JSX elements) must be on their
 *   own line, not on the same line as the opening tag.
 *
 * ✓ Good:
 *   <Button>
 *       <Icon />
 *   </Button>
 *
 * ✗ Bad:
 *   <Button><Icon /></Button>
 */
const jsxElementChildNewLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if an argument is simple
        const isSimpleArgHandler = (node) => {
            if (!node) return false;
            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            return false;
        };

        // Check if expression is simple (identifier, literal, member expression chain, or simple function call)
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return true;

            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;

            // Handle ChainExpression (optional chaining like user?.name)
            if (expr.type === "ChainExpression") {
                return isSimpleExpressionHandler(expr.expression);
            }

            if (expr.type === "MemberExpression") {
                // Allow nested member expressions like row.original.currency or row[field]
                let current = expr;

                while (current.type === "MemberExpression") {
                    // Allow computed access only if property is simple (identifier or literal)
                    if (current.computed) {
                        if (current.property.type !== "Identifier" && current.property.type !== "Literal") {
                            return false;
                        }
                    } else if (current.property.type !== "Identifier") {
                        return false;
                    }

                    current = current.object;
                }

                // Handle ChainExpression at the end of the chain
                if (current.type === "ChainExpression") {
                    return isSimpleExpressionHandler(current.expression);
                }

                return current.type === "Identifier";
            }

            // Allow simple function calls with 0-1 simple arguments
            if (expr.type === "CallExpression") {
                const { callee } = expr;
                const isSimpleCallee = callee.type === "Identifier" ||
                    (callee.type === "MemberExpression" &&
                     callee.object.type === "Identifier" &&
                     callee.property.type === "Identifier");

                if (!isSimpleCallee) return false;

                if (expr.arguments.length === 0) return true;
                if (expr.arguments.length === 1 && isSimpleArgHandler(expr.arguments[0])) return true;

                return false;
            }

            // Allow simple LogicalExpression (2 operands with simple left/right)
            if (expr.type === "LogicalExpression") {
                // Count operands - if more than 2, not simple
                const countOperands = (n) => {
                    if (n.type === "LogicalExpression") {
                        return countOperands(n.left) + countOperands(n.right);
                    }

                    return 1;
                };

                if (countOperands(expr) > 2) return false;

                // Check if left and right are simple
                const isSimpleSide = (n) => {
                    if (n.type === "Identifier") return true;
                    if (n.type === "Literal") return true;
                    if (n.type === "MemberExpression") return isSimpleExpressionHandler(n);
                    if (n.type === "ChainExpression" && n.expression) return isSimpleSide(n.expression);

                    return false;
                };

                return isSimpleSide(expr.left) && isSimpleSide(expr.right);
            }

            return false;
        };

        // Check if child is a complex JSX child (not simple text or expression)
        const isComplexJsxChildHandler = (child) => {
            if (child.type === "JSXElement" || child.type === "JSXFragment") {
                return true;
            }

            // JSXExpressionContainer with complex expression (not simple variable)
            if (child.type === "JSXExpressionContainer") {
                return !isSimpleExpressionHandler(child.expression);
            }

            return false;
        };

        return {
            JSXElement(node) {
                const openingTag = node.openingElement;
                const closingTag = node.closingElement;

                // Skip self-closing elements
                if (!closingTag) return;

                const { children } = node;

                // Find complex JSX element children (not text, not simple expressions)
                const jsxChildren = children.filter(isComplexJsxChildHandler);

                if (jsxChildren.length === 0) return;

                // Get the indent for children
                const childIndent = " ".repeat(openingTag.loc.start.column + 4);
                const closingIndent = " ".repeat(openingTag.loc.start.column);

                jsxChildren.forEach((child) => {
                    // Check if JSX child is on same line as opening tag
                    if (openingTag.loc.end.line === child.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openingTag.range[1], child.range[0]],
                                "\n" + childIndent,
                            ),
                            message: "JSX element child should be on its own line",
                            node: child,
                        });
                    }
                });

                // Check if closing tag is on same line as last JSX child
                const lastJsxChild = jsxChildren[jsxChildren.length - 1];

                if (lastJsxChild && closingTag.loc.start.line === lastJsxChild.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastJsxChild.range[1], closingTag.range[0]],
                            "\n" + closingIndent,
                        ),
                        message: "Closing tag should be on its own line after JSX children",
                        node: closingTag,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "JSX children that are JSX elements must be on new lines" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Logical Expression Simplify
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simplify JSX logical expressions by removing unnecessary
 *   parentheses around conditions and JSX elements.
 *
 * ✓ Good:
 *   {condition && <Component />}
 *   {isVisible && <Modal />}
 *
 * ✗ Bad:
 *   {(condition) && (<Component />)}
 *   {(isVisible) && (<Modal />)}
 */
const jsxLogicalExpressionSimplify = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if a node is wrapped in parentheses
        const isWrappedInParensHandler = (exprNode) => {
            const tokenBefore = sourceCode.getTokenBefore(exprNode);
            const tokenAfter = sourceCode.getTokenAfter(exprNode);

            return tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        // Get the text including surrounding parentheses if present
        const getTextWithParensHandler = (exprNode) => {
            const text = sourceCode.getText(exprNode);

            if (isWrappedInParensHandler(exprNode)) {
                return `(${text})`;
            }

            return text;
        };

        const checkLogicalExpressionHandler = (node) => {
            if (node.operator !== "&&") return;

            const {
                left,
                right,
            } = node;

            // Right side must be JSX
            if (right.type !== "JSXElement" && right.type !== "JSXFragment") return;

            // Get base indentation
            const baseIndent = sourceCode.lines[node.loc.start.line - 1].match(/^\s*/)[0];
            const contentIndent = baseIndent + "    ";

            // Check if right side is single-line
            const rightIsSimple = right.loc.start.line === right.loc.end.line;

            // Get text preserving parentheses
            const leftText = getTextWithParensHandler(left);
            const rightText = sourceCode.getText(right);

            // Case 1: Both simple - entire expression on one line
            if (rightIsSimple && left.loc.start.line === left.loc.end.line) {
                if (node.loc.start.line !== node.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node,
                            `${leftText} && ${rightText}`,
                        ),
                        message: "Simple logical expression with single-line JSX should be on one line",
                        node,
                    });
                }

                return;
            }

            // Case 2: Complex JSX - check formatting
            // Format should be: {condition && (
            //     <Complex />
            // )}
            if (!rightIsSimple) {
                const andToken = sourceCode.getTokenAfter(
                    left,
                    (token) => token.value === "&&",
                );

                if (!andToken) return;

                const tokenAfterAnd = sourceCode.getTokenAfter(andToken);

                // && ( should be on same line as condition
                if (tokenAfterAnd && tokenAfterAnd.value === "(") {
                    // Check for empty lines after (
                    const jsxStart = sourceCode.getTokenAfter(tokenAfterAnd);

                    if (jsxStart && jsxStart.loc.start.line - tokenAfterAnd.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterAnd.range[1], jsxStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "No empty lines after '(' in logical expression",
                            node: jsxStart,
                        });
                    }

                    // Check for empty lines before )
                    const closeParen = sourceCode.getTokenAfter(right);

                    if (closeParen && closeParen.value === ")") {
                        if (closeParen.loc.start.line - right.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [right.range[1], closeParen.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "No empty lines before ')' in logical expression",
                                node: closeParen,
                            });
                        }
                    }
                }
            }
        };

        return { LogicalExpression: checkLogicalExpressionHandler };
    },
    meta: {
        docs: { description: "Simplify logical expressions in JSX when right side is single-line, and check formatting for complex JSX" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Parentheses Position
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX return parentheses should be on the same line as the arrow
 *   or return keyword, not on a new line.
 *
 * ✓ Good:
 *   const Component = () => (
 *       <div>content</div>
 *   );
 *   return (
 *       <div>content</div>
 *   );
 *
 * ✗ Bad:
 *   const Component = () =>
 *       (
 *           <div>content</div>
 *       );
 *   return
 *       (
 *           <div>content</div>
 *       );
 */
const jsxParenthesesPosition = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkArrowFunctionHandler = (node) => {
            // Only check arrow functions that return JSX wrapped in parentheses
            if (node.body.type !== "JSXElement" && node.body.type !== "JSXFragment") return;

            const jsxElement = node.body;
            const arrowToken = sourceCode.getTokenBefore(node.body, (t) => t.value === "=>");
            const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

            // Check if there's a parenthesis after arrow
            if (!tokenAfterArrow || tokenAfterArrow.value !== "(") return;

            const openParen = tokenAfterArrow;

            // Check if arrow and ( are on same line
            if (arrowToken.loc.end.line !== openParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [arrowToken.range[1], openParen.range[1]],
                        " (",
                    ),
                    message: "Opening parenthesis should be on the same line as arrow",
                    node: openParen,
                });
            }

            // Check if JSX starts on same line as ( (should be on new line)
            if (openParen.loc.end.line === jsxElement.loc.start.line) {
                const jsxIndent = " ".repeat(openParen.loc.start.column + 4);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "JSX should start on a new line after opening parenthesis",
                    node: jsxElement,
                });
            } else if (jsxElement.loc.start.line - openParen.loc.end.line > 1) {
                // No empty lines after (
                const jsxIndent = " ".repeat(jsxElement.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "No empty line after opening parenthesis",
                    node: jsxElement,
                });
            }

            const closeParen = sourceCode.getTokenAfter(jsxElement);

            if (closeParen && closeParen.value === ")") {
                // No empty lines before )
                if (closeParen.loc.start.line - jsxElement.loc.end.line > 1) {
                    const closeIndent = " ".repeat(closeParen.loc.start.column);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [jsxElement.range[1], closeParen.range[0]],
                            "\n" + closeIndent,
                        ),
                        message: "No empty line before closing parenthesis",
                        node: closeParen,
                    });
                }

                // Check if )} are together
                const closeBrace = sourceCode.getTokenAfter(closeParen);

                if (closeBrace && closeBrace.value === "}") {
                    const textBetween = sourceCode.text.slice(
                        closeParen.range[1],
                        closeBrace.range[0],
                    );

                    if (textBetween.includes("\n") || textBetween.includes(" ")) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeParen.range[1], closeBrace.range[0]],
                                "",
                            ),
                            message: "Closing parenthesis and brace should be together",
                            node: closeBrace,
                        });
                    }
                }
            }
        };

        const checkPropertyHandler = (node) => {
            if (!node.value) return;
            if (node.value.type !== "JSXElement" && node.value.type !== "JSXFragment") return;

            // Check if value is wrapped in parentheses
            const colonToken = sourceCode.getTokenAfter(node.key, (t) => t.value === ":");
            const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

            if (!tokenAfterColon || tokenAfterColon.value !== "(") return;

            const openParen = tokenAfterColon;
            const jsxElement = node.value;

            // Check if colon and ( are on same line
            if (colonToken.loc.end.line !== openParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [colonToken.range[1], openParen.range[1]],
                        " (",
                    ),
                    message: "Opening parenthesis should be on the same line as colon with a space",
                    node: openParen,
                });
            }

            // Check if JSX starts on same line as (
            if (openParen.loc.end.line === jsxElement.loc.start.line) {
                const jsxIndent = " ".repeat(node.key.loc.start.column + 4);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "JSX should start on a new line after opening parenthesis",
                    node: jsxElement,
                });
            } else if (jsxElement.loc.start.line - openParen.loc.end.line > 1) {
                const jsxIndent = " ".repeat(jsxElement.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "No empty line after opening parenthesis",
                    node: jsxElement,
                });
            }

            const closeParen = sourceCode.getTokenAfter(jsxElement);

            if (closeParen && closeParen.value === ")") {
                if (closeParen.loc.start.line - jsxElement.loc.end.line > 1) {
                    const closeIndent = " ".repeat(closeParen.loc.start.column);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [jsxElement.range[1], closeParen.range[0]],
                            "\n" + closeIndent,
                        ),
                        message: "No empty line before closing parenthesis",
                        node: closeParen,
                    });
                }
            }
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            Property: checkPropertyHandler,
        };
    },
    meta: {
        docs: { description: "Enforce opening parenthesis position for JSX in arrow functions and object properties" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Prop Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce camelCase naming for JSX props. Allows PascalCase for
 *   component reference props, and kebab-case for data-* and aria-*.
 *
 * ✓ Good:
 *   <Button onClick={handler} />
 *   <Input data-testid="input" />
 *   <Modal ContentComponent={Panel} />
 *
 * ✗ Bad:
 *   <Button on_click={handler} />
 *   <Input test_id="input" />
 */
const jsxPropNamingConvention = {
    create(context) {
        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        // Props that can be PascalCase because they reference components
        const componentPropNames = [
            "Icon",
            "Component",
            "FormComponent",
            "Layout",
            "Wrapper",
            "Container",
            "Provider",
            "Element",
            "Trigger",
            "Content",
            "Header",
            "Footer",
            "Body",
            "Title",
            "Overlay",
            "Portal",
            "Root",
            "Item",
            "Label",
            "Input",
            "Button",
            "Action",
            "Slot",
        ];

        return {
            JSXAttribute(node) {
                // Skip spread attributes (handled as JSXSpreadAttribute, not JSXAttribute)
                if (!node.name) return;

                const propName = node.name.type === "JSXIdentifier"
                    ? node.name.name
                    : node.name.name?.name;

                if (!propName) return;

                // Allow data-* and aria-* attributes (kebab-case by HTML convention)
                if (propName.startsWith("data-") || propName.startsWith("aria-")) return;

                // Allow component reference props (PascalCase)
                if (componentPropNames.includes(propName)) return;

                // Allow props ending with common component suffixes
                const componentSuffixes = ["Icon", "Component", "Element", "Wrapper", "Container", "Layout", "Provider"];

                if (componentSuffixes.some((suffix) => propName.endsWith(suffix) && propName !== suffix)) {
                    return;
                }

                // Check if prop name is camelCase
                if (!camelCaseRegex.test(propName)) {
                    context.report({
                        message: `JSX prop "${propName}" should be camelCase`,
                        node: node.name,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce camelCase naming for JSX props, with exceptions for component references" },
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Prop Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces naming conventions for boolean and callback/method props:
 *   - Boolean props must start with: is, has, with, without (followed by capital letter)
 *   - Callback props must start with: on (followed by capital letter)
 *
 *   Applies to: interfaces, type aliases, inline types, and nested object types
 *   at any nesting level. Does NOT apply to JSX element attributes.
 *
 * Options:
 *   { booleanPrefixes: ["is", "has"] } - Replace default prefixes entirely
 *   { extendBooleanPrefixes: ["should", "can"] } - Add to default prefixes
 *   { allowPastVerbBoolean: false } - Allow past verb booleans (disabled, selected, checked, opened, etc.)
 *   { allowContinuousVerbBoolean: false } - Allow continuous verb booleans (loading, saving, closing, etc.)
 *   { callbackPrefix: "on" } - Required prefix for callbacks
 *   { allowActionSuffix: false } - Allow "xxxAction" pattern for callbacks
 *
 * ✓ Good:
 *   interface PropsInterface {
 *       isLoading: boolean,
 *       hasError: boolean,
 *       onClick: () => void,
 *       onSubmit: (data: Data) => void,
 *       config: {
 *           isEnabled: boolean,
 *           onToggle: () => void,
 *       },
 *   }
 *
 * ✗ Bad:
 *   interface PropsInterface {
 *       loading: boolean,      // Should be isLoading
 *       error: boolean,        // Should be hasError
 *       click: () => void,     // Should be onClick
 *       handleSubmit: () => void, // Should be onSubmit
 *       config: {
 *           enabled: boolean,  // Should be isEnabled (nested)
 *           toggle: () => void, // Should be onToggle (nested)
 *       },
 *   }
 *
 * ✓ Good (with allowPastVerbBoolean: true):
 *   interface PropsInterface {
 *       disabled: boolean,     // Past verb - allowed
 *       selected: boolean,     // Past verb - allowed
 *       checked: boolean,      // Past verb - allowed
 *   }
 *
 * ✓ Good (with allowContinuousVerbBoolean: true):
 *   interface PropsInterface {
 *       loading: boolean,      // Continuous verb - allowed
 *       saving: boolean,       // Continuous verb - allowed
 *       fetching: boolean,     // Continuous verb - allowed
 *   }
 */
const propNamingConvention = {
    create(context) {
        const options = context.options[0] || {};

        // Boolean prefixes handling (like module-index-exports pattern)
        const defaultBooleanPrefixes = ["is", "has", "with", "without"];
        const booleanPrefixes = options.booleanPrefixes || [
            ...defaultBooleanPrefixes,
            ...(options.extendBooleanPrefixes || []),
        ];

        const allowPastVerbBoolean = options.allowPastVerbBoolean || false;
        const allowContinuousVerbBoolean = options.allowContinuousVerbBoolean || false;
        const callbackPrefix = options.callbackPrefix || "on";
        const allowActionSuffix = options.allowActionSuffix || false;

        // Pattern to check if name starts with valid boolean prefix followed by capital letter
        const booleanPrefixPattern = new RegExp(`^(${booleanPrefixes.join("|")})[A-Z]`);

        // Pattern for callback prefix
        const callbackPrefixPattern = new RegExp(`^${callbackPrefix}[A-Z]`);

        // Pattern for past verb booleans (ends with -ed: disabled, selected, checked, opened, closed, etc.)
        const pastVerbPattern = /^[a-z]+ed$/;

        // Pattern for continuous verb booleans (ends with -ing: loading, saving, closing, etc.)
        const continuousVerbPattern = /^[a-z]+ing$/;

        // Words that suggest "has" prefix instead of "is"
        const hasKeywords = [
            "children", "content", "data", "error", "errors", "items",
            "permission", "permissions", "value", "values",
        ];

        // Convert name to appropriate boolean prefix
        const toBooleanNameHandler = (name) => {
            const lowerName = name.toLowerCase();
            const prefix = hasKeywords.some((k) => lowerName.includes(k)) ? "has" : "is";

            return prefix + name[0].toUpperCase() + name.slice(1);
        };

        // Convert name to callback format (add "on" prefix)
        const toCallbackNameHandler = (name) => {
            // Handle "handleXxx" pattern -> "onXxx"
            if (name.startsWith("handle") && name.length > 6) {
                const rest = name.slice(6);

                return callbackPrefix + rest[0].toUpperCase() + rest.slice(1);
            }

            // Handle "xxxHandler" pattern -> "onXxx"
            if (name.endsWith("Handler") && name.length > 7) {
                const rest = name.slice(0, -7);

                return callbackPrefix + rest[0].toUpperCase() + rest.slice(1);
            }

            // Simple case: just add "on" prefix
            return callbackPrefix + name[0].toUpperCase() + name.slice(1);
        };

        // Check if type annotation indicates boolean
        const isBooleanTypeHandler = (typeAnnotation) => {
            if (!typeAnnotation) return false;
            const type = typeAnnotation.typeAnnotation;

            if (!type) return false;
            if (type.type === "TSBooleanKeyword") return true;
            // Check for union with boolean (e.g., boolean | undefined)
            if (type.type === "TSUnionType") {
                return type.types.some((t) => t.type === "TSBooleanKeyword");
            }

            return false;
        };

        // React event handler type names
        const reactEventHandlerTypes = [
            "MouseEventHandler",
            "ChangeEventHandler",
            "FormEventHandler",
            "KeyboardEventHandler",
            "FocusEventHandler",
            "TouchEventHandler",
            "PointerEventHandler",
            "DragEventHandler",
            "WheelEventHandler",
            "AnimationEventHandler",
            "TransitionEventHandler",
            "ClipboardEventHandler",
            "CompositionEventHandler",
            "UIEventHandler",
            "ScrollEventHandler",
            "EventHandler",
        ];

        // Check if type annotation indicates function/callback
        const isCallbackTypeHandler = (typeAnnotation) => {
            if (!typeAnnotation) return false;
            const type = typeAnnotation.typeAnnotation;

            if (!type) return false;
            if (type.type === "TSFunctionType") return true;
            if (type.type === "TSTypeReference") {
                const typeName = type.typeName?.name;

                // Check for Function, VoidFunction, or React event handler types
                if (typeName === "Function" || typeName === "VoidFunction") return true;
                if (reactEventHandlerTypes.includes(typeName)) return true;
            }

            // Check for union with function (e.g., (() => void) | undefined)
            if (type.type === "TSUnionType") {
                return type.types.some((t) =>
                    t.type === "TSFunctionType" ||
                    (t.type === "TSTypeReference" && (
                        t.typeName?.name === "Function" ||
                        t.typeName?.name === "VoidFunction" ||
                        reactEventHandlerTypes.includes(t.typeName?.name)
                    )));
            }

            return false;
        };

        // Check if type annotation is a nested object type (TSTypeLiteral)
        const isNestedObjectTypeHandler = (typeAnnotation) => {
            if (!typeAnnotation) return false;
            const type = typeAnnotation.typeAnnotation;

            if (!type) return false;

            return type.type === "TSTypeLiteral";
        };

        // Check if name is a valid boolean prop name
        const isValidBooleanNameHandler = (name) => {
            // Starts with valid prefix
            if (booleanPrefixPattern.test(name)) return true;

            // Allow past verb booleans if option is enabled (disabled, selected, checked, etc.)
            if (allowPastVerbBoolean && pastVerbPattern.test(name)) return true;

            // Allow continuous verb booleans if option is enabled (loading, saving, etc.)
            if (allowContinuousVerbBoolean && continuousVerbPattern.test(name)) return true;

            return false;
        };

        // Check if name is a valid callback prop name
        const isValidCallbackNameHandler = (name) => {
            // Starts with "on" prefix
            if (callbackPrefixPattern.test(name)) return true;

            // Allow "xxxAction" suffix if option is enabled
            if (allowActionSuffix && name.endsWith("Action") && name.length > 6) return true;

            return false;
        };

        // Find the containing function for inline type annotations
        const findContainingFunctionHandler = (node) => {
            let current = node;

            while (current) {
                if (current.type === "ArrowFunctionExpression" ||
                    current.type === "FunctionExpression" ||
                    current.type === "FunctionDeclaration") {
                    return current;
                }

                current = current.parent;
            }

            return null;
        };

        // Find matching property in ObjectPattern (destructured params)
        const findDestructuredPropertyHandler = (funcNode, propName) => {
            if (!funcNode || !funcNode.params || funcNode.params.length === 0) return null;

            const firstParam = funcNode.params[0];

            if (firstParam.type !== "ObjectPattern") return null;

            // Find the property in the ObjectPattern
            for (const prop of firstParam.properties) {
                if (prop.type === "Property" && prop.key && prop.key.type === "Identifier") {
                    if (prop.key.name === propName) {
                        return prop;
                    }
                }
            }

            return null;
        };

        // Create fix that renames type annotation, destructured prop, and all references
        const createRenamingFixHandler = (fixer, member, propName, suggestedName) => {
            const fixes = [fixer.replaceText(member.key, suggestedName)];

            // Find the containing function
            const funcNode = findContainingFunctionHandler(member);

            if (!funcNode) return fixes;

            // Find the matching destructured property
            const destructuredProp = findDestructuredPropertyHandler(funcNode, propName);

            if (!destructuredProp) return fixes;

            // Get the value node (the actual variable being declared)
            const valueNode = destructuredProp.value || destructuredProp.key;

            if (!valueNode || valueNode.type !== "Identifier") return fixes;

            // If key and value are the same (shorthand: { copied }), we need to expand and rename
            // If different (renamed: { copied: isCopied }), just rename the value
            const isShorthand = destructuredProp.shorthand !== false &&
                destructuredProp.key === destructuredProp.value;

            if (isShorthand) {
                // Shorthand syntax: { copied } -> { copied: isCopied }
                // We need to keep the key (for the type match) and add the renamed value
                fixes.push(fixer.replaceText(destructuredProp, `${propName}: ${suggestedName}`));
            } else {
                // Already renamed syntax or explicit: just update the value
                fixes.push(fixer.replaceText(valueNode, suggestedName));
            }

            // Find all references to the variable and rename them
            const scope = context.sourceCode
                ? context.sourceCode.getScope(funcNode)
                : context.getScope();

            // Find the variable in the scope
            const findVariableHandler = (s, name) => {
                const v = s.variables.find((variable) => variable.name === name);

                if (v) return v;
                if (s.upper) return findVariableHandler(s.upper, name);

                return null;
            };

            const variable = findVariableHandler(scope, propName);

            if (variable) {
                const fixedRanges = new Set();

                variable.references.forEach((ref) => {
                    // Skip the definition itself
                    if (ref.identifier === valueNode) return;
                    // Skip if already fixed
                    const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                    if (fixedRanges.has(rangeKey)) return;
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(ref.identifier, suggestedName));
                });
            }

            return fixes;
        };

        // Check a property signature (interface/type member) - recursive for nested types
        const checkPropertySignatureHandler = (member) => {
            if (member.type !== "TSPropertySignature") return;
            if (!member.key || member.key.type !== "Identifier") return;

            const propName = member.key.name;

            // Skip private properties (starting with _)
            if (propName.startsWith("_")) return;

            // Check for nested object types and recursively check their members
            if (isNestedObjectTypeHandler(member.typeAnnotation)) {
                const nestedType = member.typeAnnotation.typeAnnotation;

                if (nestedType && nestedType.members) {
                    nestedType.members.forEach(checkPropertySignatureHandler);
                }

                return;
            }

            // Check boolean props
            if (isBooleanTypeHandler(member.typeAnnotation)) {
                if (!isValidBooleanNameHandler(propName)) {
                    const suggestedName = toBooleanNameHandler(propName);

                    context.report({
                        fix: (fixer) => createRenamingFixHandler(fixer, member, propName, suggestedName),
                        message: `Boolean prop "${propName}" should start with a valid prefix (${booleanPrefixes.join(", ")}). Use "${suggestedName}" instead.`,
                        node: member.key,
                    });
                }

                return;
            }

            // Check callback props
            if (isCallbackTypeHandler(member.typeAnnotation)) {
                if (!isValidCallbackNameHandler(propName)) {
                    const suggestedName = toCallbackNameHandler(propName);

                    context.report({
                        fix: (fixer) => createRenamingFixHandler(fixer, member, propName, suggestedName),
                        message: `Callback prop "${propName}" should start with "${callbackPrefix}" prefix. Use "${suggestedName}" instead.`,
                        node: member.key,
                    });
                }
            }
        };

        // Check members of a type literal (inline types, type aliases)
        const checkTypeLiteralHandler = (node) => {
            if (!node.members) return;
            node.members.forEach(checkPropertySignatureHandler);
        };

        return {
            // Interface declarations
            TSInterfaceDeclaration(node) {
                if (!node.body || !node.body.body) return;
                node.body.body.forEach(checkPropertySignatureHandler);
            },

            // Type alias declarations with object type
            TSTypeAliasDeclaration(node) {
                if (node.typeAnnotation?.type === "TSTypeLiteral") {
                    checkTypeLiteralHandler(node.typeAnnotation);
                }
            },

            // Inline type literals (e.g., in function parameters)
            TSTypeLiteral(node) {
                // Skip if already handled by TSTypeAliasDeclaration
                if (node.parent?.type === "TSTypeAliasDeclaration") return;
                checkTypeLiteralHandler(node);
            },
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions: boolean props must start with is/has/with/without, callback props must start with on" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    allowActionSuffix: {
                        default: false,
                        description: "Allow 'xxxAction' pattern for callback props (e.g., submitAction, copyAction)",
                        type: "boolean",
                    },
                    allowContinuousVerbBoolean: {
                        default: false,
                        description: "Allow continuous verb boolean props without prefix (e.g., loading, saving, fetching, closing)",
                        type: "boolean",
                    },
                    allowPastVerbBoolean: {
                        default: false,
                        description: "Allow past verb boolean props without prefix (e.g., disabled, selected, checked, opened)",
                        type: "boolean",
                    },
                    booleanPrefixes: {
                        description: "Replace default boolean prefixes entirely. If not provided, defaults are used with extendBooleanPrefixes",
                        items: { type: "string" },
                        type: "array",
                    },
                    callbackPrefix: {
                        default: "on",
                        description: "Required prefix for callback props",
                        type: "string",
                    },
                    extendBooleanPrefixes: {
                        default: [],
                        description: "Add additional prefixes to the defaults (is, has, with, without)",
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Simple Element On One Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simple JSX elements with only a single text or expression
 *   child should be collapsed onto a single line.
 *
 * ✓ Good:
 *   <Button>{buttonLinkText}</Button>
 *   <Title>Hello</Title>
 *
 * ✗ Bad:
 *   <Button>
 *       {buttonLinkText}
 *   </Button>
 */
const jsxSimpleElementOneLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if an argument is simple (identifier, literal, or simple member expression)
        const isSimpleArgHandler = (node) => {
            if (!node) return false;
            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            return false;
        };

        // Check if an expression is simple (identifier, literal, member expression, or simple function call)
        const isSimpleExpressionHandler = (node) => {
            if (!node) return false;

            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                // Allow simple member expressions like obj.prop
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            // Allow simple function calls with 0-1 simple arguments
            if (node.type === "CallExpression") {
                // Check callee is simple (identifier or member expression)
                const { callee } = node;
                const isSimpleCallee = callee.type === "Identifier" ||
                    (callee.type === "MemberExpression" &&
                     callee.object.type === "Identifier" &&
                     callee.property.type === "Identifier");

                if (!isSimpleCallee) return false;

                // Allow 0-1 arguments, and the argument must be simple
                if (node.arguments.length === 0) return true;
                if (node.arguments.length === 1 && isSimpleArgHandler(node.arguments[0])) return true;

                return false;
            }

            return false;
        };

        // Check if child is simple (text or simple expression)
        const isSimpleChildHandler = (child) => {
            if (child.type === "JSXText") {
                return child.value.trim().length > 0;
            }

            if (child.type === "JSXExpressionContainer") {
                return isSimpleExpressionHandler(child.expression);
            }

            return false;
        };

        return {
            JSXElement(node) {
                const openingTag = node.openingElement;
                const closingTag = node.closingElement;

                // Skip self-closing elements
                if (!closingTag) return;

                // Check if element is multiline
                if (openingTag.loc.end.line === closingTag.loc.start.line) return;

                const { children } = node;

                // Filter out whitespace-only text children
                const significantChildren = children.filter((child) => {
                    if (child.type === "JSXText") {
                        return child.value.trim() !== "";
                    }

                    return true;
                });

                // Must have exactly one simple child
                if (significantChildren.length !== 1) return;

                const child = significantChildren[0];

                if (!isSimpleChildHandler(child)) return;

                // Check if opening tag itself is simple (single line, not too many attributes)
                if (openingTag.loc.start.line !== openingTag.loc.end.line) return;

                // Get the text content
                const openingText = sourceCode.getText(openingTag);
                const childText = child.type === "JSXText" ? child.value.trim() : sourceCode.getText(child);
                const closingText = sourceCode.getText(closingTag);

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node,
                        `${openingText}${childText}${closingText}`,
                    ),
                    message: "Simple JSX element with single text/expression child should be on one line",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Simple JSX elements with only text/expression children should be on one line" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: className Dynamic At End
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce that dynamic expressions in className template literals
 *   are placed at the end, after all static class names.
 *   Uses smart detection: triggers for className attributes, variables
 *   with "class" in name, or any string that looks like Tailwind classes.
 *
 * ✓ Good:
 *   className={`flex items-center ${className}`}
 *   const buttonClasses = `flex items-center ${className}`;
 *
 * ✗ Bad:
 *   className={`${className} flex items-center`}
 *   const buttonClasses = `${className} flex items-center`;
 */
const classNameDynamicAtEnd = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Get static content from template literal for detection
        const getStaticContent = (templateLiteral) => templateLiteral.quasis
            .map((q) => q.value.raw)
            .join(" ")
            .trim();

        // Check and report template literal with dynamic expressions not at end
        const checkTemplateLiteralHandler = (templateLiteral, reportNode, varName) => {
            const { expressions, quasis } = templateLiteral;

            if (expressions.length === 0) return;

            // Smart detection: check if this looks like class content
            const staticContent = getStaticContent(templateLiteral);

            if (!isClassRelated(varName, staticContent)) return;

            // Check if there are static classes after any expression
            for (let i = 0; i < expressions.length; i += 1) {
                const quasiAfter = quasis[i + 1];

                if (quasiAfter) {
                    const textAfter = quasiAfter.value.raw.trim();

                    if (textAfter.length > 0) {
                        context.report({
                            fix: (fixer) => {
                                const staticClasses = [];
                                const dynamicExprs = [];

                                quasis.forEach((quasi) => {
                                    const classes = quasi.value.raw.trim();

                                    if (classes) staticClasses.push(classes);
                                });

                                expressions.forEach((expr) => {
                                    dynamicExprs.push(sourceCode.getText(expr));
                                });

                                // Sort static classes using Tailwind order
                                const sortedStatic = sortTailwindClasses(staticClasses.join(" "));
                                const dynamicPart = dynamicExprs.map((expr) => `\${${expr}}`).join(" ");
                                const newValue = sortedStatic
                                    ? `\`${sortedStatic} ${dynamicPart}\``
                                    : `\`${dynamicPart}\``;

                                return fixer.replaceText(templateLiteral, newValue);
                            },
                            message: "Dynamic expressions (${...}) must be at the end of class strings. Use: `static-class ${dynamic}` not `${dynamic} static-class`",
                            node: reportNode || expressions[i],
                        });

                        return;
                    }
                }
            }
        };

        return {
            // Check className JSX attribute
            JSXAttribute(node) {
                if (!node.name || node.name.name !== "className") return;

                if (node.value
                    && node.value.type === "JSXExpressionContainer"
                    && node.value.expression.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.value.expression, null, "className");
                }
            },

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.init, node.init, node.id.name);
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce dynamic expressions in className are placed at the end" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: className No Extra Spaces
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Disallow multiple consecutive spaces and leading/trailing spaces
 *   in className values. Uses smart detection: checks objects/returns
 *   if variable name contains "class" OR if values look like Tailwind.
 *
 * ✓ Good:
 *   className="flex items-center gap-4"
 *   const variants = { primary: "bg-blue-500 text-white" };
 *   return "border-error text-error focus:border-error";
 *
 * ✗ Bad:
 *   className="flex  items-center   gap-4"
 *   const variants = { primary: "bg-blue-500  text-white" };
 *   return "border-error  text-error   focus:border-error";
 */
const classNameNoExtraSpaces = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check and fix string literal
        const checkStringLiteralHandler = (node, value, varName) => {
            // Smart detection
            if (!isClassRelated(varName, value)) return;

            // Skip multiline format (newline at start = intentional multiline)
            if (/^\n/.test(value)) return;

            if (/  +/.test(value)) {
                const raw = sourceCode.getText(node);
                const quote = raw[0];
                const fixed = value.replace(/  +/g, " ");

                context.report({
                    fix: (fixer) => fixer.replaceText(node, `${quote}${fixed}${quote}`),
                    message: "Class string should not have multiple consecutive spaces",
                    node,
                });
            }
        };

        // Check and fix template literal
        const checkTemplateLiteralHandler = (templateLiteral, varName) => {
            const { quasis } = templateLiteral;

            // Smart detection: get static content for checking
            const staticContent = quasis.map((q) => q.value.raw).join(" ").trim();

            if (!isClassRelated(varName, staticContent)) return;

            // Check first quasi for leading space
            const firstQuasi = quasis[0];

            // Skip multiline format (newline after backtick = intentional multiline)
            const isMultilineFormat = firstQuasi && /^\n/.test(firstQuasi.value.raw);

            if (!isMultilineFormat && firstQuasi && /^\s+/.test(firstQuasi.value.raw)) {
                context.report({
                    fix: (fixer) => {
                        const fullText = sourceCode.getText(templateLiteral);
                        const fixedText = fullText.replace(/^`\s+/, "`");

                        return fixer.replaceText(templateLiteral, fixedText);
                    },
                    message: "Class string should not have leading whitespace in template literal",
                    node: firstQuasi,
                });

                return;
            }

            // Check last quasi for trailing space
            const lastQuasi = quasis[quasis.length - 1];

            if (!isMultilineFormat && lastQuasi && /\s+$/.test(lastQuasi.value.raw)) {
                context.report({
                    fix: (fixer) => {
                        const fullText = sourceCode.getText(templateLiteral);
                        const fixedText = fullText.replace(/\s+`$/, "`");

                        return fixer.replaceText(templateLiteral, fixedText);
                    },
                    message: "Class string should not have trailing whitespace in template literal",
                    node: lastQuasi,
                });

                return;
            }

            // Check for multiple consecutive spaces in any quasi (skip multiline format)
            if (!isMultilineFormat) {
                quasis.forEach((quasi) => {
                    const value = quasi.value.raw;

                    if (/  +/.test(value)) {
                        context.report({
                            fix: (fixer) => {
                                const fullText = sourceCode.getText(templateLiteral);
                                const fixedText = fullText.replace(/  +/g, " ");

                                return fixer.replaceText(templateLiteral, fixedText);
                            },
                            message: "Class string should not have multiple consecutive spaces",
                            node: quasi,
                        });
                    }
                });
            }
        };

        return {
            // Check className JSX attribute
            JSXAttribute(node) {
                if (!node.name || node.name.name !== "className") return;

                if (node.value && node.value.type === "Literal" && typeof node.value.value === "string") {
                    checkStringLiteralHandler(node.value, node.value.value, "className");
                }

                if (node.value
                    && node.value.type === "JSXExpressionContainer"
                    && node.value.expression.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.value.expression, "className");
                }
            },

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                const varName = node.id.name;

                // Check string literal
                if (node.init && node.init.type === "Literal" && typeof node.init.value === "string") {
                    checkStringLiteralHandler(node.init, node.init.value, varName);
                }

                // Check template literal
                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.init, varName);
                }

                // Check object with class values
                if (node.init && node.init.type === "ObjectExpression") {
                    node.init.properties.forEach((prop) => {
                        if (prop.type !== "Property") return;

                        if (prop.value && prop.value.type === "Literal" && typeof prop.value.value === "string") {
                            const value = prop.value.value;

                            // Check if variable name suggests classes OR value looks like Tailwind
                            if (!isClassRelated(varName, value)) return;

                            const raw = sourceCode.getText(prop.value);
                            const quote = raw[0];

                            // Check for leading whitespace
                            if (/^\s+/.test(value)) {
                                const fixed = value.trimStart();

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${fixed}${quote}`),
                                    message: "Class string should not have leading whitespace",
                                    node: prop.value,
                                });

                                return;
                            }

                            // Check for trailing whitespace
                            if (/\s+$/.test(value)) {
                                const fixed = value.trimEnd();

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${fixed}${quote}`),
                                    message: "Class string should not have trailing whitespace",
                                    node: prop.value,
                                });

                                return;
                            }

                            // Check for multiple consecutive spaces
                            if (/  +/.test(value)) {
                                const fixed = value.replace(/  +/g, " ");

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${fixed}${quote}`),
                                    message: "Class string should not have multiple consecutive spaces",
                                    node: prop.value,
                                });
                            }
                        }

                        if (prop.value && prop.value.type === "TemplateLiteral") {
                            // For template literals, extract static content to check for Tailwind classes
                            const staticContent = prop.value.quasis.map((q) => q.value.raw).join(" ").trim();

                            if (isClassRelated(varName, staticContent)) {
                                checkTemplateLiteralHandler(prop.value, varName);
                            }
                        }
                    });
                }
            },

            // Check return statements with Tailwind class values
            ReturnStatement(node) {
                if (!node.argument) return;

                if (node.argument.type === "Literal" && typeof node.argument.value === "string") {
                    checkStringLiteralHandler(node.argument, node.argument.value, "return");
                }

                if (node.argument.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.argument, "return");
                }
            },
        };
    },
    meta: {
        docs: { description: "Disallow extra/leading/trailing spaces in className values; smart detection for objects with Tailwind values and return statements" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: className Order
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce Tailwind CSS class ordering in class string variables,
 *   object properties, and return statements. This rule complements
 *   tailwindcss/classnames-order by handling areas it doesn't cover.
 *   Uses smart detection: checks if values look like Tailwind classes.
 *
 * Coverage Division:
 *   - tailwindcss/classnames-order: Handles JSX className attributes
 *   - classname-order (this rule): Handles variables, object properties,
 *     and return statements containing Tailwind class strings
 *
 * Both rules should be enabled together for complete coverage.
 *
 * ✓ Good:
 *   const variants = { primary: "bg-blue-500 hover:bg-blue-600" };
 *   return "border-error text-error focus:border-error";
 *
 * ✗ Bad:
 *   const variants = { primary: "hover:bg-blue-600 bg-blue-500" };
 *   return "focus:border-error text-error border-error";
 */
const classNameOrder = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check and fix string literal ordering
        const checkStringOrderHandler = (node, value, varName) => {
            // Smart detection
            if (!isClassRelated(varName, value)) return;

            if (!needsReordering(value)) return;

            const sorted = sortTailwindClasses(value);
            const raw = sourceCode.getText(node);
            const quote = raw[0];

            context.report({
                fix: (fixer) => fixer.replaceText(node, `${quote}${sorted}${quote}`),
                message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                node,
            });
        };

        // Check template literal ordering (only static parts)
        const checkTemplateLiteralOrderHandler = (templateLiteral, varName) => {
            const { expressions, quasis } = templateLiteral;

            // Get static content for detection
            const staticContent = quasis.map((q) => q.value.raw).join(" ").trim();

            if (!isClassRelated(varName, staticContent)) return;

            // Check if any quasi needs reordering
            let needsFix = false;

            for (const quasi of quasis) {
                const value = quasi.value.raw.trim();

                if (value && needsReordering(value)) {
                    needsFix = true;
                    break;
                }
            }

            if (!needsFix) return;

            context.report({
                fix: (fixer) => {
                    // Rebuild the template literal with sorted classes
                    let result = "`";

                    for (let i = 0; i < quasis.length; i += 1) {
                        const quasi = quasis[i];
                        const raw = quasi.value.raw;

                        // Sort the static part while preserving leading/trailing whitespace
                        const leadingSpace = raw.match(/^\s*/)[0];
                        const trailingSpace = raw.match(/\s*$/)[0];
                        const trimmed = raw.trim();
                        const isMultilineQuasi = /\n/.test(trimmed);
                        let sorted;

                        if (isMultilineQuasi && trimmed) {
                            // Preserve multiline format: sort classes, rejoin without empty lines
                            const lines = raw.split("\n");
                            const classesFromLines = lines.map((l) => l.trim()).filter(Boolean);
                            const sortedClasses = [...classesFromLines].sort((a, b) => {
                                const orderA = getClassOrder(a);
                                const orderB = getClassOrder(b);

                                if (orderA !== orderB) return orderA - orderB;

                                return a.localeCompare(b);
                            });

                            // Detect indent from first non-empty line
                            const indentLine = lines.find((l) => l.trim().length > 0);
                            const lineIndent = indentLine ? indentLine.match(/^\s*/)[0] : "";

                            // Rebuild: newline + sorted classes + trailing newline with base indent only
                            const lastLine = lines[lines.length - 1];
                            const baseIndentMatch = lastLine.match(/^\s*/);
                            const trailingIndent = baseIndentMatch ? baseIndentMatch[0] : "";

                            result += "\n" + sortedClasses.map((cls) => lineIndent + cls).join("\n") + "\n" + trailingIndent;
                        } else {
                            sorted = trimmed ? sortTailwindClasses(trimmed) : "";
                            result += leadingSpace + sorted + trailingSpace;
                        }

                        // Add expression if not the last quasi
                        if (i < expressions.length) {
                            result += "${" + sourceCode.getText(expressions[i]) + "}";
                        }
                    }

                    result += "`";

                    return fixer.replaceText(templateLiteral, result);
                },
                message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                node: templateLiteral,
            });
        };

        return {
            // Note: JSX className attributes are NOT checked here
            // They should be handled by tailwindcss/classnames-order

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                const varName = node.id.name;

                // Check string literal
                if (node.init && node.init.type === "Literal" && typeof node.init.value === "string") {
                    checkStringOrderHandler(node.init, node.init.value, varName);
                }

                // Check template literal
                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralOrderHandler(node.init, varName);
                }

                // Check object with class values
                if (node.init && node.init.type === "ObjectExpression") {
                    node.init.properties.forEach((prop) => {
                        if (prop.type !== "Property") return;

                        if (prop.value && prop.value.type === "Literal" && typeof prop.value.value === "string") {
                            const value = prop.value.value;

                            // Check if variable name suggests classes OR value looks like Tailwind
                            if (!isClassRelated(varName, value)) return;

                            if (needsReordering(value)) {
                                const sorted = sortTailwindClasses(value);
                                const raw = sourceCode.getText(prop.value);
                                const quote = raw[0];

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${sorted}${quote}`),
                                    message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                                    node: prop.value,
                                });
                            }
                        }

                        if (prop.value && prop.value.type === "TemplateLiteral") {
                            // For template literals, extract static content to check for Tailwind classes
                            const staticContent = prop.value.quasis.map((q) => q.value.raw).join(" ").trim();

                            if (isClassRelated(varName, staticContent)) {
                                checkTemplateLiteralOrderHandler(prop.value, varName);
                            }
                        }
                    });
                }
            },

            // Check return statements with Tailwind class values
            ReturnStatement(node) {
                if (!node.argument) return;

                if (node.argument.type === "Literal" && typeof node.argument.value === "string") {
                    const value = node.argument.value;

                    if (looksLikeTailwindClasses(value) && needsReordering(value)) {
                        const sorted = sortTailwindClasses(value);
                        const raw = sourceCode.getText(node.argument);
                        const quote = raw[0];

                        context.report({
                            fix: (fixer) => fixer.replaceText(node.argument, `${quote}${sorted}${quote}`),
                            message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                            node: node.argument,
                        });
                    }
                }

                if (node.argument.type === "TemplateLiteral") {
                    checkTemplateLiteralOrderHandler(node.argument, "return");
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce Tailwind CSS class ordering in class strings; smart detection for objects with Tailwind values and return statements" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: className Multiline
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce that long className strings are broken into multiple
 *   lines, with each class on its own line. Triggers when either
 *   the class count or string length exceeds the threshold.
 *   Uses smart detection: checks objects/returns if values look
 *   like Tailwind classes.
 *
 * ✓ Good:
 *   const variants = {
 *       primary: `
 *           bg-primary
 *           text-white
 *           hover:bg-primary-dark
 *       `,
 *   };
 *   return `
 *       border-error
 *       text-error
 *       focus:border-error
 *   `;
 *
 * ✗ Bad:
 *   const variants = { primary: "bg-primary text-white hover:bg-primary-dark focus:ring-2" };
 *   return "border-error text-error placeholder-error/50 focus:border-error";
 */
const classNameMultiline = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxClassCount = options.maxClassCount ?? DEFAULT_MAX_CLASS_COUNT;
        const maxLength = options.maxLength ?? DEFAULT_MAX_CLASS_LENGTH;

        // Get the leading whitespace of the line where a node starts
        const getLineIndent = (node) => {
            const allText = sourceCode.getText();
            const lines = allText.split("\n");
            const line = lines[node.loc.start.line - 1];

            if (!line) return "";

            const match = line.match(/^(\s*)/);

            return match ? match[1] : "";
        };

        // Build multiline template literal from classes and dynamic expressions
        const buildMultilineTemplate = (classes, dynamicExprs, baseIndent) => {
            const indent = baseIndent + "    ";
            const lines = classes.map((cls) => `${indent}${cls}`);

            dynamicExprs.forEach((expr) => {
                lines.push(`${indent}\${${expr}}`);
            });

            return `\`\n${lines.join("\n")}\n${baseIndent}\``;
        };

        // Build multiline string literal (no dynamic expressions)
        const buildMultilineString = (classes, baseIndent) => {
            const indent = baseIndent + "    ";
            const lines = classes.map((cls) => `${indent}${cls}`);

            return `"\n${lines.join("\n")}\n${baseIndent}"`;
        };

        // Check if a string value needs multiline formatting
        const needsMultiline = (classes, dynamicCount, totalLength) =>
            classes.length + dynamicCount > maxClassCount || totalLength > maxLength;

        // Check if already correctly formatted multiline
        const isCorrectlyMultiline = (rawContent, baseIndent) => {
            if (!/\n/.test(rawContent)) return false;

            const indent = baseIndent + "    ";
            const lines = rawContent.split("\n");

            // First line should be empty (backtick then newline)
            if (lines[0].trim() !== "") return false;

            // Last line should be just baseIndent
            if (lines[lines.length - 1] !== baseIndent) return false;

            // Middle lines should each have exactly one class/expression at correct indent, no empty lines
            for (let i = 1; i < lines.length - 1; i += 1) {
                if (lines[i].trim() === "") return false;

                if (!lines[i].startsWith(indent)) return false;

                const content = lines[i].slice(indent.length);

                if (content.includes(" ") && !content.startsWith("${")) return false;
            }

            return true;
        };

        // Get base indent for the node that owns the class string
        const getBaseIndent = (node) => {
            let current = node;

            while (current) {
                // For JSX attributes, check if inline and use column-based indent
                if (current.type === "JSXAttribute") {
                    const lineIndent = getLineIndent(current);
                    const lineText = sourceCode.lines[current.loc.start.line - 1];
                    const contentBefore = lineText.slice(0, current.loc.start.column).trim();

                    if (contentBefore) {
                        // Attribute is inline (e.g., <Component className=...>)
                        return " ".repeat(current.loc.start.column);
                    }

                    return lineIndent;
                }

                // For variables and properties, just use line indentation
                if (current.type === "VariableDeclarator" || current.type === "Property") {
                    return getLineIndent(current);
                }

                // For return statements, use the return keyword's indentation
                if (current.type === "ReturnStatement") {
                    return getLineIndent(current);
                }

                current = current.parent;
            }

            return getLineIndent(node);
        };

        // Handle string literal className
        const checkStringLiteralHandler = (node, value, varName) => {
            if (!isClassRelated(varName, value)) return;

            const classes = value.trim().split(/\s+/).filter(Boolean);
            const classesOnly = classes.join(" ");
            const isMultiline = /\n/.test(value);

            // Under threshold: if multiline, collapse to single line
            if (!needsMultiline(classes, 0, classesOnly.length)) {
                if (isMultiline) {
                    const raw = sourceCode.getText(node);
                    const quote = raw[0];

                    context.report({
                        fix: (fixer) => fixer.replaceText(node, `${quote}${classesOnly}${quote}`),
                        message: "Class string under threshold should be on a single line",
                        node,
                    });
                }

                return;
            }

            const baseIndent = getBaseIndent(node);

            // Already correctly formatted multiline
            if (isCorrectlyMultiline(value, baseIndent)) return;

            context.report({
                fix: (fixer) => {
                    const parent = node.parent;

                    if (parent && parent.type === "JSXAttribute") {
                        return fixer.replaceText(node, buildMultilineString(classes, baseIndent));
                    }

                    // Variables/objects: multiline "..." is invalid JS, use template literal
                    return fixer.replaceText(node, buildMultilineTemplate(classes, [], baseIndent));
                },
                message: `Class strings with >${maxClassCount} classes or >${maxLength} chars should be multiline with one class per line. Example: className="\\n    flex\\n    items-center\\n"`,
                node,
            });
        };

        // Handle template literal className
        const checkTemplateLiteralHandler = (templateLiteral, varName) => {
            const { expressions, quasis } = templateLiteral;
            const staticContent = quasis.map((q) => q.value.raw).join(" ").trim();

            if (!isClassRelated(varName, staticContent)) return;

            const allClasses = staticContent.split(/\s+/).filter(Boolean);
            const dynamicExprs = expressions.map((expr) => sourceCode.getText(expr));
            const fullLength = staticContent.length + dynamicExprs.reduce((sum, e) => sum + e.length + 3, 0);

            // Determine if this is a JSX className attribute
            const jsxContainer = templateLiteral.parent;
            const isJSXAttr = jsxContainer
                && jsxContainer.type === "JSXExpressionContainer"
                && jsxContainer.parent
                && jsxContainer.parent.type === "JSXAttribute";

            if (!needsMultiline(allClasses, dynamicExprs.length, fullLength)) {
                // Under threshold: if multiline, collapse to single line
                const rawContent = quasis.map((q, i) =>
                    q.value.raw + (i < expressions.length ? `\${${dynamicExprs[i]}}` : ""),
                ).join("");

                if (/\n/.test(rawContent)) {
                    const collapsed = allClasses.join(" ");

                    if (isJSXAttr && dynamicExprs.length === 0) {
                        // JSX no expressions → use "..."
                        context.report({
                            fix: (fixer) => fixer.replaceText(jsxContainer, `"${collapsed}"`),
                            message: "Class string under threshold should be on a single line",
                            node: templateLiteral,
                        });
                    } else if (dynamicExprs.length === 0) {
                        // Variable no expressions → use `...` single line
                        context.report({
                            fix: (fixer) => fixer.replaceText(templateLiteral, `\`${collapsed}\``),
                            message: "Class string under threshold should be on a single line",
                            node: templateLiteral,
                        });
                    } else {
                        const parts = [collapsed, ...dynamicExprs.map((e) => `\${${e}}`)];

                        context.report({
                            fix: (fixer) => fixer.replaceText(templateLiteral, `\`${parts.join(" ")}\``),
                            message: "Class string under threshold should be on a single line",
                            node: templateLiteral,
                        });
                    }
                }

                return;
            }

            const baseIndent = getBaseIndent(templateLiteral);

            // JSX with no expressions → must use "..." format, not {`...`}
            if (isJSXAttr && dynamicExprs.length === 0) {
                const multiline = buildMultilineString(allClasses, baseIndent);

                context.report({
                    fix: (fixer) => fixer.replaceText(jsxContainer, multiline),
                    message: "Use string literal instead of template literal for className with no dynamic expressions",
                    node: templateLiteral,
                });

                return;
            }

            // Template literal (variable/object or JSX with expressions)
            const rawContent = quasis.map((q, i) =>
                q.value.raw + (i < expressions.length ? `\${${dynamicExprs[i]}}` : ""),
            ).join("");

            if (isCorrectlyMultiline(rawContent, baseIndent)) return;

            const multiline = buildMultilineTemplate(allClasses, dynamicExprs, baseIndent);

            context.report({
                fix: (fixer) => fixer.replaceText(templateLiteral, multiline),
                message: `Class strings with >${maxClassCount} classes or >${maxLength} chars should be multiline with one class per line. Example: className="\\n    flex\\n    items-center\\n"`,
                node: templateLiteral,
            });
        };

        return {
            // Check className JSX attribute
            JSXAttribute(node) {
                if (!node.name || node.name.name !== "className") return;

                if (node.value && node.value.type === "Literal" && typeof node.value.value === "string") {
                    checkStringLiteralHandler(node.value, node.value.value, "className");
                }

                if (node.value
                    && node.value.type === "JSXExpressionContainer"
                    && node.value.expression.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.value.expression, "className");
                }
            },

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                const varName = node.id.name;

                if (node.init && node.init.type === "Literal" && typeof node.init.value === "string") {
                    checkStringLiteralHandler(node.init, node.init.value, varName);
                }

                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.init, varName);
                }

                if (node.init && node.init.type === "ObjectExpression") {
                    // Check each property - apply rule if name suggests classes OR value looks like Tailwind
                    node.init.properties.forEach((prop) => {
                        if (prop.type !== "Property") return;

                        if (prop.value && prop.value.type === "Literal" && typeof prop.value.value === "string") {
                            // Check if variable name suggests classes OR if the value looks like Tailwind classes
                            if (isClassRelated(varName, prop.value.value)) {
                                checkStringLiteralHandler(prop.value, prop.value.value, varName);
                            }
                        }

                        if (prop.value && prop.value.type === "TemplateLiteral") {
                            // For template literals, extract static content to check for Tailwind classes
                            const staticContent = prop.value.quasis.map((q) => q.value.raw).join(" ").trim();

                            if (isClassRelated(varName, staticContent)) {
                                checkTemplateLiteralHandler(prop.value, varName);
                            }
                        }
                    });
                }
            },

            // Check return statements with Tailwind class values
            ReturnStatement(node) {
                if (!node.argument) return;

                if (node.argument.type === "Literal" && typeof node.argument.value === "string") {
                    const value = node.argument.value;

                    if (looksLikeTailwindClasses(value)) {
                        checkStringLiteralHandler(node.argument, value, "return");
                    }
                }

                if (node.argument.type === "TemplateLiteral") {
                    const staticContent = node.argument.quasis.map((q) => q.value.raw).join(" ").trim();

                    if (looksLikeTailwindClasses(staticContent)) {
                        checkTemplateLiteralHandler(node.argument, "return");
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce multiline formatting for long className strings; smart detection for objects with Tailwind values and return statements" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxClassCount: { default: 3, minimum: 1, type: "integer" },
                    maxLength: { default: 80, minimum: 1, type: "integer" },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX String Value Trim
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX string attribute values should not have leading or
 *   trailing whitespace inside the quotes.
 *
 * ✓ Good:
 *   className="button"
 *   title="Hello World"
 *
 * ✗ Bad:
 *   className=" button "
 *   title=" Hello World "
 */
const jsxStringValueTrim = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkJSXAttributeHandler = (node) => {
            if (!node.value || node.value.type !== "Literal" || typeof node.value.value !== "string") return;

            const value = node.value.value;

            // Skip multiline className format (intentional whitespace)
            if (node.name && node.name.name === "className" && /^\n/.test(value)) return;

            const trimmed = value.trim();

            if (value !== trimmed) {
                const raw = sourceCode.getText(node.value);
                const quote = raw[0];

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node.value,
                        `${quote}${trimmed}${quote}`,
                    ),
                    message: "JSX string value should not have leading or trailing whitespace",
                    node: node.value,
                });
            }
        };

        return { JSXAttribute: checkJSXAttributeHandler };
    },
    meta: {
        docs: { description: "Disallow leading/trailing whitespace in JSX string values" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Ternary Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Format ternary expressions in JSX with proper structure.
 *   Simple branches stay on one line, complex branches get
 *   parentheses with proper indentation.
 *
 * ✓ Good:
 *   {condition ? <Simple /> : <Other />}
 *   {condition ? <Simple /> : (
 *       <Complex>
 *           <Child />
 *       </Complex>
 *   )}
 *
 * ✗ Bad:
 *   {condition
 *       ? <Simple />
 *       : <Other />}
 */
const jsxTernaryFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Helper to get indentation of a line
        const getIndentHandler = (node) => {
            const line = sourceCode.lines[node.loc.start.line - 1];
            const match = line.match(/^(\s*)/);

            return match ? match[1] : "";
        };

        // Check if JSX element is simple (single line)
        const isSimpleJsxHandler = (jsxNode) => {
            if (jsxNode.type !== "JSXElement" && jsxNode.type !== "JSXFragment") return false;

            return jsxNode.loc.start.line === jsxNode.loc.end.line;
        };

        // Check if a node is wrapped in unnecessary parentheses
        const hasUnnecessaryParensHandler = (jsxNode) => {
            const tokenBefore = sourceCode.getTokenBefore(jsxNode);
            const tokenAfter = sourceCode.getTokenAfter(jsxNode);

            return tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        // Check if condition has broken operators (spread across lines)
        const hasConditionBrokenAcrossLinesHandler = (testNode) => {
            // Check binary expressions (===, !==, etc.)
            if (testNode.type === "BinaryExpression") {
                const leftEnd = testNode.left.loc.end.line;
                const rightStart = testNode.right.loc.start.line;

                if (leftEnd !== rightStart) return true;

                // Recursively check nested expressions
                return hasConditionBrokenAcrossLinesHandler(testNode.left)
                    || hasConditionBrokenAcrossLinesHandler(testNode.right);
            }

            // Check logical expressions (&&, ||)
            if (testNode.type === "LogicalExpression") {
                const leftEnd = testNode.left.loc.end.line;
                const rightStart = testNode.right.loc.start.line;

                if (leftEnd !== rightStart) return true;

                return hasConditionBrokenAcrossLinesHandler(testNode.left)
                    || hasConditionBrokenAcrossLinesHandler(testNode.right);
            }

            return false;
        };

        // Get the full condition text collapsed to single line
        const getCollapsedConditionTextHandler = (testNode) => sourceCode.getText(testNode).replace(/\s*\n\s*/g, " ").trim();

        return {
            ConditionalExpression(node) {
                const parent = node.parent;

                // Handle ternaries in JSX context, return statements, or arrow function bodies
                const isJsxContext = parent && parent.type === "JSXExpressionContainer";
                const isReturnContext = parent && parent.type === "ReturnStatement";
                const isArrowBodyContext = parent && parent.type === "ArrowFunctionExpression" && parent.body === node;

                if (!isJsxContext && !isReturnContext && !isArrowBodyContext) return;

                const {
                    alternate,
                    consequent,
                } = node;

                // At least one branch should be JSX
                const isConsequentJsx = consequent.type === "JSXElement" || consequent.type === "JSXFragment";
                const isAlternateJsx = alternate.type === "JSXElement" || alternate.type === "JSXFragment";

                if (!isConsequentJsx && !isAlternateJsx) return;

                const consequentSimple = isSimpleJsxHandler(consequent);
                const alternateSimple = isSimpleJsxHandler(alternate);

                const baseIndent = getIndentHandler(node);
                const contentIndent = baseIndent + "    ";

                // Check: Condition should not be broken across multiple lines
                if (hasConditionBrokenAcrossLinesHandler(node.test)) {
                    const collapsedCondition = getCollapsedConditionTextHandler(node.test);

                    context.report({
                        fix: (fixer) => fixer.replaceText(node.test, collapsedCondition),
                        message: "Ternary condition should not be broken across multiple lines",
                        node: node.test,
                    });
                }

                // Check: Condition should be on same line as opening { (for JSX context)
                if (isJsxContext) {
                    const openBrace = sourceCode.getFirstToken(parent);

                    if (openBrace && openBrace.value === "{") {
                        if (openBrace.loc.end.line !== node.test.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [openBrace.range[1], node.test.range[0]],
                                    "",
                                ),
                                message: "Ternary condition should be on same line as opening '{'",
                                node: node.test,
                            });
                        }
                    }
                }

                // Get the question mark token
                const questionToken = sourceCode.getTokenAfter(
                    node.test,
                    (token) => token.value === "?",
                );

                if (!questionToken) return;

                // Get the colon token
                const colonToken = sourceCode.getTokenAfter(
                    consequent,
                    (token) => token.value === ":",
                );

                if (!colonToken) return;

                // Get closing brace of JSXExpressionContainer (null for return statements)
                const closeBrace = isJsxContext ? sourceCode.getLastToken(parent) : null;

                // Check for unnecessary parentheses around simple JSX
                if (consequentSimple && hasUnnecessaryParensHandler(consequent)) {
                    const openParen = sourceCode.getTokenBefore(consequent);
                    const closeParen = sourceCode.getTokenAfter(consequent);

                    context.report({
                        fix: (fixer) => [
                            fixer.remove(openParen),
                            fixer.remove(closeParen),
                        ],
                        message: "Unnecessary parentheses around simple JSX element",
                        node: consequent,
                    });
                }

                if (alternateSimple && hasUnnecessaryParensHandler(alternate)) {
                    const openParen = sourceCode.getTokenBefore(alternate);
                    const closeParen = sourceCode.getTokenAfter(alternate);

                    context.report({
                        fix: (fixer) => [
                            fixer.remove(openParen),
                            fixer.remove(closeParen),
                        ],
                        message: "Unnecessary parentheses around simple JSX element",
                        node: alternate,
                    });
                }

                // CASE 1: Both branches are simple - entire ternary on one line
                if (consequentSimple && alternateSimple) {
                    // Check if entire expression is on one line
                    if (node.loc.start.line !== node.loc.end.line) {
                        const testText = sourceCode.getText(node.test);
                        const consequentText = sourceCode.getText(consequent);
                        const alternateText = sourceCode.getText(alternate);

                        context.report({
                            fix: (fixer) => fixer.replaceText(
                                node,
                                `${testText} ? ${consequentText} : ${alternateText}`,
                            ),
                            message: "Simple ternary with single-line JSX should be on one line",
                            node,
                        });
                    }

                    return;
                }

                // CASE 1.5: Consequent is simple JSX, alternate is non-JSX (e.g., function call)
                // Format: {condition ? <Simple /> : functionCall({
                //     props,
                // })}
                if (consequentSimple && isConsequentJsx && !isAlternateJsx) {
                    // Condition, ?, simple JSX, and : should all be on the same line
                    // Then alternate starts on the same line after :

                    // ? should be on same line as condition
                    if (node.test.loc.end.line !== questionToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [node.test.range[1], questionToken.range[0]],
                                " ",
                            ),
                            message: "'?' should be on same line as condition",
                            node: questionToken,
                        });
                    }

                    // Simple JSX should be on same line as ?
                    if (questionToken.loc.end.line !== consequent.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [questionToken.range[1], consequent.range[0]],
                                " ",
                            ),
                            message: "Simple JSX should be on same line as '?'",
                            node: consequent,
                        });
                    }

                    // : should be on same line as simple JSX
                    if (consequent.loc.end.line !== colonToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [consequent.range[1], colonToken.range[0]],
                                " ",
                            ),
                            message: "':' should be on same line as simple JSX",
                            node: colonToken,
                        });
                    }

                    // Alternate (function call) should start on same line as :
                    if (colonToken.loc.end.line !== alternate.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], alternate.range[0]],
                                " ",
                            ),
                            message: "Expression should start on same line as ':'",
                            node: alternate,
                        });
                    }

                    return;
                }

                // CASE 2: Consequent is simple, alternate is complex JSX
                // Format: {condition ? <Simple /> : (
                //     <Complex />
                // )}
                // Skip if alternate is not JSX (e.g., function call)
                if (consequentSimple && !alternateSimple && isAlternateJsx) {
                    // ? should be on same line as condition
                    if (node.test.loc.end.line !== questionToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [node.test.range[1], questionToken.range[0]],
                                " ",
                            ),
                            message: "'?' should be on same line as condition",
                            node: questionToken,
                        });
                    }

                    // Simple consequent should be on same line as ?
                    if (questionToken.loc.end.line !== consequent.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [questionToken.range[1], consequent.range[0]],
                                " ",
                            ),
                            message: "Simple JSX should be on same line as '?'",
                            node: consequent,
                        });
                    }

                    // : should be on same line as simple consequent
                    if (consequent.loc.end.line !== colonToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [consequent.range[1], colonToken.range[0]],
                                " ",
                            ),
                            message: "':' should be on same line as simple JSX",
                            node: colonToken,
                        });
                    }

                    // Check ( after :
                    const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                    if (tokenAfterColon && tokenAfterColon.value === "(") {
                        // ( should be on same line as :
                        if (colonToken.loc.end.line !== tokenAfterColon.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [colonToken.range[1], tokenAfterColon.range[0]],
                                    " ",
                                ),
                                message: "'(' should be on same line as ':'",
                                node: tokenAfterColon,
                            });
                        }

                        // Complex JSX should start on new line after (
                        const alternateStart = sourceCode.getTokenAfter(tokenAfterColon);

                        if (alternateStart && tokenAfterColon.loc.end.line === alternateStart.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterColon.range[1], alternateStart.range[0]],
                                    "\n" + contentIndent,
                                ),
                                message: "Complex JSX should start on new line after '('",
                                node: alternate,
                            });
                        }
                    }

                    // Final ) should be on its own line, then )} together
                    const lastToken = sourceCode.getLastToken(node);

                    if (lastToken && lastToken.value === ")") {
                        const tokenBeforeLast = sourceCode.getTokenBefore(lastToken);

                        if (tokenBeforeLast && tokenBeforeLast.value !== "(" && tokenBeforeLast.loc.end.line === lastToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenBeforeLast.range[1], lastToken.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "Closing ')' should be on new line",
                                node: lastToken,
                            });
                        }

                        // ) and } should be on same line
                        if (closeBrace && closeBrace.value === "}" && lastToken.loc.end.line !== closeBrace.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastToken.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing ')}' should be together",
                                node: closeBrace,
                            });
                        }
                    }

                    return;
                }

                // CASE 3: Consequent is complex JSX, alternate is simple
                // Format: {condition ? (
                //     <Complex />
                // ) : <Simple />}
                // Skip if consequent is not JSX (e.g., function call)
                if (!consequentSimple && alternateSimple && isConsequentJsx) {
                    const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                    // ? ( should be on same line
                    if (tokenAfterQuestion && tokenAfterQuestion.value === "(") {
                        if (node.test.loc.end.line !== questionToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [node.test.range[1], questionToken.range[0]],
                                    " ",
                                ),
                                message: "'?' should be on same line as condition",
                                node: questionToken,
                            });
                        }

                        if (questionToken.loc.end.line !== tokenAfterQuestion.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [questionToken.range[1], tokenAfterQuestion.range[0]],
                                    " ",
                                ),
                                message: "'(' should be on same line as '?'",
                                node: tokenAfterQuestion,
                            });
                        }

                        // JSX after ( should start on new line
                        const jsxStart = sourceCode.getTokenAfter(tokenAfterQuestion);

                        if (jsxStart && tokenAfterQuestion.loc.end.line === jsxStart.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                    "\n" + contentIndent,
                                ),
                                message: "Complex JSX should start on new line after '('",
                                node: consequent,
                            });
                        }
                    }

                    // ) before : should be on new line
                    const tokenBeforeColon = sourceCode.getTokenBefore(colonToken);

                    if (tokenBeforeColon && tokenBeforeColon.value === ")") {
                        const jsxEnd = sourceCode.getTokenBefore(tokenBeforeColon);

                        if (jsxEnd && jsxEnd.loc.end.line === tokenBeforeColon.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "Closing ')' should be on new line after complex JSX",
                                node: tokenBeforeColon,
                            });
                        }

                        // ) : should be on same line
                        if (tokenBeforeColon.loc.end.line !== colonToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenBeforeColon.range[1], colonToken.range[0]],
                                    " ",
                                ),
                                message: "':' should be on same line as ')'",
                                node: colonToken,
                            });
                        }
                    }

                    // Check if simple alternate is wrapped in unnecessary parentheses
                    const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                    if (tokenAfterColon && tokenAfterColon.value === "(") {
                        // Find the matching closing paren
                        const closingParen = sourceCode.getTokenAfter(alternate);

                        if (closingParen && closingParen.value === ")") {
                            // Remove parentheses and put simple alternate on same line as :
                            const alternateText = sourceCode.getText(alternate);

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [colonToken.range[1], closingParen.range[1]],
                                    ` ${alternateText}`,
                                ),
                                message: "Simple JSX should not be wrapped in parentheses; put on same line as ':'",
                                node: alternate,
                            });

                            return;
                        }
                    }

                    // Simple alternate should be on same line as :
                    if (colonToken.loc.end.line !== alternate.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], alternate.range[0]],
                                " ",
                            ),
                            message: "Simple JSX should be on same line as ':'",
                            node: alternate,
                        });
                    }

                    // } should be on same line as simple alternate (only for JSX context)
                    if (closeBrace && closeBrace.value === "}" && alternate.loc.end.line !== closeBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [alternate.range[1], closeBrace.range[0]],
                                "",
                            ),
                            message: "'}' should be on same line as simple JSX",
                            node: closeBrace,
                        });
                    }

                    return;
                }

                // CASE 3b: Consequent is complex JSX, alternate is simple non-JSX (null, undefined, false, etc.)
                // Format: return condition ? (
                //     <Complex />
                // ) : null;
                const isSimpleNonJsxAlternate = !isAlternateJsx && (
                    alternate.type === "Literal" ||
                    alternate.type === "Identifier" ||
                    (alternate.type === "MemberExpression" && alternate.loc.start.line === alternate.loc.end.line)
                );

                if (!consequentSimple && isConsequentJsx && isSimpleNonJsxAlternate) {
                    const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                    // ? ( should be on same line as condition
                    if (tokenAfterQuestion && tokenAfterQuestion.value === "(") {
                        if (node.test.loc.end.line !== questionToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [node.test.range[1], questionToken.range[0]],
                                    " ",
                                ),
                                message: "'?' should be on same line as condition",
                                node: questionToken,
                            });
                        }

                        if (questionToken.loc.end.line !== tokenAfterQuestion.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [questionToken.range[1], tokenAfterQuestion.range[0]],
                                    " ",
                                ),
                                message: "'(' should be on same line as '?'",
                                node: tokenAfterQuestion,
                            });
                        }

                        // JSX after ( should start on new line (no empty lines)
                        const jsxStart = sourceCode.getTokenAfter(tokenAfterQuestion);

                        if (jsxStart && tokenAfterQuestion.loc.end.line === jsxStart.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                    "\n" + contentIndent,
                                ),
                                message: "Complex JSX should start on new line after '('",
                                node: consequent,
                            });
                        } else if (jsxStart && jsxStart.loc.start.line - tokenAfterQuestion.loc.end.line > 1) {
                            // Check for empty lines after (
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                    "\n" + contentIndent,
                                ),
                                message: "No empty lines after '(' in ternary",
                                node: jsxStart,
                            });
                        }
                    }

                    // ) before : should be on new line
                    const tokenBeforeColon = sourceCode.getTokenBefore(colonToken);

                    if (tokenBeforeColon && tokenBeforeColon.value === ")") {
                        const jsxEnd = sourceCode.getTokenBefore(tokenBeforeColon);

                        if (jsxEnd && jsxEnd.loc.end.line === tokenBeforeColon.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "Closing ')' should be on new line after complex JSX",
                                node: tokenBeforeColon,
                            });
                        } else if (tokenBeforeColon.loc.start.line - jsxEnd.loc.end.line > 1) {
                            // Check for empty lines before )
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "No empty lines before ')' in ternary",
                                node: tokenBeforeColon,
                            });
                        }

                        // ) : should be on same line
                        if (tokenBeforeColon.loc.end.line !== colonToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenBeforeColon.range[1], colonToken.range[0]],
                                    " ",
                                ),
                                message: "':' should be on same line as ')'",
                                node: colonToken,
                            });
                        }
                    }

                    // Simple alternate should be on same line as :
                    if (colonToken.loc.end.line !== alternate.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], alternate.range[0]],
                                " ",
                            ),
                            message: "Simple expression should be on same line as ':'",
                            node: alternate,
                        });
                    }

                    return;
                }

                // CASE 4: Both branches are complex JSX
                // Format: {condition ? (
                //     <Complex />
                // ) : (
                //     <Other />
                // )}
                // Skip if not BOTH branches are JSX (e.g., one is a function call)
                if (!isConsequentJsx || !isAlternateJsx) return;

                const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                if (tokenAfterQuestion && tokenAfterQuestion.value === "(") {
                    // ? should be on same line as test
                    if (node.test.loc.end.line !== questionToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [node.test.range[1], questionToken.range[0]],
                                " ",
                            ),
                            message: "'?' should be on same line as condition",
                            node: questionToken,
                        });
                    }

                    // ( should be on same line as ?
                    if (questionToken.loc.end.line !== tokenAfterQuestion.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [questionToken.range[1], tokenAfterQuestion.range[0]],
                                " ",
                            ),
                            message: "'(' should be on same line as '?'",
                            node: tokenAfterQuestion,
                        });
                    }

                    // JSX after ( should start on new line
                    const jsxStart = sourceCode.getTokenAfter(tokenAfterQuestion);

                    if (jsxStart && tokenAfterQuestion.loc.end.line === jsxStart.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "Complex JSX should start on new line after '('",
                            node: consequent,
                        });
                    } else if (jsxStart && jsxStart.loc.start.line - tokenAfterQuestion.loc.end.line > 1) {
                        // Check for empty lines after (
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "No empty lines after '(' in ternary",
                            node: jsxStart,
                        });
                    }
                }

                // ) : ( pattern
                const tokenBeforeColon = sourceCode.getTokenBefore(colonToken);
                const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                if (tokenBeforeColon && tokenBeforeColon.value === ")") {
                    // ) should be on new line from JSX end
                    const jsxEnd = sourceCode.getTokenBefore(tokenBeforeColon);

                    if (jsxEnd && jsxEnd.loc.end.line === tokenBeforeColon.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing ')' should be on new line after complex JSX",
                            node: tokenBeforeColon,
                        });
                    } else if (jsxEnd && tokenBeforeColon.loc.start.line - jsxEnd.loc.end.line > 1) {
                        // Check for empty lines before )
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "No empty lines before ')' in ternary",
                            node: tokenBeforeColon,
                        });
                    }

                    // ) : should be on same line
                    if (tokenBeforeColon.loc.end.line !== colonToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeColon.range[1], colonToken.range[0]],
                                " ",
                            ),
                            message: "':' should be on same line as ')'",
                            node: colonToken,
                        });
                    }
                }

                if (tokenAfterColon && tokenAfterColon.value === "(") {
                    // ( should be on same line as :
                    if (colonToken.loc.end.line !== tokenAfterColon.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], tokenAfterColon.range[0]],
                                " ",
                            ),
                            message: "'(' should be on same line as ':'",
                            node: tokenAfterColon,
                        });
                    }

                    // JSX after ( should start on new line
                    const alternateStart = sourceCode.getTokenAfter(tokenAfterColon);

                    if (alternateStart && tokenAfterColon.loc.end.line === alternateStart.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterColon.range[1], alternateStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "Complex JSX should start on new line after '('",
                            node: alternate,
                        });
                    } else if (alternateStart && alternateStart.loc.start.line - tokenAfterColon.loc.end.line > 1) {
                        // Check for empty lines after ( in alternate
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterColon.range[1], alternateStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "No empty lines after '(' in ternary",
                            node: alternateStart,
                        });
                    }
                }

                // Final ) should be on its own line
                const lastToken = sourceCode.getLastToken(node);

                if (lastToken && lastToken.value === ")") {
                    const tokenBeforeLast = sourceCode.getTokenBefore(lastToken);

                    if (tokenBeforeLast && tokenBeforeLast.value !== "(" && tokenBeforeLast.loc.end.line === lastToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeLast.range[1], lastToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing ')' should be on new line",
                            node: lastToken,
                        });
                    } else if (tokenBeforeLast && tokenBeforeLast.value !== "(" && lastToken.loc.start.line - tokenBeforeLast.loc.end.line > 1) {
                        // Check for empty lines before final )
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeLast.range[1], lastToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "No empty lines before ')' in ternary",
                            node: lastToken,
                        });
                    }

                    // ) and } should be on same line: )}
                    if (closeBrace && closeBrace.value === "}" && lastToken.loc.end.line !== closeBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastToken.range[1], closeBrace.range[0]],
                                "",
                            ),
                            message: "Closing ')}' should be together on same line",
                            node: closeBrace,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent formatting for JSX ternary expressions" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Member Expression Bracket Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No spaces inside brackets in computed member expressions.
 *   The property name should touch both brackets.
 *
 * ✓ Good:
 *   arr[value]
 *   obj[key]
 *
 * ✗ Bad:
 *   arr[ value ]
 *   obj[ key ]
 */
const memberExpressionBracketSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkBracketSpacingHandler = (node, objectPart, indexPart) => {
            const openBracket = sourceCode.getTokenBefore(indexPart);
            const closeBracket = sourceCode.getTokenAfter(indexPart);

            if (!openBracket || openBracket.value !== "[") return;
            if (!closeBracket || closeBracket.value !== "]") return;

            // Check for space before [ (between object and bracket)
            const objectLastToken = sourceCode.getLastToken(objectPart);

            if (objectLastToken) {
                const textBeforeOpen = sourceCode.text.slice(objectLastToken.range[1], openBracket.range[0]);

                if (/\s/.test(textBeforeOpen)) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [objectLastToken.range[1], openBracket.range[0]],
                            "",
                        ),
                        message: "No space before opening bracket in member expression",
                        node: openBracket,
                    });
                }
            }

            // Check for space after [
            const textAfterOpen = sourceCode.text.slice(openBracket.range[1], indexPart.range[0]);

            if (textAfterOpen.includes(" ") || textAfterOpen.includes("\n")) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBracket.range[1], indexPart.range[0]],
                        "",
                    ),
                    message: "No space after opening bracket in member expression",
                    node: openBracket,
                });
            }

            // Check for space before ]
            const textBeforeClose = sourceCode.text.slice(indexPart.range[1], closeBracket.range[0]);

            if (textBeforeClose.includes(" ") || textBeforeClose.includes("\n")) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [indexPart.range[1], closeBracket.range[0]],
                        "",
                    ),
                    message: "No space before closing bracket in member expression",
                    node: closeBracket,
                });
            }
        };

        return {
            MemberExpression(node) {
                // Only check computed member expressions (bracket notation)
                if (!node.computed) return;

                checkBracketSpacingHandler(node, node.object, node.property);
            },

            // Handle TypeScript indexed access types: Type["prop"]
            TSIndexedAccessType(node) {
                checkBracketSpacingHandler(node, node.objectType, node.indexType);
            },
        };
    },
    meta: {
        docs: { description: "Enforce no spaces inside brackets for member expressions" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Arguments Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce consistent formatting for function call arguments.
 *   When arguments exceed minArgs OR any argument is multiline,
 *   each argument should be on its own line with proper indentation.
 *
 * Options:
 *   - minArgs: Minimum arguments to enforce multiline (default: 2)
 *   - skipHooks: Skip React hooks (default: true)
 *   - skipSingleArg: Skip single arg patterns like objects, arrays, callbacks (default: true)
 *
 * ✓ Good:
 *   fn(a);
 *   fn(
 *       arg1,
 *       arg2,
 *   );
 *
 * ✗ Bad:
 *   fn(arg1, arg2);
 *   fn(arg1,
 *       arg2);
 */
const functionArgumentsFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const minArgs = options.minArgs !== undefined ? options.minArgs : 2;
        const skipHooks = options.skipHooks !== undefined ? options.skipHooks : true;
        const skipSingleArg = options.skipSingleArg !== undefined ? options.skipSingleArg : true;

        const reactHooks = [
            "useEffect",
            "useCallback",
            "useMemo",
            "useLayoutEffect",
            "useImperativeHandle",
            "useReducer",
            "useRef",
            "useState",
            "useContext",
            "useDebugValue",
            "useDeferredValue",
            "useTransition",
            "useId",
            "useSyncExternalStore",
            "useInsertionEffect",
        ];

        const isReactHookHandler = (node) => {
            if (node.callee.type === "Identifier") {
                return reactHooks.includes(node.callee.name);
            }

            return false;
        };

        const hasMultilineArgHandler = (args) => args.some((arg) => arg.loc.start.line !== arg.loc.end.line);

        const checkCallExpressionHandler = (node) => {
            // Skip React hooks if option enabled
            if (skipHooks && isReactHookHandler(node)) return;

            const args = node.arguments;

            if (args.length === 0) return;

            // Skip single argument patterns if option enabled
            if (skipSingleArg && args.length === 1) {
                if (args[0].type === "ObjectExpression") return;
                if (args[0].type === "ArrayExpression") return;
                if (args[0].type === "ArrowFunctionExpression") return;
                if (args[0].type === "FunctionExpression") return;
            }

            // Check if formatting should be enforced:
            // 1. Arguments count >= minArgs, OR
            // 2. Any argument is multiline
            const hasEnoughArgs = args.length >= minArgs;
            const hasMultilineArg = hasMultilineArgHandler(args);

            if (!hasEnoughArgs && !hasMultilineArg) return;

            const openParen = sourceCode.getTokenAfter(
                node.callee,
                (token) => token.value === "(",
            );
            const closeParen = sourceCode.getLastToken(node);

            if (!openParen || !closeParen || closeParen.value !== ")") return;

            const firstArg = args[0];
            const lastArg = args[args.length - 1];

            // Calculate indent
            const callLine = sourceCode.lines[node.loc.start.line - 1];
            const baseIndent = callLine.match(/^\s*/)[0];
            const argIndent = baseIndent + "    ";

            // First arg should be on new line after opening paren
            if (openParen.loc.end.line === firstArg.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], firstArg.range[0]],
                        "\n" + argIndent,
                    ),
                    message: "With multiple arguments, first argument should be on its own line: fn(\\n    arg1,\\n    arg2,\\n)",
                    node: firstArg,
                });
            }

            // Each arg should be on its own line
            for (let i = 0; i < args.length - 1; i += 1) {
                const current = args[i];
                const next = args[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    if (commaToken) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + argIndent,
                            ),
                            message: "Each argument should be on its own line",
                            node: next,
                        });
                    }
                }
            }

            // Closing paren should be on its own line
            if (closeParen.loc.start.line === lastArg.loc.end.line) {
                const tokenBeforeClose = sourceCode.getTokenBefore(closeParen);
                const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                context.report({
                    fix: (fixer) => {
                        if (hasTrailingComma) {
                            return fixer.replaceTextRange(
                                [tokenBeforeClose.range[1], closeParen.range[0]],
                                "\n" + baseIndent,
                            );
                        }

                        return fixer.replaceTextRange(
                            [lastArg.range[1], closeParen.range[0]],
                            ",\n" + baseIndent,
                        );
                    },
                    message: "Closing parenthesis should be on its own line",
                    node: closeParen,
                });
            }
        };

        return { CallExpression: checkCallExpressionHandler };
    },
    meta: {
        docs: { description: "Enforce function arguments formatting: each argument on its own line when >= minArgs (default: 2) or any argument is multiline" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    minArgs: {
                        default: 2,
                        description: "Minimum arguments to enforce multiline formatting (default: 2)",
                        minimum: 1,
                        type: "integer",
                    },
                    skipHooks: {
                        default: true,
                        description: "Skip React hooks (default: true)",
                        type: "boolean",
                    },
                    skipSingleArg: {
                        default: true,
                        description: "Skip single argument patterns like objects, arrays, callbacks (default: true)",
                        type: "boolean",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Nested Call Closing Brackets
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Nested function calls (like styled-components) should have
 *   closing brackets on the same line: }));
 *
 * ✓ Good:
 *   styled(Card)(({ theme }) => ({
 *       color: theme.color,
 *   }));
 *
 * ✗ Bad:
 *   styled(Card)(({ theme }) => ({
 *       color: theme.color,
 *   })
 *   );
 */
const nestedCallClosingBrackets = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Helper to check and fix closing brackets pattern for arrow returning object
        const checkArrowReturningObjectHandler = (node, objectBody) => {
            // Find closing tokens: } ) ) (may have comma)
            const closeBrace = sourceCode.getLastToken(objectBody);
            const closeParenAfterObject = sourceCode.getTokenAfter(objectBody);

            if (!closeParenAfterObject || closeParenAfterObject.value !== ")") return;

            // Get next token - might be comma or second close paren
            let nextToken = sourceCode.getTokenAfter(closeParenAfterObject);

            // Skip trailing comma if present: }),) or })\n),\n)
            if (nextToken && nextToken.value === ",") {
                nextToken = sourceCode.getTokenAfter(nextToken);
            }

            const closeParenOuter = nextToken;

            if (!closeParenOuter || closeParenOuter.value !== ")") return;

            // Check if } and first ) are on different lines
            if (closeBrace.loc.end.line !== closeParenAfterObject.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeBrace.range[1], closeParenAfterObject.range[0]],
                        "",
                    ),
                    message: "Closing brace and parenthesis should be on the same line: })",
                    node: closeParenAfterObject,
                });

                return;
            }

            // Check if first ) and second ) are on different lines (account for comma)
            if (closeParenAfterObject.loc.end.line !== closeParenOuter.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeParenAfterObject.range[1], closeParenOuter.range[0]],
                        "",
                    ),
                    message: "Closing parentheses should be on the same line: ))",
                    node: closeParenOuter,
                });

                return;
            }

            // Check for || [] pattern after })) - should be on same line
            const tokenAfterOuterParen = sourceCode.getTokenAfter(closeParenOuter);

            if (tokenAfterOuterParen && tokenAfterOuterParen.value === "||") {
                if (closeParenOuter.loc.end.line !== tokenAfterOuterParen.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [closeParenOuter.range[1], tokenAfterOuterParen.range[0]],
                            " ",
                        ),
                        message: "Logical operator || should be on the same line as closing ))",
                        node: tokenAfterOuterParen,
                    });
                }
            }
        };

        // Helper to check },\n); pattern - ONLY for single object/array argument calls
        // This should NOT apply to multi-argument calls like useEffect, useMemo, etc.
        const checkClosingBraceParenPatternHandler = (node) => {
            const { arguments: args } = node;

            // Only apply to single argument calls
            if (args.length !== 1) return;

            const lastArg = args[0];

            // Find the actual closing brace - could be from object, array, or TSAsExpression with type literal
            let closingBrace = null;

            if (lastArg.type === "ObjectExpression" || lastArg.type === "ArrayExpression") {
                closingBrace = sourceCode.getLastToken(lastArg);
            } else if (lastArg.type === "ArrowFunctionExpression") {
                const body = lastArg.body;

                if (body.type === "TSAsExpression" && body.typeAnnotation && body.typeAnnotation.type === "TSTypeLiteral") {
                    closingBrace = sourceCode.getLastToken(body.typeAnnotation);
                } else if (body.type === "ObjectExpression" || body.type === "ArrayExpression") {
                    closingBrace = sourceCode.getLastToken(body);
                }
            }

            if (!closingBrace || (closingBrace.value !== "}" && closingBrace.value !== "]")) return;

            // Get the close paren of the function call
            const closeParen = sourceCode.getLastToken(node);

            if (!closeParen || closeParen.value !== ")") return;

            // Check if there's a newline between the closing brace/type and the close paren
            const tokenAfterBrace = sourceCode.getTokenAfter(closingBrace);

            // Handle trailing comma case: }, or ],
            let lastTokenBeforeParen = closingBrace;

            if (tokenAfterBrace && tokenAfterBrace.value === ",") {
                lastTokenBeforeParen = tokenAfterBrace;
            }

            if (lastTokenBeforeParen.loc.end.line !== closeParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastTokenBeforeParen.range[1], closeParen.range[0]],
                        "",
                    ),
                    message: "Closing parenthesis should be on same line as closing brace: });",
                    node: closeParen,
                });
            }
        };

        return {
            CallExpression(node) {
                const { callee, arguments: args } = node;

                // Check for },\n); pattern - only for single argument calls
                checkClosingBraceParenPatternHandler(node);

                if (args.length !== 1) return;

                const arg = args[0];

                // Check for arrow function with object expression body
                if (arg.type !== "ArrowFunctionExpression" || arg.body.type !== "ObjectExpression") return;

                // Pattern 1: fn()(arg) where fn() is also a CallExpression
                // e.g., styled(Card)(({ theme }) => ({...}))
                if (callee.type === "CallExpression") {
                    checkArrowReturningObjectHandler(node, arg.body);

                    return;
                }

                // Pattern 2: obj.method(arg) where method is like .map()
                // e.g., array.map(item => ({...})) || []
                if (callee.type === "MemberExpression") {
                    checkArrowReturningObjectHandler(node, arg.body);
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce nested function call closing brackets on same line: }));" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Function Calls
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function call arguments should not have empty lines between
 *   them or after opening/before closing parentheses.
 *
 * ✓ Good:
 *   fn(
 *       arg1,
 *       arg2,
 *   )
 *
 * ✗ Bad:
 *   fn(
 *       arg1,
 *
 *       arg2,
 *   )
 */
const noEmptyLinesInFunctionCalls = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isSimpleArgHandler = (arg) => [
            "Literal",
            "Identifier",
            "MemberExpression",
            "TemplateLiteral",
        ].includes(arg.type);

        const isSingleLineArgHandler = (arg) => arg.loc.start.line === arg.loc.end.line;

        const isSinglePropertyObjectHandler = (arg) => arg.type === "ObjectExpression" && arg.properties.length === 1;

        const getCleanObjectTextHandler = (arg) => {
            const prop = arg.properties[0];

            if (prop.type === "SpreadElement") return sourceCode.getText(arg);

            const keyText = sourceCode.getText(prop.key);
            const valueText = sourceCode.getText(prop.value);

            return `{ ${keyText}: ${valueText} }`;
        };

        const checkCallExpressionHandler = (node) => {
            const args = node.arguments;

            if (args.length === 0) return;

            const openParen = sourceCode.getTokenAfter(
                node.callee,
                (token) => token.value === "(",
            );
            const closeParen = sourceCode.getLastToken(node);

            if (!openParen || !closeParen || closeParen.value !== ")") return;

            const firstArg = args[0];
            const lastArg = args[args.length - 1];

            // Single simple argument on different line should be collapsed
            if (args.length === 1 && (isSimpleArgHandler(firstArg) || isSinglePropertyObjectHandler(firstArg)) && isSingleLineArgHandler(firstArg)) {
                if (firstArg.loc.start.line !== openParen.loc.end.line) {
                    const argText = isSinglePropertyObjectHandler(firstArg)
                        ? getCleanObjectTextHandler(firstArg)
                        : sourceCode.getText(firstArg);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], closeParen.range[0]],
                            argText,
                        ),
                        message: "Single simple argument should be on the same line as function call",
                        node: firstArg,
                    });

                    return;
                }
            }

            if (firstArg.loc.start.line - openParen.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], firstArg.range[0]],
                        "\n" + " ".repeat(firstArg.loc.start.column),
                    ),
                    message: "No empty line after opening parenthesis in function call",
                    node: firstArg,
                });
            }

            if (closeParen.loc.start.line - lastArg.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastArg.range[1], closeParen.range[0]],
                        "\n" + " ".repeat(closeParen.loc.start.column),
                    ),
                    message: "No empty line before closing parenthesis in function call",
                    node: lastArg,
                });
            }

            for (let i = 0; i < args.length - 1; i += 1) {
                const current = args[i];
                const next = args[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty line between function arguments",
                        node: next,
                    });
                }
            }
        };

        return { CallExpression: checkCallExpressionHandler };
    },
    meta: {
        docs: { description: "Disallow empty lines in function calls and enforce single simple argument on same line" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Function Params
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function parameter lists should not contain empty lines
 *   between parameters or after opening/before closing parens.
 *   Also checks inside ObjectPattern (destructuring) params for
 *   empty lines after {, before }, or between properties.
 *
 * ✓ Good:
 *   function test(
 *       param1,
 *       param2,
 *   ) {}
 *
 *   const Button = ({
 *       children,
 *       className,
 *   }) => {};
 *
 * ✗ Bad:
 *   function test(
 *       param1,
 *
 *       param2,
 *   ) {}
 *
 *   const Button = ({
 *
 *       children,
 *       className,
 *   }) => {};
 */
const noEmptyLinesInFunctionParams = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkFunctionHandler = (node) => {
            const params = node.params;

            if (params.length === 0) return;

            const firstParam = params[0];
            const lastParam = params[params.length - 1];

            // Find opening paren - must be WITHIN this function's range (not from an outer call expression)
            const tokenBeforeFirstParam = sourceCode.getTokenBefore(firstParam);
            // Check that the ( is within this function's range (not from .map( or similar)
            const hasParenAroundParams = tokenBeforeFirstParam
                && tokenBeforeFirstParam.value === "("
                && tokenBeforeFirstParam.range[0] >= node.range[0];

            // Only check open/close paren spacing if params are wrapped in parentheses
            if (hasParenAroundParams) {
                const openParen = tokenBeforeFirstParam;
                const closeParen = sourceCode.getTokenAfter(lastParam);

                // Verify closeParen is actually a ) right after lastParam AND within this function's range
                if (closeParen && closeParen.value === ")" && closeParen.range[1] <= (node.body ? node.body.range[0] : node.range[1])) {
                    if (firstParam.loc.start.line - openParen.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openParen.range[1], firstParam.range[0]],
                                "\n" + " ".repeat(firstParam.loc.start.column),
                            ),
                            message: "No empty line after opening parenthesis in function parameters",
                            node: firstParam,
                        });
                    }

                    if (closeParen.loc.start.line - lastParam.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastParam.range[1], closeParen.range[0]],
                                "\n" + " ".repeat(closeParen.loc.start.column),
                            ),
                            message: "No empty line before closing parenthesis in function parameters",
                            node: lastParam,
                        });
                    }
                }
            }

            for (let i = 0; i < params.length - 1; i += 1) {
                const current = params[i];
                const next = params[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty line between function parameters",
                        node: next,
                    });
                }
            }

            // Check inside ObjectPattern params for empty lines between destructured props
            params.forEach((param) => {
                if (param.type === "ObjectPattern" && param.properties.length > 0) {
                    const firstProp = param.properties[0];
                    const lastProp = param.properties[param.properties.length - 1];

                    // Find the opening brace of ObjectPattern
                    const openBrace = sourceCode.getFirstToken(param);

                    if (openBrace && openBrace.value === "{") {
                        // Check for empty line after opening brace
                        if (firstProp.loc.start.line - openBrace.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [openBrace.range[1], firstProp.range[0]],
                                    "\n" + " ".repeat(firstProp.loc.start.column),
                                ),
                                message: "No empty line after opening brace in destructuring",
                                node: firstProp,
                            });
                        }
                    }

                    // Find the closing brace of ObjectPattern (first } after last prop, not last token which could be from type annotation)
                    const closeBrace = sourceCode.getTokenAfter(lastProp, (t) => t.value === "}");

                    if (closeBrace) {
                        // Check for empty line before closing brace
                        if (closeBrace.loc.start.line - lastProp.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastProp.range[1], closeBrace.range[0]],
                                    "\n" + " ".repeat(closeBrace.loc.start.column),
                                ),
                                message: "No empty line before closing brace in destructuring",
                                node: lastProp,
                            });
                        }
                    }

                    // Check for empty lines between properties
                    if (param.properties.length > 1) {
                        for (let i = 0; i < param.properties.length - 1; i += 1) {
                            const current = param.properties[i];
                            const next = param.properties[i + 1];

                            if (next.loc.start.line - current.loc.end.line > 1) {
                                const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [commaToken.range[1], next.range[0]],
                                        "\n" + " ".repeat(next.loc.start.column),
                                    ),
                                    message: "No empty lines between destructured properties",
                                    node: next,
                                });
                            }
                        }
                    }
                }
            });
        };

        // Check TSTypeLiteral for empty lines (type annotation objects like { prop: Type })
        const checkTypeLiteralHandler = (node) => {
            if (!node.members || node.members.length === 0) return;

            const firstMember = node.members[0];
            const lastMember = node.members[node.members.length - 1];

            // Find opening brace
            const openBrace = sourceCode.getFirstToken(node);

            if (openBrace && openBrace.value === "{") {
                // Check for empty line after opening brace
                if (firstMember.loc.start.line - openBrace.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], firstMember.range[0]],
                            "\n" + " ".repeat(firstMember.loc.start.column),
                        ),
                        message: "No empty line after opening brace in type definition",
                        node: firstMember,
                    });
                }
            }

            // Find closing brace
            const closeBrace = sourceCode.getLastToken(node);

            if (closeBrace && closeBrace.value === "}") {
                // Check for empty line before closing brace
                if (closeBrace.loc.start.line - lastMember.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBrace.range[0]],
                            "\n" + " ".repeat(closeBrace.loc.start.column),
                        ),
                        message: "No empty line before closing brace in type definition",
                        node: lastMember,
                    });
                }
            }

            // Check for empty lines between members
            for (let i = 0; i < node.members.length - 1; i += 1) {
                const current = node.members[i];
                const next = node.members[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [current.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty lines between type members",
                        node: next,
                    });
                }
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            TSTypeLiteral: checkTypeLiteralHandler,
        };
    },
    meta: {
        docs: { description: "Disallow empty lines in function parameters and type definitions" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In JSX
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX elements should not contain empty lines between children
 *   or after opening/before closing tags.
 *
 * ✓ Good:
 *   <div>
 *       <span>text</span>
 *       <span>more</span>
 *   </div>
 *
 * ✗ Bad:
 *   <div>
 *
 *       <span>text</span>
 *
 *       <span>more</span>
 *
 *   </div>
 */
const noEmptyLinesInJsx = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkJSXElementHandler = (node) => {
            const {
                children,
                closingElement,
                openingElement,
            } = node;

            // Skip self-closing elements
            if (!closingElement) return;

            const filteredChildren = children.filter((c) => c.type !== "JSXText" || c.value.trim() !== "");

            if (filteredChildren.length === 0) return;

            const firstChild = filteredChildren[0];
            const lastChild = filteredChildren[filteredChildren.length - 1];

            // Check for empty line after opening tag
            if (firstChild.loc.start.line - openingElement.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openingElement.range[1], firstChild.range[0]],
                        "\n" + " ".repeat(firstChild.loc.start.column),
                    ),
                    message: "No empty line after opening JSX tag",
                    node: firstChild,
                });
            }

            // Check for empty line before closing tag
            if (closingElement.loc.start.line - lastChild.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastChild.range[1], closingElement.range[0]],
                        "\n" + " ".repeat(closingElement.loc.start.column),
                    ),
                    message: "No empty line before closing JSX tag",
                    node: closingElement,
                });
            }
        };

        const isSingleLineAttrHandler = (attr) => attr.loc.start.line === attr.loc.end.line;

        const checkJSXOpeningElementHandler = (node) => {
            const {
                attributes,
                name,
            } = node;

            const elementName = sourceCode.getFirstToken(name);
            const closingBracket = sourceCode.getLastToken(node);

            if (attributes.length === 0) return;

            const firstAttr = attributes[0];
            const lastAttr = attributes[attributes.length - 1];
            const isSingleLineElement = elementName.loc.start.line === closingBracket.loc.end.line;
            const hasSimpleProps = attributes.length === 1 && isSingleLineAttrHandler(firstAttr);

            // Check for no space before closing bracket in non-self-closing element
            if (!node.selfClosing && hasSimpleProps && isSingleLineElement) {
                const tokenBeforeClosing = sourceCode.getTokenBefore(closingBracket);

                if (tokenBeforeClosing) {
                    const textBetween = sourceCode.text.slice(
                        tokenBeforeClosing.range[1],
                        closingBracket.range[0],
                    );

                    if (textBetween.includes(" ") || textBetween.includes("\n")) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeClosing.range[1], closingBracket.range[0]],
                                "",
                            ),
                            message: "No space before closing bracket in non-self-closing JSX element",
                            node: closingBracket,
                        });
                    }
                }
            }

            // Single simple prop on different line should be collapsed
            if (attributes.length === 1 && isSingleLineAttrHandler(firstAttr)) {
                if (firstAttr.loc.start.line !== elementName.loc.end.line) {
                    const attrText = sourceCode.getText(firstAttr);
                    const isSelfClosing = node.selfClosing;
                    let endRange = closingBracket.range[0];
                    let closingText = "";

                    if (isSelfClosing) {
                        // Keep endRange as closingBracket.range[0] to include the "/" in the replaced range
                        closingText = " /";
                    }

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [elementName.range[1], endRange],
                            ` ${attrText}${closingText}`,
                        ),
                        message: "Single simple JSX prop should be on the same line as element",
                        node: firstAttr,
                    });

                    return;
                }
            }

            if (firstAttr.loc.start.line - elementName.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [elementName.range[1], firstAttr.range[0]],
                        "\n" + " ".repeat(firstAttr.loc.start.column),
                    ),
                    message: "No empty line after JSX element name",
                    node: firstAttr,
                });
            }

            let closingTokenStart = closingBracket.range[0];

            let closingIndent = closingBracket.loc.start.column;

            if (node.selfClosing) {
                const slashToken = sourceCode.getTokenBefore(closingBracket);

                if (slashToken && slashToken.value === "/") {
                    closingTokenStart = slashToken.range[0];

                    closingIndent = slashToken.loc.start.column;
                }
            }

            if (closingBracket.loc.start.line - lastAttr.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastAttr.range[1], closingTokenStart],
                        "\n" + " ".repeat(closingIndent),
                    ),
                    message: "No empty line before closing bracket",
                    node: lastAttr,
                });
            }

            for (let i = 0; i < attributes.length - 1; i += 1) {
                const current = attributes[i];

                const next = attributes[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [current.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty line between JSX props",
                        node: next,
                    });
                }
            }
        };

        const checkReturnStatementHandler = (node) => {
            const arg = node.argument;

            if (!arg) return;

            const sourceText = sourceCode.getText();

            // Check for empty line after opening parenthesis
            const textBefore = sourceText.slice(
                node.range[0],
                arg.range[0],
            );

            const openParenPos = textBefore.indexOf("(");

            if (openParenPos !== -1) {
                const afterParen = textBefore.slice(openParenPos + 1);

                if (afterParen.split("\n").length > 2) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [node.range[0] + openParenPos + 1, arg.range[0]],
                            "\n" + " ".repeat(arg.loc.start.column),
                        ),
                        message: "No empty line allowed after opening parenthesis in return",
                        node: arg,
                    });
                }
            }

            // Check for empty line before closing parenthesis
            const textAfter = sourceText.slice(
                arg.range[1],
                node.range[1],
            );

            const closeParenPos = textAfter.lastIndexOf(")");

            if (closeParenPos !== -1) {
                const beforeParen = textAfter.slice(0, closeParenPos);

                if (beforeParen.split("\n").length > 2) {
                    const closeParenIndex = arg.range[1] + closeParenPos;

                    const indent = sourceText.slice(
                        0,
                        closeParenIndex,
                    ).split("\n").pop().match(/^\s*/)[0];

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [arg.range[1], closeParenIndex],
                            "\n" + indent,
                        ),
                        message: "No empty line allowed before closing parenthesis in return",
                        node,
                    });
                }
            }
        };

        const checkArrowFunctionHandler = (node) => {
            if (!node.body || node.body.type === "BlockStatement") return;

            const body = node.body;
            const arrowToken = sourceCode.getTokenBefore(body, (t) => t.value === "=>");

            if (!arrowToken) return;

            const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

            // Check for opening parenthesis after arrow
            if (tokenAfterArrow && tokenAfterArrow.value === "(") {
                // Check for empty line after (
                if (body.loc.start.line - tokenAfterArrow.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenAfterArrow.range[1], body.range[0]],
                            "\n" + " ".repeat(body.loc.start.column),
                        ),
                        message: "No empty line allowed after opening parenthesis in arrow function",
                        node: body,
                    });
                }
            }

            const tokenAfter = sourceCode.getTokenAfter(body);

            if (tokenAfter && tokenAfter.value === ")" && tokenAfter.loc.start.line - body.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [body.range[1], tokenAfter.range[0]],
                        "\n" + " ".repeat(tokenAfter.loc.start.column),
                    ),
                    message: "No empty line allowed before closing parenthesis in arrow function",
                    node: body,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            JSXElement: checkJSXElementHandler,
            JSXOpeningElement: checkJSXOpeningElementHandler,
            ReturnStatement: checkReturnStatementHandler,
        };
    },
    meta: {
        docs: { description: "Disallow empty lines in JSX" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Objects
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Object literals should not contain empty lines between
 *   properties or after opening/before closing braces.
 *
 * ✓ Good:
 *   {
 *       a: 1,
 *       b: 2,
 *   }
 *
 * ✗ Bad:
 *   {
 *       a: 1,
 *
 *       b: 2,
 *   }
 */
const noEmptyLinesInObjects = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkObjectHandler = (node, isObjectPattern = false) => {
            const { properties } = node;

            if (properties.length === 0) return;

            // Skip ObjectPatterns with type annotations (component props with inline types)
            // These are handled by the component-props-inline-type rule
            if (isObjectPattern && node.typeAnnotation) return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);
            const firstProp = properties[0];
            const lastProp = properties[properties.length - 1];

            // Check for empty line after opening brace
            if (firstProp.loc.start.line - openBrace.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstProp.range[0]],
                        "\n" + " ".repeat(firstProp.loc.start.column),
                    ),
                    message: "No empty line after opening brace",
                    node: firstProp,
                });
            }

            // Check for empty line before closing brace
            if (closeBrace.loc.start.line - lastProp.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastProp.range[1], closeBrace.range[0]],
                        "\n" + " ".repeat(closeBrace.loc.start.column),
                    ),
                    message: "No empty line before closing brace",
                    node: lastProp,
                });
            }

            // Check for empty lines between properties
            for (let i = 0; i < properties.length - 1; i += 1) {
                const current = properties[i];
                const next = properties[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    let commaToken = sourceCode.getTokenAfter(current);

                    while (commaToken && commaToken.value !== "," && commaToken.range[0] < next.range[0]) {
                        commaToken = sourceCode.getTokenAfter(commaToken);
                    }

                    // Check if comma is on a different line than the property value end
                    // If so, move the comma to be directly after the property value
                    const commaOnDifferentLine = commaToken && commaToken.value === "," &&
                        commaToken.loc.start.line !== current.loc.end.line;

                    context.report({
                        fix: (fixer) => {
                            if (commaOnDifferentLine) {
                                // Replace from end of property value to start of next property
                                // This moves the comma to be right after the value
                                return fixer.replaceTextRange(
                                    [current.range[1], next.range[0]],
                                    ",\n" + " ".repeat(next.loc.start.column),
                                );
                            }

                            // Normal case: comma is on same line, just remove empty line after
                            return fixer.replaceTextRange(
                                [commaToken && commaToken.value === "," ? commaToken.range[1] : current.range[1], next.range[0]],
                                "\n" + " ".repeat(next.loc.start.column),
                            );
                        },
                        message: "No empty line between object properties",
                        node: next,
                    });
                }
            }
        };

        return {
            ObjectExpression: (node) => checkObjectHandler(node, false),
            ObjectPattern: (node) => checkObjectHandler(node, true),
        };
    },
    meta: {
        docs: { description: "Disallow empty lines in objects" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Switch Cases
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Switch case blocks should not have empty lines at the
 *   beginning of the case logic or between consecutive cases.
 *
 * ✓ Good:
 *   switch (value) {
 *       case 1:
 *           return "one";
 *       case 2:
 *           return "two";
 *   }
 *
 * ✗ Bad:
 *   switch (value) {
 *       case 1:
 *
 *           return "one";
 *
 *       case 2:
 *           return "two";
 *   }
 */
const noEmptyLinesInSwitchCases = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkSwitchCaseHandler = (node) => {
            const {
                consequent,
                test,
            } = node;

            const colon = sourceCode.getTokenAfter(
                test || sourceCode.getFirstToken(node),
                (t) => t.value === ":",
            );

            if (consequent.length > 0) {
                const firstStatement = consequent[0];

                const tokensBetween = sourceCode.getTokensBetween(
                    colon,
                    firstStatement,
                    { includeComments: true },
                );

                if (tokensBetween.length === 0 && firstStatement.loc.start.line - colon.loc.end.line > 1) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceTextRange(
                                [colon.range[1], firstStatement.range[0]],
                                `\n${" ".repeat(firstStatement.loc.start.column)}`,
                            );
                        },
                        message: "Empty line not allowed at the beginning of case logic",
                        node: firstStatement,
                    });
                }
            }
        };

        const checkSwitchStatementHandler = (node) => {
            const { cases } = node;

            for (let i = 0; i < cases.length - 1; i += 1) {
                const currentCase = cases[i];

                const nextCase = cases[i + 1];

                if (currentCase.consequent.length === 0) {
                    const colon = sourceCode.getTokenAfter(
                        currentCase.test || sourceCode.getFirstToken(currentCase),
                        (t) => t.value === ":",
                    );

                    const tokensBetween = sourceCode.getTokensBetween(
                        colon,
                        nextCase,
                        { includeComments: true },
                    );

                    if (tokensBetween.length === 0 && nextCase.loc.start.line - colon.loc.end.line > 1) {
                        context.report({
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [colon.range[1], nextCase.range[0]],
                                    `\n${" ".repeat(nextCase.loc.start.column)}`,
                                );
                            },
                            message: "Empty line not allowed between cases",
                            node: nextCase,
                        });
                    }
                }
            }
        };

        return {
            SwitchCase: checkSwitchCaseHandler,
            SwitchStatement: checkSwitchStatementHandler,
        };
    },
    meta: {
        docs: { description: "Prevent empty lines at the beginning of switch case logic or between cases" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Object Property Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When an object has minProperties or more properties,
 *   enforces multiline formatting with:
 *   - Newline after opening `{`
 *   - Each property on its own line
 *   - Newline before closing `}`
 *
 *   This rule handles complete object multiline formatting.
 *
 * Options:
 *   { minProperties: 2 } - Enforce multiline when >= 2 properties
 *
 * ✓ Good:
 *   const obj = {
 *       name: "John",
 *       age: 30,
 *   };
 *
 * ✗ Bad:
 *   const obj = { name: "John", age: 30 };
 *   const obj = { name: "John",
 *       age: 30 };
 */
const objectPropertyPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const minProperties = options.minProperties !== undefined ? options.minProperties : 2;

        // Check if a value can be collapsed to single line
        const canCollapse = (valueNode) => {
            if (!valueNode) return true;

            // Simple values can always be collapsed
            if (["Literal", "Identifier", "MemberExpression", "UnaryExpression"].includes(valueNode.type)) {
                return true;
            }

            // Template literals: can only collapse if single-line (multi-line templates would break)
            if (valueNode.type === "TemplateLiteral") {
                return valueNode.loc.start.line === valueNode.loc.end.line;
            }

            // Call expressions: can only collapse if already on single line
            if (valueNode.type === "CallExpression") {
                return valueNode.loc.start.line === valueNode.loc.end.line;
            }

            // Arrow functions: can only collapse if already on single line
            if (valueNode.type === "ArrowFunctionExpression") {
                return valueNode.loc.start.line === valueNode.loc.end.line;
            }

            // Conditional expressions (ternary): can collapse if short enough
            if (valueNode.type === "ConditionalExpression") {
                const text = sourceCode.getText(valueNode).replace(/\s*\n\s*/g, " ").trim();

                return text.length <= 80;
            }

            // Logical expressions: can collapse if short enough
            if (valueNode.type === "LogicalExpression") {
                const text = sourceCode.getText(valueNode).replace(/\s*\n\s*/g, " ").trim();

                return text.length <= 80;
            }

            // Binary expressions: can collapse if short enough
            if (valueNode.type === "BinaryExpression") {
                const text = sourceCode.getText(valueNode).replace(/\s*\n\s*/g, " ").trim();

                return text.length <= 80;
            }

            // Spread elements: check if the argument can be collapsed
            if (valueNode.type === "SpreadElement") {
                return canCollapse(valueNode.argument);
            }

            // Arrays: can collapse only if already on single line (let array-items-per-line handle it)
            if (valueNode.type === "ArrayExpression") {
                const isAlreadySingleLine = valueNode.loc.start.line === valueNode.loc.end.line;

                return isAlreadySingleLine;
            }

            // Objects: can collapse if fewer than minProperties and all values can collapse
            if (valueNode.type === "ObjectExpression") {
                const { properties } = valueNode;

                if (properties.length === 0) return true;

                if (properties.length >= minProperties) return false;

                // Check all property values can be collapsed (handle SpreadElement)
                return properties.every((prop) => {
                    if (prop.type === "SpreadElement") return canCollapse(prop.argument);

                    return canCollapse(prop.value);
                });
            }

            // Other complex types (functions, etc.) cannot be collapsed
            return false;
        };

        // Generate collapsed single-line text for a value
        const getCollapsedText = (valueNode) => {
            if (!valueNode) return "";

            // Arrays: use source text since it's already formatted by array-items-per-line
            if (valueNode.type === "ArrayExpression") {
                return sourceCode.getText(valueNode).replace(/\s+/g, " ").trim();
            }

            if (valueNode.type === "ObjectExpression") {
                const { properties } = valueNode;

                if (properties.length === 0) return "{}";

                const propsText = properties.map((prop) => {
                    // Handle SpreadElement (e.g., ...obj)
                    if (prop.type === "SpreadElement") {
                        return `...${getCollapsedText(prop.argument)}`;
                    }

                    const keyText = prop.computed ? `[${sourceCode.getText(prop.key)}]` : sourceCode.getText(prop.key);
                    const valueText = getCollapsedText(prop.value);

                    return prop.shorthand ? keyText : `${keyText}: ${valueText}`;
                }).join(", ");

                return `{ ${propsText} }`;
            }

            return sourceCode.getText(valueNode).trim();
        };

        const checkObjectHandler = (node) => {
            const { properties } = node;

            // Skip empty objects
            if (properties.length === 0) return;

            // Skip ObjectPatterns that are function parameters or inside function parameters
            // These are handled by function-params-per-line rule
            if (node.type === "ObjectPattern") {
                let parent = node.parent;

                while (parent) {
                    // Direct function parameter
                    if (
                        (parent.type === "FunctionDeclaration"
                        || parent.type === "FunctionExpression"
                        || parent.type === "ArrowFunctionExpression")
                        && parent.params && parent.params.includes(node)
                    ) {
                        return;
                    }

                    // Nested inside another ObjectPattern that's a function param
                    if (parent.type === "Property" && parent.parent && parent.parent.type === "ObjectPattern") {
                        // Continue up to check if the root ObjectPattern is a function param
                        parent = parent.parent;

                        continue;
                    }

                    // ObjectPattern inside function params array
                    if (
                        (parent.type === "FunctionDeclaration"
                        || parent.type === "FunctionExpression"
                        || parent.type === "ArrowFunctionExpression")
                    ) {
                        // Check if we came from params
                        let current = node;
                        let isInParams = false;

                        while (current && current !== parent) {
                            if (parent.params && parent.params.some((p) => p === current || isDescendant(p, current))) {
                                isInParams = true;

                                break;
                            }

                            current = current.parent;
                        }

                        if (isInParams) return;
                    }

                    parent = parent.parent;
                }
            }

            // Helper to check if node is descendant of another
            function isDescendant(ancestor, node) {
                let current = node;

                while (current) {
                    if (current === ancestor) return true;

                    current = current.parent;
                }

                return false;
            }

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);
            const firstProperty = properties[0];
            const lastProperty = properties[properties.length - 1];

            if (!openBrace || !closeBrace || openBrace.value !== "{" || closeBrace.value !== "}") return;

            // COLLAPSE: Objects with fewer than minProperties should be on single line if possible
            if (properties.length < minProperties) {
                const isMultiline = openBrace.loc.start.line !== closeBrace.loc.end.line;

                // Check if all property values can be collapsed (handle SpreadElement)
                const allCanCollapse = properties.every((prop) => {
                    if (prop.type === "SpreadElement") return canCollapse(prop.argument);

                    return canCollapse(prop.value);
                });

                if (isMultiline && allCanCollapse) {
                    // Generate collapsed text for all properties
                    const propertiesText = properties.map((prop) => {
                        // Handle SpreadElement (e.g., ...obj)
                        if (prop.type === "SpreadElement") {
                            return `...${getCollapsedText(prop.argument)}`;
                        }

                        const keyText = prop.computed ? `[${sourceCode.getText(prop.key)}]` : sourceCode.getText(prop.key);
                        const valueText = getCollapsedText(prop.value);

                        return prop.shorthand ? keyText : `${keyText}: ${valueText}`;
                    }).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{ ${propertiesText} }`,
                        ),
                        message: `Objects with <${minProperties} properties should be single line: { key: value }. Multi-line only for ${minProperties}+ properties`,
                        node,
                    });

                    return;
                }

                // If can't fully collapse, still check for partial formatting issues
                if (!allCanCollapse && isMultiline) {
                    // Object has complex nested value that can't collapse
                    // Just ensure proper multiline formatting
                    const objectIndent = " ".repeat(openBrace.loc.start.column);
                    const propertyIndent = objectIndent + "    ";

                    // First property should be on new line
                    if (openBrace.loc.end.line === firstProperty.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], firstProperty.range[0]],
                                "\n" + propertyIndent,
                            ),
                            message: "Property with complex value should be on its own line",
                            node: firstProperty,
                        });
                    }

                    // Closing brace should be on new line
                    if (closeBrace.loc.start.line === lastProperty.loc.end.line) {
                        context.report({
                            fix: (fixer) => {
                                const afterLastToken = sourceCode.getTokenAfter(lastProperty);
                                const hasTrailingComma = afterLastToken && afterLastToken.value === ",";

                                if (hasTrailingComma) {
                                    return fixer.replaceTextRange(
                                        [afterLastToken.range[1], closeBrace.range[0]],
                                        "\n" + objectIndent,
                                    );
                                }

                                return fixer.replaceTextRange(
                                    [lastProperty.range[1], closeBrace.range[0]],
                                    ",\n" + objectIndent,
                                );
                            },
                            message: "Closing brace should be on its own line for object with complex value",
                            node: closeBrace,
                        });
                    }
                }

                return;
            }

            // EXPAND: Objects with minProperties or more should be multiline
            // Calculate proper indentation based on the object's position
            const objectIndent = " ".repeat(openBrace.loc.start.column);
            const propertyIndent = objectIndent + "    ";

            // Check if first property is on same line as opening brace
            if (openBrace.loc.end.line === firstProperty.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstProperty.range[0]],
                        "\n" + propertyIndent,
                    ),
                    message: `Objects with ${minProperties}+ properties should have first property on its own line`,
                    node: firstProperty,
                });
            }

            // Check if closing brace is on same line as last property
            if (closeBrace.loc.start.line === lastProperty.loc.end.line) {
                context.report({
                    fix: (fixer) => {
                        const lastToken = sourceCode.getLastToken(lastProperty);
                        const afterLastToken = sourceCode.getTokenAfter(lastProperty);
                        const hasTrailingComma = afterLastToken && afterLastToken.value === ",";

                        if (hasTrailingComma) {
                            return fixer.replaceTextRange(
                                [afterLastToken.range[1], closeBrace.range[0]],
                                "\n" + objectIndent,
                            );
                        }

                        return fixer.replaceTextRange(
                            [lastToken.range[1], closeBrace.range[0]],
                            ",\n" + objectIndent,
                        );
                    },
                    message: `Objects with ${minProperties}+ properties should have closing brace on its own line`,
                    node: closeBrace,
                });
            }

            // Check each property is on its own line
            for (let i = 0; i < properties.length - 1; i += 1) {
                const current = properties[i];
                const next = properties[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + propertyIndent,
                        ),
                        message: "Each property should be on its own line",
                        node: next,
                    });
                }
            }

            // Check SpreadElements with LogicalExpression - they should be on one line
            // e.g., ...subAccounts && { subAccounts } should NOT be split across lines
            for (const prop of properties) {
                if (prop.type === "SpreadElement" && prop.argument) {
                    const arg = prop.argument;

                    // Check if ... is on a different line than the argument (e.g., "...\n    arg")
                    const spreadOnDifferentLine = prop.loc.start.line !== arg.loc.start.line;

                    // Check if it's a LogicalExpression that spans multiple lines
                    const logicalExpressionSpansLines = arg.type === "LogicalExpression"
                        && arg.loc.start.line !== arg.loc.end.line;

                    if (spreadOnDifferentLine || logicalExpressionSpansLines) {
                        // For LogicalExpression, check if it can be collapsed
                        if (arg.type === "LogicalExpression") {
                            const rightIsSimpleObject = arg.right.type === "ObjectExpression"
                                && arg.right.properties.length === 1
                                && arg.right.properties[0].type !== "SpreadElement";

                            if (rightIsSimpleObject || arg.right.type === "Identifier") {
                                // Collapse to single line and ensure no space after ...
                                const spreadText = sourceCode.getText(prop)
                                    .replace(/\s*\n\s*/g, " ")
                                    .replace(/\.\.\.\s+/, "...")
                                    .trim();

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop, spreadText),
                                    message: "Spread element with logical expression should be on a single line",
                                    node: prop,
                                });
                            }
                        } else if (spreadOnDifferentLine) {
                            // For non-LogicalExpression, just collapse the ... and argument to same line
                            const spreadText = sourceCode.getText(prop)
                                .replace(/\s*\n\s*/g, " ")
                                .replace(/\.\.\.\s+/, "...")
                                .trim();

                            context.report({
                                fix: (fixer) => fixer.replaceText(prop, spreadText),
                                message: "Spread operator should be on the same line as its argument",
                                node: prop,
                            });
                        }
                    }
                }
            }
        };

        return {
            ObjectExpression: checkObjectHandler,
            ObjectPattern: checkObjectHandler,
        };
    },
    meta: {
        docs: { description: "Enforce object formatting: collapse to single line when < minProperties (including nested objects/arrays), expand to multiline when >= minProperties" },
        fixable: "whitespace",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    minProperties: {
                        default: 2,
                        description: "Minimum properties to enforce multiline formatting (default: 2)",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Object Property Value Brace
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Opening brace of an object value should be on the same line
 *   as the colon, not on a new line.
 *
 * ✓ Good:
 *   "& a": { color: "red" }
 *
 * ✗ Bad:
 *   "& a":
 *       { color: "red" }
 */
const objectPropertyValueBrace = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Property(node) {
                const { value } = node;

                // Only check object expression values
                if (value.type !== "ObjectExpression") return;

                // Get the colon token
                const colonToken = sourceCode.getTokenBefore(value, (t) => t.value === ":");

                if (!colonToken) return;

                // Get the opening brace of the object value
                const openBrace = sourceCode.getFirstToken(value);

                if (!openBrace || openBrace.value !== "{") return;

                // Check if colon and { are on different lines
                if (colonToken.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Opening brace should be on the same line as colon for object property values",
                        node: openBrace,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce opening brace on same line as colon for object property values" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Object Property Value Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Object property values should be on the same line as the colon
 *   with proper spacing for simple values.
 *
 * ✓ Good:
 *   {
 *       name: "John",
 *       age: 30,
 *   }
 *
 * ✗ Bad:
 *   {
 *       name:
 *           "John",
 *       age:
 *           30,
 *   }
 */
const objectPropertyValueFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkPropertyHandler = (node) => {
            // Skip shorthand properties (no colon)
            if (node.shorthand) return;

            // Skip computed properties (e.g., [key]: value)
            if (node.computed) return;

            const colonToken = sourceCode.getTokenAfter(node.key, (t) => t.value === ":");

            if (!colonToken) return;

            const valueNode = node.value;

            // Check for missing space after colon
            const textAfterColon = sourceCode.text.slice(colonToken.range[1], colonToken.range[1] + 1);

            if (textAfterColon !== " " && textAfterColon !== "\n") {
                context.report({
                    fix: (fixer) => fixer.insertTextAfter(colonToken, " "),
                    message: "Missing space after colon in object property",
                    node: colonToken,
                });

                return;
            }

            // Handle arrow functions and function expressions - ensure they start on same line
            if (valueNode.type === "ArrowFunctionExpression" || valueNode.type === "FunctionExpression") {
                if (valueNode.loc.start.line > colonToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], valueNode.range[0]],
                            " ",
                        ),
                        message: "Arrow function should start on the same line as the colon",
                        node: valueNode,
                    });
                }

                return;
            }

            // Handle JSX elements - check for simple vs complex
            if (valueNode.type === "JSXElement" || valueNode.type === "JSXFragment") {
                const tokenAfterColon = sourceCode.getTokenAfter(colonToken);
                const isWrappedInParens = tokenAfterColon && tokenAfterColon.value === "(";

                // Check if JSX is simple (single element with only text/whitespace children, no attributes)
                const isSimpleJsxHandler = (jsxNode) => {
                    if (jsxNode.type === "JSXFragment") return false;

                    // Has attributes - not simple
                    if (jsxNode.openingElement.attributes.length > 0) return false;

                    const children = jsxNode.children || [];

                    // Filter out whitespace-only text nodes
                    const meaningfulChildren = children.filter((child) => {
                        if (child.type === "JSXText") {
                            return child.value.trim().length > 0;
                        }

                        return true;
                    });

                    // No meaningful children or only text - simple
                    if (meaningfulChildren.length === 0) return true;

                    if (meaningfulChildren.length === 1 && meaningfulChildren[0].type === "JSXText") {
                        return true;
                    }

                    return false;
                };

                // Build collapsed JSX string for simple elements
                const getCollapsedJsxHandler = (jsxNode) => {
                    const tagName = jsxNode.openingElement.name.name;
                    const children = jsxNode.children || [];
                    const textContent = children
                        .filter((child) => child.type === "JSXText")
                        .map((child) => child.value.trim())
                        .join("")
                        .trim();

                    if (textContent) {
                        return `<${tagName}>${textContent}</${tagName}>`;
                    }

                    return `<${tagName} />`;
                };

                const jsxIsSimple = isSimpleJsxHandler(valueNode);

                if (jsxIsSimple) {
                    const collapsedJsx = getCollapsedJsxHandler(valueNode);
                    const currentText = sourceCode.getText(valueNode);

                    // Check if already correctly formatted (inline, no parens, collapsed)
                    const isAlreadyCorrect = currentText === collapsedJsx
                        && !isWrappedInParens
                        && colonToken.loc.end.line === valueNode.loc.start.line;

                    if (!isAlreadyCorrect) {
                        // Check if there's a comma after
                        let tokenAfterValue = sourceCode.getTokenAfter(valueNode);

                        if (isWrappedInParens) {
                            const closeParen = sourceCode.getTokenAfter(valueNode);

                            tokenAfterValue = sourceCode.getTokenAfter(closeParen);
                        }

                        const hasCommaAfter = tokenAfterValue && tokenAfterValue.value === ",";
                        const closeParen = isWrappedInParens ? sourceCode.getTokenAfter(valueNode) : null;
                        const endRange = hasCommaAfter
                            ? tokenAfterValue.range[1]
                            : closeParen ? closeParen.range[1] : valueNode.range[1];

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], endRange],
                                ` ${collapsedJsx}${hasCommaAfter ? "," : ""}`,
                            ),
                            message: "Simple JSX should be inline with property",
                            node: valueNode,
                        });
                    }

                    return;
                }

                // Complex JSX - must be wrapped in parentheses if multi-line
                const jsxSpansMultipleLines = valueNode.loc.start.line !== valueNode.loc.end.line;

                if (jsxSpansMultipleLines && !isWrappedInParens) {
                    const jsxText = sourceCode.getText(valueNode);
                    const indent = " ".repeat(colonToken.loc.start.column);

                    // Check if there's a comma after the JSX
                    const tokenAfterValue = sourceCode.getTokenAfter(valueNode);
                    const hasCommaAfter = tokenAfterValue && tokenAfterValue.value === ",";
                    const endRange = hasCommaAfter ? tokenAfterValue.range[1] : valueNode.range[1];
                    const commaStr = hasCommaAfter ? "," : "";

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], endRange],
                            ` (\n${indent}    ${jsxText.split("\n").join("\n" + indent + "    ")}\n${indent})${commaStr}`,
                        ),
                        message: "Multi-line JSX in object property must be wrapped in parentheses",
                        node: valueNode,
                    });
                }

                return;
            }

            // Handle ternary expressions - short ones should be on single line
            if (valueNode.type === "ConditionalExpression") {
                const ternaryText = sourceCode.getText(valueNode);
                const collapsedText = ternaryText.replace(/\s*\n\s*/g, " ").trim();
                const isMultiLine = valueNode.loc.start.line !== valueNode.loc.end.line;

                // If it's short enough (under 80 chars) and multiline, collapse it
                if (isMultiLine && collapsedText.length <= 80) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(valueNode, collapsedText),
                        message: "Short ternary expression should be on a single line",
                        node: valueNode,
                    });

                    return;
                }

                // Check if ? or : is at the end of a line (wrong position)
                const questionToken = sourceCode.getTokenAfter(
                    valueNode.test,
                    (t) => t.value === "?",
                );
                const colonTernaryToken = sourceCode.getTokenAfter(
                    valueNode.consequent,
                    (t) => t.value === ":",
                );

                if (questionToken) {
                    const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                    if (tokenAfterQuestion && questionToken.loc.end.line < tokenAfterQuestion.loc.start.line) {
                        // ? is at end of line, but only report if it's short enough to fit
                        if (collapsedText.length <= 80) {
                            context.report({
                                fix: (fixer) => fixer.replaceText(valueNode, collapsedText),
                                message: "Ternary operator '?' should not be at end of line",
                                node: questionToken,
                            });

                            return;
                        }
                    }
                }

                if (colonTernaryToken) {
                    const tokenAfterColonTernary = sourceCode.getTokenAfter(colonTernaryToken);

                    if (tokenAfterColonTernary && colonTernaryToken.loc.end.line < tokenAfterColonTernary.loc.start.line) {
                        // : is at end of line, but only report if it's short enough to fit
                        if (collapsedText.length <= 80) {
                            context.report({
                                fix: (fixer) => fixer.replaceText(valueNode, collapsedText),
                                message: "Ternary operator ':' should not be at end of line",
                                node: colonTernaryToken,
                            });

                            return;
                        }
                    }
                }

                return;
            }

            // Check if value is on the same line as the colon (skip multiline objects/arrays)
            if (valueNode.loc.start.line > colonToken.loc.end.line) {
                // Skip if value is a multiline object or array
                if (valueNode.type === "ObjectExpression" || valueNode.type === "ArrayExpression") {
                    if (valueNode.loc.start.line !== valueNode.loc.end.line) return;
                }

                // Skip parenthesized expressions
                const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                if (tokenAfterColon && tokenAfterColon.value === "(") return;

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [colonToken.range[1], valueNode.range[0]],
                        " ",
                    ),
                    message: "Property value should be on the same line as the colon",
                    node: valueNode,
                });
            }
        };

        return { Property: checkPropertyHandler };
    },
    meta: {
        docs: { description: "Enforce property value on same line as colon with proper spacing" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Opening Brackets Same Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Opening brackets should be on the same line as function/method calls.
 *   This applies to objects, arrays, and arrow function parameters.
 *
 * ✓ Good:
 *   fn({ prop: value })
 *   .map(({ x }) => x)
 *   fn([1, 2, 3])
 *
 * ✗ Bad:
 *   fn(
 *       { prop: value }
 *   )
 *   .map(
 *       ({ x }) => x
 *   )
 */
const openingBracketsSameLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkCallExpressionHandler = (node) => {
            const { callee } = node;

            // Case 0: Function call with opening paren on different line - fn\n( should be fn(
            // For TypeScript, preserve type arguments: fn\n<T>( should become fn<T>(
            const calleeLastToken = sourceCode.getLastToken(callee);

            // Get type arguments if they exist (TypeScript generics)
            const typeArgs = node.typeArguments || node.typeParameters;

            // Find the opening paren - it comes after type arguments if they exist
            let openParenToken;

            if (typeArgs) {
                openParenToken = sourceCode.getTokenAfter(typeArgs);
            } else {
                openParenToken = sourceCode.getTokenAfter(callee);
            }

            // Make sure we found the opening paren
            if (!openParenToken || openParenToken.value !== "(") {
                // Search for it
                let searchToken = sourceCode.getTokenAfter(callee);

                while (searchToken && searchToken.range[0] < node.range[1]) {
                    if (searchToken.value === "(") {
                        openParenToken = searchToken;

                        break;
                    }

                    searchToken = sourceCode.getTokenAfter(searchToken);
                }
            }

            if (!openParenToken || openParenToken.value !== "(") return;

            // Check if callee and opening paren are on different lines
            if (calleeLastToken.loc.end.line !== openParenToken.loc.start.line) {
                // If type arguments exist and are multiline, this is expected - don't report
                if (typeArgs && typeArgs.loc.start.line !== typeArgs.loc.end.line) {
                    return;
                }

                // Build the replacement text: type arguments (if any) + opening paren
                let replacement = "";

                if (typeArgs) {
                    // Get the type arguments text directly from source
                    replacement = sourceCode.getText(typeArgs);
                }

                replacement += "(";

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [calleeLastToken.range[1], openParenToken.range[1]],
                        replacement,
                    ),
                    message: "Opening parenthesis should be on the same line as function name",
                    node: openParenToken,
                });

                return;
            }

            const args = node.arguments;

            if (args.length === 0) return;

            const firstArg = args[0];
            const openParen = sourceCode.getTokenBefore(firstArg);

            // Case 1: Object expression as first argument - .fn({ should be together
            // Only apply when: single argument AND call is single-line
            if (firstArg.type === "ObjectExpression" && firstArg.properties.length >= 1) {
                const callIsMultiLine = node.loc.start.line !== node.loc.end.line;
                const hasMultipleArgs = args.length > 1;

                // Skip if call spans multiple lines with multiple arguments - that format is intentional
                // e.g., fn(\n    { prop: val },\n    other\n)
                if (callIsMultiLine && hasMultipleArgs) return;

                const openBrace = sourceCode.getFirstToken(firstArg);

                if (openParen.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], openBrace.range[1]],
                            "{",
                        ),
                        message: "Opening parenthesis and brace should be on the same line",
                        node: openBrace,
                    });
                }

                const closeBrace = sourceCode.getLastToken(firstArg);
                let closeParen = sourceCode.getTokenAfter(firstArg);

                // Skip trailing comma if present: },)
                if (closeParen && closeParen.value === ",") {
                    closeParen = sourceCode.getTokenAfter(closeParen);
                }

                if (closeParen && closeParen.value === ")") {
                    if (closeBrace.loc.end.line !== closeParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeBrace.range[1], closeParen.range[0]],
                                "",
                            ),
                            message: "Closing brace and parenthesis should be on the same line",
                            node: closeParen,
                        });
                    }
                }

                return;
            }

            // Case 1b: Array expression as first argument - fn([ should be together
            // Only apply when single argument; multiple args should each be on their own line
            if (firstArg.type === "ArrayExpression" && args.length === 1) {
                const isMultiLine = firstArg.loc.start.line !== firstArg.loc.end.line;
                const openBracket = sourceCode.getFirstToken(firstArg);

                // fn([ - opening paren and bracket should be on same line
                if (openParen.loc.end.line !== openBracket.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], openBracket.range[0]],
                            "",
                        ),
                        message: "Opening parenthesis and bracket should be on the same line: fn([",
                        node: openBracket,
                    });

                    return;
                }

                // For multiline arrays of objects, do NOT enforce [{ on same line
                // The arrayObjectsOnNewLines rule handles putting each object on its own line
                // Only enforce [{ for single-line arrays
                if (!isMultiLine && firstArg.elements.length > 0 && firstArg.elements[0] && firstArg.elements[0].type === "ObjectExpression") {
                    const firstElement = firstArg.elements[0];
                    const openBrace = sourceCode.getFirstToken(firstElement);

                    if (openBracket.loc.end.line !== openBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBracket.range[1], openBrace.range[1]],
                                "{",
                            ),
                            message: "Opening bracket and brace should be on the same line",
                            node: openBrace,
                        });
                    }
                }

                // Check closing ]); should be together
                const closeBracket = sourceCode.getLastToken(firstArg);
                let closeParen = sourceCode.getTokenAfter(firstArg);

                // Skip trailing comma if present: ],)
                if (closeParen && closeParen.value === ",") {
                    closeParen = sourceCode.getTokenAfter(closeParen);
                }

                if (closeParen && closeParen.value === ")") {
                    if (closeBracket.loc.end.line !== closeParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeBracket.range[1], closeParen.range[0]],
                                "",
                            ),
                            message: "Closing bracket and parenthesis should be on the same line: ])",
                            node: closeParen,
                        });
                    }
                }

                return;
            }

            // Case 1c: CallExpression as first argument with multiple args - should start on new line
            // e.g., useCallback(debounce(...), []) - debounce should be on new line
            if (firstArg.type === "CallExpression" && args.length > 1) {
                // Check if the call expression is on the same line as the opening paren
                if (openParen.loc.end.line === firstArg.loc.start.line) {
                    const indent = " ".repeat(openParen.loc.start.column + 4);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], firstArg.range[0]],
                            "\n" + indent,
                        ),
                        message: "Function call argument should start on a new line when there are multiple arguments",
                        node: firstArg,
                    });
                }

                return;
            }

            // Case 2: Arrow function callback
            if (firstArg.type === "ArrowFunctionExpression") {
                // Skip if there are multiple arguments - function-arguments-format handles that case
                // to avoid circular fixes where this rule wants fn((param) and that rule wants fn(\n    (param)
                if (args.length > 1) return;

                const arrowParams = firstArg.params;

                if (arrowParams.length === 0) return;

                const firstParam = arrowParams[0];
                const lastParam = arrowParams[arrowParams.length - 1];

                // Case 2a: Single destructured param - .map(({ x, y }) => ...)
                if (arrowParams.length === 1 && firstParam.type === "ObjectPattern") {
                    const arrowOpenParen = sourceCode.getTokenBefore(firstParam);

                    if (!arrowOpenParen || arrowOpenParen.value !== "(") return;

                    // First, ensure .map( and (( are on same line
                    if (openParen.loc.end.line !== arrowOpenParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openParen.range[1], arrowOpenParen.range[1]],
                                "(",
                            ),
                            message: "Callback opening parenthesis should be on the same line as function call",
                            node: arrowOpenParen,
                        });

                        return;
                    }

                    // Then, ensure (( and { are on same line
                    const openBrace = sourceCode.getFirstToken(firstParam);

                    if (arrowOpenParen.loc.end.line !== openBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowOpenParen.range[1], openBrace.range[1]],
                                "{",
                            ),
                            message: "Opening parenthesis and brace should be on the same line for callback destructured param",
                            node: openBrace,
                        });
                    }

                    return;
                }

                // Case 2b: Single simple param - collapse to single line .map((sd) => ...)
                if (arrowParams.length === 1 && firstParam.type === "Identifier") {
                    const arrowOpenParen = sourceCode.getTokenBefore(firstParam);

                    if (!arrowOpenParen || arrowOpenParen.value !== "(") return;

                    // First, ensure fn( and (( are on same line: useSelector(\n(state) => fn((state)
                    if (openParen.loc.end.line !== arrowOpenParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openParen.range[1], arrowOpenParen.range[1]],
                                "(",
                            ),
                            message: "Callback opening parenthesis should be on the same line as function call",
                            node: arrowOpenParen,
                        });

                        return;
                    }

                    if (arrowOpenParen.loc.end.line !== firstParam.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowOpenParen.range[1], firstParam.range[0]],
                                "",
                            ),
                            message: "Single callback param should be on the same line as opening parenthesis",
                            node: firstParam,
                        });
                    }

                    return;
                }

                // Case 2c: Multiple params (2+)
                if (arrowParams.length >= 2) {
                    const arrowOpenParen = sourceCode.getTokenBefore(firstParam);

                    if (!arrowOpenParen || arrowOpenParen.value !== "(") return;

                    // Check if params span multiple lines (first param on different line than open paren)
                    const paramsAreMultiLine = arrowOpenParen.loc.end.line !== firstParam.loc.start.line;

                    // Check if arrow function body is multiline
                    const arrowBody = firstArg.body;
                    const bodyIsMultiLine = arrowBody && arrowBody.loc.start.line !== arrowBody.loc.end.line;

                    // If params or body are multi-line, don't require (( on same line
                    // This allows the proper format:
                    // debounce(
                    //     (value, requestName) => {
                    //         ...
                    //     },
                    //     500,
                    // )
                    if (paramsAreMultiLine || bodyIsMultiLine) return;

                    // For single-line params with single-line body, keep (( on same line
                    if (openParen.loc.end.line !== arrowOpenParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openParen.range[1], arrowOpenParen.range[1]],
                                "(",
                            ),
                            message: "Opening parentheses should be on the same line for callback params",
                            node: arrowOpenParen,
                        });
                    }
                }
            }
        };

        const checkJSXExpressionContainerHandler = (node) => {
            const expression = node.expression;

            // Skip empty expressions
            if (expression.type === "JSXEmptyExpression") return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);

            // Case 1: ObjectExpression - opening {{ should be together (for JSX attributes)
            if (expression.type === "ObjectExpression" && expression.properties.length >= 1) {
                const objectOpenBrace = sourceCode.getFirstToken(expression);

                if (openBrace.loc.end.line !== objectOpenBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], objectOpenBrace.range[1]],
                            "{",
                        ),
                        message: "Opening braces should be on the same line for JSX object expression",
                        node: objectOpenBrace,
                    });
                }

                // Also check closing }} should be together
                const objectCloseBrace = sourceCode.getLastToken(expression);

                if (closeBrace.loc.start.line !== objectCloseBrace.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [objectCloseBrace.range[1], closeBrace.range[0]],
                            "",
                        ),
                        message: "Closing braces should be on the same line for JSX object expression",
                        node: closeBrace,
                    });
                }

                return;
            }

            // Case 2: CallExpression (like {items.map(...)}) - opening { and call should be on same line
            if (expression.type === "CallExpression") {
                if (openBrace.loc.end.line !== expression.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], expression.range[0]],
                            "",
                        ),
                        message: "Opening brace and expression should be on the same line",
                        node: expression,
                    });
                }

                // For simple single-line call expressions, closing } should be on same line
                const isSingleLineCall = expression.loc.start.line === expression.loc.end.line;

                if (isSingleLineCall && expression.loc.end.line !== closeBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [expression.range[1], closeBrace.range[0]],
                            "",
                        ),
                        message: "Closing brace should be on the same line as simple call expression",
                        node: closeBrace,
                    });
                }

                return;
            }

            // Case 2b: TemplateLiteral - collapse to single line if simple enough
            if (expression.type === "TemplateLiteral") {
                // Check if all expressions in template are simple (Identifier or MemberExpression)
                const allSimpleExpressions = expression.expressions.every(
                    (expr) => expr.type === "Identifier" || expr.type === "MemberExpression",
                );

                if (allSimpleExpressions) {
                    // Build the collapsed template literal
                    const quasis = expression.quasis;
                    const expressions = expression.expressions;
                    let collapsedText = "`";

                    const collapsedParts = [];

                    for (let i = 0; i < quasis.length; i += 1) {
                        // Collapse whitespace in quasi (newlines → spaces)
                        const quasiText = quasis[i].value.raw.replace(/\s*\n\s*/g, " ").trim();

                        if (quasiText) collapsedParts.push(quasiText);

                        if (i < expressions.length) {
                            collapsedParts.push("${" + sourceCode.getText(expressions[i]) + "}");
                        }
                    }

                    collapsedText = "`" + collapsedParts.join(" ") + "`";

                    // For className attributes, check if collapsed result exceeds multiline thresholds
                    // If so, keep the multiline format (classname-multiline will enforce it)
                    const parentAttr = node.parent;
                    const isClassNameAttr = parentAttr && parentAttr.type === "JSXAttribute"
                        && parentAttr.name && parentAttr.name.name === "className";

                    if (isClassNameAttr) {
                        const innerContent = collapsedText.slice(1, -1); // strip backticks
                        const staticParts = innerContent.replace(/\$\{[^}]+\}/g, "").trim();
                        const classes = staticParts.split(/\s+/).filter(Boolean);
                        const dynamicCount = expressions.length;
                        const maxClassCount = DEFAULT_MAX_CLASS_COUNT;
                        const maxLen = DEFAULT_MAX_CLASS_LENGTH;

                        // If exceeds thresholds, skip collapsing — keep multiline
                        if (classes.length + dynamicCount > maxClassCount || innerContent.length > maxLen) {
                            return;
                        }

                        // Under thresholds: collapse and convert to string literal if no expressions
                        if (expressions.length === 0) {
                            const classString = staticParts;
                            const collapsedAttrValue = `"${classString}"`;

                            const isMultiLine = expression.loc.start.line !== expression.loc.end.line;
                            const openingBraceOnDifferentLine = openBrace.loc.end.line !== expression.loc.start.line;

                            if (isMultiLine || openingBraceOnDifferentLine) {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [openBrace.range[0], closeBrace.range[1]],
                                        collapsedAttrValue,
                                    ),
                                    message: "Short className should use a string literal on a single line",
                                    node: expression,
                                });
                            }

                            return;
                        }
                    }

                    // Only fix if the result is reasonable length and different from original
                    const isMultiLine = expression.loc.start.line !== expression.loc.end.line;
                    const openingBraceOnDifferentLine = openBrace.loc.end.line !== expression.loc.start.line;
                    const closingBraceOnDifferentLine = expression.loc.end.line !== closeBrace.loc.start.line;

                    if ((isMultiLine || openingBraceOnDifferentLine || closingBraceOnDifferentLine) && collapsedText.length <= 80) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], closeBrace.range[0]],
                                collapsedText,
                            ),
                            message: "Simple template literal should be on a single line",
                            node: expression,
                        });
                    }
                }

                return;
            }

            // Case 3: Simple expressions - collapse to single line
            const simpleTypes = ["Identifier", "MemberExpression", "Literal"];

            // Also include ConditionalExpression if it's single-line
            const isSingleLineConditional = expression.type === "ConditionalExpression"
                && expression.loc.start.line === expression.loc.end.line;

            if (simpleTypes.includes(expression.type) || isSingleLineConditional) {
                const isMultiLine = openBrace.loc.end.line !== closeBrace.loc.start.line;

                if (isMultiLine) {
                    const expressionText = sourceCode.getText(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], closeBrace.range[0]],
                            expressionText,
                        ),
                        message: "Simple expression should be on single line in JSX attribute",
                        node: expression,
                    });

                    return;
                }

                // Check if parent JSX element should be collapsed to single line
                // e.g., <span>\n    {strings.label}\n</span> → <span>{strings.label}</span>
                const parent = node.parent;

                if (parent && parent.type === "JSXElement") {
                    const children = parent.children.filter(
                        (child) => !(child.type === "JSXText" && /^\s*$/.test(child.value)),
                    );

                    // Only collapse if this expression is the only meaningful child
                    if (children.length === 1 && children[0] === node) {
                        const openingTag = parent.openingElement;
                        const closingTag = parent.closingElement;

                        if (closingTag) {
                            const openTagEnd = openingTag.loc.end.line;
                            const closeTagStart = closingTag.loc.start.line;

                            // Check if element spans multiple lines but content is simple
                            if (openTagEnd !== closeTagStart) {
                                const openTagText = sourceCode.getText(openingTag);
                                const closeTagText = sourceCode.getText(closingTag);
                                const expressionText = sourceCode.getText(node);
                                const collapsedLength = openTagText.length + expressionText.length + closeTagText.length;

                                // Only collapse if total length is reasonable
                                if (collapsedLength <= 120) {
                                    context.report({
                                        fix: (fixer) => fixer.replaceTextRange(
                                            [openingTag.range[1], closingTag.range[0]],
                                            expressionText,
                                        ),
                                        message: "JSX element with simple expression should be on single line",
                                        node: parent,
                                    });
                                }
                            }
                        }
                    }
                }

                return;
            }

            // Case 3: ArrowFunctionExpression in JSX attribute
            if (expression.type === "ArrowFunctionExpression") {
                // First, ensure { and arrow function start are on same line
                if (openBrace.loc.end.line !== expression.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], expression.range[0]],
                            "",
                        ),
                        message: "Opening brace and arrow function should be on the same line in JSX attribute",
                        node: expression,
                    });

                    return;
                }

                // Case 3a: Block body - closing }} should be together
                if (expression.body.type === "BlockStatement") {
                    // Only fix if parent is JSXAttribute
                    if (node.parent && node.parent.type === "JSXAttribute") {
                        const blockCloseBrace = sourceCode.getLastToken(expression.body);

                        if (blockCloseBrace && closeBrace.loc.start.line !== blockCloseBrace.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [blockCloseBrace.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing braces should be together for arrow function in JSX attribute",
                                node: closeBrace,
                            });
                        }
                    }

                    return;
                }

                // Case 3b: Simple expression body - collapse entire arrow function to single line if simple
                if (node.parent && node.parent.type === "JSXAttribute") {
                    // Check if the entire arrow function is single-line worthy
                    const arrowFunctionIsSingleLine = expression.loc.start.line === expression.loc.end.line;

                    // Check if { and expression are on different lines, or expression and } are on different lines
                    const openBraceNotWithExpression = openBrace.loc.end.line !== expression.loc.start.line;
                    const closeBraceNotWithExpression = expression.loc.end.line !== closeBrace.loc.start.line;
                    const needsCollapse = openBraceNotWithExpression || closeBraceNotWithExpression;

                    // If arrow function fits on one line, collapse everything
                    if (needsCollapse && arrowFunctionIsSingleLine) {
                        const arrowText = sourceCode.getText(expression);

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], closeBrace.range[0]],
                                arrowText,
                            ),
                            message: "Simple arrow function should be on single line in JSX attribute",
                            node: expression,
                        });

                        return;
                    }

                    // If body is single-line but arrow function spans multiple lines, collapse from arrow to end
                    // Only do this for truly simple single-line bodies
                    const bodyIsSingleLine = expression.body.loc.start.line === expression.body.loc.end.line;

                    if (bodyIsSingleLine) {
                        const arrowToken = sourceCode.getTokenBefore(
                            expression.body,
                            (t) => t.value === "=>",
                        );

                        if (arrowToken && arrowToken.loc.end.line !== expression.body.loc.start.line) {
                            const bodyText = sourceCode.getText(expression.body);

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [arrowToken.range[1], closeBrace.range[0]],
                                    " " + bodyText,
                                ),
                                message: "Simple arrow function expression should be on single line",
                                node: expression.body,
                            });
                        }
                    }
                }

                return;
            }

            // Case 4: JSX element wrapped in parentheses - {( should be together and )} should be together
            if (expression.type === "JSXElement" || expression.type === "JSXFragment") {
                // Check if JSX is wrapped in parentheses
                const tokenBeforeJsx = sourceCode.getTokenBefore(expression);

                if (tokenBeforeJsx && tokenBeforeJsx.value === "(") {
                    // Check if { and ( are on different lines
                    if (openBrace.loc.end.line !== tokenBeforeJsx.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], tokenBeforeJsx.range[1]],
                                "(",
                            ),
                            message: "Opening brace and parenthesis should be together for JSX expression",
                            node: tokenBeforeJsx,
                        });
                    }

                    // Check closing )}
                    const tokenAfterJsx = sourceCode.getTokenAfter(expression);

                    if (tokenAfterJsx && tokenAfterJsx.value === ")") {
                        if (closeBrace.loc.start.line !== tokenAfterJsx.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterJsx.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing parenthesis and brace should be together for JSX expression",
                                node: closeBrace,
                            });
                        }
                    }
                }

                return;
            }

            // Case 5: LogicalExpression - handle based on complexity
            if (expression.type === "LogicalExpression") {
                // Count total operands in the logical expression
                const countOperandsHandler = (n) => {
                    if (n.type === "LogicalExpression") {
                        return countOperandsHandler(n.left) + countOperandsHandler(n.right);
                    }

                    return 1;
                };

                const operandCount = countOperandsHandler(expression);
                const expressionText = sourceCode.getText(expression);
                const isMultiLine = expression.loc.start.line !== expression.loc.end.line;

                // Simple expression (2 operands, <= 80 chars) - collapse to single line
                if (operandCount <= 2 && expressionText.length <= 80) {
                    const collapsedText = expressionText.replace(/\s*\n\s*/g, " ");

                    if (isMultiLine || openBrace.loc.end.line !== expression.loc.start.line
                        || expression.loc.end.line !== closeBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], closeBrace.range[0]],
                                collapsedText,
                            ),
                            message: "Simple logical expression should be on a single line",
                            node: expression,
                        });

                        return;
                    }

                    // Check if parent JSX element should be collapsed to single line
                    const parent = node.parent;

                    if (parent && parent.type === "JSXElement") {
                        const children = parent.children.filter(
                            (child) => !(child.type === "JSXText" && /^\s*$/.test(child.value)),
                        );

                        // Only collapse if this expression is the only meaningful child
                        if (children.length === 1 && children[0] === node) {
                            const openingTag = parent.openingElement;
                            const closingTag = parent.closingElement;

                            if (closingTag) {
                                const openTagEnd = openingTag.loc.end.line;
                                const closeTagStart = closingTag.loc.start.line;

                                // Check if element spans multiple lines but content is simple
                                if (openTagEnd !== closeTagStart) {
                                    const openTagText = sourceCode.getText(openingTag);
                                    const closeTagText = sourceCode.getText(closingTag);
                                    const collapsedExpr = "{" + collapsedText + "}";
                                    const collapsedLength = openTagText.length + collapsedExpr.length + closeTagText.length;

                                    // Only collapse if total length is reasonable
                                    if (collapsedLength <= 120) {
                                        context.report({
                                            fix: (fixer) => fixer.replaceTextRange(
                                                [openingTag.range[1], closingTag.range[0]],
                                                collapsedExpr,
                                            ),
                                            message: "JSX element with simple logical expression should be on single line",
                                            node: parent,
                                        });
                                    }
                                }
                            }
                        }
                    }

                    return;
                }

                // Complex expression (3+ operands) - closing } should be on its own line
                if (operandCount >= 3 && isMultiLine) {
                    // Ensure opening { and expression start are on same line
                    if (openBrace.loc.end.line !== expression.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], expression.range[0]],
                                "",
                            ),
                            message: "Opening brace and logical expression should be on the same line",
                            node: expression,
                        });

                        return;
                    }

                    // Ensure closing } is on its own line after multiline expression
                    if (expression.loc.end.line === closeBrace.loc.start.line) {
                        // Get the indentation from the line with the opening brace
                        const openBraceLine = sourceCode.lines[openBrace.loc.start.line - 1];
                        const indent = openBraceLine.match(/^\s*/)[0];

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [expression.range[1], closeBrace.range[0]],
                                "\n" + indent,
                            ),
                            message: "Closing brace should be on its own line for multiline logical expression",
                            node: closeBrace,
                        });
                    }

                    return;
                }

                // First, ensure { and expression start are on same line
                if (openBrace.loc.end.line !== expression.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], expression.range[0]],
                            "",
                        ),
                        message: "Opening brace and logical expression should be on the same line",
                        node: expression,
                    });

                    return;
                }

                // Check if a condition expression is split incorrectly across lines
                // (operator and operands should be on the same line)
                // BUT skip if it's intentionally formatted multiline (operator at start of line pattern)
                const checkConditionSplitHandler = (conditionNode) => {
                    // Handle LogicalExpression (&&, ||) and BinaryExpression (===, !==, etc.)
                    if (conditionNode.type !== "LogicalExpression" && conditionNode.type !== "BinaryExpression") {
                        return false;
                    }

                    const { left, right } = conditionNode;

                    // Check if this expression spans multiple lines
                    if (conditionNode.loc.start.line !== conditionNode.loc.end.line) {
                        // Check if this is intentionally formatted multiline
                        // (pattern: operator at start of line, e.g., multiline-if-conditions format)
                        const condOperator = sourceCode.getTokenAfter(
                            left,
                            (t) => ["&&", "||", "===", "!==", "==", "!=", ">", "<", ">=", "<="].includes(t.value),
                        );

                        if (condOperator) {
                            // Check for intentional multiline format: operator at start of line with proper indentation
                            // This pattern indicates multiline-if-conditions has formatted it this way
                            const textBetween = sourceCode.text.slice(left.range[1], condOperator.range[0]);
                            const hasNewlineBeforeOperator = textBetween.includes("\n");
                            const operatorIsAtLineStart = hasNewlineBeforeOperator
                                && /\n\s*$/.test(textBetween);

                            // Skip collapsing if operator is intentionally at the start of a line
                            if (operatorIsAtLineStart) {
                                return false;
                            }

                            const leftEndLine = left.loc.end.line;
                            const operatorLine = condOperator.loc.start.line;
                            const rightStartLine = right.loc.start.line;

                            // Bad: operator or operands on different lines (not intentional format)
                            if (leftEndLine !== operatorLine || operatorLine !== rightStartLine) {
                                const tokenBefore = sourceCode.getTokenBefore(conditionNode);
                                const tokenAfter = sourceCode.getTokenAfter(conditionNode);
                                const hasParens = tokenBefore?.value === "(" && tokenAfter?.value === ")";

                                const collapsedText = sourceCode.getText(conditionNode).replace(/\s*\n\s*/g, " ").trim();

                                context.report({
                                    fix: (fixer) => {
                                        if (hasParens) {
                                            return fixer.replaceTextRange(
                                                [tokenBefore.range[0], tokenAfter.range[1]],
                                                `(${collapsedText})`,
                                            );
                                        }

                                        return fixer.replaceText(conditionNode, collapsedText);
                                    },
                                    message: "Condition operands should be on the same line",
                                    node: conditionNode,
                                });

                                return true;
                            }
                        }
                    }

                    // Recursively check nested expressions
                    if (conditionNode.type === "LogicalExpression") {
                        return checkConditionSplitHandler(left) || checkConditionSplitHandler(right);
                    }

                    return false;
                };

                // Check the left side of && for split conditions
                if (expression.operator === "&&" && checkConditionSplitHandler(expression.left)) {
                    return;
                }

                const operatorToken = sourceCode.getTokenAfter(
                    expression.left,
                    (t) => t.value === "&&" || t.value === "||",
                );

                if (operatorToken) {
                    // Check if left operand and operator are on different lines
                    // Only apply this rule for simple patterns like {condition && (<JSX/>)}
                    // Skip complex multiline logical expressions (e.g., disabled={a || b || c})
                    const isSimplePattern = expression.right.type === "JSXElement"
                        || expression.right.type === "JSXFragment"
                        || expression.right.type === "ConditionalExpression"
                        || expression.right.type === "ObjectExpression"
                        || (sourceCode.getTokenBefore(expression.right)?.value === "(");

                    // Check if left expression is wrapped in parentheses
                    const tokenAfterLeft = sourceCode.getTokenAfter(expression.left);
                    const leftEndsWithParen = tokenAfterLeft && tokenAfterLeft.value === ")";

                    // Get the actual end position (including closing paren if present)
                    const leftEndPos = leftEndsWithParen ? tokenAfterLeft.range[1] : expression.left.range[1];
                    const leftEndLine = leftEndsWithParen ? tokenAfterLeft.loc.end.line : expression.left.loc.end.line;

                    if (isSimplePattern && leftEndLine !== operatorToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [leftEndPos, operatorToken.range[1]],
                                " " + operatorToken.value,
                            ),
                            message: "Logical operator should be on the same line as the left operand",
                            node: operatorToken,
                        });

                        return;
                    }

                    const tokenAfterOperator = sourceCode.getTokenAfter(operatorToken);

                    // Check if operator and ( are on different lines
                    if (tokenAfterOperator && tokenAfterOperator.value === "(") {
                        if (operatorToken.loc.end.line !== tokenAfterOperator.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [operatorToken.range[1], tokenAfterOperator.range[1]],
                                    " (",
                                ),
                                message: "Opening parenthesis should be on same line as logical operator",
                                node: tokenAfterOperator,
                            });
                        }
                    }

                    // Find the closing ) for the right side
                    const closingParen = sourceCode.getTokenAfter(expression.right);

                    if (closingParen && closingParen.value === ")") {
                        // Check if ) and } are on different lines
                        if (closeBrace.loc.start.line !== closingParen.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [closingParen.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing parenthesis and brace should be together for logical expression",
                                node: closeBrace,
                            });
                        }
                    }
                }
            }
        };

        const checkArrowFunctionHandler = (node) => {
            // Check 1: Arrow function with block body - ensure => { are on same line
            if (node.body.type === "BlockStatement") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                const blockOpenBrace = sourceCode.getFirstToken(node.body);

                if (arrowToken && blockOpenBrace) {
                    if (arrowToken.loc.end.line !== blockOpenBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowToken.range[1], blockOpenBrace.range[0]],
                                " ",
                            ),
                            message: "Opening brace should be on the same line as arrow",
                            node: blockOpenBrace,
                        });
                    }
                }
            }

            // Check 1b: Arrow function with expression body (CallExpression) - ensure => and call on same line
            // e.g., (id) => useQuery({...}) not (id) =>\n    useQuery({...})
            // BUT allow parentheses for multiline implicit return: => (\n    call()\n)
            if (node.body.type === "CallExpression") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                if (arrowToken) {
                    const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

                    // If wrapped in parentheses, ensure => ( is on same line
                    // e.g., => (\n    call()\n) is OK, but =>\n    (\n    call()\n) is NOT
                    if (tokenAfterArrow && tokenAfterArrow.value === "(") {
                        if (arrowToken.loc.end.line !== tokenAfterArrow.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [arrowToken.range[1], tokenAfterArrow.range[1]],
                                    " (",
                                ),
                                message: "Opening parenthesis should be on the same line as arrow: => (",
                                node: tokenAfterArrow,
                            });
                        }

                        return;
                    }

                    // Check spacing: should be exactly one space after =>
                    const textAfterArrow = sourceCode.text.slice(arrowToken.range[1], node.body.range[0]);

                    if (textAfterArrow !== " ") {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowToken.range[1], node.body.range[0]],
                                " ",
                            ),
                            message: "Expression body should be on the same line as arrow with single space",
                            node: node.body,
                        });
                    }
                }
            }

            // Check 1c: Arrow function with parenthesized object body - ensure => ({ on same line
            // e.g., () => ({ prop: val }) not () =>\n    ({ prop: val })
            if (node.body.type === "ObjectExpression") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                if (arrowToken) {
                    // Check for parenthesis before the object
                    const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

                    if (tokenAfterArrow && tokenAfterArrow.value === "(") {
                        // It's a parenthesized object: () => ({...})
                        if (arrowToken.loc.end.line !== tokenAfterArrow.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [arrowToken.range[1], tokenAfterArrow.range[1]],
                                    " (",
                                ),
                                message: "Parenthesized object should be on the same line as arrow: => (",
                                node: tokenAfterArrow,
                            });

                            return;
                        }

                        // Also check if ( and { are on same line
                        const openBrace = sourceCode.getFirstToken(node.body);

                        if (tokenAfterArrow.loc.end.line !== openBrace.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterArrow.range[1], openBrace.range[1]],
                                    "{",
                                ),
                                message: "Opening brace should be on the same line as opening paren: ({",
                                node: openBrace,
                            });
                        }
                    }
                }
            }

            // Check 1d: Arrow function with TSAsExpression or other expression body
            // e.g., (state) => state as { user: Type } should be on same line
            if (node.body.type === "TSAsExpression" || node.body.type === "Identifier" || node.body.type === "MemberExpression") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                if (arrowToken) {
                    const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

                    // If not wrapped in parentheses, body should be on same line
                    if (tokenAfterArrow && tokenAfterArrow.value !== "(") {
                        const textAfterArrow = sourceCode.text.slice(arrowToken.range[1], node.body.range[0]);

                        if (textAfterArrow !== " ") {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [arrowToken.range[1], node.body.range[0]],
                                    " ",
                                ),
                                message: "Expression body should be on the same line as arrow with single space",
                                node: node.body,
                            });
                        }
                    }
                }
            }

            // Check 1e: Ensure space before => in arrow functions
            const arrowToken = sourceCode.getFirstToken(
                node,
                (t) => t.value === "=>",
            );

            if (arrowToken) {
                const tokenBeforeArrow = sourceCode.getTokenBefore(arrowToken);

                if (tokenBeforeArrow) {
                    const textBetween = sourceCode.text.slice(tokenBeforeArrow.range[1], arrowToken.range[0]);

                    if (textBetween !== " ") {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeArrow.range[1], arrowToken.range[0]],
                                " ",
                            ),
                            message: "Arrow function should have space before =>",
                            node: arrowToken,
                        });
                    }
                }
            }

            // Check 2: Single destructured param with 2+ properties - ensure ({ and }) together
            const params = node.params;

            if (params.length !== 1) return;

            const param = params[0];

            if (param.type !== "ObjectPattern" || param.properties.length < 2) return;

            // Find opening ( before the param
            const openParen = sourceCode.getTokenBefore(param);

            if (!openParen || openParen.value !== "(") return;

            const openBrace = sourceCode.getFirstToken(param);

            // Check if ( and { are on different lines
            if (openParen.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], openBrace.range[1]],
                        "{",
                    ),
                    message: "Opening parenthesis and brace should be on the same line for destructured param",
                    node: openBrace,
                });
            }

            const closeBrace = sourceCode.getLastToken(param);
            let closeParen = sourceCode.getTokenAfter(param);

            // Skip trailing comma if present
            if (closeParen && closeParen.value === ",") {
                closeParen = sourceCode.getTokenAfter(closeParen);
            }

            if (closeParen && closeParen.value === ")") {
                if (closeBrace.loc.end.line !== closeParen.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [closeBrace.range[1], closeParen.range[0]],
                            "",
                        ),
                        message: "Closing brace and parenthesis should be on the same line for destructured param",
                        node: closeParen,
                    });
                }
            }
        };

        const checkJSXSpreadAttributeHandler = (node) => {
            // Handle simple spread attributes: {...formMethods} should be on single line
            const { argument } = node;

            // Only collapse simple spreads (single identifier or member expression)
            const isSimpleSpread = argument.type === "Identifier"
                || argument.type === "MemberExpression";

            if (!isSimpleSpread) return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);

            // Check if spread spans multiple lines
            if (openBrace.loc.start.line !== closeBrace.loc.end.line) {
                const argumentText = sourceCode.getText(argument);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[0], closeBrace.range[1]],
                        `{...${argumentText}}`,
                    ),
                    message: "Simple JSX spread attribute should be on a single line",
                    node,
                });
            }
        };

        // Handle LogicalExpression chains in variable declarations
        // e.g., func() || func() - the operator should be on the same line as ) and the start of next call
        const checkLogicalExpressionHandler = (node) => {
            // Skip if inside JSXExpressionContainer (handled separately)
            if (node.parent && node.parent.type === "JSXExpressionContainer") return;

            // Only handle top-level logical expressions in variable declarations
            // Skip nested ones (they'll be handled when processing the parent)
            if (node.parent && node.parent.type === "LogicalExpression") return;

            // Skip if this is the test of an IfStatement - those are handled by multiline-if-conditions
            if (node.parent && node.parent.type === "IfStatement" && node.parent.test === node) return;

            // Skip if this is the test of a ConditionalExpression (ternary) - those are handled by ternary-condition-multiline
            if (node.parent && node.parent.type === "ConditionalExpression" && node.parent.test === node) return;

            // Check if operands are valid for same-line formatting
            const isValidOperand = (n) => n.type === "CallExpression"
                || n.type === "LogicalExpression"
                || n.type === "MemberExpression"
                || n.type === "Identifier"
                || n.type === "TSAsExpression"
                || n.type === "ObjectExpression"
                || n.type === "ArrayExpression";

            if (!isValidOperand(node.left) || !isValidOperand(node.right)) return;

            // Recursively check and fix all operators in the chain
            const checkOperator = (expr) => {
                if (expr.type !== "LogicalExpression") return;

                const { left, right, operator } = expr;

                // First, recursively check nested logical expressions
                checkOperator(left);
                checkOperator(right);

                // Find the operator token
                const operatorToken = sourceCode.getTokenAfter(
                    left,
                    (t) => t.value === "||" || t.value === "&&",
                );

                if (!operatorToken) return;

                const leftEndLine = left.loc.end.line;
                const operatorLine = operatorToken.loc.start.line;
                const rightStartLine = right.loc.start.line;

                // Check if operator is split from left or right operand
                // Correct: ) || canDoHandler(  (all on same line)
                // Wrong: ) ||\n    canDoHandler(  or  )\n    || canDoHandler(
                if (leftEndLine !== operatorLine || operatorLine !== rightStartLine) {
                    // Check for intentional multiline format (operator at start of line)
                    // This indicates multiline-if-conditions or ternary-condition-multiline has formatted it this way
                    const textBetween = sourceCode.text.slice(left.range[1], operatorToken.range[0]);
                    const operatorIsAtLineStart = textBetween.includes("\n") && /\n\s*$/.test(textBetween);

                    // Skip if intentionally formatted with operator at start of line
                    if (operatorIsAtLineStart) return;

                    // Get the end of left operand (might end with closing paren)
                    const leftEndToken = sourceCode.getLastToken(left);

                    // Get the start of right operand
                    const rightStartToken = sourceCode.getFirstToken(right);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [leftEndToken.range[1], rightStartToken.range[0]],
                            ` ${operator} `,
                        ),
                        message: "Logical operator should be on the same line as both operands: ) || func(",
                        node: operatorToken,
                    });
                }
            };

            checkOperator(node);
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            CallExpression: checkCallExpressionHandler,
            JSXExpressionContainer: checkJSXExpressionContainerHandler,
            JSXSpreadAttribute: checkJSXSpreadAttributeHandler,
            LogicalExpression: checkLogicalExpressionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce opening brackets on same line for function calls and arrow function params" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Simple Call Single Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simple function calls with an arrow function containing a
 *   simple call expression should be on a single line.
 *
 * ✓ Good:
 *   fn(() => call(arg))
 *   lazy(() => import("./module"))
 *
 * ✗ Bad:
 *   fn(
 *       () => call(arg),
 *   )
 */
const simpleCallSingleLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if a node is simple enough to be on one line
        const isSimpleArgHandler = (argNode) => {
            if (!argNode) return false;

            // Simple literals (strings, numbers, booleans)
            if (argNode.type === "Literal") return true;

            // Simple identifiers
            if (argNode.type === "Identifier") return true;

            // Template literals without expressions
            if (argNode.type === "TemplateLiteral" && argNode.expressions.length === 0) return true;

            return false;
        };

        const isSimpleBodyHandler = (bodyNode) => {
            // Handle ImportExpression (dynamic import)
            if (bodyNode.type === "ImportExpression") {
                return isSimpleArgHandler(bodyNode.source);
            }

            // Handle CallExpression
            if (bodyNode.type === "CallExpression") {
                // Check if it's import() or a simple function call
                const isImport = bodyNode.callee.type === "Import";
                const isSimpleCall = bodyNode.callee.type === "Identifier";
                const isMemberCall = bodyNode.callee.type === "MemberExpression";

                if (!isImport && !isSimpleCall && !isMemberCall) return false;

                // Must have simple arguments (0-2 args, all simple)
                if (bodyNode.arguments.length > 2) return false;

                return bodyNode.arguments.every(isSimpleArgHandler);
            }

            return false;
        };

        // Check if an expression body is simple enough for single line
        const isSimpleExpressionHandler = (bodyNode) => {
            if (!bodyNode) return false;

            // Simple literals, identifiers
            if (bodyNode.type === "Literal" || bodyNode.type === "Identifier") return true;

            // Template literals without expressions
            if (bodyNode.type === "TemplateLiteral" && bodyNode.expressions.length === 0) return true;

            // Simple call/import expressions
            if (isSimpleBodyHandler(bodyNode)) return true;

            // Binary/logical expressions (comparisons like code === x)
            if (bodyNode.type === "BinaryExpression" || bodyNode.type === "LogicalExpression") return true;

            // Member expressions (a.b, a?.b)
            if (bodyNode.type === "MemberExpression") return true;

            // Unary expressions (!x, -x)
            if (bodyNode.type === "UnaryExpression") return true;

            return false;
        };

        return {
            CallExpression(node) {
                const { callee, arguments: args } = node;

                // Only check simple function calls (identifier or member expression)
                if (callee.type !== "Identifier" && callee.type !== "MemberExpression") return;

                // Must have exactly one argument
                if (args.length !== 1) return;

                const arg = args[0];

                // Argument must be arrow function
                if (arg.type !== "ArrowFunctionExpression") return;

                // Callbacks with 2+ params should be multiline (handled by function-params-per-line)
                if (arg.params.length >= 2) return;

                const { body } = arg;

                // Zero params: body must be a simple call/import
                if (arg.params.length === 0 && !isSimpleBodyHandler(body)) return;

                // With single param: body must be expression (not block) and simple
                if (arg.params.length === 1) {
                    if (body.type === "BlockStatement") return;
                    if (!isSimpleExpressionHandler(body)) return;
                }

                // For optional chaining like .find(...)?.symbol, include the full chain
                let replaceNode = node;

                // Walk up through chain/member expressions to get full chain text
                let chainParent = node.parent;

                while (chainParent && (chainParent.type === "MemberExpression" || chainParent.type === "ChainExpression")) {
                    replaceNode = chainParent;
                    chainParent = chainParent.parent;
                }

                // Check if the full chain spans multiple lines
                if (replaceNode.loc.start.line === replaceNode.loc.end.line) return;

                // Build the collapsed single-line version from source text, normalizing whitespace
                const fullText = sourceCode.getText(replaceNode);
                const fullCollapsed = fullText.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").replace(/\( \)/, "()").replace(/,\s*\)/, ")").replace(/\s+\?\./g, "?.").replace(/\?\.\s+/g, "?.");

                // Account for surrounding context (indentation + variable declaration)
                const line = sourceCode.lines[replaceNode.loc.start.line - 1];
                const indent = line.match(/^(\s*)/)[1].length;

                // Check parent chain for variable declarator to account for "const x = " prefix
                let prefixLength = 0;
                let current = replaceNode.parent;

                while (current) {
                    if (current.type === "VariableDeclarator") {
                        const declText = sourceCode.getText(current.id);

                        prefixLength = `const ${declText} = `.length;

                        break;
                    }

                    if (current.type === "MemberExpression" || current.type === "ChainExpression") {
                        current = current.parent;

                        continue;
                    }

                    break;
                }

                const totalLength = indent + prefixLength + fullCollapsed.length;

                // Only simplify if the result fits on one line (max ~120 chars)
                if (totalLength > 120) return;

                context.report({
                    fix: (fixer) => fixer.replaceText(replaceNode, fullCollapsed),
                    message: "Simple function call with arrow function should be on a single line",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Simplify simple function calls with arrow function to single line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Single Argument On One Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function calls with a single simple argument (literal,
 *   identifier, member expression) should be on one line.
 *
 * ✓ Good:
 *   fn(arg)
 *   getValue("key")
 *   obj.method(value)
 *
 * ✗ Bad:
 *   fn(
 *       arg,
 *   )
 */
const singleArgumentOnOneLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isSimpleArgHandler = (argNode) => {
            if (!argNode) return false;

            // Simple literals (strings, numbers, booleans, null)
            if (argNode.type === "Literal") return true;

            // Simple identifiers
            if (argNode.type === "Identifier") return true;

            // Simple member expressions like obj.prop
            if (argNode.type === "MemberExpression") {
                return argNode.object.type === "Identifier"
                    && argNode.property.type === "Identifier"
                    && !argNode.computed;
            }

            // Template literals without expressions
            if (argNode.type === "TemplateLiteral" && argNode.expressions.length === 0) return true;

            // Unary expressions like !flag, -1
            if (argNode.type === "UnaryExpression") {
                return isSimpleArgHandler(argNode.argument);
            }

            return false;
        };

        return {
            CallExpression(node) {
                const { arguments: args, callee } = node;

                // Only check calls with exactly one argument
                if (args.length !== 1) return;

                const arg = args[0];

                // Only handle simple arguments
                if (!isSimpleArgHandler(arg)) return;

                // Check if the call spans multiple lines
                if (node.loc.start.line === node.loc.end.line) return;

                // Get tokens
                const openParen = sourceCode.getTokenAfter(
                    callee,
                    (token) => token.value === "(",
                );
                const closeParen = sourceCode.getLastToken(node);

                if (!openParen || !closeParen || closeParen.value !== ")") return;

                // Build the fixed version
                // Include type arguments if they exist (TypeScript generics)
                const typeArgs = node.typeArguments || node.typeParameters;
                let calleeText = sourceCode.getText(callee);

                if (typeArgs) {
                    calleeText += sourceCode.getText(typeArgs);
                }

                const argText = sourceCode.getText(arg);
                const fixedCall = `${calleeText}(${argText})`;

                // Only fix if reasonable length
                if (fixedCall.length > 120) return;

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node,
                        fixedCall,
                    ),
                    message: "Single simple argument should be on one line",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce single simple argument calls to be on one line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: String Property Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   String property keys should not have extra leading or
 *   trailing spaces inside the quotes.
 *
 * ✓ Good:
 *   { "& a": value }
 *   { "selector": value }
 *
 * ✗ Bad:
 *   { " & a ": value }
 *   { " selector ": value }
 */
const stringPropertySpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Property(node) {
                const { key } = node;

                // Only check string literal keys
                if (key.type !== "Literal" || typeof key.value !== "string") return;

                const keyValue = key.value;

                // Check if the string has leading or trailing spaces
                const trimmed = keyValue.trim();

                if (keyValue !== trimmed && trimmed.length > 0) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(key, `"${trimmed}"`),
                        message: `String property key should not have extra spaces inside quotes: "${trimmed}" not "${keyValue}"`,
                        node: key,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce no extra spaces inside string property keys" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Hardcoded Strings
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that user-facing strings should be imported from
 *   constants/strings/data modules rather than hardcoded inline.
 *   This promotes maintainability, consistency, and enables
 *   easier internationalization.
 *
 *   The rule also detects special strings that should be enums:
 *   - HTTP status codes (2xx, 4xx, 5xx like "200", "404", "500")
 *   - HTTP methods ("GET", "POST", "PUT", "DELETE", etc.)
 *   - Role/permission names ("admin", "user", "moderator", etc.)
 *   - Environment names ("production", "development", "staging", etc.)
 *   - Log levels ("debug", "info", "warn", "error", etc.)
 *   - Status strings ("active", "pending", "approved", "rejected", etc.)
 *   - Priority levels ("high", "medium", "low", "critical", etc.)
 *
 * Valid import sources for strings:
 *   - @/data
 *   - @/strings
 *   - @/constants
 *   - @/@strings
 *   - @/@constants
 *
 * Valid import sources for enums:
 *   - @/enums
 *   - @/data
 *
 * Options:
 *   { ignoreAttributes: ["className", "id", ...] } - JSX attributes to ignore (replaces defaults)
 *   { extraIgnoreAttributes: ["tooltip", ...] } - Additional JSX attributes to ignore (extends defaults)
 *   { ignorePatterns: [/^[A-Z_]+$/, ...] } - Regex patterns for strings to ignore
 *
 * ✓ Good:
 *   import { BUTTON_LABEL, ERROR_MESSAGE } from "@/constants";
 *   import { welcomeText } from "@/strings";
 *   import { HttpStatus, UserRole } from "@/enums";
 *
 *   <button>{BUTTON_LABEL}</button>
 *   <span>{ERROR_MESSAGE}</span>
 *   const message = welcomeText;
 *   if (status === HttpStatus.NOT_FOUND) { ... }
 *   if (role === UserRole.ADMIN) { ... }
 *
 * ✗ Bad:
 *   <button>Submit</button>
 *   <span>Something went wrong</span>
 *   const message = "Welcome to the app";
 *   return "User not found";
 *   if (status === "404") { ... }      // HTTP status code
 *   if (role === "admin") { ... }      // Role name
 */
const noHardcodedStrings = {
    create(context) {
        const options = context.options[0] || {};

        // JSX attributes that commonly contain non-translatable values
        const defaultIgnoreAttributes = [
            "accept",
            "acceptCharset",
            "accessKey",
            "action",
            "align",
            "allow",
            "allowFullScreen",
            "alt", // Often needs translation but sometimes contains technical descriptions
            "as",
            "async",
            "autoCapitalize",
            "autoComplete",
            "autoCorrect",
            "autoFocus",
            "autoPlay",
            "capture",
            "cellPadding",
            "cellSpacing",
            "charSet",
            "className",
            "clipPath", // SVG
            "clipRule", // SVG
            "colorInterpolation", // SVG
            "colorInterpolationFilters", // SVG
            "classNames",
            "colSpan",
            "contentEditable",
            "controls",
            "controlsList",
            "coords",
            "crossOrigin",
            "d", // SVG path data
            "data",
            "data-*",
            "dateTime",
            "decoding",
            "default",
            "defer",
            "dir",
            "disabled",
            "download",
            "draggable",
            "encType",
            "enterKeyHint",
            "fill", // SVG
            "fillOpacity", // SVG
            "fillRule", // SVG
            "filter", // SVG filter reference
            "filterUnits", // SVG
            "floodColor", // SVG
            "floodOpacity", // SVG
            "for",
            "form",
            "formAction",
            "formEncType",
            "formMethod",
            "formNoValidate",
            "formTarget",
            "frameBorder",
            "headers",
            "height",
            "hidden",
            "high",
            "href",
            "hrefLang",
            "htmlFor",
            "httpEquiv",
            "gradientTransform", // SVG
            "gradientUnits", // SVG
            "icon",
            "id",
            "in", // SVG filter input
            "in2", // SVG filter input
            "imagesizes",
            "imagesrcset",
            "inputMode",
            "integrity",
            "is",
            "itemID",
            "itemProp",
            "itemRef",
            "itemScope",
            "itemType",
            "key",
            "keyParams",
            "keyType",
            "kind",
            "lang",
            "list",
            "loading",
            "loop",
            "low",
            "marginHeight",
            "marginWidth",
            "markerEnd", // SVG
            "markerMid", // SVG
            "markerStart", // SVG
            "markerUnits", // SVG
            "mask", // SVG
            "max",
            "mode", // SVG blend mode
            "maxLength",
            "media",
            "mediaGroup",
            "method",
            "min",
            "minLength",
            "multiple",
            "muted",
            "name",
            "noModule",
            "noValidate",
            "nonce",
            "open",
            "optimum",
            "pattern",
            "patternContentUnits", // SVG
            "patternTransform", // SVG
            "patternUnits", // SVG
            "ping",
            "preserveAspectRatio", // SVG
            "playsInline",
            "poster",
            "preload",
            "profile",
            "radioGroup",
            "readOnly",
            "referrerPolicy",
            "rel",
            "repeatCount", // SVG
            "repeatDur", // SVG
            "required",
            "result", // SVG filter result
            "reversed",
            "role",
            "rowSpan",
            "rows",
            "sandbox",
            "scope",
            "scoped",
            "scrolling",
            "seamless",
            "selected",
            "shape",
            "sizes",
            "slot",
            "span",
            "spellCheck",
            "src",
            "srcDoc",
            "srcLang",
            "srcSet",
            "start",
            "step",
            "spreadMethod", // SVG
            "stdDeviation", // SVG filter blur
            "stopColor", // SVG gradient
            "stopOpacity", // SVG gradient
            "stroke", // SVG
            "strokeDasharray", // SVG
            "strokeDashoffset", // SVG
            "strokeLinecap", // SVG
            "strokeLinejoin", // SVG
            "strokeMiterlimit", // SVG
            "strokeOpacity", // SVG
            "strokeWidth", // SVG
            "style",
            "summary",
            "tabIndex",
            "target",
            "testId",
            "textAnchor", // SVG
            "textDecoration", // SVG
            "transform", // SVG
            "translate",
            // "type" removed - should use enums for input/button types to prevent typos
            "vectorEffect", // SVG
            "useMap",
            "value",
            "viewBox", // SVG
            "width",
            "wmode",
            "wrap",
            "x", // SVG coordinate
            "x1", // SVG line coordinate
            "x2", // SVG line coordinate
            "xmlns",
            "y", // SVG coordinate
            "y1", // SVG line coordinate
            "y2", // SVG line coordinate
            // SVG filter primitive attributes
            "baseFrequency",
            "numOctaves",
            "seed",
            "stitchTiles",
            "operator",
            "k1",
            "k2",
            "k3",
            "k4",
            "surfaceScale",
            "diffuseConstant",
            "specularConstant",
            "specularExponent",
            "kernelMatrix",
            "order",
            "targetX",
            "targetY",
            "edgeMode",
            "kernelUnitLength",
            "bias",
            "divisor",
            "preserveAlpha",
            "radius",
            "azimuth",
            "elevation",
            "limitingConeAngle",
            "pointsAtX",
            "pointsAtY",
            "pointsAtZ",
            // SVG shape attributes
            "cx", // circle/ellipse center x
            "cy", // circle/ellipse center y
            "r", // circle radius
            "rx", // ellipse radius x
            "ry", // ellipse radius y
            "points", // polygon/polyline points
            "pathLength",
            "offset", // gradient offset
            "dx", // text offset
            "dy", // text offset
            "rotate", // text rotate
            "lengthAdjust",
            "textLength",
        ];

        const ignoreAttributes = options.ignoreAttributes
            || [...defaultIgnoreAttributes, ...(options.extraIgnoreAttributes || [])];

        // Patterns for strings that are likely technical/non-translatable
        const technicalPatterns = [
            // Empty or whitespace only
            /^\s*$/,
            // Single characters
            /^.$/,
            // CSS units and values
            /^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|deg|rad|turn|s|ms|fr)?$/,
            // Scientific notation numbers (common in SVG coordinates)
            /^-?\d+(\.\d+)?e[+-]?\d+$/i,
            // Colors (hex, rgb, hsl)
            /^#[0-9a-fA-F]{3,8}$/,
            /^(rgb|rgba|hsl|hsla)\(.+\)$/,
            // URL references (SVG filters, clips, etc.)
            /^url\(#?.+\)$/,
            // SVG standard attribute values
            /^(round|butt|square|miter|bevel|none|normal|evenodd|nonzero|sRGB|linearRGB|userSpaceOnUse|objectBoundingBox|pad|reflect|repeat|auto|inherit|currentColor|meet|slice|xMinYMin|xMidYMin|xMaxYMin|xMinYMid|xMidYMid|xMaxYMid|xMinYMax|xMidYMax|xMaxYMax|stitch|noStitch|duplicate|wrap|arithmetic|atop|in|out|over|xor|dilate|erode|matrix|saturate|hueRotate|luminanceToAlpha|discrete|linear|gamma|table|identity|SourceGraphic|SourceAlpha|BackgroundImage|BackgroundAlpha|FillPaint|StrokePaint)$/,
            // SVG filter result/internal identifiers (patterns like effect1_foregroundBlur, filter0_f_21_211, BackgroundImageFix)
            /^[a-zA-Z]+\d*[_a-zA-Z0-9]*(_[a-zA-Z0-9]+)+$/,
            // Color names (CSS named colors used in SVG)
            /^(white|black|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|cyan|magenta|transparent)$/i,
            // CSS cursor values (excluding "text" as it conflicts with input type)
            /^(auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|vertical-text|alias|copy|move|no-drop|not-allowed|grab|grabbing|all-scroll|col-resize|row-resize|n-resize|e-resize|s-resize|w-resize|ne-resize|nw-resize|se-resize|sw-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|zoom-in|zoom-out)$/,
            // CSS display/visibility values
            /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|flow-root|contents|table|table-row|table-cell|list-item|none|visible|hidden|collapse)$/,
            // CSS position values
            /^(static|relative|absolute|fixed|sticky)$/,
            // CSS overflow values
            /^(visible|hidden|scroll|auto|clip)$/,
            // URLs and paths
            /^(https?:\/\/|\/\/|\/|\.\/|\.\.\/)/,
            // Data URLs
            /^data:/,
            // Email pattern check (not full validation)
            /^mailto:/,
            // Tel pattern
            /^tel:/,
            // File extensions
            /^\.[a-zA-Z0-9]+$/,
            // MIME types
            /^[a-z]+\/[a-z0-9.+-]+$/,
            // UUIDs
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
            // Date formats (ISO, common patterns)
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/,
            // Time formats
            /^\d{1,2}:\d{2}(:\d{2})?(\s?(AM|PM|am|pm))?$/,
            // JSON keys - require actual naming convention markers (underscore/uppercase in middle)
            // camelCase: must have uppercase letter in middle (e.g., userId, firstName)
            /^[a-z]+[A-Z][a-zA-Z0-9]*$/,
            // snake_case: must have underscore (e.g., user_id, first_name)
            /^[a-z][a-z0-9]*_[a-z0-9_]*$/,
            // SCREAMING_SNAKE_CASE: must have underscore (e.g., MAX_VALUE, API_URL)
            /^[A-Z][A-Z0-9]*_[A-Z0-9_]+$/,
            // Common technical strings
            /^(true|false|null|undefined|NaN|Infinity)$/,
            // Content types
            /^application\//,
            // Query parameters
            /^[a-z][a-zA-Z0-9_]*=/,
            // CSS property-like (kebab-case): must have hyphen (e.g., font-size, background-color)
            /^[a-z]+-[a-z]+(-[a-z]+)*$/,
            // Tailwind CSS utility classes
            // With numbers: w-5, p-4, pr-12, mt-1, text-2xl, gap-4, h-5, rounded-lg, etc.
            /^-?[a-z]+-\d+(\.\d+)?(\/\d+)?$/,
            /^-?[a-z]+-[a-z]+-\d+(\.\d+)?(\/\d+)?$/,
            // With modifiers: hover:bg-primary, focus:ring-2, sm:flex, disabled:opacity-50, etc.
            /^[a-z]+:[a-z][-a-z0-9/]*$/,
            // With opacity: bg-white/50, text-black/80, placeholder-error/50, etc.
            /^[a-z]+-[a-z]+(-[a-z]+)*\/\d+$/,
            // Arbitrary values: w-[100px], bg-[#ff0000], translate-x-[50%], etc.
            /^-?[a-z]+(-[a-z]+)*-\[.+\]$/,
            // Negative transforms: -translate-y-1/2, -rotate-45, -skew-x-12, etc.
            /^-[a-z]+-[a-z]+-\d+\/\d+$/,
            // Common Tailwind patterns with full/auto/screen/none/inherit etc.
            /^[a-z]+-(full|auto|screen|none|inherit|initial|px|fit|min|max)$/,
            // Responsive/state prefixes with values: sm:w-full, md:flex, lg:hidden, etc.
            /^(sm|md|lg|xl|2xl|hover|focus|active|disabled|first|last|odd|even|group-hover|dark|motion-safe|motion-reduce):[a-z][-a-z0-9/[\]]*$/,
            // Numbers with separators
            /^[\d,._]+$/,
            // Semantic version
            /^\d+\.\d+\.\d+/,
            // Common separators
            /^[,;:|•·\-–—/\\]+$/,
            // HTML entities
            /^&[a-z]+;$/,
            // Punctuation only
            /^[.!?,;:'"()\[\]{}]+$/,
            // CSS transform functions: rotate(), translate(), scale(), skew(), matrix(), etc.
            /^(rotate|translate|translateX|translateY|translateZ|translate3d|scale|scaleX|scaleY|scaleZ|scale3d|skew|skewX|skewY|matrix|matrix3d|perspective)\(.+\)$/,
            // CSS transform values with multiple functions: "rotate(90deg) scaleX(-1)"
            /^(rotate|translate|translateX|translateY|scale|scaleX|scaleY|skew|skewX|skewY|matrix)\([^)]+\)(\s+(rotate|translate|translateX|translateY|scale|scaleX|scaleY|skew|skewX|skewY|matrix)\([^)]+\))+$/,
            // CSS gradient functions
            /^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\(.+\)$/,
            // CSS animation shorthand: "spin 2s linear infinite"
            /^[a-zA-Z][\w-]*\s+[\d.]+m?s\s+[\w-]+(\s+[\w-]+)*$/,
            // CSS transform-origin values: "50% 50%", "center center", "top left"
            /^(\d+%|center|top|bottom|left|right)(\s+(\d+%|center|top|bottom|left|right))?$/,
            // CSS calc() function
            /^calc\(.+\)$/,
            // CSS var() function
            /^var\(.+\)$/,
            // CSS clamp() function
            /^clamp\(.+\)$/,
            // CSS min/max functions
            /^(min|max)\(.+\)$/,
        ];

        const extraIgnorePatterns = (options.ignorePatterns || []).map((p) => {
            if (typeof p === "string") return new RegExp(p);

            return p;
        });

        const allIgnorePatterns = [...technicalPatterns, ...extraIgnorePatterns];

        // Tailwind/CSS class pattern - matches individual class names
        const tailwindClassPattern = /^-?[a-z]+(-[a-z0-9]+)*(\/\d+)?$|^-?[a-z]+(-[a-z0-9]+)*-\[.+\]$|^[a-z]+:[a-z][-a-z0-9/[\]]*$/;

        // Known single-word Tailwind utilities (no hyphen required)
        const singleWordTailwindUtilities = new Set([
            // Display
            "block", "contents", "flex", "flow", "grid", "hidden", "inline", "table",
            // Position
            "absolute", "fixed", "relative", "static", "sticky",
            // Visibility
            "collapse", "invisible", "visible",
            // Typography
            "antialiased", "capitalize", "italic", "lowercase", "ordinal", "overline",
            "subpixel", "truncate", "underline", "uppercase",
            // Layout
            "container", "isolate",
            // Misc
            "resize", "snap", "touch", "select", "pointer", "transition", "animate",
            "filter", "backdrop", "transform", "appearance", "cursor", "outline",
            "ring", "shadow", "opacity", "blur", "invert", "sepia", "grayscale",
            "hue", "saturate", "brightness", "contrast",
        ]);

        // Check if a string contains only CSS/Tailwind class names
        const isTailwindClassStringHandler = (str) => {
            // Split by whitespace and filter empty strings
            const tokens = str.trim().split(/\s+/).filter(Boolean);

            // Must have at least one token
            if (tokens.length === 0) return false;

            // Must have at least one token with Tailwind-like syntax (hyphen, colon, slash, or brackets)
            // to be considered a Tailwind class string
            const hasTailwindSyntax = tokens.some((token) =>
                token.includes("-") || token.includes(":") || token.includes("/") || token.includes("["));

            if (!hasTailwindSyntax) return false;

            // Check if all tokens look like CSS classes
            return tokens.every((token) => {
                // Skip template literal expressions placeholders if any
                if (token.includes("${")) return true;

                // Known single-word Tailwind utilities
                if (singleWordTailwindUtilities.has(token)) return true;

                // Common Tailwind patterns - MUST have hyphen, colon, slash, or brackets
                return (
                    // Kebab-case: w-5, p-4, pr-12, text-2xl, gap-4, bg-white, text-error
                    /^-?[a-z]+(-[a-z0-9]+)+$/.test(token)
                    // With fractions: w-1/2, -translate-y-1/2, bg-black/50
                    || /^-?[a-z]+(-[a-z0-9]+)*\/\d+$/.test(token)
                    // With modifiers: hover:bg-primary, focus:ring-2, sm:flex
                    || /^[a-z0-9]+:[a-z][-a-z0-9/[\]]*$/.test(token)
                    // Arbitrary values: w-[100px], bg-[#ff0000]
                    || /^-?[a-z]+(-[a-z]+)*-?\[.+\]$/.test(token)
                );
            });
        };

        // HTML input types - standard browser input types, not hardcoded strings
        const htmlInputTypes = new Set([
            "button",
            "checkbox",
            "color",
            "date",
            "datetime-local",
            "email",
            "file",
            "hidden",
            "image",
            "month",
            "number",
            "password",
            "radio",
            "range",
            "reset",
            "search",
            "submit",
            "tel",
            "text",
            "time",
            "url",
            "week",
        ]);

        // Check if string is an HTML input type
        const isHtmlInputTypeHandler = (str) => htmlInputTypes.has(str.toLowerCase());

        // Check if node is inside a style object expression (style={{ ... }})
        const isInsideStyleObjectHandler = (node) => {
            let current = node.parent;

            while (current) {
                // Check if we're in a Property inside an ObjectExpression inside a JSXAttribute named "style"
                if (current.type === "Property" && current.parent && current.parent.type === "ObjectExpression") {
                    const objExpr = current.parent;

                    if (objExpr.parent && objExpr.parent.type === "JSXExpressionContainer") {
                        const jsxExprContainer = objExpr.parent;

                        if (jsxExprContainer.parent && jsxExprContainer.parent.type === "JSXAttribute") {
                            const attrName = jsxExprContainer.parent.name && jsxExprContainer.parent.name.name;

                            if (attrName === "style") return true;
                        }
                    }
                }

                current = current.parent;
            }

            return false;
        };

        // CSS/style-related variable name patterns
        const styleVariablePatterns = [
            /gradient/i,
            /transform/i,
            /animation/i,
            /transition/i,
            /color/i,
            /background/i,
            /border/i,
            /shadow/i,
            /filter/i,
            /clip/i,
            /mask/i,
            /font/i,
            /^style/i,
            /Style$/i,
            /css/i,
        ];

        // Check if template literal content looks like CSS value
        const isCssValueHandler = (str) => {
            // CSS functions: linear-gradient, radial-gradient, rotate, translate, etc.
            if (/^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|rotate|translate|translateX|translateY|translateZ|translate3d|scale|scaleX|scaleY|scaleZ|scale3d|skew|skewX|skewY|matrix|matrix3d|perspective|calc|var|clamp|min|max|cubic-bezier|steps|url)\(/i.test(str)) {
                return true;
            }

            // Color values
            if (/^(#[0-9a-fA-F]{3,8}|rgb|rgba|hsl|hsla)\(/i.test(str)) return true;

            // CSS value with units
            if (/^\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax|deg|rad|turn|s|ms|fr)\s*/.test(str)) return true;

            return false;
        };

        // Check if a template literal is assigned to a style-related variable
        const isStyleVariableAssignmentHandler = (node) => {
            let current = node.parent;

            while (current) {
                if (current.type === "VariableDeclarator" && current.id && current.id.name) {
                    const varName = current.id.name;

                    // Check if variable name matches style patterns
                    if (styleVariablePatterns.some((pattern) => pattern.test(varName))) {
                        return true;
                    }
                }

                // Check for property assignment like: const styles = { gradient: `...` }
                if (current.type === "Property" && current.key) {
                    const propName = current.key.name || (current.key.value && String(current.key.value));

                    if (propName && styleVariablePatterns.some((pattern) => pattern.test(propName))) {
                        return true;
                    }
                }

                current = current.parent;
            }

            return false;
        };

        // Check if this is a module-level exported string that should be flagged
        const isExportedHardcodedStringHandler = (node) => {
            let current = node.parent;
            let depth = 0;

            while (current) {
                depth++;

                // Check for export const name = "value" pattern (NOT in function)
                if (current.type === "ExportNamedDeclaration" && depth <= 3) {
                    const declaration = current.declaration;

                    if (declaration && declaration.type === "VariableDeclaration") {
                        const declarator = declaration.declarations[0];

                        if (declarator && declarator.id && declarator.id.name) {
                            const varName = declarator.id.name;

                            // Skip SCREAMING_SNAKE_CASE - these are intentional constants
                            if (/^[A-Z][A-Z0-9_]*$/.test(varName)) return false;

                            // Skip constants-like variable names
                            if (/^(constants?|strings?|messages?|labels?|texts?|data)$/i.test(varName)) return false;

                            // This is an exported string that looks like a hardcoded value (e.g., tokenKey)
                            return true;
                        }
                    }
                }

                // Stop if we hit a function - we're inside a function, not module-level
                if (
                    current.type === "FunctionDeclaration"
                    || current.type === "FunctionExpression"
                    || current.type === "ArrowFunctionExpression"
                ) {
                    return false;
                }

                current = current.parent;
            }

            return false;
        };

        // Get descriptive error message based on string type
        const getErrorMessageHandler = (str, context = "") => {
            const truncatedStr = str.length > 30 ? `${str.substring(0, 30)}...` : str;
            const contextPart = context ? ` in ${context}` : "";

            // Single word detection:
            // - All lowercase (e.g., "loading", "submit") → keyword/enum/data
            // - Starts with capital (e.g., "Loading", "Submit") → UI string
            // - Has spaces or multiple words → UI string
            const isSingleWord = !/\s/.test(str) && str.length <= 30;
            const isAllLowercase = /^[a-z_]+$/.test(str);

            // For JSX attributes (type, variant, etc.), prefer enums to prevent typos
            const isJsxAttribute = context.includes("attribute");

            if (isSingleWord && isAllLowercase) {
                if (isJsxAttribute) {
                    return `Hardcoded "${truncatedStr}"${contextPart} should be imported from @/enums (preferred) or @/data to prevent typos (e.g., import { InputTypeEnum } from "@/enums")`;
                }

                return `Hardcoded "${truncatedStr}"${contextPart} should be imported from @/enums (preferred) or @/data (e.g., import { StatusEnum } from "@/enums")`;
            }

            // UI string: starts with capital, has spaces, or multiple words
            return `Hardcoded UI string "${truncatedStr}"${contextPart} should be imported from @/strings or @/constants (e.g., import { strings } from "@/strings")`;
        };

        // Check if a string matches any ignore pattern
        const shouldIgnoreStringHandler = (str) => {
            // Skip Tailwind/CSS class strings
            if (isTailwindClassStringHandler(str)) return true;

            return allIgnorePatterns.some((pattern) => pattern.test(str));
        };

        // Check if we're inside a constants/strings/data/enums file
        const isConstantsFileHandler = () => {
            const filename = context.filename || context.getFilename();
            const normalizedPath = filename.replace(/\\/g, "/").toLowerCase();

            // Check if file is in constants/strings/data/enums folders
            return /\/(constants|strings|@constants|@strings|data|@data|enums|@enums)(\/|\.)/i.test(normalizedPath)
                || /\/data\/(constants|strings)/i.test(normalizedPath);
        };

        // Check if the string is from an imported constant
        const importedConstantsHandler = new Set();

        // Track which identifiers come from constants imports
        const trackImportsHandler = (node) => {
            const importPath = node.source.value;

            if (typeof importPath !== "string") return;

            // Check if import is from constants/strings/data/enums
            const isFromConstants = /@?\/?(@?constants|@?strings|@?data|@?enums|data\/constants|data\/strings)/i
                .test(importPath);

            if (isFromConstants) {
                node.specifiers.forEach((spec) => {
                    if (spec.local && spec.local.name) {
                        importedConstantsHandler.add(spec.local.name);
                    }
                });
            }
        };

        // Check if a node is a reference to an imported constant
        const isImportedConstantHandler = (node) => {
            if (node.type === "Identifier") {
                return importedConstantsHandler.has(node.name);
            }

            if (node.type === "MemberExpression") {
                // Check if the object is an imported constant (e.g., STRINGS.welcome)
                if (node.object.type === "Identifier") {
                    return importedConstantsHandler.has(node.object.name);
                }
            }

            return false;
        };

        // Check if we're in a component, hook, or utility function
        const isInRelevantContextHandler = (node) => {
            let current = node.parent;

            while (current) {
                // Check for function declarations/expressions
                if (
                    current.type === "FunctionDeclaration"
                    || current.type === "FunctionExpression"
                    || current.type === "ArrowFunctionExpression"
                ) {
                    // Get function name if available
                    let funcName = null;

                    if (current.id && current.id.name) {
                        funcName = current.id.name;
                    } else if (
                        current.parent
                        && current.parent.type === "VariableDeclarator"
                        && current.parent.id
                        && current.parent.id.name
                    ) {
                        funcName = current.parent.id.name;
                    }

                    if (funcName) {
                        // React components (PascalCase)
                        if (/^[A-Z]/.test(funcName)) return true;

                        // Custom hooks (useXxx)
                        if (/^use[A-Z]/.test(funcName)) return true;

                        // Utility/helper functions (common patterns)
                        if (/Handler$|Helper$|Util$|Utils$/i.test(funcName)) return true;

                        // Any function that returns JSX is a component
                        // (This is checked via JSX detection below)
                    }

                    return true; // Check all functions for now
                }

                // Check for JSX - if we're in JSX, we're in a component
                if (
                    current.type === "JSXElement"
                    || current.type === "JSXFragment"
                ) {
                    return true;
                }

                current = current.parent;
            }

            return false;
        };

        // Check if string is in an object that looks like constants definition
        const isInConstantsObjectHandler = (node) => {
            let current = node.parent;
            let depth = 0;

            while (current) {
                depth++;

                if (current.type === "VariableDeclarator") {
                    const varName = current.id && current.id.name;

                    if (varName) {
                        // Check for SCREAMING_SNAKE_CASE (e.g., MY_CONSTANT, API_URL)
                        if (/^[A-Z][A-Z0-9_]*$/.test(varName)) {
                            return true;
                        }

                        // Check for exact keywords or keywords at word boundaries (not in Handler names)
                        // Match: MESSAGES, Messages, userMessages, but NOT longMessageHandler
                        if (/^(constants?|strings?|messages?|labels?|texts?|data)$/i.test(varName)) {
                            return true;
                        }
                    }
                }

                // Check for export const CONSTANT_NAME = "value" - only direct assignments (depth <= 3)
                // e.g., export const X = "value" or export const X = { key: "value" }
                // But NOT strings inside exported functions like export const Component = () => { const x = "value" }
                if (current.type === "ExportNamedDeclaration" && depth <= 3) {
                    // Only skip if the export is a direct literal or object, not a function
                    const declaration = current.declaration;

                    if (declaration && declaration.type === "VariableDeclaration") {
                        const declarator = declaration.declarations[0];

                        if (declarator && declarator.init) {
                            const initType = declarator.init.type;

                            // Skip if it's a direct string, object, or array constant
                            if (initType === "Literal" || initType === "ObjectExpression" || initType === "ArrayExpression") {
                                return true;
                            }
                        }
                    }
                }

                // Stop traversing if we hit a function - strings inside functions should be checked
                if (
                    current.type === "FunctionDeclaration"
                    || current.type === "FunctionExpression"
                    || current.type === "ArrowFunctionExpression"
                ) {
                    return false;
                }

                current = current.parent;
            }

            return false;
        };

        // Skip if we're in a constants file
        if (isConstantsFileHandler()) {
            return {};
        }

        return {
            ImportDeclaration: trackImportsHandler,

            // Check JSX text content
            JSXText(node) {
                const text = node.value.trim();

                if (!text) return;

                if (shouldIgnoreStringHandler(text)) return;

                // Check if it looks like user-facing text (contains letters)
                if (!/[a-zA-Z]/.test(text)) return;

                context.report({
                    message: getErrorMessageHandler(text, "JSX"),
                    node,
                });
            },

            // Check JSX expression containers with string literals
            JSXExpressionContainer(node) {
                const { expression } = node;

                // Skip if it's a reference to an imported constant
                if (isImportedConstantHandler(expression)) return;

                // Check if we're inside a JSX attribute that should be ignored (like className)
                if (node.parent && node.parent.type === "JSXAttribute") {
                    const attrName = node.parent.name.name
                        || (node.parent.name.namespace && `${node.parent.name.namespace.name}:${node.parent.name.name.name}`);

                    // Skip if attribute is in ignore list (className, style, etc.)
                    if (ignoreAttributes.includes(attrName)) return;

                    // Skip data-* and aria-* attributes
                    if (attrName && (attrName.startsWith("data-") || attrName.startsWith("aria-"))) return;
                }

                // Check string literals
                if (expression.type === "Literal" && typeof expression.value === "string") {
                    const str = expression.value;

                    if (shouldIgnoreStringHandler(str)) return;

                    // Check if it looks like user-facing text
                    if (!/[a-zA-Z]/.test(str)) return;

                    context.report({
                        message: getErrorMessageHandler(str, "JSX expression"),
                        node: expression,
                    });
                }

                // Check template literals
                if (expression.type === "TemplateLiteral") {
                    expression.quasis.forEach((quasi) => {
                        const str = quasi.value.cooked || quasi.value.raw;

                        if (shouldIgnoreStringHandler(str)) return;

                        // Check if it contains user-facing text
                        if (!/[a-zA-Z]{2,}/.test(str)) return;

                        // Skip if it looks like a path or URL pattern
                        if (/^[/.]|https?:\/\//.test(str)) return;

                        context.report({
                            message: getErrorMessageHandler(str, "template literal"),
                            node: quasi,
                        });
                    });
                }
            },

            // Check JSX attributes
            JSXAttribute(node) {
                if (!node.value) return;

                // Get attribute name
                const attrName = node.name.name || (node.name.namespace && `${node.name.namespace.name}:${node.name.name.name}`);

                // Skip ignored attributes
                if (ignoreAttributes.includes(attrName)) return;

                // Handle data-* attributes
                if (attrName && attrName.startsWith("data-")) return;

                // Handle aria-* attributes
                if (attrName && attrName.startsWith("aria-")) return;

                // Check string literal values
                if (node.value.type === "Literal" && typeof node.value.value === "string") {
                    const str = node.value.value;

                    if (shouldIgnoreStringHandler(str)) return;

                    // Check if it looks like user-facing text
                    if (!/[a-zA-Z]/.test(str)) return;

                    context.report({
                        message: getErrorMessageHandler(str, `attribute "${attrName}"`),
                        node: node.value,
                    });
                }

                // Check expression containers
                if (node.value.type === "JSXExpressionContainer") {
                    const { expression } = node.value;

                    // Skip if it's a reference to an imported constant
                    if (isImportedConstantHandler(expression)) return;

                    if (expression.type === "Literal" && typeof expression.value === "string") {
                        const str = expression.value;

                        if (shouldIgnoreStringHandler(str)) return;

                        if (!/[a-zA-Z]/.test(str)) return;

                        context.report({
                            message: getErrorMessageHandler(str, `attribute "${attrName}"`),
                            node: expression,
                        });
                    }
                }
            },

            // Check string literals in component/hook/utility logic
            Literal(node) {
                // Only check string literals
                if (typeof node.value !== "string") return;

                const str = node.value;

                // Skip if inside a style object (style={{ transform: "..." }})
                if (isInsideStyleObjectHandler(node)) return;

                // Check for exported hardcoded strings (e.g., export const tokenKey = "auth_token")
                // These should be flagged even at module level, regardless of whether the value
                // looks "technical" - the point is exposing hardcoded strings in exports
                if (isExportedHardcodedStringHandler(node)) {
                    // Skip if it doesn't look like user-facing text
                    if (!/[a-zA-Z]/.test(str)) return;

                    context.report({
                        message: getErrorMessageHandler(str, "exported constant"),
                        node,
                    });

                    return;
                }

                // Skip if it matches ignore patterns (for strings inside functions)
                if (shouldIgnoreStringHandler(str)) return;

                // Skip if not in relevant context (must be inside a function)
                if (!isInRelevantContextHandler(node)) return;

                // Skip if in a constants definition object
                if (isInConstantsObjectHandler(node)) return;

                // Skip JSX (handled separately)
                if (node.parent.type === "JSXAttribute" || node.parent.type === "JSXExpressionContainer") return;

                // Skip import/export sources
                if (node.parent.type === "ImportDeclaration" || node.parent.type === "ExportNamedDeclaration" || node.parent.type === "ExportAllDeclaration") return;

                // Skip object property keys
                if (node.parent.type === "Property" && node.parent.key === node) return;

                // Skip if it doesn't look like user-facing text
                if (!/[a-zA-Z]/.test(str)) return;

                context.report({
                    message: getErrorMessageHandler(str),
                    node,
                });
            },

            // Check template literals in component/hook/utility logic
            TemplateLiteral(node) {
                // Skip if in JSX (handled separately)
                if (node.parent.type === "JSXExpressionContainer") return;

                // Skip if inside a style object (style={{ background: `...` }})
                if (isInsideStyleObjectHandler(node)) return;

                // Skip if assigned to a style-related variable with CSS value
                // e.g., const lineGradient = `linear-gradient(...)`
                if (isStyleVariableAssignmentHandler(node)) {
                    // Get full template content to check if it's CSS
                    const fullContent = node.quasis.map((q) => q.value.cooked || q.value.raw).join("");

                    if (isCssValueHandler(fullContent)) return;
                }

                // Skip if not in relevant context
                if (!isInRelevantContextHandler(node)) return;

                // Skip if in a constants definition
                if (isInConstantsObjectHandler(node)) return;

                // Check each quasi (static part)
                node.quasis.forEach((quasi) => {
                    const str = quasi.value.cooked || quasi.value.raw;

                    if (shouldIgnoreStringHandler(str)) return;

                    // Check if it contains substantial user-facing text
                    if (!/[a-zA-Z]{3,}/.test(str)) return;

                    // Skip if it looks like a path, URL, or query
                    if (/^[/.]|^https?:\/\/|^[?&]/.test(str)) return;

                    // Skip interpolation-heavy templates (more expressions than text)
                    if (node.expressions.length > node.quasis.length) return;

                    context.report({
                        message: getErrorMessageHandler(str, "template literal"),
                        node: quasi,
                    });
                });
            },
        };
    },
    meta: {
        docs: {
            description: "Enforce importing strings from constants/strings modules instead of hardcoding them",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    extraIgnoreAttributes: {
                        description: "Additional JSX attributes to ignore (extends defaults)",
                        items: { type: "string" },
                        type: "array",
                    },
                    ignoreAttributes: {
                        description: "JSX attributes to ignore (replaces defaults)",
                        items: { type: "string" },
                        type: "array",
                    },
                    ignorePatterns: {
                        description: "Regex patterns for strings to ignore",
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Variable Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Variable names should follow naming conventions: camelCase
 *   for regular variables and PascalCase for React components.
 *   Auto-fixes SCREAMING_SNAKE_CASE and snake_case to camelCase.
 *
 * ✓ Good:
 *   const userName = "John";
 *   const maxRetries = 3;
 *   const codeLength = 8;
 *   const UserProfile = () => <div />;
 *   const useCustomHook = () => {};
 *
 * ✗ Bad (auto-fixed):
 *   const user_name = "John";     // → userName
 *   const CODE_LENGTH = 8;        // → codeLength
 *   const MAX_RETRIES = 3;        // → maxRetries
 */
const variableNamingConvention = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

        const hookRegex = /^use[A-Z][a-zA-Z0-9]*$/;

        const constantRegex = /^[A-Z][A-Z0-9_]*$/;

        // Convert any naming convention to camelCase
        const toCamelCaseHandler = (name) => {
            // Handle SCREAMING_SNAKE_CASE (e.g., CODE_LENGTH -> codeLength)
            if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle snake_case (e.g., user_name -> userName)
            if (/_/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle PascalCase (e.g., UserName -> userName)
            if (/^[A-Z]/.test(name)) {
                return name[0].toLowerCase() + name.slice(1);
            }

            return name;
        };

        // Get all references to a variable in the current scope
        const getVariableReferencesHandler = (node) => {
            const scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();
            const variable = scope.variables.find((v) => v.name === node.name);

            if (!variable) return [];

            return variable.references.map((ref) => ref.identifier);
        };

        const allowedIdentifiers = [
            "ArrowFunctionExpression", "CallExpression", "FunctionDeclaration", "FunctionExpression",
            "Property", "VariableDeclarator", "JSXElement", "JSXOpeningElement", "ReturnStatement",
            "SwitchCase", "SwitchStatement", "ObjectExpression", "ObjectPattern", "BlockStatement",
            "IfStatement", "Identifier", "RestElement", "AssignmentPattern", "ArrayPattern",
            "MemberExpression", "JSXText", "JSXAttribute", "JSXExpressionContainer",
            // Built-in JavaScript globals
            "Function", "Object", "Array", "String", "Number", "Boolean", "Symbol", "BigInt",
            "Date", "RegExp", "Error", "Map", "Set", "WeakMap", "WeakSet", "Promise",
        ];

        // Check if this is a MUI styled component: styled(Component)(...)
        const isStyledComponentHandler = (init) => {
            if (!init || init.type !== "CallExpression") return false;

            const { callee } = init;

            // Pattern: styled(Component)(...) - callee is CallExpression styled(Component)
            if (callee.type === "CallExpression") {
                const innerCallee = callee.callee;

                // Check if inner callee is "styled" identifier
                if (innerCallee.type === "Identifier" && innerCallee.name === "styled") {
                    return true;
                }

                // Check if inner callee is member expression like emotion's styled.div
                if (innerCallee.type === "MemberExpression" && innerCallee.object.name === "styled") {
                    return true;
                }
            }

            return false;
        };

        // Check if this CallExpression is a styled() call
        const isStyledCallHandler = (node) => {
            if (node.type !== "CallExpression") return false;

            const { callee } = node;

            // Direct styled(Component) call
            if (callee.type === "Identifier" && callee.name === "styled") {
                return true;
            }

            return false;
        };

        const isFunctionTypeHandler = (init) => {
            if (!init) return false;

            if (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") {
                return true;
            }

            if (init.type === "CallExpression" && init.callee) {
                const calleeName = init.callee.name || (init.callee.property && init.callee.property.name);
                const wrapperFunctions = ["memo", "forwardRef", "lazy", "createContext"];

                return wrapperFunctions.includes(calleeName);
            }

            return false;
        };

        const isComponentByNamingHandler = (node) => {
            if (!node.init) return false;

            const name = node.id.name;

            // PascalCase naming indicates a component
            if (/^[A-Z]/.test(name) && isFunctionTypeHandler(node.init)) {
                return true;
            }

            return false;
        };

        const isHookFunctionHandler = (node) => {
            if (!node.init) return false;

            const name = node.id.name;

            return name.startsWith("use") && /^use[A-Z]/.test(name) && isFunctionTypeHandler(node.init);
        };

        // Common component property names that should allow PascalCase
        const componentPropertyNames = [
            "Icon",
            "Component",
            "FormComponent",
            "Layout",
            "Wrapper",
            "Container",
            "Provider",
        ];

        const checkPatternHandler = (node, typeLabel) => {
            if (node.type === "Identifier") {
                const name = node.name;

                if (name.startsWith("_") || constantRegex.test(name) || allowedIdentifiers.includes(name)) return;

                // Allow component property names when destructuring (e.g., { Icon } from map callback)
                if (componentPropertyNames.includes(name)) return;

                if (!camelCaseRegex.test(name)) {
                    context.report({
                        message: `${typeLabel} "${name}" should be camelCase`,
                        node,
                    });
                }
            } else if (node.type === "ObjectPattern") {
                node.properties.forEach((prop) => {
                    if (prop.type === "Property") {
                        checkPatternHandler(
                            prop.value,
                            typeLabel,
                        );
                    }
                    else if (prop.type === "RestElement") {
                        checkPatternHandler(
                            prop.argument,
                            typeLabel,
                        );
                    }
                });
            } else if (node.type === "ArrayPattern") {
                node.elements.forEach((elem) => {
                    if (elem) {
                        checkPatternHandler(
                            elem,
                            typeLabel,
                        );
                    }
                });
            } else if (node.type === "AssignmentPattern") {
                checkPatternHandler(
                    node.left,
                    typeLabel,
                );
            }
            else if (node.type === "RestElement") {
                checkPatternHandler(
                    node.argument,
                    typeLabel,
                );
            }
        };

        const checkVariableDeclaratorHandler = (node) => {
            if (node.id.type !== "Identifier") {
                checkPatternHandler(
                    node.id,
                    "Variable",
                );

                return;
            }

            const name = node.id.name;

            // Enforce PascalCase for styled components: const StyledCard = styled(Card)(...)
            if (isStyledComponentHandler(node.init)) {
                if (!pascalCaseRegex.test(name)) {
                    context.report({
                        message: `Styled component "${name}" should be PascalCase (e.g., StyledCard instead of styledCard)`,
                        node: node.id,
                    });
                }

                return;
            }

            if (name.startsWith("_") || isComponentByNamingHandler(node)) return;

            // Allow PascalCase for variables that reference components by naming convention
            // e.g., const IconComponent = icons[variant], const ActiveIcon = getIcon()
            const componentSuffixes = ["Component", "Icon", "Layout", "Wrapper", "Container", "Provider", "View", "Screen", "Page"];

            if (pascalCaseRegex.test(name) && componentSuffixes.some((suffix) => name.endsWith(suffix))) return;

            if (isHookFunctionHandler(node)) {
                if (!hookRegex.test(name)) {
                    context.report({
                        message: `Hook "${name}" should start with "use" followed by PascalCase (e.g., useEventsList)`,
                        node: node.id,
                    });
                }

                return;
            }

            // Allow PascalCase for data arrays and config objects (e.g., SidebarData, Routes)
            // These typically hold configuration or data that includes component references
            const dataPatterns = [
                /^[A-Z][a-zA-Z]*Data$/,
                /^[A-Z][a-zA-Z]*Config$/,
                /^Routes$/,
            ];

            if (dataPatterns.some((pattern) => pattern.test(name))) {
                // Only allow if initialized with array, object, or function call
                if (node.init && (node.init.type === "ArrayExpression" || node.init.type === "ObjectExpression" || node.init.type === "CallExpression")) {
                    return;
                }
            }

            if (!camelCaseRegex.test(name)) {
                const camelCaseName = toCamelCaseHandler(name);
                const references = getVariableReferencesHandler(node.id);

                context.report({
                    fix: (fixer) => {
                        const fixes = [];

                        // Fix all references to this variable
                        references.forEach((ref) => {
                            fixes.push(fixer.replaceText(ref, camelCaseName));
                        });

                        return fixes;
                    },
                    message: `Variable "${name}" should be camelCase (e.g., ${camelCaseName} instead of ${name})`,
                    node: node.id,
                });
            }
        };

        const checkPropertyHandler = (node) => {
            if (node.computed || node.key.type !== "Identifier") return;

            const name = node.key.name;

            if (name.startsWith("_") || allowedIdentifiers.includes(name)) return;

            // Allow PascalCase for properties that hold component references
            // e.g., Icon: AdminPanelSettingsIcon, FormComponent: UpdateEventForm
            if (node.value && node.value.type === "Identifier") {
                const valueName = node.value.name;

                // If value is PascalCase (component reference), allow PascalCase property name
                if (pascalCaseRegex.test(valueName) && pascalCaseRegex.test(name)) {
                    return;
                }
            }

            // Allow common component property names
            if (componentPropertyNames.includes(name)) return;

            // Allow MUI theme component names (start with Mui)
            if (name.startsWith("Mui")) return;

            if (!camelCaseRegex.test(name)) {
                const camelCaseName = toCamelCaseHandler(name);

                context.report({
                    fix: (fixer) => fixer.replaceText(node.key, camelCaseName),
                    message: `Property "${name}" should be camelCase (e.g., ${camelCaseName} instead of ${name})`,
                    node: node.key,
                });
            }
        };

        const checkFunctionHandlerParamsHandler = (node) => {
            node.params.forEach((param) => checkPatternHandler(
                param,
                "Parameter",
            ));
        };

        const checkCallExpressionHandlerArguments = (node) => {
            // Skip argument checking for styled() calls - they accept PascalCase components
            if (isStyledCallHandler(node)) return;

            node.arguments.forEach((arg) => {
                if (arg.type === "Identifier") {
                    const name = arg.name;

                    if (name.startsWith("_") || constantRegex.test(name) || allowedIdentifiers.includes(name)) return;

                    // Allow component property names as arguments (e.g., Icon, Component)
                    if (componentPropertyNames.includes(name)) return;

                    // Skip PascalCase that doesn't look like a misnamed function
                    // (function-naming-convention handles verb-prefixed PascalCase)
                    if (pascalCaseRegex.test(name)) return;

                    if (!camelCaseRegex.test(name)) {
                        const camelCaseName = toCamelCaseHandler(name);

                        context.report({
                            fix(fixer) {
                                const scope = sourceCode.getScope ? sourceCode.getScope(arg) : context.getScope();
                                const variable = scope.variables.find((v) => v.name === name)
                                    || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                                if (!variable) return fixer.replaceText(arg, camelCaseName);

                                const fixes = [];
                                const fixedRanges = new Set();

                                variable.references.forEach((ref) => {
                                    const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                    if (!fixedRanges.has(rangeKey)) {
                                        fixedRanges.add(rangeKey);
                                        fixes.push(fixer.replaceText(ref.identifier, camelCaseName));
                                    }
                                });

                                return fixes;
                            },
                            message: `Argument "${name}" should be camelCase (e.g., ${camelCaseName} instead of ${name})`,
                            node: arg,
                        });
                    }
                }
            });
        };

        return {
            ArrowFunctionExpression: checkFunctionHandlerParamsHandler,
            CallExpression: checkCallExpressionHandlerArguments,
            FunctionDeclaration: checkFunctionHandlerParamsHandler,
            FunctionExpression: checkFunctionHandlerParamsHandler,
            Property: checkPropertyHandler,
            VariableDeclarator: checkVariableDeclaratorHandler,
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions: camelCase for variables/properties/params/arguments, PascalCase for components, useXxx for hooks" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/*
 * typescript-definition-location
 *
 * Enforce that TypeScript definitions are declared in their designated folders:
 * - Interfaces must be in files inside the "interfaces" folder
 * - Enums must be in files inside the "enums" folder
 * - Types must be in files inside the "types" folder
 *
 * ✓ Good:
 *   // src/interfaces/user.ts
 *   export interface UserInterface { ... }
 *
 *   // src/enums/status.ts
 *   export enum StatusEnum { ... }
 *
 *   // src/types/config.ts
 *   export type ConfigType = { ... }
 *
 * ✗ Bad:
 *   // src/components/user.tsx
 *   export interface UserInterface { ... }  // Interface not in interfaces folder
 */
/*
 * interface-format
 *
 * Enforce consistent formatting for TypeScript interfaces:
 * - Interface name must be PascalCase and end with "Interface" suffix
 * - Properties must be in camelCase
 * - No empty lines between properties
 * - Each property must end with comma (,) not semicolon (;)
 *
 * ✓ Good:
 *   export interface UserInterface {
 *       firstName: string,
 *       lastName: string,
 *       age: number,
 *   }
 *
 * ✗ Bad:
 *   export interface User {           // Missing "Interface" suffix
 *       first_name: string;           // snake_case and semicolon
 *
 *       lastName: string;             // Empty line above and semicolon
 *   }
 */
/*
 * enum-format
 *
 * Enforce consistent formatting for TypeScript enums:
 * - Enum name must be PascalCase and end with "Enum" suffix
 * - Member names must be UPPER_CASE (e.g., DELETE, GET, POST)
 * - No empty lines between members
 * - Each member must end with comma (,) not semicolon (;)
 *
 * ✓ Good:
 *   export enum HttpMethodEnum {
 *       DELETE = "delete",
 *       GET = "get",
 *       POST = "post",
 *   }
 *
 * ✗ Bad:
 *   export enum HttpMethod {           // Missing "Enum" suffix
 *       delete = "delete";             // lowercase and semicolon
 *
 *       Get = "get";                   // PascalCase, empty line, semicolon
 *   }
 */
/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Object Destructure
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that when a function parameter (object) is accessed via dot notation
 *   in the function body, it should be destructured at the top of the function.
 *   Also enforces that non-component functions should NOT destructure params in
 *   the function signature - use simple typed params instead.
 *
 * ✓ Good (Non-component function):
 *   const createHandler = async (data: FormInterface) => {
 *       const { firstName, lastName, email } = data;
 *       console.log(firstName, lastName);
 *   }
 *
 * ✗ Bad (Non-component function):
 *   const createHandler = async (data: FormInterface) => {
 *       console.log(data.firstName);  // Should destructure
 *   }
 *
 * ✗ Bad (Non-component function):
 *   const createHandler = async ({ firstName }: FormInterface) => {  // No destructure in signature
 *       ...
 *   }
 */
const functionObjectDestructure = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Track imports from module paths that should use dot notation, not destructure
        // This improves searchability: api.loginHandler is easier to find than loginHandler
        const moduleImports = new Set();

        // Folders that contain modules which should be accessed via dot notation
        const modulePathPatterns = [
            "api",
            "apis",
            "config",
            "configs",
            "constants",
            "data",
            "helpers",
            "lib",
            "routes",
            "services",
            "utils",
            "utilities",
        ];

        const isModuleImportPath = (importPath) => {
            // Match paths like @/services, @/constants, ./data, ../config, etc.
            return modulePathPatterns.some((pattern) => importPath === `@/${pattern}`
                    || importPath.endsWith(`/${pattern}`)
                    || importPath.includes(`/${pattern}/`)
                    || new RegExp(`^\\.?\\.?/${pattern}$`).test(importPath));
        };

        const checkImportHandler = (node) => {
            if (!node.source || !node.source.value) return;

            const importPath = node.source.value;

            if (isModuleImportPath(importPath)) {
                // Track all imported specifiers from module paths
                node.specifiers.forEach((spec) => {
                    if (spec.type === "ImportSpecifier" && spec.local && spec.local.name) {
                        moduleImports.add(spec.local.name);
                    } else if (spec.type === "ImportDefaultSpecifier" && spec.local && spec.local.name) {
                        moduleImports.add(spec.local.name);
                    }
                });
            }
        };

        // Find all references to a variable name in a scope (with parent tracking)
        const findAllReferencesHandler = (scope, varName, declNode) => {
            const references = [];

            const visitNode = (n, parent) => {
                if (!n || typeof n !== "object") return;

                // Skip the declaration itself
                if (n === declNode) return;

                // Found a reference
                if (n.type === "Identifier" && n.name === varName) {
                    // Make sure it's not a property key or part of a member expression property
                    const isMemberProp = parent && parent.type === "MemberExpression" && parent.property === n && !parent.computed;
                    const isObjectKey = parent && parent.type === "Property" && parent.key === n && !parent.computed;
                    const isShorthandValue = parent && parent.type === "Property" && parent.shorthand && parent.value === n;

                    // Include shorthand properties as references (they use the variable)
                    if (!isMemberProp && !isObjectKey) {
                        references.push(n);
                    }
                }

                for (const key of Object.keys(n)) {
                    if (key === "parent" || key === "range" || key === "loc") continue;

                    const child = n[key];

                    if (Array.isArray(child)) {
                        child.forEach((c) => visitNode(c, n));
                    } else if (child && typeof child === "object" && child.type) {
                        visitNode(child, n);
                    }
                }
            };

            visitNode(scope, null);

            return references;
        };

        // Check for destructuring of module imports (not allowed)
        const checkVariableDeclarationHandler = (node) => {
            for (const decl of node.declarations) {
                // Check for ObjectPattern destructuring
                if (decl.id.type === "ObjectPattern" && decl.init) {
                    let sourceVarName = null;

                    // Direct destructuring: const { x } = moduleImport
                    if (decl.init.type === "Identifier") {
                        sourceVarName = decl.init.name;
                    }

                    // Nested destructuring: const { x } = moduleImport.nested
                    if (decl.init.type === "MemberExpression") {
                        let obj = decl.init;

                        while (obj.type === "MemberExpression") {
                            obj = obj.object;
                        }

                        if (obj.type === "Identifier") {
                            sourceVarName = obj.name;
                        }
                    }

                    if (sourceVarName && moduleImports.has(sourceVarName)) {
                        // Get destructured properties with their local names
                        const destructuredProps = decl.id.properties
                            .filter((p) => p.type === "Property" && p.key && p.key.name)
                            .map((p) => ({
                                key: p.key.name,
                                local: p.value && p.value.type === "Identifier" ? p.value.name : p.key.name,
                            }));

                        const sourceText = sourceCode.getText(decl.init);

                        // Find the containing function/program to search for references
                        let scope = node.parent;

                        while (scope && scope.type !== "BlockStatement" && scope.type !== "Program") {
                            scope = scope.parent;
                        }

                        context.report({
                            fix: scope
                                ? (fixer) => {
                                    const fixes = [];

                                    // Replace all references with dot notation
                                    destructuredProps.forEach(({ key, local }) => {
                                        const refs = findAllReferencesHandler(scope, local, decl);

                                        refs.forEach((ref) => {
                                            fixes.push(fixer.replaceText(ref, `${sourceText}.${key}`));
                                        });
                                    });

                                    // Remove the entire declaration statement
                                    // If it's the only declaration in the statement, remove the whole statement
                                    if (node.declarations.length === 1) {
                                        // Find the full statement including newline
                                        const tokenBefore = sourceCode.getTokenBefore(node);
                                        const tokenAfter = sourceCode.getTokenAfter(node);
                                        let start = node.range[0];
                                        let end = node.range[1];

                                        // Include leading whitespace/newline
                                        if (tokenBefore) {
                                            const textBetween = sourceCode.text.slice(tokenBefore.range[1], node.range[0]);
                                            const newlineIndex = textBetween.lastIndexOf("\n");

                                            if (newlineIndex !== -1) {
                                                start = tokenBefore.range[1] + newlineIndex;
                                            }
                                        }

                                        // Include trailing newline
                                        if (tokenAfter) {
                                            const textBetween = sourceCode.text.slice(node.range[1], tokenAfter.range[0]);
                                            const newlineIndex = textBetween.indexOf("\n");

                                            if (newlineIndex !== -1) {
                                                end = node.range[1] + newlineIndex + 1;
                                            }
                                        }

                                        fixes.push(fixer.removeRange([start, end]));
                                    } else {
                                        // Remove just this declarator
                                        fixes.push(fixer.remove(decl));
                                    }

                                    return fixes;
                                }
                                : undefined,
                            message: `Do not destructure module imports. Use dot notation for searchability: "${sourceText}.${destructuredProps[0].key}" instead of destructuring`,
                            node: decl.id,
                        });
                    }
                }
            }
        };

        const containsJsxHandler = (node) => {
            if (!node) return false;

            if (node.type === "JSXElement" || node.type === "JSXFragment") return true;

            if (node.type === "BlockStatement") {
                for (const statement of node.body) {
                    if (statement.type === "ReturnStatement" && statement.argument) {
                        if (containsJsxHandler(statement.argument)) return true;
                    }
                }
            }

            if (node.type === "ConditionalExpression") {
                return containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);
            }

            if (node.type === "LogicalExpression") {
                return containsJsxHandler(node.left) || containsJsxHandler(node.right);
            }

            if (node.type === "ParenthesizedExpression") {
                return containsJsxHandler(node.expression);
            }

            return false;
        };

        const isReactComponentHandler = (node) => {
            let componentName = null;

            if (node.parent) {
                if (node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    componentName = node.parent.id.name;
                } else if (node.id && node.id.type === "Identifier") {
                    componentName = node.id.name;
                }
            }

            if (componentName && /^[A-Z]/.test(componentName)) {
                const body = node.body;

                return containsJsxHandler(body);
            }

            return false;
        };

        // Common array/object methods that should NOT trigger destructuring
        const SKIP_METHODS = new Set([
            "map", "filter", "reduce", "forEach", "find", "findIndex", "some", "every",
            "flat", "flatMap", "sort", "reverse", "slice", "splice", "concat", "join",
            "includes", "indexOf", "lastIndexOf", "push", "pop", "shift", "unshift",
            "keys", "values", "entries", "toString", "toLocaleString", "length",
        ]);

        // Find all member expressions accessing a specific object in a function body
        const findObjectAccessesHandler = (body, paramName) => {
            const accesses = [];
            const methodCallees = new Set();

            // First pass: collect all MemberExpressions that are method callees
            const collectMethodCallees = (node) => {
                if (!node || typeof node !== "object") return;

                // If this is a CallExpression and callee is a MemberExpression, mark it
                if (node.type === "CallExpression" && node.callee && node.callee.type === "MemberExpression") {
                    methodCallees.add(node.callee);
                }

                for (const key of Object.keys(node)) {
                    if (key === "parent") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach(collectMethodCallees);
                    } else if (child && typeof child === "object" && child.type) {
                        collectMethodCallees(child);
                    }
                }
            };

            collectMethodCallees(body);

            const visitNode = (node) => {
                if (!node || typeof node !== "object") return;

                // Check for member expression like param.prop
                if (node.type === "MemberExpression" && !node.computed) {
                    if (node.object.type === "Identifier" && node.object.name === paramName) {
                        const propName = node.property.name;

                        // Skip if this is a method call (callee of CallExpression)
                        if (methodCallees.has(node)) return;

                        // Skip known array/object methods (as backup)
                        if (!SKIP_METHODS.has(propName)) {
                            accesses.push({
                                node,
                                property: propName,
                            });
                        }
                    }
                }

                // Recurse into child nodes
                for (const key of Object.keys(node)) {
                    if (key === "parent") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach(visitNode);
                    } else if (child && typeof child === "object" && child.type) {
                        visitNode(child);
                    }
                }
            };

            visitNode(body);

            return accesses;
        };

        // Check if block body only contains destructuring/assignments + return (no other logic)
        const isDestructureAndReturnOnlyHandler = (blockBody, paramName) => {
            if (blockBody.type !== "BlockStatement") return null;

            const statements = blockBody.body;

            if (statements.length === 0) return null;

            // Last statement must be return
            const lastStatement = statements[statements.length - 1];

            if (lastStatement.type !== "ReturnStatement" || !lastStatement.argument) return null;

            // Track destructured variables and their sources
            const destructuredProps = [];
            const knownVars = new Set([paramName]);

            for (let i = 0; i < statements.length - 1; i += 1) {
                const stmt = statements[i];

                // Must be variable declaration
                if (stmt.type !== "VariableDeclaration") return null;

                for (const decl of stmt.declarations) {
                    if (!decl.init) return null;

                    // Case 1: ObjectPattern destructuring - const { row } = data
                    if (decl.id.type === "ObjectPattern") {
                        // Must be destructuring from known variable
                        if (decl.init.type !== "Identifier" || !knownVars.has(decl.init.name)) {
                            return null;
                        }

                        for (const prop of decl.id.properties) {
                            if (prop.type === "Property" && prop.key.type === "Identifier") {
                                // Only allow simple destructuring, not nested patterns
                                if (prop.value.type === "ObjectPattern" || prop.value.type === "ArrayPattern") {
                                    return null;
                                }

                                const varName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                knownVars.add(varName);

                                if (decl.init.name === paramName) {
                                    destructuredProps.push(prop.key.name);
                                }
                            }
                        }
                    } else if (decl.id.type === "Identifier") {
                        // Case 2: Simple assignment from member expression - const account = row.original
                        if (decl.init.type === "MemberExpression" && !decl.init.computed) {
                            if (decl.init.object.type === "Identifier" && knownVars.has(decl.init.object.name)) {
                                // This is just extracting a property, still "destructuring-like"
                                knownVars.add(decl.id.name);
                            } else {
                                return null;
                            }
                        } else {
                            // Some other assignment - this is logic
                            return null;
                        }
                    } else {
                        return null;
                    }
                }
            }

            if (destructuredProps.length === 0) return null;

            return { destructuredProps, returnStatement: lastStatement };
        };

        // Check if block body has actual logic (not just destructuring + return)
        const hasActualLogicHandler = (blockBody, paramName) => {
            if (blockBody.type !== "BlockStatement") return false;

            const statements = blockBody.body;
            const knownVars = new Set([paramName]);

            for (const stmt of statements) {
                // Return statement at end is not logic
                if (stmt.type === "ReturnStatement") continue;

                // Variable declarations
                if (stmt.type === "VariableDeclaration") {
                    for (const decl of stmt.declarations) {
                        if (!decl.init) return true; // No init = logic

                        // ObjectPattern destructuring is not logic
                        if (decl.id.type === "ObjectPattern" && decl.init.type === "Identifier" && knownVars.has(decl.init.name)) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.value.type === "Identifier") {
                                    knownVars.add(prop.value.name);
                                } else if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    knownVars.add(prop.key.name);
                                }
                            }

                            continue;
                        }

                        // Simple assignment from known var's property is not logic
                        if (decl.id.type === "Identifier" && decl.init.type === "MemberExpression") {
                            if (decl.init.object.type === "Identifier" && knownVars.has(decl.init.object.name)) {
                                knownVars.add(decl.id.name);

                                continue;
                            }
                        }

                        // Anything else is logic
                        return true;
                    }
                } else {
                    // Any other statement type is logic
                    return true;
                }
            }

            return false;
        };

        // Find all member expressions accessing a destructured variable
        const findNestedAccessesHandler = (body, destructuredVarName, originalParamName) => {
            const accesses = [];
            const methodCallees = new Set();

            // First pass: collect all MemberExpressions that are method callees
            const collectMethodCallees = (node) => {
                if (!node || typeof node !== "object") return;

                if (node.type === "CallExpression" && node.callee && node.callee.type === "MemberExpression") {
                    methodCallees.add(node.callee);
                }

                for (const key of Object.keys(node)) {
                    if (key === "parent") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach(collectMethodCallees);
                    } else if (child && typeof child === "object" && child.type) {
                        collectMethodCallees(child);
                    }
                }
            };

            collectMethodCallees(body);

            const visitNode = (n) => {
                if (!n || typeof n !== "object") return;

                // Check for member expression like destructuredVar.prop
                if (n.type === "MemberExpression" && !n.computed) {
                    if (n.object.type === "Identifier" && n.object.name === destructuredVarName) {
                        const propName = n.property.name;

                        // Skip if this is a method call (callee of CallExpression)
                        if (methodCallees.has(n)) return;

                        if (!SKIP_METHODS.has(propName)) {
                            accesses.push({
                                node: n,
                                property: propName,
                            });
                        }
                    }
                }

                for (const key of Object.keys(n)) {
                    if (key === "parent") continue;

                    const child = n[key];

                    if (Array.isArray(child)) {
                        child.forEach(visitNode);
                    } else if (child && typeof child === "object" && child.type) {
                        visitNode(child);
                    }
                }
            };

            visitNode(body);

            return accesses;
        };

        // Get all destructured variables from block body
        const getDestructuredVariablesHandler = (blockBody, paramName) => {
            const destructured = new Map(); // varName -> { fromParam: boolean, fromVar: string|null, properties: string[] }

            if (blockBody.type !== "BlockStatement") return destructured;

            for (const stmt of blockBody.body) {
                if (stmt.type !== "VariableDeclaration") continue;

                for (const decl of stmt.declarations) {
                    if (decl.id.type === "ObjectPattern" && decl.init) {
                        // Direct destructuring from param: const { row } = data
                        if (decl.init.type === "Identifier" && decl.init.name === paramName) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    const varName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                    destructured.set(varName, {
                                        fromParam: true,
                                        fromVar: null,
                                        originalProp: prop.key.name,
                                    });
                                }
                            }
                        }

                        // Destructuring from previously destructured variable
                        // const { original } = row (where row was destructured from param)
                        if (decl.init.type === "Identifier" && destructured.has(decl.init.name)) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    const varName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                    destructured.set(varName, {
                                        fromParam: false,
                                        fromVar: decl.init.name,
                                        originalProp: prop.key.name,
                                    });
                                }
                            }
                        }
                    }

                    // Simple assignment from destructured var: const account = row.original
                    if (decl.id.type === "Identifier" && decl.init && decl.init.type === "MemberExpression") {
                        const memberExpr = decl.init;

                        if (memberExpr.object.type === "Identifier" && destructured.has(memberExpr.object.name)) {
                            if (!memberExpr.computed && memberExpr.property.type === "Identifier") {
                                destructured.set(decl.id.name, {
                                    fromParam: false,
                                    fromVar: memberExpr.object.name,
                                    originalProp: memberExpr.property.name,
                                });
                            }
                        }
                    }
                }
            }

            return destructured;
        };

        // Find the destructuring statement and property node for a variable
        const findDestructuringStatementHandler = (blockBody, varName, paramName) => {
            if (blockBody.type !== "BlockStatement") return null;

            for (const stmt of blockBody.body) {
                if (stmt.type !== "VariableDeclaration") continue;

                for (const decl of stmt.declarations) {
                    if (decl.id.type === "ObjectPattern" && decl.init) {
                        // Check if this destructuring creates the variable we're looking for
                        if (decl.init.type === "Identifier" && decl.init.name === paramName) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    const createdVarName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                    if (createdVarName === varName) {
                                        return {
                                            declarator: decl,
                                            property: prop,
                                            statement: stmt,
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return null;
        };

        const checkFunctionHandler = (node) => {
            const isComponent = isReactComponentHandler(node);
            const params = node.params;
            const body = node.body;

            if (params.length === 0 || !body) return;

            // Arrow functions with expression body (direct return, no block)
            // For these, destructuring in params IS allowed/encouraged since there's no body
            if (node.type === "ArrowFunctionExpression" && body.type !== "BlockStatement") {
                // Check if any Identifier param is accessed via dot notation
                // If so, suggest destructuring in params
                params.forEach((param) => {
                    if (param.type !== "Identifier") return;

                    const paramName = param.name;

                    // Check if param is used in a spread operation - skip because destructuring would break it
                    let usedInSpread = false;
                    const checkSpread = (n, parent) => {
                        if (!n || typeof n !== "object") return;
                        if (n.type === "SpreadElement" && n.argument && n.argument.type === "Identifier" && n.argument.name === paramName) {
                            usedInSpread = true;

                            return;
                        }
                        for (const key of Object.keys(n)) {
                            if (key === "parent") continue;
                            const child = n[key];
                            if (Array.isArray(child)) child.forEach((c) => checkSpread(c, n));
                            else if (child && typeof child === "object" && child.type) checkSpread(child, n);
                        }
                    };
                    checkSpread(body, null);

                    if (usedInSpread) return;

                    const accesses = findObjectAccessesHandler(body, paramName);

                    if (accesses.length > 0) {
                        const accessedProps = [...new Set(accesses.map((a) => a.property))];

                        // Count all actual references to paramName (excluding object property keys)
                        const allRefs = [];
                        const countRefs = (n, parent) => {
                            if (!n || typeof n !== "object") return;
                            if (n.type === "Identifier" && n.name === paramName) {
                                // Exclude object property keys (non-computed)
                                const isPropertyKey = parent && parent.type === "Property" && parent.key === n && !parent.computed;

                                if (!isPropertyKey) {
                                    allRefs.push(n);
                                }
                            }
                            for (const key of Object.keys(n)) {
                                if (key === "parent") continue;
                                const child = n[key];
                                if (Array.isArray(child)) child.forEach((c) => countRefs(c, n));
                                else if (child && typeof child === "object" && child.type) countRefs(child, n);
                            }
                        };
                        countRefs(body, null);

                        // Only auto-fix if all references are covered by the detected dot notation accesses
                        const canAutoFix = allRefs.length === accesses.length;

                        context.report({
                            fix: canAutoFix
                                ? (fixer) => {
                                    const fixes = [];

                                    // Replace param with destructured pattern
                                    fixes.push(fixer.replaceText(param, `{ ${accessedProps.join(", ")} }`));

                                    // Replace all param.prop with just prop
                                    accesses.forEach((access) => {
                                        fixes.push(fixer.replaceText(access.node, access.property));
                                    });

                                    return fixes;
                                }
                                : undefined,
                            message: `Parameter "${paramName}" is accessed via dot notation. For arrow functions with direct returns, destructure in the parameter: "({ ${accessedProps.join(", ")} })"`,
                            node: accesses[0].node,
                        });
                    }
                });

                return;
            }

            // For non-components with block body: check if first param is destructured in signature (not allowed)
            if (!isComponent) {
                const firstParam = params[0];

                if (firstParam.type === "ObjectPattern") {
                    context.report({
                        message: "Non-component functions should not destructure parameters in the signature. Use a typed parameter (e.g., \"data: InterfaceType\") and destructure in the function body instead.",
                        node: firstParam,
                    });

                    return;
                }
            }

            // Check for block body that only contains destructuring + return (can be converted to expression)
            if (node.type === "ArrowFunctionExpression" && body.type === "BlockStatement") {
                const firstParam = params[0];

                if (firstParam && firstParam.type === "Identifier") {
                    const result = isDestructureAndReturnOnlyHandler(body, firstParam.name);

                    if (result) {
                        context.report({
                            message: `This function only destructures and returns. Convert to expression body with destructured param: "({ ${result.destructuredProps.join(", ")} }) => ..."`,
                            node: body,
                        });

                        return;
                    }
                }
            }

            // Check for nested property access from destructured variables
            // e.g., const { row } = data; then row.original should be nested destructured
            // ONLY when there's actual logic in the function (not just destructuring + return)
            if (body.type === "BlockStatement") {
                const firstParam = params[0];

                if (firstParam && firstParam.type === "Identifier") {
                    // Only enforce nested destructuring when there's actual logic
                    if (hasActualLogicHandler(body, firstParam.name)) {
                        const destructuredVars = getDestructuredVariablesHandler(body, firstParam.name);

                        for (const [varName, info] of destructuredVars) {
                            const accesses = findNestedAccessesHandler(body, varName, firstParam.name);

                            if (accesses.length > 0) {
                                const accessedProps = [...new Set(accesses.map((a) => a.property))];

                                // Find the original destructuring statement
                                const destructInfo = findDestructuringStatementHandler(body, varName, firstParam.name);

                                context.report({
                                    fix: destructInfo
                                        ? (fixer) => {
                                            const fixes = [];

                                            // Modify the destructuring property to use nested destructuring
                                            // e.g., { target } becomes { target: { value } }
                                            const { property } = destructInfo;
                                            const nestedDestructure = `${info.originalProp}: { ${accessedProps.join(", ")} }`;

                                            fixes.push(fixer.replaceText(property, nestedDestructure));

                                            // Replace all varName.prop accesses with just prop
                                            accesses.forEach((access) => {
                                                fixes.push(fixer.replaceText(access.node, access.property));
                                            });

                                            return fixes;
                                        }
                                        : undefined,
                                    message: `Variable "${varName}" is accessed via dot notation (${accessedProps.join(", ")}). Use nested destructuring instead: "const { ${info.originalProp}: { ${accessedProps.join(", ")} } } = ..."`,
                                    node: accesses[0].node,
                                });
                            }
                        }
                    }
                }
            }

            // For all functions with block body: check if any identifier param is accessed via dot notation
            params.forEach((param) => {
                if (param.type !== "Identifier") return;

                const paramName = param.name;
                const accesses = findObjectAccessesHandler(body, paramName);

                if (accesses.length > 0) {
                    const accessedProps = [...new Set(accesses.map((a) => a.property))];

                    context.report({
                        fix: (fixer) => {
                            const fixes = [];

                            // Get the first statement in the block body to insert before it
                            const firstStatement = body.body[0];

                            if (firstStatement) {
                                // Get indentation from the first statement
                                const firstStatementLine = sourceCode.lines[firstStatement.loc.start.line - 1];
                                const indent = firstStatementLine.match(/^\s*/)[0];

                                // Create the destructuring statement
                                const destructureStatement = `const { ${accessedProps.join(", ")} } = ${paramName};\n${indent}`;

                                // Insert at the beginning of the first statement
                                fixes.push(fixer.insertTextBefore(firstStatement, destructureStatement));
                            }

                            // Replace all param.prop accesses with just prop
                            accesses.forEach((access) => {
                                fixes.push(fixer.replaceText(access.node, access.property));
                            });

                            return fixes;
                        },
                        message: `Parameter "${paramName}" is accessed via dot notation. Destructure it at the top of the function body: "const { ${accessedProps.join(", ")} } = ${paramName};"`,
                        node: accesses[0].node,
                    });
                }
            });

            // For components: check if destructured props from signature are accessed via dot notation
            // e.g., ({ accountsData }) => { accountsData.items } should destructure accountsData at top
            if (isComponent && body.type === "BlockStatement") {
                const firstParam = params[0];

                if (firstParam && firstParam.type === "ObjectPattern") {
                    // Get all destructured prop names from the signature
                    const destructuredProps = firstParam.properties
                        .filter((prop) => prop.type === "Property" && prop.key.type === "Identifier")
                        .map((prop) => prop.value.type === "Identifier" ? prop.value.name : prop.key.name);

                    // Check each destructured prop for dot notation access in body
                    destructuredProps.forEach((propName) => {
                        const accesses = findObjectAccessesHandler(body, propName);

                        if (accesses.length > 0) {
                            const accessedProps = [...new Set(accesses.map((a) => a.property))];

                            context.report({
                                fix: (fixer) => {
                                    const fixes = [];

                                    // Get the first statement in the block body to insert before it
                                    const firstStatement = body.body[0];

                                    if (firstStatement) {
                                        // Get indentation from the first statement
                                        const firstStatementLine = sourceCode.lines[firstStatement.loc.start.line - 1];
                                        const indent = firstStatementLine.match(/^\s*/)[0];

                                        // Create the destructuring statement
                                        const destructureStatement = `const { ${accessedProps.join(", ")} } = ${propName};\n\n${indent}`;

                                        // Insert at the beginning of the first statement
                                        fixes.push(fixer.insertTextBefore(firstStatement, destructureStatement));
                                    }

                                    // Replace all prop.subprop accesses with just subprop
                                    accesses.forEach((access) => {
                                        fixes.push(fixer.replaceText(access.node, access.property));
                                    });

                                    return fixes;
                                },
                                message: `Prop "${propName}" is accessed via dot notation. Destructure it at the top of the component: "const { ${accessedProps.join(", ")} } = ${propName};"`,
                                node: accesses[0].node,
                            });
                        }
                    });
                }
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            ImportDeclaration: checkImportHandler,
            VariableDeclaration: checkVariableDeclarationHandler,
        };
    },
    meta: {
        docs: { description: "Enforce object parameters to be destructured in function body, not accessed via dot notation. Also prevent destructuring of data imports." },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Component Props Destructure
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that React component props must be destructured
 *   in the function parameter, not received as a single 'props' object.
 *
 * ✓ Good:
 *   export const Button = ({ label, onClick }) => { ... }
 *   export const Card = ({ title, children, className = "" }) => { ... }
 *   export function Header({ title }: { title: string }) { ... }
 *
 * ✗ Bad:
 *   export const Button = (props) => { ... }  // Should destructure props
 *   export function Header(props) { ... }      // Should destructure props
 */
const componentPropsDestructure = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const containsJsxHandler = (node) => {
            if (!node) return false;

            if (node.type === "JSXElement" || node.type === "JSXFragment") return true;

            if (node.type === "BlockStatement") {
                for (const statement of node.body) {
                    if (statement.type === "ReturnStatement" && statement.argument) {
                        if (containsJsxHandler(statement.argument)) return true;
                    }
                }
            }

            if (node.type === "ConditionalExpression") {
                return containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);
            }

            if (node.type === "LogicalExpression") {
                return containsJsxHandler(node.left) || containsJsxHandler(node.right);
            }

            if (node.type === "ParenthesizedExpression") {
                return containsJsxHandler(node.expression);
            }

            return false;
        };

        const isReactComponentHandler = (node) => {
            // Check if it's a named export or variable declarator with PascalCase name
            let componentName = null;

            if (node.parent) {
                if (node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    componentName = node.parent.id.name;
                } else if (node.id && node.id.type === "Identifier") {
                    componentName = node.id.name;
                }
            }

            // Check if name starts with uppercase (PascalCase convention for React components)
            if (componentName && /^[A-Z]/.test(componentName)) {
                // Check if function returns JSX
                const body = node.body;

                return containsJsxHandler(body);
            }

            return false;
        };

        // Find all property accesses on a parameter in the function body
        const findPropAccessesHandler = (body, paramName) => {
            const accesses = [];

            const visitNode = (n) => {
                if (!n || typeof n !== "object") return;

                // Check for member expression like props.name
                if (n.type === "MemberExpression" && !n.computed) {
                    if (n.object.type === "Identifier" && n.object.name === paramName) {
                        const propName = n.property.name;

                        accesses.push({
                            node: n,
                            property: propName,
                        });
                    }
                }

                // Recurse into child nodes
                for (const key of Object.keys(n)) {
                    if (key === "parent") continue;

                    const child = n[key];

                    if (Array.isArray(child)) {
                        child.forEach(visitNode);
                    } else if (child && typeof child === "object" && child.type) {
                        visitNode(child);
                    }
                }
            };

            visitNode(body);

            return accesses;
        };

        // Find body destructuring like: const { name } = data; or const { name, age } = data;
        const findBodyDestructuringHandler = (body, paramName) => {
            const results = [];

            if (body.type !== "BlockStatement") return results;

            for (const statement of body.body) {
                if (statement.type === "VariableDeclaration") {
                    for (const declarator of statement.declarations) {
                        // Check if it's destructuring from the param: const { x } = paramName
                        if (
                            declarator.id.type === "ObjectPattern" &&
                            declarator.init &&
                            declarator.init.type === "Identifier" &&
                            declarator.init.name === paramName
                        ) {
                            const props = [];

                            for (const prop of declarator.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    // Handle both { name } and { name: alias }
                                    const keyName = prop.key.name;
                                    const valueName = prop.value.type === "Identifier" ? prop.value.name : null;
                                    const hasDefault = prop.value.type === "AssignmentPattern";
                                    let defaultValue = null;

                                    if (hasDefault && prop.value.right) {
                                        defaultValue = sourceCode.getText(prop.value.right);
                                    }

                                    props.push({
                                        default: defaultValue,
                                        hasAlias: keyName !== valueName && !hasDefault,
                                        key: keyName,
                                        value: hasDefault ? prop.value.left.name : valueName,
                                    });
                                } else if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
                                    props.push({
                                        isRest: true,
                                        key: prop.argument.name,
                                        value: prop.argument.name,
                                    });
                                }
                            }

                            results.push({
                                declarator,
                                props,
                                statement,
                                // Track if this is the only declarator in the statement
                                statementHasOnlyThisDeclarator: statement.declarations.length === 1,
                            });
                        }
                    }
                }
            }

            return results;
        };

        const checkComponentPropsHandler = (node) => {
            if (!isReactComponentHandler(node)) return;

            const params = node.params;

            // Component with no params is fine
            if (params.length === 0) return;

            // Check if first param is not destructured (is an Identifier instead of ObjectPattern)
            const firstParam = params[0];

            if (firstParam.type === "Identifier") {
                const paramName = firstParam.name;

                // Find dot notation accesses: props.name
                const accesses = findPropAccessesHandler(node.body, paramName);

                // Find body destructuring: const { name } = props
                const bodyDestructures = findBodyDestructuringHandler(node.body, paramName);

                // Collect all accessed props from dot notation
                const dotNotationProps = [...new Set(accesses.map((a) => a.property))];

                // Collect all props from body destructuring
                const bodyDestructuredProps = [];

                bodyDestructures.forEach((bd) => {
                    bd.props.forEach((p) => {
                        bodyDestructuredProps.push(p);
                    });
                });

                // Check if param is used anywhere that we can't handle
                const allRefs = [];
                const countRefs = (n, skipNodes = []) => {
                    if (!n || typeof n !== "object") return;

                    // Skip nodes we're already accounting for
                    if (skipNodes.includes(n)) return;

                    if (n.type === "Identifier" && n.name === paramName) allRefs.push(n);

                    for (const key of Object.keys(n)) {
                        if (key === "parent") continue;

                        const child = n[key];

                        if (Array.isArray(child)) child.forEach((c) => countRefs(c, skipNodes));
                        else if (child && typeof child === "object" && child.type) countRefs(child, skipNodes);
                    }
                };

                countRefs(node.body);

                // Count expected refs: dot notation accesses + body destructuring init nodes
                const expectedRefCount = accesses.length + bodyDestructures.length;

                // Can auto-fix if:
                // 1. We have either dot notation props OR body destructured props
                // 2. All references to the param are accounted for
                const hasSomeProps = dotNotationProps.length > 0 || bodyDestructuredProps.length > 0;
                const canAutoFix = hasSomeProps && allRefs.length === expectedRefCount;

                context.report({
                    fix: canAutoFix
                        ? (fixer) => {
                            const fixes = [];

                            // Build the destructured props list for the parameter
                            const allProps = [];

                            // Add dot notation props (simple names)
                            dotNotationProps.forEach((p) => {
                                if (!allProps.some((ap) => ap.key === p)) {
                                    allProps.push({ key: p, simple: true });
                                }
                            });

                            // Add body destructured props (may have aliases, defaults, rest)
                            bodyDestructuredProps.forEach((p) => {
                                // Don't duplicate if already in dot notation
                                if (!allProps.some((ap) => ap.key === p.key)) {
                                    allProps.push(p);
                                }
                            });

                            // Build the destructured pattern string
                            const propStrings = allProps.map((p) => {
                                if (p.isRest) return `...${p.key}`;

                                if (p.simple) return p.key;

                                if (p.default) return `${p.key} = ${p.default}`;

                                if (p.hasAlias) return `${p.key}: ${p.value}`;

                                return p.key;
                            });
                            const destructuredPattern = `{ ${propStrings.join(", ")} }`;
                            let replacement = destructuredPattern;

                            // Preserve TypeScript type annotation if present
                            if (firstParam.typeAnnotation) {
                                const typeText = sourceCode.getText(firstParam.typeAnnotation);

                                replacement = `${destructuredPattern}${typeText}`;
                            }

                            // Replace param with destructured pattern
                            fixes.push(fixer.replaceText(firstParam, replacement));

                            // Replace all props.x with just x
                            accesses.forEach((access) => {
                                fixes.push(fixer.replaceText(access.node, access.property));
                            });

                            // Remove body destructuring statements
                            bodyDestructures.forEach((bd) => {
                                if (bd.statementHasOnlyThisDeclarator) {
                                    // Remove the entire statement including newline
                                    const statementStart = bd.statement.range[0];
                                    let statementEnd = bd.statement.range[1];

                                    // Try to also remove trailing newline/whitespace
                                    const textAfter = sourceCode.getText().slice(statementEnd, statementEnd + 2);

                                    if (textAfter.startsWith("\n")) statementEnd += 1;
                                    else if (textAfter.startsWith("\r\n")) statementEnd += 2;

                                    fixes.push(fixer.removeRange([statementStart, statementEnd]));
                                } else {
                                    // Only remove this declarator from a multi-declarator statement
                                    // This is more complex - for now just remove the declarator text
                                    fixes.push(fixer.remove(bd.declarator));
                                }
                            });

                            return fixes;
                        }
                        : undefined,
                    message: `Component props should be destructured. Use "({ ...props })" instead of "${firstParam.name}"`,
                    node: firstParam,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkComponentPropsHandler,
            FunctionDeclaration: checkComponentPropsHandler,
            FunctionExpression: checkComponentPropsHandler,
        };
    },
    meta: {
        docs: { description: "Enforce that React component props must be destructured in the function parameter" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Component Props Inline Type
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that React component props must use inline type annotation,
 *   not a reference to an interface or type alias. Also enforces:
 *   - Spacing: "}: {" with one space between colon and opening brace
 *   - Each prop type on its own line if more than one prop
 *   - Trailing commas (not semicolons) for each prop type
 *   - If single prop type, can be on single line
 *
 * ✓ Good:
 *   export const Button = ({ label }: { label: string }) => { ... }
 *   export const Card = ({
 *       className = "",
 *       title,
 *   }: {
 *       className?: string,
 *       title: string,
 *   }) => { ... }
 *
 * ✗ Bad:
 *   export const Button = ({ label }: ButtonPropsInterface) => { ... }
 *   export const Card = ({ title }:{ title: string }) => { ... }  // Missing space
 *   export const Card = ({ a, b }: { a: string; b: string }) => { ... }  // Semicolons
 */
const componentPropsInlineType = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const containsJsxHandler = (node) => {
            if (!node) return false;

            if (node.type === "JSXElement" || node.type === "JSXFragment") return true;

            if (node.type === "BlockStatement") {
                for (const statement of node.body) {
                    if (statement.type === "ReturnStatement" && statement.argument) {
                        if (containsJsxHandler(statement.argument)) return true;
                    }
                }
            }

            if (node.type === "ConditionalExpression") {
                return containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);
            }

            if (node.type === "LogicalExpression") {
                return containsJsxHandler(node.left) || containsJsxHandler(node.right);
            }

            if (node.type === "ParenthesizedExpression") {
                return containsJsxHandler(node.expression);
            }

            return false;
        };

        const isReactComponentHandler = (node) => {
            let componentName = null;

            if (node.parent) {
                if (node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    componentName = node.parent.id.name;
                } else if (node.id && node.id.type === "Identifier") {
                    componentName = node.id.name;
                }
            }

            if (componentName && /^[A-Z]/.test(componentName)) {
                const body = node.body;

                return containsJsxHandler(body);
            }

            return false;
        };

        const checkComponentPropsTypeHandler = (node) => {
            const params = node.params;

            if (params.length === 0) return;

            const isComponent = isReactComponentHandler(node);

            // For non-components: check ALL parameters for inline object types (not allowed)
            if (!isComponent) {
                params.forEach((param) => {
                    // Check Identifier params with type annotations (e.g., data: { email: string })
                    if (param.type === "Identifier" && param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const typeAnnotation = param.typeAnnotation.typeAnnotation;

                        if (typeAnnotation.type === "TSTypeLiteral") {
                            context.report({
                                message: `Parameter "${param.name}" must use a type reference (interface or type alias), not an inline object type. Define the type separately.`,
                                node: typeAnnotation,
                            });
                        }
                    }
                });
            }

            const firstParam = params[0];

            // Only check destructured params (ObjectPattern) for the rest of the checks
            if (firstParam.type !== "ObjectPattern") return;

            // Check if there's a type annotation
            if (!firstParam.typeAnnotation || !firstParam.typeAnnotation.typeAnnotation) {
                // For React components in TypeScript files: destructured props MUST have type annotation
                const filename = context.getFilename ? context.getFilename() : context.filename || "";
                const isTypeScriptFile = filename.endsWith(".ts") || filename.endsWith(".tsx");

                if (isTypeScriptFile && isComponent) {
                    context.report({
                        message: "Component props must have a type annotation. Add inline type: \"({ prop }: { prop: Type })\"",
                        node: firstParam,
                    });
                }

                return;
            }

            const typeAnnotation = firstParam.typeAnnotation.typeAnnotation;

            // Check spacing for ALL destructured params with type annotations
            // This applies to both React components and regular functions: }: TypeName
            const colonToken = sourceCode.getFirstToken(firstParam.typeAnnotation);
            const closingBraceToken = colonToken ? sourceCode.getTokenBefore(colonToken) : null;
            const typeFirstToken = sourceCode.getFirstToken(typeAnnotation);

            if (closingBraceToken && colonToken && typeFirstToken && closingBraceToken.value === "}") {
                const textBeforeColon = sourceCode.getText().slice(closingBraceToken.range[1], colonToken.range[0]);
                const textAfterColon = sourceCode.getText().slice(colonToken.range[1], typeFirstToken.range[0]);

                if (textBeforeColon !== "" || textAfterColon !== " ") {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [closingBraceToken.range[1], typeFirstToken.range[0]],
                            ": ",
                        ),
                        message: "Type annotation must have no space before colon and one space after: \"}: TypeName\"",
                        node: typeAnnotation,
                    });
                }
            }

            // Handle intersection types: ButtonHTMLAttributes<HTMLButtonElement> & { prop: Type }
            if (typeAnnotation.type === "TSIntersectionType" && isComponent) {
                const types = typeAnnotation.types;

                // Check & operators are on same line as previous type
                for (let i = 0; i < types.length - 1; i += 1) {
                    const currentType = types[i];
                    const nextType = types[i + 1];

                    const ampersandToken = sourceCode.getTokenAfter(currentType, (t) => t.value === "&");

                    if (ampersandToken && ampersandToken.loc.start.line !== currentType.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [currentType.range[1], ampersandToken.range[1]],
                                " &",
                            ),
                            message: "\"&\" must be on same line as previous type",
                            node: ampersandToken,
                        });
                    }

                    // { should be on same line as &
                    if (nextType.type === "TSTypeLiteral" && ampersandToken) {
                        const openBrace = sourceCode.getFirstToken(nextType);

                        if (openBrace && openBrace.loc.start.line !== ampersandToken.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [ampersandToken.range[1], openBrace.range[0]],
                                    " ",
                                ),
                                message: "Opening brace must be on same line as \"&\"",
                                node: openBrace,
                            });
                        }
                    }
                }

                // Find TSTypeLiteral in the intersection and apply formatting rules
                const typeLiteral = types.find((t) => t.type === "TSTypeLiteral");

                if (typeLiteral) {
                    const members = typeLiteral.members;

                    // Get the base indentation from the component declaration
                    const componentLine = sourceCode.lines[node.loc.start.line - 1];
                    const baseIndent = componentLine.match(/^\s*/)[0];
                    const propIndent = baseIndent + "    ";

                    // Get opening and closing brace tokens
                    const openBraceToken = sourceCode.getFirstToken(typeLiteral);
                    const closeBraceToken = sourceCode.getLastToken(typeLiteral);

                    // For multiple members, first member should be on new line after opening brace
                    if (members.length > 1 && members[0]) {
                        const firstMember = members[0];

                        if (firstMember.loc.start.line === openBraceToken.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [openBraceToken.range[1], firstMember.range[0]],
                                    "\n" + propIndent,
                                ),
                                message: "First props type property must be on a new line when there are multiple properties",
                                node: firstMember,
                            });
                        }
                    }

                    // Check closing brace position - should be on its own line for multiple members
                    if (members.length > 1 && closeBraceToken) {
                        const lastMember = members[members.length - 1];

                        if (closeBraceToken.loc.start.line === lastMember.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastMember.range[1], closeBraceToken.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "Closing brace must be on its own line when there are multiple properties",
                                node: closeBraceToken,
                            });
                        }
                    }

                    // Collapse single-member type to single line if it spans multiple lines
                    if (members.length === 1 && openBraceToken && closeBraceToken) {
                        const member = members[0];

                        // Check if the type spans multiple lines
                        if (openBraceToken.loc.end.line !== closeBraceToken.loc.start.line) {
                            let memberText = sourceCode.getText(member);

                            // Remove trailing comma/semicolon if any
                            memberText = memberText.replace(/[,;]\s*$/, "");

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [openBraceToken.range[0], closeBraceToken.range[1]],
                                    `{ ${memberText} }`,
                                ),
                                message: "Single props type property should be on a single line",
                                node: typeLiteral,
                            });
                        }
                    }

                    // Check each member for formatting
                    members.forEach((member, index) => {
                        const memberText = sourceCode.getText(member);

                        // Check property ends with comma, not semicolon
                        if (memberText.trimEnd().endsWith(";")) {
                            context.report({
                                fix: (fixer) => {
                                    const lastChar = memberText.lastIndexOf(";");
                                    const absolutePos = member.range[0] + lastChar;

                                    return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                                },
                                message: "Props type properties must end with comma (,) not semicolon (;)",
                                node: member,
                            });
                        }

                        // If more than one member, check each is on its own line
                        if (members.length > 1 && index > 0) {
                            const prevMember = members[index - 1];

                            if (member.loc.start.line === prevMember.loc.end.line) {
                                context.report({
                                    fix: (fixer) => {
                                        let commaToken = sourceCode.getTokenAfter(prevMember);

                                        while (commaToken && commaToken.value !== "," && commaToken.range[0] < member.range[0]) {
                                            commaToken = sourceCode.getTokenAfter(commaToken);
                                        }

                                        const insertPoint = commaToken && commaToken.value === "," ? commaToken.range[1] : prevMember.range[1];

                                        return fixer.replaceTextRange(
                                            [insertPoint, member.range[0]],
                                            "\n" + propIndent,
                                        );
                                    },
                                    message: "Each props type property must be on its own line when there are multiple properties",
                                    node: member,
                                });
                            }

                            // Check for empty lines between properties
                            if (member.loc.start.line - prevMember.loc.end.line > 1) {
                                context.report({
                                    fix: (fixer) => {
                                        const textBetween = sourceCode.getText().slice(
                                            prevMember.range[1],
                                            member.range[0],
                                        );
                                        const newText = textBetween.replace(/\n\s*\n/g, "\n");

                                        return fixer.replaceTextRange(
                                            [prevMember.range[1], member.range[0]],
                                            newText,
                                        );
                                    },
                                    message: "No empty lines allowed between props type properties",
                                    node: member,
                                });
                            }
                        }
                    });

                    // Check that last member has trailing comma (only for multiple members)
                    if (members.length > 1) {
                        const lastMember = members[members.length - 1];
                        const lastMemberText = sourceCode.getText(lastMember);

                        if (!lastMemberText.trimEnd().endsWith(",")) {
                            context.report({
                                fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                                message: "Last props type property must have trailing comma",
                                node: lastMember,
                            });
                        }
                    }

                    // Remove trailing comma for single member on single line
                    if (members.length === 1) {
                        const member = members[0];
                        const memberText = sourceCode.getText(member);

                        if (memberText.trimEnd().endsWith(",")) {
                            context.report({
                                fix: (fixer) => {
                                    const lastCommaIndex = memberText.lastIndexOf(",");
                                    const absolutePos = member.range[0] + lastCommaIndex;

                                    return fixer.removeRange([absolutePos, absolutePos + 1]);
                                },
                                message: "Single props type property should not have trailing comma",
                                node: member,
                            });
                        }
                    }

                    // Check for empty lines before closing brace
                    if (members.length > 0 && closeBraceToken) {
                        const lastMember = members[members.length - 1];

                        if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastMember.range[1], closeBraceToken.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "No empty line before closing brace in props type",
                                node: closeBraceToken,
                            });
                        }
                    }
                }

                return;
            }

            // Check if type is a reference (TSTypeReference) instead of inline (TSTypeLiteral)
            // Only enforce inline types for React components - regular functions can use interface/type references
            if (typeAnnotation.type === "TSTypeReference") {
                if (isComponent) {
                    const typeName = typeAnnotation.typeName && typeAnnotation.typeName.name
                        ? typeAnnotation.typeName.name
                        : sourceCode.getText(typeAnnotation.typeName);

                    context.report({
                        message: `Component props should use inline type annotation instead of referencing "${typeName}". Define the type inline as "{ prop: type, ... }"`,
                        node: typeAnnotation,
                    });
                }

                // Regular functions with interface references are allowed - no error
                return;
            }

            // If it's a TSTypeLiteral, check formatting (only for React components)
            if (typeAnnotation.type === "TSTypeLiteral" && isComponent) {
                const members = typeAnnotation.members;

                // Get the base indentation from the component declaration
                const componentLine = sourceCode.lines[node.loc.start.line - 1];
                const baseIndent = componentLine.match(/^\s*/)[0];
                const propIndent = baseIndent + "    ";

                // Get opening brace token
                const openBraceToken = sourceCode.getFirstToken(typeAnnotation);

                // Check that props and type props are identical
                const destructuredProps = firstParam.properties
                    .filter((prop) => prop.type === "Property" || prop.type === "RestElement")
                    .map((prop) => {
                        if (prop.type === "RestElement") return null;

                        return prop.key && prop.key.name ? prop.key.name : null;
                    })
                    .filter(Boolean)
                    .sort();

                const typeProps = members
                    .filter((member) => member.type === "TSPropertySignature")
                    .map((member) => member.key && member.key.name ? member.key.name : null)
                    .filter(Boolean)
                    .sort();

                const missingInType = destructuredProps.filter((prop) => !typeProps.includes(prop));
                const extraInType = typeProps.filter((prop) => !destructuredProps.includes(prop));

                if (missingInType.length > 0) {
                    context.report({
                        message: `Props type is missing properties that are destructured: ${missingInType.join(", ")}`,
                        node: typeAnnotation,
                    });
                }

                if (extraInType.length > 0) {
                    context.report({
                        message: `Props type has extra properties not in destructured props: ${extraInType.join(", ")}`,
                        node: typeAnnotation,
                    });
                }

                // Get closing brace of type literal
                const closeBraceToken = sourceCode.getLastToken(typeAnnotation);

                // Check for empty line after opening brace
                if (members.length > 0) {
                    const firstMember = members[0];

                    if (firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[1], firstMember.range[0]],
                                "\n" + propIndent,
                            ),
                            message: "No empty line after opening brace in props type",
                            node: firstMember,
                        });
                    }
                }

                // Check for empty line before closing brace
                if (members.length > 0 && closeBraceToken) {
                    const lastMember = members[members.length - 1];

                    if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "No empty line before closing brace in props type",
                            node: lastMember,
                        });
                    }
                }

                // For multiple members, first member should be on new line after opening brace
                if (members.length > 1 && members[0]) {
                    const firstMember = members[0];

                    if (firstMember.loc.start.line === openBraceToken.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[1], firstMember.range[0]],
                                "\n" + propIndent,
                            ),
                            message: "First props type property must be on a new line when there are multiple properties",
                            node: firstMember,
                        });
                    }
                }

                // Check closing brace position - should be on its own line for multiple members
                if (members.length > 1 && closeBraceToken) {
                    const lastMember = members[members.length - 1];

                    if (closeBraceToken.loc.start.line === lastMember.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing brace must be on its own line when there are multiple properties",
                            node: closeBraceToken,
                        });
                    }
                }

                // Collapse single-member type to single line if it spans multiple lines
                if (members.length === 1 && openBraceToken && closeBraceToken) {
                    const member = members[0];

                    // Check if the type spans multiple lines
                    if (openBraceToken.loc.end.line !== closeBraceToken.loc.start.line) {
                        let memberText = sourceCode.getText(member);

                        // Remove trailing comma/semicolon if any
                        memberText = memberText.replace(/[,;]\s*$/, "");

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[0], closeBraceToken.range[1]],
                                `{ ${memberText} }`,
                            ),
                            message: "Single props type property should be on a single line",
                            node: typeAnnotation,
                        });
                    }
                }

                // Check each member for semicolons vs commas and line formatting
                members.forEach((member, index) => {
                    const memberText = sourceCode.getText(member);

                    // Check for space before ? in optional properties (e.g., "prop ?: type" should be "prop?: type")
                    if (member.type === "TSPropertySignature" && member.optional) {
                        const keyToken = sourceCode.getFirstToken(member);
                        const questionToken = sourceCode.getTokenAfter(keyToken);

                        if (questionToken && questionToken.value === "?") {
                            const textBetween = sourceCode.getText().slice(keyToken.range[1], questionToken.range[0]);

                            if (textBetween !== "") {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [keyToken.range[1], questionToken.range[0]],
                                        "",
                                    ),
                                    message: "No space allowed before \"?\" in optional property",
                                    node: member,
                                });
                            }
                        }
                    }

                    // Check property ends with comma, not semicolon
                    if (memberText.trimEnd().endsWith(";")) {
                        context.report({
                            fix: (fixer) => {
                                const lastChar = memberText.lastIndexOf(";");
                                const absolutePos = member.range[0] + lastChar;

                                return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                            },
                            message: "Props type properties must end with comma (,) not semicolon (;)",
                            node: member,
                        });
                    }

                    // If more than one member, check formatting
                    if (members.length > 1 && index > 0) {
                        const prevMember = members[index - 1];

                        // Check each is on its own line - with auto-fix
                        if (member.loc.start.line === prevMember.loc.end.line) {
                            context.report({
                                fix: (fixer) => {
                                    // Find the comma after prev member
                                    let commaToken = sourceCode.getTokenAfter(prevMember);

                                    while (commaToken && commaToken.value !== "," && commaToken.range[0] < member.range[0]) {
                                        commaToken = sourceCode.getTokenAfter(commaToken);
                                    }

                                    const insertPoint = commaToken && commaToken.value === "," ? commaToken.range[1] : prevMember.range[1];

                                    return fixer.replaceTextRange(
                                        [insertPoint, member.range[0]],
                                        "\n" + propIndent,
                                    );
                                },
                                message: "Each props type property must be on its own line when there are multiple properties",
                                node: member,
                            });
                        }

                        // Check for empty lines between properties
                        if (member.loc.start.line - prevMember.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => {
                                    const textBetween = sourceCode.getText().slice(
                                        prevMember.range[1],
                                        member.range[0],
                                    );
                                    const newText = textBetween.replace(/\n\s*\n/g, "\n");

                                    return fixer.replaceTextRange(
                                        [prevMember.range[1], member.range[0]],
                                        newText,
                                    );
                                },
                                message: "No empty lines allowed between props type properties",
                                node: member,
                            });
                        }
                    }
                });

                // Check that last member has trailing comma (only for multiple members)
                if (members.length > 1) {
                    const lastMember = members[members.length - 1];
                    const lastMemberText = sourceCode.getText(lastMember);

                    if (!lastMemberText.trimEnd().endsWith(",")) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                            message: "Last props type property must have trailing comma",
                            node: lastMember,
                        });
                    }
                }

                // Remove trailing comma for single member on single line
                if (members.length === 1) {
                    const member = members[0];
                    const memberText = sourceCode.getText(member);

                    if (memberText.trimEnd().endsWith(",")) {
                        context.report({
                            fix: (fixer) => {
                                const lastCommaIndex = memberText.lastIndexOf(",");
                                const absolutePos = member.range[0] + lastCommaIndex;

                                return fixer.removeRange([absolutePos, absolutePos + 1]);
                            },
                            message: "Single props type property should not have trailing comma",
                            node: member,
                        });
                    }
                }
            }
        };

        // Check return type annotation spacing and type reference requirement
        const checkReturnTypeSpacingHandler = (node) => {
            // Check if function has a return type annotation
            if (!node.returnType || !node.returnType.typeAnnotation) return;

            const returnType = node.returnType;
            const typeAnnotation = returnType.typeAnnotation;
            const isComponent = isReactComponentHandler(node);

            // For non-components: return type must be a type reference, not inline object type
            if (!isComponent && typeAnnotation.type === "TSTypeLiteral") {
                context.report({
                    message: "Function return type must be a type reference (interface, type, or built-in type), not an inline object type. Define the return type separately.",
                    node: typeAnnotation,
                });

                return;
            }

            // Get the closing paren of the params
            let closeParenToken;

            if (node.params.length > 0) {
                const lastParam = node.params[node.params.length - 1];

                closeParenToken = sourceCode.getTokenAfter(lastParam, (token) => token.value === ")");
            } else {
                // No params - find the () after the function name or the opening (
                const firstToken = sourceCode.getFirstToken(node);
                let searchToken = firstToken;

                while (searchToken && searchToken.value !== "(") {
                    searchToken = sourceCode.getTokenAfter(searchToken);
                }

                if (searchToken) {
                    closeParenToken = sourceCode.getTokenAfter(searchToken, (token) => token.value === ")");
                }
            }

            if (!closeParenToken) return;

            // Get the colon token
            const colonToken = sourceCode.getFirstToken(returnType);

            if (!colonToken || colonToken.value !== ":") return;

            // Get the first token of the type annotation
            const typeFirstToken = sourceCode.getFirstToken(typeAnnotation);

            if (!typeFirstToken) return;

            // Check spacing: ): TypeName (no space before colon, one space after)
            const textBeforeColon = sourceCode.getText().slice(closeParenToken.range[1], colonToken.range[0]);
            const textAfterColon = sourceCode.getText().slice(colonToken.range[1], typeFirstToken.range[0]);

            if (textBeforeColon !== "" || textAfterColon !== " ") {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeParenToken.range[1], typeFirstToken.range[0]],
                        ": ",
                    ),
                    message: "Return type annotation must have no space before colon and one space after: \"): TypeName\"",
                    node: returnType,
                });
            }
        };

        return {
            ArrowFunctionExpression(node) {
                checkComponentPropsTypeHandler(node);
                checkReturnTypeSpacingHandler(node);
            },
            FunctionDeclaration(node) {
                checkComponentPropsTypeHandler(node);
                checkReturnTypeSpacingHandler(node);
            },
            FunctionExpression(node) {
                checkComponentPropsTypeHandler(node);
                checkReturnTypeSpacingHandler(node);
            },
        };
    },
    meta: {
        docs: { description: "Enforce inline type annotation for React component props and return types with proper formatting" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: SVG Component Icon Naming
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Components that return only an SVG element must have a name
 *   ending with "Icon". Conversely, components with "Icon" suffix
 *   must return an SVG element.
 *
 * ✓ Good:
 *   export const SuccessIcon = ({ className }: { className?: string }) => (
 *       <svg className={className}>...</svg>
 *   );
 *
 *   export const Button = ({ children }: { children: ReactNode }) => (
 *       <button>{children}</button>
 *   );
 *
 * ✗ Bad:
 *   // Returns SVG but doesn't end with "Icon"
 *   export const Success = ({ className }: { className?: string }) => (
 *       <svg className={className}>...</svg>
 *   );
 *
 *   // Ends with "Icon" but doesn't return SVG
 *   export const ButtonIcon = ({ children }: { children: ReactNode }) => (
 *       <button>{children}</button>
 *   );
 */
const svgIconNamingConvention = {
    create(context) {
        // Get the component name from node
        const getComponentNameHandler = (node) => {
            // Arrow function: const Name = () => ...
            if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                return node.parent.id.name;
            }

            // Function declaration: function Name() { ... }
            if (node.id && node.id.type === "Identifier") {
                return node.id.name;
            }

            return null;
        };

        // Check if component name starts with uppercase (React component convention)
        const isReactComponentNameHandler = (name) => name && /^[A-Z]/.test(name);

        // Check if name ends with "Icon"
        const hasIconSuffixHandler = (name) => name && name.endsWith("Icon");

        // Check if the return value is purely an SVG element
        const returnsSvgOnlyHandler = (node) => {
            const body = node.body;

            if (!body) return false;

            // Arrow function with expression body: () => <svg>...</svg>
            if (body.type === "JSXElement") {
                return body.openingElement && body.openingElement.name && body.openingElement.name.name === "svg";
            }

            // Arrow function with parenthesized expression: () => (<svg>...</svg>)
            if (body.type === "ParenthesizedExpression" && body.expression) {
                if (body.expression.type === "JSXElement") {
                    return body.expression.openingElement && body.expression.openingElement.name && body.expression.openingElement.name.name === "svg";
                }
            }

            // Block body with return statement: () => { return <svg>...</svg>; }
            if (body.type === "BlockStatement") {
                // Find all return statements
                const returnStatements = body.body.filter((stmt) => stmt.type === "ReturnStatement" && stmt.argument);

                // Should have exactly one return statement for a simple SVG component
                if (returnStatements.length === 1) {
                    const returnArg = returnStatements[0].argument;

                    if (returnArg.type === "JSXElement") {
                        return returnArg.openingElement && returnArg.openingElement.name && returnArg.openingElement.name.name === "svg";
                    }

                    // Parenthesized: return (<svg>...</svg>);
                    if (returnArg.type === "ParenthesizedExpression" && returnArg.expression && returnArg.expression.type === "JSXElement") {
                        return returnArg.expression.openingElement && returnArg.expression.openingElement.name && returnArg.expression.openingElement.name.name === "svg";
                    }
                }
            }

            return false;
        };

        const checkFunctionHandler = (node) => {
            const componentName = getComponentNameHandler(node);

            // Only check React components (PascalCase)
            if (!isReactComponentNameHandler(componentName)) return;

            const returnsSvg = returnsSvgOnlyHandler(node);
            const hasIconSuffix = hasIconSuffixHandler(componentName);

            // Case 1: Returns SVG but doesn't end with "Icon"
            if (returnsSvg && !hasIconSuffix) {
                context.report({
                    message: `Component "${componentName}" returns an SVG element and should end with "Icon" suffix (e.g., "${componentName}Icon")`,
                    node: node.parent && node.parent.type === "VariableDeclarator" ? node.parent.id : node.id || node,
                });
            }

            // Case 2: Ends with "Icon" but doesn't return SVG
            if (hasIconSuffix && !returnsSvg) {
                context.report({
                    message: `Component "${componentName}" has "Icon" suffix but doesn't return an SVG element. Either rename it or make it return an SVG.`,
                    node: node.parent && node.parent.type === "VariableDeclarator" ? node.parent.id : node.id || node,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce SVG components to have 'Icon' suffix and vice versa" },
        fixable: null,
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Folder Component Suffix
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces naming conventions for components based on folder location:
 *   - Components in "views" folder must end with "View" suffix
 *   - Components in "pages" folder must end with "Page" suffix
 *   - Components in "layouts" folder must end with "Layout" suffix
 *
 * ✓ Good:
 *   // In views/dashboard-view.tsx:
 *   export const DashboardView = () => <div>Dashboard</div>;
 *
 *   // In pages/home-page.tsx:
 *   export const HomePage = () => <div>Home</div>;
 *
 *   // In layouts/main-layout.tsx:
 *   export const MainLayout = () => <div>Main</div>;
 *
 * ✗ Bad:
 *   // In views/dashboard.tsx:
 *   export const Dashboard = () => <div>Dashboard</div>;  // Should be "DashboardView"
 *
 *   // In pages/home.tsx:
 *   export const Home = () => <div>Home</div>;  // Should be "HomePage"
 *
 *   // In layouts/main.tsx:
 *   export const Main = () => <div>Main</div>;  // Should be "MainLayout"
 */
const folderBasedNamingConvention = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        // Folder-to-suffix mapping
        // - JSX component folders: require function returning JSX (PascalCase)
        // - camelCase folders: check camelCase exported identifiers
        // - Other non-JSX folders: check PascalCase exported identifiers
        const folderSuffixMap = {
            atoms: "",
            components: "",
            constants: "Constants",
            contexts: "Context",
            data: "Data",
            layouts: "Layout",
            pages: "Page",
            providers: "Provider",
            reducers: "Reducer",
            services: "Service",
            strings: "Strings",
            theme: "Theme",
            themes: "Theme",
            views: "View",
        };

        // Folders where JSX return is required (component folders)
        const jsxRequiredFolders = new Set(["atoms", "components", "layouts", "pages", "providers", "views"]);

        // Folders where exports use camelCase naming (non-component, non-context)
        const camelCaseFolders = new Set(["constants", "data", "reducers", "services", "strings"]);

        // Convert kebab-case to PascalCase
        const toPascalCaseHandler = (str) => str.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

        // Convert PascalCase to camelCase (lowercase first letter)
        const toCamelCaseHandler = (str) => str.charAt(0).toLowerCase() + str.slice(1);

        // Build regex dynamically from folder names
        const folderNames = Object.keys(folderSuffixMap).join("|");

        // Parse the file path to extract module folder info at any depth
        const getModuleInfoHandler = () => {
            const pattern = new RegExp(`\\/(${folderNames})\\/(.+)\\.(jsx?|tsx?)$`);
            const match = normalizedFilename.match(pattern);

            if (!match) return null;

            const moduleFolderName = match[1];
            const suffix = folderSuffixMap[moduleFolderName];
            const relativePath = match[2];
            const segments = relativePath.split("/");
            const fileName = segments[segments.length - 1];
            const intermediateFolders = segments.slice(0, -1);

            return { fileName, folder: moduleFolderName, intermediateFolders, suffix };
        };

        // Build the expected name based on file position
        const buildExpectedNameHandler = (moduleInfo) => {
            const { fileName, folder, intermediateFolders, suffix } = moduleInfo;

            // Module barrel file (e.g., views/index.ts) — skip
            if (fileName === "index" && intermediateFolders.length === 0) return null;

            let nameParts;

            if (fileName === "index") {
                // Index in subfolder (e.g., layouts/auth/index.tsx) → parts from folders only
                nameParts = [...intermediateFolders].reverse();
            } else {
                // Regular file (e.g., layouts/auth/login.tsx) → file name + folders deepest-to-shallowest
                nameParts = [fileName, ...[...intermediateFolders].reverse()];
            }

            const pascalName = nameParts.map(toPascalCaseHandler).join("") + suffix;

            // camelCase folders produce camelCase names
            if (camelCaseFolders.has(folder)) return toCamelCaseHandler(pascalName);

            return pascalName;
        };

        // Get the component name from function node
        const getComponentNameHandler = (node) => {
            // Arrow function: const Name = () => ...
            if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                return { name: node.parent.id.name, identifierNode: node.parent.id };
            }

            // Function declaration: function Name() { ... }
            if (node.id && node.id.type === "Identifier") {
                return { name: node.id.name, identifierNode: node.id };
            }

            return null;
        };

        // Check if name starts with uppercase (PascalCase)
        const isPascalCaseHandler = (name) => name && /^[A-Z]/.test(name);

        // Check if the function returns JSX
        const returnsJsxHandler = (node) => {
            const body = node.body;

            if (!body) return false;

            // Arrow function with expression body: () => <div>...</div>
            if (body.type === "JSXElement" || body.type === "JSXFragment") {
                return true;
            }

            // Parenthesized expression
            if (body.type === "ParenthesizedExpression" && body.expression) {
                if (body.expression.type === "JSXElement" || body.expression.type === "JSXFragment") {
                    return true;
                }
            }

            // Block body with return statement
            if (body.type === "BlockStatement") {
                const hasJsxReturn = body.body.some((stmt) => {
                    if (stmt.type === "ReturnStatement" && stmt.argument) {
                        const arg = stmt.argument;

                        return arg.type === "JSXElement" || arg.type === "JSXFragment"
                            || (arg.type === "ParenthesizedExpression" && arg.expression
                                && (arg.expression.type === "JSXElement" || arg.expression.type === "JSXFragment"));
                    }

                    return false;
                });

                return hasJsxReturn;
            }

            return false;
        };

        // Shared fix logic for renaming identifier and all references
        const createRenameFixer = (node, name, expectedName, identifierNode) => (fixer) => {
            const scope = context.sourceCode
                ? context.sourceCode.getScope(node)
                : context.getScope();

            const findVariableHandler = (s, varName) => {
                const v = s.variables.find((variable) => variable.name === varName);

                if (v) return v;
                if (s.upper) return findVariableHandler(s.upper, varName);

                return null;
            };

            const variable = findVariableHandler(scope, name);

            if (!variable) return fixer.replaceText(identifierNode, expectedName);

            const fixes = [];
            const fixedRanges = new Set();

            variable.defs.forEach((def) => {
                const rangeKey = `${def.name.range[0]}-${def.name.range[1]}`;

                if (!fixedRanges.has(rangeKey)) {
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(def.name, expectedName));
                }
            });

            variable.references.forEach((ref) => {
                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                if (!fixedRanges.has(rangeKey)) {
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(ref.identifier, expectedName));
                }
            });

            return fixes;
        };

        // Build the error message based on folder type
        const buildMessageHandler = (name, folder, suffix, expectedName) => {
            if (suffix) return `"${name}" in "${folder}" folder must be named "${expectedName}" (expected "${suffix}" suffix with chained folder names)`;

            return `"${name}" in "${folder}" folder must be named "${expectedName}" (expected chained folder names)`;
        };

        // Check if name starts with lowercase (camelCase)
        const isCamelCaseHandler = (name) => name && /^[a-z]/.test(name);

        // Check camelCase naming for camelCase folders (constants, data, reducers, services, strings)
        const checkCamelCaseHandler = (name, folder, suffix, identifierNode, scopeNode, moduleInfo) => {
            if (!name.endsWith(suffix)) {
                // Missing suffix — auto-fix by appending suffix
                const fixedName = name + suffix;

                context.report({
                    fix: createRenameFixer(scopeNode, name, fixedName, identifierNode),
                    message: `"${name}" in "${folder}" folder must end with "${suffix}" suffix (should be "${fixedName}")`,
                    node: identifierNode,
                });

                return;
            }

            // Has correct suffix — check if prefix is a near-match of expected file-based name
            // This catches cases like "routeConstants" → "routesConstants" (file is routes.ts)
            // but allows unrelated names like "buttonTypeData" in data/app.ts
            const expectedName = buildExpectedNameHandler(moduleInfo);

            if (!expectedName || name === expectedName) return;

            const actualPrefix = name.slice(0, -suffix.length);
            const expectedPrefix = expectedName.slice(0, -suffix.length);

            const isNearMatch = (expectedPrefix.startsWith(actualPrefix) && (expectedPrefix.length - actualPrefix.length) <= 2)
                || (actualPrefix.startsWith(expectedPrefix) && (actualPrefix.length - expectedPrefix.length) <= 2);

            if (isNearMatch) {
                context.report({
                    fix: createRenameFixer(scopeNode, name, expectedName, identifierNode),
                    message: `"${name}" in "${folder}" folder should be "${expectedName}" to match the file name`,
                    node: identifierNode,
                });
            }
        };

        // Check function declarations (JSX components + non-JSX functions like reducers)
        const checkFunctionHandler = (node) => {
            const moduleInfo = getModuleInfoHandler();

            if (!moduleInfo) return;

            const componentInfo = getComponentNameHandler(node);

            if (!componentInfo) return;

            const { name, identifierNode } = componentInfo;

            const { folder, suffix } = moduleInfo;

            // For camelCase folders, enforce suffix + near-match prefix check
            if (camelCaseFolders.has(folder)) {
                if (!isCamelCaseHandler(name) || !suffix) return;

                checkCamelCaseHandler(name, folder, suffix, identifierNode, node, moduleInfo);

                return;
            }

            if (!isPascalCaseHandler(name)) return;

            // For JSX-required folders, only check functions that return JSX
            if (jsxRequiredFolders.has(folder) && !returnsJsxHandler(node)) return;

            const expectedName = buildExpectedNameHandler(moduleInfo);

            if (!expectedName) return;

            if (name !== expectedName) {
                context.report({
                    fix: createRenameFixer(node, name, expectedName, identifierNode),
                    message: buildMessageHandler(name, folder, suffix, expectedName),
                    node: identifierNode,
                });
            }
        };

        // Check variable declarations for non-JSX folders (contexts, themes, data, etc.)
        const checkVariableHandler = (node) => {
            // Only check VariableDeclarators with an identifier name
            if (!node.id || node.id.type !== "Identifier") return;

            // Skip if init is a function (handled by checkFunctionHandler)
            if (node.init && (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression")) return;

            const moduleInfo = getModuleInfoHandler();

            if (!moduleInfo) return;

            const { folder, suffix } = moduleInfo;

            // Only check non-JSX folders (contexts, themes, data, constants, strings, etc.)
            if (jsxRequiredFolders.has(folder)) return;

            const name = node.id.name;

            // For camelCase folders, enforce suffix + near-match prefix check
            if (camelCaseFolders.has(folder)) {
                if (!isCamelCaseHandler(name) || !suffix) return;

                checkCamelCaseHandler(name, folder, suffix, node.id, node, moduleInfo);

                return;
            }

            if (!isPascalCaseHandler(name)) return;

            const expectedName = buildExpectedNameHandler(moduleInfo);

            if (!expectedName) return;

            if (name !== expectedName) {
                context.report({
                    fix: createRenameFixer(node, name, expectedName, node.id),
                    message: buildMessageHandler(name, folder, suffix, expectedName),
                    node: node.id,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            VariableDeclarator: checkVariableHandler,
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions based on folder location — suffix for views/layouts/pages/providers/reducers/contexts/themes, chained folder names for nested files" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Folder Structure Consistency
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that module folders have a consistent internal
 *   structure — either all flat files or all wrapped in folders.
 *
 *   Applies to the same folders as module-index-exports: atoms,
 *   components, hooks, utils, enums, types, reducers, etc.
 *
 *   - Flat mode: All items are direct files (e.g., atoms/input.tsx)
 *   - Wrapped mode: All items are in subfolders (e.g., atoms/input/index.tsx)
 *   - Wrapped mode is only justified when at least one subfolder has 2+ files
 *
 * ✓ Good (flat — all direct files):
 *   atoms/input.tsx
 *   atoms/calendar.tsx
 *
 * ✓ Good (wrapped — justified, input has multiple files):
 *   atoms/input/input.tsx
 *   atoms/input/helpers.ts
 *   atoms/calendar/index.tsx
 *
 * ✗ Bad (mixed — some flat, some wrapped):
 *   atoms/input.tsx
 *   atoms/calendar/index.tsx
 *
 * ✗ Bad (wrapped but unnecessary — each folder has only 1 file):
 *   atoms/input/index.tsx
 *   atoms/calendar/index.tsx
 */
const folderStructureConsistency = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const options = context.options[0] || {};
        const defaultModuleFolders = [
            "actions",
            "apis",
            "assets",
            "atoms",
            "components",
            "config",
            "configs",
            "constants",
            "contexts",
            "data",
            "enums",
            "helpers",
            "hooks",
            "interfaces",
            "layouts",
            "lib",
            "middlewares",
            "molecules",
            "organisms",
            "pages",
            "providers",
            "reducers",
            "redux",
            "requests",
            "routes",
            "schemas",
            "sections",
            "services",
            "store",
            "strings",
            "styles",
            "theme",
            "thunks",
            "types",
            "ui",
            "utils",
            "utilities",
            "views",
            "widgets",
        ];

        const moduleFolders = options.moduleFolders
            || [...defaultModuleFolders, ...(options.extraModuleFolders || [])];

        // Find the module folder in the file path
        const getModuleFolderInfoHandler = () => {
            for (const folder of moduleFolders) {
                const pattern = new RegExp(`(.*/${folder})/`);
                const match = normalizedFilename.match(pattern);

                if (match) return { folder, fullPath: match[1] };
            }

            return null;
        };

        const moduleFolderInfo = getModuleFolderInfoHandler();

        // Check for loose module files (e.g., src/data.js instead of src/data/)
        if (!moduleFolderInfo) {
            const fileBaseName = normalizedFilename.replace(/.*\//, "").replace(/\.(jsx?|tsx?)$/, "");

            if (moduleFolders.includes(fileBaseName)) {
                return {
                    Program(node) {
                        context.report({
                            message: `"${fileBaseName}" should be a folder, not a standalone file. Use "${fileBaseName}/" folder with an index file instead.`,
                            node,
                        });
                    },
                };
            }

            return {};
        }

        const { folder, fullPath } = moduleFolderInfo;

        // Read module folder children
        let children;

        try {
            children = fs.readdirSync(fullPath, { withFileTypes: true });
        } catch {
            return {};
        }

        const codeFilePattern = /\.(tsx?|jsx?)$/;

        // Categorize children
        const directFiles = children.filter(
            (child) => child.isFile() && codeFilePattern.test(child.name) && !child.name.startsWith("index."),
        );

        const subdirectories = children.filter((child) => child.isDirectory());

        // If only index files or empty, no issue
        if (directFiles.length === 0 && subdirectories.length === 0) return {};

        // If only one non-index file and no subdirectories, no issue
        if (directFiles.length <= 1 && subdirectories.length === 0) return {};

        // Check if wrapped mode is justified (any subfolder has 2+ code files)
        const isWrappedJustifiedHandler = () => {
            for (const dir of subdirectories) {
                try {
                    const dirPath = `${fullPath}/${dir.name}`;
                    const dirChildren = fs.readdirSync(dirPath, { withFileTypes: true });
                    const codeFiles = dirChildren.filter(
                        (child) => child.isFile() && codeFilePattern.test(child.name),
                    );

                    if (codeFiles.length >= 2) return true;
                } catch {
                    // Skip unreadable directories
                }
            }

            return false;
        };

        const hasDirectFiles = directFiles.length > 0;
        const hasSubdirectories = subdirectories.length > 0;
        const isMixed = hasDirectFiles && hasSubdirectories;
        const wrappedJustified = hasSubdirectories ? isWrappedJustifiedHandler() : false;

        return {
            Program(node) {
                // Case: All folders, NOT justified → unnecessary wrapping
                if (!hasDirectFiles && hasSubdirectories && !wrappedJustified) {
                    context.report({
                        message: `Unnecessary wrapper folders in "${folder}/". Each item has only one file, use direct files instead (e.g., ${folder}/component.tsx).`,
                        node,
                    });

                    return;
                }

                // Case: Mixed + wrapped justified → error on direct files
                if (isMixed && wrappedJustified) {
                    // Only report if this file IS a direct file in the module folder
                    const relativePart = normalizedFilename.slice(fullPath.length + 1);
                    const isDirectFile = !relativePart.includes("/");

                    if (isDirectFile) {
                        context.report({
                            message: `Since some items in "${folder}/" contain multiple files, all items should be wrapped in folders.`,
                            node,
                        });
                    }

                    return;
                }

                // Case: Mixed + NOT justified → error on subfolder files
                if (isMixed && !wrappedJustified) {
                    // Only report if this file IS inside a subfolder
                    const relativePart = normalizedFilename.slice(fullPath.length + 1);
                    const isInSubfolder = relativePart.includes("/");

                    if (isInSubfolder) {
                        context.report({
                            message: `Unnecessary wrapper folder. Each item in "${folder}/" has only one file, use direct files instead.`,
                            node,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent folder structure (flat vs wrapped) in module folders like atoms, components, hooks, enums, views, layouts, and pages" },
        fixable: null,
        schema: [
            {
                additionalProperties: false,
                properties: {
                    extraModuleFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    moduleFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Redundant Folder Suffix
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Flags files whose name redundantly includes the parent (or ancestor)
 *   folder name as a suffix. Since the folder already provides context,
 *   the file name doesn't need to repeat it.
 *
 *   Checks all ancestor folders from "src/" onwards.
 *   Skips index files (index.ts, index.js, etc.).
 *
 * ✓ Good:
 *   layouts/main.tsx           → file "main" has no redundant suffix
 *   atoms/button.tsx           → file "button" has no redundant suffix
 *   views/dashboard.tsx        → file "dashboard" has no redundant suffix
 *   hooks/use-auth.ts          → file "use-auth" has no redundant suffix
 *
 * ✗ Bad:
 *   layouts/main-layout.tsx    → redundant "-layout" (already in layouts/)
 *   atoms/button-atom.tsx      → redundant "-atom" (already in atoms/)
 *   views/dashboard-view.tsx   → redundant "-view" (already in views/)
 *   hooks/use-auth-hook.ts     → redundant "-hook" (already in hooks/)
 *   atoms/forms/input-atom.tsx → redundant "-atom" from ancestor "atoms/"
 */
const noRedundantFolderSuffix = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        // Get the file base name without extension
        const parts = normalizedFilename.split("/");
        const fileWithExt = parts[parts.length - 1];
        const baseName = fileWithExt.replace(/\.(jsx?|tsx?)$/, "");

        // Singularize: convert folder name to singular form
        const singularizeHandler = (word) => {
            if (word.endsWith("ies")) return word.slice(0, -3) + "y";
            if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes")) return word.slice(0, -2);
            if (word.endsWith("s")) return word.slice(0, -1);

            return word;
        };

        // Find the src/ boundary and collect ancestor folders from src/ onwards
        const srcIndex = parts.indexOf("src");

        if (srcIndex === -1) return {};

        // Collect folders between src/ and the file itself
        const ancestorFolders = parts.slice(srcIndex + 1, parts.length - 1);

        if (ancestorFolders.length === 0) return {};

        // Check intermediate folder names for redundant suffixes
        const folderErrors = [];

        for (let i = 1; i < ancestorFolders.length; i++) {
            const folderName = ancestorFolders[i];

            for (let j = 0; j < i; j++) {
                const ancestorFolder = ancestorFolders[j];
                const singular = singularizeHandler(ancestorFolder);
                const suffix = `-${singular}`;

                if (folderName.endsWith(suffix)) {
                    folderErrors.push({
                        ancestorFolder,
                        folderName,
                        singular,
                        suffix,
                        suggestedName: folderName.slice(0, -suffix.length),
                    });
                }
            }
        }

        // Check if the file name matches the immediate parent folder name (e.g., input/input.tsx → should be input/index.tsx)
        let fileMatchesFolder = null;

        if (baseName !== "index" && ancestorFolders.length >= 2) {
            const immediateFolder = ancestorFolders[ancestorFolders.length - 1];

            if (baseName === immediateFolder) {
                fileMatchesFolder = immediateFolder;
            }
        }

        // Check if the file name ends with any ancestor folder name (singularized) — skip index files
        let fileRedundancy = null;

        if (baseName !== "index" && !fileMatchesFolder) {
            for (const folder of ancestorFolders) {
                const singular = singularizeHandler(folder);
                const suffix = `-${singular}`;

                if (baseName.endsWith(suffix)) {
                    fileRedundancy = { folder, singular, suffix };
                    break;
                }
            }
        }

        if (folderErrors.length === 0 && !fileRedundancy && !fileMatchesFolder) return {};

        return {
            Program(node) {
                for (const error of folderErrors) {
                    context.report({
                        message: `Folder name "${error.folderName}" has redundant suffix "${error.suffix}" — the "${error.ancestorFolder}/" ancestor folder already provides this context. Rename to "${error.suggestedName}".`,
                        node,
                    });
                }

                if (fileMatchesFolder) {
                    context.report({
                        message: `File name "${baseName}" is the same as its parent folder "${fileMatchesFolder}/". Use "index" instead (e.g., "${fileMatchesFolder}/index${fileWithExt.match(/\.\w+$/)[0]}").`,
                        node,
                    });
                }

                if (fileRedundancy) {
                    context.report({
                        message: `File name "${baseName}" has redundant suffix "${fileRedundancy.suffix}" — the "${fileRedundancy.folder}/" folder already provides this context. Rename to "${baseName.slice(0, -fileRedundancy.suffix.length)}".`,
                        node,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Disallow file and folder names that redundantly include the parent or ancestor folder name as a suffix" },
        fixable: null,
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Inline Type Definitions
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function parameters with inline union types should be extracted
 *   to a separate type file. This rule reports union types with
 *   more than a threshold number of members or exceeding a length limit.
 *
 * ✓ Good:
 *   // In types.ts:
 *   export type ButtonVariant = "primary" | "muted" | "danger";
 *
 *   // In Button.tsx:
 *   import { ButtonVariant } from "./types";
 *   export const Button = ({ variant }: { variant?: ButtonVariant }) => ...
 *
 * ✗ Bad:
 *   export const Button = ({ variant }: { variant?: "primary" | "muted" | "danger" }) => ...
 */
const noInlineTypeDefinitions = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxUnionMembers = options.maxUnionMembers ?? 2;
        const maxLength = options.maxLength ?? 50;

        // Built-in type keywords that don't need to be extracted
        const builtInTypeKeywords = new Set([
            "any",
            "bigint",
            "boolean",
            "never",
            "null",
            "number",
            "object",
            "string",
            "symbol",
            "undefined",
            "unknown",
            "void",
        ]);

        // Built-in type references (classes/interfaces that are built-in)
        const builtInTypeReferences = new Set([
            "Array",
            "BigInt",
            "Boolean",
            "Date",
            "Error",
            "Function",
            "Map",
            "Number",
            "Object",
            "Promise",
            "ReadonlyArray",
            "RegExp",
            "Set",
            "String",
            "Symbol",
            "WeakMap",
            "WeakSet",
        ]);

        // Check if a type node is a built-in type
        const isBuiltInTypeHandler = (node) => {
            if (!node) return false;

            // Keyword types: string, number, boolean, null, undefined, etc.
            if (node.type === "TSStringKeyword" || node.type === "TSNumberKeyword"
                || node.type === "TSBooleanKeyword" || node.type === "TSNullKeyword"
                || node.type === "TSUndefinedKeyword" || node.type === "TSVoidKeyword"
                || node.type === "TSAnyKeyword" || node.type === "TSUnknownKeyword"
                || node.type === "TSNeverKeyword" || node.type === "TSObjectKeyword"
                || node.type === "TSSymbolKeyword" || node.type === "TSBigIntKeyword") {
                return true;
            }

            // Type reference: Error, Promise, Array, etc.
            if (node.type === "TSTypeReference" && node.typeName) {
                const typeName = node.typeName.name || (node.typeName.type === "Identifier" && node.typeName.name);

                if (typeName && builtInTypeReferences.has(typeName)) {
                    return true;
                }
            }

            // Literal types: true, false, specific strings/numbers
            if (node.type === "TSLiteralType") {
                return true;
            }

            return false;
        };

        // Check if all members of a union are built-in types
        const isBuiltInUnionHandler = (unionNode) => {
            if (unionNode.type !== "TSUnionType") return false;

            return unionNode.types.every((type) => isBuiltInTypeHandler(type));
        };

        // Count union type members
        const countUnionMembersHandler = (node) => {
            if (node.type !== "TSUnionType") return 1;

            let count = 0;

            for (const type of node.types) {
                count += countUnionMembersHandler(type);
            }

            return count;
        };

        // Check if a type annotation contains a complex inline union
        const checkTypeAnnotationHandler = (typeNode, paramName) => {
            if (!typeNode) return;

            // Handle union types directly
            if (typeNode.type === "TSUnionType") {
                // Skip union types with only built-in types (e.g., string | null, Error | null)
                if (isBuiltInUnionHandler(typeNode)) return;

                const memberCount = countUnionMembersHandler(typeNode);
                const typeText = sourceCode.getText(typeNode);

                if (memberCount >= maxUnionMembers || typeText.length > maxLength) {
                    context.report({
                        message: `Inline union type with ${memberCount} members is too complex. Extract to a named type in a types file.`,
                        node: typeNode,
                    });
                }

                return;
            }

            // Handle intersection types (e.g., ButtonHTMLAttributes & { variant: "a" | "b" })
            if (typeNode.type === "TSIntersectionType") {
                for (const type of typeNode.types) {
                    checkTypeAnnotationHandler(type, paramName);
                }

                return;
            }

            // Handle object types with union properties
            if (typeNode.type === "TSTypeLiteral") {
                for (const member of typeNode.members) {
                    if (member.type === "TSPropertySignature" && member.typeAnnotation) {
                        const propType = member.typeAnnotation.typeAnnotation;
                        const propName = member.key && member.key.name ? member.key.name : "unknown";

                        if (propType && propType.type === "TSUnionType") {
                            const memberCount = countUnionMembersHandler(propType);
                            const typeText = sourceCode.getText(propType);

                            if (memberCount >= maxUnionMembers || typeText.length > maxLength) {
                                context.report({
                                    message: `Property "${propName}" has inline union type with ${memberCount} members. Extract to a named type in a types file.`,
                                    node: propType,
                                });
                            }
                        }
                    }
                }
            }
        };

        return {
            // Check function parameters
            ArrowFunctionExpression(node) {
                for (const param of node.params) {
                    if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const paramName = param.type === "Identifier" ? param.name : "param";

                        checkTypeAnnotationHandler(param.typeAnnotation.typeAnnotation, paramName);
                    }
                }
            },
            FunctionDeclaration(node) {
                for (const param of node.params) {
                    if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const paramName = param.type === "Identifier" ? param.name : "param";

                        checkTypeAnnotationHandler(param.typeAnnotation.typeAnnotation, paramName);
                    }
                }
            },
            FunctionExpression(node) {
                for (const param of node.params) {
                    if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const paramName = param.type === "Identifier" ? param.name : "param";

                        checkTypeAnnotationHandler(param.typeAnnotation.typeAnnotation, paramName);
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce extracting inline union types to named types in type files" },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxLength: {
                        default: 50,
                        description: "Maximum character length for inline union types (default: 50)",
                        minimum: 1,
                        type: "integer",
                    },
                    maxUnionMembers: {
                        default: 2,
                        description: "Maximum union members to keep inline (default: 2)",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/*
 * type-format
 *
 * Enforce consistent formatting for TypeScript type aliases:
 * - Type name must be PascalCase and end with "Type" suffix
 * - If object-like, properties must be in camelCase
 * - No empty lines between properties (for object types)
 * - Each property must end with comma (,) not semicolon (;)
 *
 * ✓ Good:
 *   export type UserType = {
 *       firstName: string,
 *       lastName: string,
 *   }
 *
 *   export type IdType = string | number;
 *
 * ✗ Bad:
 *   export type User = {             // Missing "Type" suffix
 *       first_name: string;          // snake_case and semicolon
 *   }
 */
const typeFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const minUnionMembersForMultiline = options.minUnionMembersForMultiline !== undefined ? options.minUnionMembersForMultiline : 5;

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        // Convert PascalCase/SCREAMING_SNAKE_CASE/snake_case to camelCase
        const toCamelCaseHandler = (name) => {
            // Handle SCREAMING_SNAKE_CASE (e.g., USER_NAME -> userName)
            if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle snake_case (e.g., user_name -> userName)
            if (/_/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle PascalCase (e.g., UserName -> userName)
            if (/^[A-Z]/.test(name)) {
                return name[0].toLowerCase() + name.slice(1);
            }

            return name;
        };

        const checkTypeLiteralHandler = (declarationNode, typeLiteralNode, members) => {
            if (members.length === 0) return;

            // Get indentation
            const typeLine = sourceCode.lines[declarationNode.loc.start.line - 1];
            const baseIndent = typeLine.match(/^\s*/)[0];
            const propIndent = baseIndent + "    ";

            // Get opening and closing braces
            const openBraceToken = sourceCode.getFirstToken(typeLiteralNode);
            const closeBraceToken = sourceCode.getLastToken(typeLiteralNode);

            // Check for empty line after opening brace
            const firstMember = members[0];

            if (firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBraceToken.range[1], firstMember.range[0]],
                        "\n" + propIndent,
                    ),
                    message: "No empty line after opening brace in type",
                    node: firstMember,
                });
            }

            // Check for empty line before closing brace
            const lastMember = members[members.length - 1];

            if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastMember.range[1], closeBraceToken.range[0]],
                        "\n" + baseIndent,
                    ),
                    message: "No empty line before closing brace in type",
                    node: lastMember,
                });
            }

            // For multiple members, first member should be on new line after opening brace
            if (members.length > 1 && firstMember.loc.start.line === openBraceToken.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBraceToken.range[1], firstMember.range[0]],
                        "\n" + propIndent,
                    ),
                    message: "First type property must be on a new line when there are multiple properties",
                    node: firstMember,
                });
            }

            members.forEach((member, index) => {
                // Check property name is camelCase
                if (member.type === "TSPropertySignature" && member.key && member.key.type === "Identifier") {
                    const propName = member.key.name;

                    if (!camelCaseRegex.test(propName)) {
                        const fixedName = toCamelCaseHandler(propName);

                        context.report({
                            fix: (fixer) => fixer.replaceText(member.key, fixedName),
                            message: `Type property "${propName}" must be camelCase. Use "${fixedName}" instead.`,
                            node: member.key,
                        });
                    }
                }

                // Collapse single-member nested object types to one line
                if (member.type === "TSPropertySignature" && member.typeAnnotation?.typeAnnotation?.type === "TSTypeLiteral") {
                    const nestedType = member.typeAnnotation.typeAnnotation;

                    if (nestedType.members && nestedType.members.length === 1) {
                        const nestedOpenBrace = sourceCode.getFirstToken(nestedType);
                        const nestedCloseBrace = sourceCode.getLastToken(nestedType);
                        const isNestedMultiLine = nestedOpenBrace.loc.end.line !== nestedCloseBrace.loc.start.line;

                        if (isNestedMultiLine) {
                            const nestedMember = nestedType.members[0];
                            let nestedMemberText = sourceCode.getText(nestedMember).trim();

                            // Remove trailing punctuation
                            if (nestedMemberText.endsWith(",") || nestedMemberText.endsWith(";")) {
                                nestedMemberText = nestedMemberText.slice(0, -1);
                            }

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [nestedOpenBrace.range[0], nestedCloseBrace.range[1]],
                                    `{ ${nestedMemberText} }`,
                                ),
                                message: "Single property nested object type should be on one line",
                                node: nestedType,
                            });
                        }
                    }
                }

                // Check for space before ? in optional properties
                if (member.type === "TSPropertySignature" && member.optional) {
                    const keyToken = sourceCode.getFirstToken(member);
                    const questionToken = sourceCode.getTokenAfter(keyToken);

                    if (questionToken && questionToken.value === "?") {
                        const textBetween = sourceCode.getText().slice(keyToken.range[1], questionToken.range[0]);

                        if (textBetween !== "") {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [keyToken.range[1], questionToken.range[0]],
                                    "",
                                ),
                                message: "No space allowed before \"?\" in optional property",
                                node: member,
                            });
                        }
                    }
                }

                // Check property ends with comma, not semicolon
                const memberText = sourceCode.getText(member);

                if (memberText.trimEnd().endsWith(";")) {
                    context.report({
                        fix(fixer) {
                            const lastChar = memberText.lastIndexOf(";");
                            const absolutePos = member.range[0] + lastChar;

                            return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                        },
                        message: "Type properties must end with comma (,) not semicolon (;)",
                        node: member,
                    });
                }

                // Check formatting for multiple members
                if (members.length > 1 && index > 0) {
                    const prevMember = members[index - 1];

                    // Check each is on its own line - with auto-fix
                    if (member.loc.start.line === prevMember.loc.end.line) {
                        context.report({
                            fix: (fixer) => {
                                let commaToken = sourceCode.getTokenAfter(prevMember);

                                while (commaToken && commaToken.value !== "," && commaToken.range[0] < member.range[0]) {
                                    commaToken = sourceCode.getTokenAfter(commaToken);
                                }

                                const insertPoint = commaToken && commaToken.value === "," ? commaToken.range[1] : prevMember.range[1];

                                return fixer.replaceTextRange(
                                    [insertPoint, member.range[0]],
                                    "\n" + propIndent,
                                );
                            },
                            message: "Each type property must be on its own line when there are multiple properties",
                            node: member,
                        });
                    }

                    // Check for empty lines between properties
                    if (member.loc.start.line - prevMember.loc.end.line > 1) {
                        context.report({
                            fix(fixer) {
                                const textBetween = sourceCode.getText().slice(
                                    prevMember.range[1],
                                    member.range[0],
                                );
                                const newText = textBetween.replace(/\n\s*\n/g, "\n");

                                return fixer.replaceTextRange(
                                    [prevMember.range[1], member.range[0]],
                                    newText,
                                );
                            },
                            message: "No empty lines allowed between type properties",
                            node: member,
                        });
                    }
                }
            });
        };

        // Handle inline type literals (in TSAsExpression) - single prop on one line, 2+ multiline
        const checkInlineTypeLiteralHandler = (typeLiteral, parentNode) => {
            const { members } = typeLiteral;

            if (members.length === 0) return;

            const openBrace = sourceCode.getFirstToken(typeLiteral);
            const closeBrace = sourceCode.getLastToken(typeLiteral);
            const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;

            // Single property: should be on one line without trailing comma
            if (members.length === 1) {
                const member = members[0];
                const memberText = sourceCode.getText(member);

                // Check for trailing comma in single property
                if (memberText.trimEnd().endsWith(",")) {
                    context.report({
                        fix: (fixer) => {
                            const lastComma = member.range[1] - 1;
                            const textBefore = sourceCode.getText().slice(member.range[0], member.range[1]);
                            const commaIndex = textBefore.lastIndexOf(",");

                            if (commaIndex !== -1) {
                                return fixer.removeRange([member.range[0] + commaIndex, member.range[0] + commaIndex + 1]);
                            }

                            return null;
                        },
                        message: "Single property inline type should not have trailing comma",
                        node: member,
                    });

                    return;
                }

                // If multiline with single property, collapse to single line
                if (isMultiLine) {
                    const typeText = `{ ${memberText.trim().replace(/,$/, "")} }`;

                    context.report({
                        fix: (fixer) => fixer.replaceText(typeLiteral, typeText),
                        message: "Single property inline type should be on one line",
                        node: typeLiteral,
                    });
                }

                return;
            }

            // 2+ properties: should be multiline with trailing comma
            if (!isMultiLine) {
                // Get proper indentation from the line where the type assertion starts
                const asKeyword = sourceCode.getTokenBefore(typeLiteral);
                const lineStart = sourceCode.getText().lastIndexOf("\n", asKeyword.range[0]) + 1;
                const lineText = sourceCode.getText().slice(lineStart, asKeyword.range[0]);
                const baseIndent = lineText.match(/^\s*/)[0];
                const propIndent = baseIndent + "        "; // 8 spaces for nested content

                const formattedMembers = members.map((m) => {
                    let text = sourceCode.getText(m).trim();

                    // Replace semicolon with comma
                    if (text.endsWith(";")) {
                        text = text.slice(0, -1) + ",";
                    } else if (!text.endsWith(",")) {
                        text += ",";
                    }

                    return propIndent + text;
                }).join("\n");

                const newText = `{\n${formattedMembers}\n${baseIndent}    }`;

                context.report({
                    fix: (fixer) => fixer.replaceText(typeLiteral, newText),
                    message: "Inline type with 2+ properties should be multiline with trailing commas",
                    node: typeLiteral,
                });

                return;
            }

            // Already multiline - check for semicolons, missing trailing commas, and empty lines between members
            members.forEach((member, index) => {
                const memberText = sourceCode.getText(member);

                // Check for semicolon (should be comma)
                if (memberText.trimEnd().endsWith(";")) {
                    const semicolonIndex = memberText.lastIndexOf(";");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [member.range[0] + semicolonIndex, member.range[0] + semicolonIndex + 1],
                            ",",
                        ),
                        message: "Type properties must end with comma (,) not semicolon (;)",
                        node: member,
                    });
                } else if (index === members.length - 1 && !memberText.trimEnd().endsWith(",")) {
                    // Last member needs trailing comma
                    context.report({
                        fix: (fixer) => fixer.insertTextAfter(member, ","),
                        message: "Last property in multiline inline type should have trailing comma",
                        node: member,
                    });
                }

                // Check for empty lines between members
                if (index < members.length - 1) {
                    const nextMember = members[index + 1];

                    if (nextMember.loc.start.line - member.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [member.range[1], nextMember.range[0]],
                                "\n" + " ".repeat(nextMember.loc.start.column),
                            ),
                            message: "No empty lines between type properties",
                            node: nextMember,
                        });
                    }
                }
            });

            // Check for empty lines after opening brace
            const firstMember = members[0];

            if (firstMember.loc.start.line - openBrace.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstMember.range[0]],
                        "\n" + " ".repeat(firstMember.loc.start.column),
                    ),
                    message: "No empty line after opening brace in inline type",
                    node: firstMember,
                });
            }

            // For 2+ members: first member should be on its own line (not on same line as opening brace)
            if (members.length >= 2 && openBrace.loc.end.line === firstMember.loc.start.line) {
                // Calculate indentation based on the closing brace position or parent
                const lastMember = members[members.length - 1];
                const propIndent = " ".repeat(lastMember.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstMember.range[0]],
                        "\n" + propIndent,
                    ),
                    message: "First property of multiline inline type should be on its own line",
                    node: firstMember,
                });
            }

            // Check for empty lines before closing brace
            const lastMember = members[members.length - 1];

            if (closeBrace.loc.start.line - lastMember.loc.end.line > 1) {
                const indent = " ".repeat(closeBrace.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastMember.range[1], closeBrace.range[0]],
                        "\n" + indent,
                    ),
                    message: "No empty line before closing brace in inline type",
                    node: closeBrace,
                });
            }

            // Check if closing brace is on same line as last member - should be on its own line for 2+ properties
            if (members.length >= 2 && closeBrace.loc.start.line === lastMember.loc.end.line) {
                // Get proper indentation - should match the opening brace's line
                const asToken = sourceCode.getTokenBefore(typeLiteral, (t) => t.value === "as");

                if (asToken) {
                    const lineStart = sourceCode.getText().lastIndexOf("\n", asToken.range[0]) + 1;
                    const lineText = sourceCode.getText().slice(lineStart, asToken.range[0]);
                    const baseIndent = lineText.match(/^\s*/)[0];

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBrace.range[0]],
                            "\n" + baseIndent + "    ",
                        ),
                        message: "Closing brace should be on its own line in multiline type literal",
                        node: closeBrace,
                    });
                }
            }
        };

        return {
            TSAsExpression(node) {
                // Handle type assertions like: state as { user: Type }
                const { typeAnnotation } = node;

                // Find the 'as' keyword token
                const asToken = sourceCode.getTokenBefore(typeAnnotation, (t) => t.value === "as");

                if (asToken && typeAnnotation) {
                    const firstTypeToken = sourceCode.getFirstToken(typeAnnotation);
                    const textAfterAs = sourceCode.text.slice(asToken.range[1], firstTypeToken.range[0]);

                    // Check for proper spacing: should be exactly " " (single space)
                    // Also check that opening brace is on same line as "as"
                    if (firstTypeToken.value === "{") {
                        // For object type literal: as {
                        if (textAfterAs !== " ") {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([asToken.range[1], firstTypeToken.range[0]], " "),
                                message: "Type assertion should have exactly one space after 'as' and opening brace on same line",
                                node: firstTypeToken,
                            });
                        }
                    } else if (asToken.loc.end.line !== firstTypeToken.loc.start.line) {
                        // For other types, ensure same line
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange([asToken.range[1], firstTypeToken.range[0]], " "),
                            message: "Type should be on same line as 'as' keyword",
                            node: firstTypeToken,
                        });
                    }
                }

                if (typeAnnotation && typeAnnotation.type === "TSTypeLiteral") {
                    checkInlineTypeLiteralHandler(typeAnnotation, node);
                }
            },
            TSTypeAliasDeclaration(node) {
                const typeName = node.id.name;

                // Check type name is PascalCase and ends with Type
                if (!pascalCaseRegex.test(typeName)) {
                    context.report({
                        message: `Type name "${typeName}" must be PascalCase`,
                        node: node.id,
                    });
                } else if (!typeName.endsWith("Type")) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceText(node.id, `${typeName}Type`);
                        },
                        message: `Type name "${typeName}" must end with "Type" suffix. Use "${typeName}Type" instead of "${typeName}"`,
                        node: node.id,
                    });
                }

                // Check if it's an object type (TSTypeLiteral)
                if (node.typeAnnotation && node.typeAnnotation.type === "TSTypeLiteral") {
                    // Get opening brace of the type literal
                    const openBraceToken = sourceCode.getFirstToken(node.typeAnnotation);

                    // Check opening brace is on same line as type name (or = sign)
                    if (openBraceToken && openBraceToken.loc.start.line !== node.id.loc.end.line) {
                        context.report({
                            fix: (fixer) => {
                                const equalToken = sourceCode.getTokenAfter(node.id);

                                return fixer.replaceTextRange(
                                    [equalToken.range[1], openBraceToken.range[0]],
                                    " ",
                                );
                            },
                            message: "Opening brace must be on the same line as type name",
                            node: openBraceToken,
                        });
                    }

                    checkTypeLiteralHandler(node, node.typeAnnotation, node.typeAnnotation.members);
                }

                // Also check intersection types that contain object types
                if (node.typeAnnotation && node.typeAnnotation.type === "TSIntersectionType") {
                    node.typeAnnotation.types.forEach((type) => {
                        if (type.type === "TSTypeLiteral") {
                            checkTypeLiteralHandler(node, type, type.members);
                        }
                    });
                }

                // Check union types formatting (e.g., "a" | "b" | "c")
                if (node.typeAnnotation && node.typeAnnotation.type === "TSUnionType") {
                    const unionType = node.typeAnnotation;
                    const types = unionType.types;
                    const minMembersForMultiline = minUnionMembersForMultiline;

                    // Get line info
                    const typeLine = sourceCode.lines[node.loc.start.line - 1];
                    const baseIndent = typeLine.match(/^\s*/)[0];
                    const memberIndent = baseIndent + "    ";

                    // Get the = token
                    const equalToken = sourceCode.getTokenAfter(node.id);
                    const firstType = types[0];
                    const lastType = types[types.length - 1];

                    // Check if currently on single line
                    const isCurrentlySingleLine = firstType.loc.start.line === lastType.loc.end.line &&
                        equalToken.loc.end.line === firstType.loc.start.line;

                    // Check if currently properly multiline (= on its own conceptually, first type on new line)
                    const isFirstTypeOnNewLine = firstType.loc.start.line > equalToken.loc.end.line;

                    if (types.length >= minMembersForMultiline) {
                        // Should be multiline format
                        // Check if needs reformatting
                        let needsReformat = false;

                        // Check if first type is on new line after =
                        if (!isFirstTypeOnNewLine) {
                            needsReformat = true;
                        }

                        // Check if each type is on its own line
                        if (!needsReformat) {
                            for (let i = 1; i < types.length; i++) {
                                if (types[i].loc.start.line === types[i - 1].loc.end.line) {
                                    needsReformat = true;
                                    break;
                                }
                            }
                        }

                        // Check proper indentation and | placement
                        if (!needsReformat) {
                            for (let i = 1; i < types.length; i++) {
                                const pipeToken = sourceCode.getTokenBefore(types[i]);

                                if (pipeToken && pipeToken.value === "|") {
                                    // | should be at start of line (after indent)
                                    if (pipeToken.loc.start.line !== types[i].loc.start.line) {
                                        needsReformat = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (needsReformat) {
                            // Build the correct multiline format
                            const formattedTypes = types.map((type, index) => {
                                const typeText = sourceCode.getText(type);

                                if (index === 0) {
                                    return memberIndent + typeText;
                                }

                                return memberIndent + "| " + typeText;
                            }).join("\n");

                            const newTypeText = `= \n${formattedTypes}`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [equalToken.range[0], lastType.range[1]],
                                    newTypeText,
                                ),
                                message: `Union type with ${types.length} members should be multiline with each member on its own line`,
                                node: unionType,
                            });
                        }
                    } else {
                        // Should be single line format (less than 5 members)
                        if (!isCurrentlySingleLine) {
                            // Build single line format
                            const typeTexts = types.map((type) => sourceCode.getText(type));
                            const singleLineText = `= ${typeTexts.join(" | ")}`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [equalToken.range[0], lastType.range[1]],
                                    singleLineText,
                                ),
                                message: `Union type with ${types.length} members should be on a single line`,
                                node: unionType,
                            });
                        }
                    }
                }
            },
            // Handle inline type literals (e.g., in function parameters)
            TSTypeLiteral(node) {
                // Skip if already handled by TSTypeAliasDeclaration or TSAsExpression
                if (node.parent?.type === "TSTypeAliasDeclaration") return;
                if (node.parent?.type === "TSAsExpression") return;

                // Check for single-member nested object types that should be collapsed
                if (node.members) {
                    node.members.forEach((member) => {
                        if (member.type === "TSPropertySignature" && member.typeAnnotation?.typeAnnotation?.type === "TSTypeLiteral") {
                            const nestedType = member.typeAnnotation.typeAnnotation;

                            if (nestedType.members && nestedType.members.length === 1) {
                                const nestedOpenBrace = sourceCode.getFirstToken(nestedType);
                                const nestedCloseBrace = sourceCode.getLastToken(nestedType);
                                const isNestedMultiLine = nestedOpenBrace.loc.end.line !== nestedCloseBrace.loc.start.line;

                                if (isNestedMultiLine) {
                                    const nestedMember = nestedType.members[0];
                                    let nestedMemberText = sourceCode.getText(nestedMember).trim();

                                    // Remove trailing punctuation
                                    if (nestedMemberText.endsWith(",") || nestedMemberText.endsWith(";")) {
                                        nestedMemberText = nestedMemberText.slice(0, -1);
                                    }

                                    context.report({
                                        fix: (fixer) => fixer.replaceTextRange(
                                            [nestedOpenBrace.range[0], nestedCloseBrace.range[1]],
                                            `{ ${nestedMemberText} }`,
                                        ),
                                        message: "Single property nested object type should be on one line",
                                        node: nestedType,
                                    });
                                }
                            }
                        }
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce type naming (PascalCase + Type suffix), camelCase properties, proper formatting, union type formatting, and trailing commas" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    minUnionMembersForMultiline: {
                        default: 5,
                        description: "Minimum number of union members to require multiline format",
                        minimum: 2,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Type Annotation Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces proper spacing in TypeScript type annotations:
 *   - No space before colon in type annotations
 *   - Type should be on same line as colon
 *   - No spaces inside generic type parameters
 *
 * ✓ Good:
 *   const x: Type = value;
 *   const arr: ColumnDef<T>[] = [];
 *
 * ✗ Bad:
 *   const x : Type = value;
 *   const x:
 *       Type = value;
 *   const arr: ColumnDef< T >[] = [];
 */
const typeAnnotationSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ArrowFunctionExpression(node) {
                // Check for space after async keyword: async() => -> async () =>
                if (node.async) {
                    const asyncToken = sourceCode.getFirstToken(node, (t) => t.value === "async");
                    const openParen = sourceCode.getTokenAfter(asyncToken, (t) => t.value === "(");

                    if (asyncToken && openParen) {
                        const textBetween = sourceCode.text.slice(asyncToken.range[1], openParen.range[0]);

                        // Should have exactly one space after async
                        if (textBetween === "") {
                            context.report({
                                fix: (fixer) => fixer.insertTextAfter(asyncToken, " "),
                                message: "Missing space after async keyword",
                                node: asyncToken,
                            });
                        } else if (textBetween !== " " && !textBetween.includes("\n")) {
                            // Has extra spaces but not newline
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([asyncToken.range[1], openParen.range[0]], " "),
                                message: "Should have exactly one space after async keyword",
                                node: asyncToken,
                            });
                        }
                    }
                }
            },
            FunctionExpression(node) {
                // Check for space after async keyword in function expressions: async function() -> async function ()
                if (node.async) {
                    const asyncToken = sourceCode.getFirstToken(node, (t) => t.value === "async");
                    const functionToken = sourceCode.getTokenAfter(asyncToken, (t) => t.value === "function");

                    if (functionToken) {
                        const openParen = sourceCode.getTokenAfter(functionToken, (t) => t.value === "(");

                        if (openParen) {
                            const textBetween = sourceCode.text.slice(functionToken.range[1], openParen.range[0]);

                            // Should have exactly one space after function keyword
                            if (textBetween === "") {
                                context.report({
                                    fix: (fixer) => fixer.insertTextAfter(functionToken, " "),
                                    message: "Missing space after function keyword",
                                    node: functionToken,
                                });
                            }
                        }
                    }
                }
            },
            TSArrayType(node) {
                // Check for space before [] like: Type []
                const elementType = node.elementType;
                const openBracket = sourceCode.getTokenAfter(elementType, (t) => t.value === "[");

                if (openBracket) {
                    const textBetween = sourceCode.text.slice(elementType.range[1], openBracket.range[0]);

                    if (textBetween !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([elementType.range[1], openBracket.range[0]]),
                            message: "No space allowed before [] in array type",
                            node: openBracket,
                        });
                    }
                }
            },
            TSTypeReference(node) {
                // Check for space before generic < like: ColumnDef <T>
                if (node.typeArguments || node.typeParameters) {
                    const typeArgs = node.typeArguments || node.typeParameters;
                    const openAngle = sourceCode.getFirstToken(typeArgs);

                    if (openAngle && openAngle.value === "<") {
                        const tokenBefore = sourceCode.getTokenBefore(openAngle);

                        if (tokenBefore) {
                            const textBetween = sourceCode.text.slice(tokenBefore.range[1], openAngle.range[0]);

                            if (textBetween !== "") {
                                context.report({
                                    fix: (fixer) => fixer.removeRange([tokenBefore.range[1], openAngle.range[0]]),
                                    message: "No space allowed before < in generic type",
                                    node: openAngle,
                                });
                            }
                        }
                    }
                }
            },
            TSTypeAnnotation(node) {
                const colonToken = sourceCode.getFirstToken(node);

                if (!colonToken || colonToken.value !== ":") return;

                // Check for space before colon
                const tokenBeforeColon = sourceCode.getTokenBefore(colonToken);

                if (tokenBeforeColon) {
                    const textBetween = sourceCode.getText().slice(
                        tokenBeforeColon.range[1],
                        colonToken.range[0],
                    );

                    if (textBetween !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([tokenBeforeColon.range[1], colonToken.range[0]]),
                            message: "No space allowed before colon in type annotation",
                            node: colonToken,
                        });

                        return;
                    }
                }

                // Check for missing space after colon
                const typeNode = node.typeAnnotation;

                if (typeNode) {
                    const textAfterColon = sourceCode.text.slice(colonToken.range[1], typeNode.range[0]);

                    // Should have exactly one space after colon
                    if (textAfterColon === "") {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(colonToken, " "),
                            message: "Missing space after colon in type annotation",
                            node: colonToken,
                        });

                        return;
                    }
                }

                // Check if type is on same line as colon
                if (typeNode && colonToken.loc.end.line !== typeNode.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], typeNode.range[0]],
                            " ",
                        ),
                        message: "Type should be on the same line as colon in type annotation",
                        node: typeNode,
                    });
                }
            },
            TSTypeParameterInstantiation(node) {
                // Check for spaces inside generics like ColumnDef< T >
                const openBracket = sourceCode.getFirstToken(node);
                const closeBracket = sourceCode.getLastToken(node);

                if (!openBracket || !closeBracket) return;

                if (openBracket.value !== "<" || closeBracket.value !== ">") return;

                // Check for space after <
                const firstParam = node.params[0];

                if (firstParam) {
                    const textAfterOpen = sourceCode.getText().slice(
                        openBracket.range[1],
                        firstParam.range[0],
                    );

                    if (textAfterOpen.trim() === "" && textAfterOpen !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([openBracket.range[1], firstParam.range[0]]),
                            message: "No space allowed after < in generic type",
                            node: openBracket,
                        });
                    }
                }

                // Check for space before >
                const lastParam = node.params[node.params.length - 1];

                if (lastParam) {
                    const textBeforeClose = sourceCode.getText().slice(
                        lastParam.range[1],
                        closeBracket.range[0],
                    );

                    if (textBeforeClose.trim() === "" && textBeforeClose !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([lastParam.range[1], closeBracket.range[0]]),
                            message: "No space allowed before > in generic type",
                            node: closeBracket,
                        });
                    }
                }

                // Check for formatting inside type literal params
                node.params.forEach((param) => {
                    if (param.type === "TSTypeLiteral" && param.members && param.members.length > 0) {
                        const typeOpenBrace = sourceCode.getFirstToken(param);
                        const typeCloseBrace = sourceCode.getLastToken(param);

                        if (!typeOpenBrace || !typeCloseBrace) return;
                        if (typeOpenBrace.value !== "{" || typeCloseBrace.value !== "}") return;

                        const members = param.members;
                        const isMultiLine = typeOpenBrace.loc.start.line !== typeCloseBrace.loc.end.line;

                        // Single property type literal should be on one line without trailing punctuation
                        if (members.length === 1) {
                            const member = members[0];
                            let memberText = sourceCode.getText(member).trim();
                            const originalText = memberText;

                            // Remove trailing comma or semicolon for single property
                            if (memberText.endsWith(",") || memberText.endsWith(";")) {
                                memberText = memberText.slice(0, -1);
                            }

                            if (isMultiLine) {
                                const newText = `{ ${memberText} }`;

                                context.report({
                                    fix: (fixer) => fixer.replaceText(param, newText),
                                    message: "Single property generic type literal should be on one line",
                                    node: param,
                                });

                                return;
                            }

                            // Single line but has trailing comma - remove it
                            if (originalText.endsWith(",") || originalText.endsWith(";")) {
                                const newText = `{ ${memberText} }`;

                                context.report({
                                    fix: (fixer) => fixer.replaceText(param, newText),
                                    message: "Single property generic type literal should not have trailing punctuation",
                                    node: param,
                                });
                            }

                            return; // Skip other checks for single property
                        }

                        // 2+ properties: should be multiline
                        if (!isMultiLine) {
                            // Get indentation from the line where the generic starts
                            const lineStart = sourceCode.getText().lastIndexOf("\n", node.range[0]) + 1;
                            const lineText = sourceCode.getText().slice(lineStart, node.range[0]);
                            const baseIndent = lineText.match(/^\s*/)[0];
                            const propIndent = baseIndent + "    ";

                            const formattedMembers = members.map((m) => {
                                let text = sourceCode.getText(m).trim();

                                // Replace semicolon with comma
                                if (text.endsWith(";")) {
                                    text = text.slice(0, -1) + ",";
                                } else if (!text.endsWith(",")) {
                                    text += ",";
                                }

                                return propIndent + text;
                            }).join("\n");

                            const newText = `{\n${formattedMembers}\n${baseIndent}}`;

                            context.report({
                                fix: (fixer) => fixer.replaceText(param, newText),
                                message: "Generic type literal with 2+ properties should be multiline",
                                node: param,
                            });

                            return;
                        }

                        const firstMember = members[0];
                        const lastMember = members[members.length - 1];

                        // Check for empty line after opening brace
                        if (firstMember && typeOpenBrace.loc.end.line < firstMember.loc.start.line - 1) {
                            context.report({
                                fix: (fixer) => {
                                    const textAfterBrace = sourceCode.text.slice(typeOpenBrace.range[1], firstMember.range[0]);
                                    const newText = textAfterBrace.replace(/\n\s*\n/, "\n");

                                    return fixer.replaceTextRange([typeOpenBrace.range[1], firstMember.range[0]], newText);
                                },
                                message: "No empty line allowed after opening brace in generic type literal",
                                node: typeOpenBrace,
                            });
                        }

                        // Check for empty line before closing brace
                        if (lastMember && lastMember.loc.end.line < typeCloseBrace.loc.start.line - 1) {
                            context.report({
                                fix: (fixer) => {
                                    const textBeforeBrace = sourceCode.text.slice(lastMember.range[1], typeCloseBrace.range[0]);
                                    const newText = textBeforeBrace.replace(/\n\s*\n/, "\n");

                                    return fixer.replaceTextRange([lastMember.range[1], typeCloseBrace.range[0]], newText);
                                },
                                message: "No empty line allowed before closing brace in generic type literal",
                                node: typeCloseBrace,
                            });
                        }

                        // Check for semicolons, missing trailing commas, and empty lines between members
                        members.forEach((member, index) => {
                            const memberText = sourceCode.getText(member);

                            // Check for semicolon (should be comma)
                            if (memberText.trimEnd().endsWith(";")) {
                                const semicolonIndex = memberText.lastIndexOf(";");

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [member.range[0] + semicolonIndex, member.range[0] + semicolonIndex + 1],
                                        ",",
                                    ),
                                    message: "Type properties must end with comma (,) not semicolon (;)",
                                    node: member,
                                });
                            } else if (index === members.length - 1 && !memberText.trimEnd().endsWith(",")) {
                                // Last member needs trailing comma
                                context.report({
                                    fix: (fixer) => fixer.insertTextAfter(member, ","),
                                    message: "Last property in generic type literal should have trailing comma",
                                    node: member,
                                });
                            }

                            // Check for empty lines between members
                            if (index < members.length - 1) {
                                const nextMember = members[index + 1];

                                if (nextMember.loc.start.line - member.loc.end.line > 1) {
                                    context.report({
                                        fix: (fixer) => fixer.replaceTextRange(
                                            [member.range[1], nextMember.range[0]],
                                            "\n" + " ".repeat(nextMember.loc.start.column),
                                        ),
                                        message: "No empty lines between type properties in generic",
                                        node: nextMember,
                                    });
                                }
                            }
                        });
                    }
                });

                // Check for }>( pattern - closing > should be followed by ( on same line with no space
                const parent = node.parent;

                if (parent && parent.type === "CallExpression" && parent.typeArguments === node) {
                    const args = parent.arguments;

                    if (args && args.length > 0) {
                        const openParen = sourceCode.getTokenAfter(closeBracket, (t) => t.value === "(");

                        if (openParen) {
                            // Check if > and ( are on same line
                            if (closeBracket.loc.end.line !== openParen.loc.start.line) {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange([closeBracket.range[1], openParen.range[0]], ""),
                                    message: "Opening parenthesis should be on same line as closing > in generic call",
                                    node: openParen,
                                });
                            }

                            // Check for >({ pattern with first argument - ONLY for single argument calls
                            // Multi-argument calls (like hooks) should have ) on its own line
                            if (args.length === 1) {
                                const firstArg = args[0];

                                if (firstArg && (firstArg.type === "ObjectExpression" || firstArg.type === "ArrayExpression")) {
                                    const firstArgFirstToken = sourceCode.getFirstToken(firstArg);

                                    if (firstArgFirstToken && openParen.loc.end.line !== firstArgFirstToken.loc.start.line) {
                                        context.report({
                                            fix: (fixer) => fixer.replaceTextRange([openParen.range[1], firstArgFirstToken.range[0]], ""),
                                            message: "First argument should be on same line as opening parenthesis in generic call",
                                            node: firstArg,
                                        });
                                    }

                                    // Check for },\n); pattern - closing } should be followed by ); on same line
                                    const lastArgLastToken = sourceCode.getLastToken(firstArg);
                                    const closeParen = sourceCode.getTokenAfter(firstArg, (t) => t.value === ")");

                                    if (lastArgLastToken && closeParen) {
                                        const textBetween = sourceCode.text.slice(lastArgLastToken.range[1], closeParen.range[0]);

                                        // Check if there's a newline between } and )
                                        if (textBetween.includes("\n")) {
                                            // Should be }); or }, with ) on same line
                                            const hasTrailingComma = textBetween.trim() === ",";

                                            context.report({
                                                fix: (fixer) => {
                                                    if (hasTrailingComma) {
                                                        // Remove the trailing comma and newline: },\n) -> )
                                                        return fixer.replaceTextRange([lastArgLastToken.range[1], closeParen.range[0]], "");
                                                    }

                                                    // Just remove the newline
                                                    return fixer.replaceTextRange([lastArgLastToken.range[1], closeParen.range[0]], "");

                                                },
                                                message: "Closing parenthesis should be on same line as closing brace in generic call",
                                                node: closeParen,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            VariableDeclaration(node) {
                // Check for semicolon on next line: const x = fn()\n;
                const lastToken = sourceCode.getLastToken(node);

                if (lastToken && lastToken.value === ";") {
                    // Get the token before the semicolon
                    const tokenBeforeSemi = sourceCode.getTokenBefore(lastToken);

                    if (tokenBeforeSemi && lastToken.loc.start.line > tokenBeforeSemi.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeSemi.range[1], lastToken.range[1]],
                                ";",
                            ),
                            message: "Semicolon should be on the same line as statement",
                            node: lastToken,
                        });
                    }
                }
            },
            TSFunctionType(node) {
                // Check for space after => in function types: () =>void -> () => void
                // Find the arrow token by searching all tokens in the node
                const tokens = sourceCode.getTokens(node);
                const arrowToken = tokens.find((t) => t.value === "=>");

                if (arrowToken) {
                    const nextToken = sourceCode.getTokenAfter(arrowToken);

                    if (nextToken) {
                        const textAfterArrow = sourceCode.text.slice(arrowToken.range[1], nextToken.range[0]);

                        // Should have exactly one space after =>
                        if (textAfterArrow === "") {
                            context.report({
                                fix: (fixer) => fixer.insertTextAfter(arrowToken, " "),
                                message: "Missing space after => in function type",
                                node: arrowToken,
                            });
                        } else if (textAfterArrow !== " " && !textAfterArrow.includes("\n")) {
                            // Has extra spaces but not newline
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([arrowToken.range[1], nextToken.range[0]], " "),
                                message: "Should have exactly one space after => in function type",
                                node: arrowToken,
                            });
                        }
                    }
                }

                // Check function type params formatting
                // - 3+ params should be multiline
                // - 0-2 params should be on one line
                const params = node.params;
                const openParen = tokens.find((t) => t.value === "(");

                if (openParen && arrowToken) {
                    const closeParen = sourceCode.getTokenBefore(arrowToken, (t) => t.value === ")");

                    if (closeParen) {
                        const isMultiLine = openParen.loc.start.line !== closeParen.loc.end.line;

                        if (params && params.length >= 3 && !isMultiLine) {
                            // 3+ params on one line - expand to multiple lines
                            const lineStart = sourceCode.text.lastIndexOf("\n", node.range[0]) + 1;
                            const lineText = sourceCode.text.slice(lineStart, node.range[0]);
                            const match = lineText.match(/^(\s*)/);
                            const baseIndent = match ? match[1] : "";
                            const paramIndent = baseIndent + "    ";

                            const formattedParams = params.map((p) => {
                                const paramText = sourceCode.getText(p);

                                return paramIndent + paramText;
                            }).join(",\n");

                            const newParamsText = `(\n${formattedParams},\n${baseIndent})`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([openParen.range[0], closeParen.range[1]], newParamsText),
                                message: "Function type with 3+ parameters should have each parameter on its own line",
                                node,
                            });
                        } else if (params && params.length <= 2 && isMultiLine) {
                            // 0-2 params on multiple lines - collapse to one line
                            const formattedParams = params.map((p) => sourceCode.getText(p).trim()).join(", ");
                            const newParamsText = `(${formattedParams})`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([openParen.range[0], closeParen.range[1]], newParamsText),
                                message: "Function type with 2 or fewer parameters should be on one line",
                                node,
                            });
                        }
                    }
                }
            },
            VariableDeclarator(node) {
                // Check for space before generic like: ColumnDef <T>
                if (node.id && node.id.typeAnnotation) {
                    const typeNode = node.id.typeAnnotation.typeAnnotation;

                    if (typeNode && typeNode.type === "TSTypeReference" && typeNode.typeArguments) {
                        const typeName = typeNode.typeName;
                        const typeArgs = typeNode.typeArguments;
                        const textBetween = sourceCode.getText().slice(
                            typeName.range[1],
                            typeArgs.range[0],
                        );

                        if (textBetween !== "") {
                            context.report({
                                fix: (fixer) => fixer.removeRange([typeName.range[1], typeArgs.range[0]]),
                                message: "No space allowed between type name and generic parameters",
                                node: typeArgs,
                            });
                        }
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce proper spacing in TypeScript type annotations" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: React Code Order
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces a consistent ordering of code blocks in React components
 *   and custom hooks. The order follows a logical dependency chain
 *   where declarations appear before their usage.
 *
 * Order (top to bottom):
 *   1. Props/params destructure (from function parameters)
 *   2. Destructured variables from props (const { x } = propValue)
 *   3. useRef declarations
 *   4. useState declarations
 *   5. useReducer declarations
 *   6. useSelector / useDispatch (Redux)
 *   7. Router hooks (useNavigate, useLocation, useParams, useSearchParams)
 *   8. Context hooks (useContext, useToast, etc.)
 *   9. Custom hooks (use* pattern)
 *   10. Derived state / computed variables (const x = hookValue.something)
 *   11. useMemo declarations
 *   12. useCallback declarations
 *   13. Handler functions (const x = () => {} or function declarations)
 *   14. useEffect / useLayoutEffect
 *   15. Return statement
 *
 * ✓ Good (Component):
 *   const MyComponent = ({ name }) => {
 *       const inputRef = useRef(null);
 *       const [count, setCount] = useState(0);
 *       const dispatch = useDispatch();
 *       const navigate = useNavigate();
 *       const { data } = useCustomHook();
 *       const computedValue = data?.value ?? 0;
 *       const memoizedValue = useMemo(() => ..., []);
 *       const handleClick = useCallback(() => ..., []);
 *       const submitHandler = () => { ... };
 *       useEffect(() => { ... }, []);
 *       return <div>...</div>;
 *   };
 *
 * ✓ Good (Custom Hook):
 *   const useCreateAccount = () => {
 *       const [loading, setLoading] = useState(false);
 *       const [created, setCreated] = useState(false);
 *       const dispatch = useDispatch();
 *       const { toast } = useToast();
 *       const createAccountHandler = async (data) => { ... };
 *       useEffect(() => { ... }, []);
 *       return { createAccountHandler, created, loading };
 *   };
 *
 * ✗ Bad:
 *   const useCreateAccount = () => {
 *       const { toast } = useToast();          // context hook before useState
 *       const [loading, setLoading] = useState(false);
 *       return { loading };
 *   };
 */
const reactCodeOrder = {
    create(context) {
        // Define the order categories
        const ORDER = {
            CALLBACK: 12,
            CONTEXT_HOOK: 8,
            CUSTOM_HOOK: 9,
            DERIVED_STATE: 10,
            EFFECT: 14,
            HANDLER_FUNCTION: 13,
            MEMO: 11,
            PROPS_DESTRUCTURE: 1,
            PROPS_DESTRUCTURE_BODY: 2,
            REDUCER: 5,
            REF: 3,
            RETURN: 15,
            ROUTER_HOOK: 7,
            SELECTOR_DISPATCH: 6,
            STATE: 4,
            UNKNOWN: 99,
        };

        const ORDER_NAMES = {
            1: "props destructure",
            2: "destructured variables from props",
            3: "useRef",
            4: "useState",
            5: "useReducer",
            6: "useSelector/useDispatch",
            7: "router hooks",
            8: "context hooks",
            9: "custom hooks",
            10: "derived state/computed variables",
            11: "useMemo",
            12: "useCallback",
            13: "handler functions",
            14: "useEffect/useLayoutEffect",
            15: "return statement",
            99: "unknown",
        };

        // Built-in React hooks
        const STATE_HOOKS = new Set(["useState"]);
        const REF_HOOKS = new Set(["useRef"]);
        const REDUCER_HOOKS = new Set(["useReducer"]);
        const EFFECT_HOOKS = new Set(["useEffect", "useLayoutEffect"]);
        const MEMO_HOOKS = new Set(["useMemo"]);
        const CALLBACK_HOOKS = new Set(["useCallback"]);

        // Redux hooks
        const REDUX_HOOKS = new Set(["useSelector", "useDispatch", "useStore"]);

        // Router hooks (react-router, next/navigation, etc.)
        const ROUTER_HOOKS = new Set([
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "useRouter",
            "usePathname",
            "useMatch",
            "useMatches",
            "useRouteLoaderData",
            "useNavigation",
            "useResolvedPath",
            "useHref",
            "useInRouterContext",
            "useNavigationType",
            "useOutlet",
            "useOutletContext",
            "useRouteError",
            "useRoutes",
            "useBlocker",
        ]);

        // Common context hooks
        const CONTEXT_HOOKS = new Set([
            "useContext",
            "useToast",
            "useTheme",
            "useAuth",
            "useModal",
            "useDialog",
            "useNotification",
            "useI18n",
            "useTranslation",
            "useIntl",
            "useForm",
            "useFormContext",
        ]);

        const containsJsxHandler = (node) => {
            if (!node) return false;

            if (node.type === "JSXElement" || node.type === "JSXFragment") return true;

            if (node.type === "BlockStatement") {
                for (const statement of node.body) {
                    if (statement.type === "ReturnStatement" && statement.argument) {
                        if (containsJsxHandler(statement.argument)) return true;
                    }
                }
            }

            if (node.type === "ConditionalExpression") {
                return containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);
            }

            if (node.type === "LogicalExpression") {
                return containsJsxHandler(node.left) || containsJsxHandler(node.right);
            }

            if (node.type === "ParenthesizedExpression") {
                return containsJsxHandler(node.expression);
            }

            return false;
        };

        // Get the function name from a node
        const getFunctionNameHandler = (node) => {
            if (node.parent) {
                if (node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    return node.parent.id.name;
                }

                if (node.id && node.id.type === "Identifier") {
                    return node.id.name;
                }
            }

            return null;
        };

        const isReactComponentHandler = (node) => {
            const componentName = getFunctionNameHandler(node);

            if (componentName && /^[A-Z]/.test(componentName)) {
                const body = node.body;

                return containsJsxHandler(body);
            }

            return false;
        };

        // Check if function is a custom hook (starts with "use" followed by uppercase)
        const isCustomHookHandler = (node) => {
            const hookName = getFunctionNameHandler(node);

            if (hookName && /^use[A-Z]/.test(hookName)) {
                // Must have a block body (not implicit return)
                if (node.body.type !== "BlockStatement") return false;

                // Should not return JSX (that would make it a component)
                if (containsJsxHandler(node.body)) return false;

                return true;
            }

            return false;
        };

        // Get the hook name from a call expression
        const getHookNameHandler = (node) => {
            if (node.type !== "CallExpression") return null;

            if (node.callee.type === "Identifier") {
                return node.callee.name;
            }

            // Handle cases like React.useState
            if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
                return node.callee.property.name;
            }

            return null;
        };

        // Check if a call expression is a hook call (starts with "use")
        const isHookCallHandler = (node) => {
            const name = getHookNameHandler(node);

            return name && /^use[A-Z]/.test(name);
        };

        // Check if expression is a function (arrow or regular)
        const isFunctionExpressionHandler = (node) => node
            && (node.type === "ArrowFunctionExpression"
            || node.type === "FunctionExpression");

        // Check if a statement is a handler function declaration
        const isHandlerFunctionHandler = (statement) => {
            // Arrow function assigned to variable: const x = () => {}
            if (statement.type === "VariableDeclaration") {
                const decl = statement.declarations[0];

                if (decl && decl.init && isFunctionExpressionHandler(decl.init)) {
                    // Make sure it's not a hook-assigned function
                    if (decl.init.type === "CallExpression") return false;

                    return true;
                }
            }

            // Function declaration: function x() {}
            if (statement.type === "FunctionDeclaration") {
                return true;
            }

            return false;
        };

        // Get the category of a statement
        const getStatementCategoryHandler = (statement, propNames = new Set()) => {
            // Return statement
            if (statement.type === "ReturnStatement") {
                return ORDER.RETURN;
            }

            // Expression statements (mostly hook calls like useEffect)
            if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
                const hookName = getHookNameHandler(statement.expression);

                if (hookName) {
                    if (EFFECT_HOOKS.has(hookName)) return ORDER.EFFECT;

                    // Other standalone hook calls (rare but possible)
                    if (isHookCallHandler(statement.expression)) return ORDER.CUSTOM_HOOK;
                }

                return ORDER.UNKNOWN;
            }

            // Variable declarations
            if (statement.type === "VariableDeclaration") {
                const declarations = statement.declarations;

                // Check if any declaration is a hook call
                for (const decl of declarations) {
                    if (!decl.init) continue;

                    // Direct hook call: const x = useHook()
                    if (decl.init.type === "CallExpression") {
                        const hookName = getHookNameHandler(decl.init);

                        if (hookName) {
                            if (STATE_HOOKS.has(hookName)) return ORDER.STATE;
                            if (REF_HOOKS.has(hookName)) return ORDER.REF;
                            if (REDUCER_HOOKS.has(hookName)) return ORDER.REDUCER;
                            if (REDUX_HOOKS.has(hookName)) return ORDER.SELECTOR_DISPATCH;
                            if (ROUTER_HOOKS.has(hookName)) return ORDER.ROUTER_HOOK;
                            if (CONTEXT_HOOKS.has(hookName)) return ORDER.CONTEXT_HOOK;
                            if (MEMO_HOOKS.has(hookName)) return ORDER.MEMO;
                            if (CALLBACK_HOOKS.has(hookName)) return ORDER.CALLBACK;

                            // Custom hooks (any use* pattern not in the above lists)
                            if (isHookCallHandler(decl.init)) return ORDER.CUSTOM_HOOK;
                        }
                    }

                    // Handler function
                    if (isFunctionExpressionHandler(decl.init)) {
                        return ORDER.HANDLER_FUNCTION;
                    }
                }

                // Check for destructuring from props (const { x } = propValue)
                for (const decl of declarations) {
                    if (decl.id.type === "ObjectPattern" && decl.init) {
                        // Direct prop destructure: const { x } = propValue
                        if (decl.init.type === "Identifier" && propNames.has(decl.init.name)) {
                            return ORDER.PROPS_DESTRUCTURE_BODY;
                        }

                        // Nested prop destructure: const { x } = propValue.nested
                        if (decl.init.type === "MemberExpression") {
                            let obj = decl.init;

                            while (obj.type === "MemberExpression") {
                                obj = obj.object;
                            }

                            if (obj.type === "Identifier" && propNames.has(obj.name)) {
                                return ORDER.PROPS_DESTRUCTURE_BODY;
                            }
                        }

                        // Legacy: const { x } = props
                        if (decl.init.type === "Identifier" && decl.init.name === "props") {
                            return ORDER.PROPS_DESTRUCTURE;
                        }
                    }
                }

                // Check if the variable calls a local handler function defined in this scope
                // e.g., const stateStyles = getStateStylesHandler();
                // These must appear after the handler they call, so treat them as handler-level
                for (const decl of declarations) {
                    if (decl.init && decl.init.type === "CallExpression") {
                        const callee = decl.init.callee;

                        if (callee && callee.type === "Identifier" && !isHookCallHandler(decl.init)) {
                            return ORDER.HANDLER_FUNCTION;
                        }
                    }
                }

                // Otherwise it's derived state / computed values
                return ORDER.DERIVED_STATE;
            }

            // Function declaration
            if (statement.type === "FunctionDeclaration") {
                return ORDER.HANDLER_FUNCTION;
            }

            return ORDER.UNKNOWN;
        };

        const checkCodeOrderHandler = (node, isHook) => {
            const body = node.body;
            const sourceCode = context.sourceCode || context.getSourceCode();

            // Only check block statements (not implicit returns)
            if (body.type !== "BlockStatement") return;

            const statements = body.body;

            if (statements.length === 0) return;

            // Extract prop names from function parameters
            const propNames = new Set();

            for (const param of node.params) {
                if (param.type === "Identifier") {
                    // Single param like (props) or (initialData)
                    propNames.add(param.name);
                } else if (param.type === "ObjectPattern") {
                    // Destructured props like ({ initialCount, title })
                    for (const prop of param.properties) {
                        if (prop.type === "Property" && prop.value) {
                            if (prop.value.type === "Identifier") {
                                propNames.add(prop.value.name);
                            } else if (prop.value.type === "AssignmentPattern" && prop.value.left.type === "Identifier") {
                                // Handle default values: ({ initialCount = 0 })
                                propNames.add(prop.value.left.name);
                            }
                        } else if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
                            // Handle rest: ({ ...rest })
                            propNames.add(prop.argument.name);
                        }
                    }
                } else if (param.type === "AssignmentPattern" && param.left) {
                    // Default param value like (props = {})
                    if (param.left.type === "Identifier") {
                        propNames.add(param.left.name);
                    } else if (param.left.type === "ObjectPattern") {
                        for (const prop of param.left.properties) {
                            if (prop.type === "Property" && prop.value) {
                                if (prop.value.type === "Identifier") {
                                    propNames.add(prop.value.name);
                                } else if (prop.value.type === "AssignmentPattern" && prop.value.left.type === "Identifier") {
                                    propNames.add(prop.value.left.name);
                                }
                            }
                        }
                    }
                }
            }

            // Categorizable statement types for ordering
            const isCategorizableStatement = (s) => s.type === "VariableDeclaration"
                    || s.type === "FunctionDeclaration"
                    || s.type === "ExpressionStatement"
                    || s.type === "ReturnStatement";

            // Get declared variable names from a statement
            const getDeclaredNamesHandler = (stmt) => {
                const names = new Set();

                if (stmt.type === "VariableDeclaration") {
                    for (const decl of stmt.declarations) {
                        if (decl.id.type === "Identifier") {
                            names.add(decl.id.name);
                        } else if (decl.id.type === "ObjectPattern") {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.value.type === "Identifier") {
                                    names.add(prop.value.name);
                                } else if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
                                    names.add(prop.argument.name);
                                }
                            }
                        } else if (decl.id.type === "ArrayPattern") {
                            for (const element of decl.id.elements) {
                                if (element && element.type === "Identifier") {
                                    names.add(element.name);
                                }
                            }
                        }
                    }
                } else if (stmt.type === "FunctionDeclaration" && stmt.id) {
                    names.add(stmt.id.name);
                }

                return names;
            };

            // Get referenced variable names from a node (recursively)
            const getReferencedNamesHandler = (node, refs = new Set()) => {
                if (!node) return refs;

                if (node.type === "Identifier") {
                    refs.add(node.name);
                } else if (node.type === "MemberExpression") {
                    getReferencedNamesHandler(node.object, refs);
                } else if (node.type === "CallExpression") {
                    getReferencedNamesHandler(node.callee, refs);
                    node.arguments.forEach((arg) => getReferencedNamesHandler(arg, refs));
                } else if (node.type === "BinaryExpression" || node.type === "LogicalExpression") {
                    getReferencedNamesHandler(node.left, refs);
                    getReferencedNamesHandler(node.right, refs);
                } else if (node.type === "ConditionalExpression") {
                    getReferencedNamesHandler(node.test, refs);
                    getReferencedNamesHandler(node.consequent, refs);
                    getReferencedNamesHandler(node.alternate, refs);
                } else if (node.type === "UnaryExpression") {
                    getReferencedNamesHandler(node.argument, refs);
                } else if (node.type === "ArrayExpression") {
                    node.elements.forEach((el) => getReferencedNamesHandler(el, refs));
                } else if (node.type === "ObjectExpression") {
                    node.properties.forEach((prop) => {
                        if (prop.type === "Property") {
                            getReferencedNamesHandler(prop.value, refs);
                        }
                    });
                } else if (node.type === "TemplateLiteral") {
                    node.expressions.forEach((expr) => getReferencedNamesHandler(expr, refs));
                } else if (node.type === "ChainExpression") {
                    getReferencedNamesHandler(node.expression, refs);
                } else if (node.type === "TSAsExpression" || node.type === "TSNonNullExpression") {
                    getReferencedNamesHandler(node.expression, refs);
                }

                return refs;
            };

            // Get dependencies for a statement (variables it uses in initialization)
            const getStatementDependenciesHandler = (stmt) => {
                const deps = new Set();

                if (stmt.type === "VariableDeclaration") {
                    for (const decl of stmt.declarations) {
                        if (decl.init) {
                            getReferencedNamesHandler(decl.init, deps);
                        }
                    }
                }

                return deps;
            };

            // Filter to only categorizable statements for order checking
            const categorizableStatements = statements.filter(isCategorizableStatement);

            if (categorizableStatements.length < 2) return;

            // Build dependency information for all statements
            const stmtInfo = new Map();
            const declaredNames = new Map(); // Map from variable name to statement index

            // First pass: build declaredNames map (so we can look up where each variable is declared)
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const declared = getDeclaredNamesHandler(stmt);

                for (const name of declared) {
                    declaredNames.set(name, i);
                }
            }

            // Second pass: build full statement info including dependencies
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const declared = getDeclaredNamesHandler(stmt);
                const dependencies = getStatementDependenciesHandler(stmt);
                const category = isCategorizableStatement(stmt)
                    ? getStatementCategoryHandler(stmt, propNames)
                    : ORDER.UNKNOWN;

                stmtInfo.set(i, {
                    category,
                    declared,
                    dependencies,
                    index: i,
                    statement: stmt,
                });
            }

            // Build dependency graph first
            const dependsOn = new Map(); // stmtIndex -> Set of stmtIndices it depends on

            for (let i = 0; i < statements.length; i++) {
                const info = stmtInfo.get(i);
                const deps = new Set();

                for (const depName of info.dependencies) {
                    const depIndex = declaredNames.get(depName);

                    if (depIndex !== undefined && depIndex !== i) {
                        deps.add(depIndex);
                    }
                }

                dependsOn.set(i, deps);
            }

            // Check for violations: category order OR dependency order
            let hasOrderViolation = false;
            let hasDependencyViolation = false;
            let lastCategory = 0;
            let violatingStatement = null;
            let violatingCategory = null;
            let previousCategory = null;
            let dependencyViolationStmt = null;
            let dependencyViolationVar = null;

            // Check category violations
            for (const statement of categorizableStatements) {
                const category = getStatementCategoryHandler(statement, propNames);

                if (category === ORDER.UNKNOWN) continue;

                if (category < lastCategory && !hasOrderViolation) {
                    hasOrderViolation = true;
                    violatingStatement = statement;
                    violatingCategory = category;
                    previousCategory = lastCategory;
                }

                lastCategory = category;
            }

            // Check dependency violations (using variable before declaration)
            for (let i = 0; i < statements.length; i++) {
                const deps = dependsOn.get(i) || new Set();

                for (const depIndex of deps) {
                    if (depIndex > i) {
                        // This statement uses a variable declared later
                        hasDependencyViolation = true;
                        dependencyViolationStmt = statements[i];

                        // Find the variable name
                        const depInfo = stmtInfo.get(depIndex);

                        for (const name of depInfo.declared) {
                            const currentDeps = stmtInfo.get(i).dependencies;

                            if (currentDeps.has(name)) {
                                dependencyViolationVar = name;

                                break;
                            }
                        }

                        break;
                    }
                }

                if (hasDependencyViolation) break;
            }

            if (!hasOrderViolation && !hasDependencyViolation) return;

            // Dependency-aware topological sort
            // Sort by category, but ensure dependencies come before dependents
            const sortWithDependenciesHandler = () => {
                const result = [];
                const visited = new Set();
                const visiting = new Set(); // For cycle detection

                // DFS-based topological sort
                const visitHandler = (index) => {
                    if (visited.has(index)) return;
                    if (visiting.has(index)) return; // Cycle detected, skip

                    visiting.add(index);

                    // Visit dependencies first
                    const deps = dependsOn.get(index) || new Set();

                    for (const depIndex of deps) {
                        visitHandler(depIndex);
                    }

                    visiting.delete(index);
                    visited.add(index);
                    result.push(index);
                };

                // Group statements by category first, then sort within each group by dependencies
                const byCategory = new Map();

                for (let i = 0; i < statements.length; i++) {
                    const info = stmtInfo.get(i);
                    let effectiveCategory = info.category;

                    // For non-categorizable statements, use the next categorizable statement's category
                    if (effectiveCategory === ORDER.UNKNOWN) {
                        for (let j = i + 1; j < statements.length; j++) {
                            const nextInfo = stmtInfo.get(j);

                            if (nextInfo.category !== ORDER.UNKNOWN) {
                                effectiveCategory = nextInfo.category;

                                break;
                            }
                        }

                        if (effectiveCategory === ORDER.UNKNOWN) {
                            effectiveCategory = ORDER.RETURN;
                        }
                    }

                    // Check if this statement has dependencies from a later category
                    // If so, it needs to come after those dependencies
                    const deps = dependsOn.get(i) || new Set();
                    let maxDepCategory = effectiveCategory;

                    for (const depIndex of deps) {
                        const depInfo = stmtInfo.get(depIndex);
                        let depCategory = depInfo.category;

                        if (depCategory === ORDER.UNKNOWN) {
                            depCategory = ORDER.DERIVED_STATE; // Assume derived for unknown
                        }

                        if (depCategory > maxDepCategory) {
                            maxDepCategory = depCategory;
                        }
                    }

                    // If dependencies are from a later category, this statement must come after them
                    // So we use the max dependency category as the effective category
                    const sortCategory = Math.max(effectiveCategory, maxDepCategory);

                    if (!byCategory.has(sortCategory)) {
                        byCategory.set(sortCategory, []);
                    }

                    byCategory.get(sortCategory).push({
                        deps,
                        effectiveCategory,
                        index: i,
                        originalCategory: info.category,
                    });
                }

                // Sort categories
                const sortedCategories = [...byCategory.keys()].sort((a, b) => a - b);

                // Build final sorted list
                const finalResult = [];

                for (const category of sortedCategories) {
                    const stmtsInCategory = byCategory.get(category);

                    // Sort statements within category by dependencies using topological sort
                    const categoryVisited = new Set();
                    const categoryResult = [];

                    const visitCategoryHandler = (item) => {
                        if (categoryVisited.has(item.index)) return;

                        categoryVisited.add(item.index);

                        // Visit dependencies in same category first
                        for (const depIndex of item.deps) {
                            const depItem = stmtsInCategory.find((s) => s.index === depIndex);

                            if (depItem && !categoryVisited.has(depIndex)) {
                                visitCategoryHandler(depItem);
                            }
                        }

                        categoryResult.push(item.index);
                    };

                    // Sort by original index first to maintain stability
                    stmtsInCategory.sort((a, b) => a.index - b.index);

                    for (const item of stmtsInCategory) {
                        visitCategoryHandler(item);
                    }

                    finalResult.push(...categoryResult);
                }

                return finalResult;
            };

            const sortedIndices = sortWithDependenciesHandler();

            // Check if sorting actually changes the order
            const orderChanged = sortedIndices.some((idx, i) => idx !== i);

            if (!orderChanged) return;

            // Build the fix
            const fixHandler = (fixer) => {
                const firstStatementLine = sourceCode.lines[statements[0].loc.start.line - 1];
                const baseIndent = firstStatementLine.match(/^\s*/)[0];

                let newBodyContent = "";
                let lastCategory = null;

                for (let i = 0; i < sortedIndices.length; i++) {
                    const stmtIndex = sortedIndices[i];
                    const info = stmtInfo.get(stmtIndex);
                    const category = info.category !== ORDER.UNKNOWN ? info.category : null;

                    // Add blank line between different categories
                    if (lastCategory !== null && category !== null && category !== lastCategory) {
                        newBodyContent += "\n";
                    }

                    const stmtText = sourceCode.getText(info.statement);

                    newBodyContent += baseIndent + stmtText.trim() + "\n";

                    if (category !== null) {
                        lastCategory = category;
                    }
                }

                const firstStmt = statements[0];
                const lastStmt = statements[statements.length - 1];

                return fixer.replaceTextRange([firstStmt.range[0], lastStmt.range[1]], newBodyContent.trimEnd());
            };

            // Report the appropriate violation
            if (hasDependencyViolation && dependencyViolationStmt) {
                context.report({
                    data: {
                        type: isHook ? "hook" : "component",
                        varName: dependencyViolationVar || "variable",
                    },
                    fix: fixHandler,
                    message: "\"{{varName}}\" is used before it is declared. Reorder statements so dependencies are declared first in {{type}}",
                    node: dependencyViolationStmt,
                });
            } else if (hasOrderViolation && violatingStatement) {
                context.report({
                    data: {
                        current: ORDER_NAMES[violatingCategory],
                        previous: ORDER_NAMES[previousCategory],
                        type: isHook ? "hook" : "component",
                    },
                    fix: fixHandler,
                    message: "\"{{current}}\" should come before \"{{previous}}\" in {{type}}. Order: refs → state → redux → router → context → custom hooks → derived → useMemo → useCallback → handlers → useEffect → return",
                    node: violatingStatement,
                });
            }
        };

        // Check for module-level constants that should be inside the component
        const checkModuleLevelConstantsHandler = (node, isHook) => {
            const sourceCode = context.sourceCode || context.getSourceCode();

            // Get the program (root) node to find module-level declarations
            let programNode = node;

            while (programNode.parent) {
                programNode = programNode.parent;
            }

            if (programNode.type !== "Program") return;

            // Get the component body for insertion
            const componentBody = node.body;

            if (componentBody.type !== "BlockStatement") return;

            // Get component/hook name
            const componentName = getFunctionNameHandler(node);

            // Find module-level variable declarations with simple literal values
            for (const statement of programNode.body) {
                if (statement.type !== "VariableDeclaration") continue;

                for (const decl of statement.declarations) {
                    if (!decl.init || !decl.id || decl.id.type !== "Identifier") continue;

                    const varName = decl.id.name;

                    // Only check simple literals (numbers, strings, booleans)
                    const isSimpleLiteral = decl.init.type === "Literal"
                        && (typeof decl.init.value === "number"
                            || typeof decl.init.value === "string"
                            || typeof decl.init.value === "boolean");

                    if (!isSimpleLiteral) continue;

                    // Skip if it looks like a config constant (SCREAMING_CASE is typically intentional module-level)
                    if (/^[A-Z][A-Z0-9_]*$/.test(varName)) continue;

                    // Check if this variable is used inside the current component/hook
                    const componentText = sourceCode.getText(node);

                    // Simple check: see if the variable name appears in the component
                    // Use word boundary to avoid false positives
                    const regex = new RegExp(`\\b${varName}\\b`);

                    if (regex.test(componentText)) {
                        // Build the fix
                        const fixHandler = (fixer) => {
                            const fixes = [];

                            // Get the declaration text
                            const declText = sourceCode.getText(decl);
                            const kind = statement.kind; // const, let, var

                            // Remove from module level
                            if (statement.declarations.length === 1) {
                                // Remove the entire statement including newline
                                const nextToken = sourceCode.getTokenAfter(statement);
                                const endPos = nextToken ? statement.range[1] : statement.range[1];

                                // Include trailing newline if present
                                const textAfter = sourceCode.text.slice(statement.range[1], statement.range[1] + 2);
                                const removeEnd = textAfter.startsWith("\n") ? statement.range[1] + 1
                                    : textAfter.startsWith("\r\n") ? statement.range[1] + 2
                                        : statement.range[1];

                                fixes.push(fixer.removeRange([statement.range[0], removeEnd]));
                            } else {
                                // Remove just this declarator (and comma)
                                const declIndex = statement.declarations.indexOf(decl);
                                const isLast = declIndex === statement.declarations.length - 1;

                                if (isLast) {
                                    // Remove comma before and the declarator
                                    const prevDecl = statement.declarations[declIndex - 1];

                                    fixes.push(fixer.removeRange([prevDecl.range[1], decl.range[1]]));
                                } else {
                                    // Remove declarator and comma after
                                    const nextDecl = statement.declarations[declIndex + 1];

                                    fixes.push(fixer.removeRange([decl.range[0], nextDecl.range[0]]));
                                }
                            }

                            // Find the right position to insert inside the component
                            // Insert after all hooks but before handlers
                            const bodyStatements = componentBody.body;

                            // Get the base indentation inside the component
                            let insertIndent = "    "; // Default

                            if (bodyStatements.length > 0) {
                                const firstStmtLine = sourceCode.lines[bodyStatements[0].loc.start.line - 1];

                                insertIndent = firstStmtLine.match(/^\s*/)[0];
                            }

                            // Find insertion point: after last hook/derived state, before handlers
                            let insertIndex = 0;

                            for (let i = 0; i < bodyStatements.length; i++) {
                                const stmt = bodyStatements[i];

                                if (stmt.type === "VariableDeclaration") {
                                    const stmtDecl = stmt.declarations[0];

                                    if (stmtDecl && stmtDecl.init) {
                                        // Check if it's a hook call
                                        if (stmtDecl.init.type === "CallExpression") {
                                            const callee = stmtDecl.init.callee;
                                            const hookName = callee.type === "Identifier" ? callee.name
                                                : callee.type === "MemberExpression" && callee.property.type === "Identifier"
                                                    ? callee.property.name
                                                    : "";

                                            if (/^use[A-Z]/.test(hookName)) {
                                                insertIndex = i + 1;

                                                continue;
                                            }
                                        }

                                        // Check if it's a function (handler)
                                        if (stmtDecl.init.type === "ArrowFunctionExpression"
                                            || stmtDecl.init.type === "FunctionExpression") {
                                            break;
                                        }

                                        // It's derived state, insert after it
                                        insertIndex = i + 1;
                                    }
                                } else if (stmt.type === "FunctionDeclaration") {
                                    // Handler function, stop here
                                    break;
                                }
                            }

                            // Insert the constant
                            const newLine = `${insertIndent}${kind} ${declText};\n\n`;

                            if (insertIndex === 0 && bodyStatements.length > 0) {
                                // Insert at the beginning
                                fixes.push(fixer.insertTextBefore(bodyStatements[0], newLine));
                            } else if (insertIndex < bodyStatements.length) {
                                // Insert before the target statement
                                fixes.push(fixer.insertTextBefore(bodyStatements[insertIndex], newLine));
                            } else if (bodyStatements.length > 0) {
                                // Insert at the end
                                fixes.push(fixer.insertTextAfter(bodyStatements[bodyStatements.length - 1], "\n\n" + insertIndent + kind + " " + declText + ";"));
                            }

                            return fixes;
                        };

                        context.report({
                            data: {
                                name: varName,
                                type: isHook ? "hook" : "component",
                            },
                            fix: fixHandler,
                            message: "Constant \"{{name}}\" should be declared inside the {{type}} as derived state, not at module level",
                            node: decl.id,
                        });
                    }
                }
            }
        };

        const checkFunctionHandler = (node) => {
            // Check if it's a React component
            if (isReactComponentHandler(node)) {
                checkCodeOrderHandler(node, false);
                checkModuleLevelConstantsHandler(node, false);

                return;
            }

            // Check if it's a custom hook
            if (isCustomHookHandler(node)) {
                checkCodeOrderHandler(node, true);
                checkModuleLevelConstantsHandler(node, true);
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce consistent ordering of code blocks in React components and custom hooks" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

const enumFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
        const upperCaseRegex = /^[A-Z][A-Z0-9_]*$/;

        return {
            TSEnumDeclaration(node) {
                const enumName = node.id.name;

                // Check enum name is PascalCase and ends with Enum
                if (!pascalCaseRegex.test(enumName)) {
                    context.report({
                        message: `Enum name "${enumName}" must be PascalCase`,
                        node: node.id,
                    });
                } else if (!enumName.endsWith("Enum")) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceText(node.id, `${enumName}Enum`);
                        },
                        message: `Enum name "${enumName}" must end with "Enum" suffix. Use "${enumName}Enum" instead of "${enumName}"`,
                        node: node.id,
                    });
                }

                // Get opening brace
                const openBraceToken = sourceCode.getTokenAfter(node.id, { filter: (token) => token.value === "{" });

                // Check opening brace is on same line as enum name
                if (openBraceToken && openBraceToken.loc.start.line !== node.id.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [node.id.range[1], openBraceToken.range[0]],
                            " ",
                        ),
                        message: "Opening brace must be on the same line as enum name",
                        node: openBraceToken,
                    });
                }

                // Check members
                const members = node.members;

                if (members.length === 0) return;

                // Get indentation
                const enumLine = sourceCode.lines[node.loc.start.line - 1];
                const baseIndent = enumLine.match(/^\s*/)[0];
                const memberIndent = baseIndent + "    ";

                // Get closing brace
                const closeBraceToken = sourceCode.getLastToken(node);

                // Check for empty line after opening brace
                const firstMember = members[0];

                if (openBraceToken && firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + memberIndent,
                        ),
                        message: "No empty line after opening brace in enum",
                        node: firstMember,
                    });
                }

                // Check for empty line before closing brace
                const lastMember = members[members.length - 1];

                if (closeBraceToken && closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBraceToken.range[0]],
                            "\n" + baseIndent,
                        ),
                        message: "No empty line before closing brace in enum",
                        node: lastMember,
                    });
                }

                // For single member, should be on one line without trailing comma
                if (members.length === 1) {
                    const member = members[0];
                    const memberText = sourceCode.getText(member);
                    const isMultiLine = openBraceToken.loc.end.line !== closeBraceToken.loc.start.line;

                    if (isMultiLine) {
                        // Collapse to single line without trailing comma
                        let cleanText = memberText.trim();

                        if (cleanText.endsWith(",")) cleanText = cleanText.slice(0, -1);

                        const newEnumText = `{ ${cleanText} }`;

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[0], closeBraceToken.range[1]],
                                newEnumText,
                            ),
                            message: "Single member enum should be on one line without trailing comma",
                            node,
                        });

                        return;
                    }

                    // Check for trailing comma in single-line single member
                    if (memberText.trimEnd().endsWith(",")) {
                        const commaIndex = memberText.lastIndexOf(",");

                        context.report({
                            fix: (fixer) => fixer.removeRange([member.range[0] + commaIndex, member.range[0] + commaIndex + 1]),
                            message: "Single member enum should not have trailing comma",
                            node: member,
                        });
                    }

                    return;
                }

                // For multiple members, first member should be on new line after opening brace
                if (openBraceToken && firstMember.loc.start.line === openBraceToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + memberIndent,
                        ),
                        message: "First enum member must be on a new line when there are multiple members",
                        node: firstMember,
                    });
                }

                // Convert camelCase/PascalCase to UPPER_SNAKE_CASE
                const toUpperSnakeCaseHandler = (name) => {
                    // Insert underscore before each uppercase letter (except the first)
                    // Then convert to uppercase
                    return name
                        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
                        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
                        .toUpperCase();
                };

                members.forEach((member, index) => {
                    // Check member name is UPPER_CASE
                    if (member.id && member.id.type === "Identifier") {
                        const memberName = member.id.name;

                        if (!upperCaseRegex.test(memberName)) {
                            const fixedName = toUpperSnakeCaseHandler(memberName);

                            context.report({
                                fix: (fixer) => fixer.replaceText(member.id, fixedName),
                                message: `Enum member "${memberName}" must be UPPER_CASE (e.g., ${fixedName})`,
                                node: member.id,
                            });
                        }
                    }

                    // Check member ends with comma, not semicolon
                    // Skip last member when multiple members - handled by combined check below
                    const isLastMember = index === members.length - 1;

                    if (!isLastMember || members.length === 1) {
                        const memberText = sourceCode.getText(member);

                        if (memberText.trimEnd().endsWith(";")) {
                            context.report({
                                fix(fixer) {
                                    const lastChar = memberText.lastIndexOf(";");
                                    const absolutePos = member.range[0] + lastChar;

                                    return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                                },
                                message: "Enum members must end with comma (,) not semicolon (;)",
                                node: member,
                            });
                        }
                    }

                    // Check formatting for multiple members
                    if (members.length > 1 && index > 0) {
                        const prevMember = members[index - 1];

                        // Check each is on its own line - with auto-fix
                        if (member.loc.start.line === prevMember.loc.end.line) {
                            context.report({
                                fix: (fixer) => {
                                    let commaToken = sourceCode.getTokenAfter(prevMember);

                                    while (commaToken && commaToken.value !== "," && commaToken.range[0] < member.range[0]) {
                                        commaToken = sourceCode.getTokenAfter(commaToken);
                                    }

                                    const insertPoint = commaToken && commaToken.value === "," ? commaToken.range[1] : prevMember.range[1];

                                    return fixer.replaceTextRange(
                                        [insertPoint, member.range[0]],
                                        "\n" + memberIndent,
                                    );
                                },
                                message: "Each enum member must be on its own line when there are multiple members",
                                node: member,
                            });
                        }

                        // Check for empty lines between members
                        if (member.loc.start.line - prevMember.loc.end.line > 1) {
                            context.report({
                                fix(fixer) {
                                    const textBetween = sourceCode.getText().slice(
                                        prevMember.range[1],
                                        member.range[0],
                                    );
                                    const newText = textBetween.replace(/\n\s*\n/g, "\n");

                                    return fixer.replaceTextRange(
                                        [prevMember.range[1], member.range[0]],
                                        newText,
                                    );
                                },
                                message: "No empty lines allowed between enum members",
                                node: member,
                            });
                        }
                    }
                });

                // Check closing brace position and trailing comma/semicolon (for multiple members)
                if (members.length > 1) {
                    const lastMemberText = sourceCode.getText(lastMember);
                    const trimmedText = lastMemberText.trimEnd();
                    // Check both: text ends with comma OR there's a comma token after the member
                    const tokenAfterLast = sourceCode.getTokenAfter(lastMember);
                    const hasTrailingComma = trimmedText.endsWith(",") || (tokenAfterLast && tokenAfterLast.value === ",");
                    const hasTrailingSemicolon = trimmedText.endsWith(";");
                    const braceOnSameLine = closeBraceToken && closeBraceToken.loc.start.line === lastMember.loc.end.line;

                    // Handle semicolon on last member (needs replacement with comma)
                    if (hasTrailingSemicolon) {
                        const lastSemicolon = lastMemberText.lastIndexOf(";");
                        const absolutePos = lastMember.range[0] + lastSemicolon;

                        if (braceOnSameLine) {
                            // Both semicolon and brace issues - fix together
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [absolutePos, closeBraceToken.range[0]],
                                    ",\n" + baseIndent,
                                ),
                                message: "Last enum member must end with comma and closing brace must be on its own line",
                                node: lastMember,
                            });
                        } else {
                            // Just semicolon issue
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([absolutePos, absolutePos + 1], ","),
                                message: "Enum members must end with comma (,) not semicolon (;)",
                                node: lastMember,
                            });
                        }
                    } else if (!hasTrailingComma && braceOnSameLine) {
                        // Both missing comma and brace issues - fix together
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                ",\n" + baseIndent,
                            ),
                            message: "Last enum member must have trailing comma and closing brace must be on its own line",
                            node: lastMember,
                        });
                    } else if (!hasTrailingComma) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                            message: "Last enum member must have trailing comma",
                            node: lastMember,
                        });
                    } else if (braceOnSameLine) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing brace must be on its own line",
                            node: closeBraceToken,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce enum naming (PascalCase + Enum suffix), UPPER_CASE members, proper formatting, and trailing commas" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

const interfaceFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        // Convert PascalCase/SCREAMING_SNAKE_CASE/snake_case to camelCase
        const toCamelCaseHandler = (name) => {
            // Handle SCREAMING_SNAKE_CASE (e.g., USER_NAME -> userName)
            if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle snake_case (e.g., user_name -> userName)
            if (/_/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle PascalCase (e.g., UserName -> userName)
            if (/^[A-Z]/.test(name)) {
                return name[0].toLowerCase() + name.slice(1);
            }

            return name;
        };

        return {
            TSInterfaceDeclaration(node) {
                const interfaceName = node.id.name;

                // Check interface name is PascalCase and ends with Interface
                if (!pascalCaseRegex.test(interfaceName)) {
                    context.report({
                        message: `Interface name "${interfaceName}" must be PascalCase`,
                        node: node.id,
                    });
                } else if (!interfaceName.endsWith("Interface")) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceText(node.id, `${interfaceName}Interface`);
                        },
                        message: `Interface name "${interfaceName}" must end with "Interface" suffix. Use "${interfaceName}Interface" instead of "${interfaceName}"`,
                        node: node.id,
                    });
                }

                // Get opening brace
                const openBraceToken = sourceCode.getFirstToken(node.body);

                // Check opening brace is on same line as interface name
                if (openBraceToken && openBraceToken.loc.start.line !== node.id.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [node.id.range[1], openBraceToken.range[0]],
                            " ",
                        ),
                        message: "Opening brace must be on the same line as interface name",
                        node: openBraceToken,
                    });
                }

                // Check properties
                const members = node.body.body;

                if (members.length === 0) return;

                // Get indentation
                const interfaceLine = sourceCode.lines[node.loc.start.line - 1];
                const baseIndent = interfaceLine.match(/^\s*/)[0];
                const propIndent = baseIndent + "    ";

                // Get closing brace
                const closeBraceToken = sourceCode.getLastToken(node.body);

                // Check for empty line after opening brace
                const firstMember = members[0];

                if (firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + propIndent,
                        ),
                        message: "No empty line after opening brace in interface",
                        node: firstMember,
                    });
                }

                // Check for empty line before closing brace
                const lastMember = members[members.length - 1];

                if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBraceToken.range[0]],
                            "\n" + baseIndent,
                        ),
                        message: "No empty line before closing brace in interface",
                        node: lastMember,
                    });
                }

                // For single member, should be on one line without trailing punctuation
                // But skip if the property has a nested object type with 2+ members
                // Or if the property has a multi-line function type (let type-annotation-spacing handle it first)
                if (members.length === 1) {
                    const member = members[0];
                    const isMultiLine = openBraceToken.loc.end.line !== closeBraceToken.loc.start.line;

                    // Check if property has nested object type
                    const nestedType = member.typeAnnotation?.typeAnnotation;
                    const hasNestedType = nestedType?.type === "TSTypeLiteral";
                    const hasMultiMemberNestedType = hasNestedType && nestedType.members?.length >= 2;
                    const hasSingleMemberNestedType = hasNestedType && nestedType.members?.length === 1;

                    // Check if property has function type that spans multiple lines
                    const hasMultiLineFunctionType = nestedType?.type === "TSFunctionType" &&
                        nestedType.loc.start.line !== nestedType.loc.end.line;

                    if (isMultiLine && !hasMultiMemberNestedType && !hasMultiLineFunctionType) {
                        // Build the collapsed text, handling nested types specially
                        let cleanText;

                        if (hasSingleMemberNestedType) {
                            // Collapse nested type first, then build the member text
                            const nestedMember = nestedType.members[0];
                            let nestedMemberText = sourceCode.getText(nestedMember).trim();

                            if (nestedMemberText.endsWith(",") || nestedMemberText.endsWith(";")) {
                                nestedMemberText = nestedMemberText.slice(0, -1);
                            }

                            // Build: propName: { nestedProp: type }
                            const propName = member.key.name;
                            const optionalMark = member.optional ? "?" : "";

                            cleanText = `${propName}${optionalMark}: { ${nestedMemberText} }`;
                        } else {
                            cleanText = sourceCode.getText(member).trim();

                            if (cleanText.endsWith(",") || cleanText.endsWith(";")) {
                                cleanText = cleanText.slice(0, -1);
                            }
                        }

                        const newInterfaceText = `{ ${cleanText} }`;

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[0], closeBraceToken.range[1]],
                                newInterfaceText,
                            ),
                            message: "Single property interface should be on one line without trailing punctuation",
                            node,
                        });

                        return;
                    }

                    // Check for trailing comma/semicolon in single-line single member
                    const memberText = sourceCode.getText(member);

                    if (memberText.trimEnd().endsWith(",") || memberText.trimEnd().endsWith(";")) {
                        const punctIndex = Math.max(memberText.lastIndexOf(","), memberText.lastIndexOf(";"));

                        context.report({
                            fix: (fixer) => fixer.removeRange([member.range[0] + punctIndex, member.range[0] + punctIndex + 1]),
                            message: "Single property interface should not have trailing punctuation",
                            node: member,
                        });
                    }

                    return;
                }

                // For multiple members, first member should be on new line after opening brace
                if (firstMember.loc.start.line === openBraceToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + propIndent,
                        ),
                        message: "First interface property must be on a new line when there are multiple properties",
                        node: firstMember,
                    });
                }

                members.forEach((member, index) => {
                    // Check property name is camelCase
                    if (member.type === "TSPropertySignature" && member.key && member.key.type === "Identifier") {
                        const propName = member.key.name;

                        if (!camelCaseRegex.test(propName)) {
                            const fixedName = toCamelCaseHandler(propName);

                            context.report({
                                fix: (fixer) => fixer.replaceText(member.key, fixedName),
                                message: `Interface property "${propName}" must be camelCase. Use "${fixedName}" instead.`,
                                node: member.key,
                            });
                        }
                    }

                    // Collapse single-member nested object types to one line
                    if (member.type === "TSPropertySignature" && member.typeAnnotation?.typeAnnotation?.type === "TSTypeLiteral") {
                        const nestedType = member.typeAnnotation.typeAnnotation;

                        if (nestedType.members && nestedType.members.length === 1) {
                            const nestedOpenBrace = sourceCode.getFirstToken(nestedType);
                            const nestedCloseBrace = sourceCode.getLastToken(nestedType);
                            const isNestedMultiLine = nestedOpenBrace.loc.end.line !== nestedCloseBrace.loc.start.line;

                            if (isNestedMultiLine) {
                                const nestedMember = nestedType.members[0];
                                let nestedMemberText = sourceCode.getText(nestedMember).trim();

                                // Remove trailing punctuation
                                if (nestedMemberText.endsWith(",") || nestedMemberText.endsWith(";")) {
                                    nestedMemberText = nestedMemberText.slice(0, -1);
                                }

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [nestedOpenBrace.range[0], nestedCloseBrace.range[1]],
                                        `{ ${nestedMemberText} }`,
                                    ),
                                    message: "Single property nested object type should be on one line",
                                    node: nestedType,
                                });
                            }
                        }
                    }

                    // Check for space before ? in optional properties
                    if (member.type === "TSPropertySignature" && member.optional) {
                        const keyToken = sourceCode.getFirstToken(member);
                        const questionToken = sourceCode.getTokenAfter(keyToken);

                        if (questionToken && questionToken.value === "?") {
                            const textBetween = sourceCode.getText().slice(keyToken.range[1], questionToken.range[0]);

                            if (textBetween !== "") {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [keyToken.range[1], questionToken.range[0]],
                                        "",
                                    ),
                                    message: "No space allowed before \"?\" in optional property",
                                    node: member,
                                });
                            }
                        }
                    }

                    // Check property ends with comma, not semicolon
                    // Skip last member when multiple members - handled by combined check below
                    const isLastMember = index === members.length - 1;

                    if (!isLastMember || members.length === 1) {
                        const memberText = sourceCode.getText(member);

                        if (memberText.trimEnd().endsWith(";")) {
                            context.report({
                                fix(fixer) {
                                    const lastChar = memberText.lastIndexOf(";");
                                    const absolutePos = member.range[0] + lastChar;

                                    return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                                },
                                message: "Interface properties must end with comma (,) not semicolon (;)",
                                node: member,
                            });
                        }
                    }

                    // Check formatting for multiple members
                    if (members.length > 1 && index > 0) {
                        const prevMember = members[index - 1];

                        // Check each is on its own line - with auto-fix
                        if (member.loc.start.line === prevMember.loc.end.line) {
                            context.report({
                                fix: (fixer) => {
                                    let commaToken = sourceCode.getTokenAfter(prevMember);

                                    while (commaToken && commaToken.value !== "," && commaToken.range[0] < member.range[0]) {
                                        commaToken = sourceCode.getTokenAfter(commaToken);
                                    }

                                    const insertPoint = commaToken && commaToken.value === "," ? commaToken.range[1] : prevMember.range[1];

                                    return fixer.replaceTextRange(
                                        [insertPoint, member.range[0]],
                                        "\n" + propIndent,
                                    );
                                },
                                message: "Each interface property must be on its own line when there are multiple properties",
                                node: member,
                            });
                        }

                        // Check for empty lines between properties
                        if (member.loc.start.line - prevMember.loc.end.line > 1) {
                            context.report({
                                fix(fixer) {
                                    const textBetween = sourceCode.getText().slice(
                                        prevMember.range[1],
                                        member.range[0],
                                    );
                                    const newText = textBetween.replace(/\n\s*\n/g, "\n");

                                    return fixer.replaceTextRange(
                                        [prevMember.range[1], member.range[0]],
                                        newText,
                                    );
                                },
                                message: "No empty lines allowed between interface properties",
                                node: member,
                            });
                        }
                    }
                });

                // Check closing brace position and trailing comma/semicolon (for multiple members)
                if (members.length > 1) {
                    const lastMemberText = sourceCode.getText(lastMember);
                    const trimmedText = lastMemberText.trimEnd();
                    // Check both: text ends with comma OR there's a comma token after the member
                    const tokenAfterLast = sourceCode.getTokenAfter(lastMember);
                    const hasTrailingComma = trimmedText.endsWith(",") || (tokenAfterLast && tokenAfterLast.value === ",");
                    const hasTrailingSemicolon = trimmedText.endsWith(";");
                    const braceOnSameLine = closeBraceToken.loc.start.line === lastMember.loc.end.line;

                    // Handle semicolon on last member (needs replacement with comma)
                    if (hasTrailingSemicolon) {
                        const lastSemicolon = lastMemberText.lastIndexOf(";");
                        const absolutePos = lastMember.range[0] + lastSemicolon;

                        if (braceOnSameLine) {
                            // Both semicolon and brace issues - fix together
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [absolutePos, closeBraceToken.range[0]],
                                    ",\n" + baseIndent,
                                ),
                                message: "Last interface property must end with comma and closing brace must be on its own line",
                                node: lastMember,
                            });
                        } else {
                            // Just semicolon issue
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([absolutePos, absolutePos + 1], ","),
                                message: "Interface properties must end with comma (,) not semicolon (;)",
                                node: lastMember,
                            });
                        }
                    } else if (!hasTrailingComma && braceOnSameLine) {
                        // Both missing comma and brace issues - fix together
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                ",\n" + baseIndent,
                            ),
                            message: "Last interface property must have trailing comma and closing brace must be on its own line",
                            node: lastMember,
                        });
                    } else if (!hasTrailingComma) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                            message: "Last interface property must have trailing comma",
                            node: lastMember,
                        });
                    } else if (braceOnSameLine) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing brace must be on its own line",
                            node: closeBraceToken,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce interface naming (PascalCase + Interface suffix), camelCase properties, proper formatting, and trailing commas" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

const typescriptDefinitionLocation = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const isInFolderHandler = (folderName) => {
            const pattern = new RegExp(`/${folderName}/[^/]+\\.(ts|tsx)$`);

            return pattern.test(normalizedFilename);
        };

        const isTypeScriptFileHandler = () => /\.(ts|tsx)$/.test(normalizedFilename);

        return {
            TSInterfaceDeclaration(node) {
                if (!isTypeScriptFileHandler()) return;

                if (!isInFolderHandler("interfaces")) {
                    context.report({
                        message: "Interfaces must be declared in files inside the \"interfaces\" folder",
                        node: node.id || node,
                    });
                }
            },
            TSEnumDeclaration(node) {
                if (!isTypeScriptFileHandler()) return;

                if (!isInFolderHandler("enums")) {
                    context.report({
                        message: "Enums must be declared in files inside the \"enums\" folder",
                        node: node.id || node,
                    });
                }
            },
            TSTypeAliasDeclaration(node) {
                if (!isTypeScriptFileHandler()) return;

                if (!isInFolderHandler("types")) {
                    context.report({
                        message: "Type aliases must be declared in files inside the \"types\" folder",
                        node: node.id || node,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce that interfaces are in interfaces folder, enums in enums folder, and types in types folder" },
        schema: [],
        type: "suggestion",
    },
};

export default {
    meta: {
        name: packageJson.name,
        version: packageJson.version,
    },
    rules: {
        // Array rules
        "array-callback-destructure": arrayCallbackDestructure,
        "array-items-per-line": arrayItemsPerLine,
        "array-objects-on-new-lines": arrayObjectsOnNewLines,

        // Arrow function rules
        "arrow-function-block-body": arrowFunctionBlockBody,
        "arrow-function-simple-jsx": arrowFunctionSimpleJsx,
        "arrow-function-simplify": arrowFunctionSimplify,
        "curried-arrow-same-line": curriedArrowSameLine,

        // Call expression rules
        "function-arguments-format": functionArgumentsFormat,
        "nested-call-closing-brackets": nestedCallClosingBrackets,
        "no-empty-lines-in-function-calls": noEmptyLinesInFunctionCalls,
        "opening-brackets-same-line": openingBracketsSameLine,
        "simple-call-single-line": simpleCallSingleLine,
        "single-argument-on-one-line": singleArgumentOnOneLine,

        // Comment rules
        "comment-format": commentFormat,

        // Component rules
        "component-props-destructure": componentPropsDestructure,
        "component-props-inline-type": componentPropsInlineType,
        "folder-based-naming-convention": folderBasedNamingConvention,
        "folder-structure-consistency": folderStructureConsistency,
        "no-redundant-folder-suffix": noRedundantFolderSuffix,
        "svg-icon-naming-convention": svgIconNamingConvention,

        // React rules
        "react-code-order": reactCodeOrder,

        // Control flow rules
        "block-statement-newlines": blockStatementNewlines,
        "empty-line-after-block": emptyLineAfterBlock,
        "if-else-spacing": ifElseSpacing,
        "if-statement-format": ifStatementFormat,
        "logical-expression-multiline": logicalExpressionMultiline,
        "multiline-if-conditions": multilineIfConditions,
        "no-empty-lines-in-switch-cases": noEmptyLinesInSwitchCases,
        "ternary-condition-multiline": ternaryConditionMultiline,

        // Class rules
        "class-method-definition-format": classMethodDefinitionFormat,
        "class-naming-convention": classNamingConvention,

        // Function rules
        "function-call-spacing": functionCallSpacing,
        "function-declaration-style": functionDeclarationStyle,
        "function-naming-convention": functionNamingConvention,
        "function-object-destructure": functionObjectDestructure,
        "function-params-per-line": functionParamsPerLine,
        "no-empty-lines-in-function-params": noEmptyLinesInFunctionParams,

        // Hook rules
        "hook-callback-format": hookCallbackFormat,
        "hook-deps-per-line": hookDepsPerLine,
        "use-state-naming-convention": useStateNamingConvention,

        // Import/Export rules
        "absolute-imports-only": absoluteImportsOnly,
        "export-format": exportFormat,
        "import-format": importFormat,
        "import-source-spacing": importSourceSpacing,
        "index-export-style": indexExportStyle,
        "index-exports-only": indexExportsOnly,
        "inline-export-declaration": inlineExportDeclaration,
        "module-index-exports": moduleIndexExports,

        // JSX rules
        "classname-dynamic-at-end": classNameDynamicAtEnd,
        "classname-multiline": classNameMultiline,
        "classname-no-extra-spaces": classNameNoExtraSpaces,
        "classname-order": classNameOrder,
        "jsx-children-on-new-line": jsxChildrenOnNewLine,
        "jsx-closing-bracket-spacing": jsxClosingBracketSpacing,
        "jsx-element-child-new-line": jsxElementChildNewLine,
        "jsx-logical-expression-simplify": jsxLogicalExpressionSimplify,
        "jsx-parentheses-position": jsxParenthesesPosition,
        "jsx-prop-naming-convention": jsxPropNamingConvention,
        "jsx-simple-element-one-line": jsxSimpleElementOneLine,
        "jsx-string-value-trim": jsxStringValueTrim,
        "jsx-ternary-format": jsxTernaryFormat,
        "no-empty-lines-in-jsx": noEmptyLinesInJsx,

        // Object rules
        "no-empty-lines-in-objects": noEmptyLinesInObjects,
        "object-property-per-line": objectPropertyPerLine,
        "object-property-value-brace": objectPropertyValueBrace,
        "object-property-value-format": objectPropertyValueFormat,
        "string-property-spacing": stringPropertySpacing,

        // Spacing rules
        "assignment-value-same-line": assignmentValueSameLine,
        "member-expression-bracket-spacing": memberExpressionBracketSpacing,

        // TypeScript rules
        "enum-format": enumFormat,
        "interface-format": interfaceFormat,
        "no-inline-type-definitions": noInlineTypeDefinitions,
        "prop-naming-convention": propNamingConvention,
        "type-annotation-spacing": typeAnnotationSpacing,
        "type-format": typeFormat,
        "typescript-definition-location": typescriptDefinitionLocation,

        // Type/Enum rules
        "enum-type-enforcement": enumTypeEnforcement,

        // String rules
        "no-hardcoded-strings": noHardcodedStrings,

        // Variable rules
        "variable-naming-convention": variableNamingConvention,
    },
};
