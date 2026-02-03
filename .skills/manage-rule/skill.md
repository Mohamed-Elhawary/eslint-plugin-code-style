---
name: manage-rule
description: Add, edit, or remove an ESLint rule. Includes all required file updates and documentation changes.
---

# Manage ESLint Rule

Complete workflow for adding, editing, or removing a rule from the plugin.

## Operations

### Adding a New Rule

**Files to modify (in order):**

1. **`index.js`** — Rule implementation
   - Add JSDoc block with description, Good/Bad examples, and options table
   - Add rule definition: `const ruleName = { create(), meta: {} }`
   - Add to `rules` object in default export (alphabetically sorted)

2. **`index.d.ts`** — TypeScript types
   - Add to `RuleNames` type union (alphabetically sorted)
   - Add to `PluginRules` interface (alphabetically sorted)

3. **`README.md`** — Main documentation (4 sections!)
   - **Rule counts** (6 locations - see AGENTS.md "Rule Count Locations")
   - **Quick Start example** (~line 184) — Add rule alphabetically
   - **Rules Summary table** — Add row with description and emoji (🔧 auto-fixable, ⚙️ configurable)
   - **Detailed documentation** — Full section with examples and options

4. **`AGENTS.md`** — Agent instructions
   - Update rule counts in "Current Counts" table
   - Add rule to appropriate category in "Rule Categories" section

5. **Config files** (alphabetically sorted)
   - `recommended-configs/react-ts-tw/eslint.config.js`
   - `recommended-configs/react/eslint.config.js` (skip if TypeScript-only)
   - `_tests_/react-ts-tw/eslint.config.js`
   - `_tests_/react/eslint.config.js` (skip if TypeScript-only)

6. **Config READMEs**
   - `recommended-configs/react-ts-tw/README.md`
   - `recommended-configs/react/README.md`

7. **Version bump & CHANGELOG** — MINOR (x.+1.0)
   - Update `package.json` version
   - Update `CHANGELOG.md` with **release format** (required for MINOR releases):
     ```markdown
     ## [X.Y.0] - YYYY-MM-DD

     **Release Title (Brief Description)**

     **Version Range:** vAfterPreviousRelease → vX.Y.0

     ### Added

     **New Rules (N)**
     - **`rule-name`** - Description 🔧

     ### Stats

     - Total Rules: XX (was YY)
     - Auto-fixable: ZZ rules 🔧
     - Report-only: N rules

     **Full Changelog:** [vAfterPreviousRelease...vX.Y.0](compare-url)
     ```
   - Add comparison link at bottom of CHANGELOG.md
   - Update "Current releases" list in AGENTS.md
   - Create annotated tag: `git tag -a vX.Y.0 -m "message"`

**TypeScript-only rules** (only add to `-ts-tw` configs):
- `component-props-inline-type`, `enum-format`, `interface-format`
- `no-inline-type-definitions`, `type-annotation-spacing`, `type-format`
- `typescript-definition-location`

---

### Editing an Existing Rule

**Bug fix (PATCH x.x.+1):**
- Fix in `index.js` → Test → Commit: `fix: description`

**Behavior change (PATCH/MINOR):**
- Update `index.js` logic and JSDoc
- Update `README.md` rule documentation section (examples, description)
- Test with `npm run lint` and `npm run lint:fix`

**Adding options (MINOR x.+1.0):**
- Add to `schema` in rule's `meta` object
- Handle in `create()` with default value
- Update JSDoc Options section
- Update README.md options table

**Adding auto-fix (MINOR x.+1.0):**
- Add `fixable: "code"` or `fixable: "whitespace"` to `meta`
- Add `fix()` function in `context.report()`
- Add 🔧 emoji in README Rules Summary table
- Update auto-fixable counts in ALL docs (must be uniform everywhere)
- Update AGENTS.md "Current Counts" breakdown (code vs whitespace counts)

**Changing defaults (MAJOR +1.0.0):**
- This is a breaking change
- Update default value
- Update all documentation
- Commit with `!`: `feat!: change default`

---

### Removing a Rule

**IMPORTANT:** This is a BREAKING CHANGE requiring MAJOR version (+1.0.0)

**Files to modify:**

1. **`index.js`** — Remove JSDoc, rule definition, and from `rules` object
2. **`index.d.ts`** — Remove from `RuleNames` and `PluginRules`
3. **`README.md`** — Remove from all 4 sections (counts, Quick Start, table, detailed docs)
4. **`AGENTS.md`** — Update counts and remove from categories
5. **Config files** — Remove from all 4 config files
6. **Config READMEs** — Update counts

---

## Testing

```bash
cd _tests_/react-ts-tw  # or _tests_/react for JS rules

# Create temp test file with valid and invalid code
# then run:
npm run lint           # Check errors are reported
npm run lint:fix       # Verify auto-fix works
cat src/test-file.tsx  # Verify fixed code

# Clean up temp test file
rm src/test-file.tsx
```

## Verification

```bash
# Count rules in each location
grep -c "^const .* = {$" index.js
grep -c 'code-style/' index.d.ts
grep -c '"code-style/' recommended-configs/react-ts-tw/eslint.config.js
```

All counts should match. Use `audit-docs` skill to verify documentation consistency.

## Commit Message Format

- New rule: `feat: add rule-name rule`
- Bug fix: `fix: description of fix in rule-name`
- Options: `feat: add optionName option to rule-name`
- Remove: `feat!: remove rule-name rule`
