---
name: validate-types
description: Verify TypeScript definitions in index.d.ts match the rules in src/. Use after adding new rules or before releases.
---

# Validate TypeScript Definitions

Ensure `index.d.ts` correctly defines all rules from `src/rules/`.

## Steps

1. **Count rules in src/rules/**
   ```bash
   grep -rc "^const .* = {$" src/rules/
   ```
   Or count entries in the `rules` export objects across the category files.

2. **Check index.d.ts**
   - Verify `RuleNames` type union includes all rule names
   - Verify `PluginRules` interface includes all rules
   - All entries should be alphabetically sorted

3. **Find mismatches**
   - Rules in `src/rules/` missing from `index.d.ts`?
   - Rules in `index.d.ts` that don't exist in `src/rules/`?

4. **Test IDE support**
   - Open an eslint.config.js file
   - Type `rules: { "code-style/` and verify autocomplete shows all rules

## Report Format

```
Total rules in src/rules/: X
Total rules in index.d.ts: X
Types match: Yes/No

Missing from index.d.ts:
- rule-name-1
- rule-name-2

Extra in index.d.ts (not in src/rules/):
- old-rule-name
```
