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

*47 auto-fixable rules to keep your codebase clean and consistent*

</div>

<br />

## 🎯 Why This Plugin?

This plugin provides **47 custom auto-fixable rules** for code formatting. Built for **ESLint v9 flat configs**.

> **Note:** ESLint [deprecated 79 formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules/) in v8.53.0. Our recommended configs use `@stylistic/eslint-plugin` as the replacement for these deprecated rules.

**Key Benefits:**
- **Fills the gaps** — Provides formatting rules not available in other plugins
- **Works alongside existing tools** — Complements ESLint's built-in rules and packages like eslint-plugin-react, eslint-plugin-import, etc
- **Self-sufficient rules** — Each rule handles complete formatting independently
- **Consistency at scale** — Reduces code-style differences between team members by enforcing uniform formatting across your projects
- **Fully automated** — All 47 rules support auto-fix, eliminating manual style reviews

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

- **Complete Coverage** — Combines ESLint built-in rules, third-party plugins, and all 47 code-style rules
- **Ready-to-Use** — Copy the config file and start linting immediately
- **Battle-Tested** — These configurations have been refined through real-world usage
- **Fully Documented** — Each config includes detailed instructions and explanations

### 📋 Available Configurations

| Configuration | Description | Link |
|---------------|-------------|------|
| **React** | React.js projects (JavaScript, JSX) | [View Config](./recommended-configs/react/) |
| **React + TypeScript** | React + TypeScript | *Coming Soon* |
| **React + TS + Tailwind** | React + TypeScript + Tailwind CSS | *Coming Soon* |

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
All **47 rules** support automatic fixing with `eslint --fix`. No manual code changes needed.

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
    "code-style/comment-format": "error",
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
    "code-style/function-arguments-format": "error",
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

> All **47 rules** are auto-fixable. See detailed examples for each rule in the [Rules Reference](#-rules-reference) section below.
>
> Rules marked with ⚙️ support customization options (e.g., extending default folder lists).

| Rule | Description |
|------|-------------|
| `array-items-per-line` | Collapse arrays ≤ threshold to one line; expand larger arrays with each item on own line (default: ≤3) ⚙️ |
| `array-objects-on-new-lines` | Each object in an array starts on its own line for better visual scanning |
| `arrow-function-block-body` | Wrap multiline arrow function expressions in parentheses for clear boundaries |
| `arrow-function-simple-jsx` | Collapse arrow functions returning simple single-element JSX to one line, remove unnecessary parens |
| `arrow-function-simplify` | Convert block body with single return to implicit return: `() => { return x; }` → `() => x` |
| `curried-arrow-same-line` | Curried arrow functions start on same line as `=>`, not on new line |
| `assignment-value-same-line` | Assignment values start on same line as `=`, not on new line |
| `block-statement-newlines` | Newline after `{` and before `}` in if/for/while/function blocks |
| `comment-format` | Space after `//`, space inside `/* */`, convert single-line blocks to `//`, no blank lines between file-top comments |
| `function-call-spacing` | No space between function name and `(`: `fn()` not `fn ()` |
| `function-naming-convention` | Functions use camelCase, start with verb (get/set/handle/is/has), handlers end with Handler |
| `function-params-per-line` | When multiline, each param on own line with consistent indentation |
| `hook-callback-format` | React hooks: callback on new line, deps array on separate line, proper indentation |
| `hook-deps-per-line` | Collapse deps ≤ threshold to one line; expand larger arrays with each dep on own line (default: >2) ⚙️ |
| `if-statement-format` | `{` on same line as `if`/`else if`, `else` on same line as `}`, proper spacing |
| `multiline-if-conditions` | Conditions exceeding threshold get one operand per line with proper indentation (default: >3) ⚙️ |
| `absolute-imports-only` | Use alias imports from index files only (not deep paths), no relative imports (default: `@/`) ⚙️ |
| `export-format` | `export {` on same line; collapse ≤ threshold to one line; expand larger with each specifier on own line (default: ≤3) ⚙️ |
| `import-format` | `import {` and `} from` on same line; collapse ≤ threshold; expand larger with each specifier on own line (default: ≤3) ⚙️ |
| `import-source-spacing` | No leading/trailing spaces inside import path quotes |
| `index-export-style` | Index files: no blank lines, enforce shorthand or import-export style; Regular files: require blank lines between exports (default: shorthand) ⚙️ |
| `module-index-exports` | Index files must export all folder contents (files and subfolders) ⚙️ |
| `jsx-children-on-new-line` | Multiple JSX children: each on own line with proper indentation |
| `jsx-closing-bracket-spacing` | No space before `>` or `/>` in JSX tags |
| `jsx-element-child-new-line` | Nested JSX elements on new lines; text/expression children can stay inline |
| `jsx-logical-expression-simplify` | Remove unnecessary parens around conditions and JSX in logical expressions |
| `jsx-parentheses-position` | Opening `(` for multiline JSX on same line as `return`/`=>`, not on new line |
| `jsx-prop-naming-convention` | Props: camelCase for regular, kebab-case for data-*/aria-*, PascalCase for component refs |
| `jsx-simple-element-one-line` | Collapse simple JSX with single text/expression child to one line |
| `jsx-string-value-trim` | No leading/trailing whitespace inside JSX string attribute values |
| `jsx-ternary-format` | Simple ternaries on one line; complex branches get parens with proper indentation |
| `member-expression-bracket-spacing` | No spaces inside brackets in computed member expressions: `arr[0]` not `arr[ 0 ]` |
| `function-arguments-format` | Args ≥ threshold or multiline: first arg on new line, each on own line, closing `)` on new line (default: ≥2) ⚙️ |
| `nested-call-closing-brackets` | Chain closing brackets on same line: `}));` not scattered across lines |
| `no-empty-lines-in-function-calls` | No empty lines between arguments or after `(`/before `)` |
| `no-empty-lines-in-function-params` | No empty lines between parameters or after `(`/before `)` |
| `no-empty-lines-in-jsx` | No empty lines between children or after opening/before closing tags |
| `no-empty-lines-in-objects` | No empty lines between properties or after `{`/before `}` |
| `no-empty-lines-in-switch-cases` | No empty line after `case X:` before code, no empty lines between cases |
| `object-property-per-line` | Collapse ≤ threshold to one line; expand larger with `{`/`}` on own lines and each property on own line (default: ≥2) ⚙️ |
| `object-property-value-brace` | Opening `{` of object value on same line as `:`, not on new line |
| `object-property-value-format` | Simple property values on same line as `:`, not on new line |
| `opening-brackets-same-line` | Opening `{`, `[`, or `(` on same line as function call, not on new line |
| `simple-call-single-line` | Collapse simple `fn(() => call())` patterns to single line |
| `single-argument-on-one-line` | Single simple argument stays on one line: `fn(x)` not expanded |
| `string-property-spacing` | No leading/trailing spaces inside string property keys |
| `variable-naming-convention` | camelCase for variables, UPPER_CASE for constants, PascalCase for components, `use` prefix for hooks |

<br />

---

## 📖 Rules Reference

> All rules are **auto-fixable** using `eslint --fix`

<br />

## 📚 Array Rules

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

## 📐 Spacing & Formatting Rules

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

---

### `variable-naming-convention`

**What it does:** Enforces naming conventions for variables:
- **camelCase** for regular variables and functions
- **UPPER_CASE** for constants (primitive values)
- **PascalCase** for React components and classes
- **camelCase with `use` prefix** for hooks

**Why use it:** Consistent naming makes code predictable. You can tell what something is by how it's named.

```javascript
// ✅ Good — correct conventions
const userName = "John";           // camelCase for variables
const itemCount = 42;              // camelCase for variables
const MAX_RETRIES = 3;             // UPPER_CASE for constants
const API_BASE_URL = "/api";       // UPPER_CASE for constants
const UserProfile = () => <div />; // PascalCase for components
const useAuth = () => {};          // camelCase with use prefix for hooks

// ❌ Bad — wrong conventions
const user_name = "John";          // snake_case
const maxretries = 3;              // should be UPPER_CASE
const userProfile = () => <div />; // should be PascalCase
const UseAuth = () => {};          // hooks should be camelCase
```

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

### `function-naming-convention`

**What it does:** Enforces naming conventions for functions:
- **camelCase** required
- **Verb prefix** recommended (get, set, handle, is, has, can, should, etc.)
- **Event handlers** can use `handle` prefix or `Handler` suffix

**Why use it:** Function names should describe actions. Verb prefixes make the purpose immediately clear.

```javascript
// ✅ Good — clear verb prefixes
function getUserData() {}
function setUserName(name) {}
function handleClick() {}
function handleSubmit() {}
function isValidEmail(email) {}
function hasPermission(user) {}
function canAccess(resource) {}
function shouldUpdate(props) {}
const fetchUsers = async () => {};
const submitHandler = () => {};

// ❌ Bad — no verb, unclear purpose
function userData() {}
function userName(name) {}
function click() {}
function valid(email) {}

// ❌ Bad — wrong case
function GetUserData() {}
function get_user_data() {}
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

<br />

## 🪝 React Hooks Rules

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

## 🔀 Control Flow Rules

### `if-statement-format`

**What it does:** Enforces consistent if/else formatting for multi-line block bodies:
- Opening `{` on the same line as `if`/`else if`/`else`
- `else` on the same line as the closing `}`
- Proper spacing around keywords

**Note:** This rule applies to multi-line block bodies. Single-line logic (e.g., `if (x) doSomething();`) is handled by ESLint's built-in `curly` rule with `"multi-or-nest"` option.

**Why use it:** Consistent brace placement reduces visual noise and follows the most common JavaScript style (K&R / "one true brace style").

```javascript
// ✅ Good — consistent formatting (multi-line body)
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
| `maxOperands` | `integer` | `3` | Maximum operands to keep on single line |

```javascript
// Example: Allow up to 4 operands on single line
"code-style/multiline-if-conditions": ["error", { maxOperands: 4 }]
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
`apis`, `assets`, `atoms`, `components`, `constants`, `contexts`, `data`, `hooks`, `layouts`, `middlewares`, `providers`, `redux`, `requests`, `routes`, `schemas`, `services`, `styles`, `theme`, `utils`, `views`

**Default Ignore Patterns:**
`index.js`, `index.jsx`, `index.ts`, `index.tsx`, `.DS_Store`, `__tests__`, `__mocks__`, `*.test.js`, `*.test.jsx`, `*.spec.js`, `*.spec.jsx`

**Customization Options:**

| Option | Type | Description |
|--------|------|-------------|
| `extraModuleFolders` | `string[]` | Add extra module folders to the default list |
| `extraLazyLoadFolders` | `string[]` | Add extra lazy load folders (default: `views`) |
| `extraIgnorePatterns` | `string[]` | Add extra ignore patterns (supports wildcards) |
| `moduleFolders` | `string[]` | Replace default module folders entirely |
| `lazyLoadFolders` | `string[]` | Replace default lazy load folders entirely |
| `ignorePatterns` | `string[]` | Replace default ignore patterns entirely |

```javascript
// Example: Add custom folders and patterns
"code-style/module-index-exports": ["error", {
    extraModuleFolders: ["features", "modules", "lib"],
    extraLazyLoadFolders: ["pages"],
    extraIgnorePatterns: ["*.stories.js", "*.mock.js"]
}]
```

<br />

## ⚛️ JSX Rules

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

**What it does:** Collapses simple function calls with an arrow function containing a single call expression onto one line.

**Why use it:** Common patterns like `lazy(() => import(...))` don't need multiline formatting. Single line is cleaner.

```javascript
// ✅ Good — simple patterns on one line
const Page = lazy(() => import("./Page"));
const Modal = lazy(() => import("./Modal"));
setTimeout(() => callback(), 100);
requestAnimationFrame(() => render());
items.filter(() => isValid(item));

// ✅ Good — complex callbacks stay multiline
const Page = lazy(() => {
    console.log("Loading page");
    return import("./Page");
});

// ❌ Bad — unnecessary multiline for simple pattern
const Page = lazy(
    () => import("./Page"),
);

setTimeout(
    () => callback(),
    100,
);
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
