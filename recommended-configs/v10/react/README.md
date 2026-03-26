# ESLint v10 — React Configuration

> **This configuration is for ESLint v10.** Requires ESLint `>= 10.0.0` and Node.js `^20.19.0 || ^22.13.0 || >=24`. For ESLint v9, see the [v9 configuration](../../v9/react/).

Recommended ESLint configuration for React projects using **ESLint v10**.

## Key Differences from v9

| v9 Plugin | v10 Replacement |
|-----------|----------------|
| `eslint-plugin-react` | `@eslint-react/eslint-plugin` |
| `eslint-plugin-react-hooks` | Included in `@eslint-react/eslint-plugin` |
| `eslint-plugin-jsx-a11y` | Removed (no v10-compatible version) |

## Requirements

- ESLint >= 10.0.0
- Node.js ^20.19.0 || ^22.13.0 || >=24

## Plugins Included

| Plugin | Purpose |
|--------|---------|
| `@eslint/js` | ESLint built-in recommended rules |
| `@eslint-react/eslint-plugin` | React rules (replaces eslint-plugin-react for v10) |
| `@stylistic/eslint-plugin` | Code formatting rules |
| `eslint-plugin-check-file` | File and folder naming conventions |
| `eslint-plugin-code-style` | 72 JavaScript-compatible custom formatting rules |
| `eslint-plugin-import-x` | Import/export linting rules |
| `eslint-plugin-perfectionist` | Automatic sorting of code elements |
| `eslint-plugin-simple-import-sort` | Import and export sorting |
| `globals` | Global variable definitions |

## Installation

```bash
npm install --save-dev \
  eslint@^10 \
  @eslint/js \
  @eslint-react/eslint-plugin \
  @stylistic/eslint-plugin \
  globals \
  eslint-plugin-check-file \
  eslint-plugin-code-style \
  eslint-plugin-import-x \
  eslint-plugin-perfectionist \
  eslint-plugin-simple-import-sort
```

Or with a single line:

```bash
npm install --save-dev eslint@^10 @eslint/js @eslint-react/eslint-plugin @stylistic/eslint-plugin globals eslint-plugin-check-file eslint-plugin-code-style eslint-plugin-import-x eslint-plugin-perfectionist eslint-plugin-simple-import-sort
```

## Usage

Copy `eslint.config.js` to your project root, then run:

```bash
eslint src/ --fix
```
