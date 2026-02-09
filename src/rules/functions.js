/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Call Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No space between function name and opening parenthesis.
 *
 * ✓ Good:
 *   useDispatch()
 *   myFunction(arg)
 *
 * ✗ Bad:
 *   useDispatch ()
 *   myFunction (arg)
 */
const functionCallSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkCallSpacingHandler = (node, callee) => {
            // Get the last token of the callee (function name or member expression)
            const calleeLastToken = sourceCode.getLastToken(callee);

            // For calls with type arguments (generics), check space before <
            // e.g., axiosClient.get <Type>() should be axiosClient.get<Type>()
            if (node.typeArguments || node.typeParameters) {
                const typeArgs = node.typeArguments || node.typeParameters;
                const openAngle = sourceCode.getFirstToken(typeArgs);

                if (openAngle && openAngle.value === "<") {
                    const textBeforeAngle = sourceCode.text.slice(calleeLastToken.range[1], openAngle.range[0]);

                    if (/\s/.test(textBeforeAngle)) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [calleeLastToken.range[1], openAngle.range[0]],
                                "",
                            ),
                            message: "No space between function name and generic type arguments",
                            node: openAngle,
                        });
                    }
                }

                // Also check space between closing > and opening (
                const closeAngle = sourceCode.getLastToken(typeArgs);
                const openParen = sourceCode.getTokenAfter(typeArgs);

                if (openParen && openParen.value === "(") {
                    const textBetween = sourceCode.text.slice(closeAngle.range[1], openParen.range[0]);

                    if (/\s/.test(textBetween)) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeAngle.range[1], openParen.range[0]],
                                "",
                            ),
                            message: "No space between generic type arguments and opening parenthesis",
                            node: openParen,
                        });
                    }
                }

                return;
            }

            // Get the opening parenthesis
            const openParen = sourceCode.getTokenAfter(callee);

            if (!openParen || openParen.value !== "(") return;

            // Check if there's space between callee and opening paren
            const textBetween = sourceCode.text.slice(calleeLastToken.range[1], openParen.range[0]);

            if (textBetween.length > 0) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [calleeLastToken.range[1], openParen.range[0]],
                        "",
                    ),
                    message: "No space between function name and opening parenthesis",
                    node: openParen,
                });
            }
        };

        return {
            CallExpression(node) {
                checkCallSpacingHandler(node, node.callee);
            },

            NewExpression(node) {
                checkCallSpacingHandler(node, node.callee);
            },
        };
    },
    meta: {
        docs: { description: "Enforce no space between function name and opening parenthesis" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Declaration Style
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce function expressions (arrow functions) instead of
 *   function declarations. Auto-fixes by converting to const
 *   arrow function expressions.
 *
 * ✓ Good:
 *   const getToken = (): string | null => getCookie(tokenKey);
 *   const clearAuth = (): void => {
 *       removeToken();
 *       clearStorage();
 *   };
 *
 * ✗ Bad:
 *   function getToken(): string | null { return getCookie(tokenKey); }
 *   function clearAuth(): void {
 *       removeToken();
 *       clearStorage();
 *   }
 */
const functionDeclarationStyle = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            FunctionDeclaration(node) {
                if (!node.id) return;

                const name = node.id.name;

                // Build the params text
                const paramsText = node.params.map((p) => sourceCode.getText(p)).join(", ");

                // Build return type annotation if present
                let returnType = "";

                if (node.returnType) {
                    returnType = sourceCode.getText(node.returnType);
                }

                // Build type parameters if present (generics)
                // For arrow functions in TSX files, use trailing comma to avoid JSX ambiguity: <T,>
                let typeParams = "";

                if (node.typeParameters) {
                    const typeParamsText = sourceCode.getText(node.typeParameters);

                    // Add trailing comma if single type parameter to avoid JSX parsing issues
                    // <T> becomes <T,> but <T, U> stays as is
                    if (node.typeParameters.params && node.typeParameters.params.length === 1) {
                        // Check if it already has a trailing comma
                        const innerText = typeParamsText.slice(1, -1).trim();

                        if (!innerText.endsWith(",")) {
                            typeParams = `<${innerText},>`;
                        } else {
                            typeParams = typeParamsText;
                        }
                    } else {
                        typeParams = typeParamsText;
                    }
                }

                // Check if async
                const isAsync = node.async;
                const asyncPrefix = isAsync ? "async " : "";

                // Get the body text
                const bodyText = sourceCode.getText(node.body);

                // Check for export keywords
                const parentNode = node.parent;
                const isExported = parentNode && parentNode.type === "ExportNamedDeclaration";

                const exportPrefix = isExported ? "export " : "";

                context.report({
                    fix(fixer) {
                        const fixTarget = isExported ? parentNode : node;

                        // For arrow functions with generics: const fn = <T,>(param: T) => ...
                        const replacement = `${exportPrefix}const ${name} = ${typeParams}${asyncPrefix}(${paramsText})${returnType} => ${bodyText};`;

                        return fixer.replaceText(fixTarget, replacement);
                    },
                    message: `Expected a function expression. Use \`const ${name} = ${typeParams}${asyncPrefix}(${paramsText})${returnType} => ...\` instead.`,
                    node: node.id,
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce arrow function expressions instead of function declarations" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function names should follow naming conventions: camelCase,
 *   starting with a verb, and ending with "Handler" suffix.
 *   Auto-fixes PascalCase functions to camelCase.
 *   Auto-fixes handleXxx to xxxHandler (avoids "handleClickHandler").
 *
 * ✓ Good:
 *   function getUserDataHandler() {}
 *   function clickHandler() {}
 *   function isValidEmailHandler() {}
 *   const submitHandler = () => {};
 *
 * ✗ Bad (auto-fixed):
 *   function GetUserData() {}    // → getUserDataHandler
 *   function handleClick() {}    // → clickHandler (not handleClickHandler)
 *   function getUserData() {}    // → getUserDataHandler
 *   const FetchStatus = () => {} // → fetchStatusHandler
 */
const functionNamingConvention = {
    create(context) {
        const componentNameRegex = /^[A-Z][a-zA-Z0-9]*$/;

        const handlerRegex = /Handler$/;

        const hookRegex = /^use[A-Z]/;

        // Comprehensive list of English verbs commonly used in function names
        // Organized by category for maintainability
        const verbPrefixes = [
            // CRUD & Data operations
            "get", "set", "fetch", "load", "save", "create", "update", "delete", "remove", "add",
            "insert", "append", "prepend", "push", "pop", "shift", "unshift", "put", "patch",
            // Boolean checks
            "is", "has", "can", "should", "will", "did", "was", "were", "does", "do",
            // Validation
            "check", "validate", "verify", "confirm", "ensure", "assert", "test", "match",
            // Search & Filter
            "find", "search", "filter", "sort", "map", "reduce", "merge", "split", "join",
            "query", "lookup", "locate", "detect", "identify", "discover", "scan", "probe",
            // Transformation
            "parse", "format", "convert", "transform", "normalize", "serialize", "deserialize",
            "encode", "decode", "encrypt", "decrypt", "hash", "sign", "compress", "decompress",
            "stringify", "objectify", "flatten", "unflatten", "transpose", "invert",
            // String manipulation
            "strip", "trim", "pad", "wrap", "unwrap", "sanitize", "escape", "unescape",
            "capitalize", "lowercase", "uppercase", "camel", "snake", "kebab", "truncate",
            "replace", "substitute", "interpolate", "template", "render",
            // Display & UI
            "display", "show", "hide", "toggle", "enable", "disable", "activate", "deactivate",
            "highlight", "focus", "blur", "select", "deselect", "expand", "collapse", "resize",
            "animate", "transition", "fade", "slide", "zoom", "rotate", "scale",
            // Lifecycle
            "open", "close", "start", "stop", "init", "setup", "reset", "clear", "destroy",
            "mount", "unmount", "attach", "detach", "bind", "unbind", "dispose", "cleanup",
            "register", "unregister", "install", "uninstall", "configure", "reconfigure",
            // Network & Communication
            "connect", "disconnect", "subscribe", "unsubscribe", "listen", "emit", "broadcast",
            "send", "receive", "request", "respond", "submit", "cancel", "abort", "poll",
            "download", "upload", "import", "export", "sync", "stream", "pipe",
            // File & I/O
            "read", "write", "copy", "move", "clone", "extract", "archive", "restore", "backup",
            // Computation
            "build", "make", "generate", "compute", "calculate", "process", "execute", "run",
            "evaluate", "analyze", "measure", "benchmark", "profile", "optimize",
            "count", "sum", "avg", "min", "max", "clamp", "round", "floor", "ceil", "abs",
            "increment", "decrement", "multiply", "divide", "mod", "negate",
            // Invocation
            "apply", "call", "invoke", "trigger", "fire", "dispatch", "emit", "raise", "signal",
            // Auth
            "login", "logout", "authenticate", "authorize", "grant", "revoke", "permit", "deny",
            // Navigation
            "navigate", "redirect", "route", "scroll", "jump", "go", "back", "forward",
            "refresh", "reload", "restore",
            // Logging
            "log", "warn", "error", "debug", "trace", "print", "dump", "inspect",
            // Error handling
            "throw", "catch", "resolve", "reject", "retry", "await", "recover", "fallback", "forgot",
            // Performance
            "debounce", "throttle", "memoize", "cache", "batch", "queue", "defer", "delay",
            "schedule", "preload", "prefetch", "lazy",
            // Events (note: "handle" is NOT included - handleXxx is auto-fixed to xxxHandler)
            "on", "click", "change", "input", "press", "drag", "drop",
            "hover", "enter", "leave", "touch", "swipe", "pinch", "tap",
            // Comparison
            "compare", "diff", "equal", "differ", "overlap", "intersect", "union", "exclude",
            // Grouping
            "group", "ungroup", "partition", "chunk", "segment", "categorize", "classify",
            // Ordering
            "order", "reorder", "arrange", "reverse", "shuffle", "randomize", "pick", "sample",
            // Validation state
            "lock", "unlock", "freeze", "unfreeze", "seal", "mark", "unmark", "flag", "unflag",
            // Misc common verbs
            "use", "require", "need", "want", "try", "attempt", "ensure", "guarantee",
            "prepare", "finalize", "complete", "finish", "end", "begin", "continue", "resume",
            "pause", "suspend", "interrupt", "break", "skip", "ignore", "include", "exclude",
            "accept", "decline", "approve", "reject", "confirm", "dismiss", "acknowledge",
            "assign", "allocate", "distribute", "collect", "gather", "aggregate", "accumulate",
            "populate", "fill", "empty", "drain", "flush", "purge", "prune", "clean", "sanitize",
            "compose", "decompose", "assemble", "disassemble", "construct", "deconstruct",
        ];

        const startsWithVerbHandler = (name) => verbPrefixes.some((verb) => name.startsWith(verb));

        // Case-insensitive check for verb prefix (to catch PascalCase like "GetForStatus")
        const startsWithVerbCaseInsensitiveHandler = (name) => {
            const lowerName = name.toLowerCase();

            return verbPrefixes.some((verb) => lowerName.startsWith(verb));
        };

        // Convert PascalCase to camelCase
        const toCamelCaseHandler = (name) => name[0].toLowerCase() + name.slice(1);

        const endsWithHandler = (name) => handlerRegex.test(name);

        // Check if a node contains JSX (making it a React component)
        const containsJsxHandler = (node) => {
            if (!node) return false;

            if (node.type === "JSXElement" || node.type === "JSXFragment") return true;

            if (node.type === "BlockStatement") {
                for (const statement of node.body) {
                    if (statement.type === "ReturnStatement" && statement.argument) {
                        if (containsJsxHandler(statement.argument)) return true;
                    }

                    if (statement.type === "IfStatement") {
                        if (containsJsxHandler(statement.consequent)) return true;
                        if (statement.alternate && containsJsxHandler(statement.alternate)) return true;
                    }
                }
            }

            if (node.type === "ConditionalExpression") {
                return containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);
            }

            if (node.type === "LogicalExpression") {
                return containsJsxHandler(node.left) || containsJsxHandler(node.right);
            }

            if (node.type === "ParenthesizedExpression") {
                return containsJsxHandler(node.expression);
            }

            return false;
        };

        // Check if function is a React component (PascalCase + returns JSX)
        const isReactComponentHandler = (node, name) => {
            if (!name || !/^[A-Z]/.test(name)) return false;

            return containsJsxHandler(node.body);
        };

        const checkFunctionHandler = (node) => {
            let name = null;
            let identifierNode = null;

            if (node.type === "FunctionDeclaration" && node.id) {
                name = node.id.name;
                identifierNode = node.id;
            } else if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
                if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id) {
                    name = node.parent.id.name;
                    identifierNode = node.parent.id;
                } else if (node.parent && node.parent.type === "CallExpression") {
                    // Check for useCallback wrapped functions: const login = useCallback(() => {...}, [])
                    // Note: Skip useMemo - it returns computed values, not action functions
                    const callExpr = node.parent;
                    const callee = callExpr.callee;

                    // Only check useCallback (not useMemo, useEffect, etc.)
                    if (callee && callee.type === "Identifier" && callee.name === "useCallback") {
                        // Check if the function is the first argument to useCallback
                        if (callExpr.arguments && callExpr.arguments[0] === node) {
                            // Check if the CallExpression is the init of a VariableDeclarator
                            if (callExpr.parent && callExpr.parent.type === "VariableDeclarator" && callExpr.parent.id) {
                                name = callExpr.parent.id.name;
                                identifierNode = callExpr.parent.id;
                            }
                        }
                    }
                }
            }

            if (!name || !identifierNode) return;

            // Skip hooks
            if (/^use[A-Z]/.test(name)) return;

            // Skip React components (PascalCase + returns JSX)
            if (isReactComponentHandler(node, name)) return;

            // Check PascalCase functions that are NOT React components
            if (/^[A-Z]/.test(name)) {
                // If starts with a verb (case-insensitive), it should be camelCase
                if (startsWithVerbCaseInsensitiveHandler(name)) {
                    const camelCaseName = toCamelCaseHandler(name);
                    const identifierNode = node.id || node.parent.id;

                    context.report({
                        fix(fixer) {
                            const scope = context.sourceCode
                                ? context.sourceCode.getScope(node)
                                : context.getScope();

                            const variable = scope.variables.find((v) => v.name === name)
                                || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                            if (!variable) return fixer.replaceText(identifierNode, camelCaseName);

                            const fixes = [];
                            const fixedRanges = new Set();

                            variable.references.forEach((ref) => {
                                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                if (!fixedRanges.has(rangeKey)) {
                                    fixedRanges.add(rangeKey);
                                    fixes.push(fixer.replaceText(ref.identifier, camelCaseName));
                                }
                            });

                            return fixes;
                        },
                        message: `Function "${name}" should be camelCase. Use "${camelCaseName}" instead of "${name}"`,
                        node: node.id || node.parent.id,
                    });
                }

                // Skip other PascalCase names (likely React components)
                return;
            }

            const hasVerbPrefix = startsWithVerbHandler(name);
            const hasHandlerSuffix = endsWithHandler(name);
            const startsWithHandle = /^handle[A-Z]/.test(name);

            // Special case: handleXxx -> xxxHandler (to avoid handleClickHandler)
            if (startsWithHandle && !hasHandlerSuffix) {
                const identifierNode = node.id || node.parent.id;
                // Remove "handle" prefix and add "Handler" suffix: handleClick -> clickHandler
                const baseName = name.slice(6); // Remove "handle"
                const newName = baseName[0].toLowerCase() + baseName.slice(1) + "Handler";

                context.report({
                    fix(fixer) {
                        const scope = context.sourceCode
                            ? context.sourceCode.getScope(node)
                            : context.getScope();

                        const variable = scope.variables.find((v) => v.name === name)
                            || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                        if (!variable) return fixer.replaceText(identifierNode, newName);

                        const fixes = [];
                        const fixedRanges = new Set();

                        const addFixHandler = (nodeToFix) => {
                            const rangeKey = `${nodeToFix.range[0]}-${nodeToFix.range[1]}`;

                            if (!fixedRanges.has(rangeKey)) {
                                fixedRanges.add(rangeKey);
                                fixes.push(fixer.replaceText(nodeToFix, newName));
                            }
                        };

                        variable.defs.forEach((def) => {
                            addFixHandler(def.name);
                        });

                        variable.references.forEach((ref) => {
                            addFixHandler(ref.identifier);
                        });

                        return fixes;
                    },
                    message: `Function "${name}" should be "${newName}" (handleXxx → xxxHandler to avoid redundant "handleXxxHandler")`,
                    node: identifierNode,
                });
                return;
            }

            if (!hasVerbPrefix && !hasHandlerSuffix) {
                context.report({
                    message: `Function "${name}" should start with a verb (get, set, fetch, etc.) AND end with "Handler" (e.g., getDataHandler, clickHandler)`,
                    node: identifierNode,
                });
            } else if (!hasVerbPrefix) {
                context.report({
                    message: `Function "${name}" should start with a verb (get, set, fetch, handle, click, submit, etc.)`,
                    node: identifierNode,
                });
            } else if (!hasHandlerSuffix) {
                const newName = `${name}Handler`;

                context.report({
                    fix(fixer) {
                        const scope = context.sourceCode
                            ? context.sourceCode.getScope(node)
                            : context.getScope();

                        // Find all references to this variable in the scope
                        const variable = scope.variables.find((v) => v.name === name)
                            || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                        if (!variable) return fixer.replaceText(identifierNode, newName);

                        const fixes = [];
                        const fixedRanges = new Set();

                        // Helper to add fix only if not already fixed (avoid overlapping fixes)
                        const addFixHandler = (nodeToFix) => {
                            const rangeKey = `${nodeToFix.range[0]}-${nodeToFix.range[1]}`;

                            if (!fixedRanges.has(rangeKey)) {
                                fixedRanges.add(rangeKey);
                                fixes.push(fixer.replaceText(nodeToFix, newName));
                            }
                        };

                        // Fix the definition
                        variable.defs.forEach((def) => {
                            addFixHandler(def.name);
                        });

                        // Fix all references
                        variable.references.forEach((ref) => {
                            addFixHandler(ref.identifier);
                        });

                        return fixes;
                    },
                    message: `Function "${name}" should end with "Handler" suffix (e.g., ${newName})`,
                    node: identifierNode,
                });
            }
        };

        // Check class methods (MethodDefinition)
        const checkMethodHandler = (node) => {
            // Skip constructors
            if (node.kind === "constructor") return;

            // Skip getters and setters - they're property accessors, not action methods
            if (node.kind === "get" || node.kind === "set") return;

            const { key } = node;

            // Only check methods with Identifier keys (skip computed properties like [Symbol.iterator])
            if (key.type !== "Identifier") return;

            const name = key.name;

            // Skip hooks
            if (/^use[A-Z]/.test(name)) return;

            // Skip React lifecycle methods
            const lifecycleMethods = [
                "render", "componentDidMount", "componentDidUpdate", "componentWillUnmount",
                "shouldComponentUpdate", "getSnapshotBeforeUpdate", "componentDidCatch",
                "getDerivedStateFromProps", "getDerivedStateFromError",
            ];

            if (lifecycleMethods.includes(name)) return;

            const hasVerbPrefix = startsWithVerbHandler(name);
            const hasHandlerSuffix = endsWithHandler(name);

            if (!hasVerbPrefix && !hasHandlerSuffix) {
                context.report({
                    message: `Method "${name}" should start with a verb (get, set, fetch, handle, etc.) AND end with "Handler" (e.g., getDataHandler, handleClickHandler)`,
                    node: key,
                });
            } else if (!hasVerbPrefix) {
                context.report({
                    message: `Method "${name}" should start with a verb (get, set, fetch, handle, click, submit, etc.)`,
                    node: key,
                });
            } else if (!hasHandlerSuffix) {
                const newName = `${name}Handler`;

                context.report({
                    fix(fixer) {
                        // For class methods, we need to find all references manually
                        // This is simpler than functions since class methods are typically accessed via this.methodName
                        const fixes = [fixer.replaceText(key, newName)];

                        // Find all references to this method in the class body
                        const classBody = node.parent;

                        if (classBody && classBody.type === "ClassBody") {
                            // Find usages like this.methodName or super.methodName
                            const classNode = classBody.parent;

                            if (classNode) {
                                const visited = new Set();

                                const searchPatternHandler = (n) => {
                                    // Avoid circular references and already visited nodes
                                    if (!n || typeof n !== "object" || visited.has(n)) return;

                                    visited.add(n);

                                    if (n.type === "MemberExpression" &&
                                        n.property &&
                                        n.property.type === "Identifier" &&
                                        n.property.name === name &&
                                        n.object &&
                                        (n.object.type === "ThisExpression" || n.object.type === "Super")) {
                                        // Don't fix the definition itself
                                        if (n.property !== key) {
                                            fixes.push(fixer.replaceText(n.property, newName));
                                        }
                                    }

                                    // Recursively search only AST child properties (skip parent, tokens, etc.)
                                    const childKeys = ["body", "declarations", "expression", "left", "right",
                                        "callee", "arguments", "object", "property", "consequent", "alternate",
                                        "test", "init", "update", "params", "elements", "properties", "value",
                                        "key", "argument", "block", "handler", "finalizer", "cases"];

                                    for (const childKey of childKeys) {
                                        const child = n[childKey];

                                        if (child) {
                                            if (Array.isArray(child)) {
                                                child.forEach((item) => searchPatternHandler(item));
                                            } else {
                                                searchPatternHandler(child);
                                            }
                                        }
                                    }
                                };

                                searchPatternHandler(classNode);
                            }
                        }

                        return fixes;
                    },
                    message: `Method "${name}" should end with "Handler" suffix (e.g., ${newName})`,
                    node: key,
                });
            }
        };

        // Check functions destructured from custom hooks: const { logout } = useAuth()
        // Valid: onLogout, logoutAction, logoutHandler
        // Invalid: logout (should be logoutHandler)
        const checkDestructuredHookFunctionHandler = (node) => {
            // Check if this is destructuring from a hook call: const { ... } = useXxx()
            if (!node.init || node.init.type !== "CallExpression") return;
            if (!node.id || node.id.type !== "ObjectPattern") return;

            const callee = node.init.callee;

            // Check if it's a hook call (starts with "use")
            if (!callee || callee.type !== "Identifier" || !hookRegex.test(callee.name)) return;

            // Action verbs that are clearly function names (not noun-like)
            // These are verbs that when used alone as a name, clearly indicate an action/function
            const actionVerbs = [
                // Auth actions
                "login", "logout", "authenticate", "authorize", "signup", "signout", "signin",
                // CRUD actions (when standalone, not as prefix)
                "submit", "reset", "clear", "refresh", "reload", "retry",
                // Toggle/state actions
                "toggle", "enable", "disable", "activate", "deactivate",
                "show", "hide", "open", "close", "expand", "collapse",
                // Navigation
                "navigate", "redirect", "goBack", "goForward",
                // Increment/decrement
                "increment", "decrement", "increase", "decrease",
                // Other common hook function names
                "connect", "disconnect", "subscribe", "unsubscribe",
                "start", "stop", "pause", "resume", "cancel", "abort",
                "select", "deselect", "check", "uncheck",
                "add", "remove", "insert", "delete", "update",
            ];

            // Check each destructured property
            node.id.properties.forEach((prop) => {
                if (prop.type !== "Property" || prop.key.type !== "Identifier") return;

                const name = prop.key.name;

                // Get the local variable name (value node for non-shorthand, key for shorthand)
                const valueNode = prop.value || prop.key;
                const localName = valueNode.type === "Identifier" ? valueNode.name : name;

                // Skip if local name starts with "on" (like onLogout, onClick)
                if (/^on[A-Z]/.test(localName)) return;

                // Skip if local name ends with "Action" (like logoutAction)
                if (/Action$/.test(localName)) return;

                // Skip if local name ends with "Handler" (like logoutHandler)
                if (handlerRegex.test(localName)) return;

                // Skip boolean-like names (is, has, can, should, etc.)
                const booleanPrefixes = ["is", "has", "can", "should", "will", "did", "was", "were", "does"];

                if (booleanPrefixes.some((prefix) => localName.startsWith(prefix) && localName.length > prefix.length && /[A-Z]/.test(localName[prefix.length]))) return;

                // Only flag if the name is exactly an action verb or starts with one followed by uppercase
                const isActionVerb = actionVerbs.some((verb) =>
                    localName === verb || (localName.startsWith(verb) && localName.length > verb.length && /[A-Z]/.test(localName[verb.length])));

                if (!isActionVerb) return;

                // This is a function name without proper prefix/suffix
                // Add Handler suffix: logout -> logoutHandler
                const suggestedName = localName + "Handler";

                context.report({
                    fix(fixer) {
                        const fixes = [];
                        const sourceCode = context.sourceCode || context.getSourceCode();

                        if (prop.shorthand) {
                            // Shorthand: { logout } -> { logout: logoutHandler }
                            // Replace the entire property with key: newValue format
                            fixes.push(fixer.replaceText(prop, `${name}: ${suggestedName}`));
                        } else {
                            // Non-shorthand: { logout: myVar } -> { logout: myVarHandler }
                            // Just replace the value identifier
                            fixes.push(fixer.replaceText(valueNode, suggestedName));
                        }

                        // Find and rename all usages of the local variable
                        const scope = sourceCode.getScope
                            ? sourceCode.getScope(node)
                            : context.getScope();

                        // Helper to find variable in scope chain
                        const findVariableHandler = (s, varName) => {
                            const v = s.variables.find((variable) => variable.name === varName);

                            if (v) return v;
                            if (s.upper) return findVariableHandler(s.upper, varName);

                            return null;
                        };

                        const variable = findVariableHandler(scope, localName);

                        if (variable) {
                            const fixedRanges = new Set();

                            // Add the definition range to avoid double-fixing
                            if (valueNode.range) {
                                fixedRanges.add(`${valueNode.range[0]}-${valueNode.range[1]}`);
                            }

                            // Fix all references
                            variable.references.forEach((ref) => {
                                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                if (!fixedRanges.has(rangeKey)) {
                                    fixedRanges.add(rangeKey);
                                    fixes.push(fixer.replaceText(ref.identifier, suggestedName));
                                }
                            });
                        }

                        return fixes;
                    },
                    message: `Function "${localName}" destructured from hook should end with "Handler" suffix. Use "${suggestedName}" instead`,
                    node: valueNode,
                });
            });
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            MethodDefinition: checkMethodHandler,
            VariableDeclarator: checkDestructuredHookFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce function and method names to start with a verb AND end with Handler" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Params Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When function parameters span multiple lines, each parameter
 *   should be on its own line with consistent indentation.
 *
 * ✓ Good:
 *   function test(
 *       param1,
 *       param2,
 *       param3,
 *   ) {}
 *
 * ✗ Bad:
 *   function test(param1,
 *       param2, param3) {}
 */
const functionParamsPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const getCleanParamTextHandler = (param) => {
            if (param.type === "ObjectPattern") {
                const props = param.properties.map((prop) => {
                    if (prop.type === "RestElement") {
                        return `...${getCleanParamTextHandler(prop.argument)}`;
                    }

                    const key = sourceCode.getText(prop.key);

                    // Recursively clean nested patterns
                    let value;

                    if (prop.value) {
                        if (prop.value.type === "ObjectPattern" || prop.value.type === "ArrayPattern" || prop.value.type === "AssignmentPattern") {
                            value = getCleanParamTextHandler(prop.value);
                        } else {
                            value = sourceCode.getText(prop.value).replace(/\s+/g, " ").trim();
                        }
                    } else {
                        value = key;
                    }

                    // Check if shorthand (key and value are the same identifier)
                    const isShorthand = prop.shorthand || (prop.value && prop.value.type === "Identifier" && prop.value.name === prop.key.name);

                    if (isShorthand) {
                        // For shorthand with default value, use the value (includes default)
                        return prop.value && prop.value.type === "AssignmentPattern" ? value : key;
                    }

                    return `${key}: ${value}`;
                });

                let result = `{ ${props.join(", ")} }`;

                // Preserve type annotation if present
                if (param.typeAnnotation) {
                    let typeText = sourceCode.getText(param.typeAnnotation);
                    const typeAnnotation = param.typeAnnotation.typeAnnotation;

                    // For single-member inline types, collapse to one line
                    if (typeAnnotation) {
                        let members = null;

                        if (typeAnnotation.type === "TSTypeLiteral") {
                            members = typeAnnotation.members;
                        } else if (typeAnnotation.type === "TSIntersectionType") {
                            const typeLiteral = typeAnnotation.types.find((t) => t.type === "TSTypeLiteral");

                            if (typeLiteral) {
                                members = typeLiteral.members;
                            }
                        }

                        if (members && members.length === 1) {
                            // Normalize whitespace to collapse to one line, remove trailing comma
                            typeText = typeText.replace(/\s+/g, " ").trim().replace(/,\s*}/, " }").replace(/,\s*&/, " &");
                        }
                    }

                    result += typeText;
                }

                return result;
            }

            if (param.type === "ArrayPattern") {
                const elems = param.elements.map((el) => {
                    if (el === null) return "";

                    return getCleanParamTextHandler(el);
                });

                return `[${elems.join(", ")}]`;
            }

            if (param.type === "AssignmentPattern") {
                const leftText = getCleanParamTextHandler(param.left);
                const rightText = sourceCode.getText(param.right).replace(/\s+/g, " ").trim();

                return `${leftText} = ${rightText}`;
            }

            if (param.type === "RestElement") {
                return `...${getCleanParamTextHandler(param.argument)}`;
            }

            return sourceCode.getText(param).replace(/\s+/g, " ").trim();
        };

        // Check if a pattern (or any nested pattern) has 2+ properties
        const hasComplexPatternHandler = (pattern) => {
            if (!pattern) return false;

            if (pattern.type === "AssignmentPattern") {
                return hasComplexPatternHandler(pattern.left);
            }

            if (pattern.type === "ObjectPattern") {
                // Check if this pattern has 2+ properties
                if (pattern.properties.length >= 2) return true;

                // Check if type annotation has 2+ members (TSTypeLiteral)
                if (pattern.typeAnnotation && pattern.typeAnnotation.typeAnnotation) {
                    const typeAnnotation = pattern.typeAnnotation.typeAnnotation;

                    if (typeAnnotation.type === "TSTypeLiteral" && typeAnnotation.members.length >= 2) {
                        return true;
                    }

                    // Also check intersection types for TSTypeLiteral with 2+ members
                    if (typeAnnotation.type === "TSIntersectionType") {
                        const typeLiteral = typeAnnotation.types.find((t) => t.type === "TSTypeLiteral");

                        if (typeLiteral && typeLiteral.members.length >= 2) {
                            return true;
                        }
                    }
                }

                // Check nested patterns
                for (const prop of pattern.properties) {
                    if (prop.type === "Property" && prop.value) {
                        if (hasComplexPatternHandler(prop.value)) return true;
                    }
                }
            }

            if (pattern.type === "ArrayPattern") {
                const elements = pattern.elements.filter((el) => el !== null);

                if (elements.length >= 2) return true;

                // Check nested patterns
                for (const el of elements) {
                    if (hasComplexPatternHandler(el)) return true;
                }
            }

            return false;
        };

        // Returns true only if any param has 2+ destructured properties (including nested)
        const hasComplexDestructuredParamHandler = (params) => params.some((param) => hasComplexPatternHandler(param));

        const checkDestructuredParamHandler = (param, baseIndent) => {
            let pattern = param;

            if (param.type === "AssignmentPattern") {
                pattern = param.left;
            }

            // Only enforce multi-line for 2+ destructured properties
            if (pattern.type === "ObjectPattern") {
                const properties = pattern.properties;

                // Check if this pattern needs multiline:
                // - Has 2+ properties itself, OR
                // - Any nested pattern has 2+ properties (is complex)
                const hasComplexNested = properties.some((prop) => {
                    if (prop.type === "Property" && prop.value) {
                        return hasComplexPatternHandler(prop.value);
                    }

                    return false;
                });

                const needsMultiline = properties.length >= 2 || hasComplexNested;

                // Check nested patterns first (regardless of this pattern's property count)
                for (const prop of properties) {
                    if (prop.type === "Property" && prop.value) {
                        // Calculate indent for nested pattern
                        const nestedIndent = baseIndent + 4;

                        checkDestructuredParamHandler(prop.value, nestedIndent);
                    }
                }

                if (!needsMultiline) return;

                const openBrace = sourceCode.getFirstToken(pattern);
                // Don't use getLastToken(pattern) - for ObjectPattern with typeAnnotation,
                // the pattern's range includes the type annotation, so getLastToken would
                // return the last token of the type, not the closing brace.
                // Instead, find the "}" token after the last property.
                const lastProp = properties[properties.length - 1];
                let closeBrace = sourceCode.getTokenAfter(lastProp);

                while (closeBrace && closeBrace.value !== "}") {
                    closeBrace = sourceCode.getTokenAfter(closeBrace);
                }
                const propIndent = " ".repeat(baseIndent + 4);
                const braceIndent = " ".repeat(baseIndent);

                if (openBrace.loc.end.line === properties[0].loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], properties[0].range[0]],
                            "\n" + propIndent,
                        ),
                        message: "First destructured property should be on its own line when complex destructuring",
                        node: properties[0],
                    });
                }

                if (closeBrace.loc.start.line === properties[properties.length - 1].loc.end.line) {
                    // Check if pattern has a type annotation (it's on pattern, not param for AssignmentPattern)
                    const hasTypeAnnotation = pattern.typeAnnotation;

                    context.report({
                        fix: (fixer) => {
                            if (hasTypeAnnotation) {
                                // Include the closing brace in the replacement to avoid conflicts
                                // with componentPropsInlineType rule
                                return fixer.replaceTextRange(
                                    [properties[properties.length - 1].range[1], closeBrace.range[1]],
                                    ",\n" + braceIndent + "}",
                                );
                            }

                            return fixer.replaceTextRange(
                                [properties[properties.length - 1].range[1], closeBrace.range[0]],
                                ",\n" + braceIndent,
                            );
                        },
                        message: "Closing brace should be on its own line when complex destructuring",
                        node: closeBrace,
                    });
                }

                for (let i = 0; i < properties.length - 1; i += 1) {
                    const current = properties[i];

                    const next = properties[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(
                            current,
                            (token) => token.value === ",",
                        );

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + propIndent,
                            ),
                            message: "Each destructured property should be on its own line when complex destructuring",
                            node: next,
                        });
                    }
                }
            }

            // Only enforce multi-line for 2+ destructured array elements
            if (pattern.type === "ArrayPattern") {
                const elements = pattern.elements.filter((el) => el !== null);

                // Check nested patterns first
                for (const el of elements) {
                    if (el) {
                        const nestedIndent = baseIndent + 4;

                        checkDestructuredParamHandler(el, nestedIndent);
                    }
                }

                if (elements.length < 2) return;

                const openBracket = sourceCode.getFirstToken(pattern);
                const closeBracket = sourceCode.getLastToken(pattern);
                const elemIndent = " ".repeat(baseIndent + 4);
                const bracketIndent = " ".repeat(baseIndent);

                if (openBracket.loc.end.line === elements[0].loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], elements[0].range[0]],
                            "\n" + elemIndent,
                        ),
                        message: "First destructured element should be on its own line when 2+ elements",
                        node: elements[0],
                    });
                }

                if (closeBracket.loc.start.line === elements[elements.length - 1].loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [elements[elements.length - 1].range[1], closeBracket.range[0]],
                            ",\n" + bracketIndent,
                        ),
                        message: "Closing bracket should be on its own line when 2+ elements",
                        node: closeBracket,
                    });
                }

                for (let i = 0; i < elements.length - 1; i += 1) {
                    const current = elements[i];
                    const next = elements[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(
                            current,
                            (token) => token.value === ",",
                        );

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + elemIndent,
                            ),
                            message: "Each destructured element should be on its own line when 2+ elements",
                            node: next,
                        });
                    }
                }
            }
        };

        // Check if arrow function is a callback argument
        const isCallbackArrowHandler = (node) => {
            if (node.type !== "ArrowFunctionExpression") return false;

            const { parent } = node;

            return parent && parent.type === "CallExpression" && parent.arguments.includes(node);
        };

        const checkFunctionHandler = (node) => {
            const params = node.params;

            if (params.length === 0) return;

            const isCallback = isCallbackArrowHandler(node);

            // Find opening paren
            let openParen = sourceCode.getFirstToken(node);

            while (openParen && openParen.value !== "(") {
                openParen = sourceCode.getTokenAfter(openParen);
            }

            if (!openParen) return;

            const lastParam = params[params.length - 1];
            const closeParen = sourceCode.getTokenAfter(lastParam, (t) => t.value === ")");

            if (!closeParen) return;

            const firstParam = params[0];
            const isMultiLine = openParen.loc.end.line !== closeParen.loc.start.line;
            const paramsText = params.map((p) => getCleanParamTextHandler(p)).join(", ");
            const currentText = sourceCode.text.slice(
                openParen.range[1],
                closeParen.range[0],
            );

            // Callback arrow functions with 2+ params: each param on its own line
            // This handles both simple params (item, index) and mixed params ({ item }, index)
            if (isCallback && params.length >= 2) {
                // Calculate proper indent based on line's base indentation, not the paren column
                // This ensures consistent indentation for callbacks in method chains
                const lineText = sourceCode.lines[openParen.loc.start.line - 1];
                const lineIndent = lineText.match(/^(\s*)/)[1].length;
                const paramIndent = " ".repeat(lineIndent + 4);
                const parenIndent = " ".repeat(lineIndent);

                // Check if first param is on same line as opening paren
                if (openParen.loc.end.line === firstParam.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], firstParam.range[0]],
                            "\n" + paramIndent,
                        ),
                        message: "Callback arrow with 2+ params: first param should be on its own line",
                        node: firstParam,
                    });
                }

                // Check if closing paren is on same line as last param
                if (closeParen.loc.start.line === lastParam.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastParam.range[1], closeParen.range[0]],
                            ",\n" + parenIndent,
                        ),
                        message: "Callback arrow with 2+ params: closing paren should be on its own line",
                        node: closeParen,
                    });
                }

                // Check each param is on its own line
                for (let i = 0; i < params.length - 1; i += 1) {
                    const current = params[i];
                    const next = params[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(
                            current,
                            (token) => token.value === ",",
                        );

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + paramIndent,
                            ),
                            message: "Callback arrow with 2+ params: each param should be on its own line",
                            node: next,
                        });
                    }
                }

                return;
            }

            // Skip single-param callback arrow functions (handled by opening-brackets-same-line)
            if (isCallback) return;

            // 1-2 simple params without complex destructuring: keep on same line
            if (params.length <= 2 && !hasComplexDestructuredParamHandler(params)) {
                const needsSpacingFix = !isMultiLine && params.length > 1 && currentText !== paramsText;

                if (isMultiLine || needsSpacingFix) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], closeParen.range[0]],
                            paramsText,
                        ),
                        message: isMultiLine
                            ? "Function parameters should be on same line when 2 or fewer without complex destructuring"
                            : "Missing space after comma between parameters",
                        node,
                    });
                }

                return;
            }

            // 3+ params OR has destructuring: each param on its own line
            const paramIndent = " ".repeat(firstParam.loc.start.column);
            const parenIndent = " ".repeat(openParen.loc.start.column);

            // Skip opening brace check for single ObjectPattern param (handled by opening-brackets-same-line)
            const isSingleObjectPattern = params.length === 1 && (firstParam.type === "ObjectPattern" || (firstParam.type === "AssignmentPattern" && firstParam.left.type === "ObjectPattern"));

            if (!isSingleObjectPattern && openParen.loc.end.line === firstParam.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], firstParam.range[0]],
                        "\n" + paramIndent,
                    ),
                    message: "First parameter should be on its own line when more than 2 parameters or has destructuring",
                    node: firstParam,
                });
            }

            // Skip closing paren check for single ObjectPattern param (opening-brackets-same-line keeps }) together)
            if (!isSingleObjectPattern && closeParen.loc.start.line === lastParam.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastParam.range[1], closeParen.range[0]],
                        ",\n" + parenIndent,
                    ),
                    message: "Closing parenthesis should be on its own line when more than 2 parameters or has destructuring",
                    node: closeParen,
                });
            }

            for (let i = 0; i < params.length - 1; i += 1) {
                const current = params[i];
                const next = params[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + paramIndent,
                        ),
                        message: "Each parameter should be on its own line when more than 2 parameters or has destructuring",
                        node: next,
                    });
                }
            }

            // Check nested destructuring inside each param
            for (const p of params) {
                const pIndent = p.loc.start.column;

                checkDestructuredParamHandler(p, pIndent);
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce function parameters on separate lines when more than 2" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Function Params
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function parameter lists should not contain empty lines
 *   between parameters or after opening/before closing parens.
 *   Also checks inside ObjectPattern (destructuring) params for
 *   empty lines after {, before }, or between properties.
 *
 * ✓ Good:
 *   function test(
 *       param1,
 *       param2,
 *   ) {}
 *
 *   const Button = ({
 *       children,
 *       className,
 *   }) => {};
 *
 * ✗ Bad:
 *   function test(
 *       param1,
 *
 *       param2,
 *   ) {}
 *
 *   const Button = ({
 *
 *       children,
 *       className,
 *   }) => {};
 */
const noEmptyLinesInFunctionParams = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkFunctionHandler = (node) => {
            const params = node.params;

            if (params.length === 0) return;

            const firstParam = params[0];
            const lastParam = params[params.length - 1];

            // Find opening paren - must be WITHIN this function's range (not from an outer call expression)
            const tokenBeforeFirstParam = sourceCode.getTokenBefore(firstParam);
            // Check that the ( is within this function's range (not from .map( or similar)
            const hasParenAroundParams = tokenBeforeFirstParam
                && tokenBeforeFirstParam.value === "("
                && tokenBeforeFirstParam.range[0] >= node.range[0];

            // Only check open/close paren spacing if params are wrapped in parentheses
            if (hasParenAroundParams) {
                const openParen = tokenBeforeFirstParam;
                const closeParen = sourceCode.getTokenAfter(lastParam);

                // Verify closeParen is actually a ) right after lastParam AND within this function's range
                if (closeParen && closeParen.value === ")" && closeParen.range[1] <= (node.body ? node.body.range[0] : node.range[1])) {
                    if (firstParam.loc.start.line - openParen.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openParen.range[1], firstParam.range[0]],
                                "\n" + " ".repeat(firstParam.loc.start.column),
                            ),
                            message: "No empty line after opening parenthesis in function parameters",
                            node: firstParam,
                        });
                    }

                    if (closeParen.loc.start.line - lastParam.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastParam.range[1], closeParen.range[0]],
                                "\n" + " ".repeat(closeParen.loc.start.column),
                            ),
                            message: "No empty line before closing parenthesis in function parameters",
                            node: lastParam,
                        });
                    }
                }
            }

            for (let i = 0; i < params.length - 1; i += 1) {
                const current = params[i];
                const next = params[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty line between function parameters",
                        node: next,
                    });
                }
            }

            // Check inside ObjectPattern params for empty lines between destructured props
            params.forEach((param) => {
                if (param.type === "ObjectPattern" && param.properties.length > 0) {
                    const firstProp = param.properties[0];
                    const lastProp = param.properties[param.properties.length - 1];

                    // Find the opening brace of ObjectPattern
                    const openBrace = sourceCode.getFirstToken(param);

                    if (openBrace && openBrace.value === "{") {
                        // Check for empty line after opening brace
                        if (firstProp.loc.start.line - openBrace.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [openBrace.range[1], firstProp.range[0]],
                                    "\n" + " ".repeat(firstProp.loc.start.column),
                                ),
                                message: "No empty line after opening brace in destructuring",
                                node: firstProp,
                            });
                        }
                    }

                    // Find the closing brace of ObjectPattern (first } after last prop, not last token which could be from type annotation)
                    const closeBrace = sourceCode.getTokenAfter(lastProp, (t) => t.value === "}");

                    if (closeBrace) {
                        // Check for empty line before closing brace
                        if (closeBrace.loc.start.line - lastProp.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastProp.range[1], closeBrace.range[0]],
                                    "\n" + " ".repeat(closeBrace.loc.start.column),
                                ),
                                message: "No empty line before closing brace in destructuring",
                                node: lastProp,
                            });
                        }
                    }

                    // Check for empty lines between properties
                    if (param.properties.length > 1) {
                        for (let i = 0; i < param.properties.length - 1; i += 1) {
                            const current = param.properties[i];
                            const next = param.properties[i + 1];

                            if (next.loc.start.line - current.loc.end.line > 1) {
                                const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [commaToken.range[1], next.range[0]],
                                        "\n" + " ".repeat(next.loc.start.column),
                                    ),
                                    message: "No empty lines between destructured properties",
                                    node: next,
                                });
                            }
                        }
                    }
                }
            });
        };

        // Check TSTypeLiteral for empty lines (type annotation objects like { prop: Type })
        const checkTypeLiteralHandler = (node) => {
            if (!node.members || node.members.length === 0) return;

            const firstMember = node.members[0];
            const lastMember = node.members[node.members.length - 1];

            // Find opening brace
            const openBrace = sourceCode.getFirstToken(node);

            if (openBrace && openBrace.value === "{") {
                // Check for empty line after opening brace
                if (firstMember.loc.start.line - openBrace.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], firstMember.range[0]],
                            "\n" + " ".repeat(firstMember.loc.start.column),
                        ),
                        message: "No empty line after opening brace in type definition",
                        node: firstMember,
                    });
                }
            }

            // Find closing brace
            const closeBrace = sourceCode.getLastToken(node);

            if (closeBrace && closeBrace.value === "}") {
                // Check for empty line before closing brace
                if (closeBrace.loc.start.line - lastMember.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBrace.range[0]],
                            "\n" + " ".repeat(closeBrace.loc.start.column),
                        ),
                        message: "No empty line before closing brace in type definition",
                        node: lastMember,
                    });
                }
            }

            // Check for empty lines between members
            for (let i = 0; i < node.members.length - 1; i += 1) {
                const current = node.members[i];
                const next = node.members[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [current.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty lines between type members",
                        node: next,
                    });
                }
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            TSTypeLiteral: checkTypeLiteralHandler,
        };
    },
    meta: {
        docs: { description: "Disallow empty lines in function parameters and type definitions" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Object Destructure
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that when a function parameter (object) is accessed via dot notation
 *   in the function body, it should be destructured at the top of the function.
 *   Also enforces that non-component functions should NOT destructure params in
 *   the function signature - use simple typed params instead.
 *
 * ✓ Good (Non-component function):
 *   const createHandler = async (data: FormInterface) => {
 *       const { firstName, lastName, email } = data;
 *       console.log(firstName, lastName);
 *   }
 *
 * ✗ Bad (Non-component function):
 *   const createHandler = async (data: FormInterface) => {
 *       console.log(data.firstName);  // Should destructure
 *   }
 *
 * ✗ Bad (Non-component function):
 *   const createHandler = async ({ firstName }: FormInterface) => {  // No destructure in signature
 *       ...
 *   }
 */
const functionObjectDestructure = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Track imports from module paths that should use dot notation, not destructure
        // This improves searchability: api.loginHandler is easier to find than loginHandler
        const moduleImports = new Set();

        // Folders that contain modules which should be accessed via dot notation
        const modulePathPatterns = [
            "api",
            "apis",
            "config",
            "configs",
            "constants",
            "data",
            "helpers",
            "lib",
            "routes",
            "services",
            "utils",
            "utilities",
        ];

        const isModuleImportPath = (importPath) => {
            // Match paths like @/services, @/constants, ./data, ../config, etc.
            return modulePathPatterns.some((pattern) => importPath === `@/${pattern}`
                    || importPath.endsWith(`/${pattern}`)
                    || importPath.includes(`/${pattern}/`)
                    || new RegExp(`^\\.?\\.?/${pattern}$`).test(importPath));
        };

        const checkImportHandler = (node) => {
            if (!node.source || !node.source.value) return;

            const importPath = node.source.value;

            if (isModuleImportPath(importPath)) {
                // Track all imported specifiers from module paths
                node.specifiers.forEach((spec) => {
                    if (spec.type === "ImportSpecifier" && spec.local && spec.local.name) {
                        moduleImports.add(spec.local.name);
                    } else if (spec.type === "ImportDefaultSpecifier" && spec.local && spec.local.name) {
                        moduleImports.add(spec.local.name);
                    }
                });
            }
        };

        // Find all references to a variable name in a scope (with parent tracking)
        const findAllReferencesHandler = (scope, varName, declNode) => {
            const references = [];

            const visitNode = (n, parent) => {
                if (!n || typeof n !== "object") return;

                // Skip the declaration itself
                if (n === declNode) return;

                // Found a reference
                if (n.type === "Identifier" && n.name === varName) {
                    // Make sure it's not a property key or part of a member expression property
                    const isMemberProp = parent && parent.type === "MemberExpression" && parent.property === n && !parent.computed;
                    const isObjectKey = parent && parent.type === "Property" && parent.key === n && !parent.computed;
                    const isShorthandValue = parent && parent.type === "Property" && parent.shorthand && parent.value === n;

                    // Include shorthand properties as references (they use the variable)
                    if (!isMemberProp && !isObjectKey) {
                        references.push(n);
                    }
                }

                for (const key of Object.keys(n)) {
                    if (key === "parent" || key === "range" || key === "loc") continue;

                    const child = n[key];

                    if (Array.isArray(child)) {
                        child.forEach((c) => visitNode(c, n));
                    } else if (child && typeof child === "object" && child.type) {
                        visitNode(child, n);
                    }
                }
            };

            visitNode(scope, null);

            return references;
        };

        // Check for destructuring of module imports (not allowed)
        const checkVariableDeclarationHandler = (node) => {
            for (const decl of node.declarations) {
                // Check for ObjectPattern destructuring
                if (decl.id.type === "ObjectPattern" && decl.init) {
                    let sourceVarName = null;

                    // Direct destructuring: const { x } = moduleImport
                    if (decl.init.type === "Identifier") {
                        sourceVarName = decl.init.name;
                    }

                    // Nested destructuring: const { x } = moduleImport.nested
                    if (decl.init.type === "MemberExpression") {
                        let obj = decl.init;

                        while (obj.type === "MemberExpression") {
                            obj = obj.object;
                        }

                        if (obj.type === "Identifier") {
                            sourceVarName = obj.name;
                        }
                    }

                    if (sourceVarName && moduleImports.has(sourceVarName)) {
                        // Get destructured properties with their local names
                        const destructuredProps = decl.id.properties
                            .filter((p) => p.type === "Property" && p.key && p.key.name)
                            .map((p) => ({
                                key: p.key.name,
                                local: p.value && p.value.type === "Identifier" ? p.value.name : p.key.name,
                            }));

                        const sourceText = sourceCode.getText(decl.init);

                        // Find the containing function/program to search for references
                        let scope = node.parent;

                        while (scope && scope.type !== "BlockStatement" && scope.type !== "Program") {
                            scope = scope.parent;
                        }

                        context.report({
                            fix: scope
                                ? (fixer) => {
                                    const fixes = [];

                                    // Replace all references with dot notation
                                    destructuredProps.forEach(({ key, local }) => {
                                        const refs = findAllReferencesHandler(scope, local, decl);

                                        refs.forEach((ref) => {
                                            fixes.push(fixer.replaceText(ref, `${sourceText}.${key}`));
                                        });
                                    });

                                    // Remove the entire declaration statement
                                    // If it's the only declaration in the statement, remove the whole statement
                                    if (node.declarations.length === 1) {
                                        // Find the full statement including newline
                                        const tokenBefore = sourceCode.getTokenBefore(node);
                                        const tokenAfter = sourceCode.getTokenAfter(node);
                                        let start = node.range[0];
                                        let end = node.range[1];

                                        // Include leading whitespace/newline
                                        if (tokenBefore) {
                                            const textBetween = sourceCode.text.slice(tokenBefore.range[1], node.range[0]);
                                            const newlineIndex = textBetween.lastIndexOf("\n");

                                            if (newlineIndex !== -1) {
                                                start = tokenBefore.range[1] + newlineIndex;
                                            }
                                        }

                                        // Include trailing newline
                                        if (tokenAfter) {
                                            const textBetween = sourceCode.text.slice(node.range[1], tokenAfter.range[0]);
                                            const newlineIndex = textBetween.indexOf("\n");

                                            if (newlineIndex !== -1) {
                                                end = node.range[1] + newlineIndex + 1;
                                            }
                                        }

                                        fixes.push(fixer.removeRange([start, end]));
                                    } else {
                                        // Remove just this declarator
                                        fixes.push(fixer.remove(decl));
                                    }

                                    return fixes;
                                }
                                : undefined,
                            message: `Do not destructure module imports. Use dot notation for searchability: "${sourceText}.${destructuredProps[0].key}" instead of destructuring`,
                            node: decl.id,
                        });
                    }
                }
            }
        };

        const containsJsxHandler = (node) => {
            if (!node) return false;

            if (node.type === "JSXElement" || node.type === "JSXFragment") return true;

            if (node.type === "BlockStatement") {
                for (const statement of node.body) {
                    if (statement.type === "ReturnStatement" && statement.argument) {
                        if (containsJsxHandler(statement.argument)) return true;
                    }
                }
            }

            if (node.type === "ConditionalExpression") {
                return containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);
            }

            if (node.type === "LogicalExpression") {
                return containsJsxHandler(node.left) || containsJsxHandler(node.right);
            }

            if (node.type === "ParenthesizedExpression") {
                return containsJsxHandler(node.expression);
            }

            return false;
        };

        const isReactComponentHandler = (node) => {
            let componentName = null;

            if (node.parent) {
                if (node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    componentName = node.parent.id.name;
                } else if (node.id && node.id.type === "Identifier") {
                    componentName = node.id.name;
                }
            }

            if (componentName && /^[A-Z]/.test(componentName)) {
                const body = node.body;

                return containsJsxHandler(body);
            }

            return false;
        };

        // Common array/object methods that should NOT trigger destructuring
        const SKIP_METHODS = new Set([
            "map", "filter", "reduce", "forEach", "find", "findIndex", "some", "every",
            "flat", "flatMap", "sort", "reverse", "slice", "splice", "concat", "join",
            "includes", "indexOf", "lastIndexOf", "push", "pop", "shift", "unshift",
            "keys", "values", "entries", "toString", "toLocaleString", "length",
        ]);

        // Find all member expressions accessing a specific object in a function body
        const findObjectAccessesHandler = (body, paramName) => {
            const accesses = [];
            const methodCallees = new Set();

            // First pass: collect all MemberExpressions that are method callees
            const collectMethodCallees = (node) => {
                if (!node || typeof node !== "object") return;

                // If this is a CallExpression and callee is a MemberExpression, mark it
                if (node.type === "CallExpression" && node.callee && node.callee.type === "MemberExpression") {
                    methodCallees.add(node.callee);
                }

                for (const key of Object.keys(node)) {
                    if (key === "parent") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach(collectMethodCallees);
                    } else if (child && typeof child === "object" && child.type) {
                        collectMethodCallees(child);
                    }
                }
            };

            collectMethodCallees(body);

            const visitNode = (node) => {
                if (!node || typeof node !== "object") return;

                // Check for member expression like param.prop
                if (node.type === "MemberExpression" && !node.computed) {
                    if (node.object.type === "Identifier" && node.object.name === paramName) {
                        const propName = node.property.name;

                        // Skip if this is a method call (callee of CallExpression)
                        if (methodCallees.has(node)) return;

                        // Skip known array/object methods (as backup)
                        if (!SKIP_METHODS.has(propName)) {
                            accesses.push({
                                node,
                                property: propName,
                            });
                        }
                    }
                }

                // Recurse into child nodes
                for (const key of Object.keys(node)) {
                    if (key === "parent") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach(visitNode);
                    } else if (child && typeof child === "object" && child.type) {
                        visitNode(child);
                    }
                }
            };

            visitNode(body);

            return accesses;
        };

        // Check if block body only contains destructuring/assignments + return (no other logic)
        const isDestructureAndReturnOnlyHandler = (blockBody, paramName) => {
            if (blockBody.type !== "BlockStatement") return null;

            const statements = blockBody.body;

            if (statements.length === 0) return null;

            // Last statement must be return
            const lastStatement = statements[statements.length - 1];

            if (lastStatement.type !== "ReturnStatement" || !lastStatement.argument) return null;

            // Track destructured variables and their sources
            const destructuredProps = [];
            const knownVars = new Set([paramName]);

            for (let i = 0; i < statements.length - 1; i += 1) {
                const stmt = statements[i];

                // Must be variable declaration
                if (stmt.type !== "VariableDeclaration") return null;

                for (const decl of stmt.declarations) {
                    if (!decl.init) return null;

                    // Case 1: ObjectPattern destructuring - const { row } = data
                    if (decl.id.type === "ObjectPattern") {
                        // Must be destructuring from known variable
                        if (decl.init.type !== "Identifier" || !knownVars.has(decl.init.name)) {
                            return null;
                        }

                        for (const prop of decl.id.properties) {
                            if (prop.type === "Property" && prop.key.type === "Identifier") {
                                // Only allow simple destructuring, not nested patterns
                                if (prop.value.type === "ObjectPattern" || prop.value.type === "ArrayPattern") {
                                    return null;
                                }

                                const varName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                knownVars.add(varName);

                                if (decl.init.name === paramName) {
                                    destructuredProps.push(prop.key.name);
                                }
                            }
                        }
                    } else if (decl.id.type === "Identifier") {
                        // Case 2: Simple assignment from member expression - const account = row.original
                        if (decl.init.type === "MemberExpression" && !decl.init.computed) {
                            if (decl.init.object.type === "Identifier" && knownVars.has(decl.init.object.name)) {
                                // This is just extracting a property, still "destructuring-like"
                                knownVars.add(decl.id.name);
                            } else {
                                return null;
                            }
                        } else {
                            // Some other assignment - this is logic
                            return null;
                        }
                    } else {
                        return null;
                    }
                }
            }

            if (destructuredProps.length === 0) return null;

            return { destructuredProps, returnStatement: lastStatement };
        };

        // Check if block body has actual logic (not just destructuring + return)
        const hasActualLogicHandler = (blockBody, paramName) => {
            if (blockBody.type !== "BlockStatement") return false;

            const statements = blockBody.body;
            const knownVars = new Set([paramName]);

            for (const stmt of statements) {
                // Return statement at end is not logic
                if (stmt.type === "ReturnStatement") continue;

                // Variable declarations
                if (stmt.type === "VariableDeclaration") {
                    for (const decl of stmt.declarations) {
                        if (!decl.init) return true; // No init = logic

                        // ObjectPattern destructuring is not logic
                        if (decl.id.type === "ObjectPattern" && decl.init.type === "Identifier" && knownVars.has(decl.init.name)) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.value.type === "Identifier") {
                                    knownVars.add(prop.value.name);
                                } else if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    knownVars.add(prop.key.name);
                                }
                            }

                            continue;
                        }

                        // Simple assignment from known var's property is not logic
                        if (decl.id.type === "Identifier" && decl.init.type === "MemberExpression") {
                            if (decl.init.object.type === "Identifier" && knownVars.has(decl.init.object.name)) {
                                knownVars.add(decl.id.name);

                                continue;
                            }
                        }

                        // Anything else is logic
                        return true;
                    }
                } else {
                    // Any other statement type is logic
                    return true;
                }
            }

            return false;
        };

        // Find all member expressions accessing a destructured variable
        const findNestedAccessesHandler = (body, destructuredVarName, originalParamName) => {
            const accesses = [];
            const methodCallees = new Set();

            // First pass: collect all MemberExpressions that are method callees
            const collectMethodCallees = (node) => {
                if (!node || typeof node !== "object") return;

                if (node.type === "CallExpression" && node.callee && node.callee.type === "MemberExpression") {
                    methodCallees.add(node.callee);
                }

                for (const key of Object.keys(node)) {
                    if (key === "parent") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach(collectMethodCallees);
                    } else if (child && typeof child === "object" && child.type) {
                        collectMethodCallees(child);
                    }
                }
            };

            collectMethodCallees(body);

            const visitNode = (n) => {
                if (!n || typeof n !== "object") return;

                // Check for member expression like destructuredVar.prop
                if (n.type === "MemberExpression" && !n.computed) {
                    if (n.object.type === "Identifier" && n.object.name === destructuredVarName) {
                        const propName = n.property.name;

                        // Skip if this is a method call (callee of CallExpression)
                        if (methodCallees.has(n)) return;

                        if (!SKIP_METHODS.has(propName)) {
                            accesses.push({
                                node: n,
                                property: propName,
                            });
                        }
                    }
                }

                for (const key of Object.keys(n)) {
                    if (key === "parent") continue;

                    const child = n[key];

                    if (Array.isArray(child)) {
                        child.forEach(visitNode);
                    } else if (child && typeof child === "object" && child.type) {
                        visitNode(child);
                    }
                }
            };

            visitNode(body);

            return accesses;
        };

        // Get all destructured variables from block body
        const getDestructuredVariablesHandler = (blockBody, paramName) => {
            const destructured = new Map(); // varName -> { fromParam: boolean, fromVar: string|null, properties: string[] }

            if (blockBody.type !== "BlockStatement") return destructured;

            for (const stmt of blockBody.body) {
                if (stmt.type !== "VariableDeclaration") continue;

                for (const decl of stmt.declarations) {
                    if (decl.id.type === "ObjectPattern" && decl.init) {
                        // Direct destructuring from param: const { row } = data
                        if (decl.init.type === "Identifier" && decl.init.name === paramName) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    const varName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                    destructured.set(varName, {
                                        fromParam: true,
                                        fromVar: null,
                                        originalProp: prop.key.name,
                                    });
                                }
                            }
                        }

                        // Destructuring from previously destructured variable
                        // const { original } = row (where row was destructured from param)
                        if (decl.init.type === "Identifier" && destructured.has(decl.init.name)) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    const varName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                    destructured.set(varName, {
                                        fromParam: false,
                                        fromVar: decl.init.name,
                                        originalProp: prop.key.name,
                                    });
                                }
                            }
                        }
                    }

                    // Simple assignment from destructured var: const account = row.original
                    if (decl.id.type === "Identifier" && decl.init && decl.init.type === "MemberExpression") {
                        const memberExpr = decl.init;

                        if (memberExpr.object.type === "Identifier" && destructured.has(memberExpr.object.name)) {
                            if (!memberExpr.computed && memberExpr.property.type === "Identifier") {
                                destructured.set(decl.id.name, {
                                    fromParam: false,
                                    fromVar: memberExpr.object.name,
                                    originalProp: memberExpr.property.name,
                                });
                            }
                        }
                    }
                }
            }

            return destructured;
        };

        // Find the destructuring statement and property node for a variable
        const findDestructuringStatementHandler = (blockBody, varName, paramName) => {
            if (blockBody.type !== "BlockStatement") return null;

            for (const stmt of blockBody.body) {
                if (stmt.type !== "VariableDeclaration") continue;

                for (const decl of stmt.declarations) {
                    if (decl.id.type === "ObjectPattern" && decl.init) {
                        // Check if this destructuring creates the variable we're looking for
                        if (decl.init.type === "Identifier" && decl.init.name === paramName) {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    const createdVarName = prop.value.type === "Identifier" ? prop.value.name : prop.key.name;

                                    if (createdVarName === varName) {
                                        return {
                                            declarator: decl,
                                            property: prop,
                                            statement: stmt,
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return null;
        };

        const checkFunctionHandler = (node) => {
            const isComponent = isReactComponentHandler(node);
            const params = node.params;
            const body = node.body;

            if (params.length === 0 || !body) return;

            // Arrow functions with expression body (direct return, no block)
            // For these, destructuring in params IS allowed/encouraged since there's no body
            if (node.type === "ArrowFunctionExpression" && body.type !== "BlockStatement") {
                // Check if any Identifier param is accessed via dot notation
                // If so, suggest destructuring in params
                params.forEach((param) => {
                    if (param.type !== "Identifier") return;

                    const paramName = param.name;

                    // Check if param is used in a spread operation - skip because destructuring would break it
                    let usedInSpread = false;
                    const checkSpread = (n, parent) => {
                        if (!n || typeof n !== "object") return;
                        if (n.type === "SpreadElement" && n.argument && n.argument.type === "Identifier" && n.argument.name === paramName) {
                            usedInSpread = true;

                            return;
                        }
                        for (const key of Object.keys(n)) {
                            if (key === "parent") continue;
                            const child = n[key];
                            if (Array.isArray(child)) child.forEach((c) => checkSpread(c, n));
                            else if (child && typeof child === "object" && child.type) checkSpread(child, n);
                        }
                    };
                    checkSpread(body, null);

                    if (usedInSpread) return;

                    const accesses = findObjectAccessesHandler(body, paramName);

                    if (accesses.length > 0) {
                        const accessedProps = [...new Set(accesses.map((a) => a.property))];

                        // Count all actual references to paramName (excluding object property keys)
                        const allRefs = [];
                        const countRefs = (n, parent) => {
                            if (!n || typeof n !== "object") return;
                            if (n.type === "Identifier" && n.name === paramName) {
                                // Exclude object property keys (non-computed)
                                const isPropertyKey = parent && parent.type === "Property" && parent.key === n && !parent.computed;

                                if (!isPropertyKey) {
                                    allRefs.push(n);
                                }
                            }
                            for (const key of Object.keys(n)) {
                                if (key === "parent") continue;
                                const child = n[key];
                                if (Array.isArray(child)) child.forEach((c) => countRefs(c, n));
                                else if (child && typeof child === "object" && child.type) countRefs(child, n);
                            }
                        };
                        countRefs(body, null);

                        // Only auto-fix if all references are covered by the detected dot notation accesses
                        const canAutoFix = allRefs.length === accesses.length;

                        context.report({
                            fix: canAutoFix
                                ? (fixer) => {
                                    const fixes = [];

                                    // Replace param with destructured pattern
                                    fixes.push(fixer.replaceText(param, `{ ${accessedProps.join(", ")} }`));

                                    // Replace all param.prop with just prop
                                    accesses.forEach((access) => {
                                        fixes.push(fixer.replaceText(access.node, access.property));
                                    });

                                    return fixes;
                                }
                                : undefined,
                            message: `Parameter "${paramName}" is accessed via dot notation. For arrow functions with direct returns, destructure in the parameter: "({ ${accessedProps.join(", ")} })"`,
                            node: accesses[0].node,
                        });
                    }
                });

                return;
            }

            // For non-components with block body: check if first param is destructured in signature (not allowed)
            if (!isComponent) {
                const firstParam = params[0];

                if (firstParam.type === "ObjectPattern") {
                    context.report({
                        message: "Non-component functions should not destructure parameters in the signature. Use a typed parameter (e.g., \"data: InterfaceType\") and destructure in the function body instead.",
                        node: firstParam,
                    });

                    return;
                }
            }

            // Check for block body that only contains destructuring + return (can be converted to expression)
            if (node.type === "ArrowFunctionExpression" && body.type === "BlockStatement") {
                const firstParam = params[0];

                if (firstParam && firstParam.type === "Identifier") {
                    const result = isDestructureAndReturnOnlyHandler(body, firstParam.name);

                    if (result) {
                        context.report({
                            message: `This function only destructures and returns. Convert to expression body with destructured param: "({ ${result.destructuredProps.join(", ")} }) => ..."`,
                            node: body,
                        });

                        return;
                    }
                }
            }

            // Check for nested property access from destructured variables
            // e.g., const { row } = data; then row.original should be nested destructured
            // ONLY when there's actual logic in the function (not just destructuring + return)
            if (body.type === "BlockStatement") {
                const firstParam = params[0];

                if (firstParam && firstParam.type === "Identifier") {
                    // Only enforce nested destructuring when there's actual logic
                    if (hasActualLogicHandler(body, firstParam.name)) {
                        const destructuredVars = getDestructuredVariablesHandler(body, firstParam.name);

                        for (const [varName, info] of destructuredVars) {
                            const accesses = findNestedAccessesHandler(body, varName, firstParam.name);

                            if (accesses.length > 0) {
                                const accessedProps = [...new Set(accesses.map((a) => a.property))];

                                // Find the original destructuring statement
                                const destructInfo = findDestructuringStatementHandler(body, varName, firstParam.name);

                                context.report({
                                    fix: destructInfo
                                        ? (fixer) => {
                                            const fixes = [];

                                            // Modify the destructuring property to use nested destructuring
                                            // e.g., { target } becomes { target: { value } }
                                            const { property } = destructInfo;
                                            const nestedDestructure = `${info.originalProp}: { ${accessedProps.join(", ")} }`;

                                            fixes.push(fixer.replaceText(property, nestedDestructure));

                                            // Replace all varName.prop accesses with just prop
                                            accesses.forEach((access) => {
                                                fixes.push(fixer.replaceText(access.node, access.property));
                                            });

                                            return fixes;
                                        }
                                        : undefined,
                                    message: `Variable "${varName}" is accessed via dot notation (${accessedProps.join(", ")}). Use nested destructuring instead: "const { ${info.originalProp}: { ${accessedProps.join(", ")} } } = ..."`,
                                    node: accesses[0].node,
                                });
                            }
                        }
                    }
                }
            }

            // For all functions with block body: check if any identifier param is accessed via dot notation
            params.forEach((param) => {
                if (param.type !== "Identifier") return;

                const paramName = param.name;
                const accesses = findObjectAccessesHandler(body, paramName);

                if (accesses.length > 0) {
                    const accessedProps = [...new Set(accesses.map((a) => a.property))];

                    context.report({
                        fix: (fixer) => {
                            const fixes = [];

                            // Get the first statement in the block body to insert before it
                            const firstStatement = body.body[0];

                            if (firstStatement) {
                                // Get indentation from the first statement
                                const firstStatementLine = sourceCode.lines[firstStatement.loc.start.line - 1];
                                const indent = firstStatementLine.match(/^\s*/)[0];

                                // Create the destructuring statement
                                const destructureStatement = `const { ${accessedProps.join(", ")} } = ${paramName};\n${indent}`;

                                // Insert at the beginning of the first statement
                                fixes.push(fixer.insertTextBefore(firstStatement, destructureStatement));
                            }

                            // Replace all param.prop accesses with just prop
                            accesses.forEach((access) => {
                                fixes.push(fixer.replaceText(access.node, access.property));
                            });

                            return fixes;
                        },
                        message: `Parameter "${paramName}" is accessed via dot notation. Destructure it at the top of the function body: "const { ${accessedProps.join(", ")} } = ${paramName};"`,
                        node: accesses[0].node,
                    });
                }
            });

            // For components: check if destructured props from signature are accessed via dot notation
            // e.g., ({ accountsData }) => { accountsData.items } should destructure accountsData at top
            if (isComponent && body.type === "BlockStatement") {
                const firstParam = params[0];

                if (firstParam && firstParam.type === "ObjectPattern") {
                    // Get all destructured prop names from the signature
                    const destructuredProps = firstParam.properties
                        .filter((prop) => prop.type === "Property" && prop.key.type === "Identifier")
                        .map((prop) => prop.value.type === "Identifier" ? prop.value.name : prop.key.name);

                    // Check each destructured prop for dot notation access in body
                    destructuredProps.forEach((propName) => {
                        const accesses = findObjectAccessesHandler(body, propName);

                        if (accesses.length > 0) {
                            const accessedProps = [...new Set(accesses.map((a) => a.property))];

                            context.report({
                                fix: (fixer) => {
                                    const fixes = [];

                                    // Get the first statement in the block body to insert before it
                                    const firstStatement = body.body[0];

                                    if (firstStatement) {
                                        // Get indentation from the first statement
                                        const firstStatementLine = sourceCode.lines[firstStatement.loc.start.line - 1];
                                        const indent = firstStatementLine.match(/^\s*/)[0];

                                        // Create the destructuring statement
                                        const destructureStatement = `const { ${accessedProps.join(", ")} } = ${propName};\n\n${indent}`;

                                        // Insert at the beginning of the first statement
                                        fixes.push(fixer.insertTextBefore(firstStatement, destructureStatement));
                                    }

                                    // Replace all prop.subprop accesses with just subprop
                                    accesses.forEach((access) => {
                                        fixes.push(fixer.replaceText(access.node, access.property));
                                    });

                                    return fixes;
                                },
                                message: `Prop "${propName}" is accessed via dot notation. Destructure it at the top of the component: "const { ${accessedProps.join(", ")} } = ${propName};"`,
                                node: accesses[0].node,
                            });
                        }
                    });
                }
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            ImportDeclaration: checkImportHandler,
            VariableDeclaration: checkVariableDeclarationHandler,
        };
    },
    meta: {
        docs: { description: "Enforce object parameters to be destructured in function body, not accessed via dot notation. Also prevent destructuring of data imports." },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

export {
    functionCallSpacing,
    functionDeclarationStyle,
    functionNamingConvention,
    functionParamsPerLine,
    noEmptyLinesInFunctionParams,
    functionObjectDestructure,
};
