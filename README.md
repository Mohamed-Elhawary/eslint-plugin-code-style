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

*76 rules (67 auto-fixable, 17 configurable) to keep your codebase clean and consistent*

</div>

<br />

## 🎯 Why This Plugin?

This plugin provides **75 custom rules** (66 auto-fixable, 17 configurable) for code formatting. Built for **ESLint v9 flat configs**.

> **Note:** ESLint [deprecated 79 formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules/) in v8.53.0. Our recommended configs use `@stylistic/eslint-plugin` as the replacement for these deprecated rules.

**Key Benefits:**
- **Fills the gaps** — Provides formatting rules not available in other plugins
- **Works alongside existing tools** — Complements ESLint's built-in rules and packages like eslint-plugin-react, eslint-plugin-import, etc
- **Self-sufficient rules** — Each rule handles complete formatting independently
- **Consistency at scale** — Reduces code-style differences between team members by enforcing uniform formatting across your projects
- **Highly automated** — 67 of 76 rules support auto-fix with `eslint --fix`

When combined with ESLint's native rules and other popular plugins, this package helps create a complete code style solution that keeps your codebase clean and consistent.

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

- **Complete Coverage** — Combines ESLint built-in rules, third-party plugins, and all 69 code-style rules
- **Ready-to-Use** — Copy the config file and start linting immediately
- **Battle-Tested** — These configurations have been refined through real-world usage
- **Fully Documented** — Each config includes detailed instructions and explanations

### 📋 Available Configurations

| Configuration | Description | Status |
|---------------|-------------|--------|
| **React** | React.js projects (JavaScript, JSX) | [View Config](./recommended-configs/react/) |
| **React + TS + Tailwind** | React + TypeScript + Tailwind CSS | [View Config](./recommended-configs/react-ts-tw/) |
| **React + TypeScript** | React + TypeScript projects | Coming Soon |
| **React + Tailwind** | React + Tailwind CSS projects | Coming Soon |

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
**67 rules** support automatic fixing with `eslint --fix`. **17 rules** have configurable options. 9 rules are report-only (require manual changes).

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
    "code-style/svg-component-icon-naming": "error",
    "code-style/curried-arrow-same-line": "error",
    "code-style/empty-line-after-block": "error",
    "code-style/enum-format": "error",
    "code-style/enum-type-enforcement": "error",
    "code-style/export-format": "error",
    "code-style/folder-component-suffix": "error",
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

> **76 rules total** — 67 with auto-fix 🔧, 17 configurable ⚙️, 9 report-only. See detailed examples in [Rules Reference](#-rules-reference) below.
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
| `folder-component-suffix` | Components in `views/` folder must end with "View", `pages/` with "Page", `layouts/` with "Layout" |
| `svg-component-icon-naming` | SVG components must end with "Icon" suffix; "Icon" suffix components must return SVG |
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
| `absolute-imports-only` | Use alias imports from index files only (not deep paths), no relative imports (default: `@/`) ⚙️ |
| `export-format` | `export {` on same line; collapse ≤ threshold to one line; expand larger with each specifier on own line (default: ≤3) 🔧 ⚙️ |
| `import-format` | `import {` and `} from` on same line; collapse ≤ threshold; expand larger with each specifier on own line (default: ≤3) 🔧 ⚙️ |
| `import-source-spacing` | No leading/trailing spaces inside import path quotes 🔧 |
| `index-export-style` | Index files: no blank lines, enforce shorthand or import-export style; Regular files: require blank lines between exports (default: shorthand) 🔧 ⚙️ |
| `index-exports-only` | Index files should only contain imports and re-exports, not code definitions (types, functions, variables, classes) |
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

> Rules marked with 🔧 are **auto-fixable** using `eslint --fix`

<br />

## 📚 Array Rules

### `array-callback-destructure`

**What it does:** When destructuring parameters in array method callbacks (map, filter, find, etc.), enforces each property on its own line when there are 2 or more properties.

**Why use it:** Improves readability of array transformations by making destructured properties easy to scan vertically.

```javascript
// ✅ Good — each destructured property on its own line
const result = items.map(({
    name,
    value,
}) => `${name}: ${value}`);

const filtered = users.filter(({
    age,
    isActive,
}) => age > 18 && isActive);

// ✅ Good — single property stays inline
const names = items.map(({ name }) => name);

// ❌ Bad — multiple properties on same line
const result = items.map(({ name, value, id }) => `${name}: ${value}`);

// ❌ Bad — hard to scan properties
const data = records.filter(({ status, type, category }) => status === "active");
```

---

### `array-items-per-line`

**What it does:** Controls array formatting based on the number of items. Short arrays stay on one line for compactness, while longer arrays get expanded with each item on its own line for better readability.

**Why use it:** Prevents overly long single-line arrays that are hard to scan, while avoiding unnecessary vertical expansion for simple arrays.

```javascript
// ✅ Good — 3 or fewer items stay compact
const colors = ["red", "green", "blue"];
const nums = [1, 2, 3];

// ✅ Good — 4+ items expand for readability
const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];

// ❌ Bad — too many items on one line
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// ❌ Bad — inconsistent formatting
const items = [item1,
    item2, item3,
    item4];
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

**What it does:** In arrays containing objects, ensures each object starts on its own line regardless of object size.

**Why use it:** Object literals in arrays are visually complex. Putting each on its own line makes it easier to scan, compare, and edit individual items.

```javascript
// ✅ Good — each object clearly separated
const users = [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" },
    { id: 3, name: "Charlie", role: "user" },
];

// ✅ Good — even short objects get their own line
const points = [
    { x: 0, y: 0 },
    { x: 10, y: 20 },
];

// ❌ Bad — objects crammed together
const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];

// ❌ Bad — inconsistent line breaks
const items = [{ id: 1 },
    { id: 2 }, { id: 3 }];
```

<br />

## ➡️ Arrow Function Rules

### `arrow-function-block-body`

**What it does:** Ensures arrow functions with multiline expressions use block body with explicit return, wrapped in parentheses when needed.

**Why use it:** Multiline expressions without block body can be confusing. Clear boundaries with `{` and `}` make the function body obvious.

```javascript
// ✅ Good — block body for complex logic
const handleSubmit = () => {
    validateForm();
    submitData();
    return result;
};

// ✅ Good — multiline JSX wrapped properly
const Button = () => (
    <button className="primary">
        Click me
    </button>
);

// ❌ Bad — comma operator is confusing
const handleSubmit = () => (validateForm(), submitData(), result);

// ❌ Bad — multiline without clear boundaries
const Button = () => <button className="primary">
    Click me
</button>;
```

---

### `arrow-function-simple-jsx`

**What it does:** Collapses arrow functions that return a single simple JSX element onto one line by removing unnecessary parentheses and line breaks.

**Why use it:** Simple component wrappers don't need multi-line formatting. Single-line is more scannable and reduces vertical space.

```javascript
// ✅ Good — simple JSX on one line
export const Layout = ({ children }) => <Container>{children}</Container>;
export const Icon = () => <SVGIcon />;
const Wrapper = (props) => <div {...props} />;

// ❌ Bad — unnecessary multi-line for simple JSX
export const Layout = ({ children }) => (
    <Container>{children}</Container>
);

// ❌ Bad — extra parentheses not needed
const Icon = () => (
    <SVGIcon />
);
```

---

### `arrow-function-simplify`

**What it does:** Converts arrow functions with a single return statement to use implicit return, removing the block body and `return` keyword.

**Why use it:** Implicit returns are more concise and idiomatic JavaScript. They reduce noise and make the code easier to read.

```javascript
// ✅ Good — implicit return
const double = (x) => x * 2;
const getName = (user) => user.name;
const items = data.map((item) => item.value);
const isValid = (x) => x > 0 && x < 100;

// ❌ Bad — unnecessary block body and return
const double = (x) => { return x * 2; };
const getName = (user) => { return user.name; };
const items = data.map((item) => { return item.value; });
const isValid = (x) => { return x > 0 && x < 100; };
```

---

### `curried-arrow-same-line`

**What it does:** Ensures that when an arrow function returns another function, the returned function starts on the same line as `=>`.

**Why use it:** Curried functions are easier to read when the chain is visible. Breaking after `=>` obscures the function structure.

```javascript
// ✅ Good — curried function visible on same line
const createAction = (type) => (payload) => ({ type, payload });

const withLogger = (fn) => (...args) => {
    console.log("Called with:", args);
    return fn(...args);
};

const mapDispatch = () => async (dispatch) => {
    await dispatch(fetchData());
};

// ❌ Bad — chain broken across lines
const createAction = (type) =>
    (payload) => ({ type, payload });

const mapDispatch = () =>
    async (dispatch) => {
        await dispatch(fetchData());
    };
```

<br />

## 📞 Call Expression Rules

### `function-arguments-format`

**What it does:** Enforces consistent formatting for function call arguments:
- Single simple argument stays on one line
- 2+ arguments get one per line
- Multiline arguments trigger full expansion
- React hooks are skipped by default (they have their own rule)

**Why use it:** Consistent argument formatting makes function calls scannable and diffs clean when adding/removing arguments.

```javascript
// ✅ Good — single argument stays compact
fetchUser(userId);
console.log(message);
dispatch(action);

// ✅ Good — 2+ arguments get one per line
setValue(
    "email",
    "user@example.com",
);

createUser(
    name,
    email,
    password,
);

// ✅ Good — multiline argument triggers expansion
processData(
    {
        id: 1,
        name: "test",
    },
);

// ✅ Good — callback with body triggers expansion
items.forEach(
    (item) => {
        process(item);
        save(item);
    },
);

// ❌ Bad — multiple arguments on same line
setValue("email", "user@example.com");
createUser(name, email, password);

// ❌ Bad — inconsistent formatting
fn(arg1,
    arg2, arg3);
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minArgs` | `integer` | `2` | Minimum arguments to enforce multiline |
| `skipHooks` | `boolean` | `true` | Skip React hooks (useEffect, etc.) |
| `skipSingleArg` | `boolean` | `true` | Skip calls with single complex argument |

```javascript
// Example: Require multiline for 3+ arguments
"code-style/function-arguments-format": ["error", { minArgs: 3 }]

// Example: Don't skip React hooks
"code-style/function-arguments-format": ["error", { skipHooks: false }]
```

---

### `nested-call-closing-brackets`

**What it does:** Ensures nested function calls (common in styled-components, HOCs) have closing brackets on the same line: `}));`

**Why use it:** Scattered closing brackets (`}\n);\n` ) waste vertical space and make it harder to see where expressions end.

```javascript
// ✅ Good — closing brackets together
const StyledCard = styled(Card)(({ theme }) => ({
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
}));

const StyledButton = styled("button")(({ theme }) => ({
    backgroundColor: theme.colors.primary,
}));

// ✅ Good — multiple levels
const Component = connect(
    mapStateToProps,
    mapDispatchToProps,
)(withRouter(MyComponent));

// ❌ Bad — closing brackets scattered
const StyledCard = styled(Card)(({ theme }) => ({
    color: theme.palette.text.primary,
})
);

// ❌ Bad — each bracket on its own line
const StyledCard = styled(Card)(({ theme }) => ({
    color: theme.colors.primary,
})
)
;
```

---

### `no-empty-lines-in-function-calls`

**What it does:** Removes empty lines within function call argument lists — between arguments and after opening/before closing parentheses.

**Why use it:** Empty lines between arguments break visual grouping. Arguments should flow as a cohesive list.

```javascript
// ✅ Good — no empty lines
createUser(
    name,
    email,
    password,
    role,
);

fetchData(
    url,
    {
        method: "POST",
        body: data,
    },
);

// ❌ Bad — empty line between arguments
createUser(
    name,

    email,

    password,
);

// ❌ Bad — empty line after opening paren
fetchData(

    url,
    options,
);

// ❌ Bad — empty line before closing paren
fetchData(
    url,
    options,

);
```

---

### `opening-brackets-same-line`

**What it does:** Ensures opening brackets (`{`, `[`, `(`) in function arguments stay on the same line as the function call.

**Why use it:** Opening brackets on new lines create unnecessary indentation and vertical space.

```javascript
// ✅ Good — brackets on same line as call
fn({ key: value });
process([1, 2, 3]);
items.map(({ id }) => id);
configure({ debug: true });

// ✅ Good — multiline content is fine
fn({
    key: value,
    other: data,
});

items.map(({ id, name }) => (
    <Item key={id} name={name} />
));

// ❌ Bad — opening bracket on new line
fn(
    { key: value }
);

process(
    [1, 2, 3]
);

items.map(
    ({ id }) => id
);
```

---

### `simple-call-single-line`

**What it does:** Collapses simple function calls with an arrow function onto one line when the result fits within 120 characters. Handles:
- Zero-param callbacks: `lazy(() => import("./Page"))`
- Callbacks with params and simple expression bodies: `.find((f) => f.code === x)`
- Optional chaining: `.find(...)?.symbol`

**Why use it:** Common patterns like `lazy(() => import(...))` and `.find((item) => item.id === id)` don't need multiline formatting. Single line is cleaner.

```javascript
// ✅ Good — simple patterns on one line
const Page = lazy(() => import("./Page"));
setTimeout(() => callback(), 100);
const symbol = items.find(({ code }) => code === currency)?.symbol;

// ✅ Good — complex callbacks stay multiline
const Page = lazy(() => {
    console.log("Loading page");
    return import("./Page");
});

// ❌ Bad — unnecessary multiline for simple pattern
const Page = lazy(
    () => import("./Page"),
);

const symbol = items.find(({ code }) =>
    code === currency)?.symbol;

const symbol = items.find(({ code }) => code === currency)?.
    symbol;
```

---

### `single-argument-on-one-line`

**What it does:** Ensures function calls with a single simple argument (literal, identifier, member expression) stay on one line.

**Why use it:** Single-argument calls don't need multiline formatting. Expanding them wastes vertical space.

```javascript
// ✅ Good — single argument on one line
fetchUser(userId);
console.log(message);
process(data.items);
dispatch(action);
setValue("key");
getElement(document.body);

// ✅ Good — complex single argument can be multiline
processConfig({
    key: value,
    other: data,
});

// ❌ Bad — simple argument expanded unnecessarily
fetchUser(
    userId,
);

console.log(
    message,
);

dispatch(
    action,
);
```

<br />

## 💬 Comment Rules

### `comment-format`

**What it does:** Enforces proper comment formatting:
- Space after `//` in line comments
- Space after `/*` and before `*/` in block comments
- Single-line block comments converted to line comments
- No blank lines between consecutive comments at file top

**Why use it:** Consistent comment formatting improves readability and maintains a clean, professional codebase.

```javascript
// ✅ Good — proper spacing
// This is a comment
/* This is a block comment */

/*
 * This is a multi-line
 * block comment
 */

// ✅ Good — file-top comments without gaps
// File: utils.js
// Author: John Doe
// License: MIT

// ❌ Bad — missing space after //
//This is a comment

// ❌ Bad — no space in block comment
/*No space*/

// ❌ Bad — single-line block should be line comment
/* This should use // syntax */
```

<br />

## 🏛️ Class Rules

### `class-method-definition-format`

**What it does:** Enforces consistent spacing in class and method definitions:
- Space before opening brace `{` in class declarations
- No space between method name and opening parenthesis `(`
- Space before opening brace `{` in method definitions
- Opening brace must be on same line as class/method signature

**Why use it:** Consistent formatting makes code more readable and prevents common spacing inconsistencies in class definitions.

```javascript
// ✅ Good — proper spacing in class and methods
class ApiServiceClass {
    getDataHandler(): string {
        return "data";
    }

    async fetchUserHandler(id: string): Promise<User> {
        return await this.fetch(id);
    }
}

// ❌ Bad — missing space before { in class
class ApiServiceClass{
    getDataHandler(): string {
        return "data";
    }
}

// ❌ Bad — space between method name and (
class ApiServiceClass {
    getDataHandler (): string {
        return "data";
    }
}

// ❌ Bad — missing space before { in method
class ApiServiceClass {
    getDataHandler(): string{
        return "data";
    }
}

// ❌ Bad — opening brace on different line
class ApiServiceClass {
    getDataHandler(): string
    {
        return "data";
    }
}
```

---

### `class-naming-convention`

**What it does:** Enforces that class declarations must end with "Class" suffix. This distinguishes class definitions from other PascalCase names like React components or type definitions.

**Why use it:** Clear naming conventions prevent confusion between classes, components, and types. The "Class" suffix immediately identifies the construct.

```javascript
// ✅ Good — class ends with "Class"
class ApiServiceClass {
    constructor() {}
    fetch() {}
}

class UserRepositoryClass {
    save(user) {}
}

// ❌ Bad — missing "Class" suffix
class ApiService {
    constructor() {}
}

class UserRepository {
    save(user) {}
}
```

<br />

## 🔀 Control Flow Rules

### `block-statement-newlines`

**What it does:** Enforces newlines after the opening brace `{` and before the closing brace `}` in block statements (if, for, while, etc.).

**Why use it:** Consistent block formatting improves readability. Single-line blocks are harder to scan and edit.

```javascript
// ✅ Good — proper block formatting
if (condition) {
    doSomething();
}

for (const item of items) {
    process(item);
}

while (running) {
    tick();
}

// ❌ Bad — everything on one line
if (condition) { doSomething(); }

// ❌ Bad — no space after brace
if (condition) {doSomething();}

// ❌ Bad — inconsistent formatting
for (const item of items) { process(item);
}
```

---

### `empty-line-after-block`

**What it does:** Requires an empty line between a closing brace `}` of a block statement (if, try, for, while, etc.) and the next statement, unless the next statement is part of the same construct (else, catch, finally).

**Why use it:** Visual separation between logical blocks improves code readability and makes the structure clearer.

> **Note:** Consecutive if statements are handled by `if-else-spacing` rule.

```javascript
// ✅ Good — empty line after block
if (condition) {
    doSomething();
}

const x = 1;

// ✅ Good — else is part of same construct (no empty line needed)
if (condition) {
    doSomething();
} else {
    doOther();
}

// ❌ Bad — no empty line after block
if (condition) {
    doSomething();
}
const x = 1;
```

---

### `if-else-spacing`

**What it does:** Enforces proper spacing between if statements and if-else chains:
- Consecutive if statements with block bodies must have an empty line between them
- Single-line if and else should NOT have empty lines between them

**Why use it:** Maintains visual separation between distinct conditional blocks while keeping related single-line if-else pairs compact.

```javascript
// ✅ Good — empty line between consecutive if blocks
if (!hasValidParams) return null;

if (status === "loading") {
    return <Loading />;
}

if (status === "error") {
    return <Error />;
}

// ✅ Good — no empty line between single-line if-else
if (error) prom.reject(error);
else prom.resolve(token);

// ❌ Bad — no empty line between if blocks
if (!hasValidParams) return null;
if (status === "loading") {
    return <Loading />;
}
if (status === "error") {
    return <Error />;
}

// ❌ Bad — empty line between single-line if-else
if (error) prom.reject(error);

else prom.resolve(token);
```

---

### `if-statement-format`

**What it does:** Enforces consistent if/else formatting:
- Opening `{` on the same line as `if`/`else if`/`else`
- `else` on the same line as the closing `}`
- Proper spacing around keywords

**Why use it:** Consistent brace placement reduces visual noise and follows the most common JavaScript style (K&R / "one true brace style").

```javascript
// ✅ Good — consistent formatting
if (condition) {
    doSomething();

    doMore();
}

if (condition) {
    doSomething();

    doMore();
} else {
    doOther();

    doAnother();
}

if (conditionA) {
    handleA();

    processA();
} else if (conditionB) {
    handleB();

    processB();
} else {
    handleDefault();

    processDefault();
}

// ❌ Bad — brace on new line
if (condition)
{
    doSomething();

    doMore();
}

// ❌ Bad — else on new line
if (condition) {
    doSomething();

    doMore();
}
else {
    doOther();

    doAnother();
}

// ❌ Bad — inconsistent formatting
if (condition)
{
    doSomething();

    doMore();
}
else
{
    doOther();

    doAnother();
}
```

---

### `logical-expression-multiline`

**What it does:** When a logical expression (`&&`, `||`) has more operands than the threshold (default: 3), each operand goes on its own line with the operator at the start.

**Why use it:** Long logical expressions are hard to read on one line. One operand per line makes each part clear and easy to modify.

```javascript
// ✅ Good — 3 or fewer operands stay inline
const isValid = a && b && c;
const result = x || y;

// ✅ Good — 4+ operands get one per line
const err = data.error
    || data.message
    || data.status
    || data.fallback;

const isComplete = hasName
    && hasEmail
    && hasPhone
    && hasAddress;

// ❌ Bad — 4+ operands on single line
const err = data.error || data.message || data.status || data.fallback;
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxOperands` | `integer` | `3` | Maximum operands allowed on a single line |

```javascript
// Configuration example - allow up to 4 operands on single line
"code-style/logical-expression-multiline": ["error", { maxOperands: 4 }]
```

---

### `multiline-if-conditions`

**What it does:** When an if statement has more conditions than the threshold (default: 3), each condition goes on its own line with proper indentation.

**Why use it:** Long conditions are hard to read on one line. One per line makes each condition clear and easy to modify.

```javascript
// ✅ Good — 3 or fewer conditions stay inline
if (isValid && isActive) {}
if (a && b && c) {}

// ✅ Good — 4+ conditions get one per line
if (
    isAuthenticated &&
    hasPermission &&
    !isExpired &&
    isEnabled
) {
    allowAccess();
}

if (
    user.isAdmin ||
    user.isModerator ||
    user.hasSpecialAccess ||
    isPublicResource
) {
    showContent();
}

// ❌ Bad — too many conditions on one line
if (isAuthenticated && hasPermission && !isExpired && isEnabled) {}

// ❌ Bad — inconsistent formatting
if (isAuthenticated &&
    hasPermission && !isExpired &&
    isEnabled) {}
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxOperands` | `integer` | `3` | Maximum operands to keep on single line. Also applies to nested groups |

```javascript
// Example: Allow up to 4 operands on single line
"code-style/multiline-if-conditions": ["error", { maxOperands: 4 }]
```

**Auto-formatting:** Nested groups with >maxOperands are formatted multiline inline:

```javascript
// ❌ Before (nested group has 4 operands)
if ((a || b || c || d) && e) {}

// ✅ After auto-fix — formats nested group multiline
if ((
    a
    || b
    || c
    || d
) && e) {}
```

**Double nesting:** Both levels expand when both exceed maxOperands:

```javascript
// ❌ Before (both parent and nested have 4 operands)
if ((a || (c && d && a && b) || c || d) && e) {}

// ✅ After auto-fix — both levels formatted multiline
if ((
    a
    || (
        c
        && d
        && a
        && b
    )
    || c
    || d
) && e) {}
```

**Extraction:** Groups exceeding nesting level 2 are extracted to variables:

```javascript
// ❌ Before (level 3 nesting)
if ((a && (b || (c && d))) || e) {}

// ✅ After auto-fix — extracts deepest nested group
const isCAndD = (c && d);
if ((a && (b || isCAndD)) || e) {}
```

---

### `no-empty-lines-in-switch-cases`

**What it does:** Removes empty lines at the start of case blocks and between consecutive case statements.

**Why use it:** Empty lines inside switch cases create unnecessary gaps. Cases should flow together as a cohesive block.

```javascript
// ✅ Good — no empty lines
switch (status) {
    case "pending":
        return "Waiting...";
    case "success":
        return "Done!";
    case "error":
        return "Failed";
    default:
        return "Unknown";
}

// ✅ Good — fall-through cases grouped
switch (day) {
    case "Saturday":
    case "Sunday":
        return "Weekend";
    default:
        return "Weekday";
}

// ❌ Bad — empty line after case label
switch (status) {
    case "pending":

        return "Waiting...";
    case "success":
        return "Done!";
}

// ❌ Bad — empty lines between cases
switch (status) {
    case "pending":
        return "Waiting...";

    case "success":
        return "Done!";

    default:
        return "Unknown";
}
```

---

### `ternary-condition-multiline`

**What it does:** Formats ternary expressions based on condition operand count:
- ≤maxOperands (default: 3): Always collapse to single line regardless of line length
- \>maxOperands: Expand to multiline with each operand on its own line
- Simple parenthesized nested ternaries (≤maxOperands) count as 1 operand and collapse
- Complex nested ternaries (>maxOperands in their condition) are skipped for manual formatting
- Nesting level is fixed at 2 to prevent overly complex conditions

**Why use it:** Consistent formatting based on complexity, not line length. Simple conditions stay readable on one line; complex conditions get proper multiline formatting.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxOperands` | `integer` | `3` | Maximum condition operands to keep ternary on single line. Also applies to nested groups |

```javascript
// ✅ Good — ≤3 operands always on single line
const x = a && b && c ? "yes" : "no";
const url = lang === "ar" ? `${apiEndpoints.exam.status}/${jobId}?lang=ar` : `${apiEndpoints.exam.status}/${jobId}`;

// ✅ Good — parenthesized nested ternary counts as 1 operand
const inputType = showToggle ? (showPassword ? "text" : "password") : type;

// ✅ Good — >3 operands formatted multiline
const style = variant === "ghost"
    || variant === "ghost-danger"
    || variant === "muted"
    || variant === "primary"
    ? "transparent"
    : "solid";

// ✅ Good — nested group with >3 operands formatted multiline inline
const result = (
    a
    || (
        c
        && d
        && a
        && b
    )
    || c
    || d
) && e ? "yes" : "no";

// ❌ Bad — ≤3 operands split across lines
const x = a && b && c
    ? "yes"
    : "no";

// ❌ Bad — >3 operands crammed on one line
const style = variant === "ghost" || variant === "ghost-danger" || variant === "muted" || variant === "primary" ? "transparent" : "solid";
```

**Auto-extraction:** Nested groups are auto-extracted to variables only when nesting depth exceeds 2 levels:

```javascript
// ❌ Before (level 3 nesting exceeds limit)
const result = (a && (b || (c && d))) || e ? "yes" : "no";

// ✅ After auto-fix — extracts deepest nested group
const isCAndD = (c && d);
const result = (a && (b || isCAndD)) || e ? "yes" : "no";
```

**Note:** When nested groups exceed `maxOperands` but stay within the 2-level nesting limit, they are formatted multiline inline (not extracted).

<br />

## ⚡ Function Rules

### `function-call-spacing`

**What it does:** Removes any space between a function name and its opening parenthesis.

**Why use it:** Standard JavaScript convention. `fn()` is correct, `fn ()` looks like a typo and can cause confusion.

```javascript
// ✅ Good — no space before parenthesis
useDispatch();
myFunction(arg);
console.log("message");
array.map((x) => x * 2);
obj.method();

// ❌ Bad — space before parenthesis
useDispatch ();
myFunction (arg);
console.log ("message");
array.map ((x) => x * 2);
```

---

### `function-declaration-style`

**What it does:** Converts function declarations to `const` arrow function expressions. This is the auto-fixable companion to ESLint's built-in `func-style` rule.

**Why use it:** The built-in `func-style: ["error", "expression"]` rule reports function declarations but does not auto-fix them. This rule provides the auto-fix. Both rules should be used together for the best experience.

> **Important:** This rule depends on `func-style: ["error", "expression"]` being configured. If `func-style` is set to `"declaration"` or is disabled, do not enable this rule — it would conflict.

```typescript
// ✅ Good — arrow function expression
export const getToken = (): string | null => getCookie(tokenKey);

export const clearAuth = (): void => {
    removeToken();
    clearStorage();
};

const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};

// ❌ Bad — function declaration
export function getToken(): string | null {
    return getCookie(tokenKey);
}

export function clearAuth(): void {
    removeToken();
    clearStorage();
}

function isAuthenticated(): boolean {
    const token = getToken();
    return !!token;
}
```

---

### `function-naming-convention`

**What it does:** Enforces naming conventions for functions:
- **camelCase** required
- **Verb prefix** required (get, set, fetch, is, has, can, should, click, submit, etc.)
- **Handler suffix** required (all functions must end with `Handler`)
- **Auto-fixes** `handleXxx` to `xxxHandler` (avoids redundant `handleClickHandler`)
- **Auto-fixes** PascalCase to camelCase for verb-prefixed functions

**Why use it:** Function names should describe actions. Verb prefixes make the purpose immediately clear, and consistent Handler suffix makes event handlers easy to identify.

```javascript
// ✅ Good — verb prefix + Handler suffix
function getUserDataHandler() {}
function setUserNameHandler(name) {}
function clickHandler() {}
function submitHandler() {}
function isValidEmailHandler(email) {}
function hasPermissionHandler(user) {}
function canAccessHandler(resource) {}
const fetchUsersHandler = async () => {};

// ❌ Bad (auto-fixed) — handleXxx → xxxHandler
function handleClick() {}    // → clickHandler
function handleSubmit() {}   // → submitHandler
function handleChange() {}   // → changeHandler

// ❌ Bad (auto-fixed) — missing Handler suffix
function getUserData() {}    // → getUserDataHandler
function setUserName() {}    // → setUserNameHandler
function fetchUsers() {}     // → fetchUsersHandler

// ❌ Bad (auto-fixed) — PascalCase to camelCase
function GetUserData() {}    // → getUserDataHandler
function FetchStatus() {}    // → fetchStatusHandler
```

---

### `function-object-destructure`

**What it does:** Enforces that non-component functions should not destructure parameters in the function signature. Instead, use a typed parameter and destructure at the top of the function body. Also reports when parameters are accessed via dot notation (suggesting destructuring).

**Why use it:** Keeping function signatures clean and short improves readability. Destructuring in the body makes it clear what properties are being used. For React components, this rule does NOT apply — components should destructure props in the signature.

```typescript
// ✅ Good — typed param with destructuring in body
const createUserHandler = async (data: CreateUserParamsInterface) => {
    const { age, email, isActive, name } = data;

    // Use age, email, isActive, name...
};

const updateUserHandler = (params: UpdateParamsInterface) => {
    const { id, updates } = params;

    // Use id, updates...
};

// ✅ Good — React components CAN destructure in signature
const UserCard = ({
    name,
    email,
} : {
    name: string,
    email: string,
}) => (
    <div>{name} - {email}</div>
);

// ❌ Bad — non-component function destructures in signature
const createUserHandler = async ({
    age,
    email,
    isActive,
    name,
}: CreateUserParamsInterface) => {
    // ...
};

// ❌ Bad — accessing param via dot notation (should destructure)
const processDataHandler = (data: DataInterface) => {
    console.log(data.id);      // Bad: use destructuring
    console.log(data.name);    // Bad: use destructuring
    return data.value * 2;     // Bad: use destructuring
};
```

---

### `function-params-per-line`

**What it does:** When function parameters span multiple lines, ensures each parameter is on its own line with consistent indentation.

**Why use it:** Mixed formatting (some params on same line, some on different lines) is confusing. One per line is scannable and easy to edit.

```javascript
// ✅ Good — each param on own line
function createUser(
    name,
    email,
    password,
    role,
) {}

const handler = (
    event,
    context,
    callback,
) => {};

// ✅ Good — short params can stay on one line
function add(a, b) {}

// ❌ Bad — mixed formatting
function createUser(name,
    email, password,
    role) {}

// ❌ Bad — some on same line, some not
const handler = (event, context,
    callback) => {};
```

---

### `no-empty-lines-in-function-params`

**What it does:** Removes empty lines within function parameter lists — between parameters and after opening/before closing parentheses.

**Why use it:** Empty lines in parameter lists waste space and make parameters harder to scan as a group.

```javascript
// ✅ Good — no empty lines
function createUser(
    name,
    email,
    role,
) {}

const handler = (
    event,
    context,
) => {};

// ❌ Bad — empty line between params
function createUser(
    name,

    email,

    role,
) {}

// ❌ Bad — empty line after opening paren
const handler = (

    event,
    context,
) => {};
```

<br />

## 🪝 Hook Rules

### `hook-callback-format`

**What it does:** Enforces consistent multi-line formatting for React hooks that take a callback and dependency array (useEffect, useCallback, useMemo, useLayoutEffect).

**Why use it:** Hooks with callbacks and dependencies are complex. Multi-line formatting makes the callback, return cleanup, and dependencies clearly visible.

```javascript
// ✅ Good — callback and deps clearly separated
useEffect(
    () => {
        fetchData();
    },
    [userId],
);

useCallback(
    () => {
        handleSubmit(data);
    },
    [data, handleSubmit],
);

useMemo(
    () => expensiveCalculation(items),
    [items],
);

// ✅ Good — cleanup function visible
useEffect(
    () => {
        const subscription = subscribe();

        return () => subscription.unsubscribe();
    },
    [subscribe],
);

// ❌ Bad — everything crammed on one line
useEffect(() => { fetchData(); }, [userId]);

// ❌ Bad — hard to see dependencies
useCallback(() => { handleSubmit(data); }, [data, handleSubmit]);
```

---

### `hook-deps-per-line`

**What it does:** When a hook's dependency array exceeds the threshold (default: 2), each dependency goes on its own line.

**Why use it:** Long dependency arrays are hard to scan and diff. One per line makes it easy to see what changed and catch missing/extra dependencies.

```javascript
// ✅ Good — 2 or fewer deps stay inline
useEffect(() => {}, [userId]);
useEffect(() => {}, [userId, token]);

// ✅ Good — 3+ deps get one per line
useEffect(
    () => {},
    [
        userId,
        token,
        refreshToken,
    ],
);

useCallback(
    () => handleSubmit(data),
    [
        data,
        handleSubmit,
        validateForm,
        showError,
    ],
);

// ❌ Bad — too many deps on one line
useEffect(() => {}, [userId, token, refreshToken, apiUrl]);

// ❌ Bad — deps should be one per line when expanded
useEffect(() => {}, [
    userId, token, refreshToken,
]);
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

### `use-state-naming-convention`

**What it does:** Enforces boolean useState variables to start with valid prefixes (is, has, with, without).

**Why use it:** Consistent boolean state naming makes code more predictable and self-documenting. When you see `isLoading`, you immediately know it's a boolean state.

```typescript
// ✅ Good — boolean state with proper prefix
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState<boolean>(false);
const [isAuthenticated, setIsAuthenticated] = useState(true);
const [withBorder, setWithBorder] = useState(false);

// ❌ Bad — boolean state without prefix
const [loading, setLoading] = useState(false);
const [authenticated, setAuthenticated] = useState<boolean>(true);
const [error, setError] = useState<boolean>(false);
```

**Customization Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `booleanPrefixes` | `string[]` | `["is", "has", "with", "without"]` | Replace default prefixes entirely |
| `extendBooleanPrefixes` | `string[]` | `[]` | Add additional prefixes to defaults |
| `allowPastVerbBoolean` | `boolean` | `false` | Allow past verb names without prefix (disabled, selected) |
| `allowContinuousVerbBoolean` | `boolean` | `false` | Allow continuous verb names without prefix (loading, saving) |

```javascript
// Example: Allow "loading" and "disabled" without prefix
"code-style/use-state-naming-convention": ["error", {
    allowPastVerbBoolean: true,
    allowContinuousVerbBoolean: true
}]

// Example: Add "should" prefix
"code-style/use-state-naming-convention": ["error", {
    extendBooleanPrefixes: ["should"]
}]
```

<br />

## 📥 Import/Export Rules

### `absolute-imports-only`

**What it does:** Enforces importing from folder index files using absolute paths (aliases like `@/`) instead of relative paths or deep file imports.

**Why use it:**
- Absolute imports are cleaner than `../../../components`
- Index imports create a public API for each folder
- Refactoring file locations doesn't break imports
- Encourages proper module organization

```javascript
// ✅ Good — import from index files using alias
import { Button, Input } from "@/components";
import { useAuth, useUser } from "@/hooks";
import { fetchUsers } from "@/apis";
import { formatDate } from "@/utils";

// ✅ Good — assets allow deep imports by default
import logo from "@/assets/images/logo.png";

// ❌ Bad — relative imports
import { Button } from "../../components";
import { useAuth } from "../../../hooks";

// ❌ Bad — deep imports into component internals
import { Button } from "@/components/buttons/primary-button";
import { useAuth } from "@/hooks/auth/useAuth";
import { fetchUsers } from "@/apis/users/fetchUsers";
```

**Default Allowed Folders:**
`actions`, `apis`, `assets`, `atoms`, `components`, `config`, `configs`, `constants`, `contexts`, `data`, `enums`, `helpers`, `hooks`, `interfaces`, `layouts`, `lib`, `middlewares`, `pages`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `ui`, `utils`, `utilities`, `views`

**Customization Options:**

| Option | Type | Description |
|--------|------|-------------|
| `extraAllowedFolders` | `string[]` | Add custom folders that can be imported with `@/folder`. Extends defaults without replacing them. Use when your project has folders like `features/`, `modules/`, etc. |
| `extraReduxSubfolders` | `string[]` | Add Redux-related subfolders that can be imported directly (`@/selectors`) or nested (`@/redux/selectors`). Default subfolders: `actions`, `reducers`, `store`, `thunks`, `types` |
| `extraDeepImportFolders` | `string[]` | Add folders where direct file imports are allowed (`@/assets/images/logo.svg`). Use for folders without index files like images, fonts, etc. Default: `assets` |
| `aliasPrefix` | `string` | Change the path alias prefix if your project uses something other than `@/` (e.g., `~/`, `src/`) |
| `allowedFolders` | `string[]` | Completely replace the default allowed folders list. Use only if you need full control over which folders are valid |
| `reduxSubfolders` | `string[]` | Completely replace the default Redux subfolders list |
| `deepImportFolders` | `string[]` | Completely replace the default deep import folders list |

```javascript
// Example: Add custom folders to the defaults
"code-style/absolute-imports-only": ["error", {
    extraAllowedFolders: ["features", "modules"],
    extraDeepImportFolders: ["images", "fonts"]
}]
```

---

### `export-format`

**What it does:** Formats export statements consistently:
- `export {` always on the same line as `export` keyword
- ≤3 specifiers stay on one line (collapsed)
- 4+ specifiers get one per line (expanded)
- Proper spacing and trailing commas

**Why use it:** Consistent export formatting improves readability. Short exports stay compact, long exports become scannable.

```javascript
// ✅ Good — 3 or fewer specifiers stay compact
export { Button };
export { Button, Input };
export { Button, Input, Select };

// ✅ Good — 4+ specifiers expand with one per line
export {
    Button,
    Input,
    Select,
    Checkbox,
};

// ✅ Good — re-exports follow same rules
export { Button, Input, Select } from "./components";
export {
    createUser,
    updateUser,
    deleteUser,
    getUser,
} from "./api";

// ❌ Bad — no spaces
export {Button,Input,Select};

// ❌ Bad — keyword on different line
export
    { Button };

// ❌ Bad — too many on one line
export { Button, Input, Select, Checkbox, Radio };
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSpecifiers` | `integer` | `3` | Maximum specifiers to keep on single line |

```javascript
"code-style/export-format": ["error", { maxSpecifiers: 4 }]
```

---

### `import-format`

**What it does:** Formats import statements consistently:
- `import {` on the same line as `import` keyword
- `} from` on the same line as closing brace
- ≤3 specifiers stay on one line (collapsed)
- 4+ specifiers get one per line (expanded)

**Why use it:** Consistent import formatting improves readability and makes diffs cleaner when adding/removing imports.

```javascript
// ✅ Good — 3 or fewer specifiers stay compact
import { useState } from "react";
import { Button, Input } from "@/components";
import { get, post, put } from "@/api";

// ✅ Good — 4+ specifiers expand with one per line
import {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

import {
    Button,
    Input,
    Select,
    Checkbox,
} from "@/components";

// ❌ Bad — no spaces
import {useState,useEffect} from "react";

// ❌ Bad — keyword on different line
import
    { Button } from "@/components";

// ❌ Bad — from on different line
import { Button }
    from "@/components";

// ❌ Bad — too many on one line
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSpecifiers` | `integer` | `3` | Maximum specifiers to keep on single line |

```javascript
"code-style/import-format": ["error", { maxSpecifiers: 4 }]
```

---

### `import-source-spacing`

**What it does:** Removes any leading or trailing whitespace inside import path strings.

**Why use it:** Spaces in module paths are almost always typos and can cause import resolution issues.

```javascript
// ✅ Good — no extra spaces
import { Button } from "@mui/material";
import React from "react";
import styles from "./styles.css";

// ❌ Bad — leading space
import { Button } from " @mui/material";

// ❌ Bad — trailing space
import React from "react ";

// ❌ Bad — both
import styles from " ./styles.css ";
```

---

### `index-export-style`

**What it does:** Enforces different export formatting rules for index files vs regular files:
- **Index files**: No blank lines between exports, use shorthand or import-export style
- **Regular files**: Require blank lines between exports

**Why use it:** Index files are re-export aggregators and should be compact. Regular files benefit from spacing between exports for readability.

**Regular files (non-index):**
```javascript
// ✅ Good — blank lines between exports
export const API_URL = "/api";

export const MAX_RETRIES = 3;

export const fetchData = async () => {};

// ❌ Bad — no blank lines in regular file
export const API_URL = "/api";
export const MAX_RETRIES = 3;
export const fetchData = async () => {};
```

**Index files — Style: "shorthand" (default):**
```javascript
// ✅ Good — shorthand re-exports, no blank lines
export { Button } from "./button";
export { Input, Select } from "./form";
export { Modal } from "./modal";
export { useAuth, useUser } from "./hooks";
```

**Index files — Style: "import-export":**
```javascript
// ✅ Good — imports grouped, single export at bottom
import { Button } from "./button";
import { Input, Select } from "./form";
import { Modal } from "./modal";

export {
    Button,
    Input,
    Modal,
    Select,
};
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `style` | `"shorthand"` \| `"import-export"` | `"shorthand"` | Export style for index files |

```javascript
"code-style/index-export-style": ["error", { style: "import-export" }]
```

---

### `index-exports-only`

**What it does:** Index files (`index.ts`, `index.tsx`, `index.js`, `index.jsx`) should only contain imports and re-exports, not any code definitions. All definitions (types, interfaces, functions, variables, classes) should be moved to separate files.

**Why use it:** Index files should be "barrels" that aggregate exports from a module. Mixing definitions with re-exports makes the codebase harder to navigate and can cause circular dependency issues.

```javascript
// ✅ Good — index.ts with only imports and re-exports
export { Button } from "./Button";
export { helper } from "./utils";
export type { ButtonProps } from "./types";
export * from "./constants";

// ❌ Bad — index.ts with code definitions
export type ButtonVariant = "primary" | "secondary";  // Move to types.ts
export interface ButtonProps { ... }                  // Move to types.ts
export const CONSTANT = "value";                      // Move to constants.ts
export function helper() { ... }                      // Move to utils.ts
```

---

### `module-index-exports`

**What it does:** Ensures module folders have index files that export all their contents, creating a proper public API for each module.

**Why use it:** Index files allow importing from the folder level (`@/components`) instead of deep paths (`@/components/Button/Button`). This enforces proper module boundaries.

```javascript
// ✅ Good — components/index.js exports everything
export { Button } from "./Button";
export { Input } from "./Input";
export { Select } from "./Select";
export { Modal } from "./Modal";

// Then consumers can import cleanly:
import { Button, Input, Select } from "@/components";

// ❌ Bad — missing exports in index.js
// If Button exists but isn't exported from index.js,
// consumers have to use deep imports:
import { Button } from "@/components/Button/Button"; // Avoid this!
```

**Default Module Folders:**
`actions`, `apis`, `assets`, `atoms`, `components`, `config`, `configs`, `constants`, `contexts`, `data`, `enums`, `helpers`, `hooks`, `interfaces`, `layouts`, `lib`, `middlewares`, `pages`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `ui`, `utils`, `utilities`, `views`

**Default Ignore Patterns:**
`index.js`, `index.jsx`, `index.ts`, `index.tsx`, `.DS_Store`, `__tests__`, `__mocks__`, `*.test.js`, `*.test.jsx`, `*.test.ts`, `*.test.tsx`, `*.spec.js`, `*.spec.jsx`, `*.spec.ts`, `*.spec.tsx`

**Customization Options:**

| Option | Type | Description |
|--------|------|-------------|
| `extraModuleFolders` | `string[]` | Add folders that should have an `index.js` re-exporting all public files. Use for project-specific folders like `features/`, `modules/` that follow the same pattern |
| `extraLazyLoadFolders` | `string[]` | Add folders exempt from index file requirements. Use for route/page components loaded via dynamic `import()`. Default: `pages`, `views` |
| `extraIgnorePatterns` | `string[]` | Add file patterns to skip when checking for index exports. Supports wildcards like `*.stories.js`, `*.mock.js` |
| `moduleFolders` | `string[]` | Completely replace the default module folders list. Use only if you need full control over which folders require index files |
| `lazyLoadFolders` | `string[]` | Completely replace the default lazy load folders list |
| `ignorePatterns` | `string[]` | Completely replace the default ignore patterns list |

```javascript
// Example: Add custom folders and patterns
"code-style/module-index-exports": ["error", {
    extraModuleFolders: ["features", "modules"],
    extraLazyLoadFolders: ["screens"],
    extraIgnorePatterns: ["*.stories.js", "*.mock.js"]
}]
```

<br />

## ⚛️ JSX Rules

### `classname-dynamic-at-end`

**What it does:** Enforces that dynamic expressions in className template literals are placed at the end, after all static class names. Also applies to variables with names containing "class" or "Class".

**Why use it:** When using Tailwind CSS with `tailwindcss/classnames-order`, static classes are automatically sorted. However, dynamic expressions like `${className}` or `${styles.button}` can break the visual order if placed in the middle. This rule ensures dynamic parts come last for consistent, readable class strings.

```javascript
// ✅ Good — dynamic expressions at the end (JSX)
<div className={`flex items-center gap-4 ${className}`} />

// ✅ Good — dynamic expressions at the end (variable)
const buttonClasses = `flex items-center ${className} ${styles.button}`;

// ❌ Bad — dynamic expression at the beginning
<div className={`${className} flex items-center gap-4`} />

// ❌ Bad — dynamic expression in the middle (variable)
const buttonClasses = `flex ${className} items-center gap-4`;
```

---

### `classname-multiline`

**What it does:** Enforces that long className strings are broken into multiple lines, with each class on its own line. Triggers when either the class count exceeds `maxClassCount` (default: 3) or the string length exceeds `maxLength` (default: 80). Also enforces:
- JSX `className` with no dynamic expressions uses `"..."` string literal format
- JSX `className` with dynamic expressions uses `` {`...`} `` template literal format
- Variables/object properties use `` `...` `` template literal for multiline (JS requires it)
- No empty lines between classes or before/after the quotes
- Under-threshold multiline classes are collapsed back to a single line

Applies to JSX `className` attributes, variables with class-related names, and object properties within class-related objects.

**Why use it:** Long single-line class strings are hard to read and review. Breaking them into one class per line makes diffs cleaner and classes easier to scan. Using string literals when no expressions are needed keeps the code simpler.

```javascript
// ✅ Good — JSX with no expressions uses "..." format
<div
    className="
        flex
        items-center
        justify-center
        rounded-lg
        p-4
    "
/>

// ✅ Good — JSX with expressions uses {`...`} format
<div
    className={`
        flex
        items-center
        justify-center
        ${className}
    `}
/>

// ✅ Good — variable multiline uses template literal
const buttonClasses = `
    flex
    items-center
    justify-center
    ${className}
`;

// ✅ Good — object property multiline uses template literal
const variantClasses = {
    danger: `
        flex
        items-center
        justify-center
        bg-red-500
    `,
};

// ✅ Good — short class strings stay on one line
<div className="flex items-center" />

// ❌ Bad — too many classes on one line
<div className="flex items-center justify-center rounded-lg p-4 font-bold" />

// ❌ Bad — using template literal in JSX when no expressions
<div className={`
    flex
    items-center
    justify-center
    rounded-lg
`} />

// ❌ Bad — empty lines between classes
<div className="
    flex

    items-center
    justify-center
" />
```

---

### `classname-no-extra-spaces`

**What it does:** Removes multiple consecutive spaces and leading/trailing spaces inside className values. Applies to:
- JSX `className` attributes (string literals and template literals)
- Variables with names containing "class" (e.g., `buttonClasses`, `variantClasses`)
- Object properties within class-related objects

**Why use it:** Extra spaces between class names are usually unintentional and can cause issues. This rule normalizes spacing and removes unnecessary whitespace.

```javascript
// ✅ Good — single space between classes
<div className="flex items-center gap-4 rounded-lg" />
const buttonClasses = `flex items-center ${className}`;
const variantClasses = { primary: "bg-blue-500 text-white" };

// ❌ Bad — multiple consecutive spaces
<div className="flex  items-center   gap-4" />
const buttonClasses = `flex  items-center`;
const variantClasses = { primary: "bg-blue-500  text-white" };

// ❌ Bad — leading/trailing spaces in template literal
const buttonClasses = ` flex items-center ${className} `;
```

---

### `classname-order`

**What it does:** Enforces Tailwind CSS class ordering in variables, object properties, and return statements. Uses smart detection to identify Tailwind class strings.

**Why use it:** This rule complements the official `tailwindcss/classnames-order` plugin by handling areas it doesn't cover:
- **`tailwindcss/classnames-order`** — Handles JSX `className` attributes directly
- **`classname-order`** — Handles class strings in variables, object properties, and return statements

Both rules should be enabled together for complete Tailwind class ordering coverage.

**Order enforced:** layout (flex, grid) → positioning → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → transitions → states (hover, focus)

```javascript
// ✅ Good — classes in correct order (variable)
const buttonClasses = "flex items-center px-4 py-2 text-white bg-blue-500 hover:bg-blue-600";

// ✅ Good — classes in correct order (object property)
const variants = {
    primary: "flex items-center bg-blue-500 hover:bg-blue-600",
    secondary: "flex items-center bg-gray-500 hover:bg-gray-600",
};

// ✅ Good — classes in correct order (return statement)
const getInputStyles = () => {
    return "border-error text-error placeholder-error/50 focus:border-error";
};

// ❌ Bad — hover state before base color (variable)
const buttonClasses = "flex items-center hover:bg-blue-600 bg-blue-500";

// ❌ Bad — unordered classes (object property)
const variants = {
    primary: "hover:bg-blue-600 bg-blue-500 flex items-center",
};

// ❌ Bad — unordered classes (return statement)
const getInputStyles = () => {
    return "focus:border-error text-error border-error";
};
```

---

### `jsx-children-on-new-line`

**What it does:** When a JSX element has multiple children, ensures each child is on its own line with proper indentation.

**Why use it:** Multiple children on one line are hard to scan. Individual lines make the component structure clear.

```javascript
// ✅ Good — each child on its own line
<Container>
    <Header />
    <Content />
    <Footer />
</Container>

<Form>
    <Input name="email" />
    <Input name="password" />
    <Button type="submit">Login</Button>
</Form>

// ✅ Good — single child can stay inline
<Button><Icon /></Button>

// ❌ Bad — multiple children crammed together
<Container><Header /><Content /><Footer /></Container>

// ❌ Bad — inconsistent formatting
<Form><Input name="email" />
    <Input name="password" />
    <Button>Login</Button></Form>
```

---

### `jsx-closing-bracket-spacing`

**What it does:** Removes any space before `>` or `/>` in JSX tags.

**Why use it:** Standard JSX convention. Spaces before closing brackets look inconsistent and can be confusing.

```javascript
// ✅ Good — no space before closing
<Button />
<Input type="text" />
<div className="container">
<Modal isOpen={true}>

// ❌ Bad — space before />
<Button / >
<Input type="text" / >

// ❌ Bad — space before >
<div className="container" >
<Modal isOpen={true} >
```

---

### `jsx-element-child-new-line`

**What it does:** When a JSX element contains another JSX element as a child, the child must be on its own line.

**Why use it:** Nested elements on the same line hide the component structure. New lines make nesting visible.

```javascript
// ✅ Good — nested element on new line
<Button>
    <Icon name="check" />
</Button>

<Card>
    <CardHeader>
        <Title>Hello</Title>
    </CardHeader>
</Card>

// ✅ Good — text children can stay inline
<Button>Click me</Button>
<Title>{title}</Title>

// ❌ Bad — nested element inline
<Button><Icon name="check" /></Button>

// ❌ Bad — complex nesting all inline
<Card><CardHeader><Title>Hello</Title></CardHeader></Card>
```

---

### `jsx-logical-expression-simplify`

**What it does:** Removes unnecessary parentheses around conditions and JSX elements in logical expressions.

**Why use it:** Extra parentheses add visual noise. Simple conditions and elements don't need wrapping.

```javascript
// ✅ Good — clean logical expressions
{isLoading && <Spinner />}
{error && <ErrorMessage>{error}</ErrorMessage>}
{items.length > 0 && <List items={items} />}
{user.isAdmin && <AdminPanel />}

// ❌ Bad — unnecessary parentheses around condition
{(isLoading) && <Spinner />}
{(error) && <ErrorMessage />}

// ❌ Bad — unnecessary parentheses around JSX
{isLoading && (<Spinner />)}
{error && (<ErrorMessage />)}

// ❌ Bad — both
{(isLoading) && (<Spinner />)}
```

---

### `jsx-parentheses-position`

**What it does:** Ensures the opening parenthesis `(` for multiline JSX is on the same line as `return` or `=>`, not on a new line.

**Why use it:** Parenthesis on new line wastes vertical space and looks disconnected from the statement it belongs to.

```javascript
// ✅ Good — parenthesis on same line as =>
const Card = () => (
    <div className="card">
        <h1>Title</h1>
    </div>
);

// ✅ Good — parenthesis on same line as return
function Card() {
    return (
        <div className="card">
            <h1>Title</h1>
        </div>
    );
}

// ❌ Bad — parenthesis on new line after =>
const Card = () =>
    (
        <div className="card">
            <h1>Title</h1>
        </div>
    );

// ❌ Bad — parenthesis on new line after return
function Card() {
    return
        (
            <div className="card">
                <h1>Title</h1>
            </div>
        );
}
```

---

### `jsx-prop-naming-convention`

**What it does:** Enforces camelCase naming for JSX props, with exceptions for:
- `data-*` attributes (kebab-case allowed)
- `aria-*` attributes (kebab-case allowed)
- Props that reference components (PascalCase allowed)

**Why use it:** Consistent prop naming follows React conventions and makes code predictable.

```javascript
// ✅ Good — camelCase props
<Button onClick={handleClick} isDisabled={false} />
<Input onChange={handleChange} autoFocus />
<Modal onClose={close} isVisible={true} />

// ✅ Good — data-* and aria-* use kebab-case
<Button data-testid="submit-btn" aria-label="Submit" />
<Input data-cy="email-input" aria-describedby="help" />

// ✅ Good — component reference props use PascalCase
<Modal ContentComponent={Panel} />
<Route Component={HomePage} />

// ❌ Bad — snake_case props
<Button on_click={handler} is_disabled={false} />
<Input on_change={handler} auto_focus />

// ❌ Bad — kebab-case for regular props
<Button is-disabled={false} />
```

---

### `jsx-simple-element-one-line`

**What it does:** Collapses simple JSX elements (single text or expression child) onto one line.

**Why use it:** Simple elements don't need multi-line formatting. Single line is more compact and scannable.

```javascript
// ✅ Good — simple elements on one line
<Button>{buttonText}</Button>
<Title>Welcome</Title>
<span>{count}</span>
<Label>{user.name}</Label>

// ✅ Good — complex children stay multiline
<Button>
    <Icon />
    {buttonText}
</Button>

// ❌ Bad — unnecessary multiline for simple content
<Button>
    {buttonText}
</Button>

<Title>
    Welcome
</Title>

<span>
    {count}
</span>
```

---

### `jsx-string-value-trim`

**What it does:** Removes leading and trailing whitespace inside JSX string attribute values.

**Why use it:** Whitespace in class names and other string values is usually unintentional and can cause bugs (e.g., CSS class not matching).

```javascript
// ✅ Good — no extra whitespace
<Button className="primary" />
<Input placeholder="Enter email" />
<a href="/home">Home</a>

// ❌ Bad — leading whitespace
<Button className=" primary" />
<Input placeholder=" Enter email" />

// ❌ Bad — trailing whitespace
<Button className="primary " />
<a href="/home ">Home</a>

// ❌ Bad — both
<Button className=" primary " />
```

---

### `jsx-ternary-format`

**What it does:** Formats ternary expressions in JSX consistently:
- Simple branches stay on one line
- Complex/multiline branches get parentheses with proper indentation

**Why use it:** Consistent ternary formatting makes conditional rendering predictable and readable.

```javascript
// ✅ Good — simple ternary on one line
{isLoading ? <Spinner /> : <Content />}
{error ? <Error /> : <Success />}

// ✅ Good — complex branches get parentheses
{isLoading ? (
    <Spinner size="large" />
) : (
    <Content>
        <Header />
        <Body />
    </Content>
)}

// ✅ Good — one simple, one complex
{isLoading ? <Spinner /> : (
    <Content>
        <Header />
        <Body />
    </Content>
)}

// ❌ Bad — awkward line breaks
{isLoading
    ? <Spinner />
    : <Content />}

// ❌ Bad — missing parentheses for complex branch
{isLoading ? <Spinner /> : <Content>
    <Header />
    <Body />
</Content>}
```

---

### `no-empty-lines-in-jsx`

**What it does:** Removes empty lines inside JSX elements — between children and after opening/before closing tags.

**Why use it:** Empty lines inside JSX create visual gaps that break the component's visual structure.

```javascript
// ✅ Good — no empty lines inside
<div>
    <Header />
    <Content />
    <Footer />
</div>

<Form>
    <Input name="email" />
    <Input name="password" />
    <Button>Submit</Button>
</Form>

// ❌ Bad — empty line after opening tag
<div>

    <Header />
    <Content />
</div>

// ❌ Bad — empty lines between children
<Form>
    <Input name="email" />

    <Input name="password" />

    <Button>Submit</Button>
</Form>

// ❌ Bad — empty line before closing tag
<div>
    <Content />

</div>
```

<br />

## 📦 Object Rules

### `no-empty-lines-in-objects`

**What it does:** Removes empty lines within object literals — between properties and after opening/before closing braces.

**Why use it:** Empty lines inside objects break the visual grouping of properties. Properties should flow as a cohesive unit.

```javascript
// ✅ Good — no empty lines
const user = {
    name: "John",
    email: "john@example.com",
    role: "admin",
};

const config = {
    host: "localhost",
    port: 3000,
    debug: true,
};

// ❌ Bad — empty line between properties
const user = {
    name: "John",

    email: "john@example.com",

    role: "admin",
};

// ❌ Bad — empty line after opening brace
const config = {

    host: "localhost",
    port: 3000,
};

// ❌ Bad — empty line before closing brace
const config = {
    host: "localhost",
    port: 3000,

};
```

---

### `object-property-per-line`

**What it does:** Controls object formatting based on property count:
- 1 property: stays on single line `{ name: "John" }`
- 2+ properties: expands with `{` and `}` on own lines, each property on its own line

**Why use it:** Single-property objects are clear on one line. Multiple properties need expansion for readability and clean diffs.

```javascript
// ✅ Good — single property stays compact
const point = { x: 10 };
const config = { debug: true };
fn({ callback: handleClick });

// ✅ Good — 2+ properties get full expansion
const point = {
    x: 10,
    y: 20,
};

const user = {
    name: "John",
    email: "john@example.com",
    role: "admin",
};

// ✅ Good — nested objects follow same rules
const config = {
    server: { port: 3000 },
    database: {
        host: "localhost",
        name: "mydb",
    },
};

// ❌ Bad — multiple properties on one line
const point = { x: 10, y: 20 };
const user = { name: "John", email: "john@example.com" };

// ❌ Bad — inconsistent formatting
const point = { x: 10,
    y: 20 };
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minProperties` | `integer` | `2` | Minimum properties to trigger expansion |

```javascript
// Example: Require 3+ properties for expansion
"code-style/object-property-per-line": ["error", { minProperties: 3 }]
```

---

### `object-property-value-brace`

**What it does:** Ensures opening braces of object values start on the same line as the colon, not on a new line.

**Why use it:** Braces on new lines waste vertical space and disconnect the property key from its value.

```javascript
// ✅ Good — brace on same line as colon
const styles = {
    "& a": { color: "red" },
    "& button": { padding: "10px" },
};

const config = {
    server: {
        host: "localhost",
        port: 3000,
    },
};

// ❌ Bad — brace on new line
const styles = {
    "& a":
        { color: "red" },
    "& button":
        { padding: "10px" },
};

// ❌ Bad — inconsistent
const config = {
    server:
    {
        host: "localhost",
    },
};
```

---

### `object-property-value-format`

**What it does:** Ensures property values start on the same line as the colon for simple values (strings, numbers, identifiers).

**Why use it:** Values on new lines after the colon waste space and look disconnected from their keys.

```javascript
// ✅ Good — values on same line as colon
const user = {
    name: "John",
    age: 30,
    isActive: true,
    role: userRole,
};

// ✅ Good — complex values can span lines
const config = {
    handler: (event) => {
        process(event);
    },
    items: [
        "first",
        "second",
    ],
};

// ❌ Bad — simple values on new line
const user = {
    name:
        "John",
    age:
        30,
    isActive:
        true,
};
```

---

### `string-property-spacing`

**What it does:** Removes leading and trailing whitespace inside string property keys.

**Why use it:** Whitespace in property keys is usually unintentional and can cause bugs when accessing properties.

```javascript
// ✅ Good — no extra whitespace
const styles = {
    "& a": { color: "red" },
    "& .button": { padding: "10px" },
    "data-testid": "myElement",
};

const obj = {
    "Content-Type": "application/json",
    "X-Custom-Header": "value",
};

// ❌ Bad — leading whitespace
const styles = {
    " & a": { color: "red" },
    " & .button": { padding: "10px" },
};

// ❌ Bad — trailing whitespace
const obj = {
    "Content-Type ": "application/json",
};

// ❌ Bad — both
const styles = {
    " & a ": { color: "red" },
};
```

<br />

## 📐 Spacing Rules

### `assignment-value-same-line`

**What it does:** Ensures the assigned value starts on the same line as the `=` sign, not on a new line.

**Why use it:** Breaking after `=` creates awkward formatting and wastes vertical space. Keeping values on the same line as `=` is more readable.

```javascript
// ✅ Good — value starts on same line as =
const name = "John";
const config = {
    host: "localhost",
    port: 3000,
};
const items = [
    "first",
    "second",
];

// ❌ Bad — value on new line after =
const name =
    "John";
const config =
    {
        host: "localhost",
        port: 3000,
    };
const items =
    [
        "first",
        "second",
    ];
```

---

### `member-expression-bracket-spacing`

**What it does:** Removes spaces inside brackets in computed member expressions (array access, dynamic property access).

**Why use it:** Consistent with JavaScript conventions. Spaces inside brackets look inconsistent with array literals and other bracket usage.

```javascript
// ✅ Good — no spaces inside brackets
const value = arr[0];
const name = obj[key];
const item = data[index];
const nested = matrix[row][col];

// ❌ Bad — spaces inside brackets
const value = arr[ 0 ];
const name = obj[ key ];
const item = data[ index ];
```

<br />

## 🧩 Component Rules

### `component-props-destructure`

**What it does:** Enforces that React component props must be destructured in the function parameter, not received as a single `props` object.

**Why use it:** Destructured props make it immediately clear what props a component uses. It improves readability and helps catch unused props.

```typescript
// ✅ Good — props are destructured
export const Button = ({ label, onClick, variant = "primary" }) => (
    <button onClick={onClick} type="button">
        {label}
    </button>
);

export const Card = ({
    children,
    className = "",
    title,
} : {
    children: ReactNode,
    className?: string,
    title: string,
}) => (
    <div className={className}>
        <h2>{title}</h2>
        {children}
    </div>
);

// ❌ Bad — props received as single object
export const Button = (props) => (
    <button onClick={props.onClick} type="button">
        {props.label}
    </button>
);

export const Card = (props: CardPropsInterface) => (
    <div className={props.className}>
        <h2>{props.title}</h2>
        {props.children}
    </div>
);
```

---

### `component-props-inline-type`

**What it does:** Enforces that React component props must use inline type annotation instead of referencing an interface or type alias. Also enforces:
- Exactly one space before and after colon: `} : {`
- Props in type must match exactly with destructured props (no missing or extra)
- Each prop type on its own line when there are multiple props
- First prop type must be on new line after `{` when multiple props
- No empty lines after opening brace or before closing brace
- No space before `?` in optional properties (`prop?: type` not `prop ?: type`)
- Trailing commas (not semicolons) for each prop type
- No empty lines between prop types

**Why use it:** Inline types keep the prop definitions colocated with the component, making it easier to understand and modify the component without jumping to separate interface definitions. Enforcing prop matching ensures type safety and prevents unused type properties.

```typescript
// ✅ Good — inline type annotation with matching props
export const Button = ({ label } : { label: string }) => (
    <button type="button">{label}</button>
);

export const Card = ({
    className = "",
    description,
    title,
} : {
    className?: string,
    description?: string,
    title: string,
}) => (
    <div className={className}>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
    </div>
);

// ❌ Bad — interface reference instead of inline type
interface ButtonPropsInterface {
    label: string,
}
export const Button = ({ label }: ButtonPropsInterface) => (
    <button type="button">{label}</button>
);

// ❌ Bad — missing space before and after colon
export const Button = ({ label }:{ label: string }) => (
    <button type="button">{label}</button>
);

// ❌ Bad — props don't match (extra 'flag' in type, missing in destructured)
export const Card = ({
    title,
} : {
    flag: boolean,
    title: string,
}) => (
    <div>{title}</div>
);

// ❌ Bad — semicolons instead of commas
export const Card = ({ title } : { title: string; }) => (
    <div>{title}</div>
);

// ❌ Bad — first prop on same line as opening brace
export const Card = ({
    title,
} : { title: string,
    className?: string,
}) => (
    <div>{title}</div>
);

// ❌ Bad — space before ? in optional property
export const Card = ({ title } : { title ?: string }) => (
    <div>{title}</div>
);

// ❌ Bad — props on same line when multiple
export const Card = ({ a, b } : { a: string, b: string }) => (
    <div>{a}{b}</div>
);
```

---

### `folder-component-suffix`

**What it does:** Enforces naming conventions for components based on folder location:
- Components in `views/` folder must end with "View" suffix
- Components in `pages/` folder must end with "Page" suffix
- Components in `layouts/` folder must end with "Layout" suffix

**Why use it:** Consistent naming based on folder structure makes component purpose immediately clear. View components, page components, and layout components have different responsibilities, and the suffix reflects this.

```tsx
// ✅ Good — in views/dashboard-view.tsx
export const DashboardView = () => <div>Dashboard</div>;

// ✅ Good — in pages/home-page.tsx
export const HomePage = () => <div>Home</div>;

// ✅ Good — in layouts/main-layout.tsx
export const MainLayout = () => <div>Main</div>;

// ❌ Bad — in views/dashboard.tsx (missing "View" suffix)
export const Dashboard = () => <div>Dashboard</div>;

// ❌ Bad — in pages/home.tsx (missing "Page" suffix)
export const Home = () => <div>Home</div>;

// ❌ Bad — in layouts/main.tsx (missing "Layout" suffix)
export const Main = () => <div>Main</div>;
```

---

### `svg-component-icon-naming`

**What it does:** Enforces naming conventions for SVG icon components:
- Components that return only an SVG element must have a name ending with "Icon"
- Components with "Icon" suffix must return an SVG element

**Why use it:** Consistent naming makes it immediately clear which components render icons, improving code readability and making icon components easier to find in large codebases.

```tsx
// ✅ Good — returns SVG and ends with "Icon"
export const SuccessIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className}>
        <path d="M9 12l2 2 4-4" />
    </svg>
);

// ✅ Good — returns non-SVG and doesn't end with "Icon"
export const Button = ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
);

// ❌ Bad — returns SVG but doesn't end with "Icon"
export const Success = ({ className = "" }: { className?: string }) => (
    <svg className={className}>
        <path d="M9 12l2 2 4-4" />
    </svg>
);
// Error: Component "Success" returns an SVG element and should end with "Icon" suffix

// ❌ Bad — ends with "Icon" but doesn't return SVG
export const ButtonIcon = ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
);
// Error: Component "ButtonIcon" has "Icon" suffix but doesn't return an SVG element
```

<br />

## 🔷 TypeScript Rules

### `enum-format`

**What it does:** Enforces consistent formatting for TypeScript enums:
- Enum names must be PascalCase and end with `Enum` suffix
- Enum members must be UPPER_CASE (for string enums) or PascalCase (for numeric enums)
- No empty lines between enum members
- Members must end with commas, not semicolons

**Why use it:** Consistent enum naming makes enums instantly recognizable. UPPER_CASE members follow common conventions for constants.

```typescript
// ✅ Good — proper enum format
export enum StatusEnum {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
}

export enum HttpMethodEnum {
    DELETE = "DELETE",
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
}

// ❌ Bad — wrong naming
export enum Status {           // Missing Enum suffix
    active = "active",         // Should be UPPER_CASE
    inactive = "inactive";     // Should use comma, not semicolon
}

// ❌ Bad — empty lines between members
export enum UserStatusEnum {
    ACTIVE = "active",

    INACTIVE = "inactive",
}
```

---

### `enum-type-enforcement`

**What it does:** When a variable or parameter has a type ending in `Type` (like `ButtonVariantType`), enforces using the corresponding enum (`ButtonVariantEnum.VALUE`) instead of string literals.

**Why use it:** Using enum values instead of string literals provides type safety, autocompletion, and prevents typos. Changes to enum values automatically propagate.

```javascript
// ✅ Good — using enum values
const Button = ({
    variant = ButtonVariantEnum.PRIMARY,
}: {
    variant?: ButtonVariantType,
}) => { ... };

if (variant === ButtonVariantEnum.GHOST) {
    // ...
}

// ❌ Bad — using string literals
const Button = ({
    variant = "primary",  // Should use ButtonVariantEnum.PRIMARY
}: {
    variant?: ButtonVariantType,
}) => { ... };

if (variant === "ghost") {  // Should use ButtonVariantEnum.GHOST
    // ...
}
```

---

### `interface-format`

**What it does:** Enforces consistent formatting for TypeScript interfaces:
- Interface names must be PascalCase and end with `Interface` suffix
- Properties must be camelCase
- No empty lines between properties
- Properties must end with commas, not semicolons

**Why use it:** Consistent interface naming makes interfaces instantly recognizable. The suffix clearly distinguishes interfaces from types and classes.

```typescript
// ✅ Good — proper interface format
export interface UserInterface {
    email: string,
    id: string,
    isActive: boolean,
    name: string,
}

export interface ApiResponseInterface<T> {
    data: T,
    error: string | null,
    status: number,
    success: boolean,
}

// ❌ Bad — wrong naming
export interface User {        // Missing Interface suffix
    Email: string;             // Should be camelCase
    ID: string;                // Should be camelCase
    is_active: boolean;        // Should be camelCase, use comma
}

// ❌ Bad — semicolons and empty lines
export interface UserInterface {
    email: string;             // Should use comma

    name: string;              // Empty line not allowed
}
```

---

### `no-inline-type-definitions`

**What it does:** Reports when function parameters have inline union types that are too complex (too many members or too long). These should be extracted to a named type in a types file.

**Why use it:** Complex inline types make function signatures hard to read. Named types are reusable, self-documenting, and easier to maintain.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxUnionMembers` | `integer` | `2` | Maximum union members before requiring extraction |
| `maxLength` | `integer` | `50` | Maximum character length before requiring extraction |

```javascript
// ✅ Good — type extracted to separate file
// types.ts
export type ButtonVariantType = "primary" | "muted" | "danger";

// Button.tsx
import { ButtonVariantType } from "./types";
export const Button = ({
    variant,
}: {
    variant?: ButtonVariantType,
}) => { ... };

// ❌ Bad — complex inline union type
export const Button = ({
    variant,
}: {
    variant?: "primary" | "muted" | "danger",  // Extract to named type
}) => { ... };
```

---

### `prop-naming-convention`

**What it does:** Enforces naming conventions for boolean and callback props in TypeScript interfaces, types, and inline type definitions:
- Boolean props must start with: `is`, `has`, `with`, or `without` (followed by capital letter)
- Callback props must start with: `on` (followed by capital letter)
- Detects React event handler types: `MouseEventHandler`, `ChangeEventHandler`, `FormEventHandler`, `KeyboardEventHandler`, etc.
- Applies to all nesting levels (nested object types are checked recursively)
- Does NOT apply to JSX element attributes (external components have their own props)

**Why use it:** Consistent prop naming makes props self-documenting. Boolean prefixes clarify intent (`isLoading` vs `loading`), and `on` prefix clearly identifies event handlers.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `booleanPrefixes` | `string[]` | - | Replace default prefixes entirely (overrides defaults) |
| `extendBooleanPrefixes` | `string[]` | `[]` | Add to default prefixes (`is`, `has`, `with`, `without`) |
| `allowPastVerbBoolean` | `boolean` | `false` | Allow past verb booleans (e.g., `disabled`, `selected`, `checked`, `opened`) |
| `allowContinuousVerbBoolean` | `boolean` | `false` | Allow continuous verb booleans (e.g., `loading`, `saving`, `fetching`) |
| `callbackPrefix` | `string` | `"on"` | Required prefix for callback props |
| `allowActionSuffix` | `boolean` | `false` | Allow `xxxAction` pattern for callbacks |

```typescript
// ✅ Good — proper prop naming
interface ButtonPropsInterface {
    isDisabled: boolean,
    isLoading: boolean,
    hasError: boolean,
    onClick: () => void,
    onSubmit: (data: FormData) => void,
}

type CardPropsType = {
    isExpanded: boolean,
    hasChildren: boolean,
    onToggle: () => void,
};

// ✅ Good — nested types are also checked
interface FormPropsInterface {
    isValid: boolean,
    config: {
        isEnabled: boolean,      // Nested - checked
        onValidate: () => void,  // Nested - checked
        settings: {
            isActive: boolean,   // Deep nested - also checked
        },
    },
}

// ✅ Good — inline component props
const Button = ({
    isLoading,
    onClick,
}: {
    isLoading: boolean,
    onClick: () => void,
}) => { ... };

// ❌ Bad — missing prefixes
interface ButtonPropsInterface {
    disabled: boolean,    // Should be isDisabled
    loading: boolean,     // Should be isLoading
    error: boolean,       // Should be hasError
    click: () => void,    // Should be onClick
    handleSubmit: () => void,  // Should be onSubmit
}

// ❌ Bad — nested types also checked
type PropsType = {
    config: {
        enabled: boolean,  // Should be isEnabled
        toggle: () => void, // Should be onToggle
    },
};
```

**Past Verb Booleans** (`allowPastVerbBoolean: true`):

When enabled, allows boolean props that are past tense verbs (ending in `-ed`):

```typescript
// ✅ Allowed with allowPastVerbBoolean: true
interface PropsInterface {
    disabled: boolean,    // Past verb - ends with -ed
    selected: boolean,    // Past verb - ends with -ed
    checked: boolean,     // Past verb - ends with -ed
    opened: boolean,      // Past verb - ends with -ed
    closed: boolean,      // Past verb - ends with -ed
    expanded: boolean,    // Past verb - ends with -ed
    collapsed: boolean,   // Past verb - ends with -ed
    focused: boolean,     // Past verb - ends with -ed
    hidden: boolean,      // Past verb - ends with -ed
    connected: boolean,   // Past verb - ends with -ed
}
```

**Continuous Verb Booleans** (`allowContinuousVerbBoolean: true`):

When enabled, allows boolean props that are continuous tense verbs (ending in `-ing`):

```typescript
// ✅ Allowed with allowContinuousVerbBoolean: true
interface PropsInterface {
    loading: boolean,     // Continuous verb - ends with -ing
    saving: boolean,      // Continuous verb - ends with -ing
    fetching: boolean,    // Continuous verb - ends with -ing
    closing: boolean,     // Continuous verb - ends with -ing
    opening: boolean,     // Continuous verb - ends with -ing
    submitting: boolean,  // Continuous verb - ends with -ing
    processing: boolean,  // Continuous verb - ends with -ing
    updating: boolean,    // Continuous verb - ends with -ing
    deleting: boolean,    // Continuous verb - ends with -ing
    pending: boolean,     // Continuous verb - ends with -ing
}
```

**Configuration Examples:**

```javascript
// Default configuration (strict)
"code-style/prop-naming-convention": "error"

// Allow past verb booleans (disabled, selected, checked, etc.)
"code-style/prop-naming-convention": ["error", {
    allowPastVerbBoolean: true,
}]

// Allow continuous verb booleans (loading, saving, fetching, etc.)
"code-style/prop-naming-convention": ["error", {
    allowContinuousVerbBoolean: true,
}]

// Allow both past and continuous verb booleans
"code-style/prop-naming-convention": ["error", {
    allowPastVerbBoolean: true,
    allowContinuousVerbBoolean: true,
}]

// Extend default prefixes with additional ones
"code-style/prop-naming-convention": ["error", {
    extendBooleanPrefixes: ["should", "can", "will", "did"],
}]

// Replace default prefixes entirely
"code-style/prop-naming-convention": ["error", {
    booleanPrefixes: ["is", "has"],  // Only these prefixes allowed
}]

// Allow "xxxAction" suffix for callbacks
"code-style/prop-naming-convention": ["error", {
    allowActionSuffix: true,  // Allows: submitAction, copyAction, deleteAction
}]

// Full custom configuration
"code-style/prop-naming-convention": ["error", {
    extendBooleanPrefixes: ["should", "can"],
    allowPastVerbBoolean: true,
    allowContinuousVerbBoolean: true,
    callbackPrefix: "on",
    allowActionSuffix: true,
}]
```

---

### `type-format`

**What it does:** Enforces consistent formatting for TypeScript type aliases:
- Type names must be PascalCase and end with `Type` suffix
- Properties must be camelCase
- No empty lines between properties
- Properties must end with commas, not semicolons
- Union types with 5+ members must be multiline (one per line)
- Union types with <5 members must be single line

**Why use it:** Consistent type naming makes types instantly recognizable. The suffix clearly distinguishes types from interfaces and classes.

```typescript
// ✅ Good — proper type format
export type UserType = {
    email: string,
    id: string,
    name: string,
};

export type ApiResponseType<T> = {
    data: T,
    error: string | null,
    status: number,
};

// ✅ Good — union type with 6 members (multiline)
export type ButtonVariantType =
    "danger"
    | "ghost"
    | "ghost-danger"
    | "link"
    | "muted"
    | "primary";

// ✅ Good — union type with 2 members (single line)
export type CodeLayoutVariantType = "default" | "error";

// ❌ Bad — 6 members should be multiline
export type BadUnionType = "a" | "b" | "c" | "d" | "e" | "f";

// ❌ Bad — 2 members should be single line
export type BadSingleType =
    "default"
    | "error";

// ❌ Bad — wrong naming
export type User = {           // Missing Type suffix
    Email: string;             // Should be camelCase
    ID: string;                // Should use comma
};

// ❌ Bad — empty lines
export type ConfigType = {
    debug: boolean,

    port: number,              // Empty line not allowed
};
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minUnionMembersForMultiline` | `integer` | `5` | Minimum number of union members to require multiline format |

```javascript
// Configuration example - require multiline for 4+ union members
"code-style/type-format": ["error", { minUnionMembersForMultiline: 4 }]
```

---

### `type-annotation-spacing`

**What it does:** Enforces consistent spacing in TypeScript type annotations:
- No space before the colon in type annotations: `name: string` not `name : string`
- One space after the colon: `name: string` not `name:string`
- No space before generic type parameters: `Array<T>` not `Array <T>`
- No space before array brackets: `string[]` not `string []`

**Why use it:** Consistent type annotation spacing follows TypeScript conventions and improves code readability.

```typescript
// ✅ Good — proper spacing
const name: string = "John";
const items: string[] = [];
const data: Array<number> = [];
const handler = (value: string): boolean => true;

function getData<T>(id: string): Promise<T> {
    return fetch(id);
}

// ❌ Bad — space before colon
const name : string = "John";
const handler = (value : string) : boolean => true;

// ❌ Bad — no space after colon
const name:string = "John";
const handler = (value:string):boolean => true;

// ❌ Bad — space before generic
const data: Array <number> = [];
function getData <T>(id: string): Promise <T> {}

// ❌ Bad — space before array brackets
const items: string [] = [];
```

---

### `typescript-definition-location`

**What it does:** Enforces that TypeScript definitions are placed in their designated folders:
- Interfaces must be in files inside the `interfaces` folder
- Types must be in files inside the `types` folder
- Enums must be in files inside the `enums` folder

**Why use it:** Separating type definitions by category makes them easier to find, maintain, and share across the codebase. It promotes a clean and organized project structure.

```typescript
// ✅ Good — definitions in correct folders
// src/interfaces/user.ts
export interface UserInterface {
    id: string,
    name: string,
}

// src/types/config.ts
export type ConfigType = {
    apiUrl: string,
    timeout: number,
};

// src/enums/status.ts
export enum UserRoleEnum {
    ADMIN = "admin",
    USER = "user",
}

// ❌ Bad — definitions in wrong folders
// src/components/user-card.tsx
interface UserProps {          // Should be in interfaces folder
    name: string,
}

// src/types/user.ts
export interface UserInterface {   // Should be in interfaces folder, not types
    id: string,
}

export enum StatusEnum {           // Should be in enums folder, not types
    ACTIVE = "active",
}
```

<br />

## ⚛️ React Rules

### `react-code-order`

**What it does:** Enforces a consistent ordering of code blocks within React components and custom hooks. The order follows a logical dependency chain where declarations appear before their usage.

**Order (top to bottom):**
1. Props/params destructure (in function signature: `({ prop1, prop2 })`)
2. Props/params destructure in body (`const { x } = propValue` where propValue is a prop)
3. `useRef` declarations
4. `useState` declarations
5. `useReducer` declarations
6. `useSelector` / `useDispatch` (Redux hooks)
7. Router hooks (`useNavigate`, `useLocation`, `useParams`, `useSearchParams`)
8. Context hooks (`useContext`, `useToast`, etc.)
9. Custom hooks (`use*` pattern)
10. Derived state / variables (computed from hooks above, e.g., `const isSearching = term.length > 0`)
11. `useMemo` declarations
12. `useCallback` declarations
13. Handler functions (`const handleX = () => {}`)
14. `useEffect` / `useLayoutEffect`
15. Return statement

**Why use it:** A consistent code structure makes components and hooks predictable and easier to navigate. Placing hooks before derived values ensures dependencies are defined before use. Effects come last because they typically depend on everything else.

```typescript
// ✅ Good — Component follows the correct order
const UserDashboard = ({ title }) => {
    // 1. useRef
    const inputRef = useRef(null);

    // 2. useState
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // 3. Redux hooks
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    // 4. Router hooks
    const navigate = useNavigate();
    const { id } = useParams();

    // 5. Custom hooks
    const { data, loading } = useFetchData(id);

    // 6. Derived state
    const isReady = !loading && data !== null;
    const displayName = user?.name ?? "Guest";

    // 7. useMemo
    const filteredItems = useMemo(
        () => data?.filter((item) => item.active),
        [data],
    );

    // 8. useCallback
    const handleSubmit = useCallback(
        () => {
            dispatch(submitAction());
        },
        [dispatch],
    );

    // 9. Handler functions
    const resetHandler = () => {
        setCount(0);
        setIsLoading(false);
    };

    // 10. useEffect
    useEffect(
        () => {
            inputRef.current?.focus();
        },
        [],
    );

    // 11. Return
    return (
        <div>
            <h1>{title}</h1>
            <span>{displayName}</span>
        </div>
    );
};

// ✅ Good — Custom hook follows the correct order
const useCreateAccount = () => {
    // 1. useState
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(false);

    // 2. Redux hooks
    const dispatch = useDispatch();

    // 3. Context hooks
    const { toast } = useToast();

    // 4. Handler functions
    const createAccountHandler = async (data: AccountData) => {
        setLoading(true);
        try {
            await api.createAccount(data);
            setCreated(true);
        } catch (error) {
            toast({ description: "Failed to create account" });
        } finally {
            setLoading(false);
        }
    };

    // 5. useEffect
    useEffect(
        () => {
            if (created) {
                setTimeout(() => setCreated(false), 50);
            }
        },
        [created],
    );

    // 6. Return
    return { createAccountHandler, created, loading };
};

// ❌ Bad — useEffect before useState
const BadComponent = ({ title }) => {
    useEffect(() => {
        console.log("mounted");
    }, []);

    const [count, setCount] = useState(0);

    return <div>{title}</div>;
};

// ❌ Bad — context hook before useState in custom hook
const useBadHook = () => {
    const { toast } = useToast();          // Should come after useState
    const [loading, setLoading] = useState(false);
    return { loading };
};

// ❌ Bad — handler before hooks
const AnotherBadComponent = ({ title }) => {
    const handleClick = () => {
        console.log("clicked");
    };

    const dispatch = useDispatch();
    const [count, setCount] = useState(0);

    return <div onClick={handleClick}>{title}</div>;
};

// ❌ Bad — derived state after handler
const YetAnotherBad = ({ title }) => {
    const [items, setItems] = useState([]);

    const handleAdd = () => {
        setItems([...items, "new"]);
    };

    const itemCount = items.length; // Should come before handleAdd

    return <div>{itemCount}</div>;
};
```

<br />

## 📝 String Rules

### `no-hardcoded-strings`

**What it does:** Enforces that user-facing strings should be imported from constants/strings/data modules rather than hardcoded inline. This promotes maintainability, consistency, and enables easier internationalization.

**Why use it:** Hardcoded strings scattered throughout your codebase are hard to maintain, translate, and keep consistent. Centralizing strings in constants makes them easy to find, update, and potentially translate.

**Special detection (should be imported from `@/enums` or `@/data`):**
- **HTTP status codes** — 2xx, 4xx, 5xx like "200", "404", "500"
- **HTTP methods** — "GET", "POST", "PUT", "DELETE", "PATCH", etc.
- **Role/permission names** — "admin", "user", "moderator", "editor", etc.
- **Environment names** — "production", "development", "staging", "test", etc.
- **Log levels** — "debug", "info", "warn", "error", "fatal", etc.
- **Status strings** — "active", "pending", "approved", "rejected", "completed", etc.
- **Priority levels** — "high", "medium", "low", "critical", "urgent", etc.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ignoreAttributes` | `string[]` | See below | JSX attributes to ignore (replaces defaults) |
| `extraIgnoreAttributes` | `string[]` | `[]` | Additional JSX attributes to ignore (extends defaults) |
| `ignorePatterns` | `string[]` | `[]` | Regex patterns for strings to ignore |

**Default ignored attributes:** `className`, `id`, `type`, `name`, `href`, `src`, `alt`, `role`, `style`, `key`, `data-*`, `aria-*`, and many more HTML/SVG attributes.

**Default ignored patterns:** Empty strings, single characters, CSS units (`px`, `em`, `%`), colors, URLs, paths, file extensions, MIME types, UUIDs, dates, camelCase/snake_case identifiers, HTTP methods, and other technical strings.

```javascript
// ✅ Good — strings imported from constants
import { BUTTON_LABEL, ERROR_MESSAGE, welcomeText } from "@/constants";
import { FORM_LABELS } from "@/strings";
import { HttpStatus, UserRole } from "@/enums";

const ComponentHandler = () => (
    <div>
        <button>{BUTTON_LABEL}</button>
        <span>{ERROR_MESSAGE}</span>
        <p>{welcomeText}</p>
    </div>
);

const getMessageHandler = () => ERROR_MESSAGE;

// ✅ Good — using enums for status codes and roles
if (status === HttpStatus.NOT_FOUND) { ... }
if (role === UserRole.ADMIN) { ... }

// ✅ Good — technical strings are allowed
<input type="text" className="input-field" />
<a href="/dashboard">Link</a>
const url = `/api/users/${id}`;
const size = "100px";

// ❌ Bad — hardcoded user-facing strings
<button>Submit Form</button>
<span>Something went wrong</span>
const message = "Welcome to the application";
return "User not found";

// ❌ Bad — hardcoded status codes and roles
if (status === "404") { ... }
if (role === "admin") { ... }
```

**Configuration example:**

```javascript
// Allow more attributes, add custom ignore patterns
"code-style/no-hardcoded-strings": ["error", {
    extraIgnoreAttributes: ["tooltip", "placeholder"],
    ignorePatterns: ["^TODO:", "^FIXME:"]
}]
```

**Valid import paths for strings:**
- `@/data`
- `@/strings` or `@/@strings`
- `@/constants` or `@/@constants`

**Valid import paths for enums (status codes, roles):**
- `@/enums`
- `@/data`

---

<br />

## 📝 Variable Rules

### `variable-naming-convention`

**What it does:** Enforces naming conventions for variables:
- **camelCase** for all variables and constants
- **PascalCase** for React components and classes
- **camelCase with `use` prefix** for hooks

**Why use it:** Consistent naming makes code predictable. You can tell what something is by how it's named.

```javascript
// ✅ Good — correct conventions
const userName = "John";           // camelCase for variables
const itemCount = 42;              // camelCase for variables
const maxRetries = 3;              // camelCase for constants
const apiBaseUrl = "/api";         // camelCase for constants
const UserProfile = () => <div />; // PascalCase for components
const useAuth = () => {};          // camelCase with use prefix for hooks

// ❌ Bad — wrong conventions
const user_name = "John";          // snake_case
const MAX_RETRIES = 3;             // should be camelCase
const userProfile = () => <div />; // should be PascalCase
const UseAuth = () => {};          // hooks should be camelCase
```

<br />

---

## 🔧 Auto-fixing

67 of 76 rules support auto-fixing. Run ESLint with the `--fix` flag:

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
