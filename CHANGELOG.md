# Changelog

All notable releases of this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/) principles.

---

## [1.5.0] - 2026-01-30

**Release Title:** New if-else-spacing Rule & Enhanced Arrow/Class Method Support

**Version Range:** v1.4.3 → v1.5.0

### Added

- **New Rule: `if-else-spacing`** - Enforces proper spacing between if statements:
  - Requires empty line between consecutive if statements with block bodies
  - Prevents empty lines between single-line if and else

### Enhanced

- **`function-naming-convention`** - Now checks class methods for Handler suffix (skips constructors, getters, setters, and React lifecycle methods)
- **`arrow-function-simplify`** - Extended to handle ALL arrow functions with single return (not just JSX attributes): `() => { return x }` becomes `() => x`

### Fixed

- **Circular fix conflict** between `opening-brackets-same-line` and `function-arguments-format` for multi-argument arrow function calls (e.g., axios interceptors)

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.3...v1.5.0

---

## [1.4.2] - 2026-01-30

**Release Title:** New Rules, Enhanced Auto-Fix & Comprehensive Documentation

**Version Range:** v1.3.1 → v1.4.2

### Added

- **New Rules (3)**
  - `index-exports-only` - Prevent type/interface definitions in index files (move to types file)
  - `ternary-condition-multiline` - Format complex ternary conditions with each operand on its own line 🔧 ⚙️
  - `no-inline-type-definitions` - Extract inline union types to named types in type files ⚙️

- **Auto-Fix Labels in Documentation**
  - Added 🔧 label to indicate auto-fixable rules
  - Added legend explaining 🔧 (auto-fixable) and ⚙️ (customizable) labels
  - Clear distinction: 58 auto-fixable rules, 6 report-only rules

### Enhanced

- **function-naming-convention** - Expanded verb list from ~50 to ~200+ verbs organized by category (CRUD, validation, transformation, UI, lifecycle, network, etc.)
- **function-object-destructure** - Added auto-fix: inserts destructuring at function body top and replaces `param.prop` with `prop`
- **component-props-destructure** - Added auto-fix: converts `(props)` to `({ prop1, prop2 })` and replaces `props.x` with `x` 🔧
- **react-code-order** - Added auto-fix for reordering code blocks in components/hooks
- **variable-naming-convention** - Added auto-fix for renaming variables to camelCase

### Fixed

- **multiline-if-conditions** - Fix indentation calculation for nested code (use actual line indentation)
- **classname-multiline** - Fix template literal indentation for inline JSX attributes
- **function-naming-convention** - Skip React components (PascalCase + returns JSX)
- **variable-naming-convention** - Skip PascalCase arguments (component references)
- Add "poll" as recognized verb prefix in function-naming-convention

### Documentation

- Enhanced error messages with examples and helpful context
- Improved CHANGELOG with full details and Full Changelog links
- Added GitHub Releases guidelines to AGENTS.md

### Report-Only Rules (6)

These rules cannot be auto-fixed because they require file creation, movement, or cross-file changes:
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

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.1...v1.4.2

---

## [1.3.0] - 2026-01-28

**Release Title:** New Rules, Auto-Fix Enhancements & Agent Skills Integration

**Version Range:** v1.2.1 → v1.3.0

### Added

- **New Rules (2)**
  - `classname-multiline` - Enforce multiline className formatting with string/template literal format
  - `function-declaration-style` - Auto-fix function declarations to arrow expressions

- **Agent Skills** - Added [Agent Skills](https://agentskills.io) open standard support
  - `test-rule` - Test an ESLint rule after creating or modifying it
  - `validate-types` - Verify TypeScript definitions match rules in index.js
  - `review-config` - Review recommended ESLint configurations
  - `audit-docs` - Verify documentation accuracy across all files
  - Compatible with Claude Code, Cursor, VS Code, GitHub Copilot, Gemini CLI, and more

- **TypeScript Support**
  - Added `index.d.ts` with full type definitions for IDE autocomplete
  - All 61 rule names available as TypeScript literal types

### Enhanced

- `variable-naming-convention` - Enforce camelCase for all variables including constants
- `function-object-destructure` - Add auto-fix for arrow expression body callbacks
- `simple-call-single-line` - Extend to collapse callbacks with params, handle optional chaining
- `function-naming-convention` - Add auto-fix for missing Handler suffix
- `absolute-imports-only` - Allow relative imports in entry files (main.tsx/main.ts), add pages folder

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

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.2.1...v1.3.0

---

## [1.2.0] - 2025-01-25

**Release Title:** React Code Order & TypeScript Enhancement Rules

**Version Range:** v1.1.10 → v1.2.0

### Added

- **New Rules (5)**
  - `component-props-destructure` - Enforce props destructuring in React components
  - `component-props-inline-type` - Enforce inline type annotations for component props
  - `function-object-destructure` - Enforce typed params with body destructuring for non-component functions
  - `react-code-order` - Enforce consistent ordering of hooks and code blocks in components/hooks
  - `type-annotation-spacing` - Enforce proper spacing in TypeScript type annotations

### React Code Order (15 Categories)

The `react-code-order` rule enforces a logical dependency chain:

1. Props destructure (parameter level)
2. Props destructure in body
3. `useRef`
4. `useState`
5. `useReducer`
6. Redux hooks
7. Router hooks
8. Context hooks
9. Custom hooks
10. Derived state
11. `useMemo`
12. `useCallback`
13. Handlers
14. `useEffect`
15. Return statement

### TypeScript Improvements

- `type-annotation-spacing` - No space before colon/generic/array brackets, one space after colon
- Better support for inline type literals in component props

### Stats

- Total Rules: 56 (was 51)
- All rules are auto-fixable with `eslint --fix`

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.10...v1.2.0

---

## [1.1.0] - 2025-01-19

**Release Title:** TypeScript + Tailwind Support & Configurable Rules

**Version Range:** v1.0.17 → v1.1.0

### Added

- **New Configuration: React + TypeScript + Tailwind**
  - `react-ts-tw` - Recommended ESLint config for TS + Tailwind projects (`recommended-configs/react-ts-tw/`)
  - Includes TypeScript parser, TypeScript ESLint plugin, and Tailwind CSS plugin
  - Perfectionist rules for sorting interfaces, enums, and object types
  - Full documentation with installation instructions

- **New Rule**
  - `index-export-style` - Enforce consistent export formatting in index files (shorthand vs import-export style)

- **Configurable Rules**
  - `array-items-per-line` - Added `maxItems` option (default: 3)
  - `hook-deps-per-line` - Added `maxDeps` option (default: 2)
  - `multiline-if-conditions` - Added `maxOperands` option (default: 3)
  - `function-arguments-format` - New rule merging `multiline-argument-newline` and `multiple-arguments-per-line`

- **Documentation**
  - Added `AGENTS.md` for AI coding agents (Claude Code, Cursor, etc.)
  - Added React test application for validating plugin rules
  - Migration guide to `@stylistic/eslint-plugin` for deprecated formatting rules

### Changed

- **Self-Sufficient Rules**
  - `export-format` and `import-format` now handle all formatting independently
  - `object-property-per-line` now handles all object formatting independently

- **TypeScript Support**
  - `module-index-exports` rule now recognizes `index.ts` and `index.tsx` files
  - Added TypeScript test file patterns (`*.test.ts`, `*.spec.ts`, etc.) to ignore list

### Fixed

- `object-property-per-line` - Fixed handling of multi-line template literals and spread elements
- `jsx-ternary-format` - Fixed handling of return statements and broken conditions
- `comment-spacing` - Renamed to `comment-format` to better reflect functionality
- Fixed rule count sync between README and index.d.ts

### Stats

- Total Rules: 51 (was 48)
- All changes are backward compatible
- All rules are auto-fixable with `eslint --fix`

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.17...v1.1.0

---

## [1.0.16] - 2025-01-11

**Release Title:** New Rule: index-export-style

**Version Range:** v1.0.15 → v1.0.16

### Added

- **New Rule**
  - `index-export-style` - Enforce consistent export patterns in index files with shorthand or import-export styles

### Changed

- Added index file overrides to prevent conflicts with other formatting rules

### Stats

- Total Rules: 48 (was 47)
- All rules are auto-fixable with `eslint --fix`

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.15...v1.0.16

---

## [1.0.14] - 2025-01-06

**Release Title:** Customizable Rules, Recommended Configs & Documentation Overhaul

**Version Range:** v1.0.8 → v1.0.14

### Added

- **Customizable Folder Options**
  - `absolute-imports-only` - Added `extraAllowedFolders` and `extraDeepImportFolders` options
  - `module-index-exports` - Added `extraModuleFolders`, `extraLazyLoadFolders`, and `extraIgnorePatterns` options

- **Recommended ESLint Configurations**
  - Added `recommended-configs/react/` folder with battle-tested ESLint flat config
  - Includes comprehensive setup with 9 third-party plugins + all 47 code-style rules
  - Complete documentation with installation commands and plugin explanations

- **Documentation**
  - Comprehensive README rewrite with examples for all 47 rules
  - Rules Summary table with descriptions for quick reference
  - "Why This Plugin?" section explaining the unique value proposition
  - Block comments added to all rules in source code with Good/Bad examples
  - Emojis added to all major section titles for better visual hierarchy

### Changed

- **Internal Refactoring**
  - Standardized all internal helper function names with `Handler` suffix
  - Ensures codebase follows the same conventions enforced by the plugin
  - Made plugin version and name dynamic (reads from package.json)

### Fixed

- Fixed rule naming: `singleArgumentOneLine` → `singleArgumentOnOneLine`
- Removed orphaned/duplicate block comments

### Stats

- Total Rules: 47
- All rules are auto-fixable with `eslint --fix`

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.8...v1.0.14

---

## [1.0.7] - 2025-01-06

**Release Title:** TypeScript Type Definitions for IDE Support

**Version Range:** v1.0.6 → v1.0.7

### Added

- **TypeScript Support**
  - `index.d.ts` with comprehensive type definitions
  - IDE autocomplete and IntelliSense support
  - Module augmentation for ESLint's configuration types

### Stats

- Total Rules: 47
- All rules are auto-fixable with `eslint --fix`

**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.0.6...v1.0.7

---

## [1.0.6] - 2025-01-06

**Release Title:** Initial Public Release

**Version Range:** First Release

### Added

- **Initial Release**
  - 45+ auto-fixable ESLint rules for React/JSX projects
  - Full support for ESLint v9+ flat config
  - Zero dependencies

### Requirements

- ESLint >= 9.0.0
- Node.js >= 20.0.0

### Stats

- Total Rules: 45+
- All rules are auto-fixable with `eslint --fix`
