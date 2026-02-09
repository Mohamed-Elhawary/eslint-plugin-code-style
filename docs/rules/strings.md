# String Rules

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
// Good — strings imported from constants
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

// Good — using enums for status codes and roles
if (status === HttpStatus.NOT_FOUND) { ... }
if (role === UserRole.ADMIN) { ... }

// Good — technical strings are allowed
<input type="text" className="input-field" />
<a href="/dashboard">Link</a>
const url = `/api/users/${id}`;
const size = "100px";

// Bad — hardcoded user-facing strings
<button>Submit Form</button>
<span>Something went wrong</span>
const message = "Welcome to the application";
return "User not found";

// Bad — hardcoded status codes and roles
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

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
