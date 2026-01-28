---
name: review-config
description: Review a recommended ESLint configuration for consistency and correctness. Use after adding rules or modifying configs. Argument is config name (react, react-ts-tw).
---

# Review ESLint Configuration

Review a recommended config to ensure it's consistent, complete, and working.

## Arguments

- `config-name`: The configuration to review (e.g., `react`, `react-ts-tw`)

## Steps

1. **Check config file**: `recommended-configs/<config-name>/eslint.config.js`
   - Does it import the plugin correctly?
   - Are rules set to `"error"` (not `"off"`)?
   - Are rule options valid per the rule's `meta.schema`?

2. **Compare with test config**: `_tests_/<config-name>/eslint.config.js`
   - Should have the same rules enabled
   - Test config may have additional test-specific settings

3. **Test the config**
   ```bash
   cd _tests_/<config-name>
   npm install  # if needed
   npm run lint
   ```

4. **Check README**: `recommended-configs/<config-name>/README.md`
   - Does it list all enabled rules?
   - Are rule counts accurate?
   - Are setup instructions correct?

## Report Format

```
Config: <config-name>
Config valid: Yes/No
Rules enabled: X

Issues found:
- Issue 1
- Issue 2

Recommendations:
- Recommendation 1
```
