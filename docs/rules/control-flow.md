# Control Flow Rules

### `block-statement-newlines`

**What it does:** Enforces newlines after the opening brace `{` and before the closing brace `}` in block statements (if, for, while, etc.).

**Why use it:** Consistent block formatting improves readability. Single-line blocks are harder to scan and edit.

```javascript
// Good — proper block formatting
if (condition) {
    doSomething();
}

for (const item of items) {
    process(item);
}

while (running) {
    tick();
}

// Bad — everything on one line
if (condition) { doSomething(); }

// Bad — no space after brace
if (condition) {doSomething();}

// Bad — inconsistent formatting
for (const item of items) { process(item);
}
```

---

### `empty-line-after-block`

**What it does:** Requires an empty line between a closing brace `}` of a block statement (if, try, for, while, etc.) and the next statement, unless the next statement is part of the same construct (else, catch, finally).

**Why use it:** Visual separation between logical blocks improves code readability and makes the structure clearer.

> **Note:** Consecutive if statements are handled by `if-else-spacing` rule.

```javascript
// Good — empty line after block
if (condition) {
    doSomething();
}

const x = 1;

// Good — else is part of same construct (no empty line needed)
if (condition) {
    doSomething();
} else {
    doOther();
}

// Bad — no empty line after block
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
// Good — empty line between consecutive if blocks
if (!hasValidParams) return null;

if (status === "loading") {
    return <Loading />;
}

if (status === "error") {
    return <Error />;
}

// Good — no empty line between single-line if-else
if (error) prom.reject(error);
else prom.resolve(token);

// Bad — no empty line between if blocks
if (!hasValidParams) return null;
if (status === "loading") {
    return <Loading />;
}
if (status === "error") {
    return <Error />;
}

// Bad — empty line between single-line if-else
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
// Good — consistent formatting
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

// Bad — brace on new line
if (condition)
{
    doSomething();

    doMore();
}

// Bad — else on new line
if (condition) {
    doSomething();

    doMore();
}
else {
    doOther();

    doAnother();
}

// Bad — inconsistent formatting
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
// Good — 3 or fewer operands stay inline
const isValid = a && b && c;
const result = x || y;

// Good — 4+ operands get one per line
const err = data.error
    || data.message
    || data.status
    || data.fallback;

const isComplete = hasName
    && hasEmail
    && hasPhone
    && hasAddress;

// Bad — 4+ operands on single line
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
// Good — 3 or fewer conditions stay inline
if (isValid && isActive) {}
if (a && b && c) {}

// Good — 4+ conditions get one per line
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

// Bad — too many conditions on one line
if (isAuthenticated && hasPermission && !isExpired && isEnabled) {}

// Bad — inconsistent formatting
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
// Before (nested group has 4 operands)
if ((a || b || c || d) && e) {}

// After auto-fix — formats nested group multiline
if ((
    a
    || b
    || c
    || d
) && e) {}
```

**Double nesting:** Both levels expand when both exceed maxOperands:

```javascript
// Before (both parent and nested have 4 operands)
if ((a || (c && d && a && b) || c || d) && e) {}

// After auto-fix — both levels formatted multiline
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
// Before (level 3 nesting)
if ((a && (b || (c && d))) || e) {}

// After auto-fix — extracts deepest nested group
const isCAndD = (c && d);
if ((a && (b || isCAndD)) || e) {}
```

---

### `no-empty-lines-in-switch-cases`

**What it does:** Removes empty lines at the start of case blocks and between consecutive case statements.

**Why use it:** Empty lines inside switch cases create unnecessary gaps. Cases should flow together as a cohesive block.

```javascript
// Good — no empty lines
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

// Good — fall-through cases grouped
switch (day) {
    case "Saturday":
    case "Sunday":
        return "Weekend";
    default:
        return "Weekday";
}

// Bad — empty line after case label
switch (status) {
    case "pending":

        return "Waiting...";
    case "success":
        return "Done!";
}

// Bad — empty lines between cases
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
- <=maxOperands (default: 3): Always collapse to single line regardless of line length
- \>maxOperands: Expand to multiline with each operand on its own line
- Simple parenthesized nested ternaries (<=maxOperands) count as 1 operand and collapse
- Complex nested ternaries (>maxOperands in their condition) are skipped for manual formatting
- Nesting level is fixed at 2 to prevent overly complex conditions

**Why use it:** Consistent formatting based on complexity, not line length. Simple conditions stay readable on one line; complex conditions get proper multiline formatting.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxOperands` | `integer` | `3` | Maximum condition operands to keep ternary on single line. Also applies to nested groups |

```javascript
// Good — <=3 operands always on single line
const x = a && b && c ? "yes" : "no";
const url = lang === "ar" ? `${apiEndpoints.exam.status}/${jobId}?lang=ar` : `${apiEndpoints.exam.status}/${jobId}`;

// Good — parenthesized nested ternary counts as 1 operand
const inputType = showToggle ? (showPassword ? "text" : "password") : type;

// Good — >3 operands formatted multiline
const style = variant === "ghost"
    || variant === "ghost-danger"
    || variant === "muted"
    || variant === "primary"
    ? "transparent"
    : "solid";

// Good — nested group with >3 operands formatted multiline inline
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

// Bad — <=3 operands split across lines
const x = a && b && c
    ? "yes"
    : "no";

// Bad — >3 operands crammed on one line
const style = variant === "ghost" || variant === "ghost-danger" || variant === "muted" || variant === "primary" ? "transparent" : "solid";
```

**Auto-extraction:** Nested groups are auto-extracted to variables only when nesting depth exceeds 2 levels:

```javascript
// Before (level 3 nesting exceeds limit)
const result = (a && (b || (c && d))) || e ? "yes" : "no";

// After auto-fix — extracts deepest nested group
const isCAndD = (c && d);
const result = (a && (b || isCAndD)) || e ? "yes" : "no";
```

**Note:** When nested groups exceed `maxOperands` but stay within the 2-level nesting limit, they are formatted multiline inline (not extracted).

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
