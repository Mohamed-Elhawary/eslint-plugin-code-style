---
name: audit-docs
description: Verify documentation accuracy across all files. Check rule counts, version references, and links. Use before releases or after adding rules.
---

# Audit Project Documentation

Verify documentation is accurate and consistent across all files.

## Steps

1. **Count actual rules**
   ```bash
   # Total rules
   grep -rc "^const .* = {$" src/rules/

   # Auto-fixable breakdown
   grep -rc 'fixable: "code"' src/rules/
   grep -rc 'fixable: "whitespace"' src/rules/
   ```

2. **Check rule count references (must be uniform across ALL files)**

   Files that mention rule count (see AGENTS.md "Rule Count Locations" section for complete list):
   - `AGENTS.md`: Multiple locations (see below)
   - `README.md`: Multiple mentions in badges, features, headings
   - `recommended-configs/*/README.md`: May mention rule counts

3. **Verify version consistency**
   ```bash
   grep '"version"' package.json
   git tag --sort=-version:refname | head -1
   ```
   - `package.json` version should match latest git tag
   - No outdated version references in docs

4. **Check paths exist**
   - Config paths mentioned in README
   - Test app paths
   - All internal markdown links

5. **Verify rule lists**
   - Rules in README "Rules Summary" table match actual rules
   - Rule categories in AGENTS.md are complete

## Report Format

```
Actual rule count: X
Auto-fixable: Y (Z code + W whitespace)
Report-only: X - Y

Rule count references (must be uniform):
- AGENTS.md (Project Overview): X [OK/OUTDATED]
- AGENTS.md (Code Structure): X [OK/OUTDATED]
- AGENTS.md (Current Counts breakdown): Z code + W whitespace [OK/OUTDATED]
- README.md: X [OK/OUTDATED]

Version:
- package.json: X.X.X
- Latest tag: vX.X.X
- Match: Yes/No

Broken links:
- [link text](path) - File not found

Missing rules in docs:
- rule-name

Extra rules in docs (not in src/rules/):
- old-rule-name
```
