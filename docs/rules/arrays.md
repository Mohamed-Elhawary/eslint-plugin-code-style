# Array Rules

### `array-callback-destructure`

**What it does:** When destructuring parameters in array method callbacks (map, filter, find, etc.), enforces each property on its own line when there are 2 or more properties.

**Why use it:** Improves readability of array transformations by making destructured properties easy to scan vertically.

```javascript
// Good — each destructured property on its own line
const result = items.map(({
    name,
    value,
}) => `${name}: ${value}`);

const filtered = users.filter(({
    age,
    isActive,
}) => age > 18 && isActive);

// Good — single property stays inline
const names = items.map(({ name }) => name);

// Bad — multiple properties on same line
const result = items.map(({ name, value, id }) => `${name}: ${value}`);

// Bad — hard to scan properties
const data = records.filter(({ status, type, category }) => status === "active");
```

---

### `array-items-per-line`

**What it does:** Controls array formatting based on the number of items. Short arrays stay on one line for compactness, while longer arrays get expanded with each item on its own line for better readability.

**Why use it:** Prevents overly long single-line arrays that are hard to scan, while avoiding unnecessary vertical expansion for simple arrays.

```javascript
// Good — 3 or fewer items stay compact
const colors = ["red", "green", "blue"];
const nums = [1, 2, 3];

// Good — 4+ items expand for readability
const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];

// Bad — too many items on one line
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Bad — inconsistent formatting
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
// Good — each object clearly separated
const users = [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" },
    { id: 3, name: "Charlie", role: "user" },
];

// Good — even short objects get their own line
const points = [
    { x: 0, y: 0 },
    { x: 10, y: 20 },
];

// Bad — objects crammed together
const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];

// Bad — inconsistent line breaks
const items = [{ id: 1 },
    { id: 2 }, { id: 3 }];
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
