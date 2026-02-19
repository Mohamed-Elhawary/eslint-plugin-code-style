# Component Rules

### `component-props-destructure`

**What it does:** Enforces that React component props must be destructured in the function parameter, not received as a single `props` object.

**Why use it:** Destructured props make it immediately clear what props a component uses. It improves readability and helps catch unused props.

```typescript
// Good — props are destructured
export const Button = ({ label, onClick, variant = "primary" }) => (
    <button onClick={onClick} type="button">
        {label}
    </button>
);

export const Card = ({
    children,
    className = "",
    title,
} : {
    children: ReactNode,
    className?: string,
    title: string,
}) => (
    <div className={className}>
        <h2>{title}</h2>
        {children}
    </div>
);

// Bad — props received as single object
export const Button = (props) => (
    <button onClick={props.onClick} type="button">
        {props.label}
    </button>
);

export const Card = (props: CardPropsInterface) => (
    <div className={props.className}>
        <h2>{props.title}</h2>
        {props.children}
    </div>
);
```

---

### `component-props-inline-type`

**What it does:** Enforces that React component props must use inline type annotation instead of referencing an interface or type alias. Also enforces:
- Exactly one space before and after colon: `} : {`
- Props in type must match exactly with destructured props (no missing or extra)
- Each prop type on its own line when there are multiple props
- First prop type must be on new line after `{` when multiple props
- No empty lines after opening brace or before closing brace
- No space before `?` in optional properties (`prop?: type` not `prop ?: type`)
- Trailing commas (not semicolons) for each prop type
- No empty lines between prop types

**Why use it:** Inline types keep the prop definitions colocated with the component, making it easier to understand and modify the component without jumping to separate interface definitions. Enforcing prop matching ensures type safety and prevents unused type properties.

```typescript
// Good — inline type annotation with matching props
export const Button = ({ label } : { label: string }) => (
    <button type="button">{label}</button>
);

export const Card = ({
    className = "",
    description,
    title,
} : {
    className?: string,
    description?: string,
    title: string,
}) => (
    <div className={className}>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
    </div>
);

// Bad — interface reference instead of inline type
interface ButtonPropsInterface {
    label: string,
}
export const Button = ({ label }: ButtonPropsInterface) => (
    <button type="button">{label}</button>
);

// Bad — missing space before and after colon
export const Button = ({ label }:{ label: string }) => (
    <button type="button">{label}</button>
);

// Bad — props don't match (extra 'flag' in type, missing in destructured)
export const Card = ({
    title,
} : {
    flag: boolean,
    title: string,
}) => (
    <div>{title}</div>
);

// Bad — semicolons instead of commas
export const Card = ({ title } : { title: string; }) => (
    <div>{title}</div>
);

// Bad — first prop on same line as opening brace
export const Card = ({
    title,
} : { title: string,
    className?: string,
}) => (
    <div>{title}</div>
);

// Bad — space before ? in optional property
export const Card = ({ title } : { title ?: string }) => (
    <div>{title}</div>
);

// Bad — props on same line when multiple
export const Card = ({ a, b } : { a: string, b: string }) => (
    <div>{a}{b}</div>
);
```

---

### `folder-based-naming-convention`

**What it does:** Enforces naming conventions based on folder location, with chained folder names for nested files. Also enforces camelCase suffix for data/constants/strings/services/reducers folders (e.g., `authData`, `apiConstants`, `loginStrings`, `userServices`):

| Folder | Suffix | Example |
|--------|--------|---------|
| `views/` | View | `DashboardView` |
| `layouts/` | Layout | `MainLayout` |
| `pages/` | Page | `HomePage` |
| `providers/` | Provider | `AuthProvider` |
| `reducers/` | Reducer | `UserReducer` |
| `contexts/` | Context | `AuthContext` |
| `theme/` / `themes/` | Theme | `DarkTheme` |
| `data/` | Data (camelCase) | `authData` |
| `constants/` | Constants (camelCase) | `apiConstants` |
| `strings/` | Strings (camelCase) | `loginStrings` |
| `services/` | Services (camelCase) | `userServices` |
| `atoms/` | *(none)* | `Button` |
| `components/` | *(none)* | `Card` |

Nested files chain folder names (e.g., `layouts/auth/login.tsx` -> `LoginAuthLayout`, `atoms/input/password.tsx` -> `PasswordInput`).

**Why use it:** Consistent naming based on folder structure makes purpose immediately clear. The chained naming encodes the full path context into the name. The camelCase suffix for data/constants/strings/services/reducers folders distinguishes these utility modules from PascalCase component-like entities.

```tsx
// Good — suffix folders
// in views/dashboard.tsx
export const DashboardView = () => <div>Dashboard</div>;

// in layouts/auth/login.tsx (chained: Login + Auth + Layout)
export const LoginAuthLayout = () => <div>Login</div>;

// in providers/auth.tsx
export const AuthProvider = ({ children }) => <AuthContext.Provider>{children}</AuthContext.Provider>;

// in contexts/auth.ts
export const AuthContext = createContext(null);

// in reducers/user.ts
export const UserReducer = (state, action) => { ... };

// in themes/dark.ts
export const DarkTheme = { primary: "#000" };

// Good — camelCase suffix folders
// in data/auth.ts
export const authData = { ... };

// in constants/api.ts
export const apiConstants = { ... };

// in strings/login.ts
export const loginStrings = { ... };

// in services/user.ts
export const userServices = { ... };

// Good — no-suffix folders (chaining only)
// in atoms/input/password.tsx (chained: Password + Input)
export const PasswordInput = () => <input type="password" />;

// in atoms/button.tsx
export const Button = () => <button>Click</button>;

// in components/card.tsx
export const Card = () => <div>Card</div>;

// Bad
// in layouts/auth/login.tsx (should be "LoginAuthLayout")
export const Login = () => <div>Login</div>;

// in reducers/user.ts (should be "UserReducer")
export const User = (state, action) => { ... };

// in atoms/input/password.tsx (should be "PasswordInput")
export const Password = () => <input type="password" />;
```

> **Note:** Module barrel files (e.g., `views/index.ts`) are skipped. Interfaces, enums, and types have their own naming rules (`interface-format`, `enum-format`, `type-format`). Auto-fix renames the identifier and all its references.

---

### `folder-structure-consistency`

**What it does:** Enforces that module folders have a consistent internal structure — either all flat files or all wrapped in subfolders. Wrapped mode is only justified when at least one subfolder contains 2+ files. Applies to the same folders as `module-index-exports`: atoms, components, hooks, utils, enums, types, interfaces, reducers, layouts, views, pages, and more.

**Why use it:** Mixing flat files and wrapped folders in the same directory creates inconsistency. This rule ensures a uniform structure — if one item needs a folder (because it has multiple files), all items should be wrapped; if none do, keep everything flat.

**Configurable options:**
| Option | Default | Description |
|--------|---------|-------------|
| `moduleFolders` | Same as `module-index-exports` (atoms, components, hooks, utils, enums, types, views, layouts, pages, etc.) | Replace the entire folder list |
| `extraModuleFolders` | `[]` | Add extra folders on top of the defaults |

```
// Good — flat mode (all direct files)
atoms/input.tsx
atoms/calendar.tsx

// Good — wrapped mode (justified — input has multiple files)
atoms/input/index.tsx
atoms/input/helpers.ts
atoms/calendar/index.tsx

// Bad — mixed (some flat, some wrapped with justification)
atoms/input.tsx              -> "all items should be wrapped in folders"
atoms/calendar/index.tsx
atoms/calendar/helpers.ts

// Bad — wrapped but unnecessary (each folder has only 1 file)
atoms/input/index.tsx        -> "use direct files instead"
atoms/calendar/index.tsx

// Bad — mixed without justification
atoms/input.tsx
atoms/calendar/index.tsx     -> "use direct files instead"
```

> **Note:** This rule applies equally to all module folders — component folders (atoms, components, views), data folders (enums, types, interfaces), and utility folders (hooks, utils, helpers). The `folder-based-naming-convention` naming rule is separate and enforces export naming based on folder location.

---

### `no-redundant-folder-suffix`

**What it does:** Flags files and folders whose name redundantly includes the parent (or ancestor) folder name as a suffix. Since the folder already provides context, the name doesn't need to repeat it.

**Why use it:** This complements `folder-based-naming-convention` — the *file name* should stay clean while the *exported component name* carries the suffix. For example, `layouts/main.tsx` exporting `MainLayout` is better than `layouts/main-layout.tsx` exporting `MainLayout`.

```
// Good — names don't repeat the folder name
layouts/main.tsx           -> export const MainLayout = ...
atoms/button.tsx           -> file "button" has no redundant suffix
views/dashboard.tsx        -> file "dashboard" has no redundant suffix
views/access-control/...   -> folder "access-control" has no redundant suffix
atoms/input/index.tsx      -> uses "index" inside folder (correct)

// Bad — file name matches parent folder name (use index instead)
atoms/input/input.tsx      -> use "input/index.tsx" instead
components/card/card.tsx   -> use "card/index.tsx" instead

// Bad — file names redundantly include the folder suffix
layouts/main-layout.tsx    -> redundant "-layout" (already in layouts/)
atoms/button-atom.tsx      -> redundant "-atom" (already in atoms/)
views/dashboard-view.tsx   -> redundant "-view" (already in views/)

// Bad — folder names redundantly include the ancestor suffix
views/access-control-view/ -> redundant "-view" (already in views/)

// Nested names are also checked against ancestor folders
atoms/forms/input-atom.tsx -> redundant "-atom" from ancestor "atoms/"
```

> **Note:** Index files (`index.ts`, `index.js`, etc.) are skipped for file name checks. Folder names are singularized automatically (e.g., `layouts` -> `layout`, `categories` -> `category`, `classes` -> `class`). Hook files (`use-*`) inside `hooks/` folders are also skipped, since they intentionally include the module name as required by `hook-file-naming-convention`.

---

### `svg-icon-naming-convention`

**What it does:** Enforces naming conventions for SVG icon components:
- Components that return only an SVG element must have a name ending with "Icon"
- Components with "Icon" suffix must return an SVG element

**Why use it:** Consistent naming makes it immediately clear which components render icons, improving code readability and making icon components easier to find in large codebases.

```tsx
// Good — returns SVG and ends with "Icon"
export const SuccessIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className}>
        <path d="M9 12l2 2 4-4" />
    </svg>
);

// Good — returns non-SVG and doesn't end with "Icon"
export const Button = ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
);

// Bad — returns SVG but doesn't end with "Icon"
export const Success = ({ className = "" }: { className?: string }) => (
    <svg className={className}>
        <path d="M9 12l2 2 4-4" />
    </svg>
);
// Error: Component "Success" returns an SVG element and should end with "Icon" suffix

// Bad — ends with "Icon" but doesn't return SVG
export const ButtonIcon = ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
);
// Error: Component "ButtonIcon" has "Icon" suffix but doesn't return an SVG element
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
