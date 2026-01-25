import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import checkFile from "eslint-plugin-check-file";
import codeStyle from "eslint-plugin-code-style";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import perfectionist from "eslint-plugin-perfectionist";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tailwind from "eslint-plugin-tailwindcss";
import globals from "globals";

export default [ // eslint-disable-line
    {
        ignores: [
            ".vite/**/*",
            "build/**",
            "coverage/**/*",
            "dist/**",
            "eslint-rules/**",
            "node_modules/**",
            "public/**/*",
        ],
    },
    js.configs.recommended,
    ...tailwind.configs["flat/recommended"],
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.es2020,
                ...globals.node,
            },
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                    modules: true,
                },
            },
            sourceType: "module",
        },
        plugins: {
            "@stylistic": stylistic,
            "@typescript-eslint": tsPlugin,
            "check-file": checkFile,
            "code-style": codeStyle,
            "import-x": importX,
            "jsx-a11y": jsxA11y,
            perfectionist,
            react,
            "react-hooks": reactHooks,
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,

            // Stylistic rules
            "@stylistic/comma-dangle": ["error", "always-multiline"],
            "@stylistic/comma-spacing": "error",
            "@stylistic/dot-location": "error",
            "@stylistic/function-paren-newline": "off",
            "@stylistic/indent": ["error", 4],
            "@stylistic/jsx-quotes": "error",
            "@stylistic/key-spacing": "error",
            "@stylistic/linebreak-style": "off",
            "@stylistic/multiline-comment-style": ["error", "bare-block"],
            "@stylistic/no-extra-semi": "error",
            "@stylistic/no-multi-spaces": "error",
            "@stylistic/no-multiple-empty-lines": [
                "error",
                {
                    max: 1,
                    maxBOF: 0,
                    maxEOF: 0,
                },
            ],
            "@stylistic/nonblock-statement-body-position": "error",
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/padded-blocks": ["error", "never"],
            "@stylistic/padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    next: "return",
                    prev: "*",
                },
                {
                    blankLine: "always",
                    next: "*",
                    prev: ["const", "let", "var"],
                },
                {
                    blankLine: "always",
                    next: "*",
                    prev: "expression",
                },
                {
                    blankLine: "always",
                    next: "expression",
                    prev: "expression",
                },
            ],
            "@stylistic/quotes": "error",
            "@stylistic/semi": "error",
            "@stylistic/semi-spacing": "error",
            "@stylistic/space-in-parens": "error",
            "@stylistic/space-infix-ops": "error",

            // TypeScript rules
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    fixStyle: "separate-type-imports",
                    prefer: "type-imports",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],

            // Base ESLint rules
            "array-callback-return": "off",
            "arrow-body-style": ["error", "as-needed"],
            camelcase: "off",
            "capitalized-comments": ["error"],

            // Check file rules
            "check-file/filename-naming-convention": [
                "error",
                { "**/*.{js,jsx,ts,tsx}": "KEBAB_CASE" },
                { ignoreMiddleExtensions: true },
            ],
            "check-file/folder-naming-convention": [
                "error",
                { "src/**": "KEBAB_CASE" },
            ],

            // Code style rules
            "code-style/absolute-imports-only": "error",
            "code-style/array-items-per-line": "error",
            "code-style/array-objects-on-new-lines": "error",
            "code-style/arrow-function-block-body": "error",
            "code-style/arrow-function-simple-jsx": "error",
            "code-style/arrow-function-simplify": "error",
            "code-style/assignment-value-same-line": "error",
            "code-style/block-statement-newlines": "error",
            "code-style/comment-format": "error",
            "code-style/component-props-destructure": "error",
            "code-style/component-props-inline-type": "error",
            "code-style/curried-arrow-same-line": "error",
            "code-style/enum-format": "error",
            "code-style/export-format": "error",
            "code-style/function-arguments-format": "error",
            "code-style/function-call-spacing": "error",
            "code-style/function-naming-convention": "error",
            "code-style/function-params-per-line": "error",
            "code-style/hook-callback-format": "error",
            "code-style/hook-deps-per-line": "error",
            "code-style/if-statement-format": "error",
            "code-style/import-format": "error",
            "code-style/import-source-spacing": "error",
            "code-style/index-export-style": "error",
            "code-style/interface-format": "error",
            "code-style/jsx-children-on-new-line": "error",
            "code-style/jsx-closing-bracket-spacing": "error",
            "code-style/jsx-element-child-new-line": "error",
            "code-style/jsx-logical-expression-simplify": "error",
            "code-style/jsx-parentheses-position": "error",
            "code-style/jsx-prop-naming-convention": "error",
            "code-style/jsx-simple-element-one-line": "error",
            "code-style/jsx-string-value-trim": "error",
            "code-style/jsx-ternary-format": "error",
            "code-style/member-expression-bracket-spacing": "error",
            "code-style/module-index-exports": "error",
            "code-style/multiline-if-conditions": "error",
            "code-style/nested-call-closing-brackets": "error",
            "code-style/no-empty-lines-in-function-calls": "error",
            "code-style/no-empty-lines-in-function-params": "error",
            "code-style/no-empty-lines-in-jsx": "error",
            "code-style/no-empty-lines-in-objects": "error",
            "code-style/no-empty-lines-in-switch-cases": "error",
            "code-style/object-property-per-line": "error",
            "code-style/object-property-value-brace": "error",
            "code-style/object-property-value-format": "error",
            "code-style/opening-brackets-same-line": "error",
            "code-style/simple-call-single-line": "error",
            "code-style/single-argument-on-one-line": "error",
            "code-style/string-property-spacing": "error",
            "code-style/type-format": "error",
            "code-style/typescript-definition-location": "error",
            "code-style/variable-naming-convention": "error",

            // General rules
            complexity: "off",
            "consistent-return": "off",
            curly: ["error", "multi-or-nest"],
            "default-case": "off",
            "default-param-last": 0,
            "dot-notation": ["error", { allowKeywords: false }],
            eqeqeq: "error",
            "func-style": ["error", "expression"],

            // Import rules
            "import-x/no-cycle": 0,
            "import-x/no-default-export": "error",
            "import-x/no-named-as-default": 0,
            "import-x/no-named-as-default-member": 0,
            "import-x/no-unresolved": 0,
            "import-x/prefer-default-export": 0,

            // Accessibility rules
            "jsx-a11y/anchor-is-valid": "off",
            "jsx-a11y/click-events-have-key-events": "off",
            "jsx-a11y/html-has-lang": "off",
            "jsx-a11y/label-has-associated-control": "off",
            "jsx-a11y/media-has-caption": "off",
            "jsx-a11y/no-static-element-interactions": "off",
            "jsx-a11y/tabindex-no-positive": "off",

            // Complexity rules
            "max-depth": ["error", 4],
            "max-len": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-nested-callbacks": ["error", 4],
            "max-params": "off",

            // Error prevention rules
            "no-alert": "error",
            "no-await-in-loop": "error",
            "no-cond-assign": "error",
            "no-else-return": "error",
            "no-eq-null": "error",
            "no-fallthrough": "error",
            "no-inline-comments": "error",
            "no-irregular-whitespace": "error",
            "no-lone-blocks": "error",
            "no-lonely-if": "error",
            "no-nested-ternary": "off",
            "no-plusplus": "error",
            "no-redeclare": "off",
            "no-return-assign": "off",
            "no-self-compare": "error",
            "no-unexpected-multiline": "error",
            "no-unused-vars": "off",
            "no-use-before-define": "off",
            "no-useless-escape": "off",
            "no-var": "error",

            // Perfectionist rules
            "perfectionist/sort-array-includes": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-enums": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-interfaces": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-maps": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-object-types": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-objects": [
                "error",
                {
                    ignoreCase: false,
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-sets": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-switch-case": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            "perfectionist/sort-variable-declarations": [
                "error",
                {
                    order: "asc",
                    type: "natural",
                },
            ],
            
            radix: 0,

            // React hooks rules
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/set-state-in-effect": 0,
            "react-hooks/use-memo": 0,

            // React rules
            "react/button-has-type": 0,
            "react/display-name": "off",
            "react/forbid-prop-types": 0,
            "react/function-component-definition": [
                "error",
                {
                    namedComponents: "arrow-function",
                    unnamedComponents: "arrow-function",
                },
            ],
            "react/jsx-closing-bracket-location": ["error", "line-aligned"],
            "react/jsx-closing-tag-location": "error",
            "react/jsx-curly-spacing": ["error",
                {
                    children: true,
                    when: "never",
                },
            ],
            "react/jsx-equals-spacing": "error",
            "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }],
            "react/jsx-first-prop-new-line": ["error", "multiline"],
            "react/jsx-indent": ["error", 4],
            "react/jsx-indent-props": ["error", 4],
            "react/jsx-max-props-per-line": "error",
            "react/jsx-newline": ["error", { prevent: true }],
            "react/jsx-one-expression-per-line": ["error", { allow: "single-child" }],
            "react/jsx-props-no-spreading": "off",
            "react/jsx-sort-props": [
                2,
                {
                    callbacksLast: true,
                    ignoreCase: false,
                    locale: "auto",
                    multiline: "last",
                    noSortAlphabetically: false,
                    shorthandFirst: false,
                    shorthandLast: true,
                },
            ],
            "react/jsx-wrap-multilines": [
                "error",
                {
                    arrow: "parens-new-line",
                    assignment: "parens-new-line",
                    condition: "parens-new-line",
                    declaration: "parens-new-line",
                    logical: "parens-new-line",
                    prop: "parens-new-line",
                    return: "parens-new-line",
                },
            ],
            "react/no-danger": 0,
            "react/prop-types": 0,
            "react/react-in-jsx-scope": "off",
            "react/require-default-props": 0,
            "react/self-closing-comp": "error",

            // Import sort rules
            "simple-import-sort/exports": "error",
            "simple-import-sort/imports": "error",

            "sort-keys": "off",

            // Tailwind rules
            "tailwindcss/classnames-order": "error",
            "tailwindcss/enforces-shorthand": "error",
            "tailwindcss/no-custom-classname": "off",
            "tailwindcss/no-unnecessary-arbitrary-value": "error",

            "valid-typeof": "error",
            "vars-on-top": "error",
        },
        settings: {
            "import-x/extensions": [".js", ".jsx", ".ts", ".tsx"],
            "import-x/parsers": {
                "@typescript-eslint/parser": [".ts", ".tsx"],
            },
            "import-x/resolver": {
                node: {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                    paths: ["src"],
                },
            },
            react: { version: "detect" },
        },
    },
];
