import {
    DEFAULT_MAX_CLASS_COUNT,
    DEFAULT_MAX_CLASS_LENGTH,
    getClassOrder,
    isClassRelated,
    looksLikeTailwindClasses,
    needsReordering,
    sortTailwindClasses,
} from "../utils/tailwind.js";

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

        // Check if an argument is simple
        const isSimpleArgHandler = (node) => {
            if (!node) return false;
            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            return false;
        };

        // Check if expression is simple (identifier, literal, member expression chain, or simple function call)
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return true;

            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;

            // Handle ChainExpression (optional chaining like user?.name)
            if (expr.type === "ChainExpression") {
                return isSimpleExpressionHandler(expr.expression);
            }

            if (expr.type === "MemberExpression") {
                // Allow nested member expressions like row.original.currency or row[field]
                let current = expr;

                while (current.type === "MemberExpression") {
                    // Allow computed access only if property is simple (identifier or literal)
                    if (current.computed) {
                        if (current.property.type !== "Identifier" && current.property.type !== "Literal") {
                            return false;
                        }
                    } else if (current.property.type !== "Identifier") {
                        return false;
                    }

                    current = current.object;
                }

                // Handle ChainExpression at the end of the chain
                if (current.type === "ChainExpression") {
                    return isSimpleExpressionHandler(current.expression);
                }

                return current.type === "Identifier";
            }

            // Allow simple function calls with 0-1 simple arguments
            if (expr.type === "CallExpression") {
                const { callee } = expr;
                const isSimpleCallee = callee.type === "Identifier" ||
                    (callee.type === "MemberExpression" &&
                     callee.object.type === "Identifier" &&
                     callee.property.type === "Identifier");

                if (!isSimpleCallee) return false;

                if (expr.arguments.length === 0) return true;
                if (expr.arguments.length === 1 && isSimpleArgHandler(expr.arguments[0])) return true;

                return false;
            }

            // Allow simple LogicalExpression (2 operands with simple left/right)
            if (expr.type === "LogicalExpression") {
                // Count operands - if more than 2, not simple
                const countOperands = (n) => {
                    if (n.type === "LogicalExpression") {
                        return countOperands(n.left) + countOperands(n.right);
                    }

                    return 1;
                };

                if (countOperands(expr) > 2) return false;

                // Check if left and right are simple
                const isSimpleSide = (n) => {
                    if (n.type === "Identifier") return true;
                    if (n.type === "Literal") return true;
                    if (n.type === "MemberExpression") return isSimpleExpressionHandler(n);
                    if (n.type === "ChainExpression" && n.expression) return isSimpleSide(n.expression);

                    return false;
                };

                return isSimpleSide(expr.left) && isSimpleSide(expr.right);
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

        // Check if an argument is simple
        const isSimpleArgHandler = (node) => {
            if (!node) return false;
            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            return false;
        };

        // Check if expression is simple (identifier, literal, member expression chain, or simple function call)
        const isSimpleExpressionHandler = (expr) => {
            if (!expr) return true;

            if (expr.type === "Identifier") return true;
            if (expr.type === "Literal") return true;

            // Handle ChainExpression (optional chaining like user?.name)
            if (expr.type === "ChainExpression") {
                return isSimpleExpressionHandler(expr.expression);
            }

            if (expr.type === "MemberExpression") {
                // Allow nested member expressions like row.original.currency or row[field]
                let current = expr;

                while (current.type === "MemberExpression") {
                    // Allow computed access only if property is simple (identifier or literal)
                    if (current.computed) {
                        if (current.property.type !== "Identifier" && current.property.type !== "Literal") {
                            return false;
                        }
                    } else if (current.property.type !== "Identifier") {
                        return false;
                    }

                    current = current.object;
                }

                // Handle ChainExpression at the end of the chain
                if (current.type === "ChainExpression") {
                    return isSimpleExpressionHandler(current.expression);
                }

                return current.type === "Identifier";
            }

            // Allow simple function calls with 0-1 simple arguments
            if (expr.type === "CallExpression") {
                const { callee } = expr;
                const isSimpleCallee = callee.type === "Identifier" ||
                    (callee.type === "MemberExpression" &&
                     callee.object.type === "Identifier" &&
                     callee.property.type === "Identifier");

                if (!isSimpleCallee) return false;

                if (expr.arguments.length === 0) return true;
                if (expr.arguments.length === 1 && isSimpleArgHandler(expr.arguments[0])) return true;

                return false;
            }

            // Allow simple LogicalExpression (2 operands with simple left/right)
            if (expr.type === "LogicalExpression") {
                // Count operands - if more than 2, not simple
                const countOperands = (n) => {
                    if (n.type === "LogicalExpression") {
                        return countOperands(n.left) + countOperands(n.right);
                    }

                    return 1;
                };

                if (countOperands(expr) > 2) return false;

                // Check if left and right are simple
                const isSimpleSide = (n) => {
                    if (n.type === "Identifier") return true;
                    if (n.type === "Literal") return true;
                    if (n.type === "MemberExpression") return isSimpleExpressionHandler(n);
                    if (n.type === "ChainExpression" && n.expression) return isSimpleSide(n.expression);

                    return false;
                };

                return isSimpleSide(expr.left) && isSimpleSide(expr.right);
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

        // Check if a node is wrapped in parentheses
        const isWrappedInParensHandler = (exprNode) => {
            const tokenBefore = sourceCode.getTokenBefore(exprNode);
            const tokenAfter = sourceCode.getTokenAfter(exprNode);

            return tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        // Get the text including surrounding parentheses if present
        const getTextWithParensHandler = (exprNode) => {
            const text = sourceCode.getText(exprNode);

            if (isWrappedInParensHandler(exprNode)) {
                return `(${text})`;
            }

            return text;
        };

        const checkLogicalExpressionHandler = (node) => {
            if (node.operator !== "&&") return;

            const {
                left,
                right,
            } = node;

            // Right side must be JSX
            if (right.type !== "JSXElement" && right.type !== "JSXFragment") return;

            // Get base indentation
            const baseIndent = sourceCode.lines[node.loc.start.line - 1].match(/^\s*/)[0];
            const contentIndent = baseIndent + "    ";

            // Check if right side is single-line
            const rightIsSimple = right.loc.start.line === right.loc.end.line;

            // Get text preserving parentheses
            const leftText = getTextWithParensHandler(left);
            const rightText = sourceCode.getText(right);

            // Case 1: Both simple - entire expression on one line
            if (rightIsSimple && left.loc.start.line === left.loc.end.line) {
                if (node.loc.start.line !== node.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(
                            node,
                            `${leftText} && ${rightText}`,
                        ),
                        message: "Simple logical expression with single-line JSX should be on one line",
                        node,
                    });
                }

                return;
            }

            // Case 2: Complex JSX - check formatting
            // Format should be: {condition && (
            //     <Complex />
            // )}
            if (!rightIsSimple) {
                const andToken = sourceCode.getTokenAfter(
                    left,
                    (token) => token.value === "&&",
                );

                if (!andToken) return;

                const tokenAfterAnd = sourceCode.getTokenAfter(andToken);

                // && ( should be on same line as condition
                if (tokenAfterAnd && tokenAfterAnd.value === "(") {
                    // Check for empty lines after (
                    const jsxStart = sourceCode.getTokenAfter(tokenAfterAnd);

                    if (jsxStart && jsxStart.loc.start.line - tokenAfterAnd.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenAfterAnd.range[1], jsxStart.range[0]],
                                "\n" + contentIndent,
                            ),
                            message: "No empty lines after '(' in logical expression",
                            node: jsxStart,
                        });
                    }

                    // Check for empty lines before )
                    const closeParen = sourceCode.getTokenAfter(right);

                    if (closeParen && closeParen.value === ")") {
                        if (closeParen.loc.start.line - right.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [right.range[1], closeParen.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "No empty lines before ')' in logical expression",
                                node: closeParen,
                            });
                        }
                    }
                }
            }
        };

        return { LogicalExpression: checkLogicalExpressionHandler };
    },
    meta: {
        docs: { description: "Simplify logical expressions in JSX when right side is single-line, and check formatting for complex JSX" },
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

        // Check if an argument is simple (identifier, literal, or simple member expression)
        const isSimpleArgHandler = (node) => {
            if (!node) return false;
            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            return false;
        };

        // Check if an expression is simple (identifier, literal, member expression, or simple function call)
        const isSimpleExpressionHandler = (node) => {
            if (!node) return false;

            if (node.type === "Identifier") return true;
            if (node.type === "Literal") return true;
            if (node.type === "MemberExpression") {
                // Allow simple member expressions like obj.prop
                return node.object.type === "Identifier" && node.property.type === "Identifier";
            }

            // Allow simple function calls with 0-1 simple arguments
            if (node.type === "CallExpression") {
                // Check callee is simple (identifier or member expression)
                const { callee } = node;
                const isSimpleCallee = callee.type === "Identifier" ||
                    (callee.type === "MemberExpression" &&
                     callee.object.type === "Identifier" &&
                     callee.property.type === "Identifier");

                if (!isSimpleCallee) return false;

                // Allow 0-1 arguments, and the argument must be simple
                if (node.arguments.length === 0) return true;
                if (node.arguments.length === 1 && isSimpleArgHandler(node.arguments[0])) return true;

                return false;
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
 * Rule: className Dynamic At End
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce that dynamic expressions in className template literals
 *   are placed at the end, after all static class names.
 *   Uses smart detection: triggers for className attributes, variables
 *   with "class" in name, or any string that looks like Tailwind classes.
 *
 * ✓ Good:
 *   className={`flex items-center ${className}`}
 *   const buttonClasses = `flex items-center ${className}`;
 *
 * ✗ Bad:
 *   className={`${className} flex items-center`}
 *   const buttonClasses = `${className} flex items-center`;
 */
const classNameDynamicAtEnd = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Get static content from template literal for detection
        const getStaticContent = (templateLiteral) => templateLiteral.quasis
            .map((q) => q.value.raw)
            .join(" ")
            .trim();

        // Check and report template literal with dynamic expressions not at end
        const checkTemplateLiteralHandler = (templateLiteral, reportNode, varName) => {
            const { expressions, quasis } = templateLiteral;

            if (expressions.length === 0) return;

            // Smart detection: check if this looks like class content
            const staticContent = getStaticContent(templateLiteral);

            if (!isClassRelated(varName, staticContent)) return;

            // Check if there are static classes after any expression
            for (let i = 0; i < expressions.length; i += 1) {
                const quasiAfter = quasis[i + 1];

                if (quasiAfter) {
                    const textAfter = quasiAfter.value.raw.trim();

                    if (textAfter.length > 0) {
                        context.report({
                            fix: (fixer) => {
                                const staticClasses = [];
                                const dynamicExprs = [];

                                quasis.forEach((quasi) => {
                                    const classes = quasi.value.raw.trim();

                                    if (classes) staticClasses.push(classes);
                                });

                                expressions.forEach((expr) => {
                                    dynamicExprs.push(sourceCode.getText(expr));
                                });

                                // Sort static classes using Tailwind order
                                const sortedStatic = sortTailwindClasses(staticClasses.join(" "));
                                const dynamicPart = dynamicExprs.map((expr) => `\${${expr}}`).join(" ");
                                const newValue = sortedStatic
                                    ? `\`${sortedStatic} ${dynamicPart}\``
                                    : `\`${dynamicPart}\``;

                                return fixer.replaceText(templateLiteral, newValue);
                            },
                            message: "Dynamic expressions (${...}) must be at the end of class strings. Use: `static-class ${dynamic}` not `${dynamic} static-class`",
                            node: reportNode || expressions[i],
                        });

                        return;
                    }
                }
            }
        };

        return {
            // Check className JSX attribute
            JSXAttribute(node) {
                if (!node.name || node.name.name !== "className") return;

                if (node.value
                    && node.value.type === "JSXExpressionContainer"
                    && node.value.expression.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.value.expression, null, "className");
                }
            },

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.init, node.init, node.id.name);
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce dynamic expressions in className are placed at the end" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: className No Extra Spaces
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Disallow multiple consecutive spaces and leading/trailing spaces
 *   in className values. Uses smart detection: checks objects/returns
 *   if variable name contains "class" OR if values look like Tailwind.
 *
 * ✓ Good:
 *   className="flex items-center gap-4"
 *   const variants = { primary: "bg-blue-500 text-white" };
 *   return "border-error text-error focus:border-error";
 *
 * ✗ Bad:
 *   className="flex  items-center   gap-4"
 *   const variants = { primary: "bg-blue-500  text-white" };
 *   return "border-error  text-error   focus:border-error";
 */
const classNameNoExtraSpaces = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check and fix string literal
        const checkStringLiteralHandler = (node, value, varName) => {
            // Smart detection
            if (!isClassRelated(varName, value)) return;

            // Skip multiline format (newline at start = intentional multiline)
            if (/^\n/.test(value)) return;

            if (/  +/.test(value)) {
                const raw = sourceCode.getText(node);
                const quote = raw[0];
                const fixed = value.replace(/  +/g, " ");

                context.report({
                    fix: (fixer) => fixer.replaceText(node, `${quote}${fixed}${quote}`),
                    message: "Class string should not have multiple consecutive spaces",
                    node,
                });
            }
        };

        // Check and fix template literal
        const checkTemplateLiteralHandler = (templateLiteral, varName) => {
            const { quasis } = templateLiteral;

            // Smart detection: get static content for checking
            const staticContent = quasis.map((q) => q.value.raw).join(" ").trim();

            if (!isClassRelated(varName, staticContent)) return;

            // Check first quasi for leading space
            const firstQuasi = quasis[0];

            // Skip multiline format (newline after backtick = intentional multiline)
            const isMultilineFormat = firstQuasi && /^\n/.test(firstQuasi.value.raw);

            if (!isMultilineFormat && firstQuasi && /^\s+/.test(firstQuasi.value.raw)) {
                context.report({
                    fix: (fixer) => {
                        const fullText = sourceCode.getText(templateLiteral);
                        const fixedText = fullText.replace(/^`\s+/, "`");

                        return fixer.replaceText(templateLiteral, fixedText);
                    },
                    message: "Class string should not have leading whitespace in template literal",
                    node: firstQuasi,
                });

                return;
            }

            // Check last quasi for trailing space
            const lastQuasi = quasis[quasis.length - 1];

            if (!isMultilineFormat && lastQuasi && /\s+$/.test(lastQuasi.value.raw)) {
                context.report({
                    fix: (fixer) => {
                        const fullText = sourceCode.getText(templateLiteral);
                        const fixedText = fullText.replace(/\s+`$/, "`");

                        return fixer.replaceText(templateLiteral, fixedText);
                    },
                    message: "Class string should not have trailing whitespace in template literal",
                    node: lastQuasi,
                });

                return;
            }

            // Check for multiple consecutive spaces in any quasi (skip multiline format)
            if (!isMultilineFormat) {
                quasis.forEach((quasi) => {
                    const value = quasi.value.raw;

                    if (/  +/.test(value)) {
                        context.report({
                            fix: (fixer) => {
                                const fullText = sourceCode.getText(templateLiteral);
                                const fixedText = fullText.replace(/  +/g, " ");

                                return fixer.replaceText(templateLiteral, fixedText);
                            },
                            message: "Class string should not have multiple consecutive spaces",
                            node: quasi,
                        });
                    }
                });
            }
        };

        return {
            // Check className JSX attribute
            JSXAttribute(node) {
                if (!node.name || node.name.name !== "className") return;

                if (node.value && node.value.type === "Literal" && typeof node.value.value === "string") {
                    checkStringLiteralHandler(node.value, node.value.value, "className");
                }

                if (node.value
                    && node.value.type === "JSXExpressionContainer"
                    && node.value.expression.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.value.expression, "className");
                }
            },

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                const varName = node.id.name;

                // Check string literal
                if (node.init && node.init.type === "Literal" && typeof node.init.value === "string") {
                    checkStringLiteralHandler(node.init, node.init.value, varName);
                }

                // Check template literal
                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.init, varName);
                }

                // Check object with class values
                if (node.init && node.init.type === "ObjectExpression") {
                    node.init.properties.forEach((prop) => {
                        if (prop.type !== "Property") return;

                        if (prop.value && prop.value.type === "Literal" && typeof prop.value.value === "string") {
                            const value = prop.value.value;

                            // Check if variable name suggests classes OR value looks like Tailwind
                            if (!isClassRelated(varName, value)) return;

                            const raw = sourceCode.getText(prop.value);
                            const quote = raw[0];

                            // Check for leading whitespace
                            if (/^\s+/.test(value)) {
                                const fixed = value.trimStart();

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${fixed}${quote}`),
                                    message: "Class string should not have leading whitespace",
                                    node: prop.value,
                                });

                                return;
                            }

                            // Check for trailing whitespace
                            if (/\s+$/.test(value)) {
                                const fixed = value.trimEnd();

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${fixed}${quote}`),
                                    message: "Class string should not have trailing whitespace",
                                    node: prop.value,
                                });

                                return;
                            }

                            // Check for multiple consecutive spaces
                            if (/  +/.test(value)) {
                                const fixed = value.replace(/  +/g, " ");

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${fixed}${quote}`),
                                    message: "Class string should not have multiple consecutive spaces",
                                    node: prop.value,
                                });
                            }
                        }

                        if (prop.value && prop.value.type === "TemplateLiteral") {
                            // For template literals, extract static content to check for Tailwind classes
                            const staticContent = prop.value.quasis.map((q) => q.value.raw).join(" ").trim();

                            if (isClassRelated(varName, staticContent)) {
                                checkTemplateLiteralHandler(prop.value, varName);
                            }
                        }
                    });
                }
            },

            // Check return statements with Tailwind class values
            ReturnStatement(node) {
                if (!node.argument) return;

                if (node.argument.type === "Literal" && typeof node.argument.value === "string") {
                    checkStringLiteralHandler(node.argument, node.argument.value, "return");
                }

                if (node.argument.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.argument, "return");
                }
            },
        };
    },
    meta: {
        docs: { description: "Disallow extra/leading/trailing spaces in className values; smart detection for objects with Tailwind values and return statements" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: className Order
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce Tailwind CSS class ordering in class string variables,
 *   object properties, and return statements. This rule complements
 *   tailwindcss/classnames-order by handling areas it doesn't cover.
 *   Uses smart detection: checks if values look like Tailwind classes.
 *
 * Coverage Division:
 *   - tailwindcss/classnames-order: Handles JSX className attributes
 *   - classname-order (this rule): Handles variables, object properties,
 *     and return statements containing Tailwind class strings
 *
 * Both rules should be enabled together for complete coverage.
 *
 * ✓ Good:
 *   const variants = { primary: "bg-blue-500 hover:bg-blue-600" };
 *   return "border-error text-error focus:border-error";
 *
 * ✗ Bad:
 *   const variants = { primary: "hover:bg-blue-600 bg-blue-500" };
 *   return "focus:border-error text-error border-error";
 */
const classNameOrder = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check and fix string literal ordering
        const checkStringOrderHandler = (node, value, varName) => {
            // Smart detection
            if (!isClassRelated(varName, value)) return;

            if (!needsReordering(value)) return;

            const sorted = sortTailwindClasses(value);
            const raw = sourceCode.getText(node);
            const quote = raw[0];

            context.report({
                fix: (fixer) => fixer.replaceText(node, `${quote}${sorted}${quote}`),
                message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                node,
            });
        };

        // Check template literal ordering (only static parts)
        const checkTemplateLiteralOrderHandler = (templateLiteral, varName) => {
            const { expressions, quasis } = templateLiteral;

            // Get static content for detection
            const staticContent = quasis.map((q) => q.value.raw).join(" ").trim();

            if (!isClassRelated(varName, staticContent)) return;

            // Check if any quasi needs reordering
            let needsFix = false;

            for (const quasi of quasis) {
                const value = quasi.value.raw.trim();

                if (value && needsReordering(value)) {
                    needsFix = true;
                    break;
                }
            }

            if (!needsFix) return;

            context.report({
                fix: (fixer) => {
                    // Rebuild the template literal with sorted classes
                    let result = "`";

                    for (let i = 0; i < quasis.length; i += 1) {
                        const quasi = quasis[i];
                        const raw = quasi.value.raw;

                        // Sort the static part while preserving leading/trailing whitespace
                        const leadingSpace = raw.match(/^\s*/)[0];
                        const trailingSpace = raw.match(/\s*$/)[0];
                        const trimmed = raw.trim();
                        const isMultilineQuasi = /\n/.test(trimmed);
                        let sorted;

                        if (isMultilineQuasi && trimmed) {
                            // Preserve multiline format: sort classes, rejoin without empty lines
                            const lines = raw.split("\n");
                            const classesFromLines = lines.map((l) => l.trim()).filter(Boolean);
                            const sortedClasses = [...classesFromLines].sort((a, b) => {
                                const orderA = getClassOrder(a);
                                const orderB = getClassOrder(b);

                                if (orderA !== orderB) return orderA - orderB;

                                return a.localeCompare(b);
                            });

                            // Detect indent from first non-empty line
                            const indentLine = lines.find((l) => l.trim().length > 0);
                            const lineIndent = indentLine ? indentLine.match(/^\s*/)[0] : "";

                            // Rebuild: newline + sorted classes + trailing newline with base indent only
                            const lastLine = lines[lines.length - 1];
                            const baseIndentMatch = lastLine.match(/^\s*/);
                            const trailingIndent = baseIndentMatch ? baseIndentMatch[0] : "";

                            result += "\n" + sortedClasses.map((cls) => lineIndent + cls).join("\n") + "\n" + trailingIndent;
                        } else {
                            sorted = trimmed ? sortTailwindClasses(trimmed) : "";
                            result += leadingSpace + sorted + trailingSpace;
                        }

                        // Add expression if not the last quasi
                        if (i < expressions.length) {
                            result += "${" + sourceCode.getText(expressions[i]) + "}";
                        }
                    }

                    result += "`";

                    return fixer.replaceText(templateLiteral, result);
                },
                message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                node: templateLiteral,
            });
        };

        return {
            // Note: JSX className attributes are NOT checked here
            // They should be handled by tailwindcss/classnames-order

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                const varName = node.id.name;

                // Check string literal
                if (node.init && node.init.type === "Literal" && typeof node.init.value === "string") {
                    checkStringOrderHandler(node.init, node.init.value, varName);
                }

                // Check template literal
                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralOrderHandler(node.init, varName);
                }

                // Check object with class values
                if (node.init && node.init.type === "ObjectExpression") {
                    node.init.properties.forEach((prop) => {
                        if (prop.type !== "Property") return;

                        if (prop.value && prop.value.type === "Literal" && typeof prop.value.value === "string") {
                            const value = prop.value.value;

                            // Check if variable name suggests classes OR value looks like Tailwind
                            if (!isClassRelated(varName, value)) return;

                            if (needsReordering(value)) {
                                const sorted = sortTailwindClasses(value);
                                const raw = sourceCode.getText(prop.value);
                                const quote = raw[0];

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop.value, `${quote}${sorted}${quote}`),
                                    message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                                    node: prop.value,
                                });
                            }
                        }

                        if (prop.value && prop.value.type === "TemplateLiteral") {
                            // For template literals, extract static content to check for Tailwind classes
                            const staticContent = prop.value.quasis.map((q) => q.value.raw).join(" ").trim();

                            if (isClassRelated(varName, staticContent)) {
                                checkTemplateLiteralOrderHandler(prop.value, varName);
                            }
                        }
                    });
                }
            },

            // Check return statements with Tailwind class values
            ReturnStatement(node) {
                if (!node.argument) return;

                if (node.argument.type === "Literal" && typeof node.argument.value === "string") {
                    const value = node.argument.value;

                    if (looksLikeTailwindClasses(value) && needsReordering(value)) {
                        const sorted = sortTailwindClasses(value);
                        const raw = sourceCode.getText(node.argument);
                        const quote = raw[0];

                        context.report({
                            fix: (fixer) => fixer.replaceText(node.argument, `${quote}${sorted}${quote}`),
                            message: "Tailwind classes should follow recommended order: layout (flex, grid) → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → states (hover, focus)",
                            node: node.argument,
                        });
                    }
                }

                if (node.argument.type === "TemplateLiteral") {
                    checkTemplateLiteralOrderHandler(node.argument, "return");
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce Tailwind CSS class ordering in class strings; smart detection for objects with Tailwind values and return statements" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: className Multiline
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce that long className strings are broken into multiple
 *   lines, with each class on its own line. Triggers when either
 *   the class count or string length exceeds the threshold.
 *   Uses smart detection: checks objects/returns if values look
 *   like Tailwind classes.
 *
 * ✓ Good:
 *   const variants = {
 *       primary: `
 *           bg-primary
 *           text-white
 *           hover:bg-primary-dark
 *       `,
 *   };
 *   return `
 *       border-error
 *       text-error
 *       focus:border-error
 *   `;
 *
 * ✗ Bad:
 *   const variants = { primary: "bg-primary text-white hover:bg-primary-dark focus:ring-2" };
 *   return "border-error text-error placeholder-error/50 focus:border-error";
 */
const classNameMultiline = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxClassCount = options.maxClassCount ?? DEFAULT_MAX_CLASS_COUNT;
        const maxLength = options.maxLength ?? DEFAULT_MAX_CLASS_LENGTH;

        // Get the leading whitespace of the line where a node starts
        const getLineIndent = (node) => {
            const allText = sourceCode.getText();
            const lines = allText.split("\n");
            const line = lines[node.loc.start.line - 1];

            if (!line) return "";

            const match = line.match(/^(\s*)/);

            return match ? match[1] : "";
        };

        // Build multiline template literal from classes and dynamic expressions
        const buildMultilineTemplate = (classes, dynamicExprs, baseIndent) => {
            const indent = baseIndent + "    ";
            const lines = classes.map((cls) => `${indent}${cls}`);

            dynamicExprs.forEach((expr) => {
                lines.push(`${indent}\${${expr}}`);
            });

            return `\`\n${lines.join("\n")}\n${baseIndent}\``;
        };

        // Build multiline string literal (no dynamic expressions)
        const buildMultilineString = (classes, baseIndent) => {
            const indent = baseIndent + "    ";
            const lines = classes.map((cls) => `${indent}${cls}`);

            return `"\n${lines.join("\n")}\n${baseIndent}"`;
        };

        // Check if a string value needs multiline formatting
        const needsMultiline = (classes, dynamicCount, totalLength) =>
            classes.length + dynamicCount > maxClassCount || totalLength > maxLength;

        // Check if already correctly formatted multiline
        const isCorrectlyMultiline = (rawContent, baseIndent) => {
            if (!/\n/.test(rawContent)) return false;

            const indent = baseIndent + "    ";
            const lines = rawContent.split("\n");

            // First line should be empty (backtick then newline)
            if (lines[0].trim() !== "") return false;

            // Last line should be just baseIndent
            if (lines[lines.length - 1] !== baseIndent) return false;

            // Middle lines should each have exactly one class/expression at correct indent, no empty lines
            for (let i = 1; i < lines.length - 1; i += 1) {
                if (lines[i].trim() === "") return false;

                if (!lines[i].startsWith(indent)) return false;

                const content = lines[i].slice(indent.length);

                if (content.includes(" ") && !content.startsWith("${")) return false;
            }

            return true;
        };

        // Get base indent for the node that owns the class string
        const getBaseIndent = (node) => {
            let current = node;

            while (current) {
                // For JSX attributes, check if inline and use column-based indent
                if (current.type === "JSXAttribute") {
                    const lineIndent = getLineIndent(current);
                    const lineText = sourceCode.lines[current.loc.start.line - 1];
                    const contentBefore = lineText.slice(0, current.loc.start.column).trim();

                    if (contentBefore) {
                        // Attribute is inline (e.g., <Component className=...>)
                        return " ".repeat(current.loc.start.column);
                    }

                    return lineIndent;
                }

                // For variables and properties, just use line indentation
                if (current.type === "VariableDeclarator" || current.type === "Property") {
                    return getLineIndent(current);
                }

                // For return statements, use the return keyword's indentation
                if (current.type === "ReturnStatement") {
                    return getLineIndent(current);
                }

                current = current.parent;
            }

            return getLineIndent(node);
        };

        // Handle string literal className
        const checkStringLiteralHandler = (node, value, varName) => {
            if (!isClassRelated(varName, value)) return;

            const classes = value.trim().split(/\s+/).filter(Boolean);
            const classesOnly = classes.join(" ");
            const isMultiline = /\n/.test(value);

            // Under threshold: if multiline, collapse to single line
            if (!needsMultiline(classes, 0, classesOnly.length)) {
                if (isMultiline) {
                    const raw = sourceCode.getText(node);
                    const quote = raw[0];

                    context.report({
                        fix: (fixer) => fixer.replaceText(node, `${quote}${classesOnly}${quote}`),
                        message: "Class string under threshold should be on a single line",
                        node,
                    });
                }

                return;
            }

            const baseIndent = getBaseIndent(node);

            // Already correctly formatted multiline
            if (isCorrectlyMultiline(value, baseIndent)) return;

            context.report({
                fix: (fixer) => {
                    const parent = node.parent;

                    if (parent && parent.type === "JSXAttribute") {
                        return fixer.replaceText(node, buildMultilineString(classes, baseIndent));
                    }

                    // Variables/objects: multiline "..." is invalid JS, use template literal
                    return fixer.replaceText(node, buildMultilineTemplate(classes, [], baseIndent));
                },
                message: `Class strings with >${maxClassCount} classes or >${maxLength} chars should be multiline with one class per line. Example: className="\\n    flex\\n    items-center\\n"`,
                node,
            });
        };

        // Handle template literal className
        const checkTemplateLiteralHandler = (templateLiteral, varName) => {
            const { expressions, quasis } = templateLiteral;
            const staticContent = quasis.map((q) => q.value.raw).join(" ").trim();

            if (!isClassRelated(varName, staticContent)) return;

            const allClasses = staticContent.split(/\s+/).filter(Boolean);
            const dynamicExprs = expressions.map((expr) => sourceCode.getText(expr));
            const fullLength = staticContent.length + dynamicExprs.reduce((sum, e) => sum + e.length + 3, 0);

            // Determine if this is a JSX className attribute
            const jsxContainer = templateLiteral.parent;
            const isJSXAttr = jsxContainer
                && jsxContainer.type === "JSXExpressionContainer"
                && jsxContainer.parent
                && jsxContainer.parent.type === "JSXAttribute";

            if (!needsMultiline(allClasses, dynamicExprs.length, fullLength)) {
                // Under threshold: if multiline, collapse to single line
                const rawContent = quasis.map((q, i) =>
                    q.value.raw + (i < expressions.length ? `\${${dynamicExprs[i]}}` : ""),
                ).join("");

                if (/\n/.test(rawContent)) {
                    const collapsed = allClasses.join(" ");

                    if (isJSXAttr && dynamicExprs.length === 0) {
                        // JSX no expressions → use "..."
                        context.report({
                            fix: (fixer) => fixer.replaceText(jsxContainer, `"${collapsed}"`),
                            message: "Class string under threshold should be on a single line",
                            node: templateLiteral,
                        });
                    } else if (dynamicExprs.length === 0) {
                        // Variable no expressions → use `...` single line
                        context.report({
                            fix: (fixer) => fixer.replaceText(templateLiteral, `\`${collapsed}\``),
                            message: "Class string under threshold should be on a single line",
                            node: templateLiteral,
                        });
                    } else {
                        const parts = [collapsed, ...dynamicExprs.map((e) => `\${${e}}`)];

                        context.report({
                            fix: (fixer) => fixer.replaceText(templateLiteral, `\`${parts.join(" ")}\``),
                            message: "Class string under threshold should be on a single line",
                            node: templateLiteral,
                        });
                    }
                }

                return;
            }

            const baseIndent = getBaseIndent(templateLiteral);

            // JSX with no expressions → must use "..." format, not {`...`}
            if (isJSXAttr && dynamicExprs.length === 0) {
                const multiline = buildMultilineString(allClasses, baseIndent);

                context.report({
                    fix: (fixer) => fixer.replaceText(jsxContainer, multiline),
                    message: "Use string literal instead of template literal for className with no dynamic expressions",
                    node: templateLiteral,
                });

                return;
            }

            // Template literal (variable/object or JSX with expressions)
            const rawContent = quasis.map((q, i) =>
                q.value.raw + (i < expressions.length ? `\${${dynamicExprs[i]}}` : ""),
            ).join("");

            if (isCorrectlyMultiline(rawContent, baseIndent)) return;

            const multiline = buildMultilineTemplate(allClasses, dynamicExprs, baseIndent);

            context.report({
                fix: (fixer) => fixer.replaceText(templateLiteral, multiline),
                message: `Class strings with >${maxClassCount} classes or >${maxLength} chars should be multiline with one class per line. Example: className="\\n    flex\\n    items-center\\n"`,
                node: templateLiteral,
            });
        };

        return {
            // Check className JSX attribute
            JSXAttribute(node) {
                if (!node.name || node.name.name !== "className") return;

                if (node.value && node.value.type === "Literal" && typeof node.value.value === "string") {
                    checkStringLiteralHandler(node.value, node.value.value, "className");
                }

                if (node.value
                    && node.value.type === "JSXExpressionContainer"
                    && node.value.expression.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.value.expression, "className");
                }
            },

            // Check variable declarations
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;

                const varName = node.id.name;

                if (node.init && node.init.type === "Literal" && typeof node.init.value === "string") {
                    checkStringLiteralHandler(node.init, node.init.value, varName);
                }

                if (node.init && node.init.type === "TemplateLiteral") {
                    checkTemplateLiteralHandler(node.init, varName);
                }

                if (node.init && node.init.type === "ObjectExpression") {
                    // Check each property - apply rule if name suggests classes OR value looks like Tailwind
                    node.init.properties.forEach((prop) => {
                        if (prop.type !== "Property") return;

                        if (prop.value && prop.value.type === "Literal" && typeof prop.value.value === "string") {
                            // Check if variable name suggests classes OR if the value looks like Tailwind classes
                            if (isClassRelated(varName, prop.value.value)) {
                                checkStringLiteralHandler(prop.value, prop.value.value, varName);
                            }
                        }

                        if (prop.value && prop.value.type === "TemplateLiteral") {
                            // For template literals, extract static content to check for Tailwind classes
                            const staticContent = prop.value.quasis.map((q) => q.value.raw).join(" ").trim();

                            if (isClassRelated(varName, staticContent)) {
                                checkTemplateLiteralHandler(prop.value, varName);
                            }
                        }
                    });
                }
            },

            // Check class utility function calls: cn(), cva(), clsx(), twMerge(), etc.
            CallExpression(node) {
                if (!node.callee) return;

                const calleeName = node.callee.name
                    || (node.callee.property && node.callee.property.name);

                const classUtilFunctions = new Set([
                    "cn", "cva", "clsx", "twMerge", "classnames", "cx", "tv", "twJoin",
                ]);

                if (!calleeName || !classUtilFunctions.has(calleeName)) return;

                // Check each string/template argument
                node.arguments.forEach((arg) => {
                    if (arg.type === "Literal" && typeof arg.value === "string") {
                        checkStringLiteralHandler(arg, arg.value, "className");
                    }

                    if (arg.type === "TemplateLiteral") {
                        checkTemplateLiteralHandler(arg, "className");
                    }

                    // For cva/tv: check variant object values
                    if (arg.type === "ObjectExpression") {
                        const variantsProp = arg.properties.find(
                            (p) => p.type === "Property" && p.key && (p.key.name === "variants" || p.key.value === "variants"),
                        );

                        if (variantsProp && variantsProp.value && variantsProp.value.type === "ObjectExpression") {
                            variantsProp.value.properties.forEach((category) => {
                                if (category.type !== "Property" || !category.value || category.value.type !== "ObjectExpression") return;

                                category.value.properties.forEach((variant) => {
                                    if (variant.type !== "Property") return;

                                    if (variant.value && variant.value.type === "Literal" && typeof variant.value.value === "string") {
                                        checkStringLiteralHandler(variant.value, variant.value.value, "className");
                                    }

                                    if (variant.value && variant.value.type === "TemplateLiteral") {
                                        checkTemplateLiteralHandler(variant.value, "className");
                                    }
                                });
                            });
                        }
                    }
                });
            },

            // Check return statements with Tailwind class values
            ReturnStatement(node) {
                if (!node.argument) return;

                if (node.argument.type === "Literal" && typeof node.argument.value === "string") {
                    const value = node.argument.value;

                    if (looksLikeTailwindClasses(value)) {
                        checkStringLiteralHandler(node.argument, value, "return");
                    }
                }

                if (node.argument.type === "TemplateLiteral") {
                    const staticContent = node.argument.quasis.map((q) => q.value.raw).join(" ").trim();

                    if (looksLikeTailwindClasses(staticContent)) {
                        checkTemplateLiteralHandler(node.argument, "return");
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce multiline formatting for long className strings; smart detection for objects with Tailwind values, return statements, and class utility calls (cn, cva, clsx)" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxClassCount: { default: 3, minimum: 1, type: "integer" },
                    maxLength: { default: 80, minimum: 1, type: "integer" },
                },
                type: "object",
            },
        ],
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

            // Skip multiline className format (intentional whitespace)
            if (node.name && node.name.name === "className" && /^\n/.test(value)) return;

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

        // Check if condition has broken operators (spread across lines)
        const hasConditionBrokenAcrossLinesHandler = (testNode) => {
            // Check binary expressions (===, !==, etc.)
            if (testNode.type === "BinaryExpression") {
                const leftEnd = testNode.left.loc.end.line;
                const rightStart = testNode.right.loc.start.line;

                if (leftEnd !== rightStart) return true;

                // Recursively check nested expressions
                return hasConditionBrokenAcrossLinesHandler(testNode.left)
                    || hasConditionBrokenAcrossLinesHandler(testNode.right);
            }

            // Check logical expressions (&&, ||)
            if (testNode.type === "LogicalExpression") {
                const leftEnd = testNode.left.loc.end.line;
                const rightStart = testNode.right.loc.start.line;

                if (leftEnd !== rightStart) return true;

                return hasConditionBrokenAcrossLinesHandler(testNode.left)
                    || hasConditionBrokenAcrossLinesHandler(testNode.right);
            }

            return false;
        };

        // Get the full condition text collapsed to single line
        const getCollapsedConditionTextHandler = (testNode) => sourceCode.getText(testNode).replace(/\s*\n\s*/g, " ").trim();

        return {
            ConditionalExpression(node) {
                const parent = node.parent;

                // Handle ternaries in JSX context, return statements, or arrow function bodies
                const isJsxContext = parent && parent.type === "JSXExpressionContainer";
                const isReturnContext = parent && parent.type === "ReturnStatement";
                const isArrowBodyContext = parent && parent.type === "ArrowFunctionExpression" && parent.body === node;

                if (!isJsxContext && !isReturnContext && !isArrowBodyContext) return;

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

                // Check: Condition should not be broken across multiple lines
                if (hasConditionBrokenAcrossLinesHandler(node.test)) {
                    const collapsedCondition = getCollapsedConditionTextHandler(node.test);

                    context.report({
                        fix: (fixer) => fixer.replaceText(node.test, collapsedCondition),
                        message: "Ternary condition should not be broken across multiple lines",
                        node: node.test,
                    });
                }

                // Check: Condition should be on same line as opening { (for JSX context)
                if (isJsxContext) {
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

                // Get closing brace of JSXExpressionContainer (null for return statements)
                const closeBrace = isJsxContext ? sourceCode.getLastToken(parent) : null;

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

                    // Check if simple alternate is wrapped in unnecessary parentheses
                    const tokenAfterColon = sourceCode.getTokenAfter(colonToken);

                    if (tokenAfterColon && tokenAfterColon.value === "(") {
                        // Find the matching closing paren
                        const closingParen = sourceCode.getTokenAfter(alternate);

                        if (closingParen && closingParen.value === ")") {
                            // Remove parentheses and put simple alternate on same line as :
                            const alternateText = sourceCode.getText(alternate);

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [colonToken.range[1], closingParen.range[1]],
                                    ` ${alternateText}`,
                                ),
                                message: "Simple JSX should not be wrapped in parentheses; put on same line as ':'",
                                node: alternate,
                            });

                            return;
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

                    // } should be on same line as simple alternate (only for JSX context)
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

                // CASE 3b: Consequent is complex JSX, alternate is simple non-JSX (null, undefined, false, etc.)
                // Format: return condition ? (
                //     <Complex />
                // ) : null;
                const isSimpleNonJsxAlternate = !isAlternateJsx && (
                    alternate.type === "Literal" ||
                    alternate.type === "Identifier" ||
                    (alternate.type === "MemberExpression" && alternate.loc.start.line === alternate.loc.end.line)
                );

                if (!consequentSimple && isConsequentJsx && isSimpleNonJsxAlternate) {
                    const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                    // ? ( should be on same line as condition
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

                        // JSX after ( should start on new line (no empty lines)
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
                        } else if (tokenBeforeColon.loc.start.line - jsxEnd.loc.end.line > 1) {
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

                    // Simple alternate should be on same line as :
                    if (colonToken.loc.end.line !== alternate.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [colonToken.range[1], alternate.range[0]],
                                " ",
                            ),
                            message: "Simple expression should be on same line as ':'",
                            node: alternate,
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
                        // Keep endRange as closingBracket.range[0] to include the "/" in the replaced range
                        closingText = " /";
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

export {
    jsxChildrenOnNewLine,
    jsxClosingBracketSpacing,
    jsxElementChildNewLine,
    jsxLogicalExpressionSimplify,
    jsxParenthesesPosition,
    jsxPropNamingConvention,
    jsxSimpleElementOneLine,
    classNameDynamicAtEnd,
    classNameNoExtraSpaces,
    classNameOrder,
    classNameMultiline,
    jsxStringValueTrim,
    jsxTernaryFormat,
    noEmptyLinesInJsx,
};
