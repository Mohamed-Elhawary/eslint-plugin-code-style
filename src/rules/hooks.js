/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Hook Callback Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce consistent formatting for React hooks like useEffect,
 *   useCallback, useMemo with callback and dependency array.
 *
 * ✓ Good:
 *   useEffect(
 *       () => { doSomething(); },
 *       [dep1, dep2],
 *   );
 *
 * ✗ Bad:
 *   useEffect(() => { doSomething(); }, [dep1, dep2]);
 */
const hookCallbackFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Hooks that take callback + deps array pattern
        const hooksWithDeps = [
            "useEffect",
            "useLayoutEffect",
            "useCallback",
            "useMemo",
            "useImperativeHandle",
        ];

        return {
            CallExpression(node) {
                const { callee } = node;

                // Check if this is a hook call
                if (callee.type !== "Identifier" || !hooksWithDeps.includes(callee.name)) return;

                const args = node.arguments;

                if (args.length === 0) return;

                const firstArg = args[0];

                // First argument should be arrow function or function expression
                if (firstArg.type !== "ArrowFunctionExpression" && firstArg.type !== "FunctionExpression") return;

                const openParen = sourceCode.getTokenAfter(callee);

                if (!openParen || openParen.value !== "(") return;

                // Check 1: Arrow function should start on new line after (
                if (openParen.loc.end.line === firstArg.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], firstArg.range[0]],
                            "\n        ",
                        ),
                        message: `${callee.name} callback should start on a new line after opening parenthesis`,
                        node: firstArg,
                    });
                }

                // Check 2: If there's a second argument (deps array), it should be on its own line
                if (args.length >= 2) {
                    const secondArg = args[1];
                    const commaAfterFirst = sourceCode.getTokenAfter(firstArg);

                    if (commaAfterFirst && commaAfterFirst.value === ",") {
                        // Deps array should be on new line after the comma
                        if (commaAfterFirst.loc.end.line === secondArg.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [commaAfterFirst.range[1], secondArg.range[0]],
                                    "\n        ",
                                ),
                                message: `${callee.name} dependency array should be on a new line`,
                                node: secondArg,
                            });
                        }
                    }

                    // Check 3: Closing paren should be on its own line after deps array
                    const lastArg = args[args.length - 1];
                    let closeParen = sourceCode.getTokenAfter(lastArg);

                    // Skip trailing comma
                    if (closeParen && closeParen.value === ",") {
                        closeParen = sourceCode.getTokenAfter(closeParen);
                    }

                    if (closeParen && closeParen.value === ")") {
                        if (lastArg.loc.end.line === closeParen.loc.start.line) {
                            // Get the token before closeParen to check for trailing comma
                            const tokenBeforeClose = sourceCode.getTokenBefore(closeParen);
                            const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                            if (!hasTrailingComma) {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [lastArg.range[1], closeParen.range[0]],
                                        ",\n    ",
                                    ),
                                    message: `${callee.name} closing parenthesis should be on a new line`,
                                    node: closeParen,
                                });
                            } else {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [tokenBeforeClose.range[1], closeParen.range[0]],
                                        "\n    ",
                                    ),
                                    message: `${callee.name} closing parenthesis should be on a new line`,
                                    node: closeParen,
                                });
                            }
                        }
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent formatting for React hooks (useEffect, useCallback, etc.)" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Hook Deps Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   React hook dependency arrays with more than maxDeps dependencies
 *   should have each dependency on its own line.
 *
 * Options:
 *   { maxDeps: 2 } - Maximum dependencies on single line (default: 2)
 *
 * ✓ Good:
 *   useEffect(() => {}, [dep1, dep2])
 *   useEffect(() => {}, [
 *       dep1,
 *       dep2,
 *       dep3,
 *   ])
 *
 * ✗ Bad:
 *   useEffect(() => {}, [dep1, dep2, dep3, dep4])
 */
const hookDepsPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxDeps = options.maxDeps !== undefined ? options.maxDeps : 2;

        const hookNames = [
            "useEffect",
            "useCallback",
            "useMemo",
            "useLayoutEffect",
            "useImperativeHandle",
        ];

        const checkHookCallHandler = (node) => {
            // Skip non-hook calls
            if (node.callee.type !== "Identifier" || !hookNames.includes(node.callee.name)) {
                return;
            }

            // Get the dependencies array (last argument for hooks)
            const depsArg = node.arguments[node.arguments.length - 1];

            // Skip if no deps array or not an array
            if (!depsArg || depsArg.type !== "ArrayExpression") {
                return;
            }

            const elements = depsArg.elements.filter(Boolean);

            if (elements.length === 0) return;

            const openBracket = sourceCode.getFirstToken(depsArg);
            const closeBracket = sourceCode.getLastToken(depsArg);
            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            // If maxDeps or fewer dependencies, they should be on the same line
            if (elements.length <= maxDeps) {
                const isMultiLine = openBracket.loc.end.line !== closeBracket.loc.start.line;

                if (isMultiLine) {
                    const elementsText = elements.map((el) => sourceCode.getText(el)).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], closeBracket.range[0]],
                            elementsText,
                        ),
                        message: `Hook dependencies with ≤${maxDeps} items should be single line: [dep1, dep2]. Multi-line only for >${maxDeps} dependencies`,
                        node: depsArg,
                    });
                }

                return;
            }

            // More than maxDeps dependencies - each on its own line
            const elementIndent = " ".repeat(openBracket.loc.start.column + 4);
            const bracketIndent = " ".repeat(openBracket.loc.start.column);

            if (openBracket.loc.end.line === firstElement.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBracket.range[1], firstElement.range[0]],
                        "\n" + elementIndent,
                    ),
                    message: `First dependency should be on its own line when more than ${maxDeps}`,
                    node: firstElement,
                });
            }

            if (closeBracket.loc.start.line === lastElement.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastElement.range[1], closeBracket.range[0]],
                        ",\n" + bracketIndent,
                    ),
                    message: `Closing bracket should be on its own line when more than ${maxDeps} dependencies`,
                    node: closeBracket,
                });
            }

            for (let i = 0; i < elements.length - 1; i += 1) {
                const current = elements[i];
                const next = elements[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(current);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + elementIndent,
                        ),
                        message: `Each dependency should be on its own line when more than ${maxDeps}`,
                        node: next,
                    });
                }
            }
        };

        return { CallExpression: checkHookCallHandler };
    },
    meta: {
        docs: { description: "Enforce each hook dependency on its own line when exceeding threshold (default: >2)" },
        fixable: "whitespace",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxDeps: {
                        default: 2,
                        description: "Maximum dependencies to keep on single line (default: 2)",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: useState Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When useState holds a boolean value, the state variable name
 *   should start with a valid boolean prefix (is, has, with, without).
 *
 * ✓ Good:
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [hasError, setHasError] = useState(false);
 *   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAuth());
 *
 * ✗ Bad:
 *   const [loading, setLoading] = useState(false);
 *   const [authenticated, setAuthenticated] = useState<boolean>(true);
 *   const [error, setError] = useState<boolean>(false);
 */
const useStateNamingConvention = {
    create(context) {
        const options = context.options[0] || {};

        // Boolean prefixes handling (same pattern as prop-naming-convention)
        const defaultBooleanPrefixes = ["is", "has", "with", "without"];
        const booleanPrefixes = options.booleanPrefixes || [
            ...defaultBooleanPrefixes,
            ...(options.extendBooleanPrefixes || []),
        ];

        const allowPastVerbBoolean = options.allowPastVerbBoolean || false;
        const allowContinuousVerbBoolean = options.allowContinuousVerbBoolean || false;

        // Pattern to check if name starts with valid boolean prefix followed by capital letter
        const booleanPrefixPattern = new RegExp(`^(${booleanPrefixes.join("|")})[A-Z]`);

        // Pattern for past verb booleans (ends with -ed: disabled, selected, checked, etc.)
        const pastVerbPattern = /^[a-z]+ed$/;

        // Pattern for continuous verb booleans (ends with -ing: loading, saving, etc.)
        const continuousVerbPattern = /^[a-z]+ing$/;

        // Words that suggest "has" prefix instead of "is"
        const hasKeywords = [
            "children", "content", "data", "error", "errors", "items",
            "permission", "permissions", "value", "values",
        ];

        // Convert name to appropriate boolean prefix
        const toBooleanNameHandler = (name) => {
            const lowerName = name.toLowerCase();
            const prefix = hasKeywords.some((k) => lowerName.includes(k)) ? "has" : "is";

            return prefix + name[0].toUpperCase() + name.slice(1);
        };

        // Convert setter name based on new state name
        const toSetterNameHandler = (stateName) => "set" + stateName[0].toUpperCase() + stateName.slice(1);

        // Check if name is a valid boolean state name
        const isValidBooleanNameHandler = (name) => {
            // Starts with valid prefix
            if (booleanPrefixPattern.test(name)) return true;

            // Allow past verb booleans if option is enabled (disabled, selected, checked, etc.)
            if (allowPastVerbBoolean && pastVerbPattern.test(name)) return true;

            // Allow continuous verb booleans if option is enabled (loading, saving, etc.)
            if (allowContinuousVerbBoolean && continuousVerbPattern.test(name)) return true;

            return false;
        };

        // Check if the useState initial value indicates boolean
        const isBooleanValueHandler = (arg) => {
            if (!arg) return false;

            // Direct boolean literal: useState(false) or useState(true)
            if (arg.type === "Literal" && typeof arg.value === "boolean") return true;

            // Arrow function returning boolean: useState(() => checkAuth())
            // We can't reliably determine return type, so skip these unless typed
            return false;
        };

        // Check if the useState has boolean type annotation
        const hasBooleanTypeAnnotationHandler = (node) => {
            // useState<boolean>(...) or useState<boolean | null>(...)
            if (node.typeParameters && node.typeParameters.params && node.typeParameters.params.length > 0) {
                const typeParam = node.typeParameters.params[0];

                if (typeParam.type === "TSBooleanKeyword") return true;

                // Check union types: boolean | null, boolean | undefined
                if (typeParam.type === "TSUnionType") {
                    return typeParam.types.some((t) => t.type === "TSBooleanKeyword");
                }
            }

            return false;
        };

        return {
            CallExpression(node) {
                // Check if it's a useState call
                if (node.callee.type !== "Identifier" || node.callee.name !== "useState") return;

                // Check if it's in a variable declaration with array destructuring
                if (!node.parent || node.parent.type !== "VariableDeclarator") return;
                if (!node.parent.id || node.parent.id.type !== "ArrayPattern") return;

                const arrayPattern = node.parent.id;

                // Must have at least the state variable (first element)
                if (!arrayPattern.elements || arrayPattern.elements.length < 1) return;

                const stateElement = arrayPattern.elements[0];
                const setterElement = arrayPattern.elements[1];

                if (!stateElement || stateElement.type !== "Identifier") return;

                const stateName = stateElement.name;

                // Check if this is a boolean useState
                const isBooleanState = (node.arguments && node.arguments.length > 0 && isBooleanValueHandler(node.arguments[0]))
                    || hasBooleanTypeAnnotationHandler(node);

                if (!isBooleanState) return;

                // Check if state name follows boolean naming convention
                if (isValidBooleanNameHandler(stateName)) return;

                const suggestedStateName = toBooleanNameHandler(stateName);
                const suggestedSetterName = toSetterNameHandler(suggestedStateName);

                context.report({
                    fix(fixer) {
                        const fixes = [];
                        const scope = context.sourceCode
                            ? context.sourceCode.getScope(node)
                            : context.getScope();

                        // Helper to find variable in scope
                        const findVariableHandler = (s, name) => {
                            const v = s.variables.find((variable) => variable.name === name);

                            if (v) return v;
                            if (s.upper) return findVariableHandler(s.upper, name);

                            return null;
                        };

                        // Fix state variable
                        const stateVar = findVariableHandler(scope, stateName);
                        const stateFixedRanges = new Set();

                        // Fix definition first
                        const stateDefRangeKey = `${stateElement.range[0]}-${stateElement.range[1]}`;

                        stateFixedRanges.add(stateDefRangeKey);
                        fixes.push(fixer.replaceText(stateElement, suggestedStateName));

                        // Fix all usages
                        if (stateVar) {
                            stateVar.references.forEach((ref) => {
                                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                if (!stateFixedRanges.has(rangeKey)) {
                                    stateFixedRanges.add(rangeKey);
                                    fixes.push(fixer.replaceText(ref.identifier, suggestedStateName));
                                }
                            });
                        }

                        // Fix setter if exists
                        if (setterElement && setterElement.type === "Identifier") {
                            const setterName = setterElement.name;
                            const setterVar = findVariableHandler(scope, setterName);
                            const setterFixedRanges = new Set();

                            // Fix definition first
                            const setterDefRangeKey = `${setterElement.range[0]}-${setterElement.range[1]}`;

                            setterFixedRanges.add(setterDefRangeKey);
                            fixes.push(fixer.replaceText(setterElement, suggestedSetterName));

                            // Fix all usages
                            if (setterVar) {
                                setterVar.references.forEach((ref) => {
                                    const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                    if (!setterFixedRanges.has(rangeKey)) {
                                        setterFixedRanges.add(rangeKey);
                                        fixes.push(fixer.replaceText(ref.identifier, suggestedSetterName));
                                    }
                                });
                            }
                        }

                        return fixes;
                    },
                    message: `Boolean state "${stateName}" should start with a valid prefix (${booleanPrefixes.join(", ")}). Use "${suggestedStateName}" instead.`,
                    node: stateElement,
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce boolean useState variables to start with is/has/with/without prefix" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    allowContinuousVerbBoolean: {
                        default: false,
                        description: "Allow continuous verb boolean state without prefix (e.g., loading, saving)",
                        type: "boolean",
                    },
                    allowPastVerbBoolean: {
                        default: false,
                        description: "Allow past verb boolean state without prefix (e.g., disabled, selected)",
                        type: "boolean",
                    },
                    booleanPrefixes: {
                        description: "Replace default boolean prefixes entirely",
                        items: { type: "string" },
                        type: "array",
                    },
                    extendBooleanPrefixes: {
                        default: [],
                        description: "Add additional prefixes to the defaults (is, has, with, without)",
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Hook File Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce naming conventions for hook files inside hooks/ module
 *   subfolders. Hook files must include the module name from their
 *   parent folder and follow specific patterns for verb hooks vs
 *   list hooks.
 *
 * ✓ Good:
 *   hooks/super-admins/use-create-super-admin.ts
 *   hooks/super-admins/use-super-admins-list.ts
 *   hooks/dashboard/super-admins/use-get-dashboard-super-admin.ts
 *   hooks/dashboard/super-admins/use-dashboard-super-admins-list.ts
 *
 * ✗ Bad:
 *   hooks/super-admins/use-create.ts  (missing module name)
 *   hooks/super-admins/use-get.ts     (missing module name)
 */
const hookFileNamingConvention = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const parts = normalizedFilename.split("/");
        const fileWithExt = parts[parts.length - 1];
        const baseName = fileWithExt.replace(/\.(jsx?|tsx?)$/, "");

        // Skip index files and non-use- files
        if (baseName === "index" || !baseName.startsWith("use-")) return {};

        // Find the hooks/ folder in the path
        const hooksIndex = parts.lastIndexOf("hooks");

        if (hooksIndex === -1) return {};

        // Folders between hooks/ and the file
        const foldersAfterHooks = parts.slice(hooksIndex + 1, parts.length - 1);

        // Skip files directly in hooks/ (no module subfolder)
        if (foldersAfterHooks.length === 0) return {};

        // Grouping folders to exclude from chain
        const groupingFolders = new Set(["shared", "common", "ui", "base", "general", "core"]);

        // Skip files in grouping folders (e.g., hooks/shared/use-something.ts)
        if (foldersAfterHooks.length === 1 && groupingFolders.has(foldersAfterHooks[0])) return {};

        // Module folder = immediate parent (last folder after hooks/)
        const moduleFolder = foldersAfterHooks[foldersAfterHooks.length - 1];

        // Skip if module folder is a grouping folder
        if (groupingFolders.has(moduleFolder)) return {};

        // Chain = folders between hooks/ and module folder, excluding grouping folders
        const chainFolders = foldersAfterHooks.slice(0, -1).filter((f) => !groupingFolders.has(f));
        const chain = chainFolders.join("-");

        // Singularize: convert folder name to singular form (same logic as noRedundantFolderSuffix)
        const singularizeHandler = (word) => {
            if (word.endsWith("ies")) return word.slice(0, -3) + "y";
            if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes")) return word.slice(0, -2);
            if (word.endsWith("s")) return word.slice(0, -1);

            return word;
        };

        const moduleSingular = singularizeHandler(moduleFolder);
        const modulePlural = moduleFolder;

        // Check if this is a list hook (ends with -list)
        const isList = baseName.endsWith("-list");

        let expectedPattern;
        let message;

        if (isList) {
            // List hooks: use-{chain}-{module-plural}-list
            expectedPattern = chain
                ? `use-${chain}-${modulePlural}-list`
                : `use-${modulePlural}-list`;

            if (baseName !== expectedPattern) {
                message = `List hook file "${baseName}" should be named "${expectedPattern}". List hooks must follow the pattern: use-{chain}-{module-plural}-list.`;
            }
        } else {
            // Verb hooks: use-{verb}-{chain}-{module-singular}
            const expectedSuffix = chain
                ? `-${chain}-${moduleSingular}`
                : `-${moduleSingular}`;

            if (!baseName.endsWith(expectedSuffix)) {
                const exampleName = chain
                    ? `use-{verb}-${chain}-${moduleSingular}`
                    : `use-{verb}-${moduleSingular}`;

                message = `Hook file "${baseName}" should end with "${expectedSuffix}". Verb hooks must follow the pattern: ${exampleName}.`;
            } else {
                // Verify there's a verb word between "use-" and the suffix
                const afterUse = baseName.slice(4); // Remove "use-"
                const suffixWithoutDash = expectedSuffix.slice(1); // Remove leading "-"
                const verbPart = afterUse.slice(0, afterUse.length - suffixWithoutDash.length - 1); // Remove suffix and its preceding dash

                if (!verbPart || verbPart.length === 0) {
                    const exampleName = chain
                        ? `use-{verb}-${chain}-${moduleSingular}`
                        : `use-{verb}-${moduleSingular}`;

                    message = `Hook file "${baseName}" is missing a verb. Verb hooks must follow the pattern: ${exampleName}.`;
                }
            }
        }

        if (!message) return {};

        return {
            Program(node) {
                context.report({ message, node });
            },
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions for hook files inside hooks/ module subfolders" },
        fixable: null,
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Hook Function Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that the exported hook function name matches the
 *   camelCase conversion of the file name. Only applies inside
 *   hooks/ folders, skips index files and non-use- files.
 *
 * ✓ Good:
 *   // use-create-super-admin.ts → exports useCreateSuperAdmin
 *   // use-users-list.ts → exports useUsersList
 *
 * ✗ Bad:
 *   // use-create-super-admin.ts → exports useCreate (missing parts)
 *   // use-users-list.ts → exports useList (missing parts)
 */
const hookFunctionNamingConvention = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const parts = normalizedFilename.split("/");
        const fileWithExt = parts[parts.length - 1];
        const baseName = fileWithExt.replace(/\.(jsx?|tsx?)$/, "");

        // Skip index files and non-use- files
        if (baseName === "index" || !baseName.startsWith("use-")) return {};

        // Only apply inside hooks/ folders
        const hooksIndex = parts.lastIndexOf("hooks");

        if (hooksIndex === -1) return {};

        // Convert kebab-case file name to camelCase: use-create-super-admin → useCreateSuperAdmin
        const expectedName = baseName.split("-").map((segment, i) => (i === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1))).join("");

        // Shared fix logic for renaming identifier and all references
        const createRenameFixer = (node, name, identifierNode) => (fixer) => {
            const scope = context.sourceCode
                ? context.sourceCode.getScope(node)
                : context.getScope();

            const findVariableHandler = (s, varName) => {
                const v = s.variables.find((variable) => variable.name === varName);

                if (v) return v;
                if (s.upper) return findVariableHandler(s.upper, varName);

                return null;
            };

            const variable = findVariableHandler(scope, name);

            if (!variable) return fixer.replaceText(identifierNode, expectedName);

            const fixes = [];
            const fixedRanges = new Set();

            variable.defs.forEach((def) => {
                const rangeKey = `${def.name.range[0]}-${def.name.range[1]}`;

                if (!fixedRanges.has(rangeKey)) {
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(def.name, expectedName));
                }
            });

            variable.references.forEach((ref) => {
                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                if (!fixedRanges.has(rangeKey)) {
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(ref.identifier, expectedName));
                }
            });

            return fixes;
        };

        // Check if name starts with "use" followed by uppercase letter (hook pattern)
        const isHookNameHandler = (name) => /^use[A-Z]/.test(name) || name === "use";

        // Check exported arrow functions, function declarations, and function expressions
        const checkFunctionHandler = (node) => {
            let name;
            let identifierNode;

            // Arrow function: const useFoo = () => ...
            if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                name = node.parent.id.name;
                identifierNode = node.parent.id;

                // Only check exported declarations
                const varDecl = node.parent.parent;
                const isExported = varDecl && varDecl.parent && varDecl.parent.type === "ExportNamedDeclaration";

                if (!isExported) return;
            } else if (node.id && node.id.type === "Identifier") {
                // Function declaration: export function useFoo() { ... }
                name = node.id.name;
                identifierNode = node.id;

                const isExported = node.parent && node.parent.type === "ExportNamedDeclaration";

                if (!isExported) return;
            } else {
                return;
            }

            // Only check hook-like names (starting with "use")
            if (!isHookNameHandler(name)) return;

            if (name !== expectedName) {
                context.report({
                    fix: createRenameFixer(node, name, identifierNode),
                    message: `Hook function "${name}" should be named "${expectedName}" to match file name "${baseName}".`,
                    node: identifierNode,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce that exported hook function names match the camelCase of the file name" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

export { hookCallbackFormat, hookDepsPerLine, hookFileNamingConvention, hookFunctionNamingConvention, useStateNamingConvention };
