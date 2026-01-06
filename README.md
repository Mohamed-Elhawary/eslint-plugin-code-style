<div align="center">

# ESLint Plugin Code Style

[![npm version](https://img.shields.io/npm/v/eslint-plugin-code-style?style=for-the-badge&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/eslint-plugin-code-style)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-code-style?style=for-the-badge&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/eslint-plugin-code-style)
[![License](https://img.shields.io/npm/l/eslint-plugin-code-style?style=for-the-badge&color=blue)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/LICENSE)

[![ESLint](https://img.shields.io/badge/ESLint-%3E%3D9.0.0-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-JSX%20Support-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

[![GitHub stars](https://img.shields.io/github/stars/Mohamed-Elhawary/eslint-plugin-code-style?style=for-the-badge&logo=github&color=yellow)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Mohamed-Elhawary/eslint-plugin-code-style?style=for-the-badge&logo=github)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/issues)

<br />

**A powerful ESLint plugin for enforcing consistent code formatting and style rules in React/JSX projects.**

*45+ auto-fixable rules to keep your codebase clean and consistent*

<br />

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Rules](#-rules-reference) •
[Examples](#-examples) •
[Contributing](#-contributing)

</div>

<br />

---

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### Auto-Fixable Rules
All **45+ rules** support automatic fixing with `eslint --fix`. No manual code changes needed.

</td>
<td width="50%">

### React & JSX Support
Built specifically for React projects with comprehensive JSX formatting rules.

</td>
</tr>
<tr>
<td width="50%">

### ESLint v9+ Ready
Designed for ESLint's new flat config system. Modern and future-proof.

</td>
<td width="50%">

### Zero Dependencies
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

### Requirements

| Dependency | Version |
|------------|---------|
| **ESLint** | `>= 9.0.0` |
| **Node.js** | `>= 24.0.0` |

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
    "code-style/absolute-imports-only": "error",
    "code-style/array-items-per-line": "error",
    "code-style/array-objects-on-new-lines": "error",
    "code-style/arrow-function-block-body": "error",
    "code-style/arrow-function-simple-jsx": "error",
    "code-style/arrow-function-simplify": "error",
    "code-style/assignment-value-same-line": "error",
    "code-style/block-statement-newlines": "error",
    "code-style/comment-spacing": "error",
    "code-style/curried-arrow-same-line": "error",
    "code-style/export-format": "error",
    "code-style/function-call-spacing": "error",
    "code-style/function-naming-convention": "error",
    "code-style/function-params-per-line": "error",
    "code-style/hook-callback-format": "error",
    "code-style/hook-deps-per-line": "error",
    "code-style/if-statement-format": "error",
    "code-style/import-format": "error",
    "code-style/import-source-spacing": "error",
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
    "code-style/module-index-exports": "error",
    "code-style/multiline-argument-newline": "error",
    "code-style/multiline-if-conditions": "error",
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

## 📖 Rules Reference

> All rules are **auto-fixable** using `eslint --fix`

<br />

### 📥 Import/Export Rules

| Rule | Description |
|------|-------------|
| `absolute-imports-only` | Enforce absolute imports using `@/` alias instead of relative paths |
| `import-format` | Format imports: `import {` on same line, `} from` on same line, collapse 1-3 specifiers |
| `import-source-spacing` | Enforce no extra spaces inside import path quotes |
| `export-format` | Format exports: `export {` on same line, collapse 1-3 specifiers, multiline for 4+ |
| `module-index-exports` | Enforce proper exports in index files |

<br />

### ⚡ Function Rules

| Rule | Description |
|------|-------------|
| `arrow-function-block-body` | Enforce parentheses for arrow functions with multiline expressions |
| `arrow-function-simplify` | Simplify arrow functions returning simple JSX to single line |
| `arrow-function-simple-jsx` | Simplify arrow functions in JSX props with single statement block body |
| `function-call-spacing` | Enforce no space between function name and opening parenthesis |
| `function-naming-convention` | Enforce function naming conventions (camelCase) |
| `function-params-per-line` | Enforce function parameters on separate lines when more than 2 |
| `curried-arrow-same-line` | Enforce curried arrow function to start on same line as `=>` |

<br />

### 📦 Object Rules

| Rule | Description |
|------|-------------|
| `object-property-per-line` | Enforce each property on its own line when object has 2+ properties |
| `object-property-value-format` | Enforce property value on same line as colon with proper spacing |
| `object-property-value-brace` | Enforce opening brace on same line as colon for object property values |
| `no-empty-lines-in-objects` | Disallow empty lines inside objects |
| `string-property-spacing` | Enforce no extra spaces inside string property keys |

<br />

### 📚 Array Rules

| Rule | Description |
|------|-------------|
| `array-items-per-line` | Enforce array formatting: 3 or less items on one line, more than 3 each on new line |
| `array-objects-on-new-lines` | Enforce array of objects to have each object on a new line |

<br />

### ⚛️ JSX Rules

| Rule | Description |
|------|-------------|
| `jsx-children-on-new-line` | Enforce JSX children on separate lines from parent tags |
| `jsx-closing-bracket-spacing` | No space before `>` or `/>` in JSX tags |
| `jsx-element-child-new-line` | JSX children that are JSX elements must be on new lines |
| `jsx-logical-expression-simplify` | Simplify logical expressions in JSX when right side is single-line |
| `jsx-parentheses-position` | Enforce opening parenthesis position for JSX in arrow functions |
| `jsx-prop-naming-convention` | Enforce JSX prop naming conventions (camelCase) |
| `jsx-simple-element-one-line` | Simple JSX elements with only text/expression children on one line |
| `jsx-string-value-trim` | Disallow leading/trailing whitespace in JSX string values |
| `jsx-ternary-format` | Enforce consistent formatting for JSX ternary expressions |
| `no-empty-lines-in-jsx` | Disallow empty lines inside JSX elements |

<br />

### 📞 Call Expression Rules

| Rule | Description |
|------|-------------|
| `simple-call-single-line` | Simplify simple function calls with arrow function to single line |
| `single-argument-on-line` | Enforce single simple argument calls to be on one line |
| `multiple-arguments-per-line` | Enforce multiple arguments to each be on their own line |
| `multiline-argument-newline` | Enforce newlines for function calls with multiline arguments |
| `nested-call-closing-brackets` | Enforce nested function call closing brackets on same line |
| `no-empty-lines-in-function-calls` | Disallow empty lines in function calls |
| `opening-brackets-same-line` | Enforce opening brackets on same line for function calls |

<br />

### 🪝 React Hooks Rules

| Rule | Description |
|------|-------------|
| `hook-callback-format` | Enforce consistent formatting for React hooks (useEffect, useCallback, etc.) |
| `hook-deps-per-line` | Enforce each hook dependency on its own line when more than 2 dependencies |

<br />

### 🔀 Control Flow Rules

| Rule | Description |
|------|-------------|
| `if-statement-format` | Ensure if statement has proper formatting |
| `multiline-if-conditions` | Enforce multiline if conditions when there are more than 3 operands |
| `no-empty-lines-in-switch-cases` | Prevent empty lines at the beginning of switch case logic |

<br />

### 📐 Spacing & Formatting Rules

| Rule | Description |
|------|-------------|
| `assignment-value-same-line` | Enforce assignment value on same line as equals sign |
| `block-statement-newlines` | Enforce newlines after opening brace and before closing brace |
| `comment-spacing` | Enforce comment spacing and formatting |
| `member-expression-bracket-spacing` | Enforce no spaces inside brackets for member expressions |
| `no-empty-lines-in-function-params` | Disallow empty lines in function parameters |
| `variable-naming-convention` | Enforce variable naming conventions (camelCase) |

<br />

## 💡 Examples

### Import Formatting

```javascript
// ✅ Good - 3 or fewer specifiers on one line
import { Box, Button, Grid } from "@mui/material";

// ✅ Good - 4+ specifiers on multiple lines
import {
    Box,
    Button,
    Grid,
    Typography,
} from "@mui/material";

// ❌ Bad
import {
    Box, Button, Grid } from "@mui/material";
```

<br />

### Function Parameters

```javascript
// ✅ Good - 2 or fewer params on one line
const fn = (a, b) => {};

// ✅ Good - 3+ params on separate lines
const fn = (
    param1,
    param2,
    param3,
) => {};

// ❌ Bad
const fn = (param1, param2, param3) => {};
```

<br />

### JSX Ternary

```javascript
// ✅ Good - Simple ternary on one line
{condition ? <Simple /> : <Other />}

// ✅ Good - Complex ternary with proper formatting
{condition ? (
    <Complex>
        <Children />
    </Complex>
) : (
    <Alternative>
        <Content />
    </Alternative>
)}

// ❌ Bad - Empty lines inside ternary
{condition ? (

    <Button />

) : (

    <Link />

)}
```

<br />

### React Hooks

```javascript
// ✅ Good
useEffect(
    () => {
        doSomething();
    },
    [dependency],
);

// ✅ Good - Simple callback
useEffect(() => doSomething(), []);

// ❌ Bad
useEffect(() => {
    doSomething();
}, [dependency]);
```

<br />

### Multiline Conditions

```javascript
// ✅ Good - 3 or fewer operands on one line
if (a && b && c) {}

// ✅ Good - 4+ operands on multiple lines
if (
    condition1
    && condition2
    && condition3
    && condition4
) {}

// ❌ Bad
if (condition1 && condition2 && condition3 && condition4) {}
```

<br />

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
