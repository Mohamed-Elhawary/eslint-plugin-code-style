import type { CategoryInterface, RuleInterface } from "@/interfaces";

export type { CategoryInterface, RuleInterface, RuleOptionInterface } from "@/interfaces";

export const categoriesRulesData = [
    {
        description: "Array formatting, callback destructuring, and line break rules",
        name: "Arrays",
        rules: [
            {
                badExample: "const result = items.map(({ name, value, id }) => `${name}: ${value}`);",
                description: "When destructuring parameters in array method callbacks, enforces each property on its own line when there are 2 or more properties",
                goodExample: `const result = items.map((
    name,
    value,
}) => \`\${name}: \${value}\`);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "array-callback-destructure",
                options: [],
                rationale: "Improves readability of array transformations by making destructured properties easy to scan vertically",
            },
            {
                badExample: "const weekdays = [\"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Friday\"];",
                description: "Collapse arrays with few items to one line; expand larger arrays with each item on its own line",
                goodExample: `const colors = ["red", "green", "blue"];

const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "array-items-per-line",
                options: [
                    {
                        default: "3",
                        description: "Maximum items to keep on single line",
                        name: "maxItems",
                        type: "integer",
                    },
                ],
                rationale: "Prevents overly long single-line arrays while avoiding unnecessary expansion for simple arrays",
            },
            {
                badExample: "const users = [{ id: 1, name: \"Alice\" }, { id: 2, name: \"Bob\" }];",
                description: "Each object in an array starts on its own line for better visual scanning",
                goodExample: `const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
];`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "array-objects-on-new-lines",
                options: [],
                rationale: "Object literals in arrays are visually complex. Own lines make it easier to scan, compare, and edit",
            },
        ],
        slug: "arrays",
    },
    {
        description: "Arrow function body style, implicit returns, and curried functions",
        name: "Arrow Functions",
        rules: [
            {
                badExample: `const Button = () => <button className="primary">
    Click me
</button>;`,
                description: "Arrow functions with multiline expressions should use block body or wrap in parentheses",
                goodExample: `const Button = () => (
    <button className="primary">
        Click me
    </button>
);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "arrow-function-block-body",
                options: [],
                rationale: "Clear boundaries with braces make the function body obvious",
            },
            {
                badExample: `export const Layout = ({ children }) => (
    <Container>{children}</Container>
);`,
                description: "Collapse arrow functions returning simple single-element JSX to one line",
                goodExample: "export const Layout = ({ children }) => <Container>{children}</Container>;",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "arrow-function-simple-jsx",
                options: [],
                rationale: "Simple component wrappers don't need multi-line formatting",
            },
            {
                badExample: "const double = (x) => { return x * 2; };",
                description: "Convert block body with single return to implicit return",
                goodExample: "const double = (x) => x * 2;",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "arrow-function-simplify",
                options: [],
                rationale: "Implicit returns are more concise and idiomatic JavaScript",
            },
            {
                badExample: `const createAction = (type) =>
    (payload) => ({ type, payload });`,
                description: "Curried arrow functions start on same line as =>, not on new line",
                goodExample: "const createAction = (type) => (payload) => ({ type, payload });",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "curried-arrow-same-line",
                options: [],
                rationale: "Curried functions are easier to read when the chain is visible",
            },
        ],
        slug: "arrow-functions",
    },
    {
        description: "Function call argument formatting, bracket placement, and single-line rules",
        name: "Call Expressions",
        rules: [
            {
                badExample: "setValue(\"email\", \"user@example.com\");",
                description: "Format function call arguments consistently — one per line when threshold is met",
                goodExample: `setValue(
    "email",
    "user@example.com",
);`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "function-arguments-format",
                options: [
                    {
                        default: "2",
                        description: "Minimum arguments to enforce multiline",
                        name: "minArgs",
                        type: "integer",
                    },
                    {
                        default: "true",
                        description: "Skip React hooks",
                        name: "skipHooks",
                        type: "boolean",
                    },
                    {
                        default: "true",
                        description: "Skip calls with single complex argument",
                        name: "skipSingleArg",
                        type: "boolean",
                    },
                ],
                rationale: "Consistent argument formatting makes function calls scannable and diffs clean",
            },
            {
                badExample: `const StyledCard = styled(Card)(({ theme }) => ({
    color: theme.palette.text.primary,
})
);`,
                description: "Chain closing brackets on same line: })); not scattered across lines",
                goodExample: `const StyledCard = styled(Card)(({ theme }) => ({
    color: theme.palette.text.primary,
}));`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "nested-call-closing-brackets",
                options: [],
                rationale: "Scattered closing brackets waste vertical space",
            },
            {
                badExample: `createUser(
    name,

    email,

    password,
);`,
                description: "No empty lines between arguments or after opening/before closing parentheses",
                goodExample: `createUser(
    name,
    email,
    password,
);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "no-empty-lines-in-function-calls",
                options: [],
                rationale: "Empty lines between arguments break visual grouping",
            },
            {
                badExample: `fn(
    { key: value }
);`,
                description: "Opening brackets in function arguments stay on same line as the function call",
                goodExample: `fn({
    key: value,
    other: data,
});`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "opening-brackets-same-line",
                options: [],
                rationale: "Opening brackets on new lines create unnecessary indentation",
            },
            {
                badExample: `const Page = lazy(
    () => import("./Page"),
);`,
                description: "Collapse simple arrow function calls to single line",
                goodExample: "const Page = lazy(() => import(\"./Page\"));",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "simple-call-single-line",
                options: [],
                rationale: "Common patterns like lazy(() => import(...)) don't need multiline",
            },
            {
                badExample: `fetchUser(
    userId,
);`,
                description: "Function calls with a single simple argument stay on one line",
                goodExample: `fetchUser(userId);
console.log(message);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "single-argument-on-one-line",
                options: [],
                rationale: "Single-argument calls don't need multiline formatting",
            },
        ],
        slug: "call-expressions",
    },
    {
        description: "Comment spacing and format consistency",
        name: "Comments",
        rules: [
            {
                badExample: `//This is a comment
/*No space*/`,
                description: "Space after //, space inside /* */, convert single-line blocks to //",
                goodExample: `// This is a comment
/* This is a block comment */`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "comment-format",
                options: [],
                rationale: "Consistent comment formatting improves readability",
            },
        ],
        slug: "comments",
    },
    {
        description: "Component props, folder naming, structure consistency, and SVG icons",
        name: "Components",
        rules: [
            {
                badExample: `export const Button = (props) => (
    <button onClick={props.onClick}>{props.label}</button>
);`,
                description: "Component props must be destructured in the function parameter",
                goodExample: `export const Button = ({ label, onClick }) => (
    <button onClick={onClick}>{label}</button>
);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "component-props-destructure",
                options: [],
                rationale: "Destructured props make it clear what props a component uses",
            },
            {
                badExample: `export const Button = ({ label }: ButtonPropsInterface) => (
    <button>{label}</button>
);`,
                description: "Enforce inline type annotation for component props instead of interface reference",
                goodExample: `export const Button = ({ label } : { label: string }) => (
    <button>{label}</button>
);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: true,
                name: "component-props-inline-type",
                options: [],
                rationale: "Inline types keep prop definitions colocated with the component",
            },
            {
                badExample: `// views/dashboard.tsx
export const Dashboard = () => <div>Dashboard</div>;`,
                description: "Enforce naming based on folder: suffix for views/layouts/pages/providers, camelCase for data/constants",
                goodExample: `// views/dashboard.tsx
export const DashboardView = () => <div>Dashboard</div>;`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "folder-based-naming-convention",
                options: [
                    {
                        default: "\"child-parent\"",
                        description: "Order of folder chain in names",
                        name: "chainOrder",
                        type: "string",
                    },
                    {
                        default: "[]",
                        description: "Per-path chainOrder overrides",
                        name: "files",
                        type: "array",
                    },
                ],
                rationale: "Consistent naming based on folder structure makes purpose immediately clear",
            },
            {
                badExample: `atoms/input.tsx
atoms/calendar/index.tsx
atoms/calendar/helpers.ts`,
                description: "Enforce consistent folder structure (flat vs wrapped) in module folders",
                goodExample: `atoms/input.tsx
atoms/calendar.tsx`,
                isConfigurable: true,
                isFixable: false,
                isTsOnly: false,
                name: "folder-structure-consistency",
                options: [
                    {
                        default: "(built-in list)",
                        description: "Module folders to check",
                        name: "moduleFolders",
                        type: "string[]",
                    },
                    {
                        default: "[]",
                        description: "Additional folders to check",
                        name: "extraModuleFolders",
                        type: "string[]",
                    },
                ],
                rationale: "Mixing flat files and wrapped folders creates inconsistency",
            },
            {
                badExample: "layouts/main-layout.tsx",
                description: "Disallow file/folder names that redundantly include the parent folder name as a suffix",
                goodExample: "layouts/main.tsx",
                isConfigurable: false,
                isFixable: false,
                isTsOnly: false,
                name: "no-redundant-folder-suffix",
                options: [],
                rationale: "The folder already provides context, so the name doesn't need to repeat it",
            },
            {
                badExample: `export const Success = () => (
    <svg><path d="M9 12l2 2 4-4" /></svg>
);`,
                description: "SVG components must end with 'Icon' suffix; 'Icon' suffix components must return SVG",
                goodExample: `export const SuccessIcon = () => (
    <svg><path d="M9 12l2 2 4-4" /></svg>
);`,
                isConfigurable: false,
                isFixable: false,
                isTsOnly: false,
                name: "svg-icon-naming-convention",
                options: [],
                rationale: "Consistent naming makes it clear which components render icons",
            },
        ],
        slug: "components",
    },
    {
        description: "Class method formatting and naming conventions",
        name: "Classes",
        rules: [
            {
                badExample: `class ApiServiceClass{
    getDataHandler (): string{
        return "data";
    }
}`,
                description: "Consistent spacing in class/method definitions: space before {, no space before (",
                goodExample: `class ApiServiceClass {
    getDataHandler(): string {
        return "data";
    }
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "class-method-definition-format",
                options: [],
                rationale: "Consistent formatting makes code more readable",
            },
            {
                badExample: `class ApiService {
    fetch() {}
}`,
                description: "Class declarations must end with 'Class' suffix",
                goodExample: `class ApiServiceClass {
    fetch() {}
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "class-naming-convention",
                options: [],
                rationale: "The 'Class' suffix distinguishes class definitions from components or types",
            },
        ],
        slug: "classes",
    },
    {
        description: "Block formatting, if/else, logical expressions, ternaries, and switch cases",
        name: "Control Flow",
        rules: [
            {
                badExample: "if (condition) { doSomething(); }",
                description: "Newline after { and before } in block statements",
                goodExample: `if (condition) {
    doSomething();
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "block-statement-newlines",
                options: [],
                rationale: "Consistent block formatting improves readability",
            },
            {
                badExample: `if (condition) {
    doSomething();
}
const x = 1;`,
                description: "Empty line required between closing } and next statement",
                goodExample: `if (condition) {
    doSomething();
}

const x = 1;`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "empty-line-after-block",
                options: [],
                rationale: "Visual separation between logical blocks improves readability",
            },
            {
                badExample: `if (status === "loading") {
    return <Loading />;
}
if (status === "error") {
    return <Error />;
}`,
                description: "Empty line between consecutive if blocks, no empty line between single-line if/else",
                goodExample: `if (status === "loading") {
    return <Loading />;
}

if (status === "error") {
    return <Error />;
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "if-else-spacing",
                options: [],
                rationale: "Maintains visual separation between distinct conditional blocks",
            },
            {
                badExample: `if (condition)
{
    doSomething();
}
else
{
    doOther();
}`,
                description: "{ on same line as if/else if, else on same line as }",
                goodExample: `if (condition) {
    doSomething();
} else {
    doOther();
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "if-statement-format",
                options: [],
                rationale: "Follows the most common JavaScript style (K&R / 'one true brace style')",
            },
            {
                badExample: "const err = data.error || data.message || data.status || data.fallback;",
                description: "Logical expressions with more than threshold operands get one per line",
                goodExample: `const err = data.error
    || data.message
    || data.status
    || data.fallback;`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "logical-expression-multiline",
                options: [
                    {
                        default: "3",
                        description: "Maximum operands on a single line",
                        name: "maxOperands",
                        type: "integer",
                    },
                ],
                rationale: "Long logical expressions are hard to read on one line",
            },
            {
                badExample: "if (isAuthenticated && hasPermission && !isExpired && isEnabled) {}",
                description: "If conditions exceeding threshold get one per line",
                goodExample: `if (
    isAuthenticated &&
    hasPermission &&
    !isExpired &&
    isEnabled
) {
    allowAccess();
}`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "multiline-if-conditions",
                options: [
                    {
                        default: "3",
                        description: "Maximum operands to keep on single line",
                        name: "maxOperands",
                        type: "integer",
                    },
                ],
                rationale: "Long conditions are hard to read on one line",
            },
            {
                badExample: `switch (status) {
    case "pending":

        return "Waiting...";

    case "success":
        return "Done!";
}`,
                description: "No empty lines at start of case blocks or between consecutive cases",
                goodExample: `switch (status) {
    case "pending":
        return "Waiting...";
    case "success":
        return "Done!";
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "no-empty-lines-in-switch-cases",
                options: [],
                rationale: "Empty lines inside switch cases create unnecessary gaps",
            },
            {
                badExample: "const style = variant === \"ghost\" || variant === \"danger\" || variant === \"muted\" ? \"transparent\" : \"solid\";",
                description: "Simple ternaries on one line; complex ones (>maxOperands) get multiline formatting",
                goodExample: `const x = a && b ? "yes" : "no";

const style = variant === "ghost"
    || variant === "danger"
    || variant === "muted"
    ? "transparent"
    : "solid";`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "ternary-condition-multiline",
                options: [
                    {
                        default: "2",
                        description: "Maximum condition operands for single-line ternary",
                        name: "maxOperands",
                        type: "integer",
                    },
                ],
                rationale: "Consistent formatting based on complexity, not line length",
            },
        ],
        slug: "control-flow",
    },
    {
        description: "Function call spacing, declaration style, naming conventions, and parameters",
        name: "Functions",
        rules: [
            {
                badExample: `myFunction (arg);
console.log ("message");`,
                description: "No space between function name and opening parenthesis",
                goodExample: `myFunction(arg);
console.log("message");`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "function-call-spacing",
                options: [],
                rationale: "Standard JavaScript convention",
            },
            {
                badExample: `export function getToken(): string | null {
    return getCookie(tokenKey);
}`,
                description: "Convert function declarations to const arrow function expressions",
                goodExample: "export const getToken = (): string | null => getCookie(tokenKey);",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "function-declaration-style",
                options: [],
                rationale: "Auto-fix companion to ESLint's func-style rule",
            },
            {
                badExample: `function handleClick() {}
function getUserData() {}`,
                description: "Functions use camelCase, start with verb, end with Handler suffix",
                goodExample: `function getUserDataHandler() {}
function clickHandler() {}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "function-naming-convention",
                options: [],
                rationale: "Function names should describe actions clearly",
            },
            {
                badExample: `const createUserHandler = async ({ age, email, name }: CreateUserParamsInterface) => {
};`,
                description: "Non-component functions: use typed params, destructure in body",
                goodExample: `const createUserHandler = async (data: CreateUserParamsInterface) => {
    const { age, email, name } = data;
};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "function-object-destructure",
                options: [],
                rationale: "Keeping function signatures clean and short improves readability",
            },
            {
                badExample: `function createUser(name,
    email, password,
    role) {}`,
                description: "When multiline, each parameter on its own line",
                goodExample: `function createUser(
    name,
    email,
    password,
) {}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "function-params-per-line",
                options: [],
                rationale: "Mixed formatting is confusing; one per line is scannable",
            },
            {
                badExample: `function createUser(
    name,

    email,

    role,
) {}`,
                description: "No empty lines between parameters",
                goodExample: `function createUser(
    name,
    email,
    role,
) {}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "no-empty-lines-in-function-params",
                options: [],
                rationale: "Empty lines in parameter lists waste space",
            },
        ],
        slug: "functions",
    },
    {
        description: "React hook callback formatting, dependency arrays, and naming conventions",
        name: "Hooks",
        rules: [
            {
                badExample: "useEffect(() => { fetchData(); }, [userId]);",
                description: "React hooks: callback on new line, deps array on separate line",
                goodExample: `useEffect(
    () => {
        fetchData();
    },
    [userId],
);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "hook-callback-format",
                options: [],
                rationale: "Hooks with callbacks and dependencies are complex; multiline makes them clear",
            },
            {
                badExample: "useEffect(() => {}, [userId, token, refreshToken, apiUrl]);",
                description: "When hook deps exceed threshold, each dependency on its own line",
                goodExample: `useEffect(
    () => {},
    [
        userId,
        token,
        refreshToken,
    ],
);`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "hook-deps-per-line",
                options: [
                    {
                        default: "2",
                        description: "Maximum dependencies on single line",
                        name: "maxDeps",
                        type: "integer",
                    },
                ],
                rationale: "Long dependency arrays are hard to scan and diff",
            },
            {
                badExample: "hooks/super-admins/use-create.ts",
                description: "Hook files in module subfolders must include the module name",
                goodExample: "hooks/super-admins/use-create-super-admin.ts",
                isConfigurable: false,
                isFixable: false,
                isTsOnly: false,
                name: "hook-file-naming-convention",
                options: [],
                rationale: "Files like use-create.ts don't indicate which module they belong to",
            },
            {
                badExample: `// hooks/use-create-super-admin.ts
export const useCreate = () => { ... };`,
                description: "Hook function name must match camelCase of file name",
                goodExample: `// hooks/use-create-super-admin.ts
export const useCreateSuperAdmin = () => { ... };`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "hook-function-naming-convention",
                options: [],
                rationale: "Files exporting mismatched hook names are misleading",
            },
            {
                badExample: `const [loading, setLoading] = useState(false);
const [error, setError] = useState(false);`,
                description: "Boolean useState variables must start with is/has/with/without prefix",
                goodExample: `const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "use-state-naming-convention",
                options: [
                    {
                        default: "[\"is\", \"has\", \"with\", \"without\"]",
                        description: "Replace default prefixes",
                        name: "booleanPrefixes",
                        type: "string[]",
                    },
                    {
                        default: "[]",
                        description: "Add additional prefixes",
                        name: "extendBooleanPrefixes",
                        type: "string[]",
                    },
                ],
                rationale: "Consistent boolean state naming makes code more predictable",
            },
        ],
        slug: "hooks",
    },
    {
        description: "Import/export formatting, absolute paths, index file conventions, and module exports",
        name: "Imports & Exports",
        rules: [
            {
                badExample: `import { Button } from "../../components";
import { useAuth } from "../../../hooks";`,
                description: "Use alias imports from index files, no relative imports across folders",
                goodExample: `import { Button, Input } from "@/components";
import { useAuth } from "@/hooks";`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "absolute-imports-only",
                options: [
                    {
                        default: "\"@/\"",
                        description: "Path alias prefix",
                        name: "aliasPrefix",
                        type: "string",
                    },
                    {
                        default: "[]",
                        description: "Additional importable folders",
                        name: "extraAllowedFolders",
                        type: "string[]",
                    },
                ],
                rationale: "Absolute imports are cleaner than ../../../components",
            },
            {
                badExample: "export { Button, Input, Select, Checkbox, Radio };",
                description: "Collapse short exports to one line; expand larger ones",
                goodExample: `export { Button, Input, Select };

export {
    Button,
    Input,
    Select,
    Checkbox,
};`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "export-format",
                options: [
                    {
                        default: "3",
                        description: "Maximum specifiers on single line",
                        name: "maxSpecifiers",
                        type: "integer",
                    },
                ],
                rationale: "Consistent export formatting improves readability",
            },
            {
                badExample: "import { useState, useEffect, useCallback, useMemo, useRef } from \"react\";",
                description: "Collapse short imports to one line; expand larger ones",
                goodExample: `import { useState } from "react";

import {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "import-format",
                options: [
                    {
                        default: "3",
                        description: "Maximum specifiers on single line",
                        name: "maxSpecifiers",
                        type: "integer",
                    },
                ],
                rationale: "Consistent import formatting makes diffs cleaner",
            },
            {
                badExample: "import { Button } from \" @mui/material\";",
                description: "No leading/trailing spaces inside import path strings",
                goodExample: "import { Button } from \"@mui/material\";",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "import-source-spacing",
                options: [],
                rationale: "Spaces in module paths are almost always typos",
            },
            {
                badExample: `// index.js
export { Button } from "./button";

export { Input } from "./form";`,
                description: "Index files: compact re-exports; regular files: blank lines between exports",
                goodExample: `// index.js
export { Button } from "./button";
export { Input } from "./form";`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "index-export-style",
                options: [
                    {
                        default: "\"shorthand\"",
                        description: "Export style: \"shorthand\" or \"import-export\"",
                        name: "style",
                        type: "string",
                    },
                ],
                rationale: "Index files are aggregators and should be compact",
            },
            {
                badExample: `export const CONSTANT = "value";
export function helper() {}`,
                description: "Index files should only contain imports and re-exports, not code definitions",
                goodExample: `export { Button } from "./Button";
export { helper } from "./utils";`,
                isConfigurable: false,
                isFixable: false,
                isTsOnly: false,
                name: "index-exports-only",
                options: [],
                rationale: "Index files should be barrels that aggregate exports",
            },
            {
                badExample: `const API_URL = "/api";
const MAX_RETRIES = 3;

export { API_URL, MAX_RETRIES };`,
                description: "Enforce inline export declarations instead of grouped export statements",
                goodExample: `export const API_URL = "/api";

export const MAX_RETRIES = 3;`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "inline-export-declaration",
                options: [
                    {
                        default: "false",
                        description: "Allow grouped exports",
                        name: "allowGrouped",
                        type: "boolean",
                    },
                ],
                rationale: "Inline exports make it clear which declarations are public",
            },
            {
                badExample: `// components/index.js (missing Input export)
export { Button } from "./Button";`,
                description: "Index files must export all folder contents",
                goodExample: `// components/index.js
export { Button } from "./Button";
export { Input } from "./Input";`,
                isConfigurable: true,
                isFixable: false,
                isTsOnly: false,
                name: "module-index-exports",
                options: [
                    {
                        default: "[]",
                        description: "Additional module folders to check",
                        name: "extraModuleFolders",
                        type: "string[]",
                    },
                    {
                        default: "[]",
                        description: "Additional file patterns to skip",
                        name: "extraIgnorePatterns",
                        type: "string[]",
                    },
                ],
                rationale: "Ensures proper module boundaries and folder-level imports",
            },
        ],
        slug: "imports-exports",
    },
    {
        description: "JSX formatting, className handling, children, logical expressions, and ternaries",
        name: "JSX",
        rules: [
            {
                badExample: "<div className={`${className} flex items-center gap-4`} />",
                description: "Dynamic expressions in className must be at the end of class strings",
                goodExample: "<div className={`flex items-center gap-4 ${className}`} />",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "classname-dynamic-at-end",
                options: [],
                rationale: "Static classes should come first for consistent Tailwind ordering",
            },
            {
                badExample: "<div className=\"flex items-center justify-center rounded-lg p-4 font-bold\" />",
                description: "Long className strings broken into multiple lines",
                goodExample: `<div
    className="
        flex
        items-center
        justify-center
        rounded-lg
        p-4
    "
/>`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "classname-multiline",
                options: [
                    {
                        default: "80",
                        description: "Maximum line length for class strings",
                        name: "maxLength",
                        type: "integer",
                    },
                ],
                rationale: "Long class strings are hard to read and review",
            },
            {
                badExample: "<div className=\"flex  items-center   gap-4\" />",
                description: "No extra/leading/trailing spaces in class strings",
                goodExample: "<div className=\"flex items-center gap-4\" />",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "classname-no-extra-spaces",
                options: [],
                rationale: "Extra spaces are usually unintentional",
            },
            {
                badExample: "const btn = \"hover:bg-blue-600 bg-blue-500 flex items-center\";",
                description: "Tailwind class ordering in variables, objects, and return statements",
                goodExample: "const btn = \"flex items-center bg-blue-500 hover:bg-blue-600\";",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "classname-order",
                options: [],
                rationale: "Complements tailwindcss/classnames-order for non-JSX contexts",
            },
            {
                badExample: "<Container><Header /><Content /><Footer /></Container>",
                description: "Multiple JSX children: each on own line",
                goodExample: `<Container>
    <Header />
    <Content />
    <Footer />
</Container>`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-children-on-new-line",
                options: [],
                rationale: "Individual lines make the component structure clear",
            },
            {
                badExample: `<Button / >
<Input type="text" / >`,
                description: "No space before > or /> in JSX tags",
                goodExample: `<Button />
<Input type="text" />`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-closing-bracket-spacing",
                options: [],
                rationale: "Standard JSX convention",
            },
            {
                badExample: "<Button><Icon name=\"check\" /></Button>",
                description: "Nested JSX elements on new lines; text children can stay inline",
                goodExample: `<Button>
    <Icon name="check" />
</Button>`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-element-child-new-line",
                options: [],
                rationale: "New lines make nesting visible",
            },
            {
                badExample: "{(isLoading) && (<Spinner />)}",
                description: "Remove unnecessary parens around conditions and JSX in logical expressions",
                goodExample: "{isLoading && <Spinner />}",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-logical-expression-simplify",
                options: [],
                rationale: "Extra parentheses add visual noise",
            },
            {
                badExample: `const Card = () =>
    (
        <div className="card">
            <h1>Title</h1>
        </div>
    );`,
                description: "Opening ( for multiline JSX on same line as return/=>",
                goodExample: `const Card = () => (
    <div className="card">
        <h1>Title</h1>
    </div>
);`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-parentheses-position",
                options: [],
                rationale: "Parenthesis on new line wastes space",
            },
            {
                badExample: "<Button on_click={handler} is_disabled={false} />",
                description: "Props: camelCase for regular, kebab-case for data-*/aria-*",
                goodExample: `<Button onClick={handleClick} isDisabled={false} />
<Button data-testid="submit" aria-label="Submit" />`,
                isConfigurable: false,
                isFixable: false,
                isTsOnly: false,
                name: "jsx-prop-naming-convention",
                options: [],
                rationale: "Consistent prop naming follows React conventions",
            },
            {
                badExample: `<Button>
    {buttonText}
</Button>`,
                description: "Collapse simple JSX with single text/expression child to one line",
                goodExample: `<Button>{buttonText}</Button>
<Title>Welcome</Title>`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-simple-element-one-line",
                options: [],
                rationale: "Simple elements don't need multi-line formatting",
            },
            {
                badExample: "<Button className=\" primary \" />",
                description: "No leading/trailing whitespace inside JSX string attribute values",
                goodExample: "<Button className=\"primary\" />",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-string-value-trim",
                options: [],
                rationale: "Whitespace in attribute values is usually unintentional",
            },
            {
                badExample: `{isLoading
    ? <Spinner />
    : <Content />}`,
                description: "Simple ternaries on one line; complex branches get parens with indentation",
                goodExample: `{isLoading ? <Spinner /> : <Content />}

{isLoading ? (
    <Spinner size="large" />
) : (
    <Content>
        <Header />
    </Content>
)}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "jsx-ternary-format",
                options: [],
                rationale: "Consistent ternary formatting makes conditional rendering predictable",
            },
            {
                badExample: `<div>

    <Header />

    <Content />
</div>`,
                description: "No empty lines between children or after opening/before closing tags",
                goodExample: `<div>
    <Header />
    <Content />
    <Footer />
</div>`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "no-empty-lines-in-jsx",
                options: [],
                rationale: "Empty lines inside JSX break the component's visual structure",
            },
        ],
        slug: "jsx",
    },
    {
        description: "Object property formatting, empty lines, and string property spacing",
        name: "Objects",
        rules: [
            {
                badExample: `const user = {
    name: "John",

    email: "john@example.com",
};`,
                description: "No empty lines between properties or after {/before }",
                goodExample: `const user = {
    name: "John",
    email: "john@example.com",
};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "no-empty-lines-in-objects",
                options: [],
                rationale: "Empty lines inside objects break visual grouping",
            },
            {
                badExample: "const point = { x: 10, y: 20 };",
                description: "Collapse objects with 1 property; expand larger objects",
                goodExample: `const point = { x: 10 };

const point = {
    x: 10,
    y: 20,
};`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: false,
                name: "object-property-per-line",
                options: [
                    {
                        default: "2",
                        description: "Minimum properties to trigger expansion",
                        name: "minProperties",
                        type: "integer",
                    },
                ],
                rationale: "Multiple properties need expansion for readability",
            },
            {
                badExample: `const config = {
    server:
    {
        host: "localhost",
    },
};`,
                description: "Opening { of object value on same line as :, not on new line",
                goodExample: `const config = {
    server: {
        host: "localhost",
    },
};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "object-property-value-brace",
                options: [],
                rationale: "Braces on new lines waste vertical space",
            },
            {
                badExample: `const user = {
    name:
        "John",
    age:
        30,
};`,
                description: "Simple property values on same line as :",
                goodExample: `const user = {
    name: "John",
    age: 30,
};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "object-property-value-format",
                options: [],
                rationale: "Values on new lines after : waste space",
            },
            {
                badExample: `const styles = {
    " & a": { color: "red" },
};`,
                description: "No leading/trailing whitespace inside string property keys",
                goodExample: `const styles = {
    "& a": { color: "red" },
};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "string-property-spacing",
                options: [],
                rationale: "Whitespace in property keys is usually unintentional",
            },
        ],
        slug: "objects",
    },
    {
        description: "Assignment values and bracket spacing",
        name: "Spacing",
        rules: [
            {
                badExample: `const name =
    "John";
const config =
    {
        host: "localhost",
    };`,
                description: "Assignment values start on same line as =",
                goodExample: `const name = "John";
const config = {
    host: "localhost",
};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "assignment-value-same-line",
                options: [],
                rationale: "Breaking after = creates awkward formatting",
            },
            {
                badExample: `const value = arr[ 0 ];
const name = obj[ key ];`,
                description: "No spaces inside brackets in computed member expressions",
                goodExample: `const value = arr[0];
const name = obj[key];`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "member-expression-bracket-spacing",
                options: [],
                rationale: "Consistent with JavaScript conventions",
            },
        ],
        slug: "spacing",
    },
    {
        description: "Component and hook code ordering",
        name: "React",
        rules: [
            {
                badExample: `const BadComponent = ({ title }) => {
    useEffect(() => {}, []);
    const [count, setCount] = useState(0);
    return <div>{title}</div>;
};`,
                description: "Enforce consistent ordering in components: refs > state > redux > router > context > hooks > derived > memo > callback > handlers > effects > return",
                goodExample: `const UserDashboard = ({ title }) => {
    const inputRef = useRef(null);
    const [count, setCount] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data } = useFetchData();
    const isReady = !!data;
    const resetHandler = () => setCount(0);
    useEffect(() => {}, []);
    return <div>{title}</div>;
};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "react-code-order",
                options: [],
                rationale: "A consistent code structure makes components predictable and easier to navigate",
            },
        ],
        slug: "react",
    },
    {
        description: "String centralization and hardcoded string prevention",
        name: "Strings",
        rules: [
            {
                badExample: `<button>Submit Form</button>
<span>Something went wrong</span>`,
                description: "Enforce importing strings from constants/strings modules instead of hardcoding",
                goodExample: `import { BUTTON_LABEL } from "@/constants";

<button>{BUTTON_LABEL}</button>`,
                isConfigurable: true,
                isFixable: false,
                isTsOnly: false,
                name: "no-hardcoded-strings",
                options: [
                    {
                        default: "[]",
                        description: "Additional JSX attributes to ignore",
                        name: "extraIgnoreAttributes",
                        type: "string[]",
                    },
                    {
                        default: "[]",
                        description: "Regex patterns for strings to ignore",
                        name: "ignorePatterns",
                        type: "string[]",
                    },
                ],
                rationale: "Centralized strings are easier to maintain, translate, and keep consistent",
            },
        ],
        slug: "strings",
    },
    {
        description: "TypeScript enum, interface, type formatting, and definition organization",
        name: "TypeScript",
        rules: [
            {
                badExample: `export enum Status {
    active = "active",
    inactive = "inactive";
}`,
                description: "Enforce enum naming (PascalCase + Enum suffix), UPPER_CASE members, trailing commas",
                goodExample: `export enum StatusEnum {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: true,
                name: "enum-format",
                options: [],
                rationale: "Consistent enum naming makes enums instantly recognizable",
            },
            {
                badExample: "const variant = \"primary\"; // typed as ButtonVariantType",
                description: "Use enum values instead of string literals for variables typed with *Type",
                goodExample: "const variant = ButtonVariantEnum.PRIMARY;",
                isConfigurable: false,
                isFixable: true,
                isTsOnly: true,
                name: "enum-type-enforcement",
                options: [],
                rationale: "Enum values provide type safety, autocompletion, and prevent typos",
            },
            {
                badExample: `export interface User {
    Email: string;
    ID: string;
}`,
                description: "Enforce interface naming (PascalCase + Interface suffix), camelCase properties, commas",
                goodExample: `export interface UserInterface {
    email: string,
    id: string,
    name: string,
}`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: true,
                name: "interface-format",
                options: [],
                rationale: "Consistent interface naming makes interfaces instantly recognizable",
            },
            {
                badExample: "const Button = ({ variant }: { variant?: \"primary\" | \"muted\" | \"danger\" }) => {};",
                description: "Inline union types in function params should be extracted to named types",
                goodExample: `// types.ts
export type ButtonVariantType = "primary" | "muted" | "danger";

// Button.tsx
import { ButtonVariantType } from "./types";`,
                isConfigurable: true,
                isFixable: false,
                isTsOnly: true,
                name: "no-inline-type-definitions",
                options: [
                    {
                        default: "2",
                        description: "Max union members before requiring extraction",
                        name: "maxUnionMembers",
                        type: "integer",
                    },
                    {
                        default: "50",
                        description: "Max character length before requiring extraction",
                        name: "maxLength",
                        type: "integer",
                    },
                ],
                rationale: "Complex inline types make function signatures hard to read",
            },
            {
                badExample: `interface ButtonPropsInterface {
    disabled: boolean,
    loading: boolean,
    click: () => void,
}`,
                description: "Boolean props start with is/has/with/without, callbacks start with on",
                goodExample: `interface ButtonPropsInterface {
    isDisabled: boolean,
    isLoading: boolean,
    onClick: () => void,
}`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: true,
                name: "prop-naming-convention",
                options: [
                    {
                        default: "[]",
                        description: "Add to default boolean prefixes",
                        name: "extendBooleanPrefixes",
                        type: "string[]",
                    },
                    {
                        default: "\"on\"",
                        description: "Required prefix for callback props",
                        name: "callbackPrefix",
                        type: "string",
                    },
                ],
                rationale: "Consistent prop naming makes props self-documenting",
            },
            {
                badExample: `const name : string = "John";
const items:string [] = [];`,
                description: "No space before colon, one space after colon, no space before generics",
                goodExample: `const name: string = "John";
const items: string[] = [];
const data: Array<number> = [];`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: true,
                name: "type-annotation-spacing",
                options: [],
                rationale: "Consistent type annotation spacing follows TypeScript conventions",
            },
            {
                badExample: `export type User = {
    Email: string;
    ID: string;
};`,
                description: "Enforce type naming (PascalCase + Type suffix), properties, union formatting",
                goodExample: `export type UserType = {
    email: string,
    id: string,
    name: string,
};

export type ButtonVariantType =
    "danger"
    | "ghost"
    | "link"
    | "muted"
    | "primary";`,
                isConfigurable: true,
                isFixable: true,
                isTsOnly: true,
                name: "type-format",
                options: [
                    {
                        default: "5",
                        description: "Minimum union members for multiline format",
                        name: "minUnionMembersForMultiline",
                        type: "integer",
                    },
                ],
                rationale: "Consistent type naming makes types instantly recognizable",
            },
            {
                badExample: `// src/components/user-card.tsx
interface UserProps { ... } // Should be in interfaces/`,
                description: "Enforce TypeScript definitions to be in designated folders (interfaces/, types/, enums/)",
                goodExample: `// src/interfaces/user.ts
export interface UserInterface { ... }

// src/types/config.ts
export type ConfigType = { ... }`,
                isConfigurable: true,
                isFixable: false,
                isTsOnly: true,
                name: "typescript-definition-location",
                options: [],
                rationale: "Separating definitions by category makes them easier to find and maintain",
            },
        ],
        slug: "typescript",
    },
    {
        description: "Variable naming conventions for camelCase, PascalCase, and hooks",
        name: "Variables",
        rules: [
            {
                badExample: `const user_name = "John";
const MAX_RETRIES = 3;
const userProfile = () => <div />;`,
                description: "camelCase for variables, PascalCase for components, use prefix for hooks",
                goodExample: `const userName = "John";
const UserProfile = () => <div />;
const useAuth = () => {};`,
                isConfigurable: false,
                isFixable: true,
                isTsOnly: false,
                name: "variable-naming-convention",
                options: [],
                rationale: "Consistent naming makes code predictable",
            },
        ],
        slug: "variables",
    },
];

// eslint-disable-next-line code-style/folder-based-naming-convention -- function Handler suffix takes precedence
export const getAllRulesRulesDataHandler = (): RuleInterface[] => categoriesRulesData.flatMap(({ rules }) => rules);

// eslint-disable-next-line code-style/folder-based-naming-convention -- function Handler suffix takes precedence
export const getCategoryBySlugRulesDataHandler = (targetSlug: string): CategoryInterface | undefined => categoriesRulesData.find(({ slug }) => slug === targetSlug);

// eslint-disable-next-line code-style/folder-based-naming-convention -- function Handler suffix takes precedence
export const getRuleByNameRulesDataHandler = (targetName: string): {
    category: CategoryInterface,
    rule: RuleInterface,
} | undefined => {
    for (const currentCategoryRulesData of categoriesRulesData) {
        const matchedRulesData = currentCategoryRulesData.rules.find(({ name }) => name === targetName);

        if (matchedRulesData) {
            return {
                category: currentCategoryRulesData,
                rule: matchedRulesData,
            };
        }
    }

    return undefined;
};

export const totalRulesData = 81;

export const fixableRulesData = 71;

export const configurableRulesData = 20;

export const reportOnlyRulesData = 10;

export const tsOnlyRulesData = 9;
