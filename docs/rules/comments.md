# Comment Rules

### `comment-format`

**What it does:** Enforces proper comment formatting:
- Space after `//` in line comments
- Space after `/*` and before `*/` in block comments
- Single-line block comments converted to line comments
- No blank lines between consecutive comments at file top

**Why use it:** Consistent comment formatting improves readability and maintains a clean, professional codebase.

```javascript
// Good — proper spacing
// This is a comment
/* This is a block comment */

/*
 * This is a multi-line
 * block comment
 */

// Good — file-top comments without gaps
// File: utils.js
// Author: John Doe
// License: MIT

// Bad — missing space after //
//This is a comment

// Bad — no space in block comment
/*No space*/

// Bad — single-line block should be line comment
/* This should use // syntax */
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
