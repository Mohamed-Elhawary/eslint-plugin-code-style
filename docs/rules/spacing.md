# Spacing Rules

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

---

[← Back to Rules Index](./README.md) | [← Back to Main README](../../README.md)
