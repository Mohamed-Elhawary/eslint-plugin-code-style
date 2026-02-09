/**
 * ───────────────────────────────────────────────────────────────
 * Rule: React Code Order
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces a consistent ordering of code blocks in React components
 *   and custom hooks. The order follows a logical dependency chain
 *   where declarations appear before their usage.
 *
 * Order (top to bottom):
 *   1. Props/params destructure (from function parameters)
 *   2. Destructured variables from props (const { x } = propValue)
 *   3. useRef declarations
 *   4. useState declarations
 *   5. useReducer declarations
 *   6. useSelector / useDispatch (Redux)
 *   7. Router hooks (useNavigate, useLocation, useParams, useSearchParams)
 *   8. Context hooks (useContext, useToast, etc.)
 *   9. Custom hooks (use* pattern)
 *   10. Derived state / computed variables (const x = hookValue.something)
 *   11. useMemo declarations
 *   12. useCallback declarations
 *   13. Handler functions (const x = () => {} or function declarations)
 *   14. useEffect / useLayoutEffect
 *   15. Return statement
 *
 * ✓ Good (Component):
 *   const MyComponent = ({ name }) => {
 *       const inputRef = useRef(null);
 *       const [count, setCount] = useState(0);
 *       const dispatch = useDispatch();
 *       const navigate = useNavigate();
 *       const { data } = useCustomHook();
 *       const computedValue = data?.value ?? 0;
 *       const memoizedValue = useMemo(() => ..., []);
 *       const handleClick = useCallback(() => ..., []);
 *       const submitHandler = () => { ... };
 *       useEffect(() => { ... }, []);
 *       return <div>...</div>;
 *   };
 *
 * ✓ Good (Custom Hook):
 *   const useCreateAccount = () => {
 *       const [loading, setLoading] = useState(false);
 *       const [created, setCreated] = useState(false);
 *       const dispatch = useDispatch();
 *       const { toast } = useToast();
 *       const createAccountHandler = async (data) => { ... };
 *       useEffect(() => { ... }, []);
 *       return { createAccountHandler, created, loading };
 *   };
 *
 * ✗ Bad:
 *   const useCreateAccount = () => {
 *       const { toast } = useToast();          // context hook before useState
 *       const [loading, setLoading] = useState(false);
 *       return { loading };
 *   };
 */
const reactCodeOrder = {
    create(context) {
        // Define the order categories
        const ORDER = {
            CALLBACK: 12,
            CONTEXT_HOOK: 8,
            CUSTOM_HOOK: 9,
            DERIVED_STATE: 10,
            EFFECT: 14,
            HANDLER_FUNCTION: 13,
            MEMO: 11,
            PROPS_DESTRUCTURE: 1,
            PROPS_DESTRUCTURE_BODY: 2,
            REDUCER: 5,
            REF: 3,
            RETURN: 15,
            ROUTER_HOOK: 7,
            SELECTOR_DISPATCH: 6,
            STATE: 4,
            UNKNOWN: 99,
        };

        const ORDER_NAMES = {
            1: "props destructure",
            2: "destructured variables from props",
            3: "useRef",
            4: "useState",
            5: "useReducer",
            6: "useSelector/useDispatch",
            7: "router hooks",
            8: "context hooks",
            9: "custom hooks",
            10: "derived state/computed variables",
            11: "useMemo",
            12: "useCallback",
            13: "handler functions",
            14: "useEffect/useLayoutEffect",
            15: "return statement",
            99: "unknown",
        };

        // Built-in React hooks
        const STATE_HOOKS = new Set(["useState"]);
        const REF_HOOKS = new Set(["useRef"]);
        const REDUCER_HOOKS = new Set(["useReducer"]);
        const EFFECT_HOOKS = new Set(["useEffect", "useLayoutEffect"]);
        const MEMO_HOOKS = new Set(["useMemo"]);
        const CALLBACK_HOOKS = new Set(["useCallback"]);

        // Redux hooks
        const REDUX_HOOKS = new Set(["useSelector", "useDispatch", "useStore"]);

        // Router hooks (react-router, next/navigation, etc.)
        const ROUTER_HOOKS = new Set([
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "useRouter",
            "usePathname",
            "useMatch",
            "useMatches",
            "useRouteLoaderData",
            "useNavigation",
            "useResolvedPath",
            "useHref",
            "useInRouterContext",
            "useNavigationType",
            "useOutlet",
            "useOutletContext",
            "useRouteError",
            "useRoutes",
            "useBlocker",
        ]);

        // Common context hooks
        const CONTEXT_HOOKS = new Set([
            "useContext",
            "useToast",
            "useTheme",
            "useAuth",
            "useModal",
            "useDialog",
            "useNotification",
            "useI18n",
            "useTranslation",
            "useIntl",
            "useForm",
            "useFormContext",
        ]);

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

        // Get the function name from a node
        const getFunctionNameHandler = (node) => {
            if (node.parent) {
                if (node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    return node.parent.id.name;
                }

                if (node.id && node.id.type === "Identifier") {
                    return node.id.name;
                }
            }

            return null;
        };

        const isReactComponentHandler = (node) => {
            const componentName = getFunctionNameHandler(node);

            if (componentName && /^[A-Z]/.test(componentName)) {
                const body = node.body;

                return containsJsxHandler(body);
            }

            return false;
        };

        // Check if function is a custom hook (starts with "use" followed by uppercase)
        const isCustomHookHandler = (node) => {
            const hookName = getFunctionNameHandler(node);

            if (hookName && /^use[A-Z]/.test(hookName)) {
                // Must have a block body (not implicit return)
                if (node.body.type !== "BlockStatement") return false;

                // Should not return JSX (that would make it a component)
                if (containsJsxHandler(node.body)) return false;

                return true;
            }

            return false;
        };

        // Get the hook name from a call expression
        const getHookNameHandler = (node) => {
            if (node.type !== "CallExpression") return null;

            if (node.callee.type === "Identifier") {
                return node.callee.name;
            }

            // Handle cases like React.useState
            if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
                return node.callee.property.name;
            }

            return null;
        };

        // Check if a call expression is a hook call (starts with "use")
        const isHookCallHandler = (node) => {
            const name = getHookNameHandler(node);

            return name && /^use[A-Z]/.test(name);
        };

        // Check if expression is a function (arrow or regular)
        const isFunctionExpressionHandler = (node) => node
            && (node.type === "ArrowFunctionExpression"
            || node.type === "FunctionExpression");

        // Check if a statement is a handler function declaration
        const isHandlerFunctionHandler = (statement) => {
            // Arrow function assigned to variable: const x = () => {}
            if (statement.type === "VariableDeclaration") {
                const decl = statement.declarations[0];

                if (decl && decl.init && isFunctionExpressionHandler(decl.init)) {
                    // Make sure it's not a hook-assigned function
                    if (decl.init.type === "CallExpression") return false;

                    return true;
                }
            }

            // Function declaration: function x() {}
            if (statement.type === "FunctionDeclaration") {
                return true;
            }

            return false;
        };

        // Get the category of a statement
        const getStatementCategoryHandler = (statement, propNames = new Set()) => {
            // Return statement
            if (statement.type === "ReturnStatement") {
                return ORDER.RETURN;
            }

            // Expression statements (mostly hook calls like useEffect)
            if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
                const hookName = getHookNameHandler(statement.expression);

                if (hookName) {
                    if (EFFECT_HOOKS.has(hookName)) return ORDER.EFFECT;

                    // Other standalone hook calls (rare but possible)
                    if (isHookCallHandler(statement.expression)) return ORDER.CUSTOM_HOOK;
                }

                return ORDER.UNKNOWN;
            }

            // Variable declarations
            if (statement.type === "VariableDeclaration") {
                const declarations = statement.declarations;

                // Check if any declaration is a hook call
                for (const decl of declarations) {
                    if (!decl.init) continue;

                    // Direct hook call: const x = useHook()
                    if (decl.init.type === "CallExpression") {
                        const hookName = getHookNameHandler(decl.init);

                        if (hookName) {
                            if (STATE_HOOKS.has(hookName)) return ORDER.STATE;
                            if (REF_HOOKS.has(hookName)) return ORDER.REF;
                            if (REDUCER_HOOKS.has(hookName)) return ORDER.REDUCER;
                            if (REDUX_HOOKS.has(hookName)) return ORDER.SELECTOR_DISPATCH;
                            if (ROUTER_HOOKS.has(hookName)) return ORDER.ROUTER_HOOK;
                            if (CONTEXT_HOOKS.has(hookName)) return ORDER.CONTEXT_HOOK;
                            if (MEMO_HOOKS.has(hookName)) return ORDER.MEMO;
                            if (CALLBACK_HOOKS.has(hookName)) return ORDER.CALLBACK;

                            // Custom hooks (any use* pattern not in the above lists)
                            if (isHookCallHandler(decl.init)) return ORDER.CUSTOM_HOOK;
                        }
                    }

                    // Handler function
                    if (isFunctionExpressionHandler(decl.init)) {
                        return ORDER.HANDLER_FUNCTION;
                    }
                }

                // Check for destructuring from props (const { x } = propValue)
                for (const decl of declarations) {
                    if (decl.id.type === "ObjectPattern" && decl.init) {
                        // Direct prop destructure: const { x } = propValue
                        if (decl.init.type === "Identifier" && propNames.has(decl.init.name)) {
                            return ORDER.PROPS_DESTRUCTURE_BODY;
                        }

                        // Nested prop destructure: const { x } = propValue.nested
                        if (decl.init.type === "MemberExpression") {
                            let obj = decl.init;

                            while (obj.type === "MemberExpression") {
                                obj = obj.object;
                            }

                            if (obj.type === "Identifier" && propNames.has(obj.name)) {
                                return ORDER.PROPS_DESTRUCTURE_BODY;
                            }
                        }

                        // Legacy: const { x } = props
                        if (decl.init.type === "Identifier" && decl.init.name === "props") {
                            return ORDER.PROPS_DESTRUCTURE;
                        }
                    }
                }

                // Check if the variable calls a local handler function defined in this scope
                // e.g., const stateStyles = getStateStylesHandler();
                // These must appear after the handler they call, so treat them as handler-level
                for (const decl of declarations) {
                    if (decl.init && decl.init.type === "CallExpression") {
                        const callee = decl.init.callee;

                        if (callee && callee.type === "Identifier" && !isHookCallHandler(decl.init)) {
                            return ORDER.HANDLER_FUNCTION;
                        }
                    }
                }

                // Otherwise it's derived state / computed values
                return ORDER.DERIVED_STATE;
            }

            // Function declaration
            if (statement.type === "FunctionDeclaration") {
                return ORDER.HANDLER_FUNCTION;
            }

            return ORDER.UNKNOWN;
        };

        const checkCodeOrderHandler = (node, isHook) => {
            const body = node.body;
            const sourceCode = context.sourceCode || context.getSourceCode();

            // Only check block statements (not implicit returns)
            if (body.type !== "BlockStatement") return;

            const statements = body.body;

            if (statements.length === 0) return;

            // Extract prop names from function parameters
            const propNames = new Set();

            for (const param of node.params) {
                if (param.type === "Identifier") {
                    // Single param like (props) or (initialData)
                    propNames.add(param.name);
                } else if (param.type === "ObjectPattern") {
                    // Destructured props like ({ initialCount, title })
                    for (const prop of param.properties) {
                        if (prop.type === "Property" && prop.value) {
                            if (prop.value.type === "Identifier") {
                                propNames.add(prop.value.name);
                            } else if (prop.value.type === "AssignmentPattern" && prop.value.left.type === "Identifier") {
                                // Handle default values: ({ initialCount = 0 })
                                propNames.add(prop.value.left.name);
                            }
                        } else if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
                            // Handle rest: ({ ...rest })
                            propNames.add(prop.argument.name);
                        }
                    }
                } else if (param.type === "AssignmentPattern" && param.left) {
                    // Default param value like (props = {})
                    if (param.left.type === "Identifier") {
                        propNames.add(param.left.name);
                    } else if (param.left.type === "ObjectPattern") {
                        for (const prop of param.left.properties) {
                            if (prop.type === "Property" && prop.value) {
                                if (prop.value.type === "Identifier") {
                                    propNames.add(prop.value.name);
                                } else if (prop.value.type === "AssignmentPattern" && prop.value.left.type === "Identifier") {
                                    propNames.add(prop.value.left.name);
                                }
                            }
                        }
                    }
                }
            }

            // Categorizable statement types for ordering
            const isCategorizableStatement = (s) => s.type === "VariableDeclaration"
                    || s.type === "FunctionDeclaration"
                    || s.type === "ExpressionStatement"
                    || s.type === "ReturnStatement";

            // Get declared variable names from a statement
            const getDeclaredNamesHandler = (stmt) => {
                const names = new Set();

                if (stmt.type === "VariableDeclaration") {
                    for (const decl of stmt.declarations) {
                        if (decl.id.type === "Identifier") {
                            names.add(decl.id.name);
                        } else if (decl.id.type === "ObjectPattern") {
                            for (const prop of decl.id.properties) {
                                if (prop.type === "Property" && prop.value.type === "Identifier") {
                                    names.add(prop.value.name);
                                } else if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
                                    names.add(prop.argument.name);
                                }
                            }
                        } else if (decl.id.type === "ArrayPattern") {
                            for (const element of decl.id.elements) {
                                if (element && element.type === "Identifier") {
                                    names.add(element.name);
                                }
                            }
                        }
                    }
                } else if (stmt.type === "FunctionDeclaration" && stmt.id) {
                    names.add(stmt.id.name);
                }

                return names;
            };

            // Get referenced variable names from a node (recursively)
            const getReferencedNamesHandler = (node, refs = new Set()) => {
                if (!node) return refs;

                if (node.type === "Identifier") {
                    refs.add(node.name);
                } else if (node.type === "MemberExpression") {
                    getReferencedNamesHandler(node.object, refs);
                } else if (node.type === "CallExpression") {
                    getReferencedNamesHandler(node.callee, refs);
                    node.arguments.forEach((arg) => getReferencedNamesHandler(arg, refs));
                } else if (node.type === "BinaryExpression" || node.type === "LogicalExpression") {
                    getReferencedNamesHandler(node.left, refs);
                    getReferencedNamesHandler(node.right, refs);
                } else if (node.type === "ConditionalExpression") {
                    getReferencedNamesHandler(node.test, refs);
                    getReferencedNamesHandler(node.consequent, refs);
                    getReferencedNamesHandler(node.alternate, refs);
                } else if (node.type === "UnaryExpression") {
                    getReferencedNamesHandler(node.argument, refs);
                } else if (node.type === "ArrayExpression") {
                    node.elements.forEach((el) => getReferencedNamesHandler(el, refs));
                } else if (node.type === "ObjectExpression") {
                    node.properties.forEach((prop) => {
                        if (prop.type === "Property") {
                            getReferencedNamesHandler(prop.value, refs);
                        }
                    });
                } else if (node.type === "TemplateLiteral") {
                    node.expressions.forEach((expr) => getReferencedNamesHandler(expr, refs));
                } else if (node.type === "ChainExpression") {
                    getReferencedNamesHandler(node.expression, refs);
                } else if (node.type === "TSAsExpression" || node.type === "TSNonNullExpression") {
                    getReferencedNamesHandler(node.expression, refs);
                }

                return refs;
            };

            // Get dependencies for a statement (variables it uses in initialization)
            const getStatementDependenciesHandler = (stmt) => {
                const deps = new Set();

                if (stmt.type === "VariableDeclaration") {
                    for (const decl of stmt.declarations) {
                        if (decl.init) {
                            getReferencedNamesHandler(decl.init, deps);
                        }
                    }
                }

                return deps;
            };

            // Filter to only categorizable statements for order checking
            const categorizableStatements = statements.filter(isCategorizableStatement);

            if (categorizableStatements.length < 2) return;

            // Build dependency information for all statements
            const stmtInfo = new Map();
            const declaredNames = new Map(); // Map from variable name to statement index

            // First pass: build declaredNames map (so we can look up where each variable is declared)
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const declared = getDeclaredNamesHandler(stmt);

                for (const name of declared) {
                    declaredNames.set(name, i);
                }
            }

            // Second pass: build full statement info including dependencies
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const declared = getDeclaredNamesHandler(stmt);
                const dependencies = getStatementDependenciesHandler(stmt);
                const category = isCategorizableStatement(stmt)
                    ? getStatementCategoryHandler(stmt, propNames)
                    : ORDER.UNKNOWN;

                stmtInfo.set(i, {
                    category,
                    declared,
                    dependencies,
                    index: i,
                    statement: stmt,
                });
            }

            // Build dependency graph first
            const dependsOn = new Map(); // stmtIndex -> Set of stmtIndices it depends on

            for (let i = 0; i < statements.length; i++) {
                const info = stmtInfo.get(i);
                const deps = new Set();

                for (const depName of info.dependencies) {
                    const depIndex = declaredNames.get(depName);

                    if (depIndex !== undefined && depIndex !== i) {
                        deps.add(depIndex);
                    }
                }

                dependsOn.set(i, deps);
            }

            // Check for violations: category order OR dependency order
            let hasOrderViolation = false;
            let hasDependencyViolation = false;
            let lastCategory = 0;
            let violatingStatement = null;
            let violatingCategory = null;
            let previousCategory = null;
            let dependencyViolationStmt = null;
            let dependencyViolationVar = null;

            // Check category violations
            for (const statement of categorizableStatements) {
                const category = getStatementCategoryHandler(statement, propNames);

                if (category === ORDER.UNKNOWN) continue;

                if (category < lastCategory && !hasOrderViolation) {
                    hasOrderViolation = true;
                    violatingStatement = statement;
                    violatingCategory = category;
                    previousCategory = lastCategory;
                }

                lastCategory = category;
            }

            // Check dependency violations (using variable before declaration)
            for (let i = 0; i < statements.length; i++) {
                const deps = dependsOn.get(i) || new Set();

                for (const depIndex of deps) {
                    if (depIndex > i) {
                        // This statement uses a variable declared later
                        hasDependencyViolation = true;
                        dependencyViolationStmt = statements[i];

                        // Find the variable name
                        const depInfo = stmtInfo.get(depIndex);

                        for (const name of depInfo.declared) {
                            const currentDeps = stmtInfo.get(i).dependencies;

                            if (currentDeps.has(name)) {
                                dependencyViolationVar = name;

                                break;
                            }
                        }

                        break;
                    }
                }

                if (hasDependencyViolation) break;
            }

            if (!hasOrderViolation && !hasDependencyViolation) return;

            // Dependency-aware topological sort
            // Sort by category, but ensure dependencies come before dependents
            const sortWithDependenciesHandler = () => {
                const result = [];
                const visited = new Set();
                const visiting = new Set(); // For cycle detection

                // DFS-based topological sort
                const visitHandler = (index) => {
                    if (visited.has(index)) return;
                    if (visiting.has(index)) return; // Cycle detected, skip

                    visiting.add(index);

                    // Visit dependencies first
                    const deps = dependsOn.get(index) || new Set();

                    for (const depIndex of deps) {
                        visitHandler(depIndex);
                    }

                    visiting.delete(index);
                    visited.add(index);
                    result.push(index);
                };

                // Group statements by category first, then sort within each group by dependencies
                const byCategory = new Map();

                for (let i = 0; i < statements.length; i++) {
                    const info = stmtInfo.get(i);
                    let effectiveCategory = info.category;

                    // For non-categorizable statements, use the next categorizable statement's category
                    if (effectiveCategory === ORDER.UNKNOWN) {
                        for (let j = i + 1; j < statements.length; j++) {
                            const nextInfo = stmtInfo.get(j);

                            if (nextInfo.category !== ORDER.UNKNOWN) {
                                effectiveCategory = nextInfo.category;

                                break;
                            }
                        }

                        if (effectiveCategory === ORDER.UNKNOWN) {
                            effectiveCategory = ORDER.RETURN;
                        }
                    }

                    // Check if this statement has dependencies from a later category
                    // If so, it needs to come after those dependencies
                    const deps = dependsOn.get(i) || new Set();
                    let maxDepCategory = effectiveCategory;

                    for (const depIndex of deps) {
                        const depInfo = stmtInfo.get(depIndex);
                        let depCategory = depInfo.category;

                        if (depCategory === ORDER.UNKNOWN) {
                            depCategory = ORDER.DERIVED_STATE; // Assume derived for unknown
                        }

                        if (depCategory > maxDepCategory) {
                            maxDepCategory = depCategory;
                        }
                    }

                    // If dependencies are from a later category, this statement must come after them
                    // So we use the max dependency category as the effective category
                    const sortCategory = Math.max(effectiveCategory, maxDepCategory);

                    if (!byCategory.has(sortCategory)) {
                        byCategory.set(sortCategory, []);
                    }

                    byCategory.get(sortCategory).push({
                        deps,
                        effectiveCategory,
                        index: i,
                        originalCategory: info.category,
                    });
                }

                // Sort categories
                const sortedCategories = [...byCategory.keys()].sort((a, b) => a - b);

                // Build final sorted list
                const finalResult = [];

                for (const category of sortedCategories) {
                    const stmtsInCategory = byCategory.get(category);

                    // Sort statements within category by dependencies using topological sort
                    const categoryVisited = new Set();
                    const categoryResult = [];

                    const visitCategoryHandler = (item) => {
                        if (categoryVisited.has(item.index)) return;

                        categoryVisited.add(item.index);

                        // Visit dependencies in same category first
                        for (const depIndex of item.deps) {
                            const depItem = stmtsInCategory.find((s) => s.index === depIndex);

                            if (depItem && !categoryVisited.has(depIndex)) {
                                visitCategoryHandler(depItem);
                            }
                        }

                        categoryResult.push(item.index);
                    };

                    // Sort by original index first to maintain stability
                    stmtsInCategory.sort((a, b) => a.index - b.index);

                    for (const item of stmtsInCategory) {
                        visitCategoryHandler(item);
                    }

                    finalResult.push(...categoryResult);
                }

                return finalResult;
            };

            const sortedIndices = sortWithDependenciesHandler();

            // Check if sorting actually changes the order
            const orderChanged = sortedIndices.some((idx, i) => idx !== i);

            if (!orderChanged) return;

            // Build the fix
            const fixHandler = (fixer) => {
                const firstStatementLine = sourceCode.lines[statements[0].loc.start.line - 1];
                const baseIndent = firstStatementLine.match(/^\s*/)[0];

                let newBodyContent = "";
                let lastCategory = null;

                for (let i = 0; i < sortedIndices.length; i++) {
                    const stmtIndex = sortedIndices[i];
                    const info = stmtInfo.get(stmtIndex);
                    const category = info.category !== ORDER.UNKNOWN ? info.category : null;

                    // Add blank line between different categories
                    if (lastCategory !== null && category !== null && category !== lastCategory) {
                        newBodyContent += "\n";
                    }

                    const stmtText = sourceCode.getText(info.statement);

                    newBodyContent += baseIndent + stmtText.trim() + "\n";

                    if (category !== null) {
                        lastCategory = category;
                    }
                }

                const firstStmt = statements[0];
                const lastStmt = statements[statements.length - 1];

                return fixer.replaceTextRange([firstStmt.range[0], lastStmt.range[1]], newBodyContent.trimEnd());
            };

            // Report the appropriate violation
            if (hasDependencyViolation && dependencyViolationStmt) {
                context.report({
                    data: {
                        type: isHook ? "hook" : "component",
                        varName: dependencyViolationVar || "variable",
                    },
                    fix: fixHandler,
                    message: "\"{{varName}}\" is used before it is declared. Reorder statements so dependencies are declared first in {{type}}",
                    node: dependencyViolationStmt,
                });
            } else if (hasOrderViolation && violatingStatement) {
                context.report({
                    data: {
                        current: ORDER_NAMES[violatingCategory],
                        previous: ORDER_NAMES[previousCategory],
                        type: isHook ? "hook" : "component",
                    },
                    fix: fixHandler,
                    message: "\"{{current}}\" should come before \"{{previous}}\" in {{type}}. Order: refs → state → redux → router → context → custom hooks → derived → useMemo → useCallback → handlers → useEffect → return",
                    node: violatingStatement,
                });
            }
        };

        // Check for module-level constants that should be inside the component
        const checkModuleLevelConstantsHandler = (node, isHook) => {
            const sourceCode = context.sourceCode || context.getSourceCode();

            // Get the program (root) node to find module-level declarations
            let programNode = node;

            while (programNode.parent) {
                programNode = programNode.parent;
            }

            if (programNode.type !== "Program") return;

            // Get the component body for insertion
            const componentBody = node.body;

            if (componentBody.type !== "BlockStatement") return;

            // Get component/hook name
            const componentName = getFunctionNameHandler(node);

            // Find module-level variable declarations with simple literal values
            for (const statement of programNode.body) {
                if (statement.type !== "VariableDeclaration") continue;

                for (const decl of statement.declarations) {
                    if (!decl.init || !decl.id || decl.id.type !== "Identifier") continue;

                    const varName = decl.id.name;

                    // Only check simple literals (numbers, strings, booleans)
                    const isSimpleLiteral = decl.init.type === "Literal"
                        && (typeof decl.init.value === "number"
                            || typeof decl.init.value === "string"
                            || typeof decl.init.value === "boolean");

                    if (!isSimpleLiteral) continue;

                    // Skip if it looks like a config constant (SCREAMING_CASE is typically intentional module-level)
                    if (/^[A-Z][A-Z0-9_]*$/.test(varName)) continue;

                    // Check if this variable is used inside the current component/hook
                    const componentText = sourceCode.getText(node);

                    // Simple check: see if the variable name appears in the component
                    // Use word boundary to avoid false positives
                    const regex = new RegExp(`\\b${varName}\\b`);

                    if (regex.test(componentText)) {
                        // Build the fix
                        const fixHandler = (fixer) => {
                            const fixes = [];

                            // Get the declaration text
                            const declText = sourceCode.getText(decl);
                            const kind = statement.kind; // const, let, var

                            // Remove from module level
                            if (statement.declarations.length === 1) {
                                // Remove the entire statement including newline
                                const nextToken = sourceCode.getTokenAfter(statement);
                                const endPos = nextToken ? statement.range[1] : statement.range[1];

                                // Include trailing newline if present
                                const textAfter = sourceCode.text.slice(statement.range[1], statement.range[1] + 2);
                                const removeEnd = textAfter.startsWith("\n") ? statement.range[1] + 1
                                    : textAfter.startsWith("\r\n") ? statement.range[1] + 2
                                        : statement.range[1];

                                fixes.push(fixer.removeRange([statement.range[0], removeEnd]));
                            } else {
                                // Remove just this declarator (and comma)
                                const declIndex = statement.declarations.indexOf(decl);
                                const isLast = declIndex === statement.declarations.length - 1;

                                if (isLast) {
                                    // Remove comma before and the declarator
                                    const prevDecl = statement.declarations[declIndex - 1];

                                    fixes.push(fixer.removeRange([prevDecl.range[1], decl.range[1]]));
                                } else {
                                    // Remove declarator and comma after
                                    const nextDecl = statement.declarations[declIndex + 1];

                                    fixes.push(fixer.removeRange([decl.range[0], nextDecl.range[0]]));
                                }
                            }

                            // Find the right position to insert inside the component
                            // Insert after all hooks but before handlers
                            const bodyStatements = componentBody.body;

                            // Get the base indentation inside the component
                            let insertIndent = "    "; // Default

                            if (bodyStatements.length > 0) {
                                const firstStmtLine = sourceCode.lines[bodyStatements[0].loc.start.line - 1];

                                insertIndent = firstStmtLine.match(/^\s*/)[0];
                            }

                            // Find insertion point: after last hook/derived state, before handlers
                            let insertIndex = 0;

                            for (let i = 0; i < bodyStatements.length; i++) {
                                const stmt = bodyStatements[i];

                                if (stmt.type === "VariableDeclaration") {
                                    const stmtDecl = stmt.declarations[0];

                                    if (stmtDecl && stmtDecl.init) {
                                        // Check if it's a hook call
                                        if (stmtDecl.init.type === "CallExpression") {
                                            const callee = stmtDecl.init.callee;
                                            const hookName = callee.type === "Identifier" ? callee.name
                                                : callee.type === "MemberExpression" && callee.property.type === "Identifier"
                                                    ? callee.property.name
                                                    : "";

                                            if (/^use[A-Z]/.test(hookName)) {
                                                insertIndex = i + 1;

                                                continue;
                                            }
                                        }

                                        // Check if it's a function (handler)
                                        if (stmtDecl.init.type === "ArrowFunctionExpression"
                                            || stmtDecl.init.type === "FunctionExpression") {
                                            break;
                                        }

                                        // It's derived state, insert after it
                                        insertIndex = i + 1;
                                    }
                                } else if (stmt.type === "FunctionDeclaration") {
                                    // Handler function, stop here
                                    break;
                                }
                            }

                            // Insert the constant
                            const newLine = `${insertIndent}${kind} ${declText};\n\n`;

                            if (insertIndex === 0 && bodyStatements.length > 0) {
                                // Insert at the beginning
                                fixes.push(fixer.insertTextBefore(bodyStatements[0], newLine));
                            } else if (insertIndex < bodyStatements.length) {
                                // Insert before the target statement
                                fixes.push(fixer.insertTextBefore(bodyStatements[insertIndex], newLine));
                            } else if (bodyStatements.length > 0) {
                                // Insert at the end
                                fixes.push(fixer.insertTextAfter(bodyStatements[bodyStatements.length - 1], "\n\n" + insertIndent + kind + " " + declText + ";"));
                            }

                            return fixes;
                        };

                        context.report({
                            data: {
                                name: varName,
                                type: isHook ? "hook" : "component",
                            },
                            fix: fixHandler,
                            message: "Constant \"{{name}}\" should be declared inside the {{type}} as derived state, not at module level",
                            node: decl.id,
                        });
                    }
                }
            }
        };

        const checkFunctionHandler = (node) => {
            // Check if it's a React component
            if (isReactComponentHandler(node)) {
                checkCodeOrderHandler(node, false);
                checkModuleLevelConstantsHandler(node, false);

                return;
            }

            // Check if it's a custom hook
            if (isCustomHookHandler(node)) {
                checkCodeOrderHandler(node, true);
                checkModuleLevelConstantsHandler(node, true);
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce consistent ordering of code blocks in React components and custom hooks" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

export { reactCodeOrder };
