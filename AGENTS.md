# AGENTS.md

Instructions for AI coding agents working with this codebase.

## Project Overview

**eslint-plugin-code-style** is an ESLint plugin providing 48 custom auto-fixable formatting rules for React/JSX projects. It's designed for ESLint v9+ flat config system.

- **Main entry:** `index.js` - Contains all 48 rules in a single file
- **Type definitions:** `index.d.ts` - TypeScript declarations for IDE support
- **Recommended config:** `recommended-configs/react/` - Ready-to-use ESLint configuration
- **Test app:** `_tests_/react/` - Sample React app for testing rules

## Build & Test Commands

```bash
# No build step required - plain JavaScript ES modules

# Test rules against sample React app
cd _tests_/react
npm install
npm run lint        # Check for errors
npm run lint:fix    # Auto-fix issues

# Publish (from root folder only)
npm publish
```

## Code Structure

All rules are defined in `index.js` with this structure:

```
index.js
├── imports (fs, path, url)
├── Rule 1 definition (const ruleName = { create(), meta: {} })
├── Rule 2 definition
├── ... (48 rules total)
└── export default { meta: {}, rules: {} }
```

## Rule Implementation Pattern

Every rule follows this exact structure:

```javascript
/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Rule Name Here
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Brief description of what the rule does.
 *
 * Options:
 *   { optionName: defaultValue } - Description of option
 *
 * ✓ Good:
 *   // Example of correct code
 *
 * ✗ Bad:
 *   // Example of incorrect code
 */
const ruleName = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const optionName = options.optionName !== undefined ? options.optionName : defaultValue;

        return {
            NodeType(node) {
                // Rule logic here

                // Report issues with auto-fix
                context.report({
                    fix: (fixer) => fixer.replaceText(node, "fixed code"),
                    message: "Error message describing the issue",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Short description for documentation" },
        fixable: "code",  // Required for auto-fix rules
        schema: [
            {
                additionalProperties: false,
                properties: {
                    optionName: {
                        default: 3,
                        description: "Option description",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",  // "layout" for formatting, "suggestion" for conventions
    },
};
```

### Adding a New Rule

1. Add the rule definition (const) following the pattern above
2. Add to the `rules` object in the default export (keep alphabetical within categories)
3. Update `index.d.ts` to add the rule name to the `RuleNames` type
4. Update `README.md`:
   - Add to the Rules Summary table
   - Add detailed description with examples
5. Add to recommended config if applicable: `recommended-configs/react/eslint.config.js`

## Key Patterns & Conventions

### Source Code Access
```javascript
const sourceCode = context.sourceCode || context.getSourceCode();
```

### Options with Defaults
```javascript
const options = context.options[0] || {};
const maxItems = options.maxItems !== undefined ? options.maxItems : 3;
```

### Getting Tokens
```javascript
const openBracket = sourceCode.getFirstToken(node);
const closeBracket = sourceCode.getLastToken(node);
const tokenBefore = sourceCode.getTokenBefore(node);
const tokenAfter = sourceCode.getTokenAfter(node);
```

### Getting Text
```javascript
const text = sourceCode.getText(node);
const lines = sourceCode.lines;  // Array of all lines
```

### Indentation Calculation
```javascript
const lineText = sourceCode.lines[node.loc.start.line - 1];
const baseIndent = lineText.match(/^\s*/)[0];
const itemIndent = baseIndent + "    ";  // 4 spaces
```

### Fixer Methods
```javascript
fixer.replaceText(node, "new text")
fixer.replaceTextRange([start, end], "new text")
fixer.insertTextBefore(node, "text")
fixer.insertTextAfter(node, "text")
fixer.remove(node)
fixer.removeRange([start, end])
```

### Common Node Type Checks
```javascript
// Check parent type
if (node.parent && node.parent.type === "Property") { }

// Check for specific patterns
if (node.type === "ArrowFunctionExpression") { }
if (node.type === "JSXElement") { }
if (node.type === "ObjectExpression") { }

// React hooks detection
if (/^use[A-Z]/.test(node.callee.name)) { }
```

### Skip Conditions (Common Patterns)
```javascript
// Skip empty structures
if (elements.length === 0) return;

// Skip complex elements
const hasComplexElement = elements.some((el) =>
    el.type === "SpreadElement" ||
    el.type === "ObjectExpression" ||
    el.type === "ArrowFunctionExpression"
);
if (hasComplexElement) return;

// Skip specific parent contexts
if (node.parent?.type === "CallExpression") return;
```

## Rule Categories

Rules are organized in these categories (see default export):

- **Array rules:** `array-*`
- **Arrow function rules:** `arrow-function-*`, `curried-arrow-*`
- **Assignment rules:** `assignment-*`
- **Block statement rules:** `block-statement-*`
- **Comment rules:** `comment-*`
- **Function rules:** `function-*`
- **Hook rules:** `hook-*`
- **If statement rules:** `if-statement-*`, `multiline-if-*`
- **Import/Export rules:** `absolute-imports-*`, `export-*`, `import-*`, `index-export-*`, `module-index-*`
- **JSX rules:** `jsx-*`
- **Member expression rules:** `member-expression-*`
- **Nested call rules:** `nested-call-*`
- **No empty lines rules:** `no-empty-lines-*`
- **Object property rules:** `object-property-*`
- **Opening brackets rules:** `opening-brackets-*`
- **Simple call rules:** `simple-call-*`, `single-argument-*`
- **String property rules:** `string-property-*`
- **Variable rules:** `variable-*`

## Naming Conventions

- **Rule names:** kebab-case (e.g., `array-items-per-line`)
- **Internal variables:** camelCase (e.g., `arrayItemsPerLine`)
- **Handler functions:** end with `Handler` (e.g., `checkPatternHandler`)
- **Options:** camelCase (e.g., `maxItems`, `minProperties`)

## Meta Types

- `type: "layout"` - Formatting/whitespace rules (most rules)
- `type: "suggestion"` - Code convention rules (naming conventions)

## Documentation Files

- `README.md` - Main documentation with all 48 rules
- `recommended-configs/react/README.md` - React config documentation (references main README for rule details)
- `index.d.ts` - TypeScript types for IDE autocomplete

## Important Notes

- All rules must be auto-fixable (`fixable: "code"` in meta)
- Use 4-space indentation throughout
- Object properties in `context.report()` must be alphabetically sorted
- Keep rules self-sufficient (no dependencies on other ESLint rules)
- Test with `_tests_/react/` app before publishing
