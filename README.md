<div align="center">

# ESLint Plugin Code Style

[![npm version](https://img.shields.io/npm/v/eslint-plugin-code-style?style=for-the-badge&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/eslint-plugin-code-style)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-code-style?style=for-the-badge&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/eslint-plugin-code-style)
[![License](https://img.shields.io/npm/l/eslint-plugin-code-style?style=for-the-badge&color=blue)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/LICENSE)

[![ESLint](https://img.shields.io/badge/ESLint-%3E%3D9.0.0-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-JSX%20Support-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

[![GitHub stars](https://img.shields.io/github/stars/Mohamed-Elhawary/eslint-plugin-code-style?style=for-the-badge&logo=github&color=yellow)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Mohamed-Elhawary/eslint-plugin-code-style?style=for-the-badge&logo=github)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/issues)

<br />

**A powerful ESLint plugin for enforcing consistent code formatting and style rules in React/JSX projects.**

*48 auto-fixable rules to keep your codebase clean and consistent*

</div>

<br />

## 🎯 Why This Plugin?

This plugin provides **rules that don't exist in ESLint's built-in rule set** and are **not available in popular third-party ESLint packages**. These are the style requirements that teams often check manually, making them easy to miss and hard to enforce consistently.

**Key Benefits:**
- **Fills the gaps** — Covers formatting rules that ESLint and other plugins miss
- **Works alongside existing tools** — Complements ESLint's built-in rules and packages like `eslint-plugin-react`, `eslint-plugin-import`, etc.
- **Consistency at scale** — Reduces code-style differences between team members by enforcing uniform formatting across your projects
- **Fully automated** — All 48 rules support auto-fix, eliminating manual style reviews

When combined with ESLint's native rules and other popular plugins, this package helps create a **complete code style solution** that keeps your codebase clean and consistent.

<div align="center">

<br />

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Recommended Configs](#-recommended-configurations) •
[Rules](#-rules-reference) •
[Contributing](#-contributing)

</div>

<br />

## 📁 Recommended Configurations

We provide **ready-to-use ESLint flat configuration files** that combine `eslint-plugin-code-style` with carefully selected third-party plugins and ESLint built-in rules. These configurations represent our battle-tested setup that reduces code-style differences by ~95%.

### 💡 Why Use These Configs?

- **Complete Coverage** — Combines ESLint built-in rules, third-party plugins, and all 48 code-style rules
- **Ready-to-Use** — Copy the config file and start linting immediately
- **Battle-Tested** — These configurations have been refined through real-world usage
- **Fully Documented** — Each config includes detailed instructions and explanations

### 📋 Available Configurations

| Configuration | Description | Link |
|---------------|-------------|------|
| **React** | React.js projects (JavaScript, JSX) | [View Config](./recommended-configs/react/) |
| **React + TS + Tailwind** | React + TypeScript + Tailwind CSS | *Coming Soon* |
| **Next.js + TS + Tailwind** | Next.js + TypeScript + Tailwind CSS | *Coming Soon* |

### ⚡ Quick Start with Recommended Config

1. Navigate to the [recommended-configs](./recommended-configs/) folder
2. Choose the configuration for your project type
3. Follow the installation instructions in the README
4. Copy the `eslint.config.js` to your project root
5. Run `eslint src/ --fix`

> **Note:** Each configuration includes a detailed README with installation commands, plugin explanations, and rule documentation.

<br />

---

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔧 Auto-Fixable Rules
All **48 rules** support automatic fixing with `eslint --fix`. No manual code changes needed.

</td>
<td width="50%">

### ⚛️ React & JSX Support
Built specifically for React projects with comprehensive JSX formatting rules.

</td>
</tr>
<tr>
<td width="50%">

### ✅ ESLint v9+ Ready
Designed for ESLint's new flat config system. Modern and future-proof.

</td>
<td width="50%">

### 📭 Zero Dependencies
Lightweight plugin with no external dependencies. Fast and efficient.

</td>
</tr>
</table>

<br />

## 📦 Installation

```bash
# npm
npm install eslint-plugin-code-style --save-dev

# pnpm
pnpm add eslint-plugin-code-style -D

# yarn
yarn add eslint-plugin-code-style -D
```

### 📋 Requirements

| Dependency | Version |
|------------|---------|
| **ESLint** | `>= 9.0.0` |
| **Node.js** | `>= 18.0.0` |

<br />

## 🚀 Quick Start

Create or update your `eslint.config.js`:

```javascript
import codeStyle from "eslint-plugin-code-style";

export default [
    {
        plugins: {
            "code-style": codeStyle,
        },
        rules: {
            // Enable individual rules
            "code-style/import-format": "error",
            "code-style/jsx-children-on-new-line": "error",
            // ... add more rules as needed
        },
    },
];
```

Then run ESLint with auto-fix:

```bash
eslint src/ --fix
```

<br />

## 📋 Enable All Rules

```javascript
rules: {
    "code-style/array-items-per-line": "error",
    "code-style/array-objects-on-new-lines": "error",
    "code-style/arrow-function-block-body": "error",
    "code-style/arrow-function-simple-jsx": "error",
    "code-style/arrow-function-simplify": "error",
    "code-style/curried-arrow-same-line": "error",
    "code-style/assignment-value-same-line": "error",
    "code-style/block-statement-newlines": "error",
    "code-style/comment-spacing": "error",
    "code-style/function-call-spacing": "error",
    "code-style/function-naming-convention": "error",
    "code-style/function-params-per-line": "error",
    "code-style/hook-callback-format": "error",
    "code-style/hook-deps-per-line": "error",
    "code-style/if-statement-format": "error",
    "code-style/multiline-if-conditions": "error",
    "code-style/absolute-imports-only": "error",
    "code-style/export-format": "error",
    "code-style/import-format": "error",
    "code-style/import-source-spacing": "error",
    "code-style/index-export-style": "error",
    "code-style/module-index-exports": "error",
    "code-style/jsx-children-on-new-line": "error",
    "code-style/jsx-closing-bracket-spacing": "error",
    "code-style/jsx-element-child-new-line": "error",
    "code-style/jsx-logical-expression-simplify": "error",
    "code-style/jsx-parentheses-position": "error",
    "code-style/jsx-prop-naming-convention": "error",
    "code-style/jsx-simple-element-one-line": "error",
    "code-style/jsx-string-value-trim": "error",
    "code-style/jsx-ternary-format": "error",
    "code-style/member-expression-bracket-spacing": "error",
    "code-style/multiline-argument-newline": "error",
    "code-style/multiple-arguments-per-line": "error",
    "code-style/nested-call-closing-brackets": "error",
    "code-style/no-empty-lines-in-function-calls": "error",
    "code-style/no-empty-lines-in-function-params": "error",
    "code-style/no-empty-lines-in-jsx": "error",
    "code-style/no-empty-lines-in-objects": "error",
    "code-style/no-empty-lines-in-switch-cases": "error",
    "code-style/object-property-per-line": "error",
    "code-style/object-property-value-brace": "error",
    "code-style/object-property-value-format": "error",
    "code-style/opening-brackets-same-line": "error",
    "code-style/simple-call-single-line": "error",
    "code-style/single-argument-on-one-line": "error",
    "code-style/string-property-spacing": "error",
    "code-style/variable-naming-convention": "error",
}
```

<br />

---

## 📖 Rules Summary

> All **48 rules** are auto-fixable. See detailed examples for each rule in the [Rules Reference](#-rules-reference) section below.
>
> Rules marked with ⚙️ support customization options (e.g., extending default folder lists).

| Rule | Description |
|------|-------------|
| `array-items-per-line` | Enforce array formatting based on item count (default: ≤3 on one line) ⚙️ |
| `array-objects-on-new-lines` | Enforce array of objects to have each object on a new line |
| `arrow-function-block-body` | Enforce parentheses for arrow functions with multiline expressions |
| `arrow-function-simple-jsx` | Simplify arrow functions returning simple JSX to single line |
| `arrow-function-simplify` | Simplify arrow functions in JSX props with single statement block body |
| `curried-arrow-same-line` | Enforce curried arrow function to start on same line as `=>` |
| `assignment-value-same-line` | Enforce assignment value on same line as equals sign |
| `block-statement-newlines` | Enforce newlines after opening brace and before closing brace |
| `comment-spacing` | Enforce comment spacing and formatting |
| `function-call-spacing` | Enforce no space between function name and opening parenthesis |
| `function-naming-convention` | Enforce function naming conventions (camelCase, verb prefix) |
| `function-params-per-line` | Enforce function parameters on separate lines when multiline |
| `hook-callback-format` | Enforce consistent formatting for React hooks callbacks |
| `hook-deps-per-line` | Enforce each hook dependency on its own line when exceeding threshold (default: >2) ⚙️ |
| `if-statement-format` | Ensure if statement has proper formatting |
| `multiline-if-conditions` | Enforce multiline if conditions when exceeding threshold (default: >3) ⚙️ |
| `absolute-imports-only` | Enforce absolute imports using alias (default: `@/`) instead of relative paths ⚙️ |
| `export-format` | Format exports: `export {` on same line, collapse specifiers (default: ≤3) ⚙️ |
| `import-format` | Format imports: `import {` and `} from` on same line, collapse specifiers (default: ≤3) ⚙️ |
| `import-source-spacing` | Enforce no extra spaces inside import path quotes |
| `index-export-style` | Enforce consistent export style in index files (default: shorthand) ⚙️ |
| `module-index-exports` | Enforce proper exports in module index files (configurable folders) ⚙️ |
| `jsx-children-on-new-line` | Enforce JSX children on separate lines from parent tags |
| `jsx-closing-bracket-spacing` | No space before `>` or `/>` in JSX tags |
| `jsx-element-child-new-line` | JSX element children must be on new lines |
| `jsx-logical-expression-simplify` | Simplify logical expressions in JSX |
| `jsx-parentheses-position` | Enforce opening parenthesis position for JSX in arrow functions |
| `jsx-prop-naming-convention` | Enforce JSX prop naming conventions (camelCase) |
| `jsx-simple-element-one-line` | Simple JSX elements with single child on one line |
| `jsx-string-value-trim` | Disallow leading/trailing whitespace in JSX string values |
| `jsx-ternary-format` | Enforce consistent formatting for JSX ternary expressions |
| `member-expression-bracket-spacing` | Enforce no spaces inside brackets for member expressions |
| `multiline-argument-newline` | Enforce newlines for function calls with multiline arguments |
| `multiple-arguments-per-line` | Enforce multiple arguments to each be on their own line |
| `nested-call-closing-brackets` | Enforce nested function call closing brackets on same line |
| `no-empty-lines-in-function-calls` | Disallow empty lines in function calls |
| `no-empty-lines-in-function-params` | Disallow empty lines in function parameters |
| `no-empty-lines-in-jsx` | Disallow empty lines inside JSX elements |
| `no-empty-lines-in-objects` | Disallow empty lines inside objects |
| `no-empty-lines-in-switch-cases` | Prevent empty lines at the beginning of switch case logic |
| `object-property-per-line` | Enforce each property on its own line (default: ≥2 properties) ⚙️ |
| `object-property-value-brace` | Enforce opening brace on same line as colon for object values |
| `object-property-value-format` | Enforce property value on same line as colon |
| `opening-brackets-same-line` | Enforce opening brackets on same line for function calls |
| `simple-call-single-line` | Simplify simple function calls with arrow function to single line |
| `single-argument-on-one-line` | Enforce single simple argument calls to be on one line |
| `string-property-spacing` | Enforce no extra spaces inside string property keys |
| `variable-naming-convention` | Enforce variable naming conventions (camelCase, UPPER_CASE, PascalCase) |

<br />

---

## 📖 Rules Reference

> All rules are **auto-fixable** using `eslint --fix`

<br />

## 📚 Array Rules

### `array-items-per-line`

Enforce array formatting based on item count. Items within threshold on one line, more items each on its own line.

```javascript
// Good
const arr = [1, 2, 3];
const arr = [
    item1,
    item2,
    item3,
    item4,
];

// Bad
const arr = [1, 2, 3, 4, 5];
const arr = [item1,
    item2, item3];
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxItems` | `integer` | `3` | Maximum items to keep on single line |

```javascript
// Example: Allow up to 4 items on single line
"code-style/array-items-per-line": ["error", { maxItems: 4 }]
```

---

### `array-objects-on-new-lines`

In arrays of objects, each object should start on a new line for better readability.

```javascript
// Good
const items = [
    { id: 1, name: "first" },
    { id: 2, name: "second" },
];

// Bad
const items = [{ id: 1, name: "first" },
    { id: 2, name: "second" }];
```

<br />

## ➡️ Arrow Function Rules

### `arrow-function-block-body`

Arrow functions with complex logic should use block body. Ensures consistent formatting when function body needs multiple statements or complex expressions.

```javascript
// Good
() => {
    doSomething();
    return value;
}

// Bad
() => (doSomething(), value)
```

---

### `arrow-function-simple-jsx`

Simplify arrow functions returning simple JSX to single line by removing unnecessary parentheses and line breaks.

```javascript
// Good
export const X = ({ children }) => <Sidebar>{children}</Sidebar>;

// Bad
export const X = ({ children }) => (
    <Sidebar>{children}</Sidebar>
);
```

---

### `arrow-function-simplify`

Simplify arrow functions that have a single return statement by using implicit return instead of block body.

```javascript
// Good
() => value
(x) => x * 2
items.map(item => item.name)

// Bad
() => { return value; }
(x) => { return x * 2; }
items.map(item => { return item.name; })
```

---

### `curried-arrow-same-line`

Curried arrow function body must start on the same line as the arrow (=>), not on a new line.

```javascript
// Good
const fn = () => async (dispatch) => {
    dispatch(action);
};

// Bad
const fn = () =>
    async (dispatch) => {
        dispatch(action);
    };
```

<br />

## 📐 Spacing & Formatting Rules

### `assignment-value-same-line`

The value in an assignment should start on the same line as the equals sign, not on a new line.

```javascript
// Good
const name = "John";
const data = {
    key: "value",
};

// Bad
const name =
    "John";
const data =
    {
        key: "value",
    };
```

---

### `block-statement-newlines`

Block statements should have proper newlines after the opening brace and before the closing brace.

```javascript
// Good
if (condition) {
    doSomething();
}

// Bad
if (condition) { doSomething(); }
if (condition) {doSomething();}
```

---

### `comment-spacing`

Comments should have proper spacing: a space after the opening delimiter (// or block comment opener), and proper blank lines around comment blocks.

```javascript
// Good
// This is a comment
/* This is a block comment */

// Bad
//This is a comment (missing space)
/*No space after opener*/
```

---

### `member-expression-bracket-spacing`

No spaces inside brackets in computed member expressions. The property name should touch both brackets.

```javascript
// Good
arr[value]
obj[key]

// Bad
arr[ value ]
obj[ key ]
```

---

### `no-empty-lines-in-function-params`

Function parameter lists should not contain empty lines between parameters or after opening/before closing parens.

```javascript
// Good
function test(
    param1,
    param2,
) {}

// Bad
function test(
    param1,

    param2,
) {}
```

---

### `variable-naming-convention`

Variable names should follow naming conventions: camelCase for regular variables, UPPER_CASE for constants, and PascalCase for React components.

```javascript
// Good
const userName = "John";
const MAX_RETRIES = 3;
const UserProfile = () => <div />;
const useCustomHook = () => {};

// Bad
const user_name = "John";
const maxretries = 3;
const userProfile = () => <div />;
```

<br />

## ⚡ Function Rules

### `function-call-spacing`

No space between function name and opening parenthesis.

```javascript
// Good
useDispatch()
myFunction(arg)

// Bad
useDispatch ()
myFunction (arg)
```

---

### `function-naming-convention`

Function names should follow naming conventions: camelCase, starting with a verb, and handlers ending with "Handler".

```javascript
// Good
function getUserData() {}
function handleClick() {}
function isValidEmail() {}
const submitHandler = () => {}

// Bad
function GetUserData() {}
function user_data() {}
function click() {}
```

---

### `function-params-per-line`

When function parameters span multiple lines, each parameter should be on its own line with consistent indentation.

```javascript
// Good
function test(
    param1,
    param2,
    param3,
) {}

// Bad
function test(param1,
    param2, param3) {}
```

<br />

## 🪝 React Hooks Rules

### `hook-callback-format`

Enforce consistent formatting for React hooks like useEffect, useCallback, useMemo with callback and dependency array.

```javascript
// Good
useEffect(
    () => { doSomething(); },
    [dep1, dep2],
);

// Bad
useEffect(() => { doSomething(); }, [dep1, dep2]);
```

---

### `hook-deps-per-line`

React hook dependency arrays with more than the threshold should have each dependency on its own line.

```javascript
// Good
useEffect(() => {}, [dep1, dep2])
useEffect(() => {}, [
    dep1,
    dep2,
    dep3,
])

// Bad
useEffect(() => {}, [dep1, dep2, dep3, dep4])
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxDeps` | `integer` | `2` | Maximum dependencies to keep on single line |

```javascript
// Example: Allow up to 3 dependencies on single line
"code-style/hook-deps-per-line": ["error", { maxDeps: 3 }]
```

<br />

## 🔀 Control Flow Rules

### `if-statement-format`

If statements should have consistent formatting with the opening brace on the same line as the condition and else on the same line as the closing brace.

```javascript
// Good
if (condition) {
    doSomething();
} else {
    doOther();
}

// Bad
if (condition)
{
    doSomething();
}
else
{
    doOther();
}
```

---

### `multiline-if-conditions`

When an if statement has conditions exceeding the threshold, each condition should be on its own line.

```javascript
// Good
if (
    conditionA &&
    conditionB &&
    conditionC &&
    conditionD
) {}

// Bad
if (conditionA &&
    conditionB && conditionC && conditionD) {}
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxOperands` | `integer` | `3` | Maximum operands to keep on single line |

```javascript
// Example: Allow up to 4 operands on single line
"code-style/multiline-if-conditions": ["error", { maxOperands: 4 }]
```

---

### `no-empty-lines-in-switch-cases`

Switch case blocks should not have empty lines at the beginning of the case logic or between consecutive cases.

```javascript
// Good
switch (value) {
    case 1:
        return "one";
    case 2:
        return "two";
}

// Bad
switch (value) {
    case 1:

        return "one";

    case 2:
        return "two";
}
```

<br />

## 📥 Import/Export Rules

### `absolute-imports-only`

Enforce absolute imports from index files only for local paths. Local paths (starting with @/) should only import from folder-level index files.

```javascript
// Good
import { Button } from "@/components";
import { useAuth } from "@/hooks";

// Bad
import { Button } from "@/components/buttons/primary-button";
import { useAuth } from "@/hooks/auth/useAuth";
```

**Default Allowed Folders:**
`actions`, `apis`, `assets`, `atoms`, `components`, `constants`, `contexts`, `data`, `hooks`, `layouts`, `middlewares`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `utils`, `views`

**Customization Options:**

| Option | Type | Description |
|--------|------|-------------|
| `extraAllowedFolders` | `string[]` | Add extra folders to the default list |
| `extraReduxSubfolders` | `string[]` | Add extra redux subfolders (default: `actions`, `reducers`, `store`, `thunks`, `types`) |
| `extraDeepImportFolders` | `string[]` | Add extra folders that allow deep imports (default: `assets`) |
| `aliasPrefix` | `string` | Change the import alias prefix (default: `@/`) |
| `allowedFolders` | `string[]` | Replace default folders entirely |
| `reduxSubfolders` | `string[]` | Replace default redux subfolders entirely |
| `deepImportFolders` | `string[]` | Replace default deep import folders entirely |

```javascript
// Example: Add custom folders to the defaults
"code-style/absolute-imports-only": ["error", {
    extraAllowedFolders: ["features", "modules", "lib"],
    extraDeepImportFolders: ["images", "fonts"]
}]
```

---

### `export-format`

Export statements should have consistent formatting. Ensures `export {` is on the same line, and collapses specifiers to a single line when count is within the limit.

**Works with ESLint's `object-curly-newline`** - This rule collapses small exports to single line, while `object-curly-newline` enforces multiline for larger exports. Set `maxSpecifiers = minProperties - 1` for consistency.

```javascript
// Good
export { a, b, c };

// Bad
export {a,b,c};
export
    { a };
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSpecifiers` | `integer` | `3` | Maximum specifiers to keep on single line |

```javascript
// Example: Match with object-curly-newline minProperties: 5
"code-style/export-format": ["error", { maxSpecifiers: 4 }]
```

---

### `import-format`

Import statements should have consistent formatting. Ensures `import {` and `} from` are on the same line, and collapses specifiers to a single line when count is within the limit.

**Works with ESLint's `object-curly-newline`** - This rule collapses small imports to single line, while `object-curly-newline` enforces multiline for larger imports. Set `maxSpecifiers = minProperties - 1` for consistency.

```javascript
// Good
import { a, b, c } from "module";

// Bad
import {a,b,c} from "module";
import
    { a } from "module";
import { a }
    from "module";
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSpecifiers` | `integer` | `3` | Maximum specifiers to keep on single line |

```javascript
// Example: Match with object-curly-newline minProperties: 5
"code-style/import-format": ["error", { maxSpecifiers: 4 }]
```

---

### `import-source-spacing`

No spaces inside import path quotes. The module path should not have leading or trailing whitespace.

```javascript
// Good
import { Button } from "@mui/material";

// Bad
import { Button } from " @mui/material ";
```

---

### `index-export-style`

Enforce consistent export style in index files. Choose between shorthand re-exports or import-then-export pattern. Also enforces no empty lines between exports/imports.

**Works with ESLint's `padding-line-between-statements`** - This rule enforces grouped exports without blank lines. When using `padding-line-between-statements` with `{ blankLine: "always", prev: "export", next: "export" }`, add a file-specific override for index files to remove the export-export blank line requirement.

**Style: "shorthand" (default)**
```javascript
// Good - shorthand re-exports (no empty lines between them)
export { Button } from "./button";
export { Input, Select } from "./form";
export { StyledCard, StyledCardWithActions } from "./card";
```

**Style: "import-export"**
```javascript
// Good - imports grouped, single export statement at bottom
import { Button } from "./button";
import { Input, Select } from "./form";
import { StyledCard, StyledCardWithActions } from "./card";

export {
    Button,
    Input,
    Select,
    StyledCard,
    StyledCardWithActions,
};
```

**Bad Examples**
```javascript
// Bad - mixing styles
export { Button } from "./button";
import { Input } from "./input";
export { Input };

// Bad - empty lines between shorthand exports
export { Button } from "./button";

export { Input } from "./input";

// Bad - multiple standalone exports (should be one)
import { Button } from "./button";
import { Input } from "./input";
export { Button };
export { Input };
```

**Customization Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `style` | `"shorthand"` \| `"import-export"` | `"shorthand"` | The export style to enforce |

```javascript
// Example: Use shorthand style (default)
"code-style/index-export-style": "error"

// Example: Use import-then-export style
"code-style/index-export-style": ["error", { style: "import-export" }]
```

---

### `module-index-exports`

Ensure module folders have index files that export all contents. Each module folder must have an index file that exports all subfolders and files in the module.

```javascript
// Good
// index.js
export { Button } from "./Button";
export { Input } from "./Input";

// Bad
// Missing exports in index.js
```

**Default Module Folders:**
`apis`, `assets`, `atoms`, `components`, `constants`, `contexts`, `data`, `hooks`, `layouts`, `middlewares`, `providers`, `redux`, `requests`, `routes`, `schemas`, `services`, `styles`, `theme`, `utils`, `views`

**Customization Options:**

| Option | Type | Description |
|--------|------|-------------|
| `extraModuleFolders` | `string[]` | Add extra module folders to the default list |
| `extraLazyLoadFolders` | `string[]` | Add extra lazy load folders (default: `views`) |
| `extraIgnorePatterns` | `string[]` | Add extra ignore patterns (supports wildcards like `*.stories.js`) |
| `moduleFolders` | `string[]` | Replace default module folders entirely |
| `lazyLoadFolders` | `string[]` | Replace default lazy load folders entirely |
| `ignorePatterns` | `string[]` | Replace default ignore patterns entirely |

**Default Ignore Patterns:**
`index.js`, `index.jsx`, `index.ts`, `index.tsx`, `.DS_Store`, `__tests__`, `__mocks__`, `*.test.js`, `*.test.jsx`, `*.spec.js`, `*.spec.jsx`

```javascript
// Example: Add custom folders and patterns to the defaults
"code-style/module-index-exports": ["error", {
    extraModuleFolders: ["features", "modules", "lib"],
    extraLazyLoadFolders: ["pages"],
    extraIgnorePatterns: ["*.stories.js", "*.mock.js"]
}]
```

<br />

## ⚛️ JSX Rules

### `jsx-children-on-new-line`

When a JSX element has multiple children, each child should be on its own line with proper indentation.

```javascript
// Good
<Container>
    <Header />
    <Content />
    <Footer />
</Container>

// Bad
<Container><Header /><Content />
    <Footer /></Container>
```

---

### `jsx-closing-bracket-spacing`

No space before > or /> in JSX tags. The closing bracket should be directly after the last attribute or tag name.

```javascript
// Good
<Button />
<Button className="primary">

// Bad
<Button / >
<Button className="primary" >
```

---

### `jsx-element-child-new-line`

JSX element children (nested JSX elements) must be on their own line, not on the same line as the opening tag.

```javascript
// Good
<Button>
    <Icon />
</Button>

// Bad
<Button><Icon /></Button>
```

---

### `jsx-logical-expression-simplify`

Simplify JSX logical expressions by removing unnecessary parentheses around conditions and JSX elements.

```javascript
// Good
{condition && <Component />}
{isVisible && <Modal />}

// Bad
{(condition) && (<Component />)}
{(isVisible) && (<Modal />)}
```

---

### `jsx-parentheses-position`

JSX return parentheses should be on the same line as the arrow or return keyword, not on a new line.

```javascript
// Good
const Component = () => (
    <div>content</div>
);
return (
    <div>content</div>
);

// Bad
const Component = () =>
    (
        <div>content</div>
    );
return
    (
        <div>content</div>
    );
```

---

### `jsx-prop-naming-convention`

Enforce camelCase naming for JSX props. Allows PascalCase for component reference props, and kebab-case for data-* and aria-*.

```javascript
// Good
<Button onClick={handler} />
<Input data-testid="input" />
<Modal ContentComponent={Panel} />

// Bad
<Button on_click={handler} />
<Input test_id="input" />
```

---

### `jsx-simple-element-one-line`

Simple JSX elements with only a single text or expression child should be collapsed onto a single line.

```javascript
// Good
<Button>{buttonLinkText}</Button>
<Title>Hello</Title>

// Bad
<Button>
    {buttonLinkText}
</Button>
```

---

### `jsx-string-value-trim`

JSX string attribute values should not have leading or trailing whitespace inside the quotes.

```javascript
// Good
className="button"
title="Hello World"

// Bad
className=" button "
title=" Hello World "
```

---

### `jsx-ternary-format`

Format ternary expressions in JSX with proper structure. Simple branches stay on one line, complex branches get parentheses with proper indentation.

```javascript
// Good
{condition ? <Simple /> : <Other />}
{condition ? <Simple /> : (
    <Complex>
        <Child />
    </Complex>
)}

// Bad
{condition
    ? <Simple />
    : <Other />}
```

---

### `no-empty-lines-in-jsx`

JSX elements should not contain empty lines between children or after opening/before closing tags.

```javascript
// Good
<div>
    <span>text</span>
    <span>more</span>
</div>

// Bad
<div>

    <span>text</span>

    <span>more</span>

</div>
```

<br />

## 📞 Call Expression Rules

### `multiline-argument-newline`

When function arguments span multiple lines, each argument should start on its own line with consistent indentation.

```javascript
// Good
fn(
    arg1,
    arg2,
)

// Bad
fn(arg1,
    arg2)
```

---

### `multiple-arguments-per-line`

When a function call has 2+ arguments, each argument should be on its own line with proper indentation.

```javascript
// Good
setValue(
    "numberOfCopies",
    null,
)

// Bad
setValue("numberOfCopies", null)
```

---

### `nested-call-closing-brackets`

Nested function calls (like styled-components) should have closing brackets on the same line: }));

```javascript
// Good
styled(Card)(({ theme }) => ({
    color: theme.color,
}));

// Bad
styled(Card)(({ theme }) => ({
    color: theme.color,
})
);
```

---

### `no-empty-lines-in-function-calls`

Function call arguments should not have empty lines between them or after opening/before closing parentheses.

```javascript
// Good
fn(
    arg1,
    arg2,
)

// Bad
fn(
    arg1,

    arg2,
)
```

---

### `opening-brackets-same-line`

Opening brackets should be on the same line as function/method calls. This applies to objects, arrays, and arrow function parameters.

```javascript
// Good
fn({ prop: value })
.map(({ x }) => x)
fn([1, 2, 3])

// Bad
fn(
    { prop: value }
)
.map(
    ({ x }) => x
)
```

---

### `simple-call-single-line`

Simple function calls with an arrow function containing a simple call expression should be on a single line.

```javascript
// Good
fn(() => call(arg))
lazy(() => import("./module"))

// Bad
fn(
    () => call(arg),
)
```

---

### `single-argument-on-one-line`

Function calls with a single simple argument (literal, identifier, member expression) should be on one line.

```javascript
// Good
fn(arg)
getValue("key")
obj.method(value)

// Bad
fn(
    arg,
)
```

<br />

## 📦 Object Rules

### `no-empty-lines-in-objects`

Object literals should not contain empty lines between properties or after opening/before closing braces.

```javascript
// Good
{
    a: 1,
    b: 2,
}

// Bad
{
    a: 1,

    b: 2,
}
```

---

### `object-property-per-line`

When an object has minProperties or more properties, each property should be on its own line.

**Works with ESLint's `object-curly-newline`** - This rule ensures each property is on separate lines, while `object-curly-newline` enforces the opening/closing brace newlines. Set the same `minProperties` value for consistency.

```javascript
// Good
{
    name: "John",
    age: 30,
}

// Bad
{ name: "John",
    age: 30 }
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minProperties` | `integer` | `2` | Minimum properties to enforce separate lines |

```javascript
// Example: Match with object-curly-newline minProperties: 3
"code-style/object-property-per-line": ["error", { minProperties: 3 }]
```

---

### `object-property-value-brace`

Opening brace of an object value should be on the same line as the colon, not on a new line.

```javascript
// Good
"& a": { color: "red" }

// Bad
"& a":
    { color: "red" }
```

---

### `object-property-value-format`

Object property values should be on the same line as the colon with proper spacing for simple values.

```javascript
// Good
{
    name: "John",
    age: 30,
}

// Bad
{
    name:
        "John",
    age:
        30,
}
```

---

### `string-property-spacing`

String property keys should not have extra leading or trailing spaces inside the quotes.

```javascript
// Good
{ "& a": value }
{ "selector": value }

// Bad
{ " & a ": value }
{ " selector ": value }
```

<br />

---

## 🔧 Auto-fixing

All rules support auto-fixing. Run ESLint with the `--fix` flag:

```bash
# Fix all files in src directory
eslint src/ --fix

# Fix specific file
eslint src/components/MyComponent.jsx --fix

# Fix with specific extensions
eslint "src/**/*.{js,jsx,ts,tsx}" --fix
```

<br />

## 🚫 Disabling Rules

**Disable for a specific line:**
```javascript
// eslint-disable-next-line code-style/rule-name
const code = "violates rule";
```

**Disable for an entire file:**
```javascript
/* eslint-disable code-style/rule-name */
```

**Disable in configuration:**
```javascript
rules: {
    "code-style/rule-name": "off",
}
```

<br />

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br />

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br />

---

<div align="center">

Made with ❤️ by [Mohamed Elhawary](https://hawary.dev)

[![GitHub](https://img.shields.io/badge/GitHub-Mohamed--Elhawary-181717?style=for-the-badge&logo=github)](https://github.com/Mohamed-Elhawary)

</div>
