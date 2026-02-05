# AGENTS.md

Instructions for AI coding agents working with this codebase.

## Project Overview

**eslint-plugin-code-style** is an ESLint plugin providing 76 custom formatting rules (67 auto-fixable, 17 configurable, 9 report-only) for React/JSX projects. It's designed for ESLint v9+ flat config system.

- **Main entry:** `index.js` - Contains all 76 rules in a single file
- **Type definitions:** `index.d.ts` - TypeScript declarations for IDE support
- **Recommended configs:** `recommended-configs/` - Ready-to-use ESLint configurations
- **Test apps:** `_tests_/` - Sample apps for testing rules

### Available Configurations

| Config | Recommended Folder | Test Folder | Status |
|--------|-------------------|-------------|--------|
| React (JS) | `recommended-configs/react/` | `_tests_/react/` | Available |
| React + TS + Tailwind | `recommended-configs/react-ts-tw/` | `_tests_/react-ts-tw/` | Available |
| React + TypeScript | - | - | Coming Soon |
| React + Tailwind | - | - | Coming Soon |

### Test Projects & Rule Compatibility

**IMPORTANT:** When adding/editing rules, they must be tested in ALL applicable test projects.

Each test project in `_tests_/` corresponds to a specific tech stack. Rules should ONLY be added to projects that support them:

| Rule Category | `react/` (JS only) | `react-ts-tw/` (TS + Tailwind) | Future: `react-ts/` | Future: `react-tw/` |
|---------------|:------------------:|:------------------------------:|:-------------------:|:-------------------:|
| **General rules** (arrays, functions, etc.) | ✅ | ✅ | ✅ | ✅ |
| **JSX/React rules** | ✅ | ✅ | ✅ | ✅ |
| **TypeScript rules** | ❌ | ✅ | ✅ | ❌ |
| **Tailwind rules** | ❌ | ✅ | ❌ | ✅ |

**TypeScript-only rules** (68 rules in JS projects, 76 in TS projects):
- `component-props-inline-type`
- `enum-format`
- `interface-format`
- `no-inline-type-definitions`
- `prop-naming-convention`
- `type-annotation-spacing`
- `type-format`
- `typescript-definition-location`

**Tailwind-related rules** (work in all projects but most useful with Tailwind):
- `classname-dynamic-at-end` - Enforce dynamic expressions at end of className
- `classname-multiline` - Format long className strings with one class per line
- `classname-no-extra-spaces` - Remove extra/leading/trailing spaces in className
- `classname-order` - Enforce Tailwind CSS class ordering in variables, object properties, and return statements

> **Note:** `classname-order` complements the official `tailwindcss/classnames-order` plugin:
> - **`tailwindcss/classnames-order`** - Handles JSX `className` attributes directly
> - **`classname-order`** - Handles class strings in variables, object properties, and return statements (areas the Tailwind plugin doesn't cover)
>
> Both rules should be enabled together for complete Tailwind class ordering coverage.

**When adding a new test project:**
1. Create folder: `_tests_/<project-name>/`
2. Copy structure from similar existing project
3. Create `eslint.config.js` with appropriate rules for that stack
4. Add ALL applicable rules (skip rules for unsupported tech)
5. Update this table in AGENTS.md
6. Update "Available Configurations" table above

## Build & Test Commands

```bash
# No build step required - plain JavaScript ES modules

# Test rules against a test app (e.g., react, react-ts, react-ts-tw)
cd _tests_/<config-name>
npm install
npm run lint        # Check for errors
npm run lint:fix    # Auto-fix issues

# Publish (from root folder only)
npm publish
```

## Code Structure

All rules are defined in `index.js` with this structure:

```
index.js
├── imports (fs, path, url)
├── Rule 1 definition (const ruleName = { create(), meta: {} })
├── Rule 2 definition
├── ... (76 rules total)
└── export default { meta: {}, rules: {} }
```

## Rule Implementation Pattern

Every rule follows this exact structure:

```javascript
/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Rule Name Here
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Brief description of what the rule does.
 *
 * Options:
 *   { optionName: defaultValue } - Description of option
 *
 * ✓ Good:
 *   // Example of correct code
 *
 * ✗ Bad:
 *   // Example of incorrect code
 */
const ruleName = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const optionName = options.optionName !== undefined ? options.optionName : defaultValue;

        return {
            NodeType(node) {
                // Rule logic here

                // Report issues with auto-fix
                context.report({
                    fix: (fixer) => fixer.replaceText(node, "fixed code"),
                    message: "Error message describing the issue",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Short description for documentation" },
        fixable: "code",  // Required for auto-fix rules
        schema: [
            {
                additionalProperties: false,
                properties: {
                    optionName: {
                        default: 3,
                        description: "Option description",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",  // "layout" for formatting, "suggestion" for conventions
    },
};
```

### Adding a New Rule — Complete Checklist

**IMPORTANT:** Adding a new rule requires a **MINOR version bump** (e.g., 1.5.0 → 1.6.0).

When creating a new rule, ALL of the following files must be updated:

#### 1. `index.js` — Rule Implementation

- [ ] Add JSDoc comment block with the standard format:
  ```javascript
  /**
   * ───────────────────────────────────────────────────────────────
   * Rule: Rule Name Here
   * ───────────────────────────────────────────────────────────────
   *
   * Description:
   *   Brief description of what the rule does.
   *
   * ✓ Good:
   *   // Example of correct code
   *
   * ✗ Bad:
   *   // Example of incorrect code
   */
  ```
- [ ] Add `const ruleName = { create(), meta: {} }` definition
- [ ] Include `fixable: "code"` or `fixable: "whitespace"` in meta if auto-fixable
- [ ] Add to `rules` object in default export (keep **alphabetical order**)

#### 2. `index.d.ts` — TypeScript Types

- [ ] Add rule name to `RuleNames` type union (**alphabetically sorted**):
  ```typescript
  | "code-style/new-rule-name"
  ```
- [ ] Add rule to `PluginRules` interface (**alphabetically sorted**):
  ```typescript
  "new-rule-name": Rule.RuleModule;
  ```

#### 3. `README.md` — Main Documentation

> ⚠️ **IMPORTANT:** README.md has **four separate sections** that mention rules. When adding or editing a rule, you must update ALL relevant sections:
> - **Rule counts** (6 locations) — must match actual rule count
> - **Quick Start example** (~line 184) — alphabetically sorted configuration example
> - **Rules Summary table** — brief description with emoji indicators
> - **Detailed documentation** — full examples, options, and explanations
>
> Missing any section will leave documentation inconsistent. Use the `audit-docs` skill to verify all sections are in sync.

**a) Update rule counts** (see [Rule Count Locations](#rule-count-locations) for all positions):
- [ ] Line ~22: `*XX rules (YY auto-fixable)*`
- [ ] Line ~30: `**XX custom rules** (YY auto-fixable)`
- [ ] Line ~39: `YY of XX rules support auto-fix`
- [ ] Line ~100: `**YY rules** support automatic fixing`
- [ ] Line ~254: `**XX rules total** — YY with auto-fix`
- [ ] Line ~3037: `YY of XX rules support auto-fixing`

**b) Add rule to Quick Start example** (~line 184, alphabetically sorted):
```javascript
"code-style/new-rule-name": "error",
```

**c) Add rule to Rules Summary table** (find the appropriate category):
```markdown
| `new-rule-name` | Brief description of what it does 🔧 |
```
- Add 🔧 emoji if auto-fixable
- Add ⚙️ emoji if has configurable options

**d) Add detailed rule documentation section** (in appropriate category section):
```markdown
### `new-rule-name`

**What it does:** One-line description of the rule's purpose.

**Why use it:** Context for why this rule is helpful (optional).

\`\`\`javascript
// ✅ Good — description of correct pattern
const example = "correct code";

// ✅ Good — another correct example
const another = "also correct";

// ❌ Bad — description of incorrect pattern
const example = "incorrect code";

// ❌ Bad — another incorrect example
const wrong = "also wrong";
\`\`\`

**Options:** (only if rule has options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `optionName` | `string` | `"value"` | What the option does |

\`\`\`javascript
// Configuration example
"code-style/new-rule-name": ["error", { optionName: "value" }]
\`\`\`

---
```

#### 4. `AGENTS.md` — Agent Instructions

- [ ] Update rule counts in [Rule Count Locations](#rule-count-locations) section (Current Counts table)
- [ ] Update all rule count references (see table in Rule Count Locations)
- [ ] Add rule to its category in [Rule Categories](#rule-categories) section

#### 5. Config Files — Add Rule to Configs

Add the rule (**alphabetically sorted**) to ALL config files:

- [ ] `recommended-configs/react-ts-tw/eslint.config.js`
- [ ] `recommended-configs/react/eslint.config.js` (skip if TypeScript-only rule)
- [ ] `_tests_/react-ts-tw/eslint.config.js`
- [ ] `_tests_/react/eslint.config.js` (skip if TypeScript-only rule)

**TypeScript-only rules** (only add to `-ts-tw` configs):
- `component-props-inline-type`, `enum-format`, `interface-format`
- `no-inline-type-definitions`, `type-annotation-spacing`, `type-format`
- `typescript-definition-location`

#### 6. Config READMEs — Update Rule Counts

- [ ] `recommended-configs/react-ts-tw/README.md` (~line 396)
- [ ] `recommended-configs/react/README.md` (~line 286)

#### 7. Version & Tag

- [ ] Update `package.json` version (MINOR bump: x.Y.0)
- [ ] Commit with message: `feat: add rule-name rule`
- [ ] Create tag: `git tag vX.Y.0`

#### 8. Testing the Rule

**IMPORTANT:** Every new rule MUST be tested before committing.

**a) Add examples to existing test project code:**

The test projects (`_tests_/react/`, `_tests_/react-ts-tw/`, etc.) contain real code (components, hooks, utils, etc.) that should naturally exercise all rules. When adding a new rule:

- Add code examples to **existing files** in the test project that are relevant to the rule
- For example: if adding an array rule, add array code to existing component files
- The test project code should cover ALL rules through its natural structure

```
_tests_/react-ts-tw/src/
├── app.tsx              # Main app - exercises component rules
├── components/          # Components - exercises JSX, props rules
│   ├── button.tsx
│   └── card.tsx
├── hooks/               # Hooks - exercises hook rules
├── utils/               # Utils - exercises function rules
├── interfaces/          # Interfaces - exercises TS rules
└── types/               # Types - exercises type rules
```

**b) Create temporary test file for quick verification:**

For quick testing during development, create a temporary test file:

```bash
# Create temp test file
_tests_/react-ts-tw/src/test-rule-name.tsx
```

```javascript
// Temporary test file: test-rule-name.tsx

// Test case 1: Should trigger error (BAD code)
const badExample = /* code that violates the rule */;

// Test case 2: Should NOT trigger error (GOOD code)
const goodExample = /* code that follows the rule */;
```

**c) Run the linter to verify:**

```bash
cd _tests_/react-ts-tw

# Check errors are reported for bad code
npx eslint src/test-rule-name.tsx

# Verify auto-fix works (if rule is fixable)
npx eslint src/test-rule-name.tsx --fix
cat src/test-rule-name.tsx  # Verify fixed code is correct

# Also run on entire project to ensure no regressions
npx eslint src/
```

**d) Clean up temporary test file:**

```bash
rm _tests_/react-ts-tw/src/test-rule-name.tsx
rm _tests_/react/src/test-rule-name.jsx  # if created
```

**e) Ensure test project code covers the new rule:**

After temporary testing, make sure the actual test project code (components, hooks, etc.) includes examples that exercise the new rule. This provides ongoing regression testing.

#### 9. Verification

Run these commands to verify all rules are in sync:

```bash
# Count rules in each location
grep -c "^const [a-zA-Z]* = {$" index.js
grep -c 'code-style/' index.d.ts
grep -c '"code-style/' recommended-configs/react-ts-tw/eslint.config.js

# Find rules missing from README
grep -oE '"[a-z-]+":' index.js | tr -d '":' | sort > /tmp/a.txt
grep -oE '\`[a-z-]+\`' README.md | tr -d '\`' | sort | uniq > /tmp/b.txt
comm -23 /tmp/a.txt /tmp/b.txt
```

---

### Removing a Rule — Complete Checklist

**IMPORTANT:** Removing a rule is a **BREAKING CHANGE** requiring a **MAJOR version bump** (e.g., 1.6.0 → 2.0.0).

#### 1. `index.js`
- [ ] Remove the rule's JSDoc comment block
- [ ] Remove the `const ruleName = { ... }` definition
- [ ] Remove from `rules` object in default export

#### 2. `index.d.ts`
- [ ] Remove from `RuleNames` type union
- [ ] Remove from `PluginRules` interface

#### 3. `README.md` (all four sections)
- [ ] Update all rule counts (see [Rule Count Locations](#rule-count-locations))
- [ ] Remove from `rules: {}` example in Quick Start
- [ ] Remove from Rules Summary table
- [ ] Remove detailed documentation section

#### 4. `AGENTS.md`
- [ ] Update all rule counts
- [ ] Remove from Rule Categories section

#### 5. Config Files
- [ ] Remove from `recommended-configs/react-ts-tw/eslint.config.js`
- [ ] Remove from `recommended-configs/react/eslint.config.js`
- [ ] Remove from `_tests_/react-ts-tw/eslint.config.js`
- [ ] Remove from `_tests_/react/eslint.config.js`

#### 6. Config READMEs
- [ ] Update `recommended-configs/react-ts-tw/README.md`
- [ ] Update `recommended-configs/react/README.md`

#### 7. Version & Tag
- [ ] Update `package.json` version (MAJOR bump: X.0.0)
- [ ] Commit with message: `feat!: remove rule-name rule` (note the `!` for breaking change)
- [ ] Create tag: `git tag vX.0.0`

---

### Editing an Existing Rule — Checklist

When modifying an existing rule, check if these need updates:

> ⚠️ **README.md Reminder:** If the rule's behavior, examples, or options change, remember that README.md has multiple sections to update (Quick Start example, Rules Summary table, detailed documentation). See the note in "Adding a New Rule" section for details.

#### If fixing a bug (PATCH version: x.x.+1):
- [ ] Fix the issue in rule's `create()` function in `index.js`
- [ ] Test in `_tests_/` apps with `npm run lint` and `npm run lint:fix`
- [ ] Commit: `fix: description of what was fixed in rule-name`

#### If changing rule behavior (PATCH or MINOR depending on scope):
- [ ] Update rule logic in `index.js`
- [ ] Update JSDoc in `index.js` (Good/Bad examples if they changed)
- [ ] Update `README.md` rule documentation section:
  - Update "What it does" if behavior changed
  - Update code examples (✅ Good / ❌ Bad) to reflect new behavior
- [ ] Test in `_tests_/` apps with `npm run lint` and `npm run lint:fix`

#### If adding new options (MINOR version: x.+1.0):
- [ ] Add option to `schema` in rule's `meta` object in `index.js`
- [ ] Add option handling in `create()` function with default value:
  ```javascript
  const options = context.options[0] || {};
  const newOption = options.newOption !== undefined ? options.newOption : defaultValue;
  ```
- [ ] Update JSDoc Options section in `index.js`
- [ ] Update README.md rule documentation:
  - Add row to Options table
  - Add configuration example showing the new option

#### If adding auto-fix to rule that didn't have it (MINOR version: x.+1.0):
- [ ] Add `fixable: "code"` or `fixable: "whitespace"` to rule's `meta` object
- [ ] Add `fix()` function in `context.report()`:
  ```javascript
  context.report({
      fix: (fixer) => fixer.replaceText(node, "fixed code"),
      message: "Error message",
      node,
  });
  ```
- [ ] Update README.md Rules Summary table: add 🔧 emoji
- [ ] Update rule counts: increment auto-fixable count, decrement report-only count
- [ ] Test auto-fix with `npm run lint:fix`

#### If changing default values (MAJOR version: +1.0.0 — breaking change):
- [ ] Update default value in `create()` function
- [ ] Update JSDoc in `index.js`
- [ ] Update README.md options table (Default column)
- [ ] Commit with `!`: `feat!: change default value for rule-name option`

#### Testing After Any Edit

**IMPORTANT:** Always test rule changes before committing.

1. **Create a temporary test file** for quick verification:
   ```bash
   # Create in appropriate project(s)
   _tests_/react-ts-tw/src/test-rule-name.tsx   # For TS rules
   _tests_/react/src/test-rule-name.jsx         # For general rules (test in both)
   ```

2. **Add test cases:**
   ```javascript
   // Temporary test file

   // Should trigger the rule (BAD - test this fails)
   const badCode = /* code that should fail */;

   // Should pass (GOOD - test this passes)
   const goodCode = /* code that should pass */;
   ```

3. **Run tests:**
   ```bash
   cd _tests_/react-ts-tw
   npx eslint src/test-rule-name.tsx          # Verify error is reported
   npx eslint src/test-rule-name.tsx --fix    # Verify auto-fix works
   npx eslint src/                            # Ensure no regressions
   ```

4. **Clean up temporary test file:**
   ```bash
   rm _tests_/react-ts-tw/src/test-rule-name.tsx
   rm _tests_/react/src/test-rule-name.jsx    # if created
   ```

5. **Ensure test project code covers the change:**
   - Update existing code in test project (components, hooks, etc.) if needed
   - The test project should naturally exercise the edited rule behavior

#### Version Bump After Edits

**IMPORTANT:** Every commit requires a version bump and tag. After committing your changes:

1. Bump version in `package.json` (PATCH for fixes, MINOR for new features)
2. Update `CHANGELOG.md`:
   - Add new version entry at the top
   - Add comparison link at the bottom: `[X.Y.Z]: https://github.com/.../compare/vPREV...vX.Y.Z`
3. Commit: `chore: bump version to X.Y.Z`
4. Create tag: `git tag -a vX.Y.Z -m "vX.Y.Z - description"`
5. Push: `git push origin main --tags`

See "When to Bump Version & Create Tag" section in Git Workflow for details.

---

### Rule Documentation Format in README.md

Each rule should have this format in the Rules Reference section:

```markdown
### `rule-name`

**What it does:** One-line description of the rule's purpose.

**Why use it:** Optional context for why this rule is helpful.

> **Note:** Any special notes or dependencies (optional).

\`\`\`javascript
// ✅ Good — description
const example = "correct code";

// ❌ Bad — description
const example = "incorrect code";
\`\`\`

**Options:** (if rule has options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `optionName` | `string` | `"value"` | What the option does |

\`\`\`javascript
// Configuration example
"code-style/rule-name": ["error", { optionName: "value" }]
\`\`\`

---
```

## Key Patterns & Conventions

### Source Code Access
```javascript
const sourceCode = context.sourceCode || context.getSourceCode();
```

### Options with Defaults
```javascript
const options = context.options[0] || {};
const maxItems = options.maxItems !== undefined ? options.maxItems : 3;
```

### Getting Tokens
```javascript
const openBracket = sourceCode.getFirstToken(node);
const closeBracket = sourceCode.getLastToken(node);
const tokenBefore = sourceCode.getTokenBefore(node);
const tokenAfter = sourceCode.getTokenAfter(node);
```

### Getting Text
```javascript
const text = sourceCode.getText(node);
const lines = sourceCode.lines;  // Array of all lines
```

### Indentation Calculation
```javascript
const lineText = sourceCode.lines[node.loc.start.line - 1];
const baseIndent = lineText.match(/^\s*/)[0];
const itemIndent = baseIndent + "    ";  // 4 spaces
```

### Fixer Methods
```javascript
fixer.replaceText(node, "new text")
fixer.replaceTextRange([start, end], "new text")
fixer.insertTextBefore(node, "text")
fixer.insertTextAfter(node, "text")
fixer.remove(node)
fixer.removeRange([start, end])
```

### Common Node Type Checks
```javascript
// Check parent type
if (node.parent && node.parent.type === "Property") { }

// Check for specific patterns
if (node.type === "ArrowFunctionExpression") { }
if (node.type === "JSXElement") { }
if (node.type === "ObjectExpression") { }

// React hooks detection
if (/^use[A-Z]/.test(node.callee.name)) { }
```

### Skip Conditions (Common Patterns)
```javascript
// Skip empty structures
if (elements.length === 0) return;

// Skip complex elements
const hasComplexElement = elements.some((el) =>
    el.type === "SpreadElement" ||
    el.type === "ObjectExpression" ||
    el.type === "ArrowFunctionExpression"
);
if (hasComplexElement) return;

// Skip specific parent contexts
if (node.parent?.type === "CallExpression") return;
```

## Rule Categories

Rules are organized in these categories (alphabetically sorted in index.js and README.md):

- **Array Rules** — Rules for array formatting
  - `array-callback-destructure`, `array-items-per-line`, `array-objects-on-new-lines`
- **Arrow Function Rules** — Arrow function syntax and style
  - `arrow-function-block-body`, `arrow-function-simple-jsx`, `arrow-function-simplify`, `curried-arrow-same-line`
- **Call Expression Rules** — Function call formatting
  - `function-arguments-format`, `nested-call-closing-brackets`, `no-empty-lines-in-function-calls`, `opening-brackets-same-line`, `simple-call-single-line`, `single-argument-on-one-line`
- **Class Rules** — Class and method definition formatting
  - `class-method-definition-format`, `class-naming-convention`
- **Comment Rules** — Comment formatting
  - `comment-format`
- **Component Rules** — React component patterns
  - `component-props-destructure`, `component-props-inline-type`, `svg-component-icon-naming`
- **Control Flow Rules** — if/switch/block statements
  - `block-statement-newlines`, `if-else-spacing`, `if-statement-format`, `multiline-if-conditions`, `no-empty-lines-in-switch-cases`, `ternary-condition-multiline`
- **Function Rules** — Function declarations and params
  - `function-call-spacing`, `function-declaration-style`, `function-naming-convention`, `function-object-destructure`, `function-params-per-line`, `no-empty-lines-in-function-params`
- **Hook Rules** — React hooks formatting
  - `hook-callback-format`, `hook-deps-per-line`
- **Import/Export Rules** — Import/export statements
  - `absolute-imports-only`, `export-format`, `import-format`, `import-source-spacing`, `index-export-style`, `index-exports-only`, `module-index-exports`
- **JSX Rules** — JSX elements and attributes
  - `classname-dynamic-at-end`, `classname-multiline`, `classname-no-extra-spaces`, `classname-order`, `jsx-children-on-new-line`, `jsx-closing-bracket-spacing`, `jsx-element-child-new-line`, `jsx-logical-expression-simplify`, `jsx-parentheses-position`, `jsx-prop-naming-convention`, `jsx-simple-element-one-line`, `jsx-string-value-trim`, `jsx-ternary-format`, `no-empty-lines-in-jsx`
- **Object Rules** — Object literal formatting
  - `no-empty-lines-in-objects`, `object-property-per-line`, `object-property-value-brace`, `object-property-value-format`, `string-property-spacing`
- **React Rules** — React-specific patterns
  - `react-code-order`
- **Spacing Rules** — General spacing rules
  - `assignment-value-same-line`, `member-expression-bracket-spacing`
- **TypeScript Rules** — TypeScript-specific rules (TS configs only)
  - `enum-format`, `interface-format`, `no-inline-type-definitions`, `prop-naming-convention`, `type-annotation-spacing`, `type-format`, `typescript-definition-location`
- **Variable Rules** — Variable declarations and naming
  - `variable-naming-convention`

## Naming Conventions

- **Rule names:** kebab-case (e.g., `array-items-per-line`)
- **Internal variables:** camelCase (e.g., `arrayItemsPerLine`)
- **Handler functions:** end with `Handler` (e.g., `checkPatternHandler`)
- **Options:** camelCase (e.g., `maxItems`, `minProperties`)

## Meta Types

- `type: "layout"` - Formatting/whitespace rules (most rules)
- `type: "suggestion"` - Code convention rules (naming conventions)

## Documentation Files

- `README.md` - Main documentation with all 76 rules
- `recommended-configs/<config-name>/README.md` - Config-specific documentation (references main README for rule details)
- `index.d.ts` - TypeScript types for IDE autocomplete

## Important Notes

- Most rules should be auto-fixable (`fixable: "code"` or `fixable: "whitespace"` in meta)
- Rules that require file creation/movement or architectural decisions may be report-only
- Currently: 67 auto-fixable rules, 17 configurable rules, 9 report-only rules
- Use 4-space indentation throughout
- Object properties in `context.report()` must be alphabetically sorted
- Keep rules self-sufficient (no dependencies on other ESLint rules)
- Test with relevant test app in `_tests_/` before publishing

---

## Rule Count Locations

**IMPORTANT:** When adding/removing rules, update the rule counts in ALL these locations:

### Current Counts (update these when changing rules)
- **Total rules:** 75
- **Auto-fixable:** 66 (42 with `fixable: "code"` + 24 with `fixable: "whitespace"`)
- **Configurable:** 17 (rules with ⚙️ that have options)
- **Report-only:** 9

**IMPORTANT:** All counts must be uniform across ALL files. When updating:
- Total rules, auto-fixable count, configurable count, and report-only count must match everywhere
- The auto-fixable breakdown (code vs whitespace) in this section must match actual `grep` counts
- Use the Quick Verification Commands below to verify counts before committing

### Files & Line Numbers to Update

| File | Line(s) | What to Update |
|------|---------|----------------|
| `README.md` | ~22 | `*76 rules (67 auto-fixable, 17 configurable)*` |
| `README.md` | ~30 | `**76 custom rules** (67 auto-fixable, 17 configurable)` |
| `README.md` | ~39 | `67 of 76 rules support auto-fix` |
| `README.md` | ~100 | `**67 rules** support automatic fixing. **17 rules** have configurable options` |
| `README.md` | ~266 | `**76 rules total** — 67 with auto-fix, 17 configurable` |
| `README.md` | ~3650 | `67 of 76 rules support auto-fixing` |
| `AGENTS.md` | ~7 | `76 custom formatting rules (67 auto-fixable, 17 configurable, 9 report-only)` |
| `AGENTS.md` | ~9 | `Contains all 76 rules` |
| `AGENTS.md` | ~36 | `(68 rules in JS projects, 76 in TS projects)` |
| `AGENTS.md` | ~89 | `(76 rules total)` |
| `AGENTS.md` | ~675 | `all 76 rules` |
| `AGENTS.md` | ~697 | `67 auto-fixable rules, 17 configurable rules, 9 report-only` |
| `AGENTS.md` | Rule Count Locations section | Current Counts table |
| `recommended-configs/react-ts-tw/README.md` | ~396 | `**67 auto-fixable rules** (76 total, 17 configurable, 9 report-only)` |
| `recommended-configs/react/README.md` | ~286 | `**67 auto-fixable rules** (76 total, 17 configurable, 9 report-only)` |

### Quick Verification Commands

```bash
# Count total rules
grep -c "^const [a-zA-Z]* = {$" index.js

# Count auto-fixable (code)
grep -c 'fixable: "code"' index.js

# Count auto-fixable (whitespace)
grep -c 'fixable: "whitespace"' index.js

# Count configurable rules (rules with ⚙️ in README table)
grep "| \`" README.md | grep -c "⚙️"

# Find all rule count mentions (excluding CHANGELOG)
grep -rn "[0-9][0-9] rules\|[0-9][0-9] auto" --include="*.md" | grep -v CHANGELOG
```

---

## Git Workflow

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <subject>

[optional body]
```

**Types:**
- `feat` - New feature or rule
- `fix` - Bug fix
- `docs` - Documentation only changes
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `chore` - Maintenance tasks (deps, configs)

**Subject line rules:**
- Use lowercase (except proper nouns)
- No period at the end
- Maximum 72 characters
- Use imperative mood ("add" not "added")

**Examples:**
```
feat: add function-declaration-style rule
fix: allow relative imports in entry files
docs: update options descriptions
```

**Multi-feature commits:**
```
feat: add function-declaration-style rule and enhancements

New rule:
- function-declaration-style: auto-fixes to arrow expressions

Enhancements:
- function-naming-convention: add auto-fix
```

---

### Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH` (e.g., `1.2.8`)

| Change Type | Version | Examples |
|-------------|---------|----------|
| **PATCH** | `x.x.+1` | Bug fixes, typo corrections, doc updates |
| **MINOR** | `x.+1.0` | New rules, new features, new options |
| **MAJOR** | `+1.0.0` | Breaking changes, removed/renamed rules |

**Decision guide:**
- New rule → MINOR
- Auto-fix to existing rule → MINOR
- New option → MINOR
- Bug fix → PATCH
- Doc update only → PATCH
- Change default values → MAJOR (breaking)
- Rename/remove rule → MAJOR (breaking)

---

### When to Bump Version & Create Tag

**IMPORTANT:** Every commit requires a version bump and tag. Follow this workflow:

#### Commit Workflow (Always Bump Version)
After every meaningful change:
1. Make changes and commit with appropriate message
2. Bump version in `package.json`
3. Update `CHANGELOG.md`:
   - Add new version entry at the top
   - Add comparison link at the bottom: `[X.Y.Z]: https://github.com/.../compare/vPREV...vX.Y.Z`
4. Commit version bump with descriptive message (see below)
5. Create annotated tag with descriptive message
6. Push commits and tags

#### Version Bump Commit Messages

**IMPORTANT:** Do NOT use generic messages like `chore: bump version to X.Y.Z`. Instead, use descriptive messages that summarize what changes are in this version.

**Format:** `chore: release vX.Y.Z - brief description`

**Good examples:**
```
chore: release v1.7.2 - fix double comma bug in enum/interface format
chore: release v1.7.1 - multiple rule fixes for destructuring and ternaries
chore: release v1.6.0 - add 3 new rules and enhance ternary formatting
```

**Bad examples:**
```
chore: bump version to 1.7.2
chore: version bump
chore: v1.7.2
```

This makes `git log` readable and helps understand what each version contains without checking the CHANGELOG.

#### Version Bump Rules
| Change Type | Version Bump | Example | GitHub Release? |
|-------------|--------------|---------|-----------------|
| Bug fix | PATCH (+0.0.1) | 1.5.2 → 1.5.3 | No |
| Enhancement to existing rule | PATCH (+0.0.1) | 1.5.3 → 1.5.4 | No |
| New rule | MINOR (+0.1.0) | 1.5.4 → 1.6.0 | **Yes** |
| Breaking change | MAJOR (+1.0.0) | 1.6.0 → 2.0.0 | **Yes** |
| Docs only | PATCH (+0.0.1) | 1.5.2 → 1.5.3 | No |

#### MINOR/MAJOR Release Format (GitHub Releases)

When bumping MINOR or MAJOR version, the CHANGELOG entry must follow this format.

**IMPORTANT:** The release should contain ALL changes since the **previous RELEASE** (MINOR/MAJOR). The Version Range starts from the first version AFTER the previous release.

Example: If releasing v1.7.0 and the previous release was v1.6.0:
- Version Range: **v1.6.1 → v1.7.0** (starts AFTER v1.6.0)
- Include changes from: v1.6.1, v1.6.2, ... v1.6.6, AND v1.7.0

```markdown
## [X.Y.0] - YYYY-MM-DD

**Release Title (Brief Description of Main Features)**

**Version Range:** vAfterPreviousRelease → vCurrent

### Added

**New Rules (N)**
- `rule-name` - Description 🔧

### Enhanced

- **`rule-name`** - What was enhanced (consolidate all enhancements since last release)

### Fixed

- **`rule-name`** - What was fixed (consolidate all fixes since last release)

### Stats

- Total Rules: XX (was YY)
- Auto-fixable: ZZ rules 🔧
- Report-only: N rules

**Full Changelog:** [vAfterPreviousRelease...vCurrent](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/vAfterPreviousRelease...vCurrent)
```

**Required elements for MINOR/MAJOR releases:**
1. **Release title** in bold describing main changes
2. **Version Range** showing first version AFTER previous release → current version
3. **Consolidated changes** from all versions since last release
4. **Stats** section with rule counts
5. **Full Changelog** link at the end

#### Example Workflow
```bash
# 1. Make changes and commit
git add .
git commit -m "fix: handle edge case in rule-name"

# 2. Bump version in package.json (1.5.2 → 1.5.3)
# 3. Update CHANGELOG.md with new entry

# 4. Commit version bump with descriptive message
git add package.json CHANGELOG.md
git commit -m "chore: release v1.5.3 - fix edge case in rule-name"

# 5. Create annotated tag with descriptive message
git tag -a v1.5.3 -m "v1.5.3 - Fix Edge Case in rule-name

- Fixed edge case handling in rule-name
- Improved error messages"

# 6. Push
git push origin main --tags
```

---

### Release Steps

1. **Update version in package.json**
2. **Update CHANGELOG.md:**
   - Add new version entry at the top
   - Add comparison link at the bottom: `[X.Y.Z]: https://github.com/.../compare/vPREV...vX.Y.Z`
3. **Commit version bump with descriptive message:**
   ```bash
   git commit -m "chore: release v1.2.9 - brief description of changes"
   ```
4. **Create annotated tag with descriptive message:**
   ```bash
   git tag -a v1.2.9 -m "v1.2.9 - Brief Description

   - Feature description 1
   - Feature description 2"
   ```
5. **Push (requires explicit approval):** `git push origin main --tags`
6. **Publish (requires explicit approval):** `npm publish`

---

### GitHub Releases (Grouped Tags)

GitHub Releases group multiple version tags into a single release announcement. Create a release when a significant milestone is reached (new features, major enhancements).

**When to create a GitHub Release:**
- **All MINOR versions (x.Y.0)** - Every new MINOR version is a release
- **All MAJOR versions (X.0.0)** - Every new MAJOR version is a release
- Optionally after multiple PATCH versions accumulate significant changes

**Note:** All MINOR versions (e.g., v1.7.0, v1.8.0) and MAJOR versions (e.g., v2.0.0) are considered releases and must be added to the "Current releases" list. The Version Range for a release always starts from the first version AFTER the previous release (MINOR or MAJOR) up to the current version.

**Release format:**

```markdown
## Release Title
<Short, descriptive title summarizing the main changes>

## Version Range
vX.X.X → vY.Y.Y

---

## What's New

<Brief intro paragraph mentioning key highlights and rule count change>

### New Rules

| Rule | Description |
|------|-------------|
| `rule-name` | What it does |

### Enhancements

| Rule | Enhancement |
|------|-------------|
| `rule-name` | What was improved |

### New Features

- Feature 1 description
- Feature 2 description

### Bug Fixes

- Fix 1 description
- Fix 2 description

### Documentation

- Doc change 1
- Doc change 2

## Installation

\`\`\`bash
npm install eslint-plugin-code-style@Y.Y.Y
\`\`\`

## Stats

- Total Rules: X (was Y)
- All rules are auto-fixable with `eslint --fix`

**Full Changelog**: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/vX.X.X...vY.Y.Y
```

**Steps to create a GitHub Release:**

1. Go to repository → Releases → "Draft a new release"
2. Choose the latest tag (e.g., `v1.3.0`)
3. Set release title (short, descriptive)
4. Paste the release description following the format above
5. Update `CHANGELOG.md` with the same information
6. Publish release

### CHANGELOG.md

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) standard.

**IMPORTANT:**
- The CHANGELOG must list **ALL version tags** (currently 82 tags)
- Update the CHANGELOG with every new tag/release
- Keep it in sync with changes as you work
- **Releases must match GitHub Releases content exactly**

#### Two Types of Entries

**1. Releases** (published to GitHub Releases)
- Have **Version Range** showing tags covered
- Full detailed sections with sub-categories
- Include **Full Changelog** link at the end
- Content must match the GitHub Release description
- **Current releases:** v1.11.0, v1.10.0, v1.9.0, v1.8.0, v1.7.0, v1.6.0, v1.5.0, v1.4.2, v1.3.0, v1.2.0, v1.1.0, v1.0.16, v1.0.14, v1.0.7, v1.0.6

**2. Tags/PATCH versions** (between releases)
- Simpler entries with just the changes
- **NO title** (bold description line after date)
- **NO Version Range**
- **NO Full Changelog link** in the entry body
- **MUST add link reference** at bottom of CHANGELOG.md: `[X.Y.Z]: https://github.com/.../compare/vA.B.C...vX.Y.Z`
- Just `### Fixed`, `### Enhanced`, or other section headers directly

#### When to Create a Release

Create a release when:
- Adding new rules (MINOR version bump)
- Significant feature additions
- Major documentation overhauls
- Grouping multiple related changes together

After creating a release:
1. Create the GitHub Release with full description
2. Copy the same content to CHANGELOG.md
3. Add **Full Changelog** link at the end
4. Ensure both match exactly

#### Release Format

```markdown
## [1.4.2] - 2026-01-30

**New Rules, Enhanced Auto-Fix & Comprehensive Documentation**

**Version Range:** v1.3.1 → v1.4.2

### Added

**New Rules (3)**
- `rule-name` - Description 🔧

**Feature Category**
- Feature description

### Enhanced

- **`rule-name`** - What was improved
- **`rule-name`** - Another improvement

### Fixed

- **`rule-name`** - What was fixed

### Documentation

- What docs were updated

### Stats

- Total Rules: 64 (was 61)
- Auto-fixable: 58 rules 🔧
- Report-only: 6 rules

**Full Changelog:** [v1.3.1...v1.4.2](https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.3.1...v1.4.2)
```

#### Tag Format (PATCH versions)

PATCH versions (x.y.+1) have a simpler format - NO title, NO version range, NO full changelog in entry:

```markdown
## [1.11.2] - 2026-02-04

### Fixed

- **`rule-name`** - What was fixed
- **`another-rule`** - Another fix

---
```

For version bumps with no changes:
```markdown
## [1.0.19] - 2026-01-11

- Version bump

---
```

**IMPORTANT:** Even though PATCH entries don't have Full Changelog links in the body, you MUST still add the link reference at the bottom of CHANGELOG.md:
```markdown
[1.11.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.1...v1.11.2
[1.11.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.11.0...v1.11.1
```

#### Section Types

| Section | Use for |
|---------|---------|
| **Added** | New rules, features, configurations |
| **Changed** | Breaking changes, behavior changes |
| **Enhanced** | Improvements to existing functionality |
| **Fixed** | Bug fixes |
| **Deprecated** | Features to be removed in future |
| **Removed** | Removed features |
| **Security** | Security fixes |
| **Documentation** | Doc-only changes |
| **Stats** | Rule counts (include for releases) |

#### Comparison Links

At the bottom of CHANGELOG.md, maintain comparison links for **every version**:

```markdown
[1.4.2]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.4.0...v1.4.1
```

#### When to Update

Update CHANGELOG.md when creating any new tag:
- [ ] Add new section at top: `## [X.Y.Z] - YYYY-MM-DD`
- [ ] For releases: add **Version Range**, full detailed sections, and **Full Changelog** link
- [ ] For tags: add appropriate subsections
- [ ] Add comparison link at bottom
- [ ] Separate each version with `---`

**Tip:** Update the CHANGELOG as you make changes, not just at release time

#### Release Checklist

When creating a release:
- [ ] Write full release description with all sections (Added, Enhanced, Fixed, Stats, etc.)
- [ ] Create GitHub Release with the description and title
- [ ] Copy exact same content to CHANGELOG.md
- [ ] Add **Release Title** (bold text after version header)
- [ ] Add **Version Range** showing first and last tag in release
- [ ] Add **Full Changelog** link at the end: `**Full Changelog:** [vX.X.X...vY.Y.Y](compare-url)`
- [ ] Update the "Current releases" list in this file (AGENTS.md)
- [ ] Verify content matches between GitHub Release and CHANGELOG

#### Verifying CHANGELOG

To verify all tags are in CHANGELOG:
```bash
# Count tags vs CHANGELOG entries
echo "Tags: $(git tag | wc -l)"
echo "CHANGELOG: $(grep -c '^## \[' CHANGELOG.md)"

# Check for missing tags
git tag -l | sort -V > /tmp/tags.txt
grep '^## \[' CHANGELOG.md | sed 's/.*\[\([^]]*\)\].*/v\1/' | sort -V > /tmp/changelog.txt
diff /tmp/tags.txt /tmp/changelog.txt
```

## Skills

This project includes reusable skills in the `.skills/` directory following the [Agent Skills](https://agentskills.io) open standard. These work with Claude Code, Cursor, VS Code, GitHub Copilot, Gemini CLI, and other compatible agents.

| Skill | Description |
|-------|-------------|
| `audit-docs` | Verify documentation accuracy across all files |
| `manage-rule` | Add, edit, or remove an ESLint rule with all required file updates |
| `review-config` | Review a recommended ESLint configuration |
| `test-rule` | Test an ESLint rule after creating or modifying it |
| `validate-types` | Verify TypeScript definitions match rules in index.js |

See `.skills/*/skill.md` for detailed instructions.

---

## Workflows

Reusable workflows for common tasks. Any AI agent should follow these when performing the specified task.

---

### Workflow: Test Rule

Test an ESLint rule to verify it works correctly.

**When to use:** After creating or modifying a rule.

**Steps:**

1. **Find the rule** in `index.js` and understand what it checks
2. **Identify test app** — Use `_tests_/react/` for JS rules or `_tests_/react-ts-tw/` for TS rules
3. **Create test cases** in the test app:
   - Add code that should PASS (no violations)
   - Add code that should FAIL (triggers violations)
4. **Run the linter:**
   ```bash
   cd _tests_/<config-name>
   npm run lint        # Check for violations
   npm run lint:fix    # Verify auto-fix works
   ```
5. **Verify results:**
   - Valid code produces no errors
   - Invalid code triggers the expected error message
   - Auto-fix transforms code correctly

---

### Workflow: Validate Types

Verify TypeScript definitions match the rules in `index.js`.

**When to use:** After adding new rules or before releases.

**Steps:**

1. **Count rules in index.js:**
   ```bash
   grep -c "^const .* = {$" index.js
   ```
   Or count entries in the `rules` export object.

2. **Check index.d.ts:**
   - Verify `RuleNames` type includes all rule names (alphabetically sorted)
   - Verify `PluginRules` interface includes all rules

3. **Look for mismatches:**
   - Rules in `index.js` missing from `index.d.ts`?
   - Rules in `index.d.ts` that don't exist in `index.js`?

4. **Report:**
   - Total rules: X
   - Types match: Yes/No
   - Missing types: [list]
   - Extra types: [list]

---

### Workflow: Review Config

Review a recommended ESLint configuration for consistency.

**When to use:** After adding rules or modifying configs.

**Arguments:** `<config-name>` (e.g., `react`, `react-ts-tw`)

**Steps:**

1. **Check config file:** `recommended-configs/<config-name>/eslint.config.js`
   - Does it import the plugin correctly?
   - Are rules set to `"error"` (not `"off"`)?
   - Are rule options valid per the rule's schema?

2. **Compare with test config:** `_tests_/<config-name>/eslint.config.js`
   - Should have the same rules enabled
   - Test config may have additional test-specific settings

3. **Test the config:**
   ```bash
   cd _tests_/<config-name>
   npm run lint
   ```

4. **Check README:** `recommended-configs/<config-name>/README.md`
   - Does it list all enabled rules?
   - Are rule counts accurate?

5. **Report:**
   - Config valid: Yes/No
   - Rules enabled: X
   - Issues found: [list]

---

### Workflow: Audit Docs

Verify documentation accuracy across all files.

**When to use:** Before releases or after adding rules.

**Steps:**

1. **Count actual rules:**
   ```bash
   grep -c "^const .* = {$" index.js
   ```

2. **Check rule count references:**
   - `AGENTS.md`: "61 custom auto-fixable formatting rules"
   - `README.md`: Multiple mentions of rule count
   - `recommended-configs/*/README.md`: Any rule count mentions

3. **Verify version consistency:**
   - `package.json` version matches latest tag
   - No outdated version references in docs

4. **Check links:**
   - Config paths in README exist
   - Test app paths exist
   - Internal markdown links work

5. **Report:**
   - Actual rule count: X
   - Documented counts match: Yes/No
   - Outdated references: [list]
   - Broken links: [list]
