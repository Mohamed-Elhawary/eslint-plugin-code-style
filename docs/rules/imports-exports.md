# Import/Export Rules

### `absolute-imports-only`

**What it does:** Enforces importing from folder index files using absolute paths (aliases like `@/`) instead of relative paths or deep file imports. Files within the same module folder must use relative imports (`./` or `../`) instead of absolute paths to avoid circular dependencies through the index file. Auto-fixes absolute imports to own module folder into relative paths. 🔧

**Why use it:**
- Absolute imports are cleaner than `../../../components`
- Index imports create a public API for each folder
- Refactoring file locations doesn't break imports
- Encourages proper module organization
- Relative imports within the same module folder avoid circular dependencies

```javascript
// ✅ Good — import from index files using alias
import { Button, Input } from "@/components";
import { useAuth, useUser } from "@/hooks";
import { fetchUsers } from "@/apis";
import { formatDate } from "@/utils";

// ✅ Good — assets allow deep imports by default
import logo from "@/assets/images/logo.png";

// ✅ Good — relative import within the same module folder (siblings)
// File: utils/formatters.js
import { isNumber } from "./validators";

// ✅ Good — relative import within the same module folder (nested)
// File: data/auth/forget-password/index.ts
import { guestLoginData } from "../../login/guest";

// ❌ Bad — absolute import to own module folder (should use relative)
// File: data/auth/forget-password/index.ts
import { guestLoginData } from "@/data";
// → use relative import instead: import { guestLoginData } from "../../login/guest";

// ❌ Bad — relative imports across different folders
import { Button } from "../../components";
import { useAuth } from "../../../hooks";

// ❌ Bad — deep imports into component internals
import { Button } from "@/components/buttons/primary-button";
import { useAuth } from "@/hooks/auth/useAuth";
import { fetchUsers } from "@/apis/users/fetchUsers";
```

**Default Allowed Folders:**
`actions`, `apis`, `assets`, `atoms`, `components`, `config`, `configs`, `constants`, `contexts`, `data`, `enums`, `helpers`, `hooks`, `interfaces`, `layouts`, `lib`, `middlewares`, `pages`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `ui`, `utils`, `utilities`, `views`

**Customization Options:**

| Option | Type | Description |
|--------|------|-------------|
| `extraAllowedFolders` | `string[]` | Add custom folders that can be imported with `@/folder`. Extends defaults without replacing them. Use when your project has folders like `features/`, `modules/`, etc. |
| `extraReduxSubfolders` | `string[]` | Add Redux-related subfolders that can be imported directly (`@/selectors`) or nested (`@/redux/selectors`). Default subfolders: `actions`, `reducers`, `store`, `thunks`, `types` |
| `extraDeepImportFolders` | `string[]` | Add folders where direct file imports are allowed (`@/assets/images/logo.svg`). Use for folders without index files like images, fonts, etc. Default: `assets` |
| `aliasPrefix` | `string` | Change the path alias prefix if your project uses something other than `@/` (e.g., `~/`, `src/`) |
| `allowedFolders` | `string[]` | Completely replace the default allowed folders list. Use only if you need full control over which folders are valid |
| `reduxSubfolders` | `string[]` | Completely replace the default Redux subfolders list |
| `deepImportFolders` | `string[]` | Completely replace the default deep import folders list |

```javascript
// Example: Add custom folders to the defaults
"code-style/absolute-imports-only": ["error", {
    extraAllowedFolders: ["features", "modules"],
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

### `index-exports-only`

**What it does:** Index files (`index.ts`, `index.tsx`, `index.js`, `index.jsx`) should only contain imports and re-exports, not any code definitions. All definitions (types, interfaces, functions, variables, classes) should be moved to separate files.

**Why use it:** Index files should be "barrels" that aggregate exports from a module. Mixing definitions with re-exports makes the codebase harder to navigate and can cause circular dependency issues.

```javascript
// ✅ Good — index.ts with only imports and re-exports
export { Button } from "./Button";
export { helper } from "./utils";
export type { ButtonProps } from "./types";
export * from "./constants";

// ❌ Bad — index.ts with code definitions
export type ButtonVariant = "primary" | "secondary";  // Move to types.ts
export interface ButtonProps { ... }                  // Move to types.ts
export const CONSTANT = "value";                      // Move to constants.ts
export function helper() { ... }                      // Move to utils.ts
```

---

### `inline-export-declaration`

**What it does:** Enforces that exports are declared inline with the declaration (`export const`, `export function`) instead of using grouped export statements (`export { ... }`). Auto-fixable: adds `export` to each declaration and removes the grouped export statement.

**Why use it:** Inline exports make it immediately clear which declarations are public. Grouped exports at the bottom of a file require scrolling to discover what's exported, and they can become stale or inconsistent with the actual declarations.

**Important exceptions:**
- **Index files** (barrel re-exports) are skipped entirely -- they should use grouped/re-export syntax
- **Aliased exports** (`export { a as b }`) are skipped since they cannot be expressed as inline exports

```javascript
// ✅ Good — inline export declarations
export const strings = {
    title: "Hello",
    subtitle: "World",
};

export const MAX_RETRIES = 3;

export function fetchData() {
    return fetch("/api/data");
}

// ❌ Bad — grouped export statement
const strings = {
    title: "Hello",
    subtitle: "World",
};

const MAX_RETRIES = 3;

function fetchData() {
    return fetch("/api/data");
}

export { strings, MAX_RETRIES, fetchData };
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
`actions`, `apis`, `assets`, `atoms`, `components`, `config`, `configs`, `constants`, `contexts`, `data`, `enums`, `helpers`, `hooks`, `interfaces`, `layouts`, `lib`, `middlewares`, `pages`, `providers`, `reducers`, `redux`, `requests`, `routes`, `schemas`, `services`, `store`, `styles`, `theme`, `thunks`, `types`, `ui`, `utils`, `utilities`, `views`

**Default Ignore Patterns:**
`index.js`, `index.jsx`, `index.ts`, `index.tsx`, `.DS_Store`, `__tests__`, `__mocks__`, `*.test.js`, `*.test.jsx`, `*.test.ts`, `*.test.tsx`, `*.spec.js`, `*.spec.jsx`, `*.spec.ts`, `*.spec.tsx`

**Customization Options:**

| Option | Type | Description |
|--------|------|-------------|
| `extraModuleFolders` | `string[]` | Add folders that should have an `index.js` re-exporting all public files. Use for project-specific folders like `features/`, `modules/` that follow the same pattern |
| `extraLazyLoadFolders` | `string[]` | Add folders exempt from index file requirements. Use for route/page components loaded via dynamic `import()`. Default: `pages`, `views` |
| `extraIgnorePatterns` | `string[]` | Add file patterns to skip when checking for index exports. Supports wildcards like `*.stories.js`, `*.mock.js` |
| `moduleFolders` | `string[]` | Completely replace the default module folders list. Use only if you need full control over which folders require index files |
| `lazyLoadFolders` | `string[]` | Completely replace the default lazy load folders list |
| `ignorePatterns` | `string[]` | Completely replace the default ignore patterns list |

```javascript
// Example: Add custom folders and patterns
"code-style/module-index-exports": ["error", {
    extraModuleFolders: ["features", "modules"],
    extraLazyLoadFolders: ["screens"],
    extraIgnorePatterns: ["*.stories.js", "*.mock.js"]
}]
```

<br />

---

[← Back to Rules Index](./README.md) | [← Back to Main README](../../README.md)
