# TypeScript Rules

### `enum-format`

**What it does:** Enforces consistent formatting for TypeScript enums:
- Enum names must be PascalCase and end with `Enum` suffix
- Enum members must be UPPER_CASE (for string enums) or PascalCase (for numeric enums)
- No empty lines between enum members
- Members must end with commas, not semicolons

**Why use it:** Consistent enum naming makes enums instantly recognizable. UPPER_CASE members follow common conventions for constants.

```typescript
// Good — proper enum format
export enum StatusEnum {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
}

export enum HttpMethodEnum {
    DELETE = "DELETE",
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
}

// Bad — wrong naming
export enum Status {           // Missing Enum suffix
    active = "active",         // Should be UPPER_CASE
    inactive = "inactive";     // Should use comma, not semicolon
}

// Bad — empty lines between members
export enum UserStatusEnum {
    ACTIVE = "active",

    INACTIVE = "inactive",
}
```

---

### `enum-type-enforcement`

**What it does:** When a variable or parameter has a type ending in `Type` (like `ButtonVariantType`), enforces using the corresponding enum (`ButtonVariantEnum.VALUE`) instead of string literals.

**Why use it:** Using enum values instead of string literals provides type safety, autocompletion, and prevents typos. Changes to enum values automatically propagate.

```javascript
// Good — using enum values
const Button = ({
    variant = ButtonVariantEnum.PRIMARY,
}: {
    variant?: ButtonVariantType,
}) => { ... };

if (variant === ButtonVariantEnum.GHOST) {
    // ...
}

// Bad — using string literals
const Button = ({
    variant = "primary",  // Should use ButtonVariantEnum.PRIMARY
}: {
    variant?: ButtonVariantType,
}) => { ... };

if (variant === "ghost") {  // Should use ButtonVariantEnum.GHOST
    // ...
}
```

---

### `interface-format`

**What it does:** Enforces consistent formatting for TypeScript interfaces:
- Interface names must be PascalCase and end with `Interface` suffix
- Properties must be camelCase
- No empty lines between properties
- Properties must end with commas, not semicolons

**Why use it:** Consistent interface naming makes interfaces instantly recognizable. The suffix clearly distinguishes interfaces from types and classes.

```typescript
// Good — proper interface format
export interface UserInterface {
    email: string,
    id: string,
    isActive: boolean,
    name: string,
}

export interface ApiResponseInterface<T> {
    data: T,
    error: string | null,
    status: number,
    success: boolean,
}

// Bad — wrong naming
export interface User {        // Missing Interface suffix
    Email: string;             // Should be camelCase
    ID: string;                // Should be camelCase
    is_active: boolean;        // Should be camelCase, use comma
}

// Bad — semicolons and empty lines
export interface UserInterface {
    email: string;             // Should use comma

    name: string;              // Empty line not allowed
}
```

---

### `no-inline-type-definitions`

**What it does:** Reports when function parameters have inline union types that are too complex (too many members or too long). These should be extracted to a named type in a types file.

**Why use it:** Complex inline types make function signatures hard to read. Named types are reusable, self-documenting, and easier to maintain.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxUnionMembers` | `integer` | `2` | Maximum union members before requiring extraction |
| `maxLength` | `integer` | `50` | Maximum character length before requiring extraction |

```javascript
// Good — type extracted to separate file
// types.ts
export type ButtonVariantType = "primary" | "muted" | "danger";

// Button.tsx
import { ButtonVariantType } from "./types";
export const Button = ({
    variant,
}: {
    variant?: ButtonVariantType,
}) => { ... };

// Bad — complex inline union type
export const Button = ({
    variant,
}: {
    variant?: "primary" | "muted" | "danger",  // Extract to named type
}) => { ... };
```

---

### `prop-naming-convention`

**What it does:** Enforces naming conventions for boolean and callback props in TypeScript interfaces, types, and inline type definitions:
- Boolean props must start with: `is`, `has`, `with`, or `without` (followed by capital letter)
- Callback props must start with: `on` (followed by capital letter)
- Detects React event handler types: `MouseEventHandler`, `ChangeEventHandler`, `FormEventHandler`, `KeyboardEventHandler`, etc.
- Applies to all nesting levels (nested object types are checked recursively)
- Does NOT apply to JSX element attributes (external components have their own props)

**Why use it:** Consistent prop naming makes props self-documenting. Boolean prefixes clarify intent (`isLoading` vs `loading`), and `on` prefix clearly identifies event handlers.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `booleanPrefixes` | `string[]` | - | Replace default prefixes entirely (overrides defaults) |
| `extendBooleanPrefixes` | `string[]` | `[]` | Add to default prefixes (`is`, `has`, `with`, `without`) |
| `allowPastVerbBoolean` | `boolean` | `false` | Allow past verb booleans (e.g., `disabled`, `selected`, `checked`, `opened`) |
| `allowContinuousVerbBoolean` | `boolean` | `false` | Allow continuous verb booleans (e.g., `loading`, `saving`, `fetching`) |
| `callbackPrefix` | `string` | `"on"` | Required prefix for callback props |
| `allowActionSuffix` | `boolean` | `false` | Allow `xxxAction` pattern for callbacks |

```typescript
// Good — proper prop naming
interface ButtonPropsInterface {
    isDisabled: boolean,
    isLoading: boolean,
    hasError: boolean,
    onClick: () => void,
    onSubmit: (data: FormData) => void,
}

type CardPropsType = {
    isExpanded: boolean,
    hasChildren: boolean,
    onToggle: () => void,
};

// Good — nested types are also checked
interface FormPropsInterface {
    isValid: boolean,
    config: {
        isEnabled: boolean,      // Nested - checked
        onValidate: () => void,  // Nested - checked
        settings: {
            isActive: boolean,   // Deep nested - also checked
        },
    },
}

// Good — inline component props
const Button = ({
    isLoading,
    onClick,
}: {
    isLoading: boolean,
    onClick: () => void,
}) => { ... };

// Bad — missing prefixes
interface ButtonPropsInterface {
    disabled: boolean,    // Should be isDisabled
    loading: boolean,     // Should be isLoading
    error: boolean,       // Should be hasError
    click: () => void,    // Should be onClick
    handleSubmit: () => void,  // Should be onSubmit
}

// Bad — nested types also checked
type PropsType = {
    config: {
        enabled: boolean,  // Should be isEnabled
        toggle: () => void, // Should be onToggle
    },
};
```

**Past Verb Booleans** (`allowPastVerbBoolean: true`):

When enabled, allows boolean props that are past tense verbs (ending in `-ed`):

```typescript
// Allowed with allowPastVerbBoolean: true
interface PropsInterface {
    disabled: boolean,    // Past verb - ends with -ed
    selected: boolean,    // Past verb - ends with -ed
    checked: boolean,     // Past verb - ends with -ed
    opened: boolean,      // Past verb - ends with -ed
    closed: boolean,      // Past verb - ends with -ed
    expanded: boolean,    // Past verb - ends with -ed
    collapsed: boolean,   // Past verb - ends with -ed
    focused: boolean,     // Past verb - ends with -ed
    hidden: boolean,      // Past verb - ends with -ed
    connected: boolean,   // Past verb - ends with -ed
}
```

**Continuous Verb Booleans** (`allowContinuousVerbBoolean: true`):

When enabled, allows boolean props that are continuous tense verbs (ending in `-ing`):

```typescript
// Allowed with allowContinuousVerbBoolean: true
interface PropsInterface {
    loading: boolean,     // Continuous verb - ends with -ing
    saving: boolean,      // Continuous verb - ends with -ing
    fetching: boolean,    // Continuous verb - ends with -ing
    closing: boolean,     // Continuous verb - ends with -ing
    opening: boolean,     // Continuous verb - ends with -ing
    submitting: boolean,  // Continuous verb - ends with -ing
    processing: boolean,  // Continuous verb - ends with -ing
    updating: boolean,    // Continuous verb - ends with -ing
    deleting: boolean,    // Continuous verb - ends with -ing
    pending: boolean,     // Continuous verb - ends with -ing
}
```

**Configuration Examples:**

```javascript
// Default configuration (strict)
"code-style/prop-naming-convention": "error"

// Allow past verb booleans (disabled, selected, checked, etc.)
"code-style/prop-naming-convention": ["error", {
    allowPastVerbBoolean: true,
}]

// Allow continuous verb booleans (loading, saving, fetching, etc.)
"code-style/prop-naming-convention": ["error", {
    allowContinuousVerbBoolean: true,
}]

// Allow both past and continuous verb booleans
"code-style/prop-naming-convention": ["error", {
    allowPastVerbBoolean: true,
    allowContinuousVerbBoolean: true,
}]

// Extend default prefixes with additional ones
"code-style/prop-naming-convention": ["error", {
    extendBooleanPrefixes: ["should", "can", "will", "did"],
}]

// Replace default prefixes entirely
"code-style/prop-naming-convention": ["error", {
    booleanPrefixes: ["is", "has"],  // Only these prefixes allowed
}]

// Allow "xxxAction" suffix for callbacks
"code-style/prop-naming-convention": ["error", {
    allowActionSuffix: true,  // Allows: submitAction, copyAction, deleteAction
}]

// Full custom configuration
"code-style/prop-naming-convention": ["error", {
    extendBooleanPrefixes: ["should", "can"],
    allowPastVerbBoolean: true,
    allowContinuousVerbBoolean: true,
    callbackPrefix: "on",
    allowActionSuffix: true,
}]
```

---

### `type-format`

**What it does:** Enforces consistent formatting for TypeScript type aliases:
- Type names must be PascalCase and end with `Type` suffix
- Properties must be camelCase
- No empty lines between properties
- Properties must end with commas, not semicolons
- Union types with 5+ members must be multiline (one per line)
- Union types with <5 members must be single line

**Why use it:** Consistent type naming makes types instantly recognizable. The suffix clearly distinguishes types from interfaces and classes.

```typescript
// Good — proper type format
export type UserType = {
    email: string,
    id: string,
    name: string,
};

export type ApiResponseType<T> = {
    data: T,
    error: string | null,
    status: number,
};

// Good — union type with 6 members (multiline)
export type ButtonVariantType =
    "danger"
    | "ghost"
    | "ghost-danger"
    | "link"
    | "muted"
    | "primary";

// Good — union type with 2 members (single line)
export type CodeLayoutVariantType = "default" | "error";

// Bad — 6 members should be multiline
export type BadUnionType = "a" | "b" | "c" | "d" | "e" | "f";

// Bad — 2 members should be single line
export type BadSingleType =
    "default"
    | "error";

// Bad — wrong naming
export type User = {           // Missing Type suffix
    Email: string;             // Should be camelCase
    ID: string;                // Should use comma
};

// Bad — empty lines
export type ConfigType = {
    debug: boolean,

    port: number,              // Empty line not allowed
};
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minUnionMembersForMultiline` | `integer` | `5` | Minimum number of union members to require multiline format |

```javascript
// Configuration example - require multiline for 4+ union members
"code-style/type-format": ["error", { minUnionMembersForMultiline: 4 }]
```

---

### `type-annotation-spacing`

**What it does:** Enforces consistent spacing in TypeScript type annotations:
- No space before the colon in type annotations: `name: string` not `name : string`
- One space after the colon: `name: string` not `name:string`
- No space before generic type parameters: `Array<T>` not `Array <T>`
- No space before array brackets: `string[]` not `string []`

**Why use it:** Consistent type annotation spacing follows TypeScript conventions and improves code readability.

```typescript
// Good — proper spacing
const name: string = "John";
const items: string[] = [];
const data: Array<number> = [];
const handler = (value: string): boolean => true;

function getData<T>(id: string): Promise<T> {
    return fetch(id);
}

// Bad — space before colon
const name : string = "John";
const handler = (value : string) : boolean => true;

// Bad — no space after colon
const name:string = "John";
const handler = (value:string):boolean => true;

// Bad — space before generic
const data: Array <number> = [];
function getData <T>(id: string): Promise <T> {}

// Bad — space before array brackets
const items: string [] = [];
```

---

### `typescript-definition-location`

**What it does:** Enforces that TypeScript definitions are placed in their designated folders:
- Interfaces must be in files inside the `interfaces` folder
- Types must be in files inside the `types` folder
- Enums must be in files inside the `enums` folder

**Why use it:** Separating type definitions by category makes them easier to find, maintain, and share across the codebase. It promotes a clean and organized project structure.

```typescript
// Good — definitions in correct folders
// src/interfaces/user.ts
export interface UserInterface {
    id: string,
    name: string,
}

// src/types/config.ts
export type ConfigType = {
    apiUrl: string,
    timeout: number,
};

// src/enums/status.ts
export enum UserRoleEnum {
    ADMIN = "admin",
    USER = "user",
}

// Bad — definitions in wrong folders
// src/components/user-card.tsx
interface UserProps {          // Should be in interfaces folder
    name: string,
}

// src/types/user.ts
export interface UserInterface {   // Should be in interfaces folder, not types
    id: string,
}

export enum StatusEnum {           // Should be in enums folder, not types
    ACTIVE = "active",
}
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
