# Recommended ESLint Configuration for React Projects

This is the **recommended ESLint flat configuration** for React.js projects (without TypeScript or Tailwind). This configuration provides the ultimate code style consistency by combining:

- **[@stylistic/eslint-plugin](https://eslint.style/)** — Formatting rules (replaces ESLint's deprecated formatting rules)
- **ESLint built-in rules** — Code quality and best practices
- **Third-party plugins** — React, accessibility, import sorting, etc.
- **eslint-plugin-code-style** — Our 48 custom formatting rules

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

**Key Rules Used:**
| Rule | Description |
|------|-------------|
| `react/jsx-closing-bracket-location` | Enforce closing bracket location in JSX |
| `react/jsx-closing-tag-location` | Enforce closing tag location for multiline JSX |
| `react/jsx-curly-spacing` | Enforce spacing inside JSX curly braces |
| `react/jsx-equals-spacing` | Enforce spacing around equals signs in JSX |
| `react/jsx-first-prop-new-line` | Enforce first prop on new line for multiline JSX |
| `react/jsx-indent` | Enforce JSX indentation (4 spaces) |
| `react/jsx-indent-props` | Enforce props indentation (4 spaces) |
| `react/jsx-max-props-per-line` | Enforce one prop per line |
| `react/jsx-newline` | Prevent unnecessary newlines between JSX elements |
| `react/jsx-one-expression-per-line` | Enforce one expression per line in JSX |
| `react/jsx-sort-props` | Enforce alphabetical sorting of props |
| `react/jsx-wrap-multilines` | Enforce parentheses around multiline JSX |
| `react/function-component-definition` | Enforce arrow functions for components |
| `react/self-closing-comp` | Enforce self-closing tags for components without children |

---

### eslint-plugin-react-hooks

**Purpose:** Enforces the Rules of Hooks to prevent common mistakes with React Hooks.

**Key Rules Used:**
| Rule | Description |
|------|-------------|
| `react-hooks/rules-of-hooks` | Enforces Rules of Hooks (included in recommended) |
| `react-hooks/exhaustive-deps` | Disabled - allows flexible dependency arrays |

---

### eslint-plugin-import-x

**Purpose:** Linting rules for ES6+ import/export syntax. Helps maintain clean import statements.

**Key Rules Used:**
| Rule | Description |
|------|-------------|
| `import-x/no-default-export` | Enforce named exports over default exports |
| `import-x/no-cycle` | Disabled - allows circular dependencies when needed |

---

### eslint-plugin-jsx-a11y

**Purpose:** Accessibility linting rules for JSX elements. Helps ensure your app is accessible.

**Key Rules Used:**
| Rule | Description |
|------|-------------|
| `jsx-a11y/anchor-is-valid` | Disabled - flexible anchor usage |
| `jsx-a11y/click-events-have-key-events` | Disabled - flexible event handling |
| `jsx-a11y/label-has-associated-control` | Disabled - flexible label usage |

> Note: Some a11y rules are disabled for flexibility. Enable them based on your accessibility requirements.

---

### eslint-plugin-check-file

**Purpose:** Enforce consistent file and folder naming conventions across your project.

**Key Rules Used:**
| Rule | Description |
|------|-------------|
| `check-file/filename-naming-convention` | Enforce kebab-case for all `.js` and `.jsx` files |
| `check-file/folder-naming-convention` | Enforce kebab-case for all folders in `src/` |

---

### eslint-plugin-perfectionist

**Purpose:** Sorting and organizing code elements for better readability and consistency.

**Key Rules Used:**
| Rule | Description |
|------|-------------|
| `perfectionist/sort-array-includes` | Sort arrays when using `.includes()` method |
| `perfectionist/sort-maps` | Sort Map entries when creating `new Map([...])` |
| `perfectionist/sort-objects` | Sort object keys alphabetically (natural order, case-sensitive) |
| `perfectionist/sort-sets` | Sort Set entries when creating `new Set([...])` |
| `perfectionist/sort-switch-case` | Sort switch case clauses for easier scanning |
| `perfectionist/sort-variable-declarations` | Sort destructured variables and multiple declarations |

---

### eslint-plugin-simple-import-sort

**Purpose:** Easy and automatic sorting of import and export statements.

**Key Rules Used:**
| Rule | Description |
|------|-------------|
| `simple-import-sort/imports` | Auto-sort import statements |
| `simple-import-sort/exports` | Auto-sort export statements |

---

## @stylistic/eslint-plugin Rules

These are formatting rules from `@stylistic/eslint-plugin` (the modern replacement for ESLint's deprecated formatting rules):

### Spacing & Formatting Rules

| Rule | Setting | Description |
|------|---------|-------------|
| `@stylistic/comma-dangle` | `always-multiline` | Require trailing commas in multiline |
| `@stylistic/comma-spacing` | `after: true` | Enforce space after comma |
| `@stylistic/dot-location` | `object` | Dot on same line as object |
| `@stylistic/indent` | `4` | 4-space indentation |
| `@stylistic/jsx-quotes` | `prefer-double` | Prefer double quotes in JSX |
| `@stylistic/key-spacing` | `afterColon: true` | Space after colon in objects |
| `@stylistic/no-extra-semi` | `error` | Remove extra semicolons |
| `@stylistic/no-multi-spaces` | `error` | Disallow multiple spaces |
| `@stylistic/no-multiple-empty-lines` | `max: 1` | Maximum one empty line |
| `@stylistic/object-curly-spacing` | `always` | Spaces inside curly braces |
| `@stylistic/padded-blocks` | `never` | No padding inside blocks |
| `@stylistic/quotes` | `double` | Enforce double quotes |
| `@stylistic/semi` | `always` | Require semicolons |
| `@stylistic/semi-spacing` | `after: true` | Space after semicolon |
| `@stylistic/space-in-parens` | `never` | No spaces inside parentheses |
| `@stylistic/space-infix-ops` | `error` | Spaces around operators |
| `@stylistic/multiline-comment-style` | `bare-block` | Enforce comment style |
| `@stylistic/nonblock-statement-body-position` | `beside` | Position of single-line statements |
| `@stylistic/padding-line-between-statements` | (complex) | Blank lines between statements |

---

## ESLint Built-in Rules

These are native ESLint rules for code quality and best practices:

### Code Style Rules

| Rule | Setting | Description |
|------|---------|-------------|
| `arrow-body-style` | `as-needed` | Require braces only when needed in arrow functions |
| `capitalized-comments` | `error` | Enforce capitalized first letter in comments |
| `curly` | `multi-or-nest` | Require braces for multi-line blocks |
| `dot-notation` | `error` | Use dot notation when possible |
| `eqeqeq` | `error` | Require `===` and `!==` |
| `func-style` | `expression` | Enforce function expressions |
| `no-inline-comments` | `error` | Disallow inline comments |

### Best Practices Rules

| Rule | Setting | Description |
|------|---------|-------------|
| `no-alert` | `error` | Disallow `alert`, `confirm`, `prompt` |
| `no-await-in-loop` | `error` | Disallow `await` inside loops |
| `no-else-return` | `error` | Disallow `else` after `return` |
| `no-lone-blocks` | `error` | Disallow unnecessary nested blocks |
| `no-lonely-if` | `error` | Disallow `if` as only statement in `else` |
| `no-plusplus` | `error` | Disallow `++` and `--` operators |
| `no-var` | `error` | Require `let` or `const` |
| `no-unused-vars` | `error` | Disallow unused variables |
| `no-use-before-define` | `error` | Disallow use before definition |
| `vars-on-top` | `error` | Require variable declarations at top |

### Complexity Controls Rules

| Rule | Setting | Description |
|------|---------|-------------|
| `max-depth` | `4` | Maximum nesting depth |
| `max-nested-callbacks` | `4` | Maximum callback nesting |
| `max-params` | `off` | Maximum function parameters |

---

## eslint-plugin-code-style Rules

Our custom plugin provides **48 auto-fixable rules** that fill the gaps not covered by ESLint's built-in rules or other plugins.

### All Rules Enabled in This Config:

| Rule | Description |
|------|-------------|
| `absolute-imports-only` | Enforce absolute imports using alias (default: `@/`) ⚙️ |
| `array-items-per-line` | Items within threshold on one line (default: ≤3) ⚙️ |
| `array-objects-on-new-lines` | Each object in array on new line |
| `arrow-function-block-body` | Parentheses for multiline arrow expressions |
| `arrow-function-simple-jsx` | Simplify arrow functions returning simple JSX |
| `arrow-function-simplify` | Use implicit return for single statements |
| `assignment-value-same-line` | Value on same line as equals sign |
| `block-statement-newlines` | Proper newlines in block statements |
| `comment-spacing` | Proper comment spacing |
| `curried-arrow-same-line` | Curried functions on same line as `=>` |
| `export-format` | Format exports: collapse specifiers (default: ≤3) ⚙️ |
| `function-call-spacing` | No space before function call parenthesis |
| `function-params-per-line` | Parameters on separate lines when multiline |
| `hook-callback-format` | Consistent React hooks formatting |
| `hook-deps-per-line` | Dependencies on separate lines when exceeding threshold (default: >2) ⚙️ |
| `if-statement-format` | Consistent if statement formatting |
| `import-format` | Format imports: collapse specifiers (default: ≤3) ⚙️ |
| `import-source-spacing` | No spaces in import paths |
| `index-export-style` | Enforce consistent export style in index files (default: shorthand) ⚙️ |
| `jsx-children-on-new-line` | Children on separate lines |
| `jsx-closing-bracket-spacing` | No space before `>` or `/>` |
| `jsx-element-child-new-line` | JSX element children on new lines |
| `jsx-logical-expression-simplify` | Simplify JSX logical expressions |
| `jsx-parentheses-position` | Parentheses on same line as arrow/return |
| `jsx-prop-naming-convention` | camelCase for props |
| `jsx-simple-element-one-line` | Simple elements on one line |
| `jsx-string-value-trim` | No whitespace in string values |
| `jsx-ternary-format` | Consistent ternary formatting |
| `member-expression-bracket-spacing` | No spaces in brackets |
| `function-arguments-format` | Each argument on own line when >= minArgs (default: 2) or multiline ⚙️ |
| `module-index-exports` | Enforce proper exports in module index files (configurable folders) ⚙️ |
| `multiline-if-conditions` | Conditions on separate lines when exceeding threshold (default: >3) ⚙️ |
| `nested-call-closing-brackets` | Closing brackets on same line |
| `no-empty-lines-in-function-calls` | No empty lines in function calls |
| `no-empty-lines-in-function-params` | No empty lines in parameters |
| `no-empty-lines-in-jsx` | No empty lines in JSX |
| `no-empty-lines-in-objects` | No empty lines in objects |
| `no-empty-lines-in-switch-cases` | No empty lines in switch cases |
| `object-property-per-line` | Each property on own line (default: ≥2) ⚙️ |
| `object-property-value-brace` | Brace on same line as colon |
| `object-property-value-format` | Value on same line as colon |
| `opening-brackets-same-line` | Opening brackets on same line |
| `simple-call-single-line` | Simple calls on single line |
| `single-argument-on-one-line` | Single argument on one line |
| `string-property-spacing` | No spaces in string property keys |
| `variable-naming-convention` | camelCase, UPPER_CASE, PascalCase |

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
        extraAllowedFolders: ["features", "modules", "lib"],
        extraDeepImportFolders: ["images", "fonts"],
    }],

    // Add extra module folders for index exports validation
    "code-style/module-index-exports": ["error", {
        extraModuleFolders: ["features", "modules", "lib"],
        extraLazyLoadFolders: ["pages"],
        extraIgnorePatterns: ["*.stories.js", "*.mock.js"],
    }],
}
```

**Default Allowed Folders (absolute-imports-only):**
`actions`, `apis`, `assets`, `atoms`, `components`, `constants`, `contexts`, `data`, `hooks`, `layouts`, `middlewares`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `utils`, `views`

**Default Module Folders (module-index-exports):**
`apis`, `assets`, `atoms`, `components`, `constants`, `contexts`, `data`, `hooks`, `layouts`, `middlewares`, `providers`, `redux`, `requests`, `routes`, `schemas`, `services`, `styles`, `theme`, `utils`, `views`

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

## Future Configurations

Additional configurations for other project types are planned:

- **react-ts-tw** — React + TypeScript + Tailwind CSS
- **next-ts-tw** — Next.js + TypeScript + Tailwind CSS

---

## Support

For issues or feature requests, please visit the [GitHub repository](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style).
