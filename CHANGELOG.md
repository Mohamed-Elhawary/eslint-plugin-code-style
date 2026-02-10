# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.1] - 2026-02-10

### Fixed

- **`arrow-function-simple-jsx`** — Auto-fix now correctly collapses multiline JSX (without parens) by replacing from `=>` token end instead of just the body node
- **`arrow-function-simple-jsx`** — Detect and fix missing space after `=>` for all arrow functions (e.g., `() =>{` → `() => {`, `() =><h1>` → `() => <h1>`)

### Docs

- Added `npm run build` step to AGENTS.md bug fix checklist and testing section
- Added build + test steps to README.md Contributing section

---

## [2.0.0] - 2026-02-09

**Modular Source Architecture + Minified Build**

**Version Range:** v1.20.0 → v2.0.0

### Changed

- **BREAKING: Modular source architecture** — Split monolithic 23K-line `index.js` into `src/` with 17 category files + shared utilities
  - `src/index.js` — Entry point importing all rules
  - `src/rules/*.js` — 17 category files (arrays, arrow-functions, call-expressions, classes, comments, components, control-flow, functions, hooks, imports-exports, jsx, objects, react, spacing, strings, typescript, variables)
  - `src/utils/tailwind.js` — Shared Tailwind CSS class utilities
- **Build system** — Added esbuild to bundle and minify `src/` into `dist/index.js`
  - `npm run build` generates the bundled output
  - Output is ~269 KB (was ~1 MB), a 73% reduction
- **Package entry point** — `main` and `exports` now point to `dist/index.js` instead of `index.js`
- **npm package** — Publishes `dist/index.js` instead of root `index.js`; removed root `index.js` from package

### Added

- `esbuild.config.js` — Build configuration
- `esbuild` as devDependency
- `npm run build` script

### Stats

- Total Rules: 79
- Auto-fixable: 70 rules 🔧
- Configurable: 19 rules ⚙️
- Report-only: 9 rules
- Unpacked size: ~400 KB (was ~1.26 MB)

**Full Changelog:** [v1.20.0...v2.0.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.20.0...v2.0.0)

---

## [1.20.0] - 2026-02-09

**README Reorganization — Split Rules Reference into docs/rules/**

**Version Range:** v1.19.0 → v1.20.0

### Added

- **Rules Reference Documentation** (`docs/rules/`) — 17 category files with detailed rule documentation, examples, and configuration options
  - `arrays.md`, `arrow-functions.md`, `call-expressions.md`, `classes.md`, `comments.md`, `components.md`, `control-flow.md`, `functions.md`, `hooks.md`, `imports-exports.md`, `jsx.md`, `objects.md`, `react.md`, `spacing.md`, `strings.md`, `typescript.md`, `variables.md`
- **Rules index page** (`docs/rules/README.md`) — Overview table linking to all 17 category files

### Changed

- **README.md** — Reorganized from ~4,150 lines to ~475 lines by moving detailed rule documentation to `docs/rules/`
  - Kept: badges, Why This Plugin, Recommended Configs, Features, Installation, Quick Start, Enable All Rules, Rules Summary table, Rules Reference links, Auto-fixing, Disabling Rules, Contributing, License
  - Moved: All detailed rule examples, options, and explanations to `docs/rules/` category files
- **Recommended config READMEs** — Updated rule documentation links to point to `docs/rules/` instead of main README
- **AGENTS.md** — Updated documentation references to reflect new `docs/rules/` structure
- **package.json** — Added `docs/` to npm `files` array

**Full Changelog:** [v1.19.0...v1.20.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.19.0...v1.20.0)

---

## [1.19.0] - 2026-02-09

**New: React + Tailwind Test Project & Recommended Config**

**Version Range:** v1.18.0 → v1.19.0

### Added

- **React + Tailwind test project** (`_tests_/react-tw/`) — React + Tailwind CSS project (no TypeScript) with 70 code-style rules enabled and Tailwind CSS v4 plugin
- **React + Tailwind recommended config** (`recommended-configs/react-tw/`) — Ready-to-use ESLint flat config for React + Tailwind CSS projects without TypeScript
  - Includes 70 JavaScript-compatible code-style rules, Tailwind CSS plugin, and recommended third-party plugins
  - Documented with installation instructions, rule explanations, and customization guide

### Changed

- Updated Available Configurations table in README.md — React + Tailwind now links to config instead of "Coming Soon"
- Updated AGENTS.md — React + Tailwind marked as Available with folder paths

**Full Changelog:** [v1.18.0...v1.19.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.18.0...v1.19.0)

---

## [1.18.0] - 2026-02-09

**New: React + TypeScript Test Project & Recommended Config**

**Version Range:** v1.17.2 → v1.18.0

### Added

- **React + TypeScript test project** (`_tests_/react-ts/`) — React + TypeScript project (no Tailwind) with all 79 code-style rules enabled and @typescript-eslint parser
- **React + TypeScript recommended config** (`recommended-configs/react-ts/`) — Ready-to-use ESLint flat config for React + TypeScript projects without Tailwind CSS
  - Includes all 79 code-style rules, TypeScript parser, and recommended third-party plugins
  - Documented with installation instructions, rule explanations, and customization guide

### Changed

- Updated Available Configurations table in README.md — React + TypeScript now links to config instead of "Coming Soon"
- Updated AGENTS.md — React + TypeScript marked as Available with folder paths

**Full Changelog:** [v1.17.2...v1.18.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.17.2...v1.18.0)

---

## [1.17.2] - 2026-02-09

**Fix: CamelCase Naming Auto-Fix & Prefix Enforcement**

**Version Range:** v1.17.1 → v1.17.2

### Fixed

- **`folder-based-naming-convention`** - Fix camelCase naming enforcement for constants, data, reducers, services, and strings folders
  - Auto-fix missing suffix: `common` → `commonConstants` on save (all camelCase folders)
  - Near-match prefix enforcement: `routeConstants` → `routesConstants` when file is `routes.ts`
  - Multi-export files with unrelated prefixes (e.g., `buttonTypeData` in `data/app.ts`) are not flagged

**Full Changelog:** [v1.17.1...v1.17.2](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.17.1...v1.17.2)

---

## [1.17.1] - 2026-02-09

**Fix: Index File Behavior in Wrapped Folders**

**Version Range:** v1.17.0 → v1.17.1

### Fixed

- **`index-exports-only`** - Enforce dual index file behavior for wrapped folder structure
  - Root module index (`views/index.ts`) → barrel only (re-exports)
  - Subfolder index (`views/assessment/index.tsx`) → must contain component code, not just re-exports
  - Only one barrel per module — subfolder index files that simulate a barrel are flagged
- **`no-redundant-folder-suffix`** - Detect file name matching parent folder name (e.g., `assessment/assessment.tsx` → use `assessment/index.tsx`)

**Full Changelog:** [v1.17.0...v1.17.1](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.17.0...v1.17.1)

---

## [1.17.0] - 2026-02-09

**New Rule + Enhancements to Naming & Import Rules**

**Version Range:** v1.16.0 → v1.17.0

### Added

**New Rules (1)**
- `inline-export-declaration` - Enforce inline export declarations (`export const x = ...`) instead of grouped export statements (`export { x }`) in non-index files 🔧
  - Auto-fixable: adds `export` to each declaration and removes the grouped export statement
  - Skips index files (barrel re-exports) and aliased exports (`export { a as b }`)

### Enhanced

- **`folder-based-naming-convention`** - Extended camelCase suffix enforcement for data/constants/strings/services/reducers folders
  - Exports in `data/` must end with `Data` (e.g., `buttonTypeData`)
  - Exports in `constants/` must end with `Constants` (e.g., `localeConstants`)
  - Exports in `strings/` must end with `Strings` (e.g., `appStrings`)
  - Exports in `services/` must end with `Service`, `reducers/` with `Reducer`
- **`absolute-imports-only`** - Files within the same module folder must use relative imports instead of absolute to avoid circular dependencies 🔧
  - Detects files at any depth inside module folders (e.g., `data/auth/login/guest.tsx`)
  - Allows both `./` and `../` relative imports within the same module folder
  - Auto-fixes absolute imports to own module folder (e.g., `@/data/auth/login/guest` → `../../login/guest`)
  - Now marked as auto-fixable (`fixable: "code"`)
- **`folder-structure-consistency`** - Added loose module file detection: standalone files matching module folder names (e.g., `data.js`, `strings.js`) are flagged — must use folder structure instead

### Stats

- Total Rules: 79 (was 78)
- Auto-fixable: 70 rules (was 69) 🔧
- Configurable: 19 rules (was 18)
- Report-only: 9 rules (was 10)

**Full Changelog:** [v1.16.0...v1.17.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.16.0...v1.17.0)

---

## [1.16.0] - 2026-02-09

**New Rule + Enhancements + Rule Renames**

**Version Range:** v1.15.0 → v1.16.0

### Added

**New Rules (1)**
- `folder-structure-consistency` - Enforce consistent folder structure (flat vs wrapped) in module folders
  - Applies to all module folders (same list as `module-index-exports`)
  - Detects mixed structures (some flat files, some in subfolders)
  - Flags unnecessary wrapper folders when each has only one file
  - Configurable `moduleFolders` and `extraModuleFolders` options

### Enhanced

- **`folder-based-naming-convention`** (renamed from `folder-component-suffix`)
  - Support nested files with chained folder names (e.g., `layouts/auth/login.tsx` → `LoginAuthLayout`)
  - Match files at any depth within module folders
  - Expanded to cover: views, layouts, pages, providers, reducers, services, contexts, themes (with suffix), atoms and components (chaining only, no suffix)
  - Added `VariableDeclarator` detection for non-JSX folders (contexts, themes)
- **`no-redundant-folder-suffix`** - Also check folder names for redundant suffixes (e.g., `views/access-control-view/` is now flagged)

### Renamed

- `folder-component-suffix` → `folder-based-naming-convention` (now handles more than just components)
- `svg-component-icon-naming` → `svg-icon-naming-convention` (consistent with other naming convention rules)

### Stats

- Total Rules: 78 (was 77)
- Auto-fixable: 67 rules
- Configurable: 18 rules (was 17)
- Report-only: 11 rules (was 10)

**Full Changelog:** [v1.15.0...v1.16.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.15.0...v1.16.0)

---

## [1.15.0] - 2026-02-06

**New Rule: no-redundant-folder-suffix**

**Version Range:** v1.14.1 → v1.15.0

### Added

**New Rules (1)**
- `no-redundant-folder-suffix` - Disallow file names that redundantly include the parent or ancestor folder name as a suffix
  - Flags files like `layouts/main-layout.tsx` (redundant "-layout" since already in `layouts/`)
  - Checks all ancestor folders from `src/` onwards
  - Singularizes folder names automatically (layouts→layout, categories→category, classes→class)
  - Skips index files

### Enhanced

- **`folder-component-suffix`** - Add `layouts` folder support: components in `layouts/` must end with "Layout" suffix (with auto-fix) (v1.14.4)
- **`type-annotation-spacing`** - Add auto-fix to collapse function types with ≤2 params to one line; add spacing rules for async keyword and function types (v1.14.2–v1.14.3)
- **`interface-format`** - Fix circular fix conflict by skipping collapse when property has multi-line function type (v1.14.3)
- **`function-naming-convention`** - Detect functions destructured from hooks without proper naming, with auto-fix (v1.14.1)

### Stats

- Total Rules: 77 (was 76)
- Auto-fixable: 67 rules 🔧
- Configurable: 17 rules ⚙️
- Report-only: 10 rules (was 9)

**Full Changelog:** [v1.14.1...v1.15.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.14.1...v1.15.0)

---

## [1.14.4] - 2026-02-06

### Enhanced

- **`folder-component-suffix`** - Add `layouts` folder support: components in `layouts/` must end with "Layout" suffix (with auto-fix)

---

## [1.14.3] - 2026-02-05

### Enhanced

- **`type-annotation-spacing`** - Add auto-fix to collapse function types with 2 or fewer params to one line
- **`interface-format`** - Fix circular fix conflict by skipping collapse when property has multi-line function type

---

## [1.14.2] - 2026-02-05

### Enhanced

- **`type-annotation-spacing`** - Add spacing rules for async keyword and function types:
  - Enforce space after `async` keyword: `async()` → `async ()`
  - Enforce space after `=>` in function types: `() =>void` → `() => void`
  - Format function types with 3+ params on multiple lines
- **`interface-format`** - Skip collapsing single-property interfaces when property has function type with 3+ params

---

## [1.14.1] - 2026-02-05

### Enhanced

- **`function-naming-convention`** - Detect functions destructured from hooks without proper naming
  - Flags: `const { logout } = useAuth()` (should be `logoutHandler`)
  - Auto-fixes to: `const { logout: logoutHandler } = useAuth()`
  - Renames all usages of the local variable
  - Only flags clear action verbs (login, logout, toggle, increment, etc.)

---

## [1.14.0] - 2026-02-05

**New Rule: useState Naming Convention**

**Version Range:** v1.13.0 → v1.14.0

### Added

**New Rules (1)**
- `use-state-naming-convention` - Enforce boolean useState variables to start with valid prefixes 🔧
  - Boolean state must start with: `is`, `has`, `with`, `without` (configurable)
  - Auto-fixes both state variable and setter function names, plus all usages
  - Detects boolean literals (`useState(false)`) and type annotations (`useState<boolean>()`)
  - Options: `booleanPrefixes`, `extendBooleanPrefixes`, `allowPastVerbBoolean`, `allowContinuousVerbBoolean`

### Enhanced

- **`folder-component-suffix`** - Add auto-fix to rename component and all references in the file
- **`function-naming-convention`** - Detect useCallback-wrapped functions in custom hooks
- **`prop-naming-convention`** - Auto-fix now renames both type annotation AND destructured parameter with all usages

### Stats

- Total Rules: 76 (was 75)
- Auto-fixable: 67 rules 🔧
- Configurable: 17 rules ⚙️
- Report-only: 9 rules

**Full Changelog:** [v1.13.0...v1.14.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.13.0...v1.14.0)

---

## [1.13.0] - 2026-02-05

**New Rule: Prop Naming Convention & Auto-Fix Enhancements**

**Version Range:** v1.12.1 → v1.13.0

### Added

**New Rules (1)**
- `prop-naming-convention` - Enforce naming conventions for boolean and callback props 🔧
  - Boolean props must start with: `is`, `has`, `with`, `without` (configurable)
  - Callback props must start with: `on` (configurable)
  - Detects React event handler types (`MouseEventHandler`, `ChangeEventHandler`, `FormEventHandler`, etc.)
  - Supports nested types at any depth
  - Applies to interfaces, type aliases, and inline types (NOT JSX attributes)
  - Options: `booleanPrefixes`, `extendBooleanPrefixes`, `allowPastVerbBoolean`, `allowContinuousVerbBoolean`, `callbackPrefix`, `allowActionSuffix`

### Enhanced

- **`enum-format`** - Add auto-fix for member names (convert to UPPER_SNAKE_CASE)
- **`interface-format`** - Add auto-fix for property names (convert to camelCase); collapse single-member nested object types to one line
- **`type-format`** - Add auto-fix for property names (convert to camelCase); collapse single-member nested object types to one line; union type formatting with configurable threshold (`minUnionMembersForMultiline` option, default 5)

### Stats

- Total Rules: 75 (was 74)
- Auto-fixable: 66 rules 🔧
- Configurable: 17 rules ⚙️
- Report-only: 9 rules

**Full Changelog:** [v1.12.1...v1.13.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.12.1...v1.13.0)

---

## [1.12.1] - 2026-02-04

### Fixed

- **`function-object-destructure`** - Skip when param is used in spread operations, exclude object property keys from reference counting
- **`no-empty-lines-in-function-params`** - Only check parens within function's own range (fix for `.map(config => ...)` false positives)
- **`jsx-children-on-new-line`** - Remove blank line check after opening tag (handled by `no-empty-lines-in-jsx` rule)

---

## [1.12.0] - 2026-02-04

**New Rule: Folder Component Suffix**

**Version Range:** v1.11.1 → v1.12.0

### Added

**New Rules (1)**
- `folder-component-suffix` - Enforce naming conventions based on folder location:
  - Components in `views/` folder must end with `View` suffix
  - Components in `pages/` folder must end with `Page` suffix

### Stats

- Total Rules: 74 (was 73)
- Auto-fixable: 65 rules 🔧
- Report-only: 9 rules

**Full Changelog:** [v1.11.1...v1.12.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.1...v1.12.0)

---

## [1.11.9] - 2026-02-04

### Fixed

- **`variable-naming-convention`** - Enforce camelCase for object property keys (no longer allows SCREAMING_SNAKE_CASE like `APP_NAME`)
- **`variable-naming-convention`** - Add auto-fix to convert property names to camelCase (e.g., `APP_NAME` → `appName`)

---

## [1.11.8] - 2026-02-04

### Fixed

- **`comment-format`** - Allow `/* */` syntax for ESLint directive comments (`/* eslint-disable ... */`, `/* eslint-enable ... */`, etc.) since these must use block comment syntax

---

## [1.11.7] - 2026-02-04

### Changed

- **`no-hardcoded-strings`**
  - Remove UI component pattern exemption - ALL enum-like attribute values are now flagged (e.g., `variant="primary"`, `size="large"`, `color="danger"`)
  - Enforce consistent use of enums for component props to prevent typos

---

## [1.11.6] - 2026-02-04

### Changed

- **`no-hardcoded-strings`**
  - Flag `type` attribute in JSX elements (e.g., `<input type="text" />`) - should use enums to prevent typos
  - Remove `type` from default ignored attributes list
  - Remove "text" from UI component pattern (conflicts with input type)
  - Update error message for JSX attributes: "should be imported from @/enums (preferred) or @/data to prevent typos"

---

## [1.11.5] - 2026-02-04

### Fixed

- **`no-hardcoded-strings`**
  - Flag hardcoded strings in component default params (e.g., `type = "text"`, `variant = "ghost"`)
  - Flag hardcoded strings in ternary expressions (e.g., `showPassword ? "text" : "password"`)
  - Remove overly broad HTML input type exemption from general string checks
  - Remove "text" from CSS cursor pattern (conflicts with common input type usage)

---

## [1.11.4] - 2026-02-04

### Fixed

- **`opening-brackets-same-line`**
  - Collapse JSX elements with simple children to single line (e.g., `<span>{strings.label}</span>`)
  - Handle simple LogicalExpression children (e.g., `<p>{user?.email || fallback}</p>`)

- **`jsx-children-on-new-line`** / **`jsx-element-child-new-line`**
  - Recognize simple LogicalExpression (≤2 operands) as simple children
  - Recognize ChainExpression (optional chaining like `user?.name`) as simple expression
  - Prevent circular fix conflicts with `opening-brackets-same-line`

---

## [1.11.3] - 2026-02-04

### Fixed

- **`no-hardcoded-strings`**
  - Skip CSS values in template literals assigned to style-related variables (e.g., `const lineGradient = \`linear-gradient(...)\``)
  - Flag exported hardcoded strings like `export const tokenKey = "auth_token"` (non-SCREAMING_SNAKE_CASE exports)
  - Skip HTML input types in default parameters (e.g., `type = "text"`)
  - Smarter single-word classification: all lowercase (e.g., `"loading"`) → keyword/enum, capitalized (e.g., `"Loading"`) → UI string
  - Descriptive error messages: UI strings → `@/strings or @/constants`, keywords → `@/data or @/enums`

- **`opening-brackets-same-line`**
  - Collapse simple JSX logical expressions (≤2 operands, ≤80 chars) to single line
  - Ensure closing `}` is on its own line for multiline logical expressions with 3+ operands

---

## [1.11.2] - 2026-02-04

### Fixed

- **`no-hardcoded-strings`**
  - Skip strings inside style object expressions (CSS values like `radial-gradient(...)`, `rotate(90deg)`, etc.)
  - Skip HTML input types (`text`, `password`, `email`, `number`, etc.)
  - Add CSS function patterns (transform, gradient, animation) to ignore list
  - Simplify error message to unified format: "should be imported from @/data, @/strings, @/constants, or @/enums"
  - Remove forced flagging of status codes, roles, HTTP methods (user intent is ambiguous)

- **`ternary-condition-multiline`**
  - Skip collapsing ternaries with JSX branches (JSX ternaries should stay multiline for readability)

- **`no-inline-type-definitions`**
  - Skip union types with only built-in/native types (e.g., `Error | null`, `string | null`)
  - Only flag unions with custom inline types like `{ user: string }`

---

## [1.11.1] - 2026-02-03

### Fixed

- **`component-props-inline-type`** - Single-property type annotations spanning multiple lines now auto-fix to single line format `{ prop: Type }`
- **`function-params-per-line`** - Normalize single-member type annotations to prevent circular fix conflicts

---

## [1.11.0] - 2026-02-03

**New Rule: svg-component-icon-naming + Multiple Component Props Fixes**

**Version Range:** v1.10.1 → v1.11.0

### Added

**New Rules (1)**

- **`svg-component-icon-naming`** - Enforce SVG components to have 'Icon' suffix and vice versa
  - Components returning only `<svg>` must end with "Icon" suffix (e.g., `SuccessIcon`)
  - Components with "Icon" suffix must return an `<svg>` element
  - Works with arrow functions and function declarations

### Fixed

- **`component-props-inline-type`** - Single prop trailing comma now correctly removed (was not detecting comma in member range)
- **`component-props-inline-type`** - Closing `})` now properly placed on its own line for multiple type props (was missing for non-intersection types)
- **`function-params-per-line`** - Type annotations no longer removed when collapsing params (was losing entire type annotation)
- **`function-params-per-line`** - Default values preserved for shorthand props (e.g., `className = ""` no longer becomes `className`)
- **`function-params-per-line`** - Type annotation complexity now considered (2+ type props = complex, prevents incorrect collapsing)

### Stats

- Total Rules: 73 (was 72)
- Auto-fixable: 65 rules
- Report-only: 8 rules

**Full Changelog:** [v1.10.1...v1.11.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.10.1...v1.11.0)

---

## [1.10.3] - 2026-02-03

### Fixed

- **`no-hardcoded-strings`** - Skip template literals inside className/style attributes (Tailwind classes in template literals)
- **`component-props-inline-type`** - Auto-fix to REMOVE trailing comma for single property (not just skip adding it)

---

## [1.10.2] - 2026-02-03

### Fixed

- **`component-props-inline-type`** - Don't require trailing comma for single property in inline type definitions
- **`no-hardcoded-strings`** - Skip 40+ SVG attributes (strokeLinecap, strokeLinejoin, filter, result, in, in2, mode, colorInterpolationFilters, etc.)
- **`no-hardcoded-strings`** - Skip SVG standard attribute values (round, butt, square, miter, bevel, none, normal, sRGB, userSpaceOnUse, etc.)
- **`no-hardcoded-strings`** - Skip URL references (url(#...)) and scientific notation numbers
- **`no-hardcoded-strings`** - Skip CSS property values (cursor: pointer, display: flex, position: absolute, etc.)
- **`no-hardcoded-strings`** - Skip SVG filter result identifiers (BackgroundImageFix, SourceGraphic, etc.)

---

## [1.10.1] - 2026-02-03

### Fixed

- **`logical-expression-multiline`** - Add collapse to single line for simple expressions (≤3 operands)
- **`logical-expression-multiline`** - Skip collapsing when any operand is multiline (e.g., JSX elements)

---

## [1.10.0] - 2026-02-03

**New Rule: logical-expression-multiline + Enhanced no-hardcoded-strings**

**Version Range:** v1.9.1 → v1.10.0

### Added

**New Rules (1)**

- **`logical-expression-multiline`** - Enforce multiline formatting for logical expressions with more than maxOperands (default: 3) 🔧
  - Handles variable declarations: `const err = a || b || c || d || e;`
  - Handles return statements, assignments, and other contexts
  - Skips if/ternary conditions (handled by other rules)
  - Auto-fixes to put each operand on its own line with operator at start

### Enhanced

- **`no-hardcoded-strings`** - Major improvements:
  - Remove single-word string length limitations (now detects all single-word hardcoded strings)
  - Add validation strings: `empty`, `invalid`, `missing`, `optional`, `required`, `valid`
  - Add auth state strings: `anonymous`, `authenticated`, `authed`, `authorized`, `denied`, `forbidden`, etc.
  - Add more status strings: `done`, `finished`, `inprogress`, `queued`, `ready`, `running`, etc.
  - Skip UI component patterns in JSX attributes: `variant="ghost"`, `size="md"`, etc.
  - Skip Tailwind CSS class strings: `"px-5 py-3 w-full"`, `"hover:bg-primary"`, etc.
  - Make technical patterns stricter to avoid false negatives

### Fixed

- **`no-hardcoded-strings`** - Fix detection of strings inside exported components
- **`no-hardcoded-strings`** - Fix Tailwind detection being too broad (now requires actual Tailwind syntax)

### Stats

- Total Rules: 72 (was 71)
- Auto-fixable: 65 rules 🔧 (was 64)
- Report-only: 7 rules

**Full Changelog:** [v1.9.1...v1.10.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.1...v1.10.0)

---

## [1.9.7] - 2026-02-03

### Fixed

- **`no-hardcoded-strings`** - Fix Tailwind detection being too broad:
  - Previously: `"john"`, `"not found"` were incorrectly skipped as Tailwind classes
  - Now: Only strings with Tailwind syntax (hyphens, colons, slashes, brackets) are skipped
  - Regular strings like `const name = "john"` are now properly detected
  - Tailwind classes like `"px-5 py-3 w-full"` still correctly skipped

---

## [1.9.6] - 2026-02-03

### Enhanced

- **`no-hardcoded-strings`** - Skip Tailwind CSS class strings:
  - Multi-class strings like `"px-5 py-3 w-full bg-white"` are now ignored
  - Individual classes: `w-5`, `p-4`, `pr-12`, `text-2xl`, `gap-4`, etc.
  - State modifiers: `hover:bg-primary`, `focus:ring-2`, `disabled:opacity-50`
  - Responsive prefixes: `sm:flex`, `md:hidden`, `lg:grid`
  - Opacity values: `bg-white/50`, `text-black/80`, `placeholder-error/50`
  - Arbitrary values: `w-[100px]`, `bg-[#ff0000]`
  - Negative values: `-translate-y-1/2`, `-rotate-45`

---

## [1.9.5] - 2026-02-03

### Fixed

- **`no-hardcoded-strings`** - Fix bug where strings inside exported components were incorrectly skipped:
  - Previously: `export const Component = () => { const name = "john" }` was not detected
  - Now: Strings inside functions are properly detected regardless of export status
  - Only direct constant exports are skipped: `export const MESSAGE = "value"` or `export const DATA = { key: "value" }`

---

## [1.9.4] - 2026-02-03

### Enhanced

- **`no-hardcoded-strings`** - Skip UI component patterns only in JSX attributes:
  - In JSX attributes: `<Button variant="ghost" />` is now ignored
  - In logic: `const status = "success"` or `setValue("primary")` is still detected
  - UI patterns: `primary`, `secondary`, `ghost`, `outline`, `link`, `muted`, `danger`, `warning`, `success`, `error`, `sm`, `md`, `lg`, `xl`, `left`, `right`, `center`, `top`, `bottom`, `hover`, `focus`, `click`, etc.

---

## [1.9.3] - 2026-02-03

### Enhanced

- **`no-hardcoded-strings`** - Remove single-word string length limitations and add more special cases:
  - Removed length restrictions (now detects all single-word hardcoded strings)
  - Added validation strings: `empty`, `invalid`, `missing`, `optional`, `required`, `valid`
  - Added auth state strings: `anonymous`, `authenticated`, `authed`, `authorized`, `denied`, `forbidden`, `granted`, `locked`, `loggedin`, `loggedout`, `revoked`, `unauthenticated`, `unauthorized`, `unlocked`, `unverified`, `verified`
  - Added more status strings: `done`, `finished`, `inprogress`, `queued`, `ready`, `running`, `started`, `stopped`, `successful`, `waiting`
  - Made technical patterns stricter to avoid false negatives (camelCase requires uppercase in middle, snake_case requires underscore, kebab-case requires hyphen)

---

## [1.9.2] - 2026-02-03

### Enhanced

- **`no-hardcoded-strings`** - Now detects special strings that should be enums:
  - HTTP status codes (2xx, 4xx, 5xx like "200", "404", "500")
  - HTTP methods ("GET", "POST", "PUT", "DELETE", etc.)
  - Role/permission names ("admin", "user", "moderator", etc.)
  - Environment names ("production", "development", "staging", etc.)
  - Log levels ("debug", "info", "warn", "error", etc.)
  - Status strings ("active", "pending", "approved", "rejected", etc.)
  - Priority levels ("high", "medium", "low", "critical", etc.)
  - All above → import from `@/enums` or `@/data`
  - Regular strings → import from `@/data or @/strings or @/constants or @/@constants or @/@strings`

### Fixed

- **`no-hardcoded-strings`** - Fixed bug where `isInConstantsObjectHandler` incorrectly matched camelCase variable names due to case-insensitive regex flag

---

## [1.9.1] - 2026-02-03

### Enhanced

- **`no-hardcoded-strings`** - Initial special string detection:
  - HTTP status codes (4xx, 5xx)
  - Role/permission names

---

## [1.9.0] - 2026-02-03

**New Rule: class-method-definition-format + Enhanced Spacing Rules**

**Version Range:** v1.8.1 → v1.9.0

### Added

**New Rules (1)**
- **`class-method-definition-format`** - Enforce consistent spacing in class and method definitions 🔧
  - Space before opening brace `{` in class declarations
  - No space between method name and opening parenthesis `(`
  - Space before opening brace `{` in method definitions
  - Opening brace must be on same line as class/method signature

### Enhanced

- **`function-call-spacing`** - Now also handles:
  - `new` expressions (`new Class ()` → `new Class()`)
  - Generic type calls (`get <Type>()` → `get<Type>()`)
- **`member-expression-bracket-spacing`** - Now also handles:
  - TypeScript indexed access types (`Type ["prop"]` → `Type["prop"]`)

### Stats

- Total Rules: 71 (was 70)
- Auto-fixable: 64 rules 🔧 (was 63)
- Report-only: 7 rules

**Full Changelog:** [v1.8.1...v1.9.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.8.1...v1.9.0)

---

## [1.8.4] - 2026-02-03

### Documentation

- Fix v1.8.0 CHANGELOG entry to include Release Title, Version Range, and Full Changelog link (required for MINOR releases)
- Add missing comparison links in CHANGELOG.md (v1.3.9 through v1.8.3)
- Update manage-rule skill with CHANGELOG format requirements for new rules
- Update Current releases list in AGENTS.md to include v1.8.0

---

## [1.8.3] - 2026-02-03

### Fixed

- **`class-naming-convention`** - Auto-fix now renames all references to the class (including instantiations like `new ClassName()` and type annotations), not just the class declaration

---

## [1.8.2] - 2026-02-03

### Changed

- **`multiline-if-conditions`** - Remove configurable `maxNestingLevel` option; nesting level is now fixed at 2 to prevent overly complex conditions. Nested groups with >maxOperands are formatted multiline inline (not extracted). Extraction only occurs when nesting exceeds 2 levels.
- **`ternary-condition-multiline`** - Remove configurable `maxNestingLevel` option; nesting level is now fixed at 2 to prevent overly complex conditions. Nested groups with >maxOperands are formatted multiline inline (not extracted). Extraction only occurs when nesting exceeds 2 levels.
- **`opening-brackets-same-line`** - Skip ternary condition tests and detect intentional multiline format to prevent rule conflicts
- **`if-statement-format`** - Detect intentional multiline conditions to prevent collapsing formatted conditions

### Documentation

- Update both rules to show multiline inline formatting examples instead of extraction
- Remove `maxNestingLevel` option from documentation (now fixed internally)

---

## [1.8.1] - 2026-02-03

### Changed

- **`function-naming-convention`** - Add `handleXxx` → `xxxHandler` auto-fix (converts `handleClick` to `clickHandler` instead of `handleClickHandler`)

---

## [1.8.0] - 2026-02-03

**New Rule: no-hardcoded-strings**

**Version Range:** v1.7.1 → v1.8.0

### Added

**New Rules (1)**
- **`no-hardcoded-strings`** - Enforce importing strings from constants/strings modules instead of hardcoding them inline 🔧
  - Detects hardcoded strings in JSX text content, attributes, and component logic
  - Configurable `ignoreAttributes`, `extraIgnoreAttributes`, `ignorePatterns` options
  - Automatically ignores technical strings (CSS units, URLs, paths, identifiers, etc.)
  - Valid import paths: `@/constants`, `@/strings`, `@/@constants`, `@/@strings`, `@/data/constants`, `@/data/strings`

### Changed

- **`absolute-imports-only`** - Add `strings`, `@constants`, `@strings` to default allowed folders
- **`module-index-exports`** - Add `strings`, `@constants`, `@strings` to default module folders

### Stats

- Total Rules: 70 (was 69)
- Auto-fixable: 63 rules 🔧
- Report-only: 7 rules (was 6)

**Full Changelog:** [v1.7.1...v1.8.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.1...v1.8.0)

---

## [1.7.6] - 2026-02-02

### Changed

- **`ternary-condition-multiline`** - Now depends only on operand count, not line length:
  - ≤maxOperands (default: 3): Always collapse to single line regardless of line length
  - \>maxOperands: Format multiline with each operand on its own line
  - Removed `maxLineLength` option (no longer used)
  - This aligns behavior with `multiline-if-conditions` rule

---

## [1.7.5] - 2026-02-02

### Fixed

- **`ternary-condition-multiline`** - For ≤3 operands, always collapse to single line when `?` is on different line than condition end (enforces `condition ? value : value` format for simple ternaries)
- **`no-empty-lines-in-function-params`** - Add detection for empty lines in TSTypeLiteral (type annotation objects like `{ prop: Type }` in intersection types)

---

## [1.7.4] - 2026-02-02

### Fixed

- **`no-empty-lines-in-function-params`** - Fix bug that deleted TypeScript type annotations when fixing empty lines in destructured params; now uses `getTokenAfter` instead of `getLastToken` to find closing brace
- **`no-inline-type-definitions`** - Change threshold comparison from `>` to `>=` so 2-member unions are now flagged (with default `maxUnionMembers: 2`)
- **`ternary-condition-multiline`** - Fix multiline formatting for >3 operands: first operand stays on same line as property key, `?` and `:` each on their own lines; fix circular fix bug for ≤3 operands case

---

## [1.7.3] - 2026-02-02

### Fixed

- **`ternary-condition-multiline`** - Fix `?`/`:` on own line without value; collapse simple ternaries to single line when they fit
- **`no-empty-lines-in-function-params`** - Detect empty lines after opening `{` and before closing `}` in ObjectPattern params
- **`empty-line-after-block`** - Skip consecutive if statements (already handled by `if-else-spacing`)
- **`classname-multiline`** - Fix closing backtick alignment for return statements

### Documentation

- Add 6 missing rules to README detailed documentation
- Add 7 missing rules to README Quick Start example
- Update rule counts from 66 to 69 across all documentation files
- Update AGENTS.md Tailwind section with actual rules and comparison with `tailwindcss/classnames-order`
- Add README multi-section update warnings to AGENTS.md rule modification checklists

### Added

- **`manage-rule` skill** - New skill for adding, editing, or removing ESLint rules with complete workflow

---

## [1.7.2] - 2026-02-02

### Fixed

- **`enum-format`** - Fix double comma bug when auto-fixing trailing comma and closing brace position; check for comma token after member, not just member text
- **`interface-format`** - Same fix as enum-format for trailing comma detection

---

## [1.7.1] - 2026-02-02

### Fixed

- **`no-empty-lines-in-function-params`** - Detect empty lines between destructured properties inside ObjectPattern params
- **`component-props-inline-type`** - Handle TSIntersectionType (e.g., `ButtonHTMLAttributes & { prop: Type }`): check `&` position, opening brace position, and apply formatting rules to type literals within intersections
- **`enum-type-enforcement`** - Handle TSIntersectionType to track typed props; fix extractTypeInfoHandler argument for TSPropertySignature members
- **`ternary-condition-multiline`** - Improve simple ternary prefix calculation for object properties; add checks for `?` on same line as condition end and empty lines before `?` or `:`; fix multiline formatting to not add leading newline

---

## [1.7.0] - 2026-02-02

**New Rules for Blocks, Classes & Enum Enforcement + Multiple Enhancements**

**Version Range:** v1.6.1 → v1.7.0

### Added

**New Rules (3)**
- `empty-line-after-block` - Require empty line between closing `}` of block statement and next statement 🔧
- `class-naming-convention` - Enforce class declarations end with "Class" suffix 🔧
- `enum-type-enforcement` - Enforce using enum values instead of string literals for typed variables (e.g., `ButtonVariantEnum.PRIMARY` instead of `"primary"`) 🔧

### Enhanced

- **`ternary-condition-multiline`** - Now also collapses simple ternaries to single line when they fit within max line length (default: 120 chars). Added `maxLineLength` option.
- **`function-object-destructure`** - Add auto-fix (replaces destructured usages with dot notation), expand module paths (services, constants, config, api, utils, helpers, lib, apis, configs, utilities, routes)
- **`function-params-per-line`** - Handle callbacks with mixed params (destructured + simple like `({ item }, index)`)
- **`array-callback-destructure`** - Fix closing brace on same line as last property
- **`simple-call-single-line`** - Skip callbacks with 2+ params to avoid conflicts
- **`jsx-simple-element-one-line`**, **`jsx-children-on-new-line`**, **`jsx-element-child-new-line`** - Treat simple function calls (0-1 args) as simple expressions

### Fixed

- **`component-props-destructure`** - Detect body destructuring patterns even without type annotations, add auto-fix for body destructuring, preserve TypeScript type annotation when auto-fixing

### Stats

- Total Rules: 69 (was 66)
- Auto-fixable: 63 rules 🔧
- Report-only: 6 rules

**Full Changelog:** [v1.6.1...v1.7.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.1...v1.7.0)

---

## [1.6.6] - 2026-02-01

### Fixed

- **`component-props-destructure`** - Detect body destructuring patterns (e.g., `const { name } = data;`) even without type annotations
- **`component-props-destructure`** - Add auto-fix for body destructuring: moves props to parameter and removes body declaration

---

## [1.6.5] - 2026-02-01

### Added

- **`function-object-destructure`** - Add auto-fix: replaces destructured usages with dot notation and removes declaration

---

## [1.6.4] - 2026-02-01

### Enhanced

- **`function-object-destructure`** - Add more module paths: apis, configs, utilities, routes

---

## [1.6.3] - 2026-02-01

### Fixed

- **`component-props-destructure`** - Preserve TypeScript type annotation when auto-fixing

---

## [1.6.2] - 2026-02-01

### Enhanced

- **`function-object-destructure`** - Expand to check more module paths (services, constants, config, api, utils, helpers, lib) for dot notation enforcement

---

## [1.6.1] - 2026-02-01

### Enhanced

- **`function-params-per-line`** - Handle callbacks with mixed params (destructured + simple like `({ item }, index)`)
- **`array-callback-destructure`** - Fix closing brace on same line as last property
- **`simple-call-single-line`** - Skip callbacks with 2+ params to avoid conflicts
- **`jsx-simple-element-one-line`** - Treat simple function calls (0-1 args) as simple expressions
- **`jsx-children-on-new-line`** - Treat simple function calls (0-1 args) as simple expressions
- **`jsx-element-child-new-line`** - Treat simple function calls (0-1 args) as simple expressions

### Docs

- Clarify version bump and tag workflow in AGENTS.md

---

## [1.6.0] - 2026-02-01

**New array-callback-destructure Rule & Multiple Enhancements**

**Version Range:** v1.5.1 → v1.6.0

### Added

**New Rules (1)**
- `array-callback-destructure` - Enforce multiline destructuring in array method callbacks (map, filter, find, etc.) when there are 2+ properties 🔧

### Enhanced

- **`function-naming-convention`** - Added "forgot" to verb prefixes list
- **`arrow-function-simplify`** - Extended to handle non-JSX expression statements (simple side-effect functions)

### Changed

- **`no-plusplus`** - Changed from "error" to "off" in all config files

### Stats

- Total Rules: 66 (was 65)
- Auto-fixable: 60 rules 🔧
- Report-only: 6 rules

**Full Changelog:** [v1.5.1...v1.6.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.5.1...v1.6.0)

---

## [1.5.2] - 2026-02-01

- Version bump

---

## [1.5.1] - 2026-01-30

- Minor fixes

---

## [1.5.0] - 2026-01-30

**New if-else-spacing Rule & Enhanced Arrow/Class Method Support**

**Version Range:** v1.4.3 → v1.5.0

### Added

**New Rules (1)**
- `if-else-spacing` - Enforce proper spacing between if statements 🔧

### Enhanced

- **`function-naming-convention`** - Now checks class methods for Handler suffix (skips constructors, getters, setters, React lifecycle)
- **`arrow-function-simplify`** - Extended to handle ALL arrow functions with single return (not just JSX attributes)

### Fixed

- **Circular fix conflict** between `opening-brackets-same-line` and `function-arguments-format` for multi-argument arrow function calls

### Stats

- Total Rules: 65 (was 64)
- Auto-fixable: 59 rules 🔧
- Report-only: 6 rules

**Full Changelog:** [v1.4.3...v1.5.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.3...v1.5.0)

---

## [1.4.5] - 2026-01-30

- Version bump

---

## [1.4.3] - 2026-01-30

### Documentation

- Add CHANGELOG for v1.4.0 release

---

## [1.4.2] - 2026-01-30

**New Rules, Enhanced Auto-Fix & Comprehensive Documentation**

**Version Range:** v1.3.1 → v1.4.2

### Added

**New Rules (3)**
- `index-exports-only` - Prevent type/interface definitions in index files (move to types file)
- `ternary-condition-multiline` - Format complex ternary conditions with each operand on its own line 🔧 ⚙️
- `no-inline-type-definitions` - Extract inline union types to named types in type files ⚙️

**Auto-Fix Labels in Documentation**
- Added 🔧 label to indicate auto-fixable rules
- Added legend explaining 🔧 (auto-fixable) and ⚙️ (customizable) labels

### Enhanced

- **`function-naming-convention`** - Expanded verb list from ~50 to ~200+ verbs organized by category
- **`function-object-destructure`** - Added auto-fix: inserts destructuring at function body top
- **`component-props-destructure`** - Added auto-fix: converts `(props)` to `({ prop1, prop2 })` 🔧
- **`react-code-order`** - Added auto-fix for reordering code blocks in components/hooks
- **`variable-naming-convention`** - Added auto-fix for renaming variables to camelCase

### Fixed

- **`multiline-if-conditions`** - Fix indentation calculation for nested code
- **`classname-multiline`** - Fix template literal indentation for inline JSX attributes
- **`function-naming-convention`** - Skip React components (PascalCase + returns JSX)
- **`variable-naming-convention`** - Skip PascalCase arguments (component references)
- Add "poll" as recognized verb prefix in function-naming-convention

### Documentation

- Enhanced error messages with examples and helpful context
- Improved CHANGELOG with full details and Full Changelog links
- Added GitHub Releases guidelines to AGENTS.md

### Report-Only Rules (6)

- `absolute-imports-only` - Requires knowledge of project structure
- `index-exports-only` - Requires moving code to new files
- `jsx-prop-naming-convention` - Requires cross-file prop renaming
- `module-index-exports` - Requires file creation
- `no-inline-type-definitions` - Requires extracting types to new files
- `typescript-definition-location` - Requires moving code to folders

### Stats

- Total Rules: 64 (was 61)
- Auto-fixable: 58 rules 🔧
- Report-only: 6 rules

**Full Changelog:** [v1.3.1...v1.4.2](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.1...v1.4.2)

---

## [1.4.1] - 2026-01-30

### Documentation

- Add 🔧 label to indicate auto-fixable rules (57 of 64)
- 7 rules are report-only (require manual changes)
- Add legend explaining 🔧 (auto-fixable) and ⚙️ (customizable) labels
- Add new rules to Rules Categories table

---

## [1.4.0] - 2026-01-30

### Added

- New rule: `index-exports-only` - Prevent type/interface definitions in index files
- New rule: `ternary-condition-multiline` - Format complex ternary conditions
- New rule: `no-inline-type-definitions` - Extract inline union types to type files

### Enhanced

- `function-naming-convention` - Expanded verb list from ~50 to ~200+ verbs
- `function-object-destructure` - Added auto-fix for parameter dot notation

### Fixed

- `multiline-if-conditions` - Fix indentation calculation for nested code
- `classname-multiline` - Fix template literal indentation for inline attributes

### Stats

- Total Rules: 64 (was 61)

---

## [1.3.11] - 2026-01-30

### Enhanced

- Dependency-aware ordering: statements using variables must come after their declarations
- Auto-fix for module-level constants: moves camelCase constants inside component
- Auto-fix respects dependencies: initialResult declared before useRef(initialResult)
- SCREAMING_CASE constants allowed at module level

---

## [1.3.10] - 2026-01-30

### Fixed

- `function-naming-convention` - Skip React components (PascalCase + returns JSX)
- Prevents renaming components like Login to loginHandler

---

## [1.3.9] - 2026-01-29

### Enhanced

- `react-code-order` - Add auto-fix
- Auto-fix preserves control flow statements (if, for, while) in their relative positions

---

## [1.3.8] - 2026-01-29

### Fixed

- `variable-naming-convention` - Skip PascalCase arguments (handled by function-naming-convention)
- Avoids duplicate errors between the two rules
- Auto-fix correctly updates all references including arguments passed to functions

---

## [1.3.7] - 2026-01-29

### Enhanced

- `function-naming-convention` - Enforce camelCase for functions with verb prefixes (GetForStatus → getForStatus)
- Auto-fix converts PascalCase functions to camelCase and updates all references
- React components (PascalCase without verb prefix) still correctly skipped

---

## [1.3.6] - 2026-01-29

### Enhanced

- `function-naming-convention` - Add "poll" as recognized verb prefix
- Functions like pollForStatus, pollDataHandler are now valid

---

## [1.3.5] - 2026-01-28

### Enhanced

- Improved error messages with examples and helpful context for all rules
- Tailwind class order shows recommended order (layout → sizing → spacing → typography → colors → effects → states)
- className multiline shows threshold and format example
- Import/export format shows single-line example with threshold
- Object/array formatting shows format examples with thresholds
- Type/Interface/Enum naming shows suggested corrected name
- React code order shows full order sequence

---

## [1.3.4] - 2026-01-28

### Enhanced

- className rules - Smart detection for objects with Tailwind class values (e.g., variants object)
- Smart detection for return statements with Tailwind classes
- Applies to: classname-multiline, classname-no-extra-spaces, classname-order
- `variable-naming-convention` - Add auto-fix for SCREAMING_SNAKE_CASE and snake_case

---

## [1.3.3] - 2026-01-28

### Fixed

- `function-naming-convention` - Fix overlapping fixes error in auto-fix
- Track fixed ranges to prevent duplicate fixes on same node

---

## [1.3.2] - 2026-01-28

### Documentation

- Add Full Changelog links to all releases in CHANGELOG.md
- Enhance release 1.1.0 with full feature details
- Enhance release 1.0.14 with full feature details
- Add Full Changelog link instructions to AGENTS.md

---

## [1.3.1] - 2026-01-28

### Documentation

- Add CHANGELOG.md with full release history
- Add GitHub Releases guidelines to AGENTS.md

---

## [1.3.0] - 2026-01-28

**New Rules, Auto-Fix Enhancements & Agent Skills Integration**

**Version Range:** v1.2.1 → v1.3.0

### Added

**New Rules (2)**
- `classname-multiline` - Enforce multiline className formatting with string/template literal format 🔧
- `function-declaration-style` - Auto-fix function declarations to arrow expressions 🔧

**Agent Skills** - Added Agent Skills open standard support
- `test-rule` - Test an ESLint rule after creating or modifying it
- `validate-types` - Verify TypeScript definitions match rules in index.js
- `review-config` - Review recommended ESLint configurations
- `audit-docs` - Verify documentation accuracy across all files
- Compatible with Claude Code, Cursor, VS Code, GitHub Copilot, Gemini CLI, and more

**TypeScript Support**
- Added `index.d.ts` with full type definitions for IDE autocomplete
- All 61 rule names available as TypeScript literal types

### Enhanced

- **`variable-naming-convention`** - Enforce camelCase for all variables including constants
- **`function-object-destructure`** - Add auto-fix for arrow expression body callbacks
- **`simple-call-single-line`** - Extend to collapse callbacks with params, handle optional chaining
- **`function-naming-convention`** - Add auto-fix for missing Handler suffix
- **`absolute-imports-only`** - Allow relative imports in entry files (main.tsx/main.ts), add pages folder

### Fixed

- Remove space before `?.` when collapsing simple calls to single line
- Sync eslint configs and add `@stylistic/semi-style` rule

### Documentation

- Reorganized AGENTS.md and CLAUDE.md for better AI agent compatibility
- Added git workflow and versioning guidelines
- Updated requirements: Node.js 20+, TypeScript 5+, Tailwind CSS 4+

### Stats

- Total Rules: 61 (was 56)
- All rules are auto-fixable with `eslint --fix`

**Full Changelog:** [v1.2.1...v1.3.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.1...v1.3.0)

---

## [1.2.9] - 2026-01-28

### Documentation

- Reorganize AGENTS.md and CLAUDE.md content
- Add git workflow and versioning guidelines to AGENTS.md
- Add commit approval workflow to CLAUDE.md
- Require explicit approval for push and publish steps

---

## [1.2.8] - 2026-01-28

### Added

- New rule: `function-declaration-style` - Auto-fix function declarations to arrow expressions

### Enhanced

- `function-naming-convention` - Add auto-fix for missing Handler suffix
- `absolute-imports-only` - Allow relative imports in entry files (main.tsx/main.ts)
- `absolute-imports-only` - Add pages folder to default allowed folders
- `module-index-exports` - Add pages folder to default module and lazy load folders

### Documentation

- Update rule count to 61 across all docs
- Add function-declaration-style docs with func-style pairing note
- Change Tailwind CSS badge to >=3.0.0

### Stats

- Total Rules: 61

---

## [1.2.7] - 2026-01-27

- Minor fixes

---

## [1.2.6] - 2026-01-27

- Minor fixes

---

## [1.2.5] - 2026-01-27

### Documentation

- Update badges and requirements for Node.js 20, TypeScript 5, Tailwind CSS 4

---

## [1.2.4] - 2026-01-27

### Fixed

- Sync eslint configs and add semi-style rule
- Add missing `component-props-destructure` rule to react config and recommended react config
- Add @stylistic/semi-style rule to all configs to enforce semicolons at end of line

---

## [1.2.3] - 2026-01-27

### Fixed

- `simple-call-single-line` - Remove space before ?. when collapsing simple calls to single line

---

## [1.2.2] - 2026-01-27

### Enhanced

- `variable-naming-convention` - Enforce camelCase for all variables including constants (no more SCREAMING_SNAKE_CASE)
- `function-object-destructure` - Add auto-fix for arrow expression body callbacks
- `simple-call-single-line` - Extend to collapse callbacks with params and simple expression bodies, handle optional chaining

---

## [1.2.1] - 2026-01-27

### Added

- New rule: `classname-multiline` - Enforce multiline className formatting when class count > 3 or length > 80

### Enhanced

- JSX className with no expressions uses "..." string literal format
- JSX className with expressions uses {`...`} template literal format
- Variables/object properties use `...` template literal for multiline
- Updated `classname-no-extra-spaces` and `jsx-string-value-trim` to skip multiline format
- Upgraded test project to Tailwind CSS v4 with eslint-plugin-tailwindcss@beta

---

## [1.2.0] - 2026-01-25

**React Code Order & TypeScript Enhancement Rules**

**Version Range:** v1.1.10 → v1.2.0

### Added

**New Rules (5)**
- `component-props-destructure` - Enforce props destructuring in React components
- `component-props-inline-type` - Enforce inline type annotations for component props
- `function-object-destructure` - Enforce typed params with body destructuring
- `react-code-order` - Enforce consistent ordering of hooks and code blocks
- `type-annotation-spacing` - Enforce proper spacing in TypeScript type annotations

### Stats

- Total Rules: 56 (was 51)

**Full Changelog:** [v1.1.10...v1.2.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.10...v1.2.0)

---

## [1.1.10] - 2026-01-20

- Minor fixes

---

## [1.1.9] - 2026-01-20

### Changed

- Sync default folders between absolute-imports-only and module-index-exports (27 folders)
- Reorganize rules export object with alphabetically ordered categories

---

## [1.1.8] - 2026-01-20

### Added

- TypeScript rules test cases in src/interfaces/, src/enums/, src/types/

---

## [1.1.7] - 2026-01-20

### Changed

- Add TypeScript formatting rules to recommended and test configs:
  - enum-format, interface-format, type-format, typescript-definition-location

---

## [1.1.6] - 2026-01-20

### Added

- New rule: `type-format` - Enforce PascalCase with Type suffix, camelCase properties

---

## [1.1.5] - 2026-01-20

### Added

- New rule: `enum-format` - Enforce PascalCase with Enum suffix, UPPER_CASE members

---

## [1.1.4] - 2026-01-20

### Added

- New rule: `interface-format` - Enforce PascalCase with Interface suffix, camelCase properties

---

## [1.1.3] - 2026-01-20

### Added

- New rule: `typescript-definition-location` - Enforce TypeScript definitions in designated folders

---

## [1.1.2] - 2026-01-20

- Minor fixes

---

## [1.1.1] - 2026-01-20

- Minor fixes

---

## [1.1.0] - 2026-01-20

**TypeScript + Tailwind Support & Configurable Rules**

**Version Range:** v1.0.17 → v1.1.0

### Added

**New Configuration: React + TypeScript + Tailwind** (`react-ts-tw`)
- TypeScript parser and TypeScript ESLint plugin support
- Tailwind CSS plugin integration
- Perfectionist rules for sorting interfaces, enums, and object types
- Comprehensive test project with TypeScript components

**New Rule**
- `index-export-style` - Enforce consistent export formatting in index files

**Configurable Options**
- `array-items-per-line` - Added `maxItems` option (default: 3)
- `hook-deps-per-line` - Added `maxDeps` option (default: 2)
- `multiline-if-conditions` - Added `maxOperands` option (default: 3)
- `function-arguments-format` - New rule merging multiline argument rules with customizable options

**Documentation**
- Added AGENTS.md for AI coding agents

### Changed

- `export-format` and `import-format` - Made self-sufficient, added `maxSpecifiers` option
- `object-property-per-line` - Made self-sufficient, added `minProperties` option
- `module-index-exports` - Support TypeScript index files
- Migrated to `@stylistic/eslint-plugin` for formatting rules

### Stats

- Total Rules: 51 (was 45)
- All changes are backward compatible

**Full Changelog:** [v1.0.17...v1.1.0](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.17...v1.1.0)

---

## [1.0.41] - 2026-01-19

- Minor fixes

---

## [1.0.40] - 2026-01-19

- Minor fixes

---

## [1.0.39] - 2026-01-19

- Minor fixes

---

## [1.0.38] - 2026-01-19

- Minor fixes

---

## [1.0.37] - 2026-01-13

- Minor fixes

---

## [1.0.36] - 2026-01-13

- Minor fixes

---

## [1.0.35] - 2026-01-13

- Minor fixes

---

## [1.0.34] - 2026-01-13

- Minor fixes

---

## [1.0.33] - 2026-01-13

- Minor fixes

---

## [1.0.32] - 2026-01-13

- Minor fixes

---

## [1.0.31] - 2026-01-13

- Minor fixes

---

## [1.0.30] - 2026-01-13

- Minor fixes

---

## [1.0.29] - 2026-01-12

- Minor fixes

---

## [1.0.28] - 2026-01-12

### Changed

- **BREAKING:** Merge `multiline-argument-newline` and `multiple-arguments-per-line` into `function-arguments-format`
- Add customizable options: minArgs (default: 2), skipHooks (default: true), skipSingleArg (default: true)
- Remove @stylistic/function-call-argument-newline from recommended config

---

## [1.0.27] - 2026-01-12

### Enhanced

- `index-export-style` - Handle export padding for all files
- Non-index files require blank lines between exports
- Index files have no blank lines between exports

---

## [1.0.26] - 2026-01-12

### Documentation

- Clarify index-export-style and @stylistic relationship
- @stylistic handles general blank lines (return, variables, expressions)
- index-export-style handles blank line enforcement in index files

---

## [1.0.25] - 2026-01-12

### Enhanced

- `object-property-per-line` - Made self-sufficient
- Rule now handles complete multiline object formatting
- Remove dependency on @stylistic/object-curly-newline

---

## [1.0.24] - 2026-01-12

### Enhanced

- `export-format` and `import-format` - Made self-sufficient
- Both now handle collapse (≤ threshold) and expand (> threshold)
- Remove dependency on @stylistic/object-curly-newline for imports/exports

---

## [1.0.23] - 2026-01-12

### Changed

- Migrate to @stylistic/eslint-plugin for formatting rules
- Replace 24 deprecated ESLint formatting rules with @stylistic equivalents

---

## [1.0.22] - 2026-01-11

### Enhanced

- `multiline-if-conditions` - Add maxOperands configuration option (default: 3)

---

## [1.0.21] - 2026-01-11

### Enhanced

- `hook-deps-per-line` - Add maxDeps configuration option (default: 2)

---

## [1.0.20] - 2026-01-11

### Enhanced

- `array-items-per-line` - Add maxItems configuration option (default: 3)

---

## [1.0.19] - 2026-01-11

- Version bump

---

## [1.0.18] - 2026-01-11

### Enhanced

- `import-format` and `export-format` - Add maxSpecifiers option (default: 3)
- `object-property-per-line` - Add minProperties option (default: 2)
- Remove eslint-plugin-newline dependency (redundant with object-curly-newline)

---

## [1.0.17] - 2026-01-11

### Documentation

- Update rule count from 47 to 48 in all README files
- Add coverage, public, and .vite to eslint config ignores

---

## [1.0.16] - 2026-01-09

**New Rule: index-export-style**

**Version Range:** v1.0.15 → v1.0.16

### Added

**New Rule**
- `index-export-style` - Enforce consistent export style in index files 🔧
- Support two styles: 'shorthand' (default) and 'import-export'
- Shorthand: `export { a } from './file';`
- Import-export: `import { a } from './file'; export { a };`
- Auto-fixable with eslint --fix
- Detects and reports mixed export styles

### Stats

- Total Rules: 48 (was 47)

**Full Changelog:** [v1.0.15...v1.0.16](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.15...v1.0.16)

---

## [1.0.15] - 2026-01-09

### Added

- Additional perfectionist rules to recommended React config:
  - perfectionist/sort-array-includes
  - perfectionist/sort-maps
  - perfectionist/sort-sets
  - perfectionist/sort-switch-case
  - perfectionist/sort-variable-declarations

---

## [1.0.14] - 2026-01-06

**Customizable Rules, Recommended Configs & Documentation Overhaul**

**Version Range:** v1.0.8 → v1.0.14

### Added

**Customizable Folder Options**
- `absolute-imports-only` - Add extraAllowedFolders, extraReduxSubfolders, extraDeepImportFolders options
- `module-index-exports` - Add extraModuleFolders, extraLazyLoadFolders, extraIgnorePatterns options
- Users can now extend default folder lists without replacing them

**Recommended ESLint Configurations**
- Add recommended-configs/react/ folder with model eslint.config.js
- Include comprehensive README with installation and plugin documentation

**Comprehensive Documentation**
- Add comprehensive examples for all 47 rules in README
- Enhance README with emojis, rules summary table, and introduction section

### Changed

- Standardized all internal helper function names with `Handler` suffix

### Documentation

- Add comprehensive block comments to all ESLint rules with good/bad examples

### Stats

- Total Rules: 47

**Full Changelog:** [v1.0.8...v1.0.14](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.8...v1.0.14)

---

## [1.0.13] - 2026-01-06

### Added

- Recommended ESLint configurations for React projects
- recommended-configs/react/ folder with model eslint.config.js

---

## [1.0.12] - 2026-01-06

### Documentation

- Enhance README with emojis, rules summary table, and introduction section

---

## [1.0.11] - 2026-01-06

### Documentation

- Add comprehensive examples for all 47 rules in README

---

## [1.0.10] - 2026-01-06

### Documentation

- Update README file and TypeScript rules types

---

## [1.0.9] - 2026-01-06

### Changed

- Standardize internal helper function names with Handler suffix
- All check*, is*, get*, has* functions renamed

---

## [1.0.8] - 2026-01-06

### Documentation

- Add comprehensive block comments to all ESLint rules
- Each rule has title, description, and good/bad code examples

---

## [1.0.7] - 2026-01-06

**TypeScript Type Definitions for IDE Support**

**Version Range:** v1.0.6 → v1.0.7

### Added

**TypeScript Support**
- Add TypeScript type definitions for IDE support (index.d.ts)
- Export all 47 rule names as literal types for autocomplete
- Add PluginRules interface mapping rules to Rule.RuleModule
- Include module augmentation for ESLint's Linter.RulesRecord

### Stats

- Total Rules: 47

**Full Changelog:** [v1.0.6...v1.0.7](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.6...v1.0.7)

---

## [1.0.6] - 2026-01-06

**Initial Public Release**

### Added

- 45+ auto-fixable ESLint rules for React/JSX projects
- Full support for ESLint v9+ flat config
- Zero dependencies (except peer dependency on ESLint)

### Requirements

- ESLint >= 9.0.0
- Node.js >= 20.0.0

### Stats

- Total Rules: 45+

**Full Changelog:** [v1.0.6](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/releases/tag/v1.0.6)

---

## [1.0.5] - 2026-01-06

- Pre-release version

---

## [1.0.4] - 2026-01-06

- Pre-release version

---

## [1.0.3] - 2026-01-06

- Pre-release version

---

## [1.0.2] - 2026-01-06

- Pre-release version

---

[2.0.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.20.0...v2.0.0
[1.20.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.19.0...v1.20.0
[1.19.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.18.0...v1.19.0
[1.18.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.17.2...v1.18.0
[1.17.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.17.1...v1.17.2
[1.17.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.17.0...v1.17.1
[1.17.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.16.0...v1.17.0
[1.16.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.15.0...v1.16.0
[1.15.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.14.4...v1.15.0
[1.14.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.14.3...v1.14.4
[1.14.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.14.2...v1.14.3
[1.14.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.14.1...v1.14.2
[1.14.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.14.0...v1.14.1
[1.14.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.13.0...v1.14.0
[1.13.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.12.1...v1.13.0
[1.12.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.12.0...v1.12.1
[1.12.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.9...v1.12.0
[1.11.9]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.8...v1.11.9
[1.11.8]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.7...v1.11.8
[1.11.7]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.6...v1.11.7
[1.11.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.5...v1.11.6
[1.11.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.4...v1.11.5
[1.11.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.3...v1.11.4
[1.11.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.2...v1.11.3
[1.11.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.1...v1.11.2
[1.11.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.0...v1.11.1
[1.11.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.10.3...v1.11.0
[1.10.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.10.2...v1.10.3
[1.10.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.10.1...v1.10.2
[1.10.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.10.0...v1.10.1
[1.10.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.7...v1.10.0
[1.9.7]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.6...v1.9.7
[1.9.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.5...v1.9.6
[1.9.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.4...v1.9.5
[1.9.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.3...v1.9.4
[1.9.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.2...v1.9.3
[1.9.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.8.4...v1.9.0
[1.8.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.8.3...v1.8.4
[1.8.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.8.2...v1.8.3
[1.8.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.8.1...v1.8.2
[1.8.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.6...v1.8.0
[1.7.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.5...v1.7.6
[1.7.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.4...v1.7.5
[1.7.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.3...v1.7.4
[1.7.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.2...v1.7.3
[1.7.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.6...v1.7.0
[1.6.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.5...v1.6.6
[1.6.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.4...v1.6.5
[1.6.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.3...v1.6.4
[1.6.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.5...v1.5.0
[1.4.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.3...v1.4.5
[1.4.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.2...v1.4.3
[1.4.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.11...v1.4.0
[1.3.11]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.10...v1.3.11
[1.3.10]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.9...v1.3.10
[1.3.9]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.8...v1.3.9
[1.3.8]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.7...v1.3.8
[1.3.7]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.6...v1.3.7
[1.3.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.5...v1.3.6
[1.3.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.4...v1.3.5
[1.3.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.9...v1.3.0
[1.2.9]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.8...v1.2.9
[1.2.8]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.10...v1.2.0
[1.1.10]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.9...v1.1.10
[1.1.9]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.8...v1.1.9
[1.1.8]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.7...v1.1.8
[1.1.7]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.6...v1.1.7
[1.1.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.5...v1.1.6
[1.1.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.41...v1.1.0
[1.0.41]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.40...v1.0.41
[1.0.40]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.39...v1.0.40
[1.0.39]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.38...v1.0.39
[1.0.38]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.37...v1.0.38
[1.0.37]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.36...v1.0.37
[1.0.36]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.35...v1.0.36
[1.0.35]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.34...v1.0.35
[1.0.34]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.33...v1.0.34
[1.0.33]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.32...v1.0.33
[1.0.32]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.31...v1.0.32
[1.0.31]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.30...v1.0.31
[1.0.30]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.29...v1.0.30
[1.0.29]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.28...v1.0.29
[1.0.28]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.27...v1.0.28
[1.0.27]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.26...v1.0.27
[1.0.26]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.25...v1.0.26
[1.0.25]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.24...v1.0.25
[1.0.24]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.23...v1.0.24
[1.0.23]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.22...v1.0.23
[1.0.22]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.21...v1.0.22
[1.0.21]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.20...v1.0.21
[1.0.20]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.19...v1.0.20
[1.0.19]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.18...v1.0.19
[1.0.18]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.17...v1.0.18
[1.0.17]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.16...v1.0.17
[1.0.16]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.15...v1.0.16
[1.0.15]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.14...v1.0.15
[1.0.14]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.13...v1.0.14
[1.0.13]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.12...v1.0.13
[1.0.12]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.9...v1.0.10
[1.0.9]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/releases/tag/v1.0.2
