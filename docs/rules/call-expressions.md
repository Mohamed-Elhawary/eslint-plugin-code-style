# Call Expression Rules

### `function-arguments-format`

**What it does:** Enforces consistent formatting for function call arguments:
- Single simple argument stays on one line
- 2+ arguments get one per line
- Multiline arguments trigger full expansion
- React hooks are skipped by default (they have their own rule)

**Why use it:** Consistent argument formatting makes function calls scannable and diffs clean when adding/removing arguments.

```javascript
// Good — single argument stays compact
fetchUser(userId);
console.log(message);
dispatch(action);

// Good — 2+ arguments get one per line
setValue(
    "email",
    "user@example.com",
);

createUser(
    name,
    email,
    password,
);

// Good — multiline argument triggers expansion
processData(
    {
        id: 1,
        name: "test",
    },
);

// Good — callback with body triggers expansion
items.forEach(
    (item) => {
        process(item);
        save(item);
    },
);

// Bad — multiple arguments on same line
setValue("email", "user@example.com");
createUser(name, email, password);

// Bad — inconsistent formatting
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
// Good — closing brackets together
const StyledCard = styled(Card)(({ theme }) => ({
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
}));

const StyledButton = styled("button")(({ theme }) => ({
    backgroundColor: theme.colors.primary,
}));

// Good — multiple levels
const Component = connect(
    mapStateToProps,
    mapDispatchToProps,
)(withRouter(MyComponent));

// Bad — closing brackets scattered
const StyledCard = styled(Card)(({ theme }) => ({
    color: theme.palette.text.primary,
})
);

// Bad — each bracket on its own line
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
// Good — no empty lines
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

// Bad — empty line between arguments
createUser(
    name,

    email,

    password,
);

// Bad — empty line after opening paren
fetchData(

    url,
    options,
);

// Bad — empty line before closing paren
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
// Good — brackets on same line as call
fn({ key: value });
process([1, 2, 3]);
items.map(({ id }) => id);
configure({ debug: true });

// Good — multiline content is fine
fn({
    key: value,
    other: data,
});

items.map(({ id, name }) => (
    <Item key={id} name={name} />
));

// Bad — opening bracket on new line
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
// Good — simple patterns on one line
const Page = lazy(() => import("./Page"));
setTimeout(() => callback(), 100);
const symbol = items.find(({ code }) => code === currency)?.symbol;

// Good — complex callbacks stay multiline
const Page = lazy(() => {
    console.log("Loading page");
    return import("./Page");
});

// Bad — unnecessary multiline for simple pattern
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
// Good — single argument on one line
fetchUser(userId);
console.log(message);
process(data.items);
dispatch(action);
setValue("key");
getElement(document.body);

// Good — complex single argument can be multiline
processConfig({
    key: value,
    other: data,
});

// Bad — simple argument expanded unnecessarily
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

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
