import fs from "fs";
import nodePath from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(nodePath.join(__dirname, "package.json"), "utf8"));

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Array Items Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce array formatting based on item count. Items within
 *   maxItems threshold on one line, more items each on its own line.
 *
 * Options:
 *   { maxItems: 3 } - Maximum items on single line (default: 3)
 *
 * ✓ Good:
 *   const arr = [1, 2, 3];
 *   const arr = [
 *       item1,
 *       item2,
 *       item3,
 *       item4,
 *   ];
 *
 * ✗ Bad:
 *   const arr = [1, 2, 3, 4, 5];
 *   const arr = [item1,
 *       item2, item3];
 */
const arrayItemsPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxItems = options.maxItems !== undefined ? options.maxItems : 3;

        return {
            ArrayExpression(node) {
                const { elements } = node;

                // Skip empty arrays
                if (elements.length === 0) return;

                // Skip hook dependency arrays (handled by hook-deps-per-line rule)
                if (node.parent
                    && node.parent.type === "CallExpression"
                    && node.parent.callee
                    && node.parent.callee.type === "Identifier"
                    && /^use[A-Z]/.test(node.parent.callee.name)) {
                    const args = node.parent.arguments;

                    // Dependency array is typically the last argument
                    if (args[args.length - 1] === node) return;
                }

                // Skip arrays with spread elements or complex nested structures
                const hasComplexElement = elements.some((el) => {
                    if (!el) return false;

                    return el.type === "SpreadElement"
                        || el.type === "ObjectExpression"
                        || el.type === "ArrayExpression"
                        || el.type === "ArrowFunctionExpression"
                        || el.type === "FunctionExpression";
                });

                if (hasComplexElement) return;

                const openBracket = sourceCode.getFirstToken(node);
                const closeBracket = sourceCode.getLastToken(node);

                if (!openBracket || !closeBracket) return;

                const firstElement = elements[0];
                const lastElement = elements[elements.length - 1];

                if (!firstElement || !lastElement) return;

                // Check if array is a property value that should be on same line as key
                if (node.parent && node.parent.type === "Property") {
                    const colonToken = sourceCode.getTokenBefore(node);

                    if (colonToken && colonToken.value === ":") {
                        if (openBracket.loc.start.line !== colonToken.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [colonToken.range[1], openBracket.range[0]],
                                    " ",
                                ),
                                message: "Array should start on same line as property key",
                                node: openBracket,
                            });
                        }
                    }
                }

                // Calculate base indent from parent or current line
                let baseIndent = "";

                if (node.parent && node.parent.type === "Property") {
                    const propLine = sourceCode.lines[node.parent.loc.start.line - 1];

                    baseIndent = propLine.match(/^\s*/)[0];
                } else {
                    const arrayLine = sourceCode.lines[node.loc.start.line - 1];

                    baseIndent = arrayLine.match(/^\s*/)[0];
                }

                const itemIndent = baseIndent + "    ";

                // maxItems or less items: should be on one line with no extra spaces
                if (elements.length <= maxItems) {
                    const isMultiLine = node.loc.start.line !== node.loc.end.line;

                    // Check for spaces inside brackets on single line arrays
                    if (!isMultiLine) {
                        const textAfterOpen = sourceCode.text.slice(openBracket.range[1], firstElement.range[0]);
                        const textBeforeClose = sourceCode.text.slice(lastElement.range[1], closeBracket.range[0]);

                        // Check for space after opening bracket or space before closing bracket
                        // textBeforeClose might be "" or ", " or " " - any space is not allowed
                        const hasSpaceAfterOpen = textAfterOpen.length > 0;
                        const hasSpaceBeforeClose = textBeforeClose.includes(" ");

                        if (hasSpaceAfterOpen || hasSpaceBeforeClose) {
                            const itemsText = elements
                                .filter((el) => el !== null)
                                .map((el) => sourceCode.getText(el))
                                .join(", ");

                            context.report({
                                fix: (fixer) => fixer.replaceText(
                                    node,
                                    `[${itemsText}]`,
                                ),
                                message: "No spaces inside array brackets",
                                node,
                            });
                        }

                        return;
                    }

                    // Multi-line with 3 or less - collapse to one line
                    const itemsText = elements
                        .filter((el) => el !== null)
                        .map((el) => sourceCode.getText(el))
                        .join(", ");
                    const singleLine = `[${itemsText}]`;

                    if (singleLine.length <= 100) {
                        context.report({
                            fix: (fixer) => fixer.replaceText(
                                node,
                                singleLine,
                            ),
                            message: `Array with ${maxItems} or fewer items should be on one line`,
                            node,
                        });
                    }

                    return;
                }

                // More than maxItems: each on its own line
                // Check for empty line after opening bracket
                if (firstElement.loc.start.line > openBracket.loc.end.line + 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], firstElement.range[0]],
                            "\n" + itemIndent,
                        ),
                        message: "No empty line after opening bracket",
                        node: firstElement,
                    });
                } else if (openBracket.loc.end.line === firstElement.loc.start.line) {
                    // First element on same line as bracket - move to new line
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], firstElement.range[0]],
                            "\n" + itemIndent,
                        ),
                        message: "First array item should be on its own line",
                        node: firstElement,
                    });
                }

                // Check each element is on its own line and no empty lines between
                for (let i = 0; i < elements.length - 1; i += 1) {
                    const current = elements[i];
                    const next = elements[i + 1];

                    if (!current || !next) continue;

                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    if (current.loc.end.line === next.loc.start.line) {
                        if (commaToken) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [commaToken.range[1], next.range[0]],
                                    "\n" + itemIndent,
                                ),
                                message: "Each array item should be on its own line",
                                node: next,
                            });
                        }
                    } else if (next.loc.start.line > current.loc.end.line + 1) {
                        // Empty lines between elements
                        if (commaToken) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [commaToken.range[1], next.range[0]],
                                    "\n" + itemIndent,
                                ),
                                message: "No empty lines between array items",
                                node: next,
                            });
                        }
                    }
                }

                // Check for empty line before closing bracket
                const tokenBeforeClose = sourceCode.getTokenBefore(closeBracket);

                if (closeBracket.loc.start.line > lastElement.loc.end.line + 1) {
                    const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                    context.report({
                        fix: (fixer) => {
                            if (hasTrailingComma) {
                                return fixer.replaceTextRange(
                                    [tokenBeforeClose.range[1], closeBracket.range[0]],
                                    "\n" + baseIndent,
                                );
                            }

                            return fixer.replaceTextRange(
                                [lastElement.range[1], closeBracket.range[0]],
                                ",\n" + baseIndent,
                            );
                        },
                        message: "No empty line before closing bracket",
                        node: closeBracket,
                    });
                } else if (closeBracket.loc.start.line === lastElement.loc.end.line) {
                    // Closing bracket on same line as last element
                    const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                    context.report({
                        fix: (fixer) => {
                            if (hasTrailingComma) {
                                return fixer.replaceTextRange(
                                    [tokenBeforeClose.range[1], closeBracket.range[0]],
                                    "\n" + baseIndent,
                                );
                            }

                            return fixer.replaceTextRange(
                                [lastElement.range[1], closeBracket.range[0]],
                                ",\n" + baseIndent,
                            );
                        },
                        message: "Closing bracket should be on its own line",
                        node: closeBracket,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce array formatting based on item count (default: ≤3 on one line, >3 each on new line)" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxItems: {
                        default: 3,
                        description: "Maximum items to keep on single line (default: 3)",
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
 * Rule: Array Objects On New Lines
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   In arrays of objects, each object should start on a new line
 *   for better readability.
 *
 * ✓ Good:
 *   const items = [
 *       { id: 1, name: "first" },
 *       { id: 2, name: "second" },
 *   ];
 *
 * ✗ Bad:
 *   const items = [{ id: 1, name: "first" },
 *       { id: 2, name: "second" }];
 */
const arrayObjectsOnNewLines = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ArrayExpression(node) {
                const elements = node.elements;

                // Only apply to arrays with object elements
                if (elements.length === 0) return;

                // Check if all non-null elements are objects
                const objectElements = elements.filter((el) => el && el.type === "ObjectExpression");

                if (objectElements.length === 0) return;

                // Skip single-line arrays (intentionally compact)
                if (node.loc.start.line === node.loc.end.line) return;

                const openBracket = sourceCode.getFirstToken(node);

                // Check first object element
                const firstElement = elements[0];

                if (firstElement && firstElement.type === "ObjectExpression") {
                    // Check if [ and { are on the same line
                    if (openBracket.loc.end.line === firstElement.loc.start.line) {
                        const openBrace = sourceCode.getFirstToken(firstElement);
                        const indent = " ".repeat(openBracket.loc.start.column + 4);

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBracket.range[1], openBrace.range[0]],
                                "\n" + indent,
                            ),
                            message: "First object in array should start on a new line",
                            node: firstElement,
                        });
                    }
                }

                // Check closing bracket - should be on its own line
                const closeBracket = sourceCode.getLastToken(node);
                const lastElement = elements[elements.length - 1];

                if (lastElement && lastElement.type === "ObjectExpression") {
                    const lastBrace = sourceCode.getLastToken(lastElement);
                    const tokenAfterBrace = sourceCode.getTokenAfter(lastBrace);

                    // Skip trailing comma if present
                    let tokenBeforeCloseBracket = tokenAfterBrace;

                    if (tokenAfterBrace && tokenAfterBrace.value === ",") {
                        tokenBeforeCloseBracket = sourceCode.getTokenAfter(tokenAfterBrace);
                    }

                    // Check if } (or },) and ] are on same line - they should NOT be
                    if (lastBrace.loc.end.line === closeBracket.loc.start.line) {
                        const indent = " ".repeat(openBracket.loc.start.column);

                        context.report({
                            fix: (fixer) => {
                                // Find the actual content between last element and ]
                                const textBetween = sourceCode.text.slice(lastElement.range[1], closeBracket.range[0]);
                                const hasComma = textBetween.includes(",");

                                if (hasComma) {
                                    // Replace from after the object to before ]
                                    return fixer.replaceTextRange(
                                        [lastElement.range[1], closeBracket.range[0]],
                                        ",\n" + indent,
                                    );
                                }

                                return fixer.replaceTextRange(
                                    [lastElement.range[1], closeBracket.range[0]],
                                    ",\n" + indent,
                                );
                            },
                            message: "Closing bracket should be on its own line after array of objects",
                            node: closeBracket,
                        });
                    }
                }

                // Check each subsequent object starts on a new line
                for (let i = 1; i < elements.length; i++) {
                    const prevElement = elements[i - 1];
                    const currentElement = elements[i];

                    if (!currentElement || currentElement.type !== "ObjectExpression") continue;
                    if (!prevElement) continue;

                    // Get the comma after previous element
                    const commaToken = sourceCode.getTokenAfter(prevElement);

                    if (!commaToken || commaToken.value !== ",") continue;

                    // Check if previous element's closing and current element's opening are on same line
                    if (commaToken.loc.end.line === currentElement.loc.start.line) {
                        const indent = " ".repeat(openBracket.loc.start.column + 4);
                        const openBrace = sourceCode.getFirstToken(currentElement);

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], openBrace.range[0]],
                                "\n" + indent,
                            ),
                            message: "Each object in array should start on a new line",
                            node: currentElement,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce array of objects to have each object on a new line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

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

        const isJsxAttributeArrowHandler = (node) => {
            let parent = node.parent;

            if (parent && parent.type === "JSXExpressionContainer") {
                parent = parent.parent;

                if (parent && parent.type === "JSXAttribute") return true;
            }

            return false;
        };

        const checkArrowFunctionHandler = (node) => {
            if (!isJsxAttributeArrowHandler(node)) return;

            // Only check expression bodies (not block bodies)
            if (node.body.type === "BlockStatement") return;

            const body = node.body;

            // Skip JSX elements wrapped in parentheses - they're fine
            if (body.type === "JSXElement" || body.type === "JSXFragment") return;

            // Skip ConditionalExpression (ternary) that contains JSX - common pattern
            if (body.type === "ConditionalExpression") return;

            // Skip ObjectExpression - common pattern for sx prop: (theme) => ({...})
            if (body.type === "ObjectExpression") return;

            // Skip single-line CallExpression - common for event handlers: (e) => handler(e, "value")
            // But wrap multiline CallExpression in parentheses: () => (\n    fn({ multiline })\n)
            if (body.type === "CallExpression") {
                const callIsOnSingleLine = body.loc.start.line === body.loc.end.line;

                if (callIsOnSingleLine) return;

                // Check if already wrapped in parentheses - skip if so
                const arrowToken = sourceCode.getTokenBefore(body, (t) => t.value === "=>");

                if (arrowToken) {
                    const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

                    if (tokenAfterArrow && tokenAfterArrow.value === "(") {
                        // Already wrapped in parentheses, skip
                        return;
                    }
                }

                // Multiline call expression in JSX prop should use parentheses for implicit return
                const arrowLine = sourceCode.lines[node.loc.start.line - 1];
                const arrowIndent = arrowLine.match(/^\s*/)[0];
                const innerIndent = arrowIndent + "    ";
                const bodyText = sourceCode.getText(body);

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node.body,
                        `(\n${innerIndent}${bodyText}\n${arrowIndent})`,
                    ),
                    message: "Arrow function with multiline call should use parentheses for implicit return",
                    node: node.body,
                });

                return;
            }

            // If expression spans multiple lines, wrap in parentheses for implicit return
            if (body.loc.start.line !== body.loc.end.line) {
                // Get the indentation of the arrow function
                const arrowLine = sourceCode.lines[node.loc.start.line - 1];
                const arrowIndent = arrowLine.match(/^\s*/)[0];
                const innerIndent = arrowIndent + "    ";

                // Get the body text and re-indent it
                const bodyText = sourceCode.getText(body);

                // Use parentheses for implicit return instead of block body with explicit return
                const newBody = `(\n${innerIndent}${bodyText}\n${arrowIndent})`;

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        body,
                        newBody,
                    ),
                    message: "Arrow function in JSX prop with multiline body should use parentheses",
                    node: body,
                });
            }
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

        const checkArrowFunctionHandler = (node) => {
            if (!isJsxAttributeArrowHandler(node)) return;

            if (node.body.type !== "BlockStatement") return;

            const { body } = node.body;

            if (body.length !== 1) return;

            const statement = body[0];

            if (statement.type !== "ExpressionStatement") return;

            const expression = statement.expression;

            // Check if already on single line
            if (expression.loc.start.line === expression.loc.end.line) {
                const expressionText = sourceCode.getText(expression);

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node.body,
                        expressionText,
                    ),
                    message: "Arrow function with single simple statement should use expression body",
                    node: node.body,
                });

                return;
            }

            // Check if multi-line expression can be simplified
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
            }
        };

        return { ArrowFunctionExpression: checkArrowFunctionHandler };
    },
    meta: {
        docs: { description: "Simplify arrow functions in JSX props with single statement block body" },
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

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Assignment Value Same Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   The value in an assignment should start on the same line as
 *   the equals sign, not on a new line.
 *
 * ✓ Good:
 *   const name = "John";
 *   const data = {
 *       key: "value",
 *   };
 *
 * ✗ Bad:
 *   const name =
 *       "John";
 *   const data =
 *       {
 *           key: "value",
 *       };
 */
const assignmentValueSameLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkVariableDeclarationHandler = (node) => {
            const kindToken = sourceCode.getFirstToken(node); // const, let, var

            if (!kindToken) return;

            node.declarations.forEach((declarator) => {
                const { id, init } = declarator;

                // Check 1: const/let/var and variable name/pattern should be on same line
                // For first declarator, check against the kind token
                const isFirstDeclarator = node.declarations[0] === declarator;

                if (isFirstDeclarator) {
                    // For simple identifiers: const dispatch = ...
                    if (id.type === "Identifier") {
                        if (kindToken.loc.end.line !== id.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [kindToken.range[1], id.range[0]],
                                    " ",
                                ),
                                message: "Variable name should be on the same line as declaration keyword",
                                node: id,
                            });

                            return;
                        }
                    }

                    // For destructuring: const { x } = ... or const [ x ] = ...
                    if (id.type === "ObjectPattern" || id.type === "ArrayPattern") {
                        const openBracket = sourceCode.getFirstToken(id);

                        if (kindToken.loc.end.line !== openBracket.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [kindToken.range[1], openBracket.range[0]],
                                    " ",
                                ),
                                message: "Destructuring pattern should be on the same line as declaration keyword",
                                node: openBracket,
                            });

                            return;
                        }
                    }
                }

                if (!init) return;

                const equalToken = sourceCode.getTokenBefore(
                    init,
                    (t) => t.value === "=",
                );

                if (!equalToken) return;

                // Check 2: Variable/pattern and = should be on same line
                if (id.loc.end.line !== equalToken.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [id.range[1], equalToken.range[0]],
                            " ",
                        ),
                        message: "Assignment operator should be on the same line as variable",
                        node: equalToken,
                    });

                    return;
                }

                // Check 3: = and init value should be on same line
                if (init.loc.start.line > equalToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [equalToken.range[1], init.range[0]],
                            " ",
                        ),
                        message: "Value should be on the same line as the assignment operator",
                        node: init,
                    });
                }
            });
        };

        return { VariableDeclaration: checkVariableDeclarationHandler };
    },
    meta: {
        docs: { description: "Enforce assignment value on same line as equals sign" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Block Statement Newlines
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Block statements should have proper newlines after the opening
 *   brace and before the closing brace.
 *
 * ✓ Good:
 *   if (condition) {
 *       doSomething();
 *   }
 *
 * ✗ Bad:
 *   if (condition) { doSomething(); }
 *   if (condition) {doSomething();}
 */
const blockStatementNewlines = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkBlockStatementHandler = (node) => {
            const { body } = node;

            if (body.length === 0) return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);
            const firstStatement = body[0];
            const lastStatement = body[body.length - 1];
            const contentIndent = " ".repeat(firstStatement.loc.start.column);
            const braceIndent = " ".repeat(openBrace.loc.start.column);

            // Check if first statement is on same line as opening brace
            if (openBrace.loc.end.line === firstStatement.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstStatement.range[0]],
                        "\n" + contentIndent,
                    ),
                    message: "Statement should be on its own line after opening brace",
                    node: firstStatement,
                });
            }

            // Check if closing brace is on same line as last statement
            if (closeBrace.loc.start.line === lastStatement.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastStatement.range[1], closeBrace.range[0]],
                        "\n" + braceIndent,
                    ),
                    message: "Closing brace should be on its own line",
                    node: closeBrace,
                });
            }
        };

        return { BlockStatement: checkBlockStatementHandler };
    },
    meta: {
        docs: { description: "Enforce newlines after opening brace and before closing brace in blocks" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Comment Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Comments should have proper spacing: a space after the opening
 *   delimiter (// or block comment opener), and proper blank lines
 *   around comment blocks.
 *
 * ✓ Good:
 *   // This is a comment
 *   [block] This is a block comment [/block]
 *
 * ✗ Bad:
 *   //This is a comment (missing space)
 *   [block]No space after opener[/block]
 */
const commentSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Program(node) {
                const comments = sourceCode.getAllComments();

                if (comments.length === 0) return;

                const firstToken = sourceCode.getFirstToken(node);

                // Check each comment for internal spacing and syntax
                comments.forEach((comment) => {
                    const { type, value } = comment;

                    if (type === "Block") {
                        // Check if this is a single-line block comment (should be converted to //)
                        const isSingleLine = !value.includes("\n");

                        if (isSingleLine) {
                            // Single-line block comment should use // syntax
                            const trimmedValue = value.trim();

                            context.report({
                                fix: (fixer) => fixer.replaceText(comment, `// ${trimmedValue}`),
                                loc: comment.loc,
                                message: "Single-line comments should use // syntax instead of /* */",
                            });
                        } else {
                            // Multi-line block comment: check spacing
                            const needsStartSpace = value.length > 0 && !value.startsWith(" ") && !value.startsWith("*") && !value.startsWith("\n");
                            const needsEndSpace = value.length > 0 && !value.endsWith(" ") && !value.endsWith("*") && !value.endsWith("\n");

                            if (needsStartSpace || needsEndSpace) {
                                let newValue = value;

                                if (needsStartSpace) newValue = " " + newValue;

                                if (needsEndSpace) newValue = newValue + " ";

                                context.report({
                                    fix: (fixer) => fixer.replaceText(comment, `/*${newValue}*/`),
                                    loc: comment.loc,
                                    message: "Block comment should have space after /* and before */",
                                });
                            }
                        }
                    } else if (type === "Line") {
                        // Line comment: // ...
                        // Check if missing space after //
                        const needsSpace = value.length > 0 && !value.startsWith(" ") && !value.startsWith("/");

                        if (needsSpace) {
                            context.report({
                                fix: (fixer) => fixer.replaceText(comment, `// ${value}`),
                                loc: comment.loc,
                                message: "Line comment should have space after //",
                            });
                        }
                    }

                    // Check inline comments at end of code lines - should have exactly 1 space before
                    const tokenBefore = sourceCode.getTokenBefore(comment, { includeComments: false });

                    if (tokenBefore && tokenBefore.loc.end.line === comment.loc.start.line) {
                        // This is an inline comment at the end of a code line
                        const spaceBetween = comment.range[0] - tokenBefore.range[1];

                        if (spaceBetween !== 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenBefore.range[1], comment.range[0]],
                                    " ",
                                ),
                                loc: comment.loc,
                                message: "Inline comment should have exactly one space before it",
                            });
                        }
                    }
                });

                if (!firstToken) return;

                // Get only comments at the very top of the file (before any code)
                const topComments = comments.filter((comment) => comment.loc.end.line < firstToken.loc.start.line
                    || (comment.loc.start.line === 1 && firstToken.loc.start.line === 1 && comment.range[1] < firstToken.range[0]));

                // Check top-of-file comments: no blank lines between them
                if (topComments.length > 1) {
                    for (let i = 0; i < topComments.length - 1; i += 1) {
                        const current = topComments[i];
                        const next = topComments[i + 1];
                        const linesBetween = next.loc.start.line - current.loc.end.line;

                        if (linesBetween > 1) {
                            // There's a blank line between top comments - remove it
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [current.range[1], next.range[0]],
                                    "\n",
                                ),
                                loc: next.loc,
                                message: "No blank lines allowed between top-of-file comments",
                            });
                        }
                    }
                }

                // Check spacing between top-of-file comments and first code
                if (topComments.length > 0) {
                    const lastTopComment = topComments[topComments.length - 1];

                    // First code could be import, or any other statement
                    if (firstToken.loc.start.line === lastTopComment.loc.end.line + 1) {
                        // No empty line between last top comment and code - need one
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastTopComment, "\n"),
                            loc: firstToken.loc,
                            message: "Expected empty line between top-of-file comments and code",
                        });
                    } else if (firstToken.loc.start.line === lastTopComment.loc.end.line) {
                        // Code is on the same line as comment
                        context.report({
                            fix: (fixer) => fixer.insertTextBefore(firstToken, "\n\n"),
                            loc: firstToken.loc,
                            message: "Code should be on a new line after top-of-file comments",
                        });
                    }
                }

            },
        };
    },
    meta: {
        docs: { description: "Enforce comment spacing and formatting" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

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

        return {
            CallExpression(node) {
                const { callee } = node;

                // Get the last token of the callee (function name or member expression)
                const calleeLastToken = sourceCode.getLastToken(callee);

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
 * Rule: Function Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function names should follow naming conventions: camelCase,
 *   starting with a verb, and handlers ending with "Handler".
 *
 * ✓ Good:
 *   function getUserData() {}
 *   function handleClick() {}
 *   function isValidEmail() {}
 *   const submitHandler = () => {}
 *
 * ✗ Bad:
 *   function GetUserData() {}
 *   function user_data() {}
 *   function click() {}
 */
const functionNamingConvention = {
    create(context) {
        const componentNameRegex = /^[A-Z][a-zA-Z0-9]*$/;

        const handlerRegex = /Handler$/;

        const hookRegex = /^use[A-Z]/;

        const verbPrefixes = [
            "get", "set", "fetch", "load", "save", "create", "update", "delete", "remove", "add",
            "is", "has", "can", "should", "will", "did", "was", "were",
            "check", "validate", "verify", "confirm", "ensure",
            "find", "search", "filter", "sort", "map", "reduce", "merge", "split", "join",
            "parse", "format", "convert", "transform", "normalize", "serialize", "deserialize",
            "encode", "decode", "encrypt", "decrypt", "hash", "sign",
            "render", "display", "show", "hide", "toggle", "enable", "disable",
            "open", "close", "start", "stop", "init", "setup", "reset", "clear",
            "connect", "disconnect", "subscribe", "unsubscribe", "listen", "emit",
            "send", "receive", "request", "respond", "submit", "cancel", "abort",
            "read", "write", "copy", "move", "clone", "extract", "insert", "append", "prepend",
            "build", "make", "generate", "compute", "calculate", "process", "execute", "run",
            "apply", "call", "invoke", "trigger", "fire", "dispatch",
            "mount", "unmount", "attach", "detach", "bind", "unbind",
            "register", "unregister", "activate", "deactivate",
            "login", "logout", "authenticate", "authorize",
            "navigate", "redirect", "route", "scroll", "focus", "blur",
            "select", "deselect", "expand", "collapse", "resize", "refresh", "reload",
            "download", "upload", "import", "export", "sync", "async",
            "log", "warn", "error", "debug", "trace", "print",
            "wrap", "unwrap", "sanitize", "escape", "unescape", "trim", "pad",
            "count", "sum", "avg", "min", "max", "clamp", "round", "floor", "ceil",
            "throw", "catch", "resolve", "reject", "retry", "await",
            "debounce", "throttle", "memoize", "cache", "batch", "queue", "defer", "delay",
            "handle", "on", "click", "change", "input", "submit", "press", "drag", "drop",
        ];

        const startsWithVerbHandler = (name) => verbPrefixes.some((verb) => name.startsWith(verb));

        const endsWithHandler = (name) => handlerRegex.test(name);

        const checkFunctionHandler = (node) => {
            let name = null;

            if (node.type === "FunctionDeclaration" && node.id) {
                name = node.id.name;
            } else if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
                if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id) {
                    name = node.parent.id.name;
                }
            }

            if (!name) return;

            // Skip React components (PascalCase)
            if (/^[A-Z]/.test(name)) return;

            // Skip hooks
            if (/^use[A-Z]/.test(name)) return;

            const hasVerbPrefix = startsWithVerbHandler(name);
            const hasHandlerSuffix = endsWithHandler(name);

            if (!hasVerbPrefix && !hasHandlerSuffix) {
                context.report({
                    message: `Function "${name}" should start with a verb (get, set, fetch, handle, etc.) AND end with "Handler" (e.g., getDataHandler, handleClickHandler)`,
                    node: node.id || node.parent.id,
                });
            } else if (!hasVerbPrefix) {
                context.report({
                    message: `Function "${name}" should start with a verb (get, set, fetch, handle, click, submit, etc.)`,
                    node: node.id || node.parent.id,
                });
            } else if (!hasHandlerSuffix) {
                context.report({
                    message: `Function "${name}" should end with "Handler" suffix (e.g., ${name}Handler)`,
                    node: node.id || node.parent.id,
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
        docs: { description: "Enforce function names to start with a verb AND end with Handler" },
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
                        return `...${prop.argument.name}`;
                    }

                    const key = sourceCode.getText(prop.key);
                    const value = prop.value ? sourceCode.getText(prop.value) : key;

                    return prop.shorthand ? key : `${key}: ${value}`;
                });

                return `{ ${props.join(", ")} }`;
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
                const rightText = sourceCode.getText(param.right);

                return `${leftText} = ${rightText}`;
            }

            if (param.type === "RestElement") {
                return `...${param.argument.name}`;
            }

            return sourceCode.getText(param);
        };

        // Returns true only if any param has 2+ destructured properties
        const hasComplexDestructuredParamHandler = (params) => params.some((param) => {
            let pattern = param;

            if (param.type === "AssignmentPattern") {
                pattern = param.left;
            }

            if (pattern.type === "ObjectPattern") {
                return pattern.properties.length >= 2;
            }

            if (pattern.type === "ArrayPattern") {
                const elements = pattern.elements.filter((el) => el !== null);

                return elements.length >= 2;
            }

            return false;
        });

        const checkDestructuredParamHandler = (param, baseIndent) => {
            let pattern = param;

            if (param.type === "AssignmentPattern") {
                pattern = param.left;
            }

            // Only enforce multi-line for 2+ destructured properties
            if (pattern.type === "ObjectPattern") {
                const properties = pattern.properties;

                if (properties.length < 2) return;

                const openBrace = sourceCode.getFirstToken(pattern);
                const closeBrace = sourceCode.getLastToken(pattern);
                const propIndent = " ".repeat(baseIndent + 4);
                const braceIndent = " ".repeat(baseIndent);

                if (openBrace.loc.end.line === properties[0].loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], properties[0].range[0]],
                            "\n" + propIndent,
                        ),
                        message: "First destructured property should be on its own line when 2+ properties",
                        node: properties[0],
                    });
                }

                if (closeBrace.loc.start.line === properties[properties.length - 1].loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [properties[properties.length - 1].range[1], closeBrace.range[0]],
                            ",\n" + braceIndent,
                        ),
                        message: "Closing brace should be on its own line when 2+ properties",
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
                            message: "Each destructured property should be on its own line when 2+ properties",
                            node: next,
                        });
                    }
                }
            }

            // Only enforce multi-line for 2+ destructured array elements
            if (pattern.type === "ArrayPattern") {
                const elements = pattern.elements.filter((el) => el !== null);

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

            // Callback arrow functions with 2+ simple params: each param on its own line
            if (isCallback && params.length >= 2 && !hasComplexDestructuredParamHandler(params)) {
                // Check if all params are simple identifiers (not destructuring)
                const allSimpleParams = params.every((p) => p.type === "Identifier");

                if (allSimpleParams) {
                    // Calculate proper indent based on opening paren position
                    const paramIndent = " ".repeat(openParen.loc.start.column + 4);
                    const parenIndent = " ".repeat(openParen.loc.start.column);

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
            }

            // Skip other callback arrow functions (single param handled by opening-brackets-same-line)
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
                        message: `Dependencies should be on same line when ${maxDeps} or fewer`,
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
 * Rule: If Statement Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   If statements should have consistent formatting with the
 *   opening brace on the same line as the condition and else
 *   on the same line as the closing brace.
 *
 * ✓ Good:
 *   if (condition) {
 *       doSomething();
 *   } else {
 *       doOther();
 *   }
 *
 * ✗ Bad:
 *   if (condition)
 *   {
 *       doSomething();
 *   }
 *   else
 *   {
 *       doOther();
 *   }
 */
const ifStatementFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Simple conditions that should be on single line (no logical expressions)
        const isSimpleConditionHandler = (testNode) => {
            const simpleTypes = [
                "Identifier",
                "MemberExpression",
                "UnaryExpression",
                "Literal",
            ];

            if (simpleTypes.includes(testNode.type)) return true;

            // Simple call expression like fn() or obj.method()
            if (testNode.type === "CallExpression" && testNode.arguments.length === 0) {
                return true;
            }

            // LogicalExpression with multiple conditions should NOT be collapsed
            // They are intentionally multi-line for readability
            return false;
        };

        const checkIfStatement = (node) => {
            const { consequent, test } = node;

            // Skip braceless if statements - they don't have a block body
            const hasBlockBody = consequent.type === "BlockStatement";

            const ifToken = sourceCode.getFirstToken(node);

            const openParen = sourceCode.getTokenAfter(
                ifToken,
                (t) => t.value === "(",
            );

            const closeParen = sourceCode.getTokenAfter(
                test,
                (t) => t.value === ")",
            );

            if (!openParen || !closeParen) {
                return;
            }

            // Only look for opening brace if the if statement has a block body
            const openBrace = hasBlockBody
                ? sourceCode.getFirstToken(consequent)
                : null;

            // Check if "if" and "(" are on different lines
            if (ifToken.loc.end.line !== openParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [ifToken.range[1], openParen.range[0]],
                        " ",
                    ),
                    message: "Opening parenthesis should be on the same line as 'if'",
                    node: openParen,
                });

                return;
            }

            // Check for simple conditions that span multiple lines - collapse to single line
            const conditionSpansMultipleLines = openParen.loc.end.line !== closeParen.loc.start.line;

            if (conditionSpansMultipleLines && isSimpleConditionHandler(test)) {
                const testText = sourceCode.getText(test);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], closeParen.range[0]],
                        testText,
                    ),
                    message: "Simple if condition should be on a single line",
                    node: test,
                });

                return;
            }

            // Check if ")" and "{" are on different lines (only for block body if statements)
            if (openBrace && closeParen.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeParen.range[1], openBrace.range[0]],
                        " ",
                    ),
                    message: "Opening brace should be on the same line as closing parenthesis",
                    node: openBrace,
                });
            }
        };

        return { IfStatement: checkIfStatement };
    },
    meta: {
        docs: { description: "Ensure if statement has proper formatting: if (...) {" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Multiline If Conditions
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When an if statement has multiple conditions that span
 *   multiple lines, each condition should be on its own line.
 *
 * Options:
 *   { maxOperands: 3 } - Maximum operands on single line (default: 3)
 *
 * ✓ Good:
 *   if (
 *       conditionA &&
 *       conditionB &&
 *       conditionC
 *   ) {}
 *
 * ✗ Bad:
 *   if (conditionA &&
 *       conditionB && conditionC) {}
 */
const multilineIfConditions = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxOperands = options.maxOperands !== undefined ? options.maxOperands : 3;

        const isParenthesizedHandler = (node) => {
            const tokenBefore = sourceCode.getTokenBefore(node);
            const tokenAfter = sourceCode.getTokenAfter(node);

            if (!tokenBefore || !tokenAfter) return false;

            if (tokenBefore.value === "(" && tokenAfter.value === ")") {
                // Check if this is the if statement's own parens
                if (node.parent.type === "IfStatement" && node.parent.test === node) {
                    const beforeLeft = sourceCode.getTokenBefore(tokenBefore);

                    if (beforeLeft && beforeLeft.value === "if") return false;
                }

                return true;
            }

            return false;
        };

        const getSourceTextWithGroupsHandler = (node) => {
            let start = node.range[0];
            let end = node.range[1];
            let left = sourceCode.getTokenBefore(node);
            let right = sourceCode.getTokenAfter(node);

            while (left && left.value === "(" && right && right.value === ")") {
                if (node.parent.type === "IfStatement" && node.parent.test === node) {
                    const beforeLeft = sourceCode.getTokenBefore(left);

                    if (beforeLeft && beforeLeft.value === "if") break;
                }

                start = left.range[0];
                end = right.range[1];
                left = sourceCode.getTokenBefore(left);
                right = sourceCode.getTokenAfter(right);
            }

            return sourceCode.text.slice(start, end);
        };

        const collectOperandsHandler = (node) => {
            const operands = [];

            const collectHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    collectHelperHandler(n.left);
                    collectHelperHandler(n.right);
                } else {
                    operands.push(n);
                }
            };

            collectHelperHandler(node);

            return operands;
        };

        const checkIfStatementHandler = (node) => {
            const { test } = node;

            if (test.type !== "LogicalExpression") return;

            const operands = collectOperandsHandler(test);
            const openParen = sourceCode.getTokenBefore(test);
            const closeParen = sourceCode.getTokenAfter(test);

            if (!openParen || !closeParen) return;

            const isMultiLine = openParen.loc.start.line !== closeParen.loc.end.line;

            // maxOperands or fewer operands: keep on single line
            if (operands.length <= maxOperands) {
                if (isMultiLine) {
                    context.report({
                        fix: (fixer) => {
                            const buildSingleLineHandler = (n) => {
                                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                    const leftText = buildSingleLineHandler(n.left);
                                    const rightText = buildSingleLineHandler(n.right);

                                    return `${leftText} ${n.operator} ${rightText}`;
                                }

                                return getSourceTextWithGroupsHandler(n);
                            };

                            return fixer.replaceTextRange(
                                [openParen.range[0], closeParen.range[1]],
                                `(${buildSingleLineHandler(test)})`,
                            );
                        },
                        message: `If conditions with ${maxOperands} or fewer operands should be on a single line`,
                        node: test,
                    });
                }

                return;
            }

            // More than maxOperands: each on its own line
            let isCorrectionNeeded = !isMultiLine;

            if (isMultiLine) {
                for (let i = 0; i < operands.length - 1; i += 1) {
                    if (operands[i].loc.end.line === operands[i + 1].loc.start.line) {
                        isCorrectionNeeded = true;
                        break;
                    }
                }

                if (openParen.loc.end.line === operands[0].loc.start.line) {
                    isCorrectionNeeded = true;
                }
            }

            if (isCorrectionNeeded) {
                context.report({
                    fix: (fixer) => {
                        const indent = " ".repeat(node.loc.start.column + 4);
                        const parenIndent = " ".repeat(node.loc.start.column);

                        const buildMultilineHandler = (n) => {
                            if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                const leftText = buildMultilineHandler(n.left);
                                const rightText = buildMultilineHandler(n.right);

                                return `${leftText}\n${indent}${n.operator} ${rightText}`;
                            }

                            return getSourceTextWithGroupsHandler(n);
                        };

                        return fixer.replaceTextRange(
                            [openParen.range[0], closeParen.range[1]],
                            `(\n${indent}${buildMultilineHandler(test)}\n${parenIndent})`,
                        );
                    },
                    message: `If conditions with more than ${maxOperands} operands should be multiline, with each operand on its own line`,
                    node: test,
                });
            }
        };

        return { IfStatement: checkIfStatementHandler };
    },
    meta: {
        docs: { description: "Enforce multiline if conditions when exceeding threshold (default: >3 operands)" },
        fixable: "whitespace",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxOperands: {
                        default: 3,
                        description: "Maximum operands to keep on single line (default: 3)",
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
 * Rule: Absolute Imports Only
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce absolute imports from index files only for local paths.
 *   Local paths (starting with @/) should only import from
 *   folder-level index files.
 *
 * Options:
 *   - aliasPrefix: string (default: "@/") - The import alias prefix
 *   - extraAllowedFolders: string[] - Additional folders to allow (extends defaults)
 *   - extraReduxSubfolders: string[] - Additional redux subfolders (extends defaults)
 *   - extraDeepImportFolders: string[] - Additional folders allowing deep imports (extends "assets")
 *   - allowedFolders: string[] - Replace default folders entirely (use extraAllowedFolders to extend)
 *   - reduxSubfolders: string[] - Replace default redux subfolders entirely
 *   - deepImportFolders: string[] - Replace default deep import folders entirely
 *
 * ✓ Good:
 *   import { Button } from "@/components";
 *   import { useAuth } from "@/hooks";
 *
 * ✗ Bad:
 *   import { Button } from "@/components/buttons/primary-button";
 *   import { useAuth } from "@/hooks/auth/useAuth";
 *
 * Configuration Example:
 *   "code-style/absolute-imports-only": ["error", {
 *       extraAllowedFolders: ["features", "modules", "lib"],
 *       extraDeepImportFolders: ["images", "fonts"]
 *   }]
 */
const absoluteImportsOnly = {
    create(context) {
        const options = context.options[0] || {};

        // Get the alias prefix from options or default to "@/"
        const aliasPrefix = options.aliasPrefix || "@/";

        // Default redux subfolders
        const defaultReduxSubfolders = ["actions", "reducers", "store", "thunks", "types"];

        // Redux ecosystem folders - can be standalone or inside redux folder
        // These are allowed as: @/actions, @/types, @/store, @/reducers, @/thunks
        // OR as: @/redux/actions, @/redux/types, @/redux/store, @/redux/reducers, @/redux/thunks
        const reduxSubfolders = options.reduxSubfolders
            || [...defaultReduxSubfolders, ...(options.extraReduxSubfolders || [])];

        // Default allowed folders
        const defaultAllowedFolders = [
            "actions",
            "apis",
            "assets",
            "atoms",
            "components",
            "constants",
            "contexts",
            "data",
            "hooks",
            "layouts",
            "middlewares",
            "providers",
            "reducers",
            "redux",
            "requests",
            "routes",
            "schemas",
            "services",
            "store",
            "styles",
            "theme",
            "thunks",
            "types",
            "utils",
            "views",
        ];

        // List of allowed top-level folders (can be configured via options)
        // Use allowedFolders to replace entirely, or extraAllowedFolders to extend defaults
        const allowedFolders = options.allowedFolders
            || [...defaultAllowedFolders, ...(options.extraAllowedFolders || [])];

        // Default folders that allow deep imports
        const defaultDeepImportFolders = ["assets"];

        // Folders that allow deep imports (images, fonts, etc. don't have index files)
        // e.g., @/assets/images/logo.svg is allowed
        const deepImportFolders = options.deepImportFolders
            || [...defaultDeepImportFolders, ...(options.extraDeepImportFolders || [])];

        return {
            ImportDeclaration(node) {
                const importPath = node.source.value;

                // Skip if not a string
                if (typeof importPath !== "string") return;

                // Get the current filename
                const filename = context.filename || context.getFilename();
                const normalizedFilename = filename.replace(/\\/g, "/");

                // Check if this is an index file - index files are allowed to use relative imports
                // for re-exporting their contents
                const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

                // 1. Disallow relative imports (starting with ./ or ../)
                // EXCEPT in index files which need relative imports for re-exports
                if (importPath.startsWith("./") || importPath.startsWith("../")) {
                    if (!isIndexFile) {
                        context.report({
                            message: `Relative imports are not allowed. Use absolute imports with "${aliasPrefix}" prefix instead.`,
                            node: node.source,
                        });
                    }

                    return;
                }

                // 2. Skip node_modules packages (bare imports without @ or starting with @scope/ but not @/)
                // Examples: "react", "react-dom", "lodash"
                if (!importPath.startsWith("@") && !importPath.startsWith(".")) {
                    return; // Node modules package
                }

                // 3. Skip scoped packages from node_modules (e.g., @mui/material, @reduxjs/toolkit)
                // These start with @ but NOT with the local alias prefix
                if (importPath.startsWith("@") && !importPath.startsWith(aliasPrefix)) {
                    return; // Scoped npm package
                }

                // 4. Check local alias imports (e.g., @/atoms, @/components)
                if (importPath.startsWith(aliasPrefix)) {
                    // Remove the alias prefix to get the path
                    const pathAfterAlias = importPath.slice(aliasPrefix.length);

                    // Split by "/" to get path segments
                    const segments = pathAfterAlias.split("/").filter((s) => s.length > 0);

                    // Must have at least one segment
                    if (segments.length === 0) {
                        context.report({
                            message: `Invalid import path "${importPath}". Specify a folder to import from.`,
                            node: node.source,
                        });

                        return;
                    }

                    // Get the first segment (folder name)
                    const folderName = segments[0];

                    // Check if it's an allowed folder
                    if (!allowedFolders.includes(folderName)) {
                        context.report({
                            message: `Unknown folder "${folderName}" in import path. Allowed folders: ${allowedFolders.join(", ")}`,
                            node: node.source,
                        });

                        return;
                    }

                    // Only one segment is allowed (import from index file)
                    // e.g., @/atoms is OK, @/atoms/menus is NOT OK
                    // EXCEPTION: Redux ecosystem - @/redux/actions, @/redux/types, etc. are allowed
                    if (segments.length > 1) {
                        // Check if this is a redux subfolder import (e.g., @/redux/actions)
                        const isReduxSubfolder = folderName === "redux"
                            && segments.length === 2
                            && reduxSubfolders.includes(segments[1]);

                        if (isReduxSubfolder) {
                            // This is allowed: @/redux/actions, @/redux/types, etc.
                            return;
                        }

                        // Check if importing deeper than allowed redux subfolder
                        // e.g., @/redux/actions/thunks is NOT allowed
                        if (folderName === "redux" && segments.length > 2) {
                            const suggestedImport = `${aliasPrefix}redux/${segments[1]}`;

                            context.report({
                                message: `Deep imports are not allowed. Import from "${suggestedImport}" instead of "${importPath}". Export the module from the folder's index file.`,
                                node: node.source,
                            });

                            return;
                        }

                        // Some folders allow deep imports (images, fonts, etc. don't have index files)
                        // e.g., @/assets/images/logo.svg is allowed
                        if (deepImportFolders.includes(folderName)) {
                            return;
                        }

                        const suggestedImport = `${aliasPrefix}${folderName}`;

                        context.report({
                            message: `Deep imports are not allowed. Import from "${suggestedImport}" instead of "${importPath}". Export the module from the folder's index file.`,
                            node: node.source,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce absolute imports from index files only for local paths" },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    aliasPrefix: { type: "string" },
                    allowedFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    deepImportFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraAllowedFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraDeepImportFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraReduxSubfolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    reduxSubfolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Export Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Export statements should have consistent formatting with
 *   proper spacing. Ensures `export {` is on the same line.
 *   - Collapses to single line when count <= maxSpecifiers (default 3)
 *   - Expands to multiline when count > maxSpecifiers, with each
 *     specifier on its own line
 *
 *   This rule is self-sufficient and handles both collapsing and
 *   expanding of export specifiers.
 *
 * Options:
 *   { maxSpecifiers: 3 } - Threshold for single line vs multiline
 *
 * ✓ Good:
 *   export { a, b, c };
 *   export {
 *       a,
 *       b,
 *       c,
 *       d,
 *   };
 *
 * ✗ Bad:
 *   export {a,b,c};
 *   export
 *       { a };
 *   export { a, b, c, d, e };
 */
const exportFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxSpecifiers = options.maxSpecifiers !== undefined ? options.maxSpecifiers : 3;

        const checkExportHandler = (node) => {
            const specifiers = node.specifiers;

            if (specifiers.length === 0) return;

            const exportToken = sourceCode.getFirstToken(node);
            const openBrace = sourceCode.getTokenAfter(exportToken, (t) => t.value === "{");
            const closeBrace = sourceCode.getLastToken(node, (t) => t.value === "}");

            if (!openBrace || !closeBrace) return;

            // Check if "export" and "{" are on different lines
            if (exportToken.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [exportToken.range[1], openBrace.range[0]],
                        " ",
                    ),
                    message: "Opening brace should be on the same line as 'export'",
                    node: openBrace,
                });
            }

            const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;
            const firstSpecifier = specifiers[0];
            const lastSpecifier = specifiers[specifiers.length - 1];

            // Collapse to single line if specifiers <= maxSpecifiers
            if (specifiers.length <= maxSpecifiers) {
                if (isMultiLine) {
                    const specifiersText = specifiers.map((s) => {
                        if (s.exported.name === s.local.name) return s.local.name;

                        return `${s.local.name} as ${s.exported.name}`;
                    }).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{ ${specifiersText} }`,
                        ),
                        message: `Exports with ${maxSpecifiers} or fewer specifiers should be on a single line`,
                        node,
                    });
                }
            } else {
                // Expand to multiline if specifiers > maxSpecifiers
                const baseIndent = " ".repeat(exportToken.loc.start.column);
                const specifierIndent = baseIndent + "    ";

                // Check if first specifier is on same line as opening brace
                if (openBrace.loc.end.line === firstSpecifier.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], firstSpecifier.range[0]],
                            "\n" + specifierIndent,
                        ),
                        message: `Exports with more than ${maxSpecifiers} specifiers should have first specifier on its own line`,
                        node: firstSpecifier,
                    });
                }

                // Check if closing brace is on same line as last specifier
                if (closeBrace.loc.start.line === lastSpecifier.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastSpecifier.range[1], closeBrace.range[0]],
                            ",\n" + baseIndent,
                        ),
                        message: `Exports with more than ${maxSpecifiers} specifiers should have closing brace on its own line`,
                        node: closeBrace,
                    });
                }

                // Check each specifier is on its own line
                for (let i = 0; i < specifiers.length - 1; i += 1) {
                    const current = specifiers[i];
                    const next = specifiers[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + specifierIndent,
                            ),
                            message: `Each export specifier should be on its own line when more than ${maxSpecifiers} specifiers`,
                            node: next,
                        });
                    }
                }
            }
        };

        return { ExportNamedDeclaration: checkExportHandler };
    },
    meta: {
        docs: { description: "Format exports: export { on same line, collapse/expand specifiers based on count threshold" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxSpecifiers: {
                        default: 3,
                        description: "Maximum specifiers to keep on single line (default: 3). Exports exceeding this will be expanded to multiline.",
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
 * Rule: Import Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Import statements should have consistent formatting with
 *   proper spacing. Ensures `import {` and `} from` are on
 *   the same line.
 *   - Collapses to single line when count <= maxSpecifiers (default 3)
 *   - Expands to multiline when count > maxSpecifiers, with each
 *     specifier on its own line
 *
 *   This rule is self-sufficient and handles both collapsing and
 *   expanding of import specifiers.
 *
 * Options:
 *   { maxSpecifiers: 3 } - Threshold for single line vs multiline
 *
 * ✓ Good:
 *   import { a, b, c } from "module";
 *   import {
 *       a,
 *       b,
 *       c,
 *       d,
 *   } from "module";
 *
 * ✗ Bad:
 *   import {a,b,c} from "module";
 *   import
 *       { a } from "module";
 *   import { a, b, c, d, e } from "module";
 */
const importFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxSpecifiers = options.maxSpecifiers !== undefined ? options.maxSpecifiers : 3;

        const checkImportHandler = (node) => {
            const importToken = sourceCode.getFirstToken(node);
            const namedSpecifiers = node.specifiers.filter((s) => s.type === "ImportSpecifier");
            const defaultSpecifier = node.specifiers.find((s) => s.type === "ImportDefaultSpecifier");

            // Handle default imports: import Foo from "bar"
            if (defaultSpecifier && namedSpecifiers.length === 0) {
                const fromToken = sourceCode.getTokenBefore(node.source, (t) => t.value === "from");

                if (fromToken && importToken.loc.start.line !== node.source.loc.end.line) {
                    const defaultName = defaultSpecifier.local.name;
                    const sourcePath = node.source.raw;

                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node,
                            `import ${defaultName} from ${sourcePath};`,
                        ),
                        message: "Default import should be on a single line",
                        node,
                    });
                }

                return;
            }

            // Handle named imports
            if (namedSpecifiers.length === 0) return;

            const openBrace = sourceCode.getTokenAfter(importToken, (t) => t.value === "{");
            const closeBrace = sourceCode.getTokenBefore(node.source, (t) => t.value === "}");
            const fromToken = sourceCode.getTokenBefore(node.source, (t) => t.value === "from");

            if (!openBrace || !closeBrace || !fromToken) return;

            // Check if "import" and "{" are on different lines
            if (importToken.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [importToken.range[1], openBrace.range[0]],
                        " ",
                    ),
                    message: "Opening brace should be on the same line as 'import'",
                    node: openBrace,
                });
            }

            // Check if "}" and "from" are on different lines
            if (closeBrace.loc.end.line !== fromToken.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeBrace.range[1], fromToken.range[0]],
                        " ",
                    ),
                    message: "Closing brace should be on the same line as 'from'",
                    node: fromToken,
                });
            }

            const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;
            const firstSpecifier = namedSpecifiers[0];
            const lastSpecifier = namedSpecifiers[namedSpecifiers.length - 1];

            // Collapse to single line if specifiers <= maxSpecifiers
            if (namedSpecifiers.length <= maxSpecifiers) {
                if (isMultiLine) {
                    const specifiersText = namedSpecifiers.map((s) => {
                        if (s.imported.name === s.local.name) return s.local.name;

                        return `${s.imported.name} as ${s.local.name}`;
                    }).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{ ${specifiersText} }`,
                        ),
                        message: `Imports with ${maxSpecifiers} or fewer specifiers should be on a single line`,
                        node,
                    });
                }
            } else {
                // Expand to multiline if specifiers > maxSpecifiers
                const baseIndent = " ".repeat(importToken.loc.start.column);
                const specifierIndent = baseIndent + "    ";

                // Check if first specifier is on same line as opening brace
                if (openBrace.loc.end.line === firstSpecifier.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], firstSpecifier.range[0]],
                            "\n" + specifierIndent,
                        ),
                        message: `Imports with more than ${maxSpecifiers} specifiers should have first specifier on its own line`,
                        node: firstSpecifier,
                    });
                }

                // Check if closing brace is on same line as last specifier
                if (closeBrace.loc.start.line === lastSpecifier.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastSpecifier.range[1], closeBrace.range[0]],
                            ",\n" + baseIndent,
                        ),
                        message: `Imports with more than ${maxSpecifiers} specifiers should have closing brace on its own line`,
                        node: closeBrace,
                    });
                }

                // Check each specifier is on its own line
                for (let i = 0; i < namedSpecifiers.length - 1; i += 1) {
                    const current = namedSpecifiers[i];
                    const next = namedSpecifiers[i + 1];

                    if (current.loc.end.line === next.loc.start.line) {
                        const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + specifierIndent,
                            ),
                            message: `Each import specifier should be on its own line when more than ${maxSpecifiers} specifiers`,
                            node: next,
                        });
                    }
                }
            }
        };

        return { ImportDeclaration: checkImportHandler };
    },
    meta: {
        docs: { description: "Format imports: import { on same line, } from on same line, collapse/expand specifiers based on count threshold" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxSpecifiers: {
                        default: 3,
                        description: "Maximum specifiers to keep on single line (default: 3). Imports exceeding this will be expanded to multiline.",
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
 * Rule: Import Source Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No spaces inside import path quotes. The module path should
 *   not have leading or trailing whitespace.
 *
 * ✓ Good:
 *   import { Button } from "@mui/material";
 *
 * ✗ Bad:
 *   import { Button } from " @mui/material ";
 */
const importSourceSpacing = {
    create(context) {
        return {
            ImportDeclaration(node) {
                const { source } = node;

                if (source.type !== "Literal" || typeof source.value !== "string") return;

                const sourceValue = source.value;
                const trimmed = sourceValue.trim();

                if (sourceValue !== trimmed && trimmed.length > 0) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(source, `"${trimmed}"`),
                        message: `Import path should not have extra spaces inside quotes: "${trimmed}" not "${sourceValue}"`,
                        node: source,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce no extra spaces inside import path quotes" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Module Index Exports
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Ensure module folders have index files that export all contents.
 *   Each module folder must have an index file that exports all
 *   subfolders and files in the module.
 *
 * Options:
 *   - extraModuleFolders: string[] - Additional module folders (extends defaults)
 *   - extraLazyLoadFolders: string[] - Additional lazy load folders (extends defaults)
 *   - extraIgnorePatterns: string[] - Additional ignore patterns (extends defaults)
 *   - moduleFolders: string[] - Replace default module folders entirely
 *   - lazyLoadFolders: string[] - Replace default lazy load folders entirely
 *   - ignorePatterns: string[] - Replace default ignore patterns entirely
 *
 * ✓ Good:
 *   // index.js
 *   export { Button } from "./Button";
 *   export { Input } from "./Input";
 *
 * ✗ Bad:
 *   // Missing exports in index.js
 *
 * Configuration Example:
 *   "code-style/module-index-exports": ["error", {
 *       extraModuleFolders: ["features", "modules", "lib"],
 *       extraLazyLoadFolders: ["pages"],
 *       extraIgnorePatterns: ["*.stories.js", "*.mock.js"]
 *   }]
 */
const moduleIndexExports = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const srcPath = nodePath.resolve(filename, "../../..").replace(/\\/g, "/");

        // Get options or use defaults
        const options = context.options[0] || {};

        // Default module folders
        const defaultModuleFolders = [
            "apis",
            "assets",
            "atoms",
            "components",
            "constants",
            "contexts",
            "data",
            "hooks",
            "layouts",
            "middlewares",
            "providers",
            "redux",
            "requests",
            "routes",
            "schemas",
            "services",
            "styles",
            "theme",
            "utils",
            "views",
        ];

        // List of module folders (can be configured via options)
        // Use moduleFolders to replace entirely, or extraModuleFolders to extend defaults
        const moduleFolders = options.moduleFolders
            || [...defaultModuleFolders, ...(options.extraModuleFolders || [])];

        // Default lazy load folders
        const defaultLazyLoadFolders = ["views"];

        // Folders that use lazy loading and shouldn't require index exports
        // These folders typically have components loaded via dynamic import()
        const lazyLoadFolders = options.lazyLoadFolders
            || [...defaultLazyLoadFolders, ...(options.extraLazyLoadFolders || [])];

        // Default ignore patterns
        const defaultIgnorePatterns = [
            "index.js",
            "index.jsx",
            "index.ts",
            "index.tsx",
            ".DS_Store",
            "__tests__",
            "__mocks__",
            "*.test.js",
            "*.test.jsx",
            "*.spec.js",
            "*.spec.jsx",
        ];

        // Files/folders to ignore
        const ignorePatterns = options.ignorePatterns
            || [...defaultIgnorePatterns, ...(options.extraIgnorePatterns || [])];

        const shouldIgnoreHandler = (name) => ignorePatterns.some((pattern) => {
            if (pattern.includes("*")) {
                const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");

                return regex.test(name);
            }

            return name === pattern;
        });

        const getExportedSourcesHandler = (node) => {
            const exportedSources = new Set();
            const importedNames = new Map();

            if (node.type === "Program") {
                // First pass: collect all imports and their sources
                node.body.forEach((statement) => {
                    // import Foo from "./folder/file"
                    // import { Foo } from "./folder/file"
                    if (statement.type === "ImportDeclaration" && statement.source) {
                        const sourcePath = statement.source.value;

                        statement.specifiers.forEach((spec) => {
                            if (spec.local && spec.local.name) {
                                importedNames.set(
                                    spec.local.name,
                                    sourcePath,
                                );
                            }
                        });
                    }
                });

                // Second pass: check what's exported
                node.body.forEach((statement) => {
                    // export { Foo, Bar } from "./file"
                    if (statement.type === "ExportNamedDeclaration") {
                        // Track direct re-exports: export { ... } from "./path"
                        if (statement.source) {
                            const sourcePath = statement.source.value;

                            exportedSources.add(sourcePath);
                        }

                        // Track exports of imported items: export { Foo }
                        if (statement.specifiers && !statement.source) {
                            statement.specifiers.forEach((spec) => {
                                const exportedName = spec.local ? spec.local.name : spec.exported.name;

                                if (importedNames.has(exportedName)) {
                                    exportedSources.add(importedNames.get(exportedName));
                                }
                            });
                        }
                    }

                    // export * from "./file"
                    if (statement.type === "ExportAllDeclaration" && statement.source) {
                        exportedSources.add(statement.source.value);
                    }
                });
            }

            return exportedSources;
        };

        const normalizeModuleNameHandler = (name) => {
            // Remove file extension
            let normalized = name.replace(/\.(js|jsx|ts|tsx)$/, "");

            // Convert kebab-case to various formats for matching
            return normalized;
        };

        const checkIndexFileExportsHandler = (programNode, dirPath, folderName) => {
            // Get all items in the directory
            let items;

            try {
                items = fs.readdirSync(dirPath);
            } catch {
                return;
            }

            // Filter out ignored items
            const moduleItems = items.filter((item) => {
                if (shouldIgnoreHandler(item)) return false;

                const itemPath = nodePath.join(dirPath, item);

                try {
                    const stat = fs.statSync(itemPath);

                    // Include directories and JS/JSX files
                    if (stat.isDirectory()) return true;
                    if (/\.(js|jsx|ts|tsx)$/.test(item)) return true;
                } catch {
                    return false;
                }

                return false;
            });

            if (moduleItems.length === 0) return;

            // Get all sources that are being exported
            const exportedSources = getExportedSourcesHandler(programNode);

            // Check each module item
            moduleItems.forEach((item) => {
                const itemName = normalizeModuleNameHandler(item);
                const itemPath = nodePath.join(dirPath, item);
                const isDirectory = fs.statSync(itemPath).isDirectory();

                // Check if this item or any deep path from it is exported
                const isExported = Array.from(exportedSources).some((source) => {
                    // Direct matches: ./folder, ./file
                    if (source === `./${item}` || source === `./${itemName}`) {
                        return true;
                    }

                    // Deep path matches: ./folder/subfolder/file starts with ./folder
                    if (source.startsWith(`./${itemName}/`)) {
                        return true;
                    }

                    // Handle cases like ./folder/index
                    if (isDirectory && (source === `./${itemName}/index` || source === `./${itemName}/index.js` || source === `./${itemName}/index.jsx`)) {
                        return true;
                    }

                    return false;
                });

                if (!isExported) {
                    context.report({
                        message: `Module "${item}" in "${folderName}" folder is not exported from index file. Add: export * from "./${itemName}"; or export { ... } from "./${itemName}";`,
                        node: programNode,
                    });
                }
            });
        };

        return {
            Program(node) {
                // Normalize the filename path
                const normalizedFilename = filename.replace(/\\/g, "/");

                // Check if this is an index file in a module folder
                const indexMatch = normalizedFilename.match(/\/src\/([^/]+)\/index\.(js|jsx|ts|tsx)$/);

                if (indexMatch) {
                    const folderName = indexMatch[1];

                    // Skip lazy-loaded folders - they use dynamic imports
                    if (lazyLoadFolders.includes(folderName)) return;

                    if (moduleFolders.includes(folderName)) {
                        const dirPath = nodePath.dirname(filename);

                        checkIndexFileExportsHandler(
                            node,
                            dirPath,
                            folderName,
                        );
                    }
                }

                // Check if this file is in a module folder but NOT the index file
                // to ensure the module folder HAS an index file
                const moduleMatch = normalizedFilename.match(/\/src\/([^/]+)\/([^/]+)\.(js|jsx|ts|tsx)$/);

                if (moduleMatch) {
                    const folderName = moduleMatch[1];
                    const fileName = moduleMatch[2];

                    if (moduleFolders.includes(folderName) && fileName !== "index") {
                        const dirPath = nodePath.dirname(filename);
                        const indexPath = nodePath.join(dirPath, "index.js");
                        const indexPathJsx = nodePath.join(dirPath, "index.jsx");

                        if (!fs.existsSync(indexPath) && !fs.existsSync(indexPathJsx)) {
                            context.report({
                                message: `Module folder "${folderName}" is missing an index file. Create index.js to export all modules.`,
                                node,
                            });
                        }
                    }
                }

                // Check for subfolder index files
                const subfolderMatch = normalizedFilename.match(/\/src\/([^/]+)\/([^/]+)\/index\.(js|jsx|ts|tsx)$/);

                if (subfolderMatch) {
                    const parentFolder = subfolderMatch[1];
                    const subFolder = subfolderMatch[2];

                    // Skip lazy-loaded folders - they use dynamic imports
                    if (lazyLoadFolders.includes(parentFolder)) return;

                    if (moduleFolders.includes(parentFolder)) {
                        const dirPath = nodePath.dirname(filename);

                        checkIndexFileExportsHandler(
                            node,
                            dirPath,
                            `${parentFolder}/${subFolder}`,
                        );
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Ensure module folders have index files that export all contents" },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    extraIgnorePatterns: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraLazyLoadFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    extraModuleFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    ignorePatterns: {
                        items: { type: "string" },
                        type: "array",
                    },
                    lazyLoadFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                    moduleFolders: {
                        items: { type: "string" },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Index Export Style
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces consistent export formatting across all files:
 *   - Index files: no blank lines between exports, consistent style
 *   - Non-index files: require blank lines between exports
 *
 *   For index files, choose between shorthand re-exports or
 *   import-then-export pattern.
 *
 * Options:
 *   - style: "shorthand" (default) | "import-export"
 *     - "shorthand": export { a } from "./file"; (no empty lines between exports)
 *     - "import-export": import { a } from "./file"; export { a }; (single export statement)
 *
 * ✓ Good (index files - shorthand style):
 *   export { Button } from "./button";
 *   export { Input, Select } from "./form";
 *   export { Modal } from "./modal";
 *
 * ✓ Good (non-index files - blank lines required):
 *   export const foo = 1;
 *
 *   export const bar = 2;
 *
 * ✗ Bad (index files - empty lines between exports):
 *   export { Button } from "./button";
 *
 *   export { Input } from "./input";
 *
 * ✗ Bad (non-index files - no blank lines):
 *   export const foo = 1;
 *   export const bar = 2;
 *
 * Configuration Example:
 *   "code-style/index-export-style": ["error", { style: "shorthand" }]
 *   "code-style/index-export-style": ["error", { style: "import-export" }]
 */
const indexExportStyle = {
    create(context) {
        const options = context.options[0] || {};
        const preferredStyle = options.style || "shorthand";
        const sourceCode = context.sourceCode || context.getSourceCode();
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

        // For non-index files: require blank lines between exports
        if (!isIndexFile) {
            return {
                Program(node) {
                    const exports = [];

                    node.body.forEach((statement) => {
                        if (statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration") {
                            exports.push(statement);
                        }
                    });

                    if (exports.length < 2) return;

                    for (let i = 0; i < exports.length - 1; i += 1) {
                        const currentExport = exports[i];
                        const nextExport = exports[i + 1];
                        const currentEndLine = currentExport.loc.end.line;
                        const nextStartLine = nextExport.loc.start.line;

                        if (nextStartLine - currentEndLine < 2) {
                            context.report({
                                fix(fixer) {
                                    return fixer.replaceTextRange(
                                        [currentExport.range[1], nextExport.range[0]],
                                        "\n\n",
                                    );
                                },
                                message: "Require blank line between exports.",
                                node: nextExport,
                            });
                        }
                    }
                },
            };
        }

        // For index files: enforce style and no blank lines

        return {
            Program(node) {
                const imports = [];
                const shorthandExports = [];
                const standaloneExports = [];
                const importSourceMap = new Map();

                // Collect all imports and exports
                node.body.forEach((statement) => {
                    if (statement.type === "ImportDeclaration" && statement.source) {
                        imports.push(statement);

                        // Map imported names to their source
                        statement.specifiers.forEach((spec) => {
                            if (spec.local && spec.local.name) {
                                importSourceMap.set(spec.local.name, {
                                    source: statement.source.value,
                                    statement,
                                });
                            }
                        });
                    }

                    if (statement.type === "ExportNamedDeclaration") {
                        if (statement.source) {
                            // Shorthand: export { a } from "./file"
                            shorthandExports.push(statement);
                        } else if (statement.specifiers && statement.specifiers.length > 0 && !statement.declaration) {
                            // Standalone: export { a }
                            standaloneExports.push(statement);
                        }
                    }
                });

                // Skip if no exports to check
                if (shorthandExports.length === 0 && standaloneExports.length === 0) return;

                // Check for mixed styles
                const hasShorthand = shorthandExports.length > 0;
                const hasImportExport = standaloneExports.length > 0 && imports.length > 0;

                if (hasShorthand && hasImportExport) {
                    context.report({
                        message: `Mixed export styles detected. Use consistent "${preferredStyle}" style throughout the index file.`,
                        node,
                    });

                    return;
                }

                if (preferredStyle === "shorthand") {
                    // Check if using import-then-export pattern when shorthand is preferred
                    if (standaloneExports.length > 0 && imports.length > 0) {
                        // Collect all specifiers to convert
                        const allSpecifiersToConvert = [];

                        standaloneExports.forEach((exportStmt) => {
                            exportStmt.specifiers.forEach((spec) => {
                                const exportedName = spec.local ? spec.local.name : spec.exported.name;
                                const importInfo = importSourceMap.get(exportedName);

                                if (importInfo) {
                                    allSpecifiersToConvert.push({
                                        exportStmt,
                                        exportedName,
                                        importInfo,
                                        localName: spec.local ? spec.local.name : exportedName,
                                        spec,
                                    });
                                }
                            });
                        });

                        if (allSpecifiersToConvert.length > 0) {
                            context.report({
                                fix(fixer) {
                                    const fixes = [];

                                    // Group specifiers by source
                                    const bySource = new Map();

                                    allSpecifiersToConvert.forEach(({ exportedName, importInfo, localName }) => {
                                        const source = importInfo.source;

                                        if (!bySource.has(source)) {
                                            bySource.set(source, []);
                                        }

                                        if (exportedName === localName) {
                                            bySource.get(source).push(exportedName);
                                        } else {
                                            bySource.get(source).push(`${localName} as ${exportedName}`);
                                        }
                                    });

                                    // Create shorthand exports (no empty lines between them)
                                    const newExports = [];

                                    bySource.forEach((specifiers, source) => {
                                        newExports.push(`export { ${specifiers.join(", ")} } from "${source}";`);
                                    });

                                    // Remove all standalone exports
                                    standaloneExports.forEach((exportStmt) => {
                                        fixes.push(fixer.remove(exportStmt));
                                    });

                                    // Remove all imports
                                    imports.forEach((importStmt) => {
                                        fixes.push(fixer.remove(importStmt));
                                    });

                                    // Insert new shorthand exports at the beginning
                                    const firstStatement = node.body[0];

                                    if (firstStatement) {
                                        fixes.push(fixer.insertTextBefore(firstStatement, newExports.join("\n") + "\n"));
                                    }

                                    return fixes;
                                },
                                message: `Use shorthand export style: export { ... } from "source" instead of import then export.`,
                                node,
                            });
                        }
                    }

                    // Check for empty lines between shorthand exports
                    for (let i = 0; i < shorthandExports.length - 1; i += 1) {
                        const currentExport = shorthandExports[i];
                        const nextExport = shorthandExports[i + 1];
                        const currentEndLine = currentExport.loc.end.line;
                        const nextStartLine = nextExport.loc.start.line;

                        if (nextStartLine - currentEndLine > 1) {
                            context.report({
                                fix(fixer) {
                                    const textBetween = sourceCode.getText().slice(
                                        currentExport.range[1],
                                        nextExport.range[0],
                                    );

                                    // Replace multiple newlines with single newline
                                    return fixer.replaceTextRange(
                                        [currentExport.range[1], nextExport.range[0]],
                                        "\n",
                                    );
                                },
                                message: "No empty lines between shorthand exports in index files.",
                                node: nextExport,
                            });
                        }
                    }
                } else if (preferredStyle === "import-export") {
                    // Check if using shorthand when import-export is preferred
                    if (shorthandExports.length > 0) {
                        // Convert all shorthand exports to import-then-export with single export statement
                        context.report({
                            fix(fixer) {
                                const fixes = [];
                                const allImports = [];
                                const allExportNames = [];

                                shorthandExports.forEach((exportStmt) => {
                                    const source = exportStmt.source.value;
                                    const importSpecifiers = [];

                                    exportStmt.specifiers.forEach((spec) => {
                                        const imported = spec.local ? spec.local.name : spec.exported.name;
                                        const exported = spec.exported.name;

                                        importSpecifiers.push(imported);
                                        allExportNames.push(exported);
                                    });

                                    allImports.push(`import { ${importSpecifiers.join(", ")} } from "${source}";`);

                                    // Remove the shorthand export
                                    fixes.push(fixer.remove(exportStmt));
                                });

                                // Sort export names alphabetically
                                allExportNames.sort((a, b) => a.localeCompare(b));

                                // Create single export statement with proper formatting
                                let exportStatement;

                                if (allExportNames.length <= 3) {
                                    exportStatement = `export { ${allExportNames.join(", ")} };`;
                                } else {
                                    exportStatement = `export {\n    ${allExportNames.join(",\n    ")},\n};`;
                                }

                                // Insert imports and export at the beginning
                                const firstStatement = node.body[0];

                                if (firstStatement) {
                                    const newContent = allImports.join("\n") + "\n\n" + exportStatement + "\n";

                                    fixes.push(fixer.insertTextBefore(firstStatement, newContent));
                                }

                                return fixes;
                            },
                            message: `Use import-then-export style with a single export statement.`,
                            node,
                        });
                    }

                    // Check for multiple standalone exports - should be combined into one
                    if (standaloneExports.length > 1) {
                        context.report({
                            fix(fixer) {
                                const fixes = [];
                                const allExportNames = [];

                                standaloneExports.forEach((exportStmt) => {
                                    exportStmt.specifiers.forEach((spec) => {
                                        const exported = spec.exported.name;

                                        allExportNames.push(exported);
                                    });

                                    // Remove all but the last export
                                    fixes.push(fixer.remove(exportStmt));
                                });

                                // Sort export names alphabetically
                                allExportNames.sort((a, b) => a.localeCompare(b));

                                // Create single export statement
                                let exportStatement;

                                if (allExportNames.length <= 3) {
                                    exportStatement = `export { ${allExportNames.join(", ")} };`;
                                } else {
                                    exportStatement = `export {\n    ${allExportNames.join(",\n    ")},\n};`;
                                }

                                // Find last import to insert after
                                const lastImport = imports[imports.length - 1];

                                if (lastImport) {
                                    fixes.push(fixer.insertTextAfter(lastImport, "\n\n" + exportStatement));
                                }

                                return fixes;
                            },
                            message: `Combine multiple export statements into a single export statement.`,
                            node,
                        });
                    }

                    // Check for empty lines between imports
                    for (let i = 0; i < imports.length - 1; i += 1) {
                        const currentImport = imports[i];
                        const nextImport = imports[i + 1];
                        const currentEndLine = currentImport.loc.end.line;
                        const nextStartLine = nextImport.loc.start.line;

                        if (nextStartLine - currentEndLine > 1) {
                            context.report({
                                fix(fixer) {
                                    return fixer.replaceTextRange(
                                        [currentImport.range[1], nextImport.range[0]],
                                        "\n",
                                    );
                                },
                                message: "No empty lines between imports in index files.",
                                node: nextImport,
                            });
                        }
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce export formatting: blank lines in regular files, no blank lines in index files with consistent style: shorthand (default) or import-export" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    style: {
                        enum: ["shorthand", "import-export"],
                        type: "string",
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
 * Rule: JSX Children On New Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When a JSX element has multiple children, each child should
 *   be on its own line with proper indentation.
 *
 * ✓ Good:
 *   <Container>
 *       <Header />
 *       <Content />
 *       <Footer />
 *   </Container>
 *
 * ✗ Bad:
 *   <Container><Header /><Content />
 *       <Footer /></Container>
 */
const jsxChildrenOnNewLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if expression is simple (identifier, literal, or simple member expression)
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return true;

            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;
            if (expr.type === "MemberExpression") {
                return expr.object.type === "Identifier" && expr.property.type === "Identifier";
            }

            return false;
        };

        // Check if child is simple (text or simple expression like {variable})
        const isSimpleChildHandler = (child) => {
            if (child.type === "JSXText") return true;
            if (child.type === "JSXExpressionContainer") {
                return isSimpleExpressionHandler(child.expression);
            }

            return false;
        };

        const checkJSXChildrenHandler = (node, openingTag, closingTag) => {
            const { children } = node;

            // Skip self-closing elements
            if (!closingTag) return;

            // Filter out whitespace-only text children
            const significantChildren = children.filter((child) => {
                if (child.type === "JSXText") {
                    return child.value.trim() !== "";
                }

                return true;
            });

            if (significantChildren.length === 0) return;

            // Allow elements that are entirely on a single line with only simple children (text or {variable})
            const elementIsOnSingleLine = openingTag.loc.start.line === closingTag.loc.end.line;
            const hasOnlySimpleChildren = significantChildren.every(isSimpleChildHandler);

            if (elementIsOnSingleLine && hasOnlySimpleChildren) {
                // Entire element on one line with only simple children - OK
                return;
            }

            // Allow simple inline elements with single simple child
            const hasSingleSimpleChild = significantChildren.length === 1 && isSimpleChildHandler(significantChildren[0]);

            if (hasSingleSimpleChild) {
                // This is a simple inline element - don't require new lines
                return;
            }

            const firstChild = significantChildren[0];
            const lastChild = significantChildren[significantChildren.length - 1];
            const childIndent = " ".repeat(openingTag.loc.start.column + 4);
            const closingIndent = " ".repeat(openingTag.loc.start.column);

            // Check if first child is on same line as opening tag
            if (openingTag.loc.end.line === firstChild.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openingTag.range[1], firstChild.range[0]],
                        "\n" + childIndent,
                    ),
                    message: "JSX child should be on its own line",
                    node: firstChild,
                });
            } else if (openingTag.loc.end.line < firstChild.loc.start.line - 1) {
                // Check for extra blank lines after opening tag (more than 1 newline)
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openingTag.range[1], firstChild.range[0]],
                        "\n" + childIndent,
                    ),
                    message: "Remove blank lines after opening tag",
                    node: firstChild,
                });
            }

            // Check if closing tag is on same line as last child
            // For JSXText, check if the actual content (trimmed) ends on same line
            if (closingTag.loc.start.line === lastChild.loc.end.line) {
                // If last child is text with only whitespace at the end, check the content line
                if (lastChild.type === "JSXText") {
                    const textContent = lastChild.value;
                    const trimmedEnd = textContent.trimEnd();

                    // If there's a newline in the trimmed-off part, closing tag is already on own line
                    if (textContent.slice(trimmedEnd.length).includes("\n")) {
                        return;
                    }
                }

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastChild.range[1], closingTag.range[0]],
                        "\n" + closingIndent,
                    ),
                    message: "Closing tag should be on its own line",
                    node: closingTag,
                });
            }
        };

        const checkJSXElementHandler = (node) => {
            checkJSXChildrenHandler(node, node.openingElement, node.closingElement);
        };

        const checkJSXFragmentHandler = (node) => {
            checkJSXChildrenHandler(node, node.openingFragment, node.closingFragment);
        };

        return {
            JSXElement: checkJSXElementHandler,
            JSXFragment: checkJSXFragmentHandler,
        };
    },
    meta: {
        docs: { description: "Enforce JSX children on separate lines from parent tags" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Closing Bracket Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No space before > or /> in JSX tags. The closing bracket
 *   should be directly after the last attribute or tag name.
 *
 * ✓ Good:
 *   <Button />
 *   <Button className="primary">
 *
 * ✗ Bad:
 *   <Button / >
 *   <Button className="primary" >
 */
const jsxClosingBracketSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkOpeningElementHandler = (node) => {
            const lastToken = sourceCode.getLastToken(node);

            if (!lastToken) return;

            // Check for > or />
            if (lastToken.value !== ">" && lastToken.value !== "/>") return;

            const tokenBefore = sourceCode.getTokenBefore(lastToken);

            if (!tokenBefore) return;

            // Check if there's whitespace between the last attribute/name and >
            if (tokenBefore.loc.end.line === lastToken.loc.start.line) {
                // Same line - check for space
                if (lastToken.range[0] - tokenBefore.range[1] > 0) {
                    const textBetween = sourceCode.text.slice(
                        tokenBefore.range[1],
                        lastToken.range[0],
                    );

                    if (/^\s+$/.test(textBetween)) {
                        context.report({
                            fix: (fixer) => fixer.removeRange([tokenBefore.range[1], lastToken.range[0]]),
                            message: `No space allowed before '${lastToken.value}' in JSX tag`,
                            node: lastToken,
                        });
                    }
                }
            }
        };

        return {
            JSXOpeningElement: checkOpeningElementHandler,
            JSXClosingElement: checkOpeningElementHandler,
        };
    },
    meta: {
        docs: { description: "No space before > or /> in JSX tags" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Element Child New Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX element children (nested JSX elements) must be on their
 *   own line, not on the same line as the opening tag.
 *
 * ✓ Good:
 *   <Button>
 *       <Icon />
 *   </Button>
 *
 * ✗ Bad:
 *   <Button><Icon /></Button>
 */
const jsxElementChildNewLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if expression is simple (identifier, literal, or simple member expression)
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return true;

            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;
            if (expr.type === "MemberExpression") {
                return expr.object.type === "Identifier" && expr.property.type === "Identifier";
            }

            return false;
        };

        // Check if child is a complex JSX child (not simple text or expression)
        const isComplexJsxChildHandler = (child) => {
            if (child.type === "JSXElement" || child.type === "JSXFragment") {
                return true;
            }

            // JSXExpressionContainer with complex expression (not simple variable)
            if (child.type === "JSXExpressionContainer") {
                return !isSimpleExpressionHandler(child.expression);
            }

            return false;
        };

        return {
            JSXElement(node) {
                const openingTag = node.openingElement;
                const closingTag = node.closingElement;

                // Skip self-closing elements
                if (!closingTag) return;

                const { children } = node;

                // Find complex JSX element children (not text, not simple expressions)
                const jsxChildren = children.filter(isComplexJsxChildHandler);

                if (jsxChildren.length === 0) return;

                // Get the indent for children
                const childIndent = " ".repeat(openingTag.loc.start.column + 4);
                const closingIndent = " ".repeat(openingTag.loc.start.column);

                jsxChildren.forEach((child) => {
                    // Check if JSX child is on same line as opening tag
                    if (openingTag.loc.end.line === child.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openingTag.range[1], child.range[0]],
                                "\n" + childIndent,
                            ),
                            message: "JSX element child should be on its own line",
                            node: child,
                        });
                    }
                });

                // Check if closing tag is on same line as last JSX child
                const lastJsxChild = jsxChildren[jsxChildren.length - 1];

                if (lastJsxChild && closingTag.loc.start.line === lastJsxChild.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastJsxChild.range[1], closingTag.range[0]],
                            "\n" + closingIndent,
                        ),
                        message: "Closing tag should be on its own line after JSX children",
                        node: closingTag,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "JSX children that are JSX elements must be on new lines" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Logical Expression Simplify
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simplify JSX logical expressions by removing unnecessary
 *   parentheses around conditions and JSX elements.
 *
 * ✓ Good:
 *   {condition && <Component />}
 *   {isVisible && <Modal />}
 *
 * ✗ Bad:
 *   {(condition) && (<Component />)}
 *   {(isVisible) && (<Modal />)}
 */
const jsxLogicalExpressionSimplify = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkLogicalExpressionHandler = (node) => {
            if (node.operator !== "&&" && node.operator !== "||") return;

            const {
                left,
                right,
            } = node;

            if (right.type !== "JSXElement" && right.type !== "JSXFragment") return;

            const leftText = sourceCode.getText(left);
            const rightText = sourceCode.getText(right);

            // Check if right side is single-line
            if (right.loc.start.line !== right.loc.end.line) return;

            // Check if currently multiline
            if (node.loc.start.line === node.loc.end.line) return;

            context.report({
                fix: (fixer) => fixer.replaceText(
                    node,
                    `${leftText} ${node.operator} ${rightText}`,
                ),
                message: "Simple logical expression with single-line JSX should be on one line",
                node,
            });
        };

        return { LogicalExpression: checkLogicalExpressionHandler };
    },
    meta: {
        docs: { description: "Simplify logical expressions in JSX when right side is single-line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Parentheses Position
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX return parentheses should be on the same line as the arrow
 *   or return keyword, not on a new line.
 *
 * ✓ Good:
 *   const Component = () => (
 *       <div>content</div>
 *   );
 *   return (
 *       <div>content</div>
 *   );
 *
 * ✗ Bad:
 *   const Component = () =>
 *       (
 *           <div>content</div>
 *       );
 *   return
 *       (
 *           <div>content</div>
 *       );
 */
const jsxParenthesesPosition = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkArrowFunctionHandler = (node) => {
            // Only check arrow functions that return JSX wrapped in parentheses
            if (node.body.type !== "JSXElement" && node.body.type !== "JSXFragment") return;

            const jsxElement = node.body;
            const arrowToken = sourceCode.getTokenBefore(node.body, (t) => t.value === "=>");
            const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

            // Check if there's a parenthesis after arrow
            if (!tokenAfterArrow || tokenAfterArrow.value !== "(") return;

            const openParen = tokenAfterArrow;

            // Check if arrow and ( are on same line
            if (arrowToken.loc.end.line !== openParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [arrowToken.range[1], openParen.range[1]],
                        " (",
                    ),
                    message: "Opening parenthesis should be on the same line as arrow",
                    node: openParen,
                });
            }

            // Check if JSX starts on same line as ( (should be on new line)
            if (openParen.loc.end.line === jsxElement.loc.start.line) {
                const jsxIndent = " ".repeat(openParen.loc.start.column + 4);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "JSX should start on a new line after opening parenthesis",
                    node: jsxElement,
                });
            } else if (jsxElement.loc.start.line - openParen.loc.end.line > 1) {
                // No empty lines after (
                const jsxIndent = " ".repeat(jsxElement.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "No empty line after opening parenthesis",
                    node: jsxElement,
                });
            }

            const closeParen = sourceCode.getTokenAfter(jsxElement);

            if (closeParen && closeParen.value === ")") {
                // No empty lines before )
                if (closeParen.loc.start.line - jsxElement.loc.end.line > 1) {
                    const closeIndent = " ".repeat(closeParen.loc.start.column);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [jsxElement.range[1], closeParen.range[0]],
                            "\n" + closeIndent,
                        ),
                        message: "No empty line before closing parenthesis",
                        node: closeParen,
                    });
                }

                // Check if )} are together
                const closeBrace = sourceCode.getTokenAfter(closeParen);

                if (closeBrace && closeBrace.value === "}") {
                    const textBetween = sourceCode.text.slice(
                        closeParen.range[1],
                        closeBrace.range[0],
                    );

                    if (textBetween.includes("\n") || textBetween.includes(" ")) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeParen.range[1], closeBrace.range[0]],
                                "",
                            ),
                            message: "Closing parenthesis and brace should be together",
                            node: closeBrace,
                        });
                    }
                }
            }
        };

        const checkPropertyHandler = (node) => {
            if (!node.value) return;
            if (node.value.type !== "JSXElement" && node.value.type !== "JSXFragment") return;

            // Check if value is wrapped in parentheses
            const colonToken = sourceCode.getTokenAfter(node.key, (t) => t.value === ":");
            const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

            if (!tokenAfterColon || tokenAfterColon.value !== "(") return;

            const openParen = tokenAfterColon;
            const jsxElement = node.value;

            // Check if colon and ( are on same line
            if (colonToken.loc.end.line !== openParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [colonToken.range[1], openParen.range[1]],
                        " (",
                    ),
                    message: "Opening parenthesis should be on the same line as colon with a space",
                    node: openParen,
                });
            }

            // Check if JSX starts on same line as (
            if (openParen.loc.end.line === jsxElement.loc.start.line) {
                const jsxIndent = " ".repeat(node.key.loc.start.column + 4);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "JSX should start on a new line after opening parenthesis",
                    node: jsxElement,
                });
            } else if (jsxElement.loc.start.line - openParen.loc.end.line > 1) {
                const jsxIndent = " ".repeat(jsxElement.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], jsxElement.range[0]],
                        "\n" + jsxIndent,
                    ),
                    message: "No empty line after opening parenthesis",
                    node: jsxElement,
                });
            }

            const closeParen = sourceCode.getTokenAfter(jsxElement);

            if (closeParen && closeParen.value === ")") {
                if (closeParen.loc.start.line - jsxElement.loc.end.line > 1) {
                    const closeIndent = " ".repeat(closeParen.loc.start.column);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [jsxElement.range[1], closeParen.range[0]],
                            "\n" + closeIndent,
                        ),
                        message: "No empty line before closing parenthesis",
                        node: closeParen,
                    });
                }
            }
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            Property: checkPropertyHandler,
        };
    },
    meta: {
        docs: { description: "Enforce opening parenthesis position for JSX in arrow functions and object properties" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Prop Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce camelCase naming for JSX props. Allows PascalCase for
 *   component reference props, and kebab-case for data-* and aria-*.
 *
 * ✓ Good:
 *   <Button onClick={handler} />
 *   <Input data-testid="input" />
 *   <Modal ContentComponent={Panel} />
 *
 * ✗ Bad:
 *   <Button on_click={handler} />
 *   <Input test_id="input" />
 */
const jsxPropNamingConvention = {
    create(context) {
        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        // Props that can be PascalCase because they reference components
        const componentPropNames = [
            "Icon",
            "Component",
            "FormComponent",
            "Layout",
            "Wrapper",
            "Container",
            "Provider",
            "Element",
            "Trigger",
            "Content",
            "Header",
            "Footer",
            "Body",
            "Title",
            "Overlay",
            "Portal",
            "Root",
            "Item",
            "Label",
            "Input",
            "Button",
            "Action",
            "Slot",
        ];

        return {
            JSXAttribute(node) {
                // Skip spread attributes (handled as JSXSpreadAttribute, not JSXAttribute)
                if (!node.name) return;

                const propName = node.name.type === "JSXIdentifier"
                    ? node.name.name
                    : node.name.name?.name;

                if (!propName) return;

                // Allow data-* and aria-* attributes (kebab-case by HTML convention)
                if (propName.startsWith("data-") || propName.startsWith("aria-")) return;

                // Allow component reference props (PascalCase)
                if (componentPropNames.includes(propName)) return;

                // Allow props ending with common component suffixes
                const componentSuffixes = ["Icon", "Component", "Element", "Wrapper", "Container", "Layout", "Provider"];

                if (componentSuffixes.some((suffix) => propName.endsWith(suffix) && propName !== suffix)) {
                    return;
                }

                // Check if prop name is camelCase
                if (!camelCaseRegex.test(propName)) {
                    context.report({
                        message: `JSX prop "${propName}" should be camelCase`,
                        node: node.name,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce camelCase naming for JSX props, with exceptions for component references" },
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Simple Element On One Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simple JSX elements with only a single text or expression
 *   child should be collapsed onto a single line.
 *
 * ✓ Good:
 *   <Button>{buttonLinkText}</Button>
 *   <Title>Hello</Title>
 *
 * ✗ Bad:
 *   <Button>
 *       {buttonLinkText}
 *   </Button>
 */
const jsxSimpleElementOneLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if an expression is simple (just an identifier or literal)
        const isSimpleExpressionHandler = (node) => {
            if (!node) return false;

            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                // Allow simple member expressions like obj.prop
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            return false;
        };

        // Check if child is simple (text or simple expression)
        const isSimpleChildHandler = (child) => {
            if (child.type === "JSXText") {
                return child.value.trim().length > 0;
            }

            if (child.type === "JSXExpressionContainer") {
                return isSimpleExpressionHandler(child.expression);
            }

            return false;
        };

        return {
            JSXElement(node) {
                const openingTag = node.openingElement;
                const closingTag = node.closingElement;

                // Skip self-closing elements
                if (!closingTag) return;

                // Check if element is multiline
                if (openingTag.loc.end.line === closingTag.loc.start.line) return;

                const { children } = node;

                // Filter out whitespace-only text children
                const significantChildren = children.filter((child) => {
                    if (child.type === "JSXText") {
                        return child.value.trim() !== "";
                    }

                    return true;
                });

                // Must have exactly one simple child
                if (significantChildren.length !== 1) return;

                const child = significantChildren[0];

                if (!isSimpleChildHandler(child)) return;

                // Check if opening tag itself is simple (single line, not too many attributes)
                if (openingTag.loc.start.line !== openingTag.loc.end.line) return;

                // Get the text content
                const openingText = sourceCode.getText(openingTag);
                const childText = child.type === "JSXText" ? child.value.trim() : sourceCode.getText(child);
                const closingText = sourceCode.getText(closingTag);

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node,
                        `${openingText}${childText}${closingText}`,
                    ),
                    message: "Simple JSX element with single text/expression child should be on one line",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Simple JSX elements with only text/expression children should be on one line" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX String Value Trim
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX string attribute values should not have leading or
 *   trailing whitespace inside the quotes.
 *
 * ✓ Good:
 *   className="button"
 *   title="Hello World"
 *
 * ✗ Bad:
 *   className=" button "
 *   title=" Hello World "
 */
const jsxStringValueTrim = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkJSXAttributeHandler = (node) => {
            if (!node.value || node.value.type !== "Literal" || typeof node.value.value !== "string") return;

            const value = node.value.value;
            const trimmed = value.trim();

            if (value !== trimmed) {
                const raw = sourceCode.getText(node.value);
                const quote = raw[0];

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node.value,
                        `${quote}${trimmed}${quote}`,
                    ),
                    message: "JSX string value should not have leading or trailing whitespace",
                    node: node.value,
                });
            }
        };

        return { JSXAttribute: checkJSXAttributeHandler };
    },
    meta: {
        docs: { description: "Disallow leading/trailing whitespace in JSX string values" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: JSX Ternary Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Format ternary expressions in JSX with proper structure.
 *   Simple branches stay on one line, complex branches get
 *   parentheses with proper indentation.
 *
 * ✓ Good:
 *   {condition ? <Simple /> : <Other />}
 *   {condition ? <Simple /> : (
 *       <Complex>
 *           <Child />
 *       </Complex>
 *   )}
 *
 * ✗ Bad:
 *   {condition
 *       ? <Simple />
 *       : <Other />}
 */
const jsxTernaryFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Helper to get indentation of a line
        const getIndentHandler = (node) => {
            const line = sourceCode.lines[node.loc.start.line - 1];
            const match = line.match(/^(\s*)/);

            return match ? match[1] : "";
        };

        // Check if JSX element is simple (single line)
        const isSimpleJsxHandler = (jsxNode) => {
            if (jsxNode.type !== "JSXElement" && jsxNode.type !== "JSXFragment") return false;

            return jsxNode.loc.start.line === jsxNode.loc.end.line;
        };

        // Check if a node is wrapped in unnecessary parentheses
        const hasUnnecessaryParensHandler = (jsxNode) => {
            const tokenBefore = sourceCode.getTokenBefore(jsxNode);
            const tokenAfter = sourceCode.getTokenAfter(jsxNode);

            return tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        return {
            ConditionalExpression(node) {
                // Only handle ternaries in JSX context
                const parent = node.parent;

                if (!parent || parent.type !== "JSXExpressionContainer") return;

                const {
                    alternate,
                    consequent,
                } = node;

                // At least one branch should be JSX
                const isConsequentJsx = consequent.type === "JSXElement" || consequent.type === "JSXFragment";
                const isAlternateJsx = alternate.type === "JSXElement" || alternate.type === "JSXFragment";

                if (!isConsequentJsx && !isAlternateJsx) return;

                const consequentSimple = isSimpleJsxHandler(consequent);
                const alternateSimple = isSimpleJsxHandler(alternate);

                const baseIndent = getIndentHandler(node);
                const contentIndent = baseIndent + "    ";

                // Check 0: Condition should be on same line as opening {
                const openBrace = sourceCode.getFirstToken(parent);

                if (openBrace && openBrace.value === "{") {
                    if (openBrace.loc.end.line !== node.test.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], node.test.range[0]],
                                "",
                            ),
                            message: "Ternary condition should be on same line as opening '{'",
                            node: node.test,
                        });
                    }
                }

                // Get the question mark token
                const questionToken = sourceCode.getTokenAfter(
                    node.test,
                    (token) => token.value === "?",
                );

                if (!questionToken) return;

                // Get the colon token
                const colonToken = sourceCode.getTokenAfter(
                    consequent,
                    (token) => token.value === ":",
                );

                if (!colonToken) return;

                // Get closing brace of JSXExpressionContainer
                const closeBrace = sourceCode.getLastToken(parent);

                // Check for unnecessary parentheses around simple JSX
                if (consequentSimple && hasUnnecessaryParensHandler(consequent)) {
                    const openParen = sourceCode.getTokenBefore(consequent);
                    const closeParen = sourceCode.getTokenAfter(consequent);

                    context.report({
                        fix: (fixer) => [
                            fixer.remove(openParen),
                            fixer.remove(closeParen),
                        ],
                        message: "Unnecessary parentheses around simple JSX element",
                        node: consequent,
                    });
                }

                if (alternateSimple && hasUnnecessaryParensHandler(alternate)) {
                    const openParen = sourceCode.getTokenBefore(alternate);
                    const closeParen = sourceCode.getTokenAfter(alternate);

                    context.report({
                        fix: (fixer) => [
                            fixer.remove(openParen),
                            fixer.remove(closeParen),
                        ],
                        message: "Unnecessary parentheses around simple JSX element",
                        node: alternate,
                    });
                }

                // CASE 1: Both branches are simple - entire ternary on one line
                if (consequentSimple && alternateSimple) {
                    // Check if entire expression is on one line
                    if (node.loc.start.line !== node.loc.end.line) {
                        const testText = sourceCode.getText(node.test);
                        const consequentText = sourceCode.getText(consequent);
                        const alternateText = sourceCode.getText(alternate);

                        context.report({
                            fix: (fixer) => fixer.replaceText(
                                node,
                                `${testText} ? ${consequentText} : ${alternateText}`,
                            ),
                            message: "Simple ternary with single-line JSX should be on one line",
                            node,
                        });
                    }

                    return;
                }

                // CASE 1.5: Consequent is simple JSX, alternate is non-JSX (e.g., function call)
                // Format: {condition ? <Simple /> : functionCall({
                //     props,
                // })}
                if (consequentSimple && isConsequentJsx && !isAlternateJsx) {
                    // Condition, ?, simple JSX, and : should all be on the same line
                    // Then alternate starts on the same line after :

                    // ? should be on same line as condition
                    if (node.test.loc.end.line !== questionToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [node.test.range[1], questionToken.range[0]],
                                " ",
                            ),
                            message: "'?' should be on same line as condition",
                            node: questionToken,
                        });
                    }

                    // Simple JSX should be on same line as ?
                    if (questionToken.loc.end.line !== consequent.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [questionToken.range[1], consequent.range[0]],
                                " ",
                            ),
                            message: "Simple JSX should be on same line as '?'",
                            node: consequent,
                        });
                    }

                    // : should be on same line as simple JSX
                    if (consequent.loc.end.line !== colonToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [consequent.range[1], colonToken.range[0]],
                                " ",
                            ),
                            message: "':' should be on same line as simple JSX",
                            node: colonToken,
                        });
                    }

                    // Alternate (function call) should start on same line as :
                    if (colonToken.loc.end.line !== alternate.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], alternate.range[0]],
                                " ",
                            ),
                            message: "Expression should start on same line as ':'",
                            node: alternate,
                        });
                    }

                    return;
                }

                // CASE 2: Consequent is simple, alternate is complex JSX
                // Format: {condition ? <Simple /> : (
                //     <Complex />
                // )}
                // Skip if alternate is not JSX (e.g., function call)
                if (consequentSimple && !alternateSimple && isAlternateJsx) {
                    // ? should be on same line as condition
                    if (node.test.loc.end.line !== questionToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [node.test.range[1], questionToken.range[0]],
                                " ",
                            ),
                            message: "'?' should be on same line as condition",
                            node: questionToken,
                        });
                    }

                    // Simple consequent should be on same line as ?
                    if (questionToken.loc.end.line !== consequent.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [questionToken.range[1], consequent.range[0]],
                                " ",
                            ),
                            message: "Simple JSX should be on same line as '?'",
                            node: consequent,
                        });
                    }

                    // : should be on same line as simple consequent
                    if (consequent.loc.end.line !== colonToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [consequent.range[1], colonToken.range[0]],
                                " ",
                            ),
                            message: "':' should be on same line as simple JSX",
                            node: colonToken,
                        });
                    }

                    // Check ( after :
                    const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                    if (tokenAfterColon && tokenAfterColon.value === "(") {
                        // ( should be on same line as :
                        if (colonToken.loc.end.line !== tokenAfterColon.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [colonToken.range[1], tokenAfterColon.range[0]],
                                    " ",
                                ),
                                message: "'(' should be on same line as ':'",
                                node: tokenAfterColon,
                            });
                        }

                        // Complex JSX should start on new line after (
                        const alternateStart = sourceCode.getTokenAfter(tokenAfterColon);

                        if (alternateStart && tokenAfterColon.loc.end.line === alternateStart.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterColon.range[1], alternateStart.range[0]],
                                    "\n" + contentIndent,
                                ),
                                message: "Complex JSX should start on new line after '('",
                                node: alternate,
                            });
                        }
                    }

                    // Final ) should be on its own line, then )} together
                    const lastToken = sourceCode.getLastToken(node);

                    if (lastToken && lastToken.value === ")") {
                        const tokenBeforeLast = sourceCode.getTokenBefore(lastToken);

                        if (tokenBeforeLast && tokenBeforeLast.value !== "(" && tokenBeforeLast.loc.end.line === lastToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenBeforeLast.range[1], lastToken.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "Closing ')' should be on new line",
                                node: lastToken,
                            });
                        }

                        // ) and } should be on same line
                        if (closeBrace && closeBrace.value === "}" && lastToken.loc.end.line !== closeBrace.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastToken.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing ')}' should be together",
                                node: closeBrace,
                            });
                        }
                    }

                    return;
                }

                // CASE 3: Consequent is complex JSX, alternate is simple
                // Format: {condition ? (
                //     <Complex />
                // ) : <Simple />}
                // Skip if consequent is not JSX (e.g., function call)
                if (!consequentSimple && alternateSimple && isConsequentJsx) {
                    const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                    // ? ( should be on same line
                    if (tokenAfterQuestion && tokenAfterQuestion.value === "(") {
                        if (node.test.loc.end.line !== questionToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [node.test.range[1], questionToken.range[0]],
                                    " ",
                                ),
                                message: "'?' should be on same line as condition",
                                node: questionToken,
                            });
                        }

                        if (questionToken.loc.end.line !== tokenAfterQuestion.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [questionToken.range[1], tokenAfterQuestion.range[0]],
                                    " ",
                                ),
                                message: "'(' should be on same line as '?'",
                                node: tokenAfterQuestion,
                            });
                        }

                        // JSX after ( should start on new line
                        const jsxStart = sourceCode.getTokenAfter(tokenAfterQuestion);

                        if (jsxStart && tokenAfterQuestion.loc.end.line === jsxStart.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                    "\n" + contentIndent,
                                ),
                                message: "Complex JSX should start on new line after '('",
                                node: consequent,
                            });
                        }
                    }

                    // ) before : should be on new line
                    const tokenBeforeColon = sourceCode.getTokenBefore(colonToken);

                    if (tokenBeforeColon && tokenBeforeColon.value === ")") {
                        const jsxEnd = sourceCode.getTokenBefore(tokenBeforeColon);

                        if (jsxEnd && jsxEnd.loc.end.line === tokenBeforeColon.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "Closing ')' should be on new line after complex JSX",
                                node: tokenBeforeColon,
                            });
                        }

                        // ) : should be on same line
                        if (tokenBeforeColon.loc.end.line !== colonToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenBeforeColon.range[1], colonToken.range[0]],
                                    " ",
                                ),
                                message: "':' should be on same line as ')'",
                                node: colonToken,
                            });
                        }
                    }

                    // Simple alternate should be on same line as :
                    if (colonToken.loc.end.line !== alternate.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], alternate.range[0]],
                                " ",
                            ),
                            message: "Simple JSX should be on same line as ':'",
                            node: alternate,
                        });
                    }

                    // } should be on same line as simple alternate
                    if (closeBrace && closeBrace.value === "}" && alternate.loc.end.line !== closeBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [alternate.range[1], closeBrace.range[0]],
                                "",
                            ),
                            message: "'}' should be on same line as simple JSX",
                            node: closeBrace,
                        });
                    }

                    return;
                }

                // CASE 4: Both branches are complex JSX
                // Format: {condition ? (
                //     <Complex />
                // ) : (
                //     <Other />
                // )}
                // Skip if not BOTH branches are JSX (e.g., one is a function call)
                if (!isConsequentJsx || !isAlternateJsx) return;

                const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                if (tokenAfterQuestion && tokenAfterQuestion.value === "(") {
                    // ? should be on same line as test
                    if (node.test.loc.end.line !== questionToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [node.test.range[1], questionToken.range[0]],
                                " ",
                            ),
                            message: "'?' should be on same line as condition",
                            node: questionToken,
                        });
                    }

                    // ( should be on same line as ?
                    if (questionToken.loc.end.line !== tokenAfterQuestion.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [questionToken.range[1], tokenAfterQuestion.range[0]],
                                " ",
                            ),
                            message: "'(' should be on same line as '?'",
                            node: tokenAfterQuestion,
                        });
                    }

                    // JSX after ( should start on new line
                    const jsxStart = sourceCode.getTokenAfter(tokenAfterQuestion);

                    if (jsxStart && tokenAfterQuestion.loc.end.line === jsxStart.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "Complex JSX should start on new line after '('",
                            node: consequent,
                        });
                    } else if (jsxStart && jsxStart.loc.start.line - tokenAfterQuestion.loc.end.line > 1) {
                        // Check for empty lines after (
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterQuestion.range[1], jsxStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "No empty lines after '(' in ternary",
                            node: jsxStart,
                        });
                    }
                }

                // ) : ( pattern
                const tokenBeforeColon = sourceCode.getTokenBefore(colonToken);
                const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                if (tokenBeforeColon && tokenBeforeColon.value === ")") {
                    // ) should be on new line from JSX end
                    const jsxEnd = sourceCode.getTokenBefore(tokenBeforeColon);

                    if (jsxEnd && jsxEnd.loc.end.line === tokenBeforeColon.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing ')' should be on new line after complex JSX",
                            node: tokenBeforeColon,
                        });
                    } else if (jsxEnd && tokenBeforeColon.loc.start.line - jsxEnd.loc.end.line > 1) {
                        // Check for empty lines before )
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [jsxEnd.range[1], tokenBeforeColon.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "No empty lines before ')' in ternary",
                            node: tokenBeforeColon,
                        });
                    }

                    // ) : should be on same line
                    if (tokenBeforeColon.loc.end.line !== colonToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeColon.range[1], colonToken.range[0]],
                                " ",
                            ),
                            message: "':' should be on same line as ')'",
                            node: colonToken,
                        });
                    }
                }

                if (tokenAfterColon && tokenAfterColon.value === "(") {
                    // ( should be on same line as :
                    if (colonToken.loc.end.line !== tokenAfterColon.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], tokenAfterColon.range[0]],
                                " ",
                            ),
                            message: "'(' should be on same line as ':'",
                            node: tokenAfterColon,
                        });
                    }

                    // JSX after ( should start on new line
                    const alternateStart = sourceCode.getTokenAfter(tokenAfterColon);

                    if (alternateStart && tokenAfterColon.loc.end.line === alternateStart.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterColon.range[1], alternateStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "Complex JSX should start on new line after '('",
                            node: alternate,
                        });
                    } else if (alternateStart && alternateStart.loc.start.line - tokenAfterColon.loc.end.line > 1) {
                        // Check for empty lines after ( in alternate
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterColon.range[1], alternateStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "No empty lines after '(' in ternary",
                            node: alternateStart,
                        });
                    }
                }

                // Final ) should be on its own line
                const lastToken = sourceCode.getLastToken(node);

                if (lastToken && lastToken.value === ")") {
                    const tokenBeforeLast = sourceCode.getTokenBefore(lastToken);

                    if (tokenBeforeLast && tokenBeforeLast.value !== "(" && tokenBeforeLast.loc.end.line === lastToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeLast.range[1], lastToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing ')' should be on new line",
                            node: lastToken,
                        });
                    } else if (tokenBeforeLast && tokenBeforeLast.value !== "(" && lastToken.loc.start.line - tokenBeforeLast.loc.end.line > 1) {
                        // Check for empty lines before final )
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeLast.range[1], lastToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "No empty lines before ')' in ternary",
                            node: lastToken,
                        });
                    }

                    // ) and } should be on same line: )}
                    if (closeBrace && closeBrace.value === "}" && lastToken.loc.end.line !== closeBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastToken.range[1], closeBrace.range[0]],
                                "",
                            ),
                            message: "Closing ')}' should be together on same line",
                            node: closeBrace,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent formatting for JSX ternary expressions" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Member Expression Bracket Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   No spaces inside brackets in computed member expressions.
 *   The property name should touch both brackets.
 *
 * ✓ Good:
 *   arr[value]
 *   obj[key]
 *
 * ✗ Bad:
 *   arr[ value ]
 *   obj[ key ]
 */
const memberExpressionBracketSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            MemberExpression(node) {
                // Only check computed member expressions (bracket notation)
                if (!node.computed) return;

                const openBracket = sourceCode.getTokenBefore(node.property);
                const closeBracket = sourceCode.getTokenAfter(node.property);

                if (!openBracket || openBracket.value !== "[") return;
                if (!closeBracket || closeBracket.value !== "]") return;

                // Check for space after [
                const textAfterOpen = sourceCode.text.slice(openBracket.range[1], node.property.range[0]);

                if (textAfterOpen.includes(" ") || textAfterOpen.includes("\n")) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBracket.range[1], node.property.range[0]],
                            "",
                        ),
                        message: "No space after opening bracket in member expression",
                        node: openBracket,
                    });
                }

                // Check for space before ]
                const textBeforeClose = sourceCode.text.slice(node.property.range[1], closeBracket.range[0]);

                if (textBeforeClose.includes(" ") || textBeforeClose.includes("\n")) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [node.property.range[1], closeBracket.range[0]],
                            "",
                        ),
                        message: "No space before closing bracket in member expression",
                        node: closeBracket,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce no spaces inside brackets for member expressions" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Function Arguments Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce consistent formatting for function call arguments.
 *   When arguments exceed minArgs OR any argument is multiline,
 *   each argument should be on its own line with proper indentation.
 *
 * Options:
 *   - minArgs: Minimum arguments to enforce multiline (default: 2)
 *   - skipHooks: Skip React hooks (default: true)
 *   - skipSingleArg: Skip single arg patterns like objects, arrays, callbacks (default: true)
 *
 * ✓ Good:
 *   fn(a);
 *   fn(
 *       arg1,
 *       arg2,
 *   );
 *
 * ✗ Bad:
 *   fn(arg1, arg2);
 *   fn(arg1,
 *       arg2);
 */
const functionArgumentsFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const minArgs = options.minArgs !== undefined ? options.minArgs : 2;
        const skipHooks = options.skipHooks !== undefined ? options.skipHooks : true;
        const skipSingleArg = options.skipSingleArg !== undefined ? options.skipSingleArg : true;

        const reactHooks = [
            "useEffect",
            "useCallback",
            "useMemo",
            "useLayoutEffect",
            "useImperativeHandle",
            "useReducer",
            "useRef",
            "useState",
            "useContext",
            "useDebugValue",
            "useDeferredValue",
            "useTransition",
            "useId",
            "useSyncExternalStore",
            "useInsertionEffect",
        ];

        const isReactHookHandler = (node) => {
            if (node.callee.type === "Identifier") {
                return reactHooks.includes(node.callee.name);
            }

            return false;
        };

        const hasMultilineArgHandler = (args) => args.some((arg) => arg.loc.start.line !== arg.loc.end.line);

        const checkCallExpressionHandler = (node) => {
            // Skip React hooks if option enabled
            if (skipHooks && isReactHookHandler(node)) return;

            const args = node.arguments;

            if (args.length === 0) return;

            // Skip single argument patterns if option enabled
            if (skipSingleArg && args.length === 1) {
                if (args[0].type === "ObjectExpression") return;
                if (args[0].type === "ArrayExpression") return;
                if (args[0].type === "ArrowFunctionExpression") return;
                if (args[0].type === "FunctionExpression") return;
            }

            // Check if formatting should be enforced:
            // 1. Arguments count >= minArgs, OR
            // 2. Any argument is multiline
            const hasEnoughArgs = args.length >= minArgs;
            const hasMultilineArg = hasMultilineArgHandler(args);

            if (!hasEnoughArgs && !hasMultilineArg) return;

            const openParen = sourceCode.getTokenAfter(
                node.callee,
                (token) => token.value === "(",
            );
            const closeParen = sourceCode.getLastToken(node);

            if (!openParen || !closeParen || closeParen.value !== ")") return;

            const firstArg = args[0];
            const lastArg = args[args.length - 1];

            // Calculate indent
            const callLine = sourceCode.lines[node.loc.start.line - 1];
            const baseIndent = callLine.match(/^\s*/)[0];
            const argIndent = baseIndent + "    ";

            // First arg should be on new line after opening paren
            if (openParen.loc.end.line === firstArg.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], firstArg.range[0]],
                        "\n" + argIndent,
                    ),
                    message: "First argument should be on its own line",
                    node: firstArg,
                });
            }

            // Each arg should be on its own line
            for (let i = 0; i < args.length - 1; i += 1) {
                const current = args[i];
                const next = args[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(
                        current,
                        (token) => token.value === ",",
                    );

                    if (commaToken) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [commaToken.range[1], next.range[0]],
                                "\n" + argIndent,
                            ),
                            message: "Each argument should be on its own line",
                            node: next,
                        });
                    }
                }
            }

            // Closing paren should be on its own line
            if (closeParen.loc.start.line === lastArg.loc.end.line) {
                const tokenBeforeClose = sourceCode.getTokenBefore(closeParen);
                const hasTrailingComma = tokenBeforeClose && tokenBeforeClose.value === ",";

                context.report({
                    fix: (fixer) => {
                        if (hasTrailingComma) {
                            return fixer.replaceTextRange(
                                [tokenBeforeClose.range[1], closeParen.range[0]],
                                "\n" + baseIndent,
                            );
                        }

                        return fixer.replaceTextRange(
                            [lastArg.range[1], closeParen.range[0]],
                            ",\n" + baseIndent,
                        );
                    },
                    message: "Closing parenthesis should be on its own line",
                    node: closeParen,
                });
            }
        };

        return { CallExpression: checkCallExpressionHandler };
    },
    meta: {
        docs: { description: "Enforce function arguments formatting: each argument on its own line when >= minArgs (default: 2) or any argument is multiline" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    minArgs: {
                        default: 2,
                        description: "Minimum arguments to enforce multiline formatting (default: 2)",
                        minimum: 1,
                        type: "integer",
                    },
                    skipHooks: {
                        default: true,
                        description: "Skip React hooks (default: true)",
                        type: "boolean",
                    },
                    skipSingleArg: {
                        default: true,
                        description: "Skip single argument patterns like objects, arrays, callbacks (default: true)",
                        type: "boolean",
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
 * Rule: Nested Call Closing Brackets
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Nested function calls (like styled-components) should have
 *   closing brackets on the same line: }));
 *
 * ✓ Good:
 *   styled(Card)(({ theme }) => ({
 *       color: theme.color,
 *   }));
 *
 * ✗ Bad:
 *   styled(Card)(({ theme }) => ({
 *       color: theme.color,
 *   })
 *   );
 */
const nestedCallClosingBrackets = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            CallExpression(node) {
                // Check for pattern: fn()(arg) where fn() is also a CallExpression
                // e.g., styled(Card)(({ theme }) => ({...}))
                const { callee } = node;

                if (callee.type !== "CallExpression") return;

                const args = node.arguments;

                if (args.length !== 1) return;

                const arg = args[0];

                // Check for arrow function with object expression body
                // styled(Card)(({ theme }) => ({...}))
                if (arg.type === "ArrowFunctionExpression" && arg.body.type === "ObjectExpression") {
                    const objectBody = arg.body;

                    // Find closing tokens: } ) ) ; (may have comma between parens)
                    const closeBrace = sourceCode.getLastToken(objectBody);
                    const closeParenAfterObject = sourceCode.getTokenAfter(objectBody);

                    if (!closeParenAfterObject || closeParenAfterObject.value !== ")") return;

                    // Get next token - might be comma or second close paren
                    let nextToken = sourceCode.getTokenAfter(closeParenAfterObject);

                    // Skip trailing comma if present: }),) or })\n),\n)
                    if (nextToken && nextToken.value === ",") {
                        nextToken = sourceCode.getTokenAfter(nextToken);
                    }

                    const closeParenOuter = nextToken;

                    if (!closeParenOuter || closeParenOuter.value !== ")") return;

                    // Check if } and first ) are on different lines
                    if (closeBrace.loc.end.line !== closeParenAfterObject.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeBrace.range[1], closeParenAfterObject.range[0]],
                                "",
                            ),
                            message: "Closing brace and parenthesis should be on the same line: })",
                            node: closeParenAfterObject,
                        });

                        return;
                    }

                    // Check if first ) and second ) are on different lines (account for comma)
                    if (closeParenAfterObject.loc.end.line !== closeParenOuter.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeParenAfterObject.range[1], closeParenOuter.range[0]],
                                "",
                            ),
                            message: "Closing parentheses should be on the same line: ))",
                            node: closeParenOuter,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce nested function call closing brackets on same line: }));" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Function Calls
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function call arguments should not have empty lines between
 *   them or after opening/before closing parentheses.
 *
 * ✓ Good:
 *   fn(
 *       arg1,
 *       arg2,
 *   )
 *
 * ✗ Bad:
 *   fn(
 *       arg1,
 *
 *       arg2,
 *   )
 */
const noEmptyLinesInFunctionCalls = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isSimpleArgHandler = (arg) => [
            "Literal",
            "Identifier",
            "MemberExpression",
            "TemplateLiteral",
        ].includes(arg.type);

        const isSingleLineArgHandler = (arg) => arg.loc.start.line === arg.loc.end.line;

        const isSinglePropertyObjectHandler = (arg) => arg.type === "ObjectExpression" && arg.properties.length === 1;

        const getCleanObjectTextHandler = (arg) => {
            const prop = arg.properties[0];

            if (prop.type === "SpreadElement") return sourceCode.getText(arg);

            const keyText = sourceCode.getText(prop.key);
            const valueText = sourceCode.getText(prop.value);

            return `{ ${keyText}: ${valueText} }`;
        };

        const checkCallExpressionHandler = (node) => {
            const args = node.arguments;

            if (args.length === 0) return;

            const openParen = sourceCode.getTokenAfter(
                node.callee,
                (token) => token.value === "(",
            );
            const closeParen = sourceCode.getLastToken(node);

            if (!openParen || !closeParen || closeParen.value !== ")") return;

            const firstArg = args[0];
            const lastArg = args[args.length - 1];

            // Single simple argument on different line should be collapsed
            if (args.length === 1 && (isSimpleArgHandler(firstArg) || isSinglePropertyObjectHandler(firstArg)) && isSingleLineArgHandler(firstArg)) {
                if (firstArg.loc.start.line !== openParen.loc.end.line) {
                    const argText = isSinglePropertyObjectHandler(firstArg)
                        ? getCleanObjectTextHandler(firstArg)
                        : sourceCode.getText(firstArg);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], closeParen.range[0]],
                            argText,
                        ),
                        message: "Single simple argument should be on the same line as function call",
                        node: firstArg,
                    });

                    return;
                }
            }

            if (firstArg.loc.start.line - openParen.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], firstArg.range[0]],
                        "\n" + " ".repeat(firstArg.loc.start.column),
                    ),
                    message: "No empty line after opening parenthesis in function call",
                    node: firstArg,
                });
            }

            if (closeParen.loc.start.line - lastArg.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastArg.range[1], closeParen.range[0]],
                        "\n" + " ".repeat(closeParen.loc.start.column),
                    ),
                    message: "No empty line before closing parenthesis in function call",
                    node: lastArg,
                });
            }

            for (let i = 0; i < args.length - 1; i += 1) {
                const current = args[i];
                const next = args[i + 1];

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
                        message: "No empty line between function arguments",
                        node: next,
                    });
                }
            }
        };

        return { CallExpression: checkCallExpressionHandler };
    },
    meta: {
        docs: { description: "Disallow empty lines in function calls and enforce single simple argument on same line" },
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
 *
 * ✓ Good:
 *   function test(
 *       param1,
 *       param2,
 *   ) {}
 *
 * ✗ Bad:
 *   function test(
 *       param1,
 *
 *       param2,
 *   ) {}
 */
const noEmptyLinesInFunctionParams = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkFunctionHandler = (node) => {
            const params = node.params;

            if (params.length === 0) return;

            const firstParam = params[0];
            const lastParam = params[params.length - 1];

            // Find opening paren (could be after async keyword for async functions)
            let openParen = sourceCode.getFirstToken(node);

            while (openParen && openParen.value !== "(") {
                openParen = sourceCode.getTokenAfter(openParen);
            }

            if (!openParen) return;

            const closeParen = sourceCode.getTokenAfter(lastParam, (t) => t.value === ")");

            if (!closeParen) return;

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
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
        };
    },
    meta: {
        docs: { description: "Disallow empty lines in function parameters" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In JSX
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   JSX elements should not contain empty lines between children
 *   or after opening/before closing tags.
 *
 * ✓ Good:
 *   <div>
 *       <span>text</span>
 *       <span>more</span>
 *   </div>
 *
 * ✗ Bad:
 *   <div>
 *
 *       <span>text</span>
 *
 *       <span>more</span>
 *
 *   </div>
 */
const noEmptyLinesInJsx = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkJSXElementHandler = (node) => {
            const {
                children,
                closingElement,
                openingElement,
            } = node;

            // Skip self-closing elements
            if (!closingElement) return;

            const filteredChildren = children.filter((c) => c.type !== "JSXText" || c.value.trim() !== "");

            if (filteredChildren.length === 0) return;

            const firstChild = filteredChildren[0];
            const lastChild = filteredChildren[filteredChildren.length - 1];

            // Check for empty line after opening tag
            if (firstChild.loc.start.line - openingElement.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openingElement.range[1], firstChild.range[0]],
                        "\n" + " ".repeat(firstChild.loc.start.column),
                    ),
                    message: "No empty line after opening JSX tag",
                    node: firstChild,
                });
            }

            // Check for empty line before closing tag
            if (closingElement.loc.start.line - lastChild.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastChild.range[1], closingElement.range[0]],
                        "\n" + " ".repeat(closingElement.loc.start.column),
                    ),
                    message: "No empty line before closing JSX tag",
                    node: closingElement,
                });
            }
        };

        const isSingleLineAttrHandler = (attr) => attr.loc.start.line === attr.loc.end.line;

        const checkJSXOpeningElementHandler = (node) => {
            const {
                attributes,
                name,
            } = node;

            const elementName = sourceCode.getFirstToken(name);
            const closingBracket = sourceCode.getLastToken(node);

            if (attributes.length === 0) return;

            const firstAttr = attributes[0];
            const lastAttr = attributes[attributes.length - 1];
            const isSingleLineElement = elementName.loc.start.line === closingBracket.loc.end.line;
            const hasSimpleProps = attributes.length === 1 && isSingleLineAttrHandler(firstAttr);

            // Check for no space before closing bracket in non-self-closing element
            if (!node.selfClosing && hasSimpleProps && isSingleLineElement) {
                const tokenBeforeClosing = sourceCode.getTokenBefore(closingBracket);

                if (tokenBeforeClosing) {
                    const textBetween = sourceCode.text.slice(
                        tokenBeforeClosing.range[1],
                        closingBracket.range[0],
                    );

                    if (textBetween.includes(" ") || textBetween.includes("\n")) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeClosing.range[1], closingBracket.range[0]],
                                "",
                            ),
                            message: "No space before closing bracket in non-self-closing JSX element",
                            node: closingBracket,
                        });
                    }
                }
            }

            // Single simple prop on different line should be collapsed
            if (attributes.length === 1 && isSingleLineAttrHandler(firstAttr)) {
                if (firstAttr.loc.start.line !== elementName.loc.end.line) {
                    const attrText = sourceCode.getText(firstAttr);
                    const isSelfClosing = node.selfClosing;
                    let endRange = closingBracket.range[0];
                    let closingText = "";

                    if (isSelfClosing) {
                        const slashToken = sourceCode.getTokenBefore(closingBracket);

                        if (slashToken && slashToken.value === "/") {
                            endRange = slashToken.range[0];
                            closingText = " /";
                        }
                    }

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [elementName.range[1], endRange],
                            ` ${attrText}${closingText}`,
                        ),
                        message: "Single simple JSX prop should be on the same line as element",
                        node: firstAttr,
                    });

                    return;
                }
            }

            if (firstAttr.loc.start.line - elementName.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [elementName.range[1], firstAttr.range[0]],
                        "\n" + " ".repeat(firstAttr.loc.start.column),
                    ),
                    message: "No empty line after JSX element name",
                    node: firstAttr,
                });
            }

            let closingTokenStart = closingBracket.range[0];

            let closingIndent = closingBracket.loc.start.column;

            if (node.selfClosing) {
                const slashToken = sourceCode.getTokenBefore(closingBracket);

                if (slashToken && slashToken.value === "/") {
                    closingTokenStart = slashToken.range[0];

                    closingIndent = slashToken.loc.start.column;
                }
            }

            if (closingBracket.loc.start.line - lastAttr.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastAttr.range[1], closingTokenStart],
                        "\n" + " ".repeat(closingIndent),
                    ),
                    message: "No empty line before closing bracket",
                    node: lastAttr,
                });
            }

            for (let i = 0; i < attributes.length - 1; i += 1) {
                const current = attributes[i];

                const next = attributes[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [current.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty line between JSX props",
                        node: next,
                    });
                }
            }
        };

        const checkReturnStatementHandler = (node) => {
            const arg = node.argument;

            if (!arg) return;

            const sourceText = sourceCode.getText();

            // Check for empty line after opening parenthesis
            const textBefore = sourceText.slice(
                node.range[0],
                arg.range[0],
            );

            const openParenPos = textBefore.indexOf("(");

            if (openParenPos !== -1) {
                const afterParen = textBefore.slice(openParenPos + 1);

                if (afterParen.split("\n").length > 2) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [node.range[0] + openParenPos + 1, arg.range[0]],
                            "\n" + " ".repeat(arg.loc.start.column),
                        ),
                        message: "No empty line allowed after opening parenthesis in return",
                        node: arg,
                    });
                }
            }

            // Check for empty line before closing parenthesis
            const textAfter = sourceText.slice(
                arg.range[1],
                node.range[1],
            );

            const closeParenPos = textAfter.lastIndexOf(")");

            if (closeParenPos !== -1) {
                const beforeParen = textAfter.slice(0, closeParenPos);

                if (beforeParen.split("\n").length > 2) {
                    const closeParenIndex = arg.range[1] + closeParenPos;

                    const indent = sourceText.slice(
                        0,
                        closeParenIndex,
                    ).split("\n").pop().match(/^\s*/)[0];

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [arg.range[1], closeParenIndex],
                            "\n" + indent,
                        ),
                        message: "No empty line allowed before closing parenthesis in return",
                        node,
                    });
                }
            }
        };

        const checkArrowFunctionHandler = (node) => {
            if (!node.body || node.body.type === "BlockStatement") return;

            const body = node.body;
            const arrowToken = sourceCode.getTokenBefore(body, (t) => t.value === "=>");

            if (!arrowToken) return;

            const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

            // Check for opening parenthesis after arrow
            if (tokenAfterArrow && tokenAfterArrow.value === "(") {
                // Check for empty line after (
                if (body.loc.start.line - tokenAfterArrow.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenAfterArrow.range[1], body.range[0]],
                            "\n" + " ".repeat(body.loc.start.column),
                        ),
                        message: "No empty line allowed after opening parenthesis in arrow function",
                        node: body,
                    });
                }
            }

            const tokenAfter = sourceCode.getTokenAfter(body);

            if (tokenAfter && tokenAfter.value === ")" && tokenAfter.loc.start.line - body.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [body.range[1], tokenAfter.range[0]],
                        "\n" + " ".repeat(tokenAfter.loc.start.column),
                    ),
                    message: "No empty line allowed before closing parenthesis in arrow function",
                    node: body,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            JSXElement: checkJSXElementHandler,
            JSXOpeningElement: checkJSXOpeningElementHandler,
            ReturnStatement: checkReturnStatementHandler,
        };
    },
    meta: {
        docs: { description: "Disallow empty lines in JSX" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Objects
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Object literals should not contain empty lines between
 *   properties or after opening/before closing braces.
 *
 * ✓ Good:
 *   {
 *       a: 1,
 *       b: 2,
 *   }
 *
 * ✗ Bad:
 *   {
 *       a: 1,
 *
 *       b: 2,
 *   }
 */
const noEmptyLinesInObjects = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkObjectHandler = (node) => {
            const { properties } = node;

            if (properties.length === 0) return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);
            const firstProp = properties[0];
            const lastProp = properties[properties.length - 1];

            // Check for empty line after opening brace
            if (firstProp.loc.start.line - openBrace.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstProp.range[0]],
                        "\n" + " ".repeat(firstProp.loc.start.column),
                    ),
                    message: "No empty line after opening brace",
                    node: firstProp,
                });
            }

            // Check for empty line before closing brace
            if (closeBrace.loc.start.line - lastProp.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastProp.range[1], closeBrace.range[0]],
                        "\n" + " ".repeat(closeBrace.loc.start.column),
                    ),
                    message: "No empty line before closing brace",
                    node: lastProp,
                });
            }

            // Check for empty lines between properties
            for (let i = 0; i < properties.length - 1; i += 1) {
                const current = properties[i];
                const next = properties[i + 1];

                if (next.loc.start.line - current.loc.end.line > 1) {
                    let commaToken = sourceCode.getTokenAfter(current);

                    while (commaToken && commaToken.value !== "," && commaToken.range[0] < next.range[0]) {
                        commaToken = sourceCode.getTokenAfter(commaToken);
                    }

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken && commaToken.value === "," ? commaToken.range[1] : current.range[1], next.range[0]],
                            "\n" + " ".repeat(next.loc.start.column),
                        ),
                        message: "No empty line between object properties",
                        node: next,
                    });
                }
            }
        };

        return {
            ObjectExpression: checkObjectHandler,
            ObjectPattern: checkObjectHandler,
        };
    },
    meta: {
        docs: { description: "Disallow empty lines in objects" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Empty Lines In Switch Cases
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Switch case blocks should not have empty lines at the
 *   beginning of the case logic or between consecutive cases.
 *
 * ✓ Good:
 *   switch (value) {
 *       case 1:
 *           return "one";
 *       case 2:
 *           return "two";
 *   }
 *
 * ✗ Bad:
 *   switch (value) {
 *       case 1:
 *
 *           return "one";
 *
 *       case 2:
 *           return "two";
 *   }
 */
const noEmptyLinesInSwitchCases = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkSwitchCaseHandler = (node) => {
            const {
                consequent,
                test,
            } = node;

            const colon = sourceCode.getTokenAfter(
                test || sourceCode.getFirstToken(node),
                (t) => t.value === ":",
            );

            if (consequent.length > 0) {
                const firstStatement = consequent[0];

                const tokensBetween = sourceCode.getTokensBetween(
                    colon,
                    firstStatement,
                    { includeComments: true },
                );

                if (tokensBetween.length === 0 && firstStatement.loc.start.line - colon.loc.end.line > 1) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceTextRange(
                                [colon.range[1], firstStatement.range[0]],
                                `\n${" ".repeat(firstStatement.loc.start.column)}`,
                            );
                        },
                        message: "Empty line not allowed at the beginning of case logic",
                        node: firstStatement,
                    });
                }
            }
        };

        const checkSwitchStatementHandler = (node) => {
            const { cases } = node;

            for (let i = 0; i < cases.length - 1; i += 1) {
                const currentCase = cases[i];

                const nextCase = cases[i + 1];

                if (currentCase.consequent.length === 0) {
                    const colon = sourceCode.getTokenAfter(
                        currentCase.test || sourceCode.getFirstToken(currentCase),
                        (t) => t.value === ":",
                    );

                    const tokensBetween = sourceCode.getTokensBetween(
                        colon,
                        nextCase,
                        { includeComments: true },
                    );

                    if (tokensBetween.length === 0 && nextCase.loc.start.line - colon.loc.end.line > 1) {
                        context.report({
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [colon.range[1], nextCase.range[0]],
                                    `\n${" ".repeat(nextCase.loc.start.column)}`,
                                );
                            },
                            message: "Empty line not allowed between cases",
                            node: nextCase,
                        });
                    }
                }
            }
        };

        return {
            SwitchCase: checkSwitchCaseHandler,
            SwitchStatement: checkSwitchStatementHandler,
        };
    },
    meta: {
        docs: { description: "Prevent empty lines at the beginning of switch case logic or between cases" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Object Property Per Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When an object has minProperties or more properties,
 *   enforces multiline formatting with:
 *   - Newline after opening `{`
 *   - Each property on its own line
 *   - Newline before closing `}`
 *
 *   This rule handles complete object multiline formatting.
 *
 * Options:
 *   { minProperties: 2 } - Enforce multiline when >= 2 properties
 *
 * ✓ Good:
 *   const obj = {
 *       name: "John",
 *       age: 30,
 *   };
 *
 * ✗ Bad:
 *   const obj = { name: "John", age: 30 };
 *   const obj = { name: "John",
 *       age: 30 };
 */
const objectPropertyPerLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const minProperties = options.minProperties !== undefined ? options.minProperties : 2;

        // Check if a value can be collapsed to single line
        const canCollapse = (valueNode) => {
            if (!valueNode) return true;

            // Simple values can always be collapsed
            if (["Literal", "Identifier", "MemberExpression", "UnaryExpression"].includes(valueNode.type)) {
                return true;
            }

            // Template literals: can only collapse if single-line (multi-line templates would break)
            if (valueNode.type === "TemplateLiteral") {
                return valueNode.loc.start.line === valueNode.loc.end.line;
            }

            // Call expressions: can only collapse if already on single line
            if (valueNode.type === "CallExpression") {
                return valueNode.loc.start.line === valueNode.loc.end.line;
            }

            // Arrow functions: can only collapse if already on single line
            if (valueNode.type === "ArrowFunctionExpression") {
                return valueNode.loc.start.line === valueNode.loc.end.line;
            }

            // Spread elements: check if the argument can be collapsed
            if (valueNode.type === "SpreadElement") {
                return canCollapse(valueNode.argument);
            }

            // Arrays: can collapse only if already on single line (let array-items-per-line handle it)
            if (valueNode.type === "ArrayExpression") {
                const isAlreadySingleLine = valueNode.loc.start.line === valueNode.loc.end.line;

                return isAlreadySingleLine;
            }

            // Objects: can collapse if fewer than minProperties and all values can collapse
            if (valueNode.type === "ObjectExpression") {
                const { properties } = valueNode;

                if (properties.length === 0) return true;

                if (properties.length >= minProperties) return false;

                // Check all property values can be collapsed (handle SpreadElement)
                return properties.every((prop) => {
                    if (prop.type === "SpreadElement") return canCollapse(prop.argument);

                    return canCollapse(prop.value);
                });
            }

            // Other complex types (functions, etc.) cannot be collapsed
            return false;
        };

        // Generate collapsed single-line text for a value
        const getCollapsedText = (valueNode) => {
            if (!valueNode) return "";

            // Arrays: use source text since it's already formatted by array-items-per-line
            if (valueNode.type === "ArrayExpression") {
                return sourceCode.getText(valueNode).replace(/\s+/g, " ").trim();
            }

            if (valueNode.type === "ObjectExpression") {
                const { properties } = valueNode;

                if (properties.length === 0) return "{}";

                const propsText = properties.map((prop) => {
                    // Handle SpreadElement (e.g., ...obj)
                    if (prop.type === "SpreadElement") {
                        return `...${getCollapsedText(prop.argument)}`;
                    }

                    const keyText = prop.computed ? `[${sourceCode.getText(prop.key)}]` : sourceCode.getText(prop.key);
                    const valueText = getCollapsedText(prop.value);

                    return prop.shorthand ? keyText : `${keyText}: ${valueText}`;
                }).join(", ");

                return `{ ${propsText} }`;
            }

            return sourceCode.getText(valueNode).trim();
        };

        const checkObjectHandler = (node) => {
            const { properties } = node;

            // Skip empty objects
            if (properties.length === 0) return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);
            const firstProperty = properties[0];
            const lastProperty = properties[properties.length - 1];

            if (!openBrace || !closeBrace || openBrace.value !== "{" || closeBrace.value !== "}") return;

            // COLLAPSE: Objects with fewer than minProperties should be on single line if possible
            if (properties.length < minProperties) {
                const isMultiline = openBrace.loc.start.line !== closeBrace.loc.end.line;

                // Check if all property values can be collapsed (handle SpreadElement)
                const allCanCollapse = properties.every((prop) => {
                    if (prop.type === "SpreadElement") return canCollapse(prop.argument);

                    return canCollapse(prop.value);
                });

                if (isMultiline && allCanCollapse) {
                    // Generate collapsed text for all properties
                    const propertiesText = properties.map((prop) => {
                        // Handle SpreadElement (e.g., ...obj)
                        if (prop.type === "SpreadElement") {
                            return `...${getCollapsedText(prop.argument)}`;
                        }

                        const keyText = prop.computed ? `[${sourceCode.getText(prop.key)}]` : sourceCode.getText(prop.key);
                        const valueText = getCollapsedText(prop.value);

                        return prop.shorthand ? keyText : `${keyText}: ${valueText}`;
                    }).join(", ");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{ ${propertiesText} }`,
                        ),
                        message: `Objects with fewer than ${minProperties} properties should be on a single line`,
                        node,
                    });

                    return;
                }

                // If can't fully collapse, still check for partial formatting issues
                if (!allCanCollapse && isMultiline) {
                    // Object has complex nested value that can't collapse
                    // Just ensure proper multiline formatting
                    const objectIndent = " ".repeat(openBrace.loc.start.column);
                    const propertyIndent = objectIndent + "    ";

                    // First property should be on new line
                    if (openBrace.loc.end.line === firstProperty.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], firstProperty.range[0]],
                                "\n" + propertyIndent,
                            ),
                            message: "Property with complex value should be on its own line",
                            node: firstProperty,
                        });
                    }

                    // Closing brace should be on new line
                    if (closeBrace.loc.start.line === lastProperty.loc.end.line) {
                        context.report({
                            fix: (fixer) => {
                                const afterLastToken = sourceCode.getTokenAfter(lastProperty);
                                const hasTrailingComma = afterLastToken && afterLastToken.value === ",";

                                if (hasTrailingComma) {
                                    return fixer.replaceTextRange(
                                        [afterLastToken.range[1], closeBrace.range[0]],
                                        "\n" + objectIndent,
                                    );
                                }

                                return fixer.replaceTextRange(
                                    [lastProperty.range[1], closeBrace.range[0]],
                                    ",\n" + objectIndent,
                                );
                            },
                            message: "Closing brace should be on its own line for object with complex value",
                            node: closeBrace,
                        });
                    }
                }

                return;
            }

            // EXPAND: Objects with minProperties or more should be multiline
            // Calculate proper indentation based on the object's position
            const objectIndent = " ".repeat(openBrace.loc.start.column);
            const propertyIndent = objectIndent + "    ";

            // Check if first property is on same line as opening brace
            if (openBrace.loc.end.line === firstProperty.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstProperty.range[0]],
                        "\n" + propertyIndent,
                    ),
                    message: `Objects with ${minProperties}+ properties should have first property on its own line`,
                    node: firstProperty,
                });
            }

            // Check if closing brace is on same line as last property
            if (closeBrace.loc.start.line === lastProperty.loc.end.line) {
                context.report({
                    fix: (fixer) => {
                        const lastToken = sourceCode.getLastToken(lastProperty);
                        const afterLastToken = sourceCode.getTokenAfter(lastProperty);
                        const hasTrailingComma = afterLastToken && afterLastToken.value === ",";

                        if (hasTrailingComma) {
                            return fixer.replaceTextRange(
                                [afterLastToken.range[1], closeBrace.range[0]],
                                "\n" + objectIndent,
                            );
                        }

                        return fixer.replaceTextRange(
                            [lastToken.range[1], closeBrace.range[0]],
                            ",\n" + objectIndent,
                        );
                    },
                    message: `Objects with ${minProperties}+ properties should have closing brace on its own line`,
                    node: closeBrace,
                });
            }

            // Check each property is on its own line
            for (let i = 0; i < properties.length - 1; i += 1) {
                const current = properties[i];
                const next = properties[i + 1];

                if (current.loc.end.line === next.loc.start.line) {
                    const commaToken = sourceCode.getTokenAfter(current, (t) => t.value === ",");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [commaToken.range[1], next.range[0]],
                            "\n" + propertyIndent,
                        ),
                        message: "Each property should be on its own line",
                        node: next,
                    });
                }
            }
        };

        return {
            ObjectExpression: checkObjectHandler,
            ObjectPattern: checkObjectHandler,
        };
    },
    meta: {
        docs: { description: "Enforce object formatting: collapse to single line when < minProperties (including nested objects/arrays), expand to multiline when >= minProperties" },
        fixable: "whitespace",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    minProperties: {
                        default: 2,
                        description: "Minimum properties to enforce multiline formatting (default: 2)",
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
 * Rule: Object Property Value Brace
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Opening brace of an object value should be on the same line
 *   as the colon, not on a new line.
 *
 * ✓ Good:
 *   "& a": { color: "red" }
 *
 * ✗ Bad:
 *   "& a":
 *       { color: "red" }
 */
const objectPropertyValueBrace = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Property(node) {
                const { value } = node;

                // Only check object expression values
                if (value.type !== "ObjectExpression") return;

                // Get the colon token
                const colonToken = sourceCode.getTokenBefore(value, (t) => t.value === ":");

                if (!colonToken) return;

                // Get the opening brace of the object value
                const openBrace = sourceCode.getFirstToken(value);

                if (!openBrace || openBrace.value !== "{") return;

                // Check if colon and { are on different lines
                if (colonToken.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Opening brace should be on the same line as colon for object property values",
                        node: openBrace,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce opening brace on same line as colon for object property values" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Object Property Value Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Object property values should be on the same line as the colon
 *   with proper spacing for simple values.
 *
 * ✓ Good:
 *   {
 *       name: "John",
 *       age: 30,
 *   }
 *
 * ✗ Bad:
 *   {
 *       name:
 *           "John",
 *       age:
 *           30,
 *   }
 */
const objectPropertyValueFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkPropertyHandler = (node) => {
            // Skip shorthand properties (no colon)
            if (node.shorthand) return;

            // Skip computed properties (e.g., [key]: value)
            if (node.computed) return;

            const colonToken = sourceCode.getTokenAfter(node.key, (t) => t.value === ":");

            if (!colonToken) return;

            const valueNode = node.value;

            // Check for missing space after colon
            const textAfterColon = sourceCode.text.slice(colonToken.range[1], colonToken.range[1] + 1);

            if (textAfterColon !== " " && textAfterColon !== "\n") {
                context.report({
                    fix: (fixer) => fixer.insertTextAfter(colonToken, " "),
                    message: "Missing space after colon in object property",
                    node: colonToken,
                });

                return;
            }

            // Handle arrow functions and function expressions - ensure they start on same line
            if (valueNode.type === "ArrowFunctionExpression" || valueNode.type === "FunctionExpression") {
                if (valueNode.loc.start.line > colonToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], valueNode.range[0]],
                            " ",
                        ),
                        message: "Arrow function should start on the same line as the colon",
                        node: valueNode,
                    });
                }

                return;
            }

            // Handle JSX elements - check for simple vs complex
            if (valueNode.type === "JSXElement" || valueNode.type === "JSXFragment") {
                const tokenAfterColon = sourceCode.getTokenAfter(colonToken);
                const isWrappedInParens = tokenAfterColon && tokenAfterColon.value === "(";

                // Check if JSX is simple (single element with only text/whitespace children, no attributes)
                const isSimpleJsxHandler = (jsxNode) => {
                    if (jsxNode.type === "JSXFragment") return false;

                    // Has attributes - not simple
                    if (jsxNode.openingElement.attributes.length > 0) return false;

                    const children = jsxNode.children || [];

                    // Filter out whitespace-only text nodes
                    const meaningfulChildren = children.filter((child) => {
                        if (child.type === "JSXText") {
                            return child.value.trim().length > 0;
                        }

                        return true;
                    });

                    // No meaningful children or only text - simple
                    if (meaningfulChildren.length === 0) return true;

                    if (meaningfulChildren.length === 1 && meaningfulChildren[0].type === "JSXText") {
                        return true;
                    }

                    return false;
                };

                // Build collapsed JSX string for simple elements
                const getCollapsedJsxHandler = (jsxNode) => {
                    const tagName = jsxNode.openingElement.name.name;
                    const children = jsxNode.children || [];
                    const textContent = children
                        .filter((child) => child.type === "JSXText")
                        .map((child) => child.value.trim())
                        .join("")
                        .trim();

                    if (textContent) {
                        return `<${tagName}>${textContent}</${tagName}>`;
                    }

                    return `<${tagName} />`;
                };

                const jsxIsSimple = isSimpleJsxHandler(valueNode);

                if (jsxIsSimple) {
                    const collapsedJsx = getCollapsedJsxHandler(valueNode);
                    const currentText = sourceCode.getText(valueNode);

                    // Check if already correctly formatted (inline, no parens, collapsed)
                    const isAlreadyCorrect = currentText === collapsedJsx
                        && !isWrappedInParens
                        && colonToken.loc.end.line === valueNode.loc.start.line;

                    if (!isAlreadyCorrect) {
                        // Check if there's a comma after
                        let tokenAfterValue = sourceCode.getTokenAfter(valueNode);

                        if (isWrappedInParens) {
                            const closeParen = sourceCode.getTokenAfter(valueNode);

                            tokenAfterValue = sourceCode.getTokenAfter(closeParen);
                        }

                        const hasCommaAfter = tokenAfterValue && tokenAfterValue.value === ",";
                        const closeParen = isWrappedInParens ? sourceCode.getTokenAfter(valueNode) : null;
                        const endRange = hasCommaAfter
                            ? tokenAfterValue.range[1]
                            : closeParen ? closeParen.range[1] : valueNode.range[1];

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], endRange],
                                ` ${collapsedJsx}${hasCommaAfter ? "," : ""}`,
                            ),
                            message: "Simple JSX should be inline with property",
                            node: valueNode,
                        });
                    }

                    return;
                }

                // Complex JSX - must be wrapped in parentheses if multi-line
                const jsxSpansMultipleLines = valueNode.loc.start.line !== valueNode.loc.end.line;

                if (jsxSpansMultipleLines && !isWrappedInParens) {
                    const jsxText = sourceCode.getText(valueNode);
                    const indent = " ".repeat(colonToken.loc.start.column);

                    // Check if there's a comma after the JSX
                    const tokenAfterValue = sourceCode.getTokenAfter(valueNode);
                    const hasCommaAfter = tokenAfterValue && tokenAfterValue.value === ",";
                    const endRange = hasCommaAfter ? tokenAfterValue.range[1] : valueNode.range[1];
                    const commaStr = hasCommaAfter ? "," : "";

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], endRange],
                            ` (\n${indent}    ${jsxText.split("\n").join("\n" + indent + "    ")}\n${indent})${commaStr}`,
                        ),
                        message: "Multi-line JSX in object property must be wrapped in parentheses",
                        node: valueNode,
                    });
                }

                return;
            }

            // Check if value is on the same line as the colon (skip multiline objects/arrays)
            if (valueNode.loc.start.line > colonToken.loc.end.line) {
                // Skip if value is a multiline object or array
                if (valueNode.type === "ObjectExpression" || valueNode.type === "ArrayExpression") {
                    if (valueNode.loc.start.line !== valueNode.loc.end.line) return;
                }

                // Skip parenthesized expressions
                const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                if (tokenAfterColon && tokenAfterColon.value === "(") return;

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [colonToken.range[1], valueNode.range[0]],
                        " ",
                    ),
                    message: "Property value should be on the same line as the colon",
                    node: valueNode,
                });
            }
        };

        return { Property: checkPropertyHandler };
    },
    meta: {
        docs: { description: "Enforce property value on same line as colon with proper spacing" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Opening Brackets Same Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Opening brackets should be on the same line as function/method calls.
 *   This applies to objects, arrays, and arrow function parameters.
 *
 * ✓ Good:
 *   fn({ prop: value })
 *   .map(({ x }) => x)
 *   fn([1, 2, 3])
 *
 * ✗ Bad:
 *   fn(
 *       { prop: value }
 *   )
 *   .map(
 *       ({ x }) => x
 *   )
 */
const openingBracketsSameLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const checkCallExpressionHandler = (node) => {
            const { callee } = node;

            // Case 0: Function call with opening paren on different line - fn\n( should be fn(
            const calleeLastToken = sourceCode.getLastToken(callee);
            const openParenToken = sourceCode.getTokenAfter(callee);

            if (openParenToken && openParenToken.value === "(" && calleeLastToken.loc.end.line !== openParenToken.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [calleeLastToken.range[1], openParenToken.range[1]],
                        "(",
                    ),
                    message: "Opening parenthesis should be on the same line as function name",
                    node: openParenToken,
                });

                return;
            }

            const args = node.arguments;

            if (args.length === 0) return;

            const firstArg = args[0];
            const openParen = sourceCode.getTokenBefore(firstArg);

            // Case 1: Object expression as first argument - .fn({ should be together
            // Only apply when: single argument AND call is single-line
            if (firstArg.type === "ObjectExpression" && firstArg.properties.length >= 1) {
                const callIsMultiLine = node.loc.start.line !== node.loc.end.line;
                const hasMultipleArgs = args.length > 1;

                // Skip if call spans multiple lines with multiple arguments - that format is intentional
                // e.g., fn(\n    { prop: val },\n    other\n)
                if (callIsMultiLine && hasMultipleArgs) return;

                const openBrace = sourceCode.getFirstToken(firstArg);

                if (openParen.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], openBrace.range[1]],
                            "{",
                        ),
                        message: "Opening parenthesis and brace should be on the same line",
                        node: openBrace,
                    });
                }

                const closeBrace = sourceCode.getLastToken(firstArg);
                let closeParen = sourceCode.getTokenAfter(firstArg);

                // Skip trailing comma if present: },)
                if (closeParen && closeParen.value === ",") {
                    closeParen = sourceCode.getTokenAfter(closeParen);
                }

                if (closeParen && closeParen.value === ")") {
                    if (closeBrace.loc.end.line !== closeParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeBrace.range[1], closeParen.range[0]],
                                "",
                            ),
                            message: "Closing brace and parenthesis should be on the same line",
                            node: closeParen,
                        });
                    }
                }

                return;
            }

            // Case 1b: Array expression as first argument - fn([ should be together
            // Only apply when single argument; multiple args should each be on their own line
            if (firstArg.type === "ArrayExpression" && args.length === 1) {
                const isMultiLine = firstArg.loc.start.line !== firstArg.loc.end.line;
                const openBracket = sourceCode.getFirstToken(firstArg);

                // fn([ - opening paren and bracket should be on same line
                if (openParen.loc.end.line !== openBracket.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], openBracket.range[0]],
                            "",
                        ),
                        message: "Opening parenthesis and bracket should be on the same line: fn([",
                        node: openBracket,
                    });

                    return;
                }

                // For multiline arrays of objects, do NOT enforce [{ on same line
                // The arrayObjectsOnNewLines rule handles putting each object on its own line
                // Only enforce [{ for single-line arrays
                if (!isMultiLine && firstArg.elements.length > 0 && firstArg.elements[0] && firstArg.elements[0].type === "ObjectExpression") {
                    const firstElement = firstArg.elements[0];
                    const openBrace = sourceCode.getFirstToken(firstElement);

                    if (openBracket.loc.end.line !== openBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBracket.range[1], openBrace.range[1]],
                                "{",
                            ),
                            message: "Opening bracket and brace should be on the same line",
                            node: openBrace,
                        });
                    }
                }

                // Check closing ]); should be together
                const closeBracket = sourceCode.getLastToken(firstArg);
                let closeParen = sourceCode.getTokenAfter(firstArg);

                // Skip trailing comma if present: ],)
                if (closeParen && closeParen.value === ",") {
                    closeParen = sourceCode.getTokenAfter(closeParen);
                }

                if (closeParen && closeParen.value === ")") {
                    if (closeBracket.loc.end.line !== closeParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [closeBracket.range[1], closeParen.range[0]],
                                "",
                            ),
                            message: "Closing bracket and parenthesis should be on the same line: ])",
                            node: closeParen,
                        });
                    }
                }

                return;
            }

            // Case 1c: CallExpression as first argument with multiple args - should start on new line
            // e.g., useCallback(debounce(...), []) - debounce should be on new line
            if (firstArg.type === "CallExpression" && args.length > 1) {
                // Check if the call expression is on the same line as the opening paren
                if (openParen.loc.end.line === firstArg.loc.start.line) {
                    const indent = " ".repeat(openParen.loc.start.column + 4);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openParen.range[1], firstArg.range[0]],
                            "\n" + indent,
                        ),
                        message: "Function call argument should start on a new line when there are multiple arguments",
                        node: firstArg,
                    });
                }

                return;
            }

            // Case 2: Arrow function callback
            if (firstArg.type === "ArrowFunctionExpression") {
                const arrowParams = firstArg.params;

                if (arrowParams.length === 0) return;

                const firstParam = arrowParams[0];
                const lastParam = arrowParams[arrowParams.length - 1];

                // Case 2a: Single destructured param - .map(({ x, y }) => ...)
                if (arrowParams.length === 1 && firstParam.type === "ObjectPattern") {
                    const arrowOpenParen = sourceCode.getTokenBefore(firstParam);

                    if (!arrowOpenParen || arrowOpenParen.value !== "(") return;

                    // First, ensure .map( and (( are on same line
                    if (openParen.loc.end.line !== arrowOpenParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openParen.range[1], arrowOpenParen.range[1]],
                                "(",
                            ),
                            message: "Callback opening parenthesis should be on the same line as function call",
                            node: arrowOpenParen,
                        });

                        return;
                    }

                    // Then, ensure (( and { are on same line
                    const openBrace = sourceCode.getFirstToken(firstParam);

                    if (arrowOpenParen.loc.end.line !== openBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowOpenParen.range[1], openBrace.range[1]],
                                "{",
                            ),
                            message: "Opening parenthesis and brace should be on the same line for callback destructured param",
                            node: openBrace,
                        });
                    }

                    return;
                }

                // Case 2b: Single simple param - collapse to single line .map((sd) => ...)
                if (arrowParams.length === 1 && firstParam.type === "Identifier") {
                    const arrowOpenParen = sourceCode.getTokenBefore(firstParam);

                    if (!arrowOpenParen || arrowOpenParen.value !== "(") return;

                    if (arrowOpenParen.loc.end.line !== firstParam.loc.start.line) {
                        const paramText = sourceCode.getText(firstParam);

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowOpenParen.range[1], firstParam.range[0]],
                                "",
                            ),
                            message: "Single callback param should be on the same line as opening parenthesis",
                            node: firstParam,
                        });
                    }

                    return;
                }

                // Case 2c: Multiple params (2+)
                if (arrowParams.length >= 2) {
                    const arrowOpenParen = sourceCode.getTokenBefore(firstParam);

                    if (!arrowOpenParen || arrowOpenParen.value !== "(") return;

                    // Check if params span multiple lines (first param on different line than open paren)
                    const paramsAreMultiLine = arrowOpenParen.loc.end.line !== firstParam.loc.start.line;

                    // Check if arrow function body is multiline
                    const arrowBody = firstArg.body;
                    const bodyIsMultiLine = arrowBody && arrowBody.loc.start.line !== arrowBody.loc.end.line;

                    // If params or body are multi-line, don't require (( on same line
                    // This allows the proper format:
                    // debounce(
                    //     (value, requestName) => {
                    //         ...
                    //     },
                    //     500,
                    // )
                    if (paramsAreMultiLine || bodyIsMultiLine) return;

                    // For single-line params with single-line body, keep (( on same line
                    if (openParen.loc.end.line !== arrowOpenParen.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openParen.range[1], arrowOpenParen.range[1]],
                                "(",
                            ),
                            message: "Opening parentheses should be on the same line for callback params",
                            node: arrowOpenParen,
                        });
                    }
                }
            }
        };

        const checkJSXExpressionContainerHandler = (node) => {
            const expression = node.expression;

            // Skip empty expressions
            if (expression.type === "JSXEmptyExpression") return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);

            // Case 1: ObjectExpression - opening {{ should be together (for JSX attributes)
            if (expression.type === "ObjectExpression" && expression.properties.length >= 1) {
                const objectOpenBrace = sourceCode.getFirstToken(expression);

                if (openBrace.loc.end.line !== objectOpenBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], objectOpenBrace.range[1]],
                            "{",
                        ),
                        message: "Opening braces should be on the same line for JSX object expression",
                        node: objectOpenBrace,
                    });
                }

                // Also check closing }} should be together
                const objectCloseBrace = sourceCode.getLastToken(expression);

                if (closeBrace.loc.start.line !== objectCloseBrace.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [objectCloseBrace.range[1], closeBrace.range[0]],
                            "",
                        ),
                        message: "Closing braces should be on the same line for JSX object expression",
                        node: closeBrace,
                    });
                }

                return;
            }

            // Case 2: CallExpression (like {items.map(...)}) - opening { and call should be on same line
            if (expression.type === "CallExpression") {
                if (openBrace.loc.end.line !== expression.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], expression.range[0]],
                            "",
                        ),
                        message: "Opening brace and expression should be on the same line",
                        node: expression,
                    });
                }

                return;
            }

            // Case 3: Simple expressions - collapse to single line
            const simpleTypes = ["Identifier", "MemberExpression", "Literal"];

            // Also include ConditionalExpression if it's single-line
            const isSingleLineConditional = expression.type === "ConditionalExpression"
                && expression.loc.start.line === expression.loc.end.line;

            if (simpleTypes.includes(expression.type) || isSingleLineConditional) {
                const isMultiLine = openBrace.loc.end.line !== closeBrace.loc.start.line;

                if (isMultiLine) {
                    const expressionText = sourceCode.getText(expression);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], closeBrace.range[0]],
                            expressionText,
                        ),
                        message: "Simple expression should be on single line in JSX attribute",
                        node: expression,
                    });
                }

                return;
            }

            // Case 3: ArrowFunctionExpression in JSX attribute
            if (expression.type === "ArrowFunctionExpression") {
                // First, ensure { and arrow function start are on same line
                if (openBrace.loc.end.line !== expression.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], expression.range[0]],
                            "",
                        ),
                        message: "Opening brace and arrow function should be on the same line in JSX attribute",
                        node: expression,
                    });

                    return;
                }

                // Case 3a: Block body - closing }} should be together
                if (expression.body.type === "BlockStatement") {
                    // Only fix if parent is JSXAttribute
                    if (node.parent && node.parent.type === "JSXAttribute") {
                        const blockCloseBrace = sourceCode.getLastToken(expression.body);

                        if (blockCloseBrace && closeBrace.loc.start.line !== blockCloseBrace.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [blockCloseBrace.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing braces should be together for arrow function in JSX attribute",
                                node: closeBrace,
                            });
                        }
                    }

                    return;
                }

                // Case 3b: Simple expression body - collapse entire arrow function to single line if simple
                if (node.parent && node.parent.type === "JSXAttribute") {
                    // Check if the entire arrow function is single-line worthy
                    const arrowFunctionIsSingleLine = expression.loc.start.line === expression.loc.end.line;

                    // Check if { and expression are on different lines, or expression and } are on different lines
                    const openBraceNotWithExpression = openBrace.loc.end.line !== expression.loc.start.line;
                    const closeBraceNotWithExpression = expression.loc.end.line !== closeBrace.loc.start.line;
                    const needsCollapse = openBraceNotWithExpression || closeBraceNotWithExpression;

                    // If arrow function fits on one line, collapse everything
                    if (needsCollapse && arrowFunctionIsSingleLine) {
                        const arrowText = sourceCode.getText(expression);

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], closeBrace.range[0]],
                                arrowText,
                            ),
                            message: "Simple arrow function should be on single line in JSX attribute",
                            node: expression,
                        });

                        return;
                    }

                    // If body is single-line but arrow function spans multiple lines, collapse from arrow to end
                    // Only do this for truly simple single-line bodies
                    const bodyIsSingleLine = expression.body.loc.start.line === expression.body.loc.end.line;

                    if (bodyIsSingleLine) {
                        const arrowToken = sourceCode.getTokenBefore(
                            expression.body,
                            (t) => t.value === "=>",
                        );

                        if (arrowToken && arrowToken.loc.end.line !== expression.body.loc.start.line) {
                            const bodyText = sourceCode.getText(expression.body);

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [arrowToken.range[1], closeBrace.range[0]],
                                    " " + bodyText,
                                ),
                                message: "Simple arrow function expression should be on single line",
                                node: expression.body,
                            });
                        }
                    }
                }

                return;
            }

            // Case 4: JSX element wrapped in parentheses - {( should be together and )} should be together
            if (expression.type === "JSXElement" || expression.type === "JSXFragment") {
                // Check if JSX is wrapped in parentheses
                const tokenBeforeJsx = sourceCode.getTokenBefore(expression);

                if (tokenBeforeJsx && tokenBeforeJsx.value === "(") {
                    // Check if { and ( are on different lines
                    if (openBrace.loc.end.line !== tokenBeforeJsx.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], tokenBeforeJsx.range[1]],
                                "(",
                            ),
                            message: "Opening brace and parenthesis should be together for JSX expression",
                            node: tokenBeforeJsx,
                        });
                    }

                    // Check closing )}
                    const tokenAfterJsx = sourceCode.getTokenAfter(expression);

                    if (tokenAfterJsx && tokenAfterJsx.value === ")") {
                        if (closeBrace.loc.start.line !== tokenAfterJsx.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterJsx.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing parenthesis and brace should be together for JSX expression",
                                node: closeBrace,
                            });
                        }
                    }
                }

                return;
            }

            // Case 5: LogicalExpression - ensure { and expression start are on same line
            if (expression.type === "LogicalExpression") {
                // First, ensure { and expression start are on same line
                if (openBrace.loc.end.line !== expression.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBrace.range[1], expression.range[0]],
                            "",
                        ),
                        message: "Opening brace and logical expression should be on the same line",
                        node: expression,
                    });

                    return;
                }

                const operatorToken = sourceCode.getTokenAfter(
                    expression.left,
                    (t) => t.value === "&&" || t.value === "||",
                );

                if (operatorToken) {
                    // Check if left operand and operator are on different lines
                    // Only apply this rule for simple patterns like {condition && (<JSX/>)}
                    // Skip complex multiline logical expressions (e.g., disabled={a || b || c})
                    const isSimplePattern = expression.right.type === "JSXElement"
                        || expression.right.type === "JSXFragment"
                        || (expression.right.type === "ConditionalExpression")
                        || (sourceCode.getTokenBefore(expression.right)?.value === "(");

                    if (isSimplePattern && expression.left.loc.end.line !== operatorToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [expression.left.range[1], operatorToken.range[1]],
                                " " + operatorToken.value,
                            ),
                            message: "Logical operator should be on the same line as the left operand",
                            node: operatorToken,
                        });

                        return;
                    }

                    const tokenAfterOperator = sourceCode.getTokenAfter(operatorToken);

                    // Check if operator and ( are on different lines
                    if (tokenAfterOperator && tokenAfterOperator.value === "(") {
                        if (operatorToken.loc.end.line !== tokenAfterOperator.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [operatorToken.range[1], tokenAfterOperator.range[1]],
                                    " (",
                                ),
                                message: "Opening parenthesis should be on same line as logical operator",
                                node: tokenAfterOperator,
                            });
                        }
                    }

                    // Find the closing ) for the right side
                    const closingParen = sourceCode.getTokenAfter(expression.right);

                    if (closingParen && closingParen.value === ")") {
                        // Check if ) and } are on different lines
                        if (closeBrace.loc.start.line !== closingParen.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [closingParen.range[1], closeBrace.range[0]],
                                    "",
                                ),
                                message: "Closing parenthesis and brace should be together for logical expression",
                                node: closeBrace,
                            });
                        }
                    }
                }
            }
        };

        const checkArrowFunctionHandler = (node) => {
            // Check 1: Arrow function with block body - ensure => { are on same line
            if (node.body.type === "BlockStatement") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                const blockOpenBrace = sourceCode.getFirstToken(node.body);

                if (arrowToken && blockOpenBrace) {
                    if (arrowToken.loc.end.line !== blockOpenBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowToken.range[1], blockOpenBrace.range[0]],
                                " ",
                            ),
                            message: "Opening brace should be on the same line as arrow",
                            node: blockOpenBrace,
                        });
                    }
                }
            }

            // Check 1b: Arrow function with expression body (CallExpression) - ensure => and call on same line
            // e.g., (id) => useQuery({...}) not (id) =>\n    useQuery({...})
            // BUT allow parentheses for multiline implicit return: => (\n    call()\n)
            if (node.body.type === "CallExpression") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                if (arrowToken) {
                    const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

                    // If wrapped in parentheses, ensure => ( is on same line
                    // e.g., => (\n    call()\n) is OK, but =>\n    (\n    call()\n) is NOT
                    if (tokenAfterArrow && tokenAfterArrow.value === "(") {
                        if (arrowToken.loc.end.line !== tokenAfterArrow.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [arrowToken.range[1], tokenAfterArrow.range[1]],
                                    " (",
                                ),
                                message: "Opening parenthesis should be on the same line as arrow: => (",
                                node: tokenAfterArrow,
                            });
                        }

                        return;
                    }

                    // Check spacing: should be exactly one space after =>
                    const textAfterArrow = sourceCode.text.slice(arrowToken.range[1], node.body.range[0]);

                    if (textAfterArrow !== " ") {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [arrowToken.range[1], node.body.range[0]],
                                " ",
                            ),
                            message: "Expression body should be on the same line as arrow with single space",
                            node: node.body,
                        });
                    }
                }
            }

            // Check 1c: Arrow function with parenthesized object body - ensure => ({ on same line
            // e.g., () => ({ prop: val }) not () =>\n    ({ prop: val })
            if (node.body.type === "ObjectExpression") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                if (arrowToken) {
                    // Check for parenthesis before the object
                    const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

                    if (tokenAfterArrow && tokenAfterArrow.value === "(") {
                        // It's a parenthesized object: () => ({...})
                        if (arrowToken.loc.end.line !== tokenAfterArrow.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [arrowToken.range[1], tokenAfterArrow.range[1]],
                                    " (",
                                ),
                                message: "Parenthesized object should be on the same line as arrow: => (",
                                node: tokenAfterArrow,
                            });

                            return;
                        }

                        // Also check if ( and { are on same line
                        const openBrace = sourceCode.getFirstToken(node.body);

                        if (tokenAfterArrow.loc.end.line !== openBrace.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [tokenAfterArrow.range[1], openBrace.range[1]],
                                    "{",
                                ),
                                message: "Opening brace should be on the same line as opening paren: ({",
                                node: openBrace,
                            });
                        }
                    }
                }
            }

            // Check 1d: Ensure space before => in arrow functions
            const arrowToken = sourceCode.getFirstToken(
                node,
                (t) => t.value === "=>",
            );

            if (arrowToken) {
                const tokenBeforeArrow = sourceCode.getTokenBefore(arrowToken);

                if (tokenBeforeArrow) {
                    const textBetween = sourceCode.text.slice(tokenBeforeArrow.range[1], arrowToken.range[0]);

                    if (textBetween !== " ") {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeArrow.range[1], arrowToken.range[0]],
                                " ",
                            ),
                            message: "Arrow function should have space before =>",
                            node: arrowToken,
                        });
                    }
                }
            }

            // Check 2: Single destructured param with 2+ properties - ensure ({ and }) together
            const params = node.params;

            if (params.length !== 1) return;

            const param = params[0];

            if (param.type !== "ObjectPattern" || param.properties.length < 2) return;

            // Find opening ( before the param
            const openParen = sourceCode.getTokenBefore(param);

            if (!openParen || openParen.value !== "(") return;

            const openBrace = sourceCode.getFirstToken(param);

            // Check if ( and { are on different lines
            if (openParen.loc.end.line !== openBrace.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], openBrace.range[1]],
                        "{",
                    ),
                    message: "Opening parenthesis and brace should be on the same line for destructured param",
                    node: openBrace,
                });
            }

            const closeBrace = sourceCode.getLastToken(param);
            let closeParen = sourceCode.getTokenAfter(param);

            // Skip trailing comma if present
            if (closeParen && closeParen.value === ",") {
                closeParen = sourceCode.getTokenAfter(closeParen);
            }

            if (closeParen && closeParen.value === ")") {
                if (closeBrace.loc.end.line !== closeParen.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [closeBrace.range[1], closeParen.range[0]],
                            "",
                        ),
                        message: "Closing brace and parenthesis should be on the same line for destructured param",
                        node: closeParen,
                    });
                }
            }
        };

        const checkJSXSpreadAttributeHandler = (node) => {
            // Handle simple spread attributes: {...formMethods} should be on single line
            const { argument } = node;

            // Only collapse simple spreads (single identifier or member expression)
            const isSimpleSpread = argument.type === "Identifier"
                || argument.type === "MemberExpression";

            if (!isSimpleSpread) return;

            const openBrace = sourceCode.getFirstToken(node);
            const closeBrace = sourceCode.getLastToken(node);

            // Check if spread spans multiple lines
            if (openBrace.loc.start.line !== closeBrace.loc.end.line) {
                const argumentText = sourceCode.getText(argument);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[0], closeBrace.range[1]],
                        `{...${argumentText}}`,
                    ),
                    message: "Simple JSX spread attribute should be on a single line",
                    node,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            CallExpression: checkCallExpressionHandler,
            JSXExpressionContainer: checkJSXExpressionContainerHandler,
            JSXSpreadAttribute: checkJSXSpreadAttributeHandler,
        };
    },
    meta: {
        docs: { description: "Enforce opening brackets on same line for function calls and arrow function params" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Simple Call Single Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Simple function calls with an arrow function containing a
 *   simple call expression should be on a single line.
 *
 * ✓ Good:
 *   fn(() => call(arg))
 *   lazy(() => import("./module"))
 *
 * ✗ Bad:
 *   fn(
 *       () => call(arg),
 *   )
 */
const simpleCallSingleLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if a node is simple enough to be on one line
        const isSimpleArgHandler = (argNode) => {
            if (!argNode) return false;

            // Simple literals (strings, numbers, booleans)
            if (argNode.type === "Literal") return true;

            // Simple identifiers
            if (argNode.type === "Identifier") return true;

            // Template literals without expressions
            if (argNode.type === "TemplateLiteral" && argNode.expressions.length === 0) return true;

            return false;
        };

        const isSimpleBodyHandler = (bodyNode) => {
            // Handle ImportExpression (dynamic import)
            if (bodyNode.type === "ImportExpression") {
                return isSimpleArgHandler(bodyNode.source);
            }

            // Handle CallExpression
            if (bodyNode.type === "CallExpression") {
                // Check if it's import() or a simple function call
                const isImport = bodyNode.callee.type === "Import";
                const isSimpleCall = bodyNode.callee.type === "Identifier";
                const isMemberCall = bodyNode.callee.type === "MemberExpression";

                if (!isImport && !isSimpleCall && !isMemberCall) return false;

                // Must have simple arguments (0-2 args, all simple)
                if (bodyNode.arguments.length > 2) return false;

                return bodyNode.arguments.every(isSimpleArgHandler);
            }

            return false;
        };

        return {
            CallExpression(node) {
                const { callee, arguments: args } = node;

                // Only check simple function calls (identifier or member expression)
                if (callee.type !== "Identifier" && callee.type !== "MemberExpression") return;

                // Must have exactly one argument
                if (args.length !== 1) return;

                const arg = args[0];

                // Argument must be arrow function
                if (arg.type !== "ArrowFunctionExpression") return;

                // Arrow function must have no params
                if (arg.params.length !== 0) return;

                const { body } = arg;

                // Body must be a simple call expression or import
                if (!isSimpleBodyHandler(body)) return;

                // Check if the call spans multiple lines
                if (node.loc.start.line === node.loc.end.line) return;

                // Get the text and check if it would be reasonably short on one line
                const calleeText = sourceCode.getText(callee);
                const bodyText = sourceCode.getText(body);
                const simplified = `${calleeText}(() => ${bodyText})`;

                // Only simplify if the result is not too long (max ~120 chars)
                if (simplified.length > 120) return;

                context.report({
                    fix: (fixer) => fixer.replaceText(node, simplified),
                    message: "Simple function call with arrow function should be on a single line",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Simplify simple function calls with arrow function to single line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Single Argument On One Line
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function calls with a single simple argument (literal,
 *   identifier, member expression) should be on one line.
 *
 * ✓ Good:
 *   fn(arg)
 *   getValue("key")
 *   obj.method(value)
 *
 * ✗ Bad:
 *   fn(
 *       arg,
 *   )
 */
const singleArgumentOnOneLine = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const isSimpleArgHandler = (argNode) => {
            if (!argNode) return false;

            // Simple literals (strings, numbers, booleans, null)
            if (argNode.type === "Literal") return true;

            // Simple identifiers
            if (argNode.type === "Identifier") return true;

            // Simple member expressions like obj.prop
            if (argNode.type === "MemberExpression") {
                return argNode.object.type === "Identifier"
                    && argNode.property.type === "Identifier"
                    && !argNode.computed;
            }

            // Template literals without expressions
            if (argNode.type === "TemplateLiteral" && argNode.expressions.length === 0) return true;

            // Unary expressions like !flag, -1
            if (argNode.type === "UnaryExpression") {
                return isSimpleArgHandler(argNode.argument);
            }

            return false;
        };

        return {
            CallExpression(node) {
                const { arguments: args, callee } = node;

                // Only check calls with exactly one argument
                if (args.length !== 1) return;

                const arg = args[0];

                // Only handle simple arguments
                if (!isSimpleArgHandler(arg)) return;

                // Check if the call spans multiple lines
                if (node.loc.start.line === node.loc.end.line) return;

                // Get tokens
                const openParen = sourceCode.getTokenAfter(
                    callee,
                    (token) => token.value === "(",
                );
                const closeParen = sourceCode.getLastToken(node);

                if (!openParen || !closeParen || closeParen.value !== ")") return;

                // Build the fixed version
                const calleeText = sourceCode.getText(callee);
                const argText = sourceCode.getText(arg);
                const fixedCall = `${calleeText}(${argText})`;

                // Only fix if reasonable length
                if (fixedCall.length > 120) return;

                context.report({
                    fix: (fixer) => fixer.replaceText(
                        node,
                        fixedCall,
                    ),
                    message: "Single simple argument should be on one line",
                    node,
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce single simple argument calls to be on one line" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: String Property Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   String property keys should not have extra leading or
 *   trailing spaces inside the quotes.
 *
 * ✓ Good:
 *   { "& a": value }
 *   { "selector": value }
 *
 * ✗ Bad:
 *   { " & a ": value }
 *   { " selector ": value }
 */
const stringPropertySpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Property(node) {
                const { key } = node;

                // Only check string literal keys
                if (key.type !== "Literal" || typeof key.value !== "string") return;

                const keyValue = key.value;

                // Check if the string has leading or trailing spaces
                const trimmed = keyValue.trim();

                if (keyValue !== trimmed && trimmed.length > 0) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(key, `"${trimmed}"`),
                        message: `String property key should not have extra spaces inside quotes: "${trimmed}" not "${keyValue}"`,
                        node: key,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce no extra spaces inside string property keys" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Variable Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Variable names should follow naming conventions: camelCase
 *   for regular variables, UPPER_CASE for constants, and
 *   PascalCase for React components.
 *
 * ✓ Good:
 *   const userName = "John";
 *   const MAX_RETRIES = 3;
 *   const UserProfile = () => <div />;
 *   const useCustomHook = () => {};
 *
 * ✗ Bad:
 *   const user_name = "John";
 *   const maxretries = 3;
 *   const userProfile = () => <div />;
 */
const variableNamingConvention = {
    create(context) {
        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

        const hookRegex = /^use[A-Z][a-zA-Z0-9]*$/;

        const constantRegex = /^[A-Z][A-Z0-9_]*$/;

        const allowedIdentifiers = [
            "ArrowFunctionExpression", "CallExpression", "FunctionDeclaration", "FunctionExpression",
            "Property", "VariableDeclarator", "JSXElement", "JSXOpeningElement", "ReturnStatement",
            "SwitchCase", "SwitchStatement", "ObjectExpression", "ObjectPattern", "BlockStatement",
            "IfStatement", "Identifier", "RestElement", "AssignmentPattern", "ArrayPattern",
            "MemberExpression", "JSXText", "JSXAttribute", "JSXExpressionContainer",
            // Built-in JavaScript globals
            "Function", "Object", "Array", "String", "Number", "Boolean", "Symbol", "BigInt",
            "Date", "RegExp", "Error", "Map", "Set", "WeakMap", "WeakSet", "Promise",
        ];

        // Check if this is a MUI styled component: styled(Component)(...)
        const isStyledComponentHandler = (init) => {
            if (!init || init.type !== "CallExpression") return false;

            const { callee } = init;

            // Pattern: styled(Component)(...) - callee is CallExpression styled(Component)
            if (callee.type === "CallExpression") {
                const innerCallee = callee.callee;

                // Check if inner callee is "styled" identifier
                if (innerCallee.type === "Identifier" && innerCallee.name === "styled") {
                    return true;
                }

                // Check if inner callee is member expression like emotion's styled.div
                if (innerCallee.type === "MemberExpression" && innerCallee.object.name === "styled") {
                    return true;
                }
            }

            return false;
        };

        // Check if this CallExpression is a styled() call
        const isStyledCallHandler = (node) => {
            if (node.type !== "CallExpression") return false;

            const { callee } = node;

            // Direct styled(Component) call
            if (callee.type === "Identifier" && callee.name === "styled") {
                return true;
            }

            return false;
        };

        const isFunctionTypeHandler = (init) => {
            if (!init) return false;

            if (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") {
                return true;
            }

            if (init.type === "CallExpression" && init.callee) {
                const calleeName = init.callee.name || (init.callee.property && init.callee.property.name);
                const wrapperFunctions = ["memo", "forwardRef", "lazy", "createContext"];

                return wrapperFunctions.includes(calleeName);
            }

            return false;
        };

        const isComponentByNamingHandler = (node) => {
            if (!node.init) return false;

            const name = node.id.name;

            // PascalCase naming indicates a component
            if (/^[A-Z]/.test(name) && isFunctionTypeHandler(node.init)) {
                return true;
            }

            return false;
        };

        const isHookFunctionHandler = (node) => {
            if (!node.init) return false;

            const name = node.id.name;

            return name.startsWith("use") && /^use[A-Z]/.test(name) && isFunctionTypeHandler(node.init);
        };

        // Common component property names that should allow PascalCase
        const componentPropertyNames = [
            "Icon",
            "Component",
            "FormComponent",
            "Layout",
            "Wrapper",
            "Container",
            "Provider",
        ];

        const checkPatternHandler = (node, typeLabel) => {
            if (node.type === "Identifier") {
                const name = node.name;

                if (name.startsWith("_") || constantRegex.test(name) || allowedIdentifiers.includes(name)) return;

                // Allow component property names when destructuring (e.g., { Icon } from map callback)
                if (componentPropertyNames.includes(name)) return;

                if (!camelCaseRegex.test(name)) {
                    context.report({
                        message: `${typeLabel} "${name}" should be camelCase`,
                        node,
                    });
                }
            } else if (node.type === "ObjectPattern") {
                node.properties.forEach((prop) => {
                    if (prop.type === "Property") {
                        checkPatternHandler(
                            prop.value,
                            typeLabel,
                        );
                    }
                    else if (prop.type === "RestElement") {
                        checkPatternHandler(
                            prop.argument,
                            typeLabel,
                        );
                    }
                });
            } else if (node.type === "ArrayPattern") {
                node.elements.forEach((elem) => {
                    if (elem) {
                        checkPatternHandler(
                            elem,
                            typeLabel,
                        );
                    }
                });
            } else if (node.type === "AssignmentPattern") {
                checkPatternHandler(
                    node.left,
                    typeLabel,
                );
            }
            else if (node.type === "RestElement") {
                checkPatternHandler(
                    node.argument,
                    typeLabel,
                );
            }
        };

        const checkVariableDeclaratorHandler = (node) => {
            if (node.id.type !== "Identifier") {
                checkPatternHandler(
                    node.id,
                    "Variable",
                );

                return;
            }

            const name = node.id.name;

            // Enforce PascalCase for styled components: const StyledCard = styled(Card)(...)
            if (isStyledComponentHandler(node.init)) {
                if (!pascalCaseRegex.test(name)) {
                    context.report({
                        message: `Styled component "${name}" should be PascalCase (e.g., StyledCard instead of styledCard)`,
                        node: node.id,
                    });
                }

                return;
            }

            if (name.startsWith("_") || constantRegex.test(name) || isComponentByNamingHandler(node)) return;

            if (isHookFunctionHandler(node)) {
                if (!hookRegex.test(name)) {
                    context.report({
                        message: `Hook "${name}" should start with "use" followed by PascalCase (e.g., useEventsList)`,
                        node: node.id,
                    });
                }

                return;
            }

            // Allow PascalCase for data arrays and config objects (e.g., SidebarData, Routes)
            // These typically hold configuration or data that includes component references
            const dataPatterns = [
                /^[A-Z][a-zA-Z]*Data$/,
                /^[A-Z][a-zA-Z]*Config$/,
                /^Routes$/,
            ];

            if (dataPatterns.some((pattern) => pattern.test(name))) {
                // Only allow if initialized with array, object, or function call
                if (node.init && (node.init.type === "ArrayExpression" || node.init.type === "ObjectExpression" || node.init.type === "CallExpression")) {
                    return;
                }
            }

            if (!camelCaseRegex.test(name)) {
                context.report({
                    message: `Variable "${name}" should be camelCase (e.g., userCookie instead of UserCookie)`,
                    node: node.id,
                });
            }
        };

        const checkPropertyHandler = (node) => {
            if (node.computed || node.key.type !== "Identifier") return;

            const name = node.key.name;

            if (name.startsWith("_") || constantRegex.test(name) || allowedIdentifiers.includes(name)) return;

            // Allow PascalCase for properties that hold component references
            // e.g., Icon: AdminPanelSettingsIcon, FormComponent: UpdateEventForm
            if (node.value && node.value.type === "Identifier") {
                const valueName = node.value.name;

                // If value is PascalCase (component reference), allow PascalCase property name
                if (pascalCaseRegex.test(valueName) && pascalCaseRegex.test(name)) {
                    return;
                }
            }

            // Allow common component property names
            if (componentPropertyNames.includes(name)) return;

            // Allow MUI theme component names (start with Mui)
            if (name.startsWith("Mui")) return;

            if (!camelCaseRegex.test(name)) {
                context.report({
                    message: `Property "${name}" should be camelCase`,
                    node: node.key,
                });
            }
        };

        const checkFunctionHandlerParamsHandler = (node) => {
            node.params.forEach((param) => checkPatternHandler(
                param,
                "Parameter",
            ));
        };

        const checkCallExpressionHandlerArguments = (node) => {
            // Skip argument checking for styled() calls - they accept PascalCase components
            if (isStyledCallHandler(node)) return;

            node.arguments.forEach((arg) => {
                if (arg.type === "Identifier") {
                    const name = arg.name;

                    if (name.startsWith("_") || constantRegex.test(name) || allowedIdentifiers.includes(name)) return;

                    // Allow component property names as arguments (e.g., Icon, Component)
                    if (componentPropertyNames.includes(name)) return;

                    if (!camelCaseRegex.test(name)) {
                        context.report({
                            message: `Argument "${name}" should be camelCase`,
                            node: arg,
                        });
                    }
                }
            });
        };

        return {
            ArrowFunctionExpression: checkFunctionHandlerParamsHandler,
            CallExpression: checkCallExpressionHandlerArguments,
            FunctionDeclaration: checkFunctionHandlerParamsHandler,
            FunctionExpression: checkFunctionHandlerParamsHandler,
            Property: checkPropertyHandler,
            VariableDeclarator: checkVariableDeclaratorHandler,
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions: camelCase for variables/properties/params/arguments, PascalCase for components, useXxx for hooks" },
        schema: [],
        type: "suggestion",
    },
};

export default {
    meta: {
        name: packageJson.name,
        version: packageJson.version,
    },
    rules: {
        // Array rules
        "array-items-per-line": arrayItemsPerLine,
        "array-objects-on-new-lines": arrayObjectsOnNewLines,

        // Arrow function rules
        "arrow-function-block-body": arrowFunctionBlockBody,
        "arrow-function-simple-jsx": arrowFunctionSimpleJsx,
        "arrow-function-simplify": arrowFunctionSimplify,
        "curried-arrow-same-line": curriedArrowSameLine,

        // Assignment rules
        "assignment-value-same-line": assignmentValueSameLine,

        // Block statement rules
        "block-statement-newlines": blockStatementNewlines,

        // Comment rules
        "comment-spacing": commentSpacing,

        // Function rules
        "function-call-spacing": functionCallSpacing,
        "function-naming-convention": functionNamingConvention,
        "function-params-per-line": functionParamsPerLine,

        // Hook rules
        "hook-callback-format": hookCallbackFormat,
        "hook-deps-per-line": hookDepsPerLine,

        // If statement rules
        "if-statement-format": ifStatementFormat,
        "multiline-if-conditions": multilineIfConditions,

        // Import/Export rules
        "absolute-imports-only": absoluteImportsOnly,
        "export-format": exportFormat,
        "import-format": importFormat,
        "import-source-spacing": importSourceSpacing,
        "index-export-style": indexExportStyle,
        "module-index-exports": moduleIndexExports,

        // JSX rules
        "jsx-children-on-new-line": jsxChildrenOnNewLine,
        "jsx-closing-bracket-spacing": jsxClosingBracketSpacing,
        "jsx-element-child-new-line": jsxElementChildNewLine,
        "jsx-logical-expression-simplify": jsxLogicalExpressionSimplify,
        "jsx-parentheses-position": jsxParenthesesPosition,
        "jsx-prop-naming-convention": jsxPropNamingConvention,
        "jsx-simple-element-one-line": jsxSimpleElementOneLine,
        "jsx-string-value-trim": jsxStringValueTrim,
        "jsx-ternary-format": jsxTernaryFormat,

        // Member expression rules
        "member-expression-bracket-spacing": memberExpressionBracketSpacing,

        // Function arguments formatting rule
        "function-arguments-format": functionArgumentsFormat,

        // Nested call rules
        "nested-call-closing-brackets": nestedCallClosingBrackets,

        // No empty lines rules
        "no-empty-lines-in-function-calls": noEmptyLinesInFunctionCalls,
        "no-empty-lines-in-function-params": noEmptyLinesInFunctionParams,
        "no-empty-lines-in-jsx": noEmptyLinesInJsx,
        "no-empty-lines-in-objects": noEmptyLinesInObjects,
        "no-empty-lines-in-switch-cases": noEmptyLinesInSwitchCases,

        // Object property rules
        "object-property-per-line": objectPropertyPerLine,
        "object-property-value-brace": objectPropertyValueBrace,
        "object-property-value-format": objectPropertyValueFormat,

        // Opening brackets rules
        "opening-brackets-same-line": openingBracketsSameLine,

        // Simple call/Single argument rules
        "simple-call-single-line": simpleCallSingleLine,
        "single-argument-on-one-line": singleArgumentOnOneLine,

        // String property rules
        "string-property-spacing": stringPropertySpacing,

        // Variable rules
        "variable-naming-convention": variableNamingConvention,
    },
};
