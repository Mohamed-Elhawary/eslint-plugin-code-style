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

export { noHardcodedStrings };
