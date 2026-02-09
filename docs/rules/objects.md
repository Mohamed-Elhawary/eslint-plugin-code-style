# Object Rules

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

[← Back to Rules Index](./README.md) | [← Back to Main README](../../README.md)
