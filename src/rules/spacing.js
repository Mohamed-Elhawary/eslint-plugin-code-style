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

        const checkBracketSpacingHandler = (node, objectPart, indexPart) => {
            const openBracket = sourceCode.getTokenBefore(indexPart);
            const closeBracket = sourceCode.getTokenAfter(indexPart);

            if (!openBracket || openBracket.value !== "[") return;
            if (!closeBracket || closeBracket.value !== "]") return;

            // Check for space before [ (between object and bracket)
            const objectLastToken = sourceCode.getLastToken(objectPart);

            if (objectLastToken) {
                const textBeforeOpen = sourceCode.text.slice(objectLastToken.range[1], openBracket.range[0]);

                if (/\s/.test(textBeforeOpen)) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [objectLastToken.range[1], openBracket.range[0]],
                            "",
                        ),
                        message: "No space before opening bracket in member expression",
                        node: openBracket,
                    });
                }
            }

            // Check for space after [
            const textAfterOpen = sourceCode.text.slice(openBracket.range[1], indexPart.range[0]);

            if (textAfterOpen.includes(" ") || textAfterOpen.includes("\n")) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBracket.range[1], indexPart.range[0]],
                        "",
                    ),
                    message: "No space after opening bracket in member expression",
                    node: openBracket,
                });
            }

            // Check for space before ]
            const textBeforeClose = sourceCode.text.slice(indexPart.range[1], closeBracket.range[0]);

            if (textBeforeClose.includes(" ") || textBeforeClose.includes("\n")) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [indexPart.range[1], closeBracket.range[0]],
                        "",
                    ),
                    message: "No space before closing bracket in member expression",
                    node: closeBracket,
                });
            }
        };

        return {
            MemberExpression(node) {
                // Only check computed member expressions (bracket notation)
                if (!node.computed) return;

                checkBracketSpacingHandler(node, node.object, node.property);
            },

            // Handle TypeScript indexed access types: Type["prop"]
            TSIndexedAccessType(node) {
                checkBracketSpacingHandler(node, node.objectType, node.indexType);
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

export { assignmentValueSameLine, memberExpressionBracketSpacing };
