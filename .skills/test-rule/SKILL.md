---
name: test-rule
description: Test an ESLint rule to verify it works correctly. Use after creating or modifying a rule.
---

# Test ESLint Rule

Test a rule to verify valid code passes and invalid code triggers errors with correct auto-fix.

## Steps

1. **Find the rule** in `index.js`
   - Locate the rule definition (const ruleName = { create(), meta: {} })
   - Understand what conditions trigger errors
   - Note the error message and auto-fix behavior

2. **Choose test app**
   - `_tests_/react/` for JavaScript rules
   - `_tests_/react-ts-tw/` for TypeScript rules

3. **Create test cases** in the test app's source files
   - Add code that should PASS (valid, no violations)
   - Add code that should FAIL (invalid, triggers errors)

4. **Run the linter**
   ```bash
   cd _tests_/<config-name>
   npm run lint        # Check for violations
   npm run lint:fix    # Verify auto-fix works
   ```

5. **Verify results**
   - Valid code produces no errors
   - Invalid code triggers the expected error message
   - Auto-fix transforms code correctly

## Example

Testing `array-items-per-line` rule:

```javascript
// Should PASS - items on separate lines
const items = [
    "one",
    "two",
    "three",
];

// Should FAIL - too many items per line (triggers error)
const items = ["one", "two", "three", "four", "five"];
```
