/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Arrow Function Block Body
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Arrow functions with complex logic should use block body.
 *   Ensures consistent formatting when function body needs
 *   multiple statements or complex expressions.
 *
 * ✓ Good:
 *   () => {
 *       doSomething();
 *       return value;
 *   }
 *
 * ✗ Bad:
 *   () => (doSomething(), value)
 */
const arrowFunctionBlockBody = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isJsxRelatedArrowHandler = (node) => {
            // Traverse up the tree to check if this arrow function is eventually
            // inside a JSX attribute (directly or nested in objects/arrays)
            // OR inside a table column definition (cell/header property in array)
            let parent = node.parent;
            let depth = 0;
            const maxDepth = 15;
            let foundCellProperty = false;
            let foundArrayExpression = false;

            while (parent && depth < maxDepth) {
                // Found JSX attribute - this is JSX-related
                if (parent.type === "JSXExpressionContainer") {
                    const grandParent = parent.parent;

                    if (grandParent && grandParent.type === "JSXAttribute") return true;
                }

                // Track if we're inside a "cell" or "header" property (table column pattern)
                if (parent.type === "Property" && parent.key && parent.key.type === "Identifier") {
                    const propName = parent.key.name;

                    if (propName === "cell" || propName === "header") {
                        foundCellProperty = true;
                    }
                }

                // Track if we're inside an ArrayExpression
                if (parent.type === "ArrayExpression") {
                    foundArrayExpression = true;
                }

                // If we found both cell property and array, this is a table column definition
                if (foundCellProperty && foundArrayExpression) return true;

                // Continue traversing through valid container types
                if (
                    parent.type === "Property" ||
                    parent.type === "ObjectExpression" ||
                    parent.type === "ArrayExpression" ||
                    parent.type === "CallExpression" ||
                    parent.type === "ArrowFunctionExpression"
                ) {
                    parent = parent.parent;
                    depth += 1;

                    continue;
                }

                // Stop at other node types
                break;
            }

            return false;
        };

        const checkArrowFunctionHandler = (node) => {
            if (!isJsxRelatedArrowHandler(node)) return;

            // Only check expression bodies (not block bodies)
            if (node.body.type === "BlockStatement") return;

            const body = node.body;

            // Skip ObjectExpression - common pattern for sx prop: (theme) => ({...})
            if (body.type === "ObjectExpression") return;

            // Get the arrow token to check positioning
            const arrowToken = sourceCode.getTokenBefore(body, (t) => t.value === "=>");

            if (!arrowToken) return;

            // Skip if body starts on the same line as => (already valid implicit return)
            // This handles cases like: prop={(x) => x.map({\n  ...\n})}
            if (body.loc.start.line === arrowToken.loc.start.line) return;

            // Check if already wrapped in parentheses - skip if so
            const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

            if (tokenAfterArrow && tokenAfterArrow.value === "(") return;

            // Get text between arrow and body (the newline + whitespace)
            const textBetween = sourceCode.getText().slice(arrowToken.range[1], body.range[0]);

            // Only fix if there's actually a newline between => and body
            if (!textBetween.includes("\n")) return;

            // For ConditionalExpression (ternary) or multiline bodies:
            // Just move the START to the same line as =>, don't collapse the whole body
            if (body.type === "ConditionalExpression" || body.loc.start.line !== body.loc.end.line) {
                // Get the first token of the body to move just that part
                const firstBodyToken = sourceCode.getFirstToken(body);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [arrowToken.range[1], firstBodyToken.range[0]],
                        " ",
                    ),
                    message: "Arrow function body should start on same line as =>",
                    node: body,
                });

                return;
            }

            // Single-line body that starts on a new line after => - move it to same line
            // This handles cases like:
            // cell: ({ row }) =>
            //     optionsData.account.status.badges?.[row.getValue("status")]
            // Should become:
            // cell: ({ row }) => optionsData.account.status.badges?.[row.getValue("status")]
            const bodyText = sourceCode.getText(body);

            context.report({
                fix: (fixer) => fixer.replaceTextRange(
                    [arrowToken.range[1], body.range[1]],
                    ` ${bodyText}`,
                ),
                message: "Arrow function body should start on same line as =>",
                node: body,
            });
        };

        return { ArrowFunctionExpression: checkArrowFunctionHandler };
    },
    meta: {
        docs: { description: "Enforce parentheses for arrow functions in JSX props with multiline expressions (preserves implicit return)" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Arrow Function Simple JSX
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simplify arrow functions returning simple JSX to single line
 *   by removing unnecessary parentheses and line breaks.
 *
 * ✓ Good:
 *   export const X = ({ children }) => <Sidebar>{children}</Sidebar>;
 *
 * ✗ Bad:
 *   export const X = ({ children }) => (
 *       <Sidebar>{children}</Sidebar>
 *   );
 */
const arrowFunctionSimpleJsx = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if JSX is simple enough to be on one line
        const isSimpleJsxHandler = (jsxNode) => {
            if (jsxNode.type !== "JSXElement" && jsxNode.type !== "JSXFragment") return false;

            // Check if JSX has no attributes or only simple attributes
            if (jsxNode.type === "JSXElement" && jsxNode.openingElement.attributes.length > 1) {
                return false;
            }

            // Check attributes are simple (no multiline expressions)
            if (jsxNode.type === "JSXElement") {
                for (const attr of jsxNode.openingElement.attributes) {
                    if (attr.type === "JSXSpreadAttribute") return false;

                    if (attr.value && attr.value.type === "JSXExpressionContainer") {
                        const expr = attr.value.expression;

                        // Skip complex expressions
                        if (expr.type === "ObjectExpression" || expr.type === "ArrayExpression") {
                            return false;
                        }

                        if (expr.type === "ArrowFunctionExpression" || expr.type === "FunctionExpression") {
                            return false;
                        }
                    }
                }
            }

            // Check children
            const children = jsxNode.children.filter((child) => {
                if (child.type === "JSXText") {
                    return child.value.trim().length > 0;
                }

                return true;
            });

            // No children (self-closing) is simple
            if (children.length === 0) return true;

            if (children.length === 1) {
                const child = children[0];

                // Simple text like <Sidebar>text</Sidebar>
                if (child.type === "JSXText") return true;

                // Simple expression like {children} or {value}
                if (child.type === "JSXExpressionContainer") {
                    const expr = child.expression;

                    if (expr.type === "Identifier") return true;

                    if (expr.type === "MemberExpression") return true;

                    if (expr.type === "Literal") return true;
                }

                // Nested JSX elements are NOT simple
                // e.g., <DashboardLayout><Outlet /></DashboardLayout> is NOT simple
            }

            return false;
        };

        // Get simplified JSX text (without extra whitespace)
        const getSimplifiedJsxTextHandler = (jsxNode) => {
            const text = sourceCode.getText(jsxNode);

            // Remove extra whitespace between tags
            return text
                .replace(/>\s+</g, "><")
                .replace(/>\s+\{/g, ">{")
                .replace(/\}\s+</g, "}<")
                .replace(/\s+$/g, "")
                .replace(/^\s+/g, "");
        };

        return {
            ArrowFunctionExpression(node) {
                const { body } = node;

                // Only handle JSX bodies
                if (body.type !== "JSXElement" && body.type !== "JSXFragment") return;

                // Skip if already on one line
                if (node.loc.start.line === node.loc.end.line) return;

                // Check if JSX is simple
                if (!isSimpleJsxHandler(body)) return;

                // Get the simplified JSX text
                const jsxText = getSimplifiedJsxTextHandler(body);

                // Check if result would be reasonably short (< 120 chars)
                const arrowStart = sourceCode.getText(node).split("=>")[0] + "=> ";
                const totalLength = arrowStart.length + jsxText.length + 1;

                if (totalLength > 120) return;

                // Check if there are parentheses around the body
                const tokenBeforeBody = sourceCode.getTokenBefore(body);
                const tokenAfterBody = sourceCode.getTokenAfter(body);
                const hasParens = tokenBeforeBody
                    && tokenBeforeBody.value === "("
                    && tokenAfterBody
                    && tokenAfterBody.value === ")";

                if (hasParens) {
                    // Replace from ( to ) with just the JSX
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBeforeBody.range[0], tokenAfterBody.range[1]],
                            jsxText,
                        ),
                        message: "Simple JSX should be on same line as arrow function without parentheses",
                        node: body,
                    });
                } else {
                    // Just collapse the multiline JSX
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            body,
                            jsxText,
                        ),
                        message: "Simple JSX should be on same line as arrow function",
                        node: body,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Simplify arrow functions returning simple JSX to single line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Arrow Function Simplify
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simplify arrow functions that have a single return statement
 *   by using implicit return instead of block body.
 *
 * ✓ Good:
 *   () => value
 *   (x) => x * 2
 *   items.map(item => item.name)
 *
 * ✗ Bad:
 *   () => { return value; }
 *   (x) => { return x * 2; }
 *   items.map(item => { return item.name; })
 */
const arrowFunctionSimplify = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isJsxAttributeArrowHandler = (node) => {
            let parent = node.parent;

            if (parent && parent.type === "JSXExpressionContainer") {
                parent = parent.parent;

                if (parent && parent.type === "JSXAttribute") return true;
            }

            return false;
        };

        // Check if a call expression can be simplified to a single line
        // e.g., dispatch(downloadEventPhoto(overlayImage)) or handler(value)
        const canSimplifyToOneLineHandler = (expr) => {
            if (expr.type !== "CallExpression") return false;

            const { arguments: args, callee } = expr;

            // Callee must be simple identifier or member expression
            if (callee.type !== "Identifier" && callee.type !== "MemberExpression") return false;

            // No arguments - can simplify: fn()
            if (args.length === 0) return true;

            // Single argument
            if (args.length === 1) {
                const arg = args[0];

                // Simple identifier: dispatch(action)
                if (arg.type === "Identifier") return true;

                // Simple literal: handler("value") or handler(123)
                if (arg.type === "Literal") return true;

                // Nested call with simple args: dispatch(downloadPhoto(id))
                if (arg.type === "CallExpression") return canSimplifyToOneLineHandler(arg);

                // Member expression: dispatch(actions.doSomething)
                if (arg.type === "MemberExpression") return true;
            }

            return false;
        };

        // Build simplified text for a call expression
        const buildSimplifiedTextHandler = (expr) => {
            if (expr.type !== "CallExpression") return sourceCode.getText(expr);

            const calleeName = sourceCode.getText(expr.callee);
            const argsText = expr.arguments.map((arg) => {
                if (arg.type === "CallExpression") return buildSimplifiedTextHandler(arg);

                return sourceCode.getText(arg);
            }).join(", ");

            return `${calleeName}(${argsText})`;
        };

        // Check if an expression is simple enough to be on one line
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return false;

            // Simple types that can always be one-lined
            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;
            if (expr.type === "ThisExpression") return true;

            // Member expressions: obj.prop, this.value
            if (expr.type === "MemberExpression") {
                return isSimpleExpressionHandler(expr.object) && isSimpleExpressionHandler(expr.property);
            }

            // Unary expressions: !x, -x
            if (expr.type === "UnaryExpression") {
                return isSimpleExpressionHandler(expr.argument);
            }

            // Simple call expressions with simple arguments
            if (expr.type === "CallExpression") {
                if (expr.arguments.length > 2) return false;

                return expr.arguments.every(isSimpleExpressionHandler);
            }

            // Object/Array expressions - keep multiline format but still simplify
            if (expr.type === "ObjectExpression" || expr.type === "ArrayExpression") {
                return true;
            }

            return false;
        };

        const checkArrowFunctionHandler = (node) => {
            if (node.body.type !== "BlockStatement") return;

            const { body } = node.body;

            if (body.length !== 1) return;

            const statement = body[0];

            // Handle ExpressionStatement (for onClick={() => { doSomething() }} or simple side-effect functions)
            if (statement.type === "ExpressionStatement") {
                const expression = statement.expression;

                // Check if already on single line
                if (expression.loc.start.line === expression.loc.end.line) {
                    const expressionText = sourceCode.getText(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            expressionText,
                        ),
                        message: "Arrow function with single statement should use expression body: () => expression instead of () => { expression }",
                        node: node.body,
                    });

                    return;
                }

                // Check if multi-line expression can be simplified to one line
                if (canSimplifyToOneLineHandler(expression)) {
                    const simplifiedText = buildSimplifiedTextHandler(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            simplifiedText,
                        ),
                        message: "Arrow function with simple nested call should be simplified to one line",
                        node: node.body,
                    });

                    return;
                }

                // Check for call expression with multiline object/array argument
                if (expression.type === "CallExpression") {
                    const expressionText = sourceCode.getText(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            expressionText,
                        ),
                        message: "Arrow function with single statement should use expression body",
                        node: node.body,
                    });
                }

                return;
            }

            // Handle ReturnStatement: () => { return x } should become () => x
            if (statement.type === "ReturnStatement") {
                const returnValue = statement.argument;

                // No return value: () => { return; } - keep as is (explicit void return)
                if (!returnValue) return;

                // Check if the return value is simple enough to inline
                const returnText = sourceCode.getText(returnValue);

                // For object literals, wrap in parentheses: () => ({ key: value })
                if (returnValue.type === "ObjectExpression") {
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            `(${returnText})`,
                        ),
                        message: "Arrow function with single return should use expression body: () => value instead of () => { return value }",
                        node: node.body,
                    });

                    return;
                }

                // For simple expressions, just use the value directly
                if (isSimpleExpressionHandler(returnValue)) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node.body,
                            returnText,
                        ),
                        message: "Arrow function with single return should use expression body: () => value instead of () => { return value }",
                        node: node.body,
                    });

                    return;
                }

                // For other expressions (JSX, complex calls, etc.), still simplify but keep formatting
                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node.body,
                        returnText,
                    ),
                    message: "Arrow function with single return should use expression body: () => value instead of () => { return value }",
                    node: node.body,
                });
            }
        };

        // Check for JSX expression closing brace on wrong line
        const checkJsxExpressionClosingHandler = (node) => {
            const expression = node.expression;

            // Only check arrow functions with call expression body
            if (expression.type !== "ArrowFunctionExpression") return;
            if (expression.body.type === "BlockStatement") return;
            if (expression.body.type !== "CallExpression") return;

            const callExpr = expression.body;
            const lastArg = callExpr.arguments[callExpr.arguments.length - 1];

            if (!lastArg) return;

            // Check if last argument is multiline object/array
            if (lastArg.type !== "ObjectExpression" && lastArg.type !== "ArrayExpression") return;
            if (lastArg.loc.start.line === lastArg.loc.end.line) return;

            // Get the closing tokens: ) of call, } of JSX expression
            const callCloseParen = sourceCode.getLastToken(callExpr);
            const jsxCloseBrace = sourceCode.getLastToken(node);

            if (!callCloseParen || !jsxCloseBrace) return;
            if (callCloseParen.value !== ")" || jsxCloseBrace.value !== "}") return;

            // Check if ) and } are on different lines
            if (callCloseParen.loc.end.line !== jsxCloseBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [callCloseParen.range[1], jsxCloseBrace.range[0]],
                        "",
                    ),
                    message: "JSX expression closing brace should be on same line as function call: )}",
                    node: jsxCloseBrace,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            JSXExpressionContainer: checkJsxExpressionClosingHandler,
        };
    },
    meta: {
        docs: { description: "Simplify arrow functions with single return to expression body: () => { return x } becomes () => x" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Curried Arrow Same Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Curried arrow function body must start on the same line as
 *   the arrow (=>), not on a new line.
 *
 * ✓ Good:
 *   const fn = () => async (dispatch) => {
 *       dispatch(action);
 *   };
 *
 * ✗ Bad:
 *   const fn = () =>
 *       async (dispatch) => {
 *           dispatch(action);
 *       };
 */
const curriedArrowSameLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ArrowFunctionExpression(node) {
                const { body } = node;

                // Only check if body is another arrow function (curried)
                // or an async arrow function (CallExpression with async)
                if (body.type !== "ArrowFunctionExpression") return;

                // Get the arrow token =>
                const arrowToken = sourceCode.getTokenBefore(
                    body,
                    (token) => token.value === "=>",
                );

                if (!arrowToken) return;

                // Get the first token of the body (could be 'async' or '(')
                const bodyFirstToken = sourceCode.getFirstToken(body);

                if (!bodyFirstToken) return;

                // Check if they're on the same line
                if (arrowToken.loc.end.line !== bodyFirstToken.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [arrowToken.range[1], bodyFirstToken.range[0]],
                            " ",
                        ),
                        message: "Curried arrow function should start on the same line as =>",
                        node: body,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce curried arrow function to start on same line as =>" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

export {
    arrowFunctionBlockBody,
    arrowFunctionSimpleJsx,
    arrowFunctionSimplify,
    curriedArrowSameLine,
};
