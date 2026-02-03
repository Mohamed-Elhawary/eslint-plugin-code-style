# Recommended ESLint Configuration for React Projects

This is the **recommended ESLint flat configuration** for React.js projects (without TypeScript or Tailwind). This configuration provides the ultimate code style consistency by combining:

- **[@stylistic/eslint-plugin](https://eslint.style/)** — Formatting rules (replaces ESLint's deprecated formatting rules)
- **ESLint built-in rules** — Code quality and best practices
- **Third-party plugins** — React, accessibility, import sorting, etc.
- **eslint-plugin-code-style** — Our 61 custom formatting rules

> **Why @stylistic?** ESLint [deprecated 79 formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules/) in v8.53.0, moving them to `@stylistic/eslint-plugin`. This config uses @stylistic as the modern replacement.

## Why Use This Configuration?

- **Complete Coverage** — Combines @stylistic, ESLint code quality rules, third-party plugins, and our custom rules
- **Battle-Tested** — This configuration has been refined through real-world usage
- **Consistent Code Style** — Reduces code-style differences between team members by ~95%
- **Fully Auto-Fixable** — Most rules support `eslint --fix` for automatic formatting
- **React-Optimized** — Specifically designed for React/JSX projects
- **Future-Proof** — Uses @stylistic instead of deprecated ESLint formatting rules

> **Note:** This configuration is recommended but not mandatory. You can customize it based on your project needs.

---

## Installation

Install all required dependencies:

```bash
npm install --save-dev \
  eslint \
  @eslint/js \
  @stylistic/eslint-plugin \
  globals \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-import-x \
  eslint-plugin-jsx-a11y \
  eslint-plugin-check-file \
  eslint-plugin-perfectionist \
  eslint-plugin-simple-import-sort \
  eslint-plugin-code-style
```

Or with a single line:

```bash
npm install --save-dev eslint @eslint/js @stylistic/eslint-plugin globals eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import-x eslint-plugin-jsx-a11y eslint-plugin-check-file eslint-plugin-perfectionist eslint-plugin-simple-import-sort eslint-plugin-code-style
```

---

## Usage

1. Copy the `eslint.config.js` file to your project root
2. Run ESLint with auto-fix:

```bash
eslint src/ --fix
```

---

## Third-Party Plugins

### eslint-plugin-react

**Purpose:** React-specific linting rules for JSX and React patterns.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `react/jsx-closing-bracket-location` | `line-aligned` | Closing `>` or `/>` aligns with the opening tag for visual consistency |
| `react/jsx-closing-tag-location` | `error` | Closing `</Tag>` must be properly positioned, not floating randomly |
| `react/jsx-curly-spacing` | `never`, `children: true` | No spaces inside `{value}` — keeps JSX compact and consistent |
| `react/jsx-equals-spacing` | `never` | No space around `=` in props: `prop="value"` not `prop = "value"` |
| `react/jsx-first-prop-new-line` | `multiline` | First prop on new line only when element spans multiple lines |
| `react/jsx-indent` | `4` | 4-space indentation for JSX (matches our overall indent style) |
| `react/jsx-indent-props` | `4` | Props indented 4 spaces when on separate lines |
| `react/jsx-max-props-per-line` | `1` | One prop per line for multiline elements — easier to read and diff |
| `react/jsx-newline` | `prevent: true` | No unnecessary blank lines between adjacent JSX elements |
| `react/jsx-one-expression-per-line` | `allow: single-child` | Single children can stay inline: `<T>{x}</T>` is fine |
| `react/jsx-sort-props` | `callbacksLast, shorthandLast` | Props sorted alphabetically, callbacks (`onClick`) at end, shorthand (`disabled`) at end |
| `react/jsx-wrap-multilines` | `parens-new-line` | Multiline JSX wrapped in parentheses with `(` on same line as return/arrow |
| `react/function-component-definition` | `arrow-function` | All components use arrow function syntax: `const X = () => ...` |
| `react/self-closing-comp` | `error` | Use `<Component />` not `<Component></Component>` when no children |

---

### eslint-plugin-react-hooks

**Purpose:** Enforces the Rules of Hooks to prevent common mistakes with React Hooks.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `react-hooks/rules-of-hooks` | `error` (recommended) | Prevents calling hooks conditionally or in loops — catches real bugs |
| `react-hooks/exhaustive-deps` | `off` | Disabled to allow intentional dependency omissions; can be noisy for experienced developers |

---

### eslint-plugin-import-x

**Purpose:** Linting rules for ES6+ import/export syntax. Helps maintain clean import statements.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `import-x/no-default-export` | `error` | Named exports are more refactor-friendly and provide better IDE autocomplete |
| `import-x/no-cycle` | `off` | Circular dependencies sometimes needed; this check is slow on large codebases |
| `import-x/no-unresolved` | `off` | Path aliases like `@/` cause false positives; rely on TypeScript/bundler for this |

---

### eslint-plugin-jsx-a11y

**Purpose:** Accessibility linting rules for JSX elements.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `jsx-a11y/anchor-is-valid` | `off` | React Router's `<Link>` and SPA navigation patterns cause false positives |
| `jsx-a11y/click-events-have-key-events` | `off` | Sometimes div clicks are intentional (modals, overlays); enable if strict a11y needed |
| `jsx-a11y/no-static-element-interactions` | `off` | Same as above — enable for strict accessibility requirements |
| `jsx-a11y/label-has-associated-control` | `off` | Custom form components may not match the expected pattern |

> **Note:** These rules are disabled for flexibility. Enable them if you need strict WCAG compliance.

---

### eslint-plugin-check-file

**Purpose:** Enforce consistent file and folder naming conventions.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `check-file/filename-naming-convention` | `KEBAB_CASE` | Files named `my-component.jsx` not `MyComponent.jsx` — prevents case-sensitivity issues across OS |
| `check-file/folder-naming-convention` | `KEBAB_CASE` for `src/**` | Folders named `my-feature` not `MyFeature` — consistent with file naming |

---

### eslint-plugin-perfectionist

**Purpose:** Automatic sorting of code elements for consistency.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `perfectionist/sort-array-includes` | `natural, asc` | Sort `.includes()` arrays: `["a", "b", "c"]` for easier scanning |
| `perfectionist/sort-maps` | `natural, asc` | Sort `new Map()` entries alphabetically |
| `perfectionist/sort-objects` | `natural, asc, ignoreCase: false` | Sort object keys: `{ a, b, c }` — case-sensitive for consistency |
| `perfectionist/sort-sets` | `natural, asc` | Sort `new Set()` entries alphabetically |
| `perfectionist/sort-switch-case` | `natural, asc` | Sort case labels: `case "a": case "b":` for easier scanning |
| `perfectionist/sort-variable-declarations` | `natural, asc` | Sort destructured: `const { a, b, c } = obj` |

---

### eslint-plugin-simple-import-sort

**Purpose:** Automatic sorting of import and export statements.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `simple-import-sort/imports` | `error` | Auto-sorts imports by type (external, internal, relative) then alphabetically |
| `simple-import-sort/exports` | `error` | Auto-sorts export statements alphabetically |

---

## @stylistic/eslint-plugin Rules

These are formatting rules from `@stylistic/eslint-plugin` — the modern replacement for ESLint's deprecated formatting rules.

### Commas & Semicolons

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `@stylistic/comma-dangle` | `always-multiline` | Trailing commas in multiline make diffs cleaner: adding a line doesn't modify the previous line |
| `@stylistic/comma-spacing` | default (`after: true`) | Space after commas: `[a, b, c]` not `[a,b,c]` — standard JavaScript style |
| `@stylistic/semi` | default (`always`) | Always use semicolons — prevents ASI (automatic semicolon insertion) gotchas |
| `@stylistic/semi-spacing` | default (`after: true`) | Space after semicolons in for loops: `for (;;)` formatted correctly |
| `@stylistic/semi-style` | default (`last`) | Semicolons at end of line, not beginning of next line |
| `@stylistic/no-extra-semi` | `error` | Remove accidental double semicolons `;;` |

### Indentation & Spacing

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `@stylistic/indent` | `4` | 4-space indentation — more readable than 2, especially in deeply nested JSX |
| `@stylistic/no-multi-spaces` | `error` | No multiple spaces — keeps alignment from `   =` style (use prettier for that) |
| `@stylistic/no-multiple-empty-lines` | `max: 1, maxBOF: 0, maxEOF: 0` | Max 1 blank line between code; none at file start/end |
| `@stylistic/space-in-parens` | default (`never`) | No spaces inside parens: `fn(x)` not `fn( x )` |
| `@stylistic/space-infix-ops` | `error` | Spaces around operators: `a + b` not `a+b` |
| `@stylistic/padded-blocks` | `never` | No blank lines at start/end of blocks: `{ code }` not `{\n\ncode\n\n}` |

### Quotes & Strings

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `@stylistic/quotes` | default (`double`) | Double quotes for strings — consistent with JSX attribute style |
| `@stylistic/jsx-quotes` | default (`prefer-double`) | Double quotes in JSX: `<T prop="value">` — HTML-like convention |

### Objects & Properties

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `@stylistic/object-curly-spacing` | `always` | Spaces inside braces: `{ a, b }` not `{a, b}` — more readable |
| `@stylistic/key-spacing` | default (`afterColon: true`) | Space after colon: `{ key: value }` not `{ key:value }` |
| `@stylistic/dot-location` | default (`object`) | Dot stays with object in chained calls: `obj\n  .method()` |

### Misc Formatting

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `@stylistic/nonblock-statement-body-position` | default (`beside`) | Single-line if body beside keyword: `if (x) return;` |
| `@stylistic/multiline-comment-style` | `starred-block` (default) | Multi-line comments use `/* */` with leading `*` on each line |
| `@stylistic/function-paren-newline` | `off` | Let other rules handle function formatting |
| `@stylistic/linebreak-style` | `off` | Don't enforce LF vs CRLF — let git handle line endings |

### Statement Padding

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `@stylistic/padding-line-between-statements` | (see below) | Enforces blank lines in specific situations for readability |

**Padding Rules:**
- Blank line before `return` statements
- Blank line after variable declarations (`const`, `let`, `var`)
- Blank line between consecutive expressions

---

## ESLint Built-in Rules

These are native ESLint rules for code quality and best practices.

### Code Style

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `arrow-body-style` | `as-needed` | Use `() => x` not `() => { return x; }` — cleaner for simple returns |
| `capitalized-comments` | `error` | Comments start with capital letter — looks professional: `// This is a comment` |
| `curly` | `multi-or-nest` | Braces required for multi-line blocks; single-line can omit: `if (x) return;` |
| `dot-notation` | `error, allowKeywords: false` | Use `obj.prop` not `obj["prop"]` when possible — cleaner syntax |
| `eqeqeq` | `error` | Always use `===` and `!==` — prevents type coercion bugs |
| `func-style` | `expression` | Use `const fn = () => {}` not `function fn() {}` — consistent with React component style |
| `no-inline-comments` | `error` | Comments on their own line, not after code — easier to scan |

> **Important:** The `func-style: ["error", "expression"]` rule works together with `code-style/function-declaration-style`. The built-in `func-style` reports the error but does not auto-fix. The `function-declaration-style` rule provides the auto-fix by converting function declarations to arrow function expressions. Both rules should be enabled together. Do not enable `function-declaration-style` if `func-style` is not set to `"expression"` — it would conflict.

### Best Practices

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `no-alert` | `error` | Disallow `alert()`, `confirm()`, `prompt()` — use proper UI components instead |
| `no-await-in-loop` | `error` | Avoid `for` loop with `await` inside — usually should be `Promise.all()` |
| `no-else-return` | `error` | Avoid `else` after `return` — use early returns for cleaner code |
| `no-lone-blocks` | `error` | No unnecessary `{}` blocks — they don't create scope in modern JS |
| `no-lonely-if` | `error` | No `else { if (x) }` — use `else if (x)` instead |
| `no-plusplus` | `error` | No `++` or `--` — use `+= 1` for clarity (avoids precedence confusion) |
| `no-var` | `error` | Use `const` or `let`, never `var` — block scoping prevents bugs |
| `no-unused-vars` | `error` | Remove unused variables — keeps code clean |
| `no-use-before-define` | `error` | Define variables/functions before using them — easier to follow code flow |
| `vars-on-top` | `error` | Variable declarations at top of scope — makes scope clear at a glance |

### Complexity Controls

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `max-depth` | `4` | Maximum 4 levels of nesting — beyond this, extract to functions |
| `max-nested-callbacks` | `4` | Maximum 4 callback levels — beyond this, refactor to async/await or named functions |
| `max-len` | `off` | No line length limit — let Prettier or your IDE handle wrapping |
| `max-lines` | `off` | No file length limit — some files naturally need to be longer |
| `max-params` | `off` | No parameter count limit — sometimes many params are appropriate |
| `complexity` | `off` | No cyclomatic complexity limit — can be noisy for legitimate complex functions |

### Disabled by Default

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `array-callback-return` | `off` | Sometimes intentionally returning undefined from map/filter |
| `consistent-return` | `off` | Sometimes functions legitimately return different types |
| `default-case` | `off` | Not all switches need a default case |
| `no-nested-ternary` | `off` | Nested ternaries can be readable when formatted properly |
| `no-return-assign` | `off` | Assignments in return are sometimes useful (refs, etc.) |
| `camelcase` | `off` | API responses often use snake_case |

---

## eslint-plugin-code-style Rules

Our custom plugin provides **65 auto-fixable rules** (73 total, 8 report-only) that fill the gaps not covered by ESLint's built-in rules or other plugins.

For complete rule descriptions, examples, and configuration options, see the [main README](../../README.md#-rules-summary).

---

## Customization

Feel free to customize this configuration based on your project needs:

```javascript
// In your eslint.config.js
import baseConfig from "./eslint.config.js";

export default [
    ...baseConfig,
    {
        rules: {
            // Override or add rules here
            "code-style/function-naming-convention": "error",
            "max-depth": ["error", 3],
        },
    },
];
```

### Extending Folder Lists

The `absolute-imports-only` and `module-index-exports` rules come with default folder lists. You can extend these without replacing the defaults:

```javascript
rules: {
    // Add extra folders to the allowed imports list
    "code-style/absolute-imports-only": ["error", {
        extraAllowedFolders: ["features", "modules"],
        extraDeepImportFolders: ["images", "fonts"],
    }],

    // Add extra module folders for index exports validation
    "code-style/module-index-exports": ["error", {
        extraModuleFolders: ["features", "modules"],
        extraLazyLoadFolders: ["screens"],
        extraIgnorePatterns: ["*.stories.js", "*.mock.js"],
    }],
}
```

**Default Allowed Folders (absolute-imports-only):**
`actions`, `apis`, `assets`, `atoms`, `components`, `config`, `configs`, `constants`, `contexts`, `data`, `enums`, `helpers`, `hooks`, `interfaces`, `layouts`, `lib`, `middlewares`, `pages`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `ui`, `utils`, `utilities`, `views`

**Default Module Folders (module-index-exports):**
`actions`, `apis`, `assets`, `atoms`, `components`, `config`, `configs`, `constants`, `contexts`, `data`, `enums`, `helpers`, `hooks`, `interfaces`, `layouts`, `lib`, `middlewares`, `pages`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `ui`, `utils`, `utilities`, `views`

### Import/Export/Object Formatting

This config uses these default thresholds for formatting:

| Context | Single Line | Multiline |
|---------|-------------|-----------|
| Imports/Exports | 1-3 specifiers | 4+ specifiers |
| Objects | 1 property | 2+ properties |

**Imports/Exports** are handled entirely by `import-format` and `export-format` rules - they automatically collapse or expand based on specifier count:

```javascript
rules: {
    // Change imports/exports to single line up to 5 specifiers
    "code-style/import-format": ["error", { maxSpecifiers: 5 }],
    "code-style/export-format": ["error", { maxSpecifiers: 5 }],
}
```

**Objects** are handled entirely by `object-property-per-line` - it automatically enforces newline after `{`, each property on its own line, and newline before `}`:

```javascript
rules: {
    // Change objects to require multiline at 3+ properties
    "code-style/object-property-per-line": ["error", { minProperties: 3 }],
}
```

### Export Padding

The `index-export-style` rule handles export padding for all files:
- **Index files**: no blank lines between exports, consistent style
- **Non-index files**: require blank lines between exports

```javascript
// index.js - exports grouped without blank lines
export { ComponentA } from "./component-a";
export { ComponentB } from "./component-b";
export { ComponentC } from "./component-c";

// regular-file.js - blank lines required between exports
export const foo = 1;

export const bar = 2;
```

---

## Support

For issues or feature requests, please visit the [GitHub repository](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style).
