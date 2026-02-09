# Hook Rules

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

---

[← Back to Rules Index](./README.md) | [← Back to Main README](../../README.md)
