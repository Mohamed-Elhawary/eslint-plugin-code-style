# Recommended ESLint Configuration for React + TypeScript + Tailwind Projects

This is the **recommended ESLint flat configuration** for React projects using TypeScript and Tailwind CSS. This configuration extends the base React config and adds:

- **[@typescript-eslint/eslint-plugin](https://typescript-eslint.io/)** — TypeScript-specific linting rules
- **[eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss)** — Tailwind CSS linting rules
- **[eslint-plugin-perfectionist](https://perfectionist.dev/)** — Sort interfaces, enums, and object types

> **Note:** This configuration includes all rules from the base React config plus TypeScript and Tailwind-specific rules.

## Why Use This Configuration?

- **Complete TypeScript Support** — Full TypeScript parser and recommended rules
- **Tailwind CSS Optimization** — Enforces class ordering, shorthand usage, and catches common mistakes
- **Type-Safe Imports** — Enforces consistent type imports with `import type`
- **Sorted Interfaces & Enums** — Auto-sortable TypeScript interfaces and string enums
- **All Base React Rules** — Includes all 51 custom code-style rules plus React best practices
- **TypeScript Formatting Rules** — Enforce consistent naming and formatting for interfaces, types, and enums

---

## Installation

Install all required dependencies:

```bash
npm install --save-dev \
  eslint \
  @eslint/js \
  @stylistic/eslint-plugin \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  globals \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-import-x \
  eslint-plugin-jsx-a11y \
  eslint-plugin-check-file \
  eslint-plugin-perfectionist \
  eslint-plugin-simple-import-sort \
  eslint-plugin-tailwindcss \
  eslint-plugin-code-style
```

Or with a single line:

```bash
npm install --save-dev eslint @eslint/js @stylistic/eslint-plugin @typescript-eslint/parser @typescript-eslint/eslint-plugin globals eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import-x eslint-plugin-jsx-a11y eslint-plugin-check-file eslint-plugin-perfectionist eslint-plugin-simple-import-sort eslint-plugin-tailwindcss eslint-plugin-code-style
```

---

## Usage

1. Copy the `eslint.config.js` file to your project root
2. Run ESLint with auto-fix:

```bash
eslint src/ --fix
```

---

## TypeScript-Specific Rules

### @typescript-eslint/eslint-plugin

**Purpose:** TypeScript-specific linting rules that understand TypeScript syntax and types.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `@typescript-eslint/consistent-type-imports` | `prefer: type-imports, fixStyle: separate-type-imports` | Enforces `import type { X }` for type-only imports — better tree-shaking and clearer intent |
| `@typescript-eslint/no-explicit-any` | `warn` | Warns about `any` usage — encourages proper typing without being too strict |
| `@typescript-eslint/no-unused-vars` | `error, argsIgnorePattern: ^_, varsIgnorePattern: ^_` | Catches unused variables but allows `_` prefix for intentionally unused params |

**Disabled Base Rules:**
These base ESLint rules are disabled in favor of their TypeScript equivalents:
- `no-unused-vars` → `@typescript-eslint/no-unused-vars`
- `no-use-before-define` → handled by TypeScript
- `no-redeclare` → handled by TypeScript

---

### TypeScript Sorting (via perfectionist)

**Purpose:** Automatically sort TypeScript interface properties, enum members, and object types.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `perfectionist/sort-interfaces` | `natural, asc` | Sort interface properties alphabetically — consistent with object sorting |
| `perfectionist/sort-enums` | `natural, asc` | Sort enum members alphabetically — easier to scan and maintain |
| `perfectionist/sort-object-types` | `natural, asc` | Sort type alias properties alphabetically |

**Example:**
```typescript
// ✅ Good — sorted interface
interface User {
    age: number;
    email: string;
    name: string;
}

// ✅ Good — sorted enum
enum Status {
    Active = "active",
    Inactive = "inactive",
    Pending = "pending",
}

// ✅ Good — sorted type
type Config = {
    debug: boolean;
    port: number;
    timeout: number;
};
```

---

## TypeScript Formatting Rules (code-style)

**Purpose:** Enforce consistent naming and formatting for TypeScript definitions.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `code-style/enum-format` | `error` | Enforces PascalCase + Enum suffix, UPPER_CASE members, no empty lines, commas instead of semicolons |
| `code-style/interface-format` | `error` | Enforces PascalCase + Interface suffix, camelCase properties, no empty lines, commas instead of semicolons |
| `code-style/type-format` | `error` | Enforces PascalCase + Type suffix, camelCase properties, no empty lines, commas instead of semicolons |
| `code-style/typescript-definition-location` | `error` | Enforces interfaces in `interfaces/`, types in `types/`, enums in `enums/` folders |

**Example:**
```typescript
// ✅ Good — proper TypeScript formatting and location
// src/interfaces/user.ts
export interface UserInterface {
    email: string,
    id: string,
    name: string,
}

// src/types/config.ts
export type ApiResponseType<T> = {
    data: T,
    status: number,
};

// src/enums/status.ts
export enum UserRoleEnum {
    ADMIN = "admin",
    GUEST = "guest",
    USER = "user",
}

// ❌ Bad — wrong naming and formatting
export interface User {        // Missing Interface suffix
    Email: string;             // Should be camelCase, use comma
}

export enum Status {           // Missing Enum suffix
    active = "active",         // Should be UPPER_CASE
}
```

---

## Tailwind CSS Rules

### eslint-plugin-tailwindcss

**Purpose:** Enforce Tailwind CSS best practices and catch common mistakes.

| Rule | Setting | Why This Value |
|------|---------|----------------|
| `tailwindcss/classnames-order` | `error` | Auto-sorts Tailwind classes in recommended order — consistent class ordering |
| `tailwindcss/enforces-shorthand` | `error` | Use `p-4` instead of `px-4 py-4` — cleaner and more maintainable |
| `tailwindcss/no-custom-classname` | `off` | Allows custom class names — many projects need custom classes alongside Tailwind |
| `tailwindcss/no-unnecessary-arbitrary-value` | `error` | Warns when using arbitrary values like `w-[16px]` when `w-4` exists |

**Example:**
```tsx
// ✅ Good — sorted classes, using shorthand
<div className="flex items-center justify-between p-4 text-lg font-bold">

// ❌ Bad — unsorted classes, not using shorthand
<div className="font-bold text-lg justify-between items-center flex px-4 py-4">
```

### Customizing Tailwind Rules

To allow specific custom class names:

```javascript
rules: {
    "tailwindcss/no-custom-classname": ["error", {
        whitelist: [
            "custom-class",
            "my-component",
        ],
    }],
}
```

---

## File Extensions

This configuration handles the following file extensions:

| Extension | Included |
|-----------|----------|
| `.js` | ✅ |
| `.jsx` | ✅ |
| `.ts` | ✅ |
| `.tsx` | ✅ |

The `react/jsx-filename-extension` rule is set to allow JSX in `.jsx` and `.tsx` files only.

---

## Import Resolver Settings

The configuration includes TypeScript-aware import resolution:

```javascript
settings: {
    "import-x/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import-x/resolver": {
        node: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            paths: ["src"],
        },
    },
}
```

---

## Base React Rules

This configuration includes all rules from the base React configuration:

- **@stylistic/eslint-plugin** — All formatting rules
- **eslint-plugin-react** — React-specific rules
- **eslint-plugin-react-hooks** — Rules of Hooks
- **eslint-plugin-import-x** — Import/export rules
- **eslint-plugin-jsx-a11y** — Accessibility rules
- **eslint-plugin-check-file** — File naming conventions
- **eslint-plugin-perfectionist** — Sorting rules
- **eslint-plugin-simple-import-sort** — Import sorting
- **eslint-plugin-code-style** — 47 custom formatting rules

For detailed documentation on these rules, see the [React configuration README](../react/README.md).

---

## Customization

### Override Rules

```javascript
import baseConfig from "./eslint.config.js";

export default [
    ...baseConfig,
    {
        rules: {
            // Make any rule more strict
            "@typescript-eslint/no-explicit-any": "error",

            // Allow custom Tailwind classes for your project
            "tailwindcss/no-custom-classname": ["error", {
                whitelist: ["my-custom-class"],
            }],
        },
    },
];
```

### TypeScript Project References

If using TypeScript project references, you may need to configure the parser options:

```javascript
{
    languageOptions: {
        parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: import.meta.dirname,
        },
    },
}
```

---

## Comparison with Base React Config

| Feature | React Config | React + TS + TW Config |
|---------|--------------|------------------------|
| TypeScript Parser | ❌ | ✅ |
| TypeScript Rules | ❌ | ✅ |
| Tailwind Rules | ❌ | ✅ |
| Interface Sorting | ❌ | ✅ |
| File Extensions | `.js`, `.jsx` | `.js`, `.jsx`, `.ts`, `.tsx` |

---

## Support

For issues or feature requests, please visit the [GitHub repository](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style).
