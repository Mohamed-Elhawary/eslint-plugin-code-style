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

*47 auto-fixable rules to keep your codebase clean and consistent*

<br />

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Rules](#-rules-reference) •
[Contributing](#-contributing)

</div>

<br />

---

<br />

## Features

<table>
<tr>
<td width="50%">

### Auto-Fixable Rules
All **47 rules** support automatic fixing with `eslint --fix`. No manual code changes needed.

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

## Installation

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

## Quick Start

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

## Enable All Rules

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

## Rules Reference

> All rules are **auto-fixable** using `eslint --fix`

<br />

## Array Rules

### `array-items-per-line`

Enforce array formatting based on item count. 3 or less items on one line, more than 3 items each on its own line.

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

## Arrow Function Rules

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

## Spacing & Formatting Rules

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

## Function Rules

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

## React Hooks Rules

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

React hook dependency arrays with more than 2 dependencies should have each dependency on its own line.

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

<br />

## Control Flow Rules

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

When an if statement has multiple conditions that span multiple lines, each condition should be on its own line.

```javascript
// Good
if (
    conditionA &&
    conditionB &&
    conditionC
) {}

// Bad
if (conditionA &&
    conditionB && conditionC) {}
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

## Import/Export Rules

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

---

### `export-format`

Export statements should have consistent formatting with proper spacing. Collapse 1-3 specifiers on one line, use multiline for 4+ specifiers.

```javascript
// Good
export { a, b, c };
export {
    a,
    b,
    c,
    d,
};

// Bad
export {a,b,c};
export { a, b, c, d, e };
```

---

### `import-format`

Import statements should have consistent formatting with proper spacing. Collapse 1-3 specifiers on one line, use multiline for 4+ specifiers.

```javascript
// Good
import { a, b, c } from "module";
import {
    a,
    b,
    c,
    d,
} from "module";

// Bad
import {a,b,c} from "module";
import { a, b, c, d, e } from "module";
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

<br />

## JSX Rules

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

## Call Expression Rules

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

## Object Rules

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

When an object has 2 or more properties and spans multiple lines, each property should be on its own line.

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

## Auto-fixing

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

## Disabling Rules

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br />

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br />

---

<div align="center">

Made with by [Mohamed Elhawary](https://hawary.dev)

[![GitHub](https://img.shields.io/badge/GitHub-Mohamed--Elhawary-181717?style=for-the-badge&logo=github)](https://github.com/Mohamed-Elhawary)

</div>
