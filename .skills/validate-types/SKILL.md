---
name: validate-types
description: Verify TypeScript definitions in index.d.ts match the rules in index.js. Use after adding new rules or before releases.
---

# Validate TypeScript Definitions

Ensure `index.d.ts` correctly defines all rules from `index.js`.

## Steps

1. **Count rules in index.js**
   ```bash
   grep -c "^const .* = {$" index.js
   ```
   Or count entries in the `rules` export object at the end of the file.

2. **Check index.d.ts**
   - Verify `RuleNames` type union includes all rule names
   - Verify `PluginRules` interface includes all rules
   - All entries should be alphabetically sorted

3. **Find mismatches**
   - Rules in `index.js` missing from `index.d.ts`?
   - Rules in `index.d.ts` that don't exist in `index.js`?

4. **Test IDE support**
   - Open an eslint.config.js file
   - Type `rules: { "code-style/` and verify autocomplete shows all rules

## Report Format

```
Total rules in index.js: X
Total rules in index.d.ts: X
Types match: Yes/No

Missing from index.d.ts:
- rule-name-1
- rule-name-2

Extra in index.d.ts (not in index.js):
- old-rule-name
```
