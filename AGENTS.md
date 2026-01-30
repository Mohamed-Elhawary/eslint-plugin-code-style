# AGENTS.md

Instructions for AI coding agents working with this codebase.

## Project Overview

**eslint-plugin-code-style** is an ESLint plugin providing 64 custom auto-fixable formatting rules for React/JSX projects. It's designed for ESLint v9+ flat config system.

- **Main entry:** `index.js` - Contains all 61 rules in a single file
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
├── ... (64 rules total)
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

When creating a new rule, ALL of the following files must be updated:

#### 1. `index.js` — Rule Implementation
- [ ] Add JSDoc comment block with the standard format (see Rule Implementation Pattern above)
- [ ] Include: Description, Options (if any), Good examples, Bad examples
- [ ] Add `const ruleName = { create(), meta: {} }` definition
- [ ] Add to `rules` object in default export (keep alphabetical order)
- [ ] Update the rule count in any comments if present

#### 2. `index.d.ts` — TypeScript Types
- [ ] Add rule name to `RuleNames` type union (alphabetically sorted)
- [ ] Add rule to `PluginRules` interface (alphabetically sorted)

#### 3. `AGENTS.md` — Agent Instructions
- [ ] Update rule count in "Project Overview" section (e.g., "61 custom auto-fixable formatting rules")
- [ ] Update rule count in "Code Structure" section
- [ ] Add rule to its category in "[Rule Categories](#rule-categories)" section (see list below for all categories)
- [ ] Update rule count in "Documentation Files" section

#### 4. `README.md` — Main Documentation
- [ ] Update rule count in badges/header section
- [ ] Update rule count in "Why This Plugin?" section
- [ ] Update rule count in "Key Features" section
- [ ] Update rule count in "Auto-Fixable Rules" section
- [ ] Add rule to `rules: {}` example in "Quick Start" section
- [ ] Add rule to "Rules Summary" table (with description)
- [ ] Add detailed rule documentation with:
  - "What it does" description
  - Code examples (Good ✅ and Bad ❌)
  - Options table (if rule has options)
  - Configuration example (if rule has options)

#### 5. Config Files — Add Rule to Configs
- [ ] `recommended-configs/react/eslint.config.js`
- [ ] `recommended-configs/react-ts-tw/eslint.config.js`
- [ ] `_tests_/react/eslint.config.js`
- [ ] `_tests_/react-ts-tw/eslint.config.js`

#### 6. Config READMEs (if rule count changed)
- [ ] `recommended-configs/react/README.md` — Update any rule counts
- [ ] `recommended-configs/react-ts-tw/README.md` — Update any rule counts

---

### Editing an Existing Rule — Checklist

When modifying an existing rule, check if these need updates:

#### If changing rule behavior:
- [ ] Update JSDoc in `index.js` (Good/Bad examples)
- [ ] Update `README.md` rule documentation (examples, description)
- [ ] Test in `_tests_/` apps with `npm run lint` and `npm run lint:fix`

#### If adding new options:
- [ ] Add option to `schema` in rule's `meta` object
- [ ] Add option handling in `create()` function
- [ ] Update JSDoc Options section in `index.js`
- [ ] Update README.md options table for the rule
- [ ] Add configuration example in README.md

#### If adding auto-fix to rule that didn't have it:
- [ ] Add `fixable: "code"` to rule's `meta` object
- [ ] Add `fix()` function in `context.report()`

#### If changing default values:
- [ ] Update JSDoc in `index.js`
- [ ] Update README.md options table
- [ ] Consider if this is a MAJOR version bump (breaking change)

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
  - `array-items-per-line`, `array-objects-on-new-lines`
- **Arrow Function Rules** — Arrow function syntax and style
  - `arrow-function-block-body`, `arrow-function-simple-jsx`, `arrow-function-simplify`, `curried-arrow-same-line`
- **Call Expression Rules** — Function call formatting
  - `function-arguments-format`, `nested-call-closing-brackets`, `no-empty-lines-in-function-calls`, `opening-brackets-same-line`, `simple-call-single-line`, `single-argument-on-one-line`
- **Comment Rules** — Comment formatting
  - `comment-format`
- **Component Rules** — React component patterns
  - `component-props-destructure`, `component-props-inline-type`
- **Control Flow Rules** — if/switch/block statements
  - `block-statement-newlines`, `if-statement-format`, `multiline-if-conditions`, `no-empty-lines-in-switch-cases`, `ternary-condition-multiline`
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
  - `enum-format`, `interface-format`, `no-inline-type-definitions`, `type-annotation-spacing`, `type-format`, `typescript-definition-location`
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

- `README.md` - Main documentation with all 64 rules
- `recommended-configs/<config-name>/README.md` - Config-specific documentation (references main README for rule details)
- `index.d.ts` - TypeScript types for IDE autocomplete

## Important Notes

- All rules must be auto-fixable (`fixable: "code"` in meta)
- Use 4-space indentation throughout
- Object properties in `context.report()` must be alphabetically sorted
- Keep rules self-sufficient (no dependencies on other ESLint rules)
- Test with relevant test app in `_tests_/` before publishing

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

### Release Steps

1. **Update version in package.json**
2. **Commit changes:** `git commit -m "feat: description"`
3. **Create annotated tag:**
   ```bash
   git tag -a v1.2.9 -m "v1.2.9

   - Feature description 1
   - Feature description 2"
   ```
4. **Push (requires explicit approval):** `git push origin HEAD && git push origin v1.2.9`
5. **Publish (requires explicit approval):** `npm publish`

---

### GitHub Releases (Grouped Tags)

GitHub Releases group multiple version tags into a single release announcement. Create a release when a significant milestone is reached (new features, major enhancements).

**When to create a GitHub Release:**
- After multiple PATCH/MINOR versions accumulate significant changes
- When a new major feature is complete
- At logical milestones (e.g., v1.2.0 → v1.3.0)

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

**CHANGELOG.md:**

All releases are documented in `CHANGELOG.md` at the project root. Update this file whenever creating a GitHub Release.

Each release entry in CHANGELOG.md must include a **Full Changelog** link at the end:

```markdown
**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/vFIRST...vLAST
```

Where:
- `vFIRST` = First version tag in the release range (the tag after the last tag of the previous release)
- `vLAST` = Last version tag in the release range (current release)

Example: For release 1.2.0 with version range v1.1.10 → v1.2.0:
```markdown
**Full Changelog:** https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/compare/v1.1.10...v1.2.0
```

## Skills

This project includes reusable skills in the `.skills/` directory following the [Agent Skills](https://agentskills.io) open standard. These work with Claude Code, Cursor, VS Code, GitHub Copilot, Gemini CLI, and other compatible agents.

| Skill | Description |
|-------|-------------|
| `test-rule` | Test an ESLint rule after creating or modifying it |
| `validate-types` | Verify TypeScript definitions match rules in index.js |
| `review-config` | Review a recommended ESLint configuration |
| `audit-docs` | Verify documentation accuracy across all files |

See `.skills/*/SKILL.md` for detailed instructions.

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
