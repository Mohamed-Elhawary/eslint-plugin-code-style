# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
