# Changelog

All notable releases of this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/) principles.

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

---

## [1.1.0] - 2025-01-19

**Release Title:** TypeScript + Tailwind Support & Configurable Rules

**Version Range:** v1.0.16 → v1.1.0

### Added

- **New Configuration**
  - `react-ts-tw` - Recommended ESLint configuration for React + TypeScript + Tailwind projects

- **New Rule**
  - `index-export-style` - Enforce consistent export patterns in index files

### Enhanced

- `array-items-per-line` - Added configurable `maxItems` threshold
- `hook-deps-per-line` - Added configurable options
- `multiline-if-conditions` - Added configurable options
- Enhanced TypeScript support across all rules

### Stats

- Total Rules: 51 (was 48)
- All changes are backward compatible
- All rules are auto-fixable with `eslint --fix`

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

---

## [1.0.14] - 2025-01-06

**Release Title:** Customizable Rules, Recommended Configs & Documentation Overhaul

**Version Range:** v1.0.8 → v1.0.14

### Added

- **Recommended Configurations**
  - `react` - Ready-to-use ESLint configuration for React projects
  - Includes nine third-party plugins pre-configured

### Enhanced

- `absolute-imports-only` - Added customizable folder options
- `module-index-exports` - Added customizable folder options

### Documentation

- Comprehensive documentation rewrite
- Added examples for all 47 rules
- Visual improvements and better organization

### Stats

- Total Rules: 47
- All rules are auto-fixable with `eslint --fix`

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
