# Variable Rules

### `variable-naming-convention`

**What it does:** Enforces naming conventions for variables:
- **camelCase** for all variables and constants
- **PascalCase** for React components and classes
- **camelCase with `use` prefix** for hooks

**Why use it:** Consistent naming makes code predictable. You can tell what something is by how it's named.

```javascript
// Good — correct conventions
const userName = "John";           // camelCase for variables
const itemCount = 42;              // camelCase for variables
const maxRetries = 3;              // camelCase for constants
const apiBaseUrl = "/api";         // camelCase for constants
const UserProfile = () => <div />; // PascalCase for components
const useAuth = () => {};          // camelCase with use prefix for hooks

// Bad — wrong conventions
const user_name = "John";          // snake_case
const MAX_RETRIES = 3;             // should be camelCase
const userProfile = () => <div />; // should be PascalCase
const UseAuth = () => {};          // hooks should be camelCase
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
