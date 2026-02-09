<div align="center">

# ESLint Plugin Code Style

[![npm version](https://img.shields.io/npm/v/eslint-plugin-code-style?style=for-the-badge&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/eslint-plugin-code-style)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-code-style?style=for-the-badge&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/eslint-plugin-code-style)
[![License](https://img.shields.io/npm/l/eslint-plugin-code-style?style=for-the-badge&color=blue)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/LICENSE)

[![ESLint](https://img.shields.io/badge/ESLint-%3E%3D9.0.0-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-JSX%20Support-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%3E%3D3.0.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![GitHub stars](https://img.shields.io/github/stars/Mohamed-Elhawary/eslint-plugin-code-style?style=for-the-badge&logo=github&color=yellow)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Mohamed-Elhawary/eslint-plugin-code-style?style=for-the-badge&logo=github)](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/issues)

<br />

**A powerful ESLint plugin for enforcing consistent code formatting and style rules in React/JSX projects.**

*79 rules (70 auto-fixable, 19 configurable) to keep your codebase clean and consistent*

</div>

<br />

## 🎯 Why This Plugin?

This plugin provides **79 custom rules** (70 auto-fixable, 19 configurable) for code formatting. Built for **ESLint v9 flat configs**.

> **Note:** ESLint [deprecated 79 formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules/) in v8.53.0. Our recommended configs use `@stylistic/eslint-plugin` as the replacement for these deprecated rules.

**Key Benefits:**
- **Fills the gaps** — Provides formatting rules not available in other plugins
- **Works alongside existing tools** — Complements ESLint's built-in rules and packages like eslint-plugin-react, eslint-plugin-import, etc
- **Self-sufficient rules** — Each rule handles complete formatting independently
- **Consistency at scale** — Reduces code-style differences between team members by enforcing uniform formatting across your projects
- **Highly automated** — 70 of 79 rules support auto-fix with `eslint --fix`

When combined with ESLint's native rules and other popular plugins, this package helps create a complete code style solution that keeps your codebase clean and consistent.

<div align="center">

<br />

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Recommended Configs](#-recommended-configurations) •
[Rules](#-rules-categories) •
[Contributing](#-contributing)

</div>

<br />

## 📁 Recommended Configurations

We provide **ready-to-use ESLint flat configuration files** that combine `eslint-plugin-code-style` with carefully selected third-party plugins and ESLint built-in rules. These configurations represent our battle-tested setup that reduces code-style differences by ~95%.

### 💡 Why Use These Configs?

- **Complete Coverage** — Combines ESLint built-in rules, third-party plugins, and all 79 code-style rules
- **Ready-to-Use** — Copy the config file and start linting immediately
- **Battle-Tested** — These configurations have been refined through real-world usage
- **Fully Documented** — Each config includes detailed instructions and explanations

### 📋 Available Configurations

| Configuration | Description | Status |
|---------------|-------------|--------|
| **React** | React.js projects (JavaScript, JSX) | [View Config](./recommended-configs/react/) |
| **React + TS + Tailwind** | React + TypeScript + Tailwind CSS | [View Config](./recommended-configs/react-ts-tw/) |
| **React + TypeScript** | React + TypeScript projects | [View Config](./recommended-configs/react-ts/) |
| **React + Tailwind** | React + Tailwind CSS projects | [View Config](./recommended-configs/react-tw/) |

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
**70 rules** support automatic fixing with `eslint --fix`. **19 rules** have configurable options. 9 rules are report-only (require manual changes).

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
| **Node.js** | `>= 20.0.0` |

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
    "code-style/array-callback-destructure": "error",
    "code-style/array-items-per-line": "error",
    "code-style/array-objects-on-new-lines": "error",
    "code-style/arrow-function-block-body": "error",
    "code-style/arrow-function-simple-jsx": "error",
    "code-style/arrow-function-simplify": "error",
    "code-style/assignment-value-same-line": "error",
    "code-style/block-statement-newlines": "error",
    "code-style/class-method-definition-format": "error",
    "code-style/class-naming-convention": "error",
    "code-style/classname-dynamic-at-end": "error",
    "code-style/classname-multiline": "error",
    "code-style/classname-no-extra-spaces": "error",
    "code-style/classname-order": "error",
    "code-style/comment-format": "error",
    "code-style/component-props-destructure": "error",
    "code-style/component-props-inline-type": "error",
    "code-style/svg-icon-naming-convention": "error",
    "code-style/curried-arrow-same-line": "error",
    "code-style/empty-line-after-block": "error",
    "code-style/enum-format": "error",
    "code-style/enum-type-enforcement": "error",
    "code-style/export-format": "error",
    "code-style/folder-based-naming-convention": "error",
    "code-style/folder-structure-consistency": "error",
    "code-style/no-redundant-folder-suffix": "error",
    "code-style/function-arguments-format": "error",
    "code-style/function-call-spacing": "error",
    "code-style/function-declaration-style": "error",
    "code-style/function-naming-convention": "error",
    "code-style/function-object-destructure": "error",
    "code-style/function-params-per-line": "error",
    "code-style/hook-callback-format": "error",
    "code-style/hook-deps-per-line": "error",
    "code-style/use-state-naming-convention": "error",
    "code-style/if-else-spacing": "error",
    "code-style/if-statement-format": "error",
    "code-style/import-format": "error",
    "code-style/import-source-spacing": "error",
    "code-style/index-export-style": "error",
    "code-style/index-exports-only": "error",
    "code-style/inline-export-declaration": "error",
    "code-style/interface-format": "error",
    "code-style/jsx-children-on-new-line": "error",
    "code-style/jsx-closing-bracket-spacing": "error",
    "code-style/jsx-element-child-new-line": "error",
    "code-style/jsx-logical-expression-simplify": "error",
    "code-style/jsx-parentheses-position": "error",
    "code-style/jsx-prop-naming-convention": "error",
    "code-style/jsx-simple-element-one-line": "error",
    "code-style/jsx-string-value-trim": "error",
    "code-style/jsx-ternary-format": "error",
    "code-style/logical-expression-multiline": "error",
    "code-style/member-expression-bracket-spacing": "error",
    "code-style/module-index-exports": "error",
    "code-style/multiline-if-conditions": "error",
    "code-style/nested-call-closing-brackets": "error",
    "code-style/no-empty-lines-in-function-calls": "error",
    "code-style/no-empty-lines-in-function-params": "error",
    "code-style/no-empty-lines-in-jsx": "error",
    "code-style/no-empty-lines-in-objects": "error",
    "code-style/no-empty-lines-in-switch-cases": "error",
    "code-style/no-hardcoded-strings": "error",
    "code-style/no-inline-type-definitions": "error",
    "code-style/object-property-per-line": "error",
    "code-style/object-property-value-brace": "error",
    "code-style/object-property-value-format": "error",
    "code-style/opening-brackets-same-line": "error",
    "code-style/prop-naming-convention": "error",
    "code-style/react-code-order": "error",
    "code-style/simple-call-single-line": "error",
    "code-style/single-argument-on-one-line": "error",
    "code-style/string-property-spacing": "error",
    "code-style/ternary-condition-multiline": "error",
    "code-style/type-annotation-spacing": "error",
    "code-style/type-format": "error",
    "code-style/typescript-definition-location": "error",
    "code-style/variable-naming-convention": "error",
}
```

<br />

---

## 📖 Rules Categories

> **79 rules total** — 70 with auto-fix 🔧, 19 configurable ⚙️, 9 report-only. See detailed examples in the [Rules Reference](./docs/rules/).
>
> **Legend:** 🔧 Auto-fixable with `eslint --fix` • ⚙️ Customizable options

| Rule | Description |
|------|-------------|
| **Array Rules** | |
| `array-callback-destructure` | Destructured params in array callbacks (map, filter, find) go multiline when ≥2 properties 🔧 |
| `array-items-per-line` | Collapse arrays ≤ threshold to one line; expand larger arrays with each item on own line (default: ≤3) 🔧 ⚙️ |
| `array-objects-on-new-lines` | Each object in an array starts on its own line for better visual scanning 🔧 |
| **Arrow Function Rules** | |
| `arrow-function-block-body` | Wrap multiline arrow function expressions in parentheses for clear boundaries 🔧 |
| `arrow-function-simple-jsx` | Collapse arrow functions returning simple single-element JSX to one line, remove unnecessary parens 🔧 |
| `arrow-function-simplify` | Convert block body with single return to implicit return: `() => { return x; }` → `() => x` 🔧 |
| `curried-arrow-same-line` | Curried arrow functions start on same line as `=>`, not on new line 🔧 |
| **Call Expression Rules** | |
| `function-arguments-format` | Args ≥ threshold or multiline: first arg on new line, each on own line, closing `)` on new line (default: ≥2) 🔧 ⚙️ |
| `nested-call-closing-brackets` | Chain closing brackets on same line: `}));` not scattered across lines 🔧 |
| `no-empty-lines-in-function-calls` | No empty lines between arguments or after `(`/before `)` 🔧 |
| `opening-brackets-same-line` | Opening `{`, `[`, or `(` on same line as function call, not on new line 🔧 |
| `simple-call-single-line` | Collapse simple arrow function calls to single line (including callbacks with params and optional chaining) 🔧 |
| `single-argument-on-one-line` | Single simple argument stays on one line: `fn(x)` not expanded 🔧 |
| **Comment Rules** | |
| `comment-format` | Space after `//`, space inside `/* */`, convert single-line blocks to `//`, no blank lines between file-top comments 🔧 |
| **Component Rules** | |
| `component-props-destructure` | Component props must be destructured `({ prop })` not received as `(props)` 🔧 |
| `component-props-inline-type` | Inline type annotation `} : {` with matching props, proper spacing, commas, no interface reference 🔧 |
| `folder-based-naming-convention` | Enforce naming based on folder: suffix for views/layouts/pages/providers/reducers/contexts/themes, camelCase suffix for data/constants/strings/services/reducers folders, chained folder names for nested files 🔧 |
| `folder-structure-consistency` | Enforce consistent folder structure (flat vs wrapped) in module folders (atoms, components, hooks, enums, views, etc.) ⚙️ |
| `no-redundant-folder-suffix` | Disallow file and folder names that redundantly include the parent folder name as a suffix |
| `svg-icon-naming-convention` | SVG components must end with "Icon" suffix; "Icon" suffix components must return SVG |
| **Class Rules** | |
| `class-method-definition-format` | Consistent spacing in class/method definitions: space before `{`, no space before `(` 🔧 |
| `class-naming-convention` | Class declarations must end with "Class" suffix (e.g., `ApiServiceClass`) 🔧 |
| **Control Flow Rules** | |
| `block-statement-newlines` | Newline after `{` and before `}` in if/for/while/function blocks 🔧 |
| `empty-line-after-block` | Empty line required between closing `}` of block and next statement 🔧 |
| `if-else-spacing` | Empty line between consecutive if blocks, no empty line between single-line if/else 🔧 |
| `if-statement-format` | `{` on same line as `if`/`else if`, `else` on same line as `}`, proper spacing 🔧 |
| `logical-expression-multiline` | Logical expressions (&&, \|\|) with >maxOperands get one operand per line (default: >3) 🔧 ⚙️ |
| `multiline-if-conditions` | Conditions exceeding threshold get one operand per line with proper indentation (default: >3) 🔧 ⚙️ |
| `no-empty-lines-in-switch-cases` | No empty line after `case X:` before code, no empty lines between cases 🔧 |
| `ternary-condition-multiline` | ≤maxOperands always single line; >maxOperands multiline (based on operand count, not line length) 🔧 ⚙️ |
| **Function Rules** | |
| `function-call-spacing` | No space between function name and `(`: `fn()` not `fn ()` 🔧 |
| `function-declaration-style` | Auto-fix for `func-style`: converts function declarations to arrow expressions 🔧 |
| `function-naming-convention` | Functions use camelCase, start with verb, end with Handler suffix; handleXxx → xxxHandler 🔧 |
| `function-object-destructure` | Non-component functions: use typed params (not destructured), destructure in body; report dot notation access 🔧 |
| `function-params-per-line` | When multiline, each param on own line with consistent indentation 🔧 |
| `no-empty-lines-in-function-params` | No empty lines between parameters or after `(`/before `)` 🔧 |
| **Hook Rules** | |
| `hook-callback-format` | React hooks: callback on new line, deps array on separate line, proper indentation 🔧 |
| `hook-deps-per-line` | Collapse deps ≤ threshold to one line; expand larger arrays with each dep on own line (default: >2) 🔧 ⚙️ |
| `use-state-naming-convention` | Boolean useState variables must start with is/has/with/without prefix 🔧 ⚙️ |
| **Import/Export Rules** | |
| `absolute-imports-only` | Use alias imports from index files only (not deep paths), no relative imports; files within the same module folder must use relative imports — auto-fixes absolute imports to relative (default: `@/`) 🔧 ⚙️ |
| `export-format` | `export {` on same line; collapse ≤ threshold to one line; expand larger with each specifier on own line (default: ≤3) 🔧 ⚙️ |
| `import-format` | `import {` and `} from` on same line; collapse ≤ threshold; expand larger with each specifier on own line (default: ≤3) 🔧 ⚙️ |
| `import-source-spacing` | No leading/trailing spaces inside import path quotes 🔧 |
| `index-export-style` | Index files: no blank lines, enforce shorthand or import-export style; Regular files: require blank lines between exports (default: shorthand) 🔧 ⚙️ |
| `index-exports-only` | Index files should only contain imports and re-exports, not code definitions (types, functions, variables, classes) |
| `inline-export-declaration` | Enforce inline export declarations instead of grouped export statements in non-index files 🔧 ⚙️ |
| `module-index-exports` | Index files must export all folder contents (files and subfolders) ⚙️ |
| **JSX Rules** | |
| `classname-dynamic-at-end` | Dynamic expressions (`${className}`) must be at the end of class strings (JSX and variables) 🔧 |
| `classname-multiline` | Long className strings broken into multiple lines; smart detection for objects/returns with Tailwind values 🔧 ⚙️ |
| `classname-no-extra-spaces` | No extra/leading/trailing spaces in class strings; smart detection for objects/returns with Tailwind values 🔧 |
| `classname-order` | Tailwind class ordering in variables/objects/returns; smart detection for Tailwind values 🔧 |
| `jsx-children-on-new-line` | Multiple JSX children: each on own line with proper indentation 🔧 |
| `jsx-closing-bracket-spacing` | No space before `>` or `/>` in JSX tags 🔧 |
| `jsx-element-child-new-line` | Nested JSX elements on new lines; text/expression children can stay inline 🔧 |
| `jsx-logical-expression-simplify` | Remove unnecessary parens around conditions and JSX in logical expressions 🔧 |
| `jsx-parentheses-position` | Opening `(` for multiline JSX on same line as `return`/`=>`, not on new line 🔧 |
| `jsx-prop-naming-convention` | Props: camelCase for regular, kebab-case for data-*/aria-*, PascalCase for component refs |
| `jsx-simple-element-one-line` | Collapse simple JSX with single text/expression child to one line 🔧 |
| `jsx-string-value-trim` | No leading/trailing whitespace inside JSX string attribute values 🔧 |
| `jsx-ternary-format` | Simple ternaries on one line; complex branches get parens with proper indentation 🔧 |
| `no-empty-lines-in-jsx` | No empty lines between children or after opening/before closing tags 🔧 |
| **Object Rules** | |
| `no-empty-lines-in-objects` | No empty lines between properties or after `{`/before `}` 🔧 |
| `object-property-per-line` | Collapse ≤ threshold to one line; expand larger with `{`/`}` on own lines and each property on own line (default: ≥2) 🔧 ⚙️ |
| `object-property-value-brace` | Opening `{` of object value on same line as `:`, not on new line 🔧 |
| `object-property-value-format` | Simple property values on same line as `:`, not on new line 🔧 |
| `string-property-spacing` | No leading/trailing spaces inside string property keys 🔧 |
| **Spacing Rules** | |
| `assignment-value-same-line` | Assignment values start on same line as `=`, not on new line 🔧 |
| `member-expression-bracket-spacing` | No spaces inside brackets in computed member expressions: `arr[0]` not `arr[ 0 ]` 🔧 |
| **TypeScript Rules** | |
| `enum-format` | Enforce enum naming (PascalCase + Enum suffix), UPPER_CASE members, no empty lines, and trailing commas 🔧 |
| `enum-type-enforcement` | Enforce using enum values instead of string literals for variables typed with `*Type` (e.g., use `ButtonVariantEnum.PRIMARY` not `"primary"`) 🔧 |
| `interface-format` | Enforce interface naming (PascalCase + Interface suffix), camelCase properties, no empty lines, and trailing commas 🔧 |
| `no-inline-type-definitions` | Inline union types in function params should be extracted to named types ⚙️ |
| `prop-naming-convention` | Enforce boolean props start with is/has/with/without, callback props start with on 🔧 ⚙️ |
| `type-annotation-spacing` | Enforce consistent spacing in type annotations: no space before colon/generic/array brackets, one space after colon 🔧 |
| `type-format` | Enforce type naming (PascalCase + Type suffix), camelCase properties, union type formatting, and trailing commas 🔧 ⚙️ |
| `typescript-definition-location` | Enforce TypeScript definitions (interfaces, types, enums) to be in designated folders ⚙️ |
| **React Rules** | |
| `react-code-order` | Enforce consistent ordering in components and hooks: props destructure → refs → state → redux → router → context → custom hooks → derived → memo → callback → handlers → effects → return 🔧 |
| **String Rules** | |
| `no-hardcoded-strings` | Enforce importing strings from constants/strings modules instead of hardcoding them ⚙️ |
| **Variable Rules** | |
| `variable-naming-convention` | camelCase for all variables and constants, PascalCase for components, `use` prefix for hooks 🔧 |

<br />

---

## 📖 Rules Reference

For detailed documentation with examples, configuration options, and best practices for each rule, see the **[Rules Reference Documentation](./docs/rules/)**.

| Category | Rules | Highlights |
|----------|:-----:|------------|
| [Arrays](./docs/rules/arrays.md) | 3 | Callback destructuring, items-per-line, objects-on-new-lines |
| [Arrow Functions](./docs/rules/arrow-functions.md) | 4 | Block body, simple JSX, implicit return, curried arrows |
| [Call Expressions](./docs/rules/call-expressions.md) | 6 | Argument formatting, nested brackets, single-line calls |
| [Classes](./docs/rules/classes.md) | 2 | Method formatting, naming conventions |
| [Comments](./docs/rules/comments.md) | 1 | Comment spacing and format |
| [Components](./docs/rules/components.md) | 6 | Props destructure, folder naming, structure consistency |
| [Control Flow](./docs/rules/control-flow.md) | 8 | Block newlines, if/else, logical expressions, ternaries |
| [Functions](./docs/rules/functions.md) | 6 | Call spacing, declaration style, naming, params |
| [Hooks](./docs/rules/hooks.md) | 3 | Callback format, deps-per-line, useState naming |
| [Imports/Exports](./docs/rules/imports-exports.md) | 8 | Absolute imports, format, index exports, module exports |
| [JSX](./docs/rules/jsx.md) | 14 | ClassName handling, children, logical expressions |
| [Objects](./docs/rules/objects.md) | 5 | Property formatting, empty lines, string properties |
| [React](./docs/rules/react.md) | 1 | Component/hook code ordering |
| [Spacing](./docs/rules/spacing.md) | 2 | Assignment values, bracket spacing |
| [Strings](./docs/rules/strings.md) | 1 | No hardcoded strings |
| [TypeScript](./docs/rules/typescript.md) | 8 | Enum/interface/type formatting, definition location |
| [Variables](./docs/rules/variables.md) | 1 | Naming conventions (camelCase, PascalCase) |

<br />

---

## 🔧 Auto-fixing

70 of 79 rules support auto-fixing. Run ESLint with the `--fix` flag:

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

Copyright (c) 2026 Eslint Plugin Code Style. All rights reserved. 

<br />

---

<div align="center">

Made with ❤️ by [Mohamed Elhawary](https://hawary.dev)

[![GitHub](https://img.shields.io/badge/GitHub-Mohamed--Elhawary-181717?style=for-the-badge&logo=github)](https://github.com/Mohamed-Elhawary)

</div>
