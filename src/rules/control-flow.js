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
 * Rule: If Statement Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   If statements should have consistent formatting with the
 *   opening brace on the same line as the condition and else
 *   on the same line as the closing brace.
 *
 *
 * ✓ Good:
 *   if (condition) {
 *       doSomething();
 * 
 *       doMore();
 *   } else {
 *       doOther();
 * 
 *       doAnother();
 *   }
 *
 * ✗ Bad:
 *   if (condition)
 *   {
 *       doSomething();
 *       doMore();
 *   }
 *   else
 *   {
 *       doOther();
 *       doAnother();
 *   }
 */
const ifStatementFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Conditions that should be on single line
        const isSimpleConditionHandler = (testNode, testText) => {
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

            // LogicalExpression - collapse if it's short enough to fit on one line
            // BUT skip if it has intentional multiline formatting (operator at start of line)
            if (testNode.type === "LogicalExpression") {
                // Check for intentional multiline format (operator at start of line after newline)
                // This pattern indicates multiline-if-conditions has intentionally formatted it
                if (/\n\s*(\|\||&&)/.test(testText)) {
                    return false; // Intentionally multilined, don't collapse
                }

                // "Short enough" means under 80 characters for the condition itself
                const conditionLength = testText.replace(/\s+/g, " ").trim().length;

                return conditionLength <= 80;
            }

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

            // Check for conditions that span multiple lines - collapse to single line if short enough
            const conditionSpansMultipleLines = openParen.loc.end.line !== closeParen.loc.start.line;
            const testText = sourceCode.getText(test);

            if (conditionSpansMultipleLines && isSimpleConditionHandler(test, testText)) {
                // Normalize whitespace in condition text
                const normalizedText = testText.replace(/\s+/g, " ").trim();

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openParen.range[1], closeParen.range[0]],
                        normalizedText,
                    ),
                    message: "If condition should be on a single line",
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
 * Rule: If-Else Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces proper spacing between if statements and if-else chains:
 *   1. Consecutive if statements with block bodies must have an empty line between them
 *   2. Single-line if and else should NOT have empty lines between them
 *
 * ✓ Good:
 *   if (!hasValidParams) return null;
 *
 *   if (status === "loading") {
 *       return <Loading />;
 *   }
 *
 *   if (status === "error") {
 *       return <Error />;
 *   }
 *
 *   if (error) prom.reject(error);
 *   else prom.resolve(token);
 *
 * ✗ Bad:
 *   if (!hasValidParams) return null;
 *   if (status === "loading") {
 *       return <Loading />;
 *   }
 *   if (status === "error") {
 *       return <Error />;
 *   }
 *
 *   if (error) prom.reject(error);
 *
 *   else prom.resolve(token);
 */
const ifElseSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if an if statement is single-line (no block body or block on same line)
        const isSingleLineIfHandler = (node) => {
            if (node.type !== "IfStatement") return false;

            const { consequent } = node;

            // If consequent is not a block, it's single-line
            if (consequent.type !== "BlockStatement") return true;

            // If it's a block, check if the entire block is on one line
            return consequent.loc.start.line === consequent.loc.end.line;
        };

        // Check single-line if-else should not have empty lines between if and else
        const checkSingleLineIfElseHandler = (node) => {
            const { alternate } = node;

            if (!alternate) return;

            // Only check single-line if statements
            if (!isSingleLineIfHandler(node)) return;

            // Find the closing of the consequent
            const { consequent } = node;

            const closingToken = consequent.type === "BlockStatement"
                ? sourceCode.getLastToken(consequent)
                : sourceCode.getLastToken(consequent);

            // Find the else keyword
            const elseKeyword = sourceCode.getTokenAfter(
                closingToken,
                (t) => t.value === "else",
            );

            if (!elseKeyword) return;

            // Check if there's an empty line between the consequent and else
            const linesBetween = elseKeyword.loc.start.line - closingToken.loc.end.line;

            if (linesBetween > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closingToken.range[1], elseKeyword.range[0]],
                        "\n" + " ".repeat(elseKeyword.loc.start.column),
                    ),
                    message: "No empty line allowed between single-line if and else",
                    node: elseKeyword,
                });
            }
        };

        // Check consecutive if statements in a block
        const checkConsecutiveIfsHandler = (node) => {
            const { body } = node;

            if (!body || !Array.isArray(body)) return;

            for (let i = 0; i < body.length - 1; i += 1) {
                const current = body[i];
                const next = body[i + 1];

                // Only check if current is an if statement
                if (current.type !== "IfStatement") continue;

                // Only check if next is an if statement
                if (next.type !== "IfStatement") continue;

                // Get the actual end of current (could be alternate/else-if chain)
                let currentEnd = current;

                while (currentEnd.alternate && currentEnd.alternate.type === "IfStatement") {
                    currentEnd = currentEnd.alternate;
                }

                // If current ends with an else block (not else-if), use the alternate
                const endNode = currentEnd.alternate || currentEnd.consequent;

                // Check if either the current if (or its last branch) has a block body
                const currentHasBlock = endNode.type === "BlockStatement";

                // Check if the next if has a block body
                const nextHasBlock = next.consequent.type === "BlockStatement";

                // Require empty line if either has a block body
                if (currentHasBlock || nextHasBlock) {
                    const linesBetween = next.loc.start.line - endNode.loc.end.line;

                    if (linesBetween === 1) {
                        // No empty line between them - needs one
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(
                                endNode,
                                "\n",
                            ),
                            message: "Expected empty line between consecutive if statements with block bodies",
                            node: next,
                        });
                    }
                }
            }
        };

        return {
            BlockStatement: checkConsecutiveIfsHandler,
            IfStatement: checkSingleLineIfElseHandler,
            Program: checkConsecutiveIfsHandler,
        };
    },
    meta: {
        docs: { description: "Enforce proper spacing between if statements and if-else chains" },
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
 *   Nested groups with >maxOperands are formatted multiline inline.
 *   Groups exceeding nesting level 2 are extracted to variables.
 *
 * Options:
 *   { maxOperands: 3 } - Maximum operands on single line (default: 3)
 *
 * ✓ Good (nested group with >3 operands - multiline inline):
 *   if ((
 *       a
 *       || b
 *       || c
 *       || d
 *   ) && e) {}
 *
 * ✓ Good (≤2 nesting level):
 *   if ((a && b) || c) {}                    // Level 1
 *   if ((a && (b || c)) || d) {}             // Level 2
 *
 * ✗ Bad (>2 nesting level - auto-fixed by extraction):
 *   if ((a && (b || (c && d))) || e) {}
 *   // Fixed to:
 *   // const isCAndD = (c && d);
 *   // if ((a && (b || isCAndD)) || e) {}
 */
const multilineIfConditions = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxOperands = options.maxOperands !== undefined ? options.maxOperands : 3;
        const maxNestingLevel = 2; // Fixed at 2 - not configurable to avoid overly complex conditions

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

        // Calculate max nesting depth of parenthesized groups in a logical expression
        // Level 0: a && b (no groups)
        // Level 1: (a && b) || c (one group at top)
        // Level 2: (a && (b || c)) || d (group inside group)
        const getNestingDepthHandler = (node, currentDepth = 0) => {
            if (node.type !== "LogicalExpression") return currentDepth;

            let maxDepth = currentDepth;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftDepth = isParenthesizedHandler(node.left)
                    ? getNestingDepthHandler(node.left, currentDepth + 1)
                    : getNestingDepthHandler(node.left, currentDepth);
                maxDepth = Math.max(maxDepth, leftDepth);
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightDepth = isParenthesizedHandler(node.right)
                    ? getNestingDepthHandler(node.right, currentDepth + 1)
                    : getNestingDepthHandler(node.right, currentDepth);
                maxDepth = Math.max(maxDepth, rightDepth);
            }

            return maxDepth;
        };

        // Find the deepest nested parenthesized group that exceeds maxNestingLevel
        const findDeepNestedGroupHandler = (node, currentDepth = 0, parentInfo = null) => {
            if (node.type !== "LogicalExpression") return null;

            let deepestGroup = null;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftIsParen = isParenthesizedHandler(node.left);
                const newDepth = leftIsParen ? currentDepth + 1 : currentDepth;

                if (leftIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    deepestGroup = {
                        node: node.left,
                        depth: newDepth,
                        parent: node,
                        side: "left",
                    };
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.left, newDepth, { node, side: "left" });
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightIsParen = isParenthesizedHandler(node.right);
                const newDepth = rightIsParen ? currentDepth + 1 : currentDepth;

                if (rightIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    const rightGroup = {
                        node: node.right,
                        depth: newDepth,
                        parent: node,
                        side: "right",
                    };
                    if (!deepestGroup || rightGroup.depth > deepestGroup.depth) {
                        deepestGroup = rightGroup;
                    }
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.right, newDepth, { node, side: "right" });
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            return deepestGroup;
        };

        // Count operands inside a group, ignoring the outer parentheses of the group itself
        // This is used to count operands INSIDE a parenthesized group
        const countOperandsInsideGroupHandler = (node) => {
            if (node.type !== "LogicalExpression") return 1;

            let count = 0;
            const countHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    countHelperHandler(n.left);
                    countHelperHandler(n.right);
                } else {
                    count += 1;
                }
            };

            // Start by recursing into children directly (ignoring outer parens)
            countHelperHandler(node.left);
            countHelperHandler(node.right);

            return count;
        };

        // Find a nested parenthesized group that has >maxOperands operands
        // Returns the first such group found (for extraction to variable)
        const findNestedGroupExceedingMaxOperandsHandler = (node) => {
            if (node.type !== "LogicalExpression") return null;

            // Check if this node is a parenthesized group with >maxOperands
            if (isParenthesizedHandler(node)) {
                const insideCount = countOperandsInsideGroupHandler(node);
                if (insideCount > maxOperands) {
                    return node;
                }
            }

            // Recursively check children
            if (node.left.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.left);
                if (found) return found;
            }
            if (node.right.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.right);
                if (found) return found;
            }

            return null;
        };

        const checkIfStatementHandler = (node) => {
            const { test } = node;

            if (test.type !== "LogicalExpression") return;

            const operands = collectOperandsHandler(test);
            const openParen = sourceCode.getTokenBefore(test);
            const closeParen = sourceCode.getTokenAfter(test);

            if (!openParen || !closeParen) return;

            // Check for excessive nesting depth
            const nestingDepth = getNestingDepthHandler(test);

            if (nestingDepth > maxNestingLevel) {
                const deepGroup = findDeepNestedGroupHandler(test);

                if (deepGroup) {
                    const groupText = getSourceTextWithGroupsHandler(deepGroup.node);

                    // Generate a more descriptive variable name based on condition structure
                    const getConditionNameHandler = (n) => {
                        if (n.type === "LogicalExpression") {
                            const leftName = getConditionNameHandler(n.left);
                            const rightName = getConditionNameHandler(n.right);
                            const opName = n.operator === "&&" ? "And" : "Or";

                            return `${leftName}${opName}${rightName}`;
                        }
                        if (n.type === "Identifier") {
                            return n.name.charAt(0).toUpperCase() + n.name.slice(1);
                        }
                        if (n.type === "BinaryExpression" || n.type === "CallExpression" || n.type === "MemberExpression") {
                            return "Expr";
                        }

                        return "Cond";
                    };

                    // Generate unique variable name
                    let varName = `is${getConditionNameHandler(deepGroup.node)}`;
                    // Limit length and sanitize
                    if (varName.length > 30) {
                        varName = "isNestedCondition";
                    }

                    context.report({
                        fix: (fixer) => {
                            const fixes = [];

                            // Get the line before the if statement for inserting the variable
                            const ifLine = node.loc.start.line;
                            const lineStart = sourceCode.getIndexFromLoc({ line: ifLine, column: 0 });
                            const lineText = sourceCode.lines[ifLine - 1];
                            const indent = lineText.match(/^\s*/)[0];

                            // Insert variable declaration before the if statement
                            fixes.push(fixer.insertTextBeforeRange(
                                [lineStart, lineStart],
                                `const ${varName} = ${groupText};\n${indent}`,
                            ));

                            // Replace the nested group with the variable name in the condition
                            // We need to replace including the parentheses around the group
                            const tokenBefore = sourceCode.getTokenBefore(deepGroup.node);
                            const tokenAfter = sourceCode.getTokenAfter(deepGroup.node);

                            if (tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")") {
                                fixes.push(fixer.replaceTextRange(
                                    [tokenBefore.range[0], tokenAfter.range[1]],
                                    varName,
                                ));
                            } else {
                                fixes.push(fixer.replaceText(deepGroup.node, varName));
                            }

                            return fixes;
                        },
                        message: `Condition nesting depth (${nestingDepth}) exceeds maximum (${maxNestingLevel}). Extract deeply nested condition to a variable.`,
                        node: deepGroup.node,
                    });

                    return; // Don't process other rules for this statement
                }
            }

            const isMultiLine = openParen.loc.start.line !== closeParen.loc.end.line;

            // Check if a BinaryExpression is split across lines (left/operator/right not on same line)
            const isBinaryExpressionSplitHandler = (n) => {
                if (n.type !== "BinaryExpression") return false;

                const { left, right } = n;

                // Check if left ends on different line than right starts
                if (left.loc.end.line !== right.loc.start.line) return true;

                // Recursively check nested binary expressions
                if (isBinaryExpressionSplitHandler(left)) return true;
                if (isBinaryExpressionSplitHandler(right)) return true;

                return false;
            };

            // Collapse a BinaryExpression to single line
            const buildBinaryExpressionSingleLineHandler = (n) => {
                if (n.type === "BinaryExpression") {
                    const leftText = buildBinaryExpressionSingleLineHandler(n.left);
                    const rightText = buildBinaryExpressionSingleLineHandler(n.right);

                    return `${leftText} ${n.operator} ${rightText}`;
                }

                return sourceCode.getText(n);
            };

            // Check if any nested parenthesized group has >maxOperands - format multiline inline
            const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(test);
            if (nestedGroupExceeding) {
                // Get indentation for formatting
                const lineText = sourceCode.lines[node.loc.start.line - 1];
                const parenIndent = lineText.match(/^\s*/)[0];
                const contentIndent = parenIndent + "    ";

                // Build multiline text for operands inside a nested group
                // isOuterGroup=true means we're at the target group itself (ignore its own parentheses)
                // Also recursively expands any inner nested groups with >maxOperands
                const buildNestedMultilineHandler = (n, isOuterGroup = false, currentIndent = contentIndent) => {
                    if (n.type === "LogicalExpression" && (isOuterGroup || !isParenthesizedHandler(n))) {
                        const leftText = buildNestedMultilineHandler(n.left, false, currentIndent);
                        const rightText = buildNestedMultilineHandler(n.right, false, currentIndent);

                        return `${leftText}\n${currentIndent}${n.operator} ${rightText}`;
                    }

                    // Check if this is a parenthesized group with >maxOperands - also expand it
                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        const innerCount = countOperandsInsideGroupHandler(n);
                        if (innerCount > maxOperands) {
                            const innerIndent = currentIndent + "    ";
                            const buildInner = (inner) => {
                                if (inner.type === "LogicalExpression" && !isParenthesizedHandler(inner)) {
                                    const l = buildInner(inner.left);
                                    const r = buildInner(inner.right);

                                    return `${l}\n${innerIndent}${inner.operator} ${r}`;
                                }

                                return getSourceTextWithGroupsHandler(inner);
                            };

                            const innerLeft = buildInner(n.left);
                            const innerRight = buildInner(n.right);

                            return `(\n${innerIndent}${innerLeft}\n${innerIndent}${n.operator} ${innerRight}\n${currentIndent})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Build the full condition with nested group formatted multiline
                const buildFullConditionHandler = (n, targetNode) => {
                    if (n === targetNode) {
                        // This is the nested group - format it multiline
                        // Pass true to ignore outer parentheses check
                        const nestedText = buildNestedMultilineHandler(n, true);

                        return `(\n${contentIndent}${nestedText}\n${parenIndent})`;
                    }

                    if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                        const leftText = buildFullConditionHandler(n.left, targetNode);
                        const rightText = buildFullConditionHandler(n.right, targetNode);

                        return `${leftText} ${n.operator} ${rightText}`;
                    }

                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        // Check if this contains the target
                        const containsTargetHandler = (node, target) => {
                            if (node === target) return true;
                            if (node.type === "LogicalExpression") {
                                return containsTargetHandler(node.left, target) || containsTargetHandler(node.right, target);
                            }

                            return false;
                        };

                        if (containsTargetHandler(n, targetNode)) {
                            const innerText = buildFullConditionHandler(n, targetNode);

                            return `(${innerText})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Check if already correctly formatted
                // Collect operands INSIDE the nested group (not treating the group itself as 1 operand)
                const collectInsideGroupHandler = (node) => {
                    const operands = [];
                    const collectHelper = (n) => {
                        if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                            collectHelper(n.left);
                            collectHelper(n.right);
                        } else {
                            operands.push(n);
                        }
                    };

                    // Start from children directly, ignoring outer parentheses
                    if (node.type === "LogicalExpression") {
                        collectHelper(node.left);
                        collectHelper(node.right);
                    }

                    return operands;
                };

                const nestedOperands = collectInsideGroupHandler(nestedGroupExceeding);
                const allOnDifferentLines = nestedOperands.every((op, i) => {
                    if (i === 0) return true;

                    return op.loc.start.line !== nestedOperands[i - 1].loc.start.line;
                });

                if (!allOnDifferentLines) {
                    context.report({
                        fix: (fixer) => {
                            const newCondition = buildFullConditionHandler(test, nestedGroupExceeding);

                            // Replace just the content between if statement's parens
                            return fixer.replaceTextRange(
                                [openParen.range[1], closeParen.range[0]],
                                newCondition,
                            );
                        },
                        message: `Nested condition with >${maxOperands} operands should be formatted multiline`,
                        node: nestedGroupExceeding,
                    });

                    return;
                }
            }

            // maxOperands or fewer operands: keep on single line
            // BUT skip if any nested group has >maxOperands (already expanded or needs expansion)
            if (operands.length <= maxOperands) {
                // Check if any nested parenthesized group has >maxOperands (should stay multiline)
                const hasExpandedNestedGroup = findNestedGroupExceedingMaxOperandsHandler(test);
                if (hasExpandedNestedGroup) {
                    return; // Don't collapse - nested group needs multiline
                }

                // Check if all operands START on the same line
                const firstOperandStartLine = operands[0].loc.start.line;
                const allOperandsStartOnSameLine = operands.every(
                    (op) => op.loc.start.line === firstOperandStartLine,
                );

                // Check if any BinaryExpression operand is split across lines
                const hasSplitBinaryExpression = operands.some(
                    (op) => isBinaryExpressionSplitHandler(op),
                );

                if (!allOperandsStartOnSameLine || hasSplitBinaryExpression) {
                    context.report({
                        fix: (fixer) => {
                            const buildSameLineHandler = (n) => {
                                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                    const leftText = buildSameLineHandler(n.left);
                                    const rightText = buildSameLineHandler(n.right);

                                    return `${leftText} ${n.operator} ${rightText}`;
                                }

                                // Handle split BinaryExpressions
                                if (n.type === "BinaryExpression" && isBinaryExpressionSplitHandler(n)) {
                                    return buildBinaryExpressionSingleLineHandler(n);
                                }

                                return getSourceTextWithGroupsHandler(n);
                            };

                            return fixer.replaceTextRange(
                                [openParen.range[0], closeParen.range[1]],
                                `(${buildSameLineHandler(test)})`,
                            );
                        },
                        message: `If conditions with ≤${maxOperands} operands should be single line: if (a && b && c). Multi-line only for >${maxOperands} operands`,
                        node: test,
                    });
                }

                return;
            }

            // Helper to check if any operator is at end of line (wrong position)
            const hasOperatorAtEndOfLineHandler = (n) => {
                if (n.type !== "LogicalExpression") return false;

                const operatorToken = sourceCode.getTokenAfter(
                    n.left,
                    (t) => t.value === "||" || t.value === "&&",
                );

                if (operatorToken) {
                    // Check if there's a newline after the operator
                    const tokenAfterOperator = sourceCode.getTokenAfter(operatorToken);

                    if (tokenAfterOperator && operatorToken.loc.end.line < tokenAfterOperator.loc.start.line) {
                        // Operator is at end of line - this is wrong
                        return true;
                    }
                }

                // Recursively check nested logical expressions
                if (hasOperatorAtEndOfLineHandler(n.left)) return true;
                if (hasOperatorAtEndOfLineHandler(n.right)) return true;

                return false;
            };

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

                // Check if any operator is at end of line (should be at beginning)
                if (!isCorrectionNeeded && hasOperatorAtEndOfLineHandler(test)) {
                    isCorrectionNeeded = true;
                }
            }

            if (isCorrectionNeeded) {
                context.report({
                    fix: (fixer) => {
                        // Get the indentation of the if statement line
                        const lineText = sourceCode.lines[node.loc.start.line - 1];
                        const parenIndent = lineText.match(/^\s*/)[0];
                        const indent = parenIndent + "    ";
                        const nestedIndent = indent + "    ";

                        // Build multiline, also expanding nested groups with >maxOperands
                        const buildMultilineHandler = (n, currentIndent) => {
                            if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                const leftText = buildMultilineHandler(n.left, currentIndent);
                                const rightText = buildMultilineHandler(n.right, currentIndent);

                                return `${leftText}\n${currentIndent}${n.operator} ${rightText}`;
                            }

                            // Check if this is a parenthesized group with >maxOperands - expand it too
                            if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                                const innerCount = countOperandsInsideGroupHandler(n);
                                if (innerCount > maxOperands) {
                                    // Expand this nested group
                                    const innerIndent = currentIndent + "    ";
                                    const buildInnerHandler = (inner) => {
                                        if (inner.type === "LogicalExpression" && !isParenthesizedHandler(inner)) {
                                            const l = buildInnerHandler(inner.left);
                                            const r = buildInnerHandler(inner.right);

                                            return `${l}\n${innerIndent}${inner.operator} ${r}`;
                                        }

                                        return getSourceTextWithGroupsHandler(inner);
                                    };

                                    const innerLeft = buildInnerHandler(n.left);
                                    const innerRight = buildInnerHandler(n.right);

                                    return `(\n${innerIndent}${innerLeft}\n${innerIndent}${n.operator} ${innerRight}\n${currentIndent})`;
                                }
                            }

                            return getSourceTextWithGroupsHandler(n);
                        };

                        return fixer.replaceTextRange(
                            [openParen.range[0], closeParen.range[1]],
                            `(\n${indent}${buildMultilineHandler(test, indent)}\n${parenIndent})`,
                        );
                    },
                    message: `If conditions with more than ${maxOperands} operands should be multiline, with each operand on its own line`,
                    node: test,
                });
            }
        };

        const checkPropertyHandler = (node) => {
            const { value } = node;

            // Only handle Property nodes where value is a LogicalExpression
            if (!value || value.type !== "LogicalExpression") return;

            const operands = collectOperandsHandler(value);

            // Need at least 2 operands to apply formatting
            if (operands.length < 2) return;

            const valueStartLine = value.loc.start.line;
            const valueEndLine = value.loc.end.line;
            const isMultiLine = valueStartLine !== valueEndLine;

            // Check if a BinaryExpression is split across lines (left/operator/right not on same line)
            const isBinaryExpressionSplitHandler = (n) => {
                if (n.type !== "BinaryExpression") return false;

                const { left, right } = n;

                // Check if left ends on different line than right starts
                if (left.loc.end.line !== right.loc.start.line) return true;

                // Recursively check nested binary expressions
                if (isBinaryExpressionSplitHandler(left)) return true;
                if (isBinaryExpressionSplitHandler(right)) return true;

                return false;
            };

            // Collapse a BinaryExpression to single line
            const buildBinaryExpressionSingleLineHandler = (n) => {
                if (n.type === "BinaryExpression") {
                    const leftText = buildBinaryExpressionSingleLineHandler(n.left);
                    const rightText = buildBinaryExpressionSingleLineHandler(n.right);

                    return `${leftText} ${n.operator} ${rightText}`;
                }

                return sourceCode.getText(n);
            };

            // Check if any nested parenthesized group has >maxOperands
            // For properties, if nested group exceeds, skip single-line formatting (let multiline handle it)
            const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(value);

            // maxOperands or fewer operands AND no nested group exceeds maxOperands: keep on single line
            if (operands.length <= maxOperands && !nestedGroupExceeding) {
                // Check if all operands START on the same line
                const firstOperandStartLine = operands[0].loc.start.line;
                const allOperandsStartOnSameLine = operands.every(
                    (op) => op.loc.start.line === firstOperandStartLine,
                );

                // Check if any BinaryExpression operand is split across lines
                const hasSplitBinaryExpression = operands.some(
                    (op) => isBinaryExpressionSplitHandler(op),
                );

                if (!allOperandsStartOnSameLine || hasSplitBinaryExpression) {
                    context.report({
                        fix: (fixer) => {
                            const buildSameLineHandler = (n) => {
                                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                    const leftText = buildSameLineHandler(n.left);
                                    const rightText = buildSameLineHandler(n.right);

                                    return `${leftText} ${n.operator} ${rightText}`;
                                }

                                // Handle split BinaryExpressions
                                if (n.type === "BinaryExpression" && isBinaryExpressionSplitHandler(n)) {
                                    return buildBinaryExpressionSingleLineHandler(n);
                                }

                                return getSourceTextWithGroupsHandler(n);
                            };

                            return fixer.replaceText(value, buildSameLineHandler(value));
                        },
                        message: `Property conditions with ≤${maxOperands} operands should be single line: condition: a && b && c. Multi-line only for >${maxOperands} operands`,
                        node: value,
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
            }

            if (isCorrectionNeeded) {
                context.report({
                    fix: (fixer) => {
                        // Get the indentation of the property
                        const propertyLine = sourceCode.lines[node.loc.start.line - 1];
                        const propertyIndent = propertyLine.match(/^\s*/)[0];
                        const indent = propertyIndent + "    ";

                        const buildMultilineHandler = (n) => {
                            if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                const leftText = buildMultilineHandler(n.left);
                                const rightText = buildMultilineHandler(n.right);

                                return `${leftText}\n${indent}${n.operator} ${rightText}`;
                            }

                            return getSourceTextWithGroupsHandler(n);
                        };

                        return fixer.replaceText(value, buildMultilineHandler(value));
                    },
                    message: `Property conditions with more than ${maxOperands} operands should be multiline, with each operand on its own line`,
                    node: value,
                });
            }
        };

        return {
            IfStatement: checkIfStatementHandler,
            Property: checkPropertyHandler,
        };
    },
    meta: {
        docs: { description: "Enforce multiline if/property conditions when exceeding threshold (default: >3 operands)" },
        fixable: "whitespace",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxOperands: {
                        default: 3,
                        description: "Maximum operands to keep on single line (default: 3). Also applies to nested groups.",
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
 * Rule: Ternary Condition Multiline
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Formats ternary expressions based on condition operand count:
 *   - ≤maxOperands (default: 3): Always collapse to single line
 *   - >maxOperands: Format multiline with each operand on its own line
 *   - Simple parenthesized nested ternaries (≤maxOperands) count as 1 operand
 *   - Complex nested ternaries (>maxOperands) are skipped (format manually)
 *   - Nested groups with >maxOperands are formatted multiline inline
 *   - Groups exceeding nesting level 2 are extracted to variables
 *
 * Options:
 *   { maxOperands: 3 } - Maximum operands to keep on single line (default: 3)
 *
 * ✓ Good (≤3 operands - single line):
 *   const x = a && b && c ? "yes" : "no";
 *   const url = lang === "ar" ? "/ar/path" : "/en/path";
 *   const inputType = showToggle ? (showPwd ? "text" : "password") : type;
 *
 * ✓ Good (>3 operands - multiline):
 *   const x = variant === "ghost"
 *       || variant === "ghost-danger"
 *       || variant === "muted"
 *       || variant === "primary"
 *       ? "value1"
 *       : "value2";
 *
 * ✗ Bad (≤3 operands split across lines):
 *   const x = a && b && c
 *       ? "yes"
 *       : "no";
 *
 * ✗ Bad (>3 operands on single line):
 *   const x = variant === "ghost" || variant === "ghost-danger" || variant === "muted" || variant === "primary" ? "value1" : "value2";
 */
const ternaryConditionMultiline = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxOperands = options.maxOperands ?? 3;
        const maxNestingLevel = 2; // Fixed at 2 - not configurable to avoid overly complex conditions

        // Check if node is wrapped in parentheses
        const isParenthesizedHandler = (node) => {
            const tokenBefore = sourceCode.getTokenBefore(node);
            const tokenAfter = sourceCode.getTokenAfter(node);

            if (!tokenBefore || !tokenAfter) return false;

            return tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        // Get source text including any surrounding parentheses
        const getSourceTextWithGroupsHandler = (node) => {
            let start = node.range[0];
            let end = node.range[1];
            let left = sourceCode.getTokenBefore(node);
            let right = sourceCode.getTokenAfter(node);

            while (left && left.value === "(" && right && right.value === ")") {
                start = left.range[0];
                end = right.range[1];
                left = sourceCode.getTokenBefore(left);
                right = sourceCode.getTokenAfter(right);
            }

            return sourceCode.text.slice(start, end);
        };

        // Collect all operands from a logical expression
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

        // Calculate max nesting depth of parenthesized groups in a logical expression
        // Level 0: a && b (no groups)
        // Level 1: (a && b) || c (one group at top)
        // Level 2: (a && (b || c)) || d (group inside group)
        const getNestingDepthHandler = (node, currentDepth = 0) => {
            if (node.type !== "LogicalExpression") return currentDepth;

            let maxDepth = currentDepth;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftDepth = isParenthesizedHandler(node.left)
                    ? getNestingDepthHandler(node.left, currentDepth + 1)
                    : getNestingDepthHandler(node.left, currentDepth);
                maxDepth = Math.max(maxDepth, leftDepth);
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightDepth = isParenthesizedHandler(node.right)
                    ? getNestingDepthHandler(node.right, currentDepth + 1)
                    : getNestingDepthHandler(node.right, currentDepth);
                maxDepth = Math.max(maxDepth, rightDepth);
            }

            return maxDepth;
        };

        // Find the deepest nested parenthesized group that exceeds maxNestingLevel
        const findDeepNestedGroupHandler = (node, currentDepth = 0) => {
            if (node.type !== "LogicalExpression") return null;

            let deepestGroup = null;

            // Check left side
            if (node.left.type === "LogicalExpression") {
                const leftIsParen = isParenthesizedHandler(node.left);
                const newDepth = leftIsParen ? currentDepth + 1 : currentDepth;

                if (leftIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    deepestGroup = {
                        node: node.left,
                        depth: newDepth,
                        parent: node,
                        side: "left",
                    };
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.left, newDepth);
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            // Check right side
            if (node.right.type === "LogicalExpression") {
                const rightIsParen = isParenthesizedHandler(node.right);
                const newDepth = rightIsParen ? currentDepth + 1 : currentDepth;

                if (rightIsParen && newDepth > maxNestingLevel) {
                    // This group exceeds max nesting
                    const rightGroup = {
                        node: node.right,
                        depth: newDepth,
                        parent: node,
                        side: "right",
                    };
                    if (!deepestGroup || rightGroup.depth > deepestGroup.depth) {
                        deepestGroup = rightGroup;
                    }
                }

                // Recurse to find even deeper
                const deeper = findDeepNestedGroupHandler(node.right, newDepth);
                if (deeper && (!deepestGroup || deeper.depth > deepestGroup.depth)) {
                    deepestGroup = deeper;
                }
            }

            return deepestGroup;
        };

        // Generate descriptive variable name based on condition structure
        const getConditionNameHandler = (n) => {
            if (n.type === "LogicalExpression") {
                const leftName = getConditionNameHandler(n.left);
                const rightName = getConditionNameHandler(n.right);
                const opName = n.operator === "&&" ? "And" : "Or";

                return `${leftName}${opName}${rightName}`;
            }
            if (n.type === "Identifier") {
                return n.name.charAt(0).toUpperCase() + n.name.slice(1);
            }
            if (n.type === "BinaryExpression" || n.type === "CallExpression" || n.type === "MemberExpression") {
                return "Expr";
            }

            return "Cond";
        };

        // Count operands inside a group, ignoring the outer parentheses of the group itself
        // This is used to count operands INSIDE a parenthesized group
        const countOperandsInsideGroupHandler = (node) => {
            if (node.type !== "LogicalExpression") return 1;

            let count = 0;
            const countHelperHandler = (n) => {
                if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                    countHelperHandler(n.left);
                    countHelperHandler(n.right);
                } else {
                    count += 1;
                }
            };

            // Start by recursing into children directly (ignoring outer parens)
            countHelperHandler(node.left);
            countHelperHandler(node.right);

            return count;
        };

        // Find a nested parenthesized group that has >maxOperands operands
        // Returns the first such group found (for extraction to variable)
        const findNestedGroupExceedingMaxOperandsHandler = (node) => {
            if (node.type !== "LogicalExpression") return null;

            // Check if this node is a parenthesized group with >maxOperands
            if (isParenthesizedHandler(node)) {
                const insideCount = countOperandsInsideGroupHandler(node);
                if (insideCount > maxOperands) {
                    return node;
                }
            }

            // Recursively check children
            if (node.left.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.left);
                if (found) return found;
            }
            if (node.right.type === "LogicalExpression") {
                const found = findNestedGroupExceedingMaxOperandsHandler(node.right);
                if (found) return found;
            }

            return null;
        };

        // Check if a BinaryExpression is split across lines
        const isBinaryExpressionSplitHandler = (n) => {
            if (n.type !== "BinaryExpression") return false;

            const { left, right } = n;

            if (left.loc.end.line !== right.loc.start.line) return true;
            if (isBinaryExpressionSplitHandler(left)) return true;
            if (isBinaryExpressionSplitHandler(right)) return true;

            return false;
        };

        // Collapse a BinaryExpression to single line
        const buildBinaryExpressionSingleLineHandler = (n) => {
            if (n.type === "BinaryExpression") {
                const leftText = buildBinaryExpressionSingleLineHandler(n.left);
                const rightText = buildBinaryExpressionSingleLineHandler(n.right);

                return `${leftText} ${n.operator} ${rightText}`;
            }

            return sourceCode.getText(n);
        };

        // Helper to check if any operator is at end of line (wrong position)
        const hasOperatorAtEndOfLineHandler = (n) => {
            if (n.type !== "LogicalExpression") return false;

            const operatorToken = sourceCode.getTokenAfter(
                n.left,
                (t) => t.value === "||" || t.value === "&&",
            );

            if (operatorToken) {
                const tokenAfterOperator = sourceCode.getTokenAfter(operatorToken);

                if (tokenAfterOperator && operatorToken.loc.end.line < tokenAfterOperator.loc.start.line) {
                    return true;
                }
            }

            if (hasOperatorAtEndOfLineHandler(n.left)) return true;
            if (hasOperatorAtEndOfLineHandler(n.right)) return true;

            return false;
        };

        // Check if the test is a simple condition (not a complex logical expression)
        const isSimpleConditionHandler = (test) => {
            if (test.type === "Identifier") return true;

            if (test.type === "MemberExpression") return true;

            if (test.type === "UnaryExpression") return true;

            if (test.type === "BinaryExpression") return true;

            if (test.type === "CallExpression") return true;

            // Logical expression with ≤maxOperands is still simple
            // BUT if any nested group has >maxOperands, it's not simple
            if (test.type === "LogicalExpression") {
                const operandCount = collectOperandsHandler(test).length;
                const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(test);
                return operandCount <= maxOperands && !nestedGroupExceeding;
            }

            return false;
        };

        // Get the full ternary as single line text (preserving parentheses around nested ternaries)
        const getTernarySingleLineHandler = (node) => {
            const testText = sourceCode.getText(node.test).replace(/\s+/g, " ").trim();
            // Use getSourceTextWithGroupsHandler to preserve parentheses around nested expressions
            const consequentText = getSourceTextWithGroupsHandler(node.consequent).replace(/\s+/g, " ").trim();
            const alternateText = getSourceTextWithGroupsHandler(node.alternate).replace(/\s+/g, " ").trim();

            return `${testText} ? ${consequentText} : ${alternateText}`;
        };

        // Get the indentation level for the line
        const getLineIndentHandler = (node) => {
            const lineText = sourceCode.lines[node.loc.start.line - 1];

            return lineText.match(/^\s*/)[0].length;
        };

        // Check if a node contains JSX elements (recursively)
        const containsJsxHandler = (n) => {
            if (!n) return false;

            if (n.type === "JSXElement" || n.type === "JSXFragment") return true;

            if (n.type === "ParenthesizedExpression") return containsJsxHandler(n.expression);

            if (n.type === "ConditionalExpression") {
                return containsJsxHandler(n.consequent) || containsJsxHandler(n.alternate);
            }

            if (n.type === "LogicalExpression") {
                return containsJsxHandler(n.left) || containsJsxHandler(n.right);
            }

            return false;
        };

        // Check if branches have complex objects (should stay multiline)
        const hasComplexObjectHandler = (n) => {
            if (n.type === "ObjectExpression" && n.properties.length >= 2) return true;

            if (n.type === "ArrayExpression" && n.elements.length >= 3) return true;

            return false;
        };

        // Check if branches contain JSX (should stay multiline)
        const hasJsxBranchesHandler = (node) => containsJsxHandler(node.consequent) || containsJsxHandler(node.alternate);

        // Check if a nested ternary has complex condition (>maxOperands)
        const hasComplexNestedTernaryHandler = (node) => {
            const checkBranch = (branch) => {
                if (branch.type === "ConditionalExpression" && isParenthesizedHandler(branch)) {
                    const nestedOperands = collectOperandsHandler(branch.test);

                    return nestedOperands.length > maxOperands;
                }

                return false;
            };

            return checkBranch(node.consequent) || checkBranch(node.alternate);
        };

        // Check if ? or : is on its own line without its value
        const isOperatorOnOwnLineHandler = (node) => {
            const questionToken = sourceCode.getTokenAfter(node.test, (t) => t.value === "?");
            const colonToken = sourceCode.getTokenAfter(node.consequent, (t) => t.value === ":");

            // Check if ? is on different line than consequent start
            if (questionToken && node.consequent.loc.start.line !== questionToken.loc.start.line) {
                return true;
            }

            // Check if : is on different line than alternate start
            if (colonToken && node.alternate.loc.start.line !== colonToken.loc.start.line) {
                return true;
            }

            return false;
        };

        // Handle simple ternaries (≤maxOperands) - collapse or format with complex nested
        const handleSimpleTernaryHandler = (node) => {
            const isOnSingleLine = node.loc.start.line === node.loc.end.line;
            const hasOperatorOnOwnLine = isOperatorOnOwnLineHandler(node);

            // Skip unparenthesized nested ternaries (parenthesized ones count as 1 operand)
            const hasUnparenthesizedNestedTernary = (node.consequent.type === "ConditionalExpression" && !isParenthesizedHandler(node.consequent))
                || (node.alternate.type === "ConditionalExpression" && !isParenthesizedHandler(node.alternate));

            if (hasUnparenthesizedNestedTernary) {
                return false;
            }

            // Skip if branches have complex objects
            if (hasComplexObjectHandler(node.consequent) || hasComplexObjectHandler(node.alternate)) {
                return false;
            }

            // Skip ternaries with JSX branches (should stay multiline for readability)
            if (hasJsxBranchesHandler(node)) {
                return false;
            }

            // Skip parenthesized nested ternaries with complex condition (>maxOperands)
            // These should be formatted manually or stay as-is
            if (hasComplexNestedTernaryHandler(node)) {
                return false;
            }

            // Skip if already on single line and no formatting issues
            if (isOnSingleLine && !hasOperatorOnOwnLine) return false;

            // Calculate what the single line would look like
            const singleLineText = getTernarySingleLineHandler(node);

            // For ≤maxOperands conditions, always collapse to single line regardless of length
            context.report({
                fix: (fixer) => fixer.replaceText(node, singleLineText),
                message: `Ternary with ≤${maxOperands} operands should be on a single line`,
                node,
            });

            return true;
        };

        // Handle complex logical expressions - format multiline
        const handleComplexLogicalTernaryHandler = (node) => {
            const { test } = node;
            const operands = collectOperandsHandler(test);
            const testStartLine = test.loc.start.line;
            const testEndLine = test.loc.end.line;
            const isMultiLine = testStartLine !== testEndLine;

            // Check if any nested parenthesized group has >maxOperands - format multiline inline
            const nestedGroupExceeding = findNestedGroupExceedingMaxOperandsHandler(test);
            if (nestedGroupExceeding) {
                // Get indentation for formatting
                const parent = node.parent;
                let parenIndent = "";

                if (parent && parent.loc) {
                    const parentLineText = sourceCode.lines[parent.loc.start.line - 1];
                    parenIndent = parentLineText.match(/^\s*/)[0];
                }

                const contentIndent = parenIndent + "    ";

                // Build multiline text for operands inside a nested group
                // isOuterGroup=true means we're at the target group itself (ignore its own parentheses)
                // Also recursively expands any inner nested groups with >maxOperands
                const buildNestedMultilineHandler = (n, isOuterGroup = false, currentIndent = contentIndent) => {
                    if (n.type === "LogicalExpression" && (isOuterGroup || !isParenthesizedHandler(n))) {
                        const leftText = buildNestedMultilineHandler(n.left, false, currentIndent);
                        const rightText = buildNestedMultilineHandler(n.right, false, currentIndent);

                        return `${leftText}\n${currentIndent}${n.operator} ${rightText}`;
                    }

                    // Check if this is a parenthesized group with >maxOperands - also expand it
                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        const innerCount = countOperandsInsideGroupHandler(n);
                        if (innerCount > maxOperands) {
                            const innerIndent = currentIndent + "    ";
                            const buildInner = (inner) => {
                                if (inner.type === "LogicalExpression" && !isParenthesizedHandler(inner)) {
                                    const l = buildInner(inner.left);
                                    const r = buildInner(inner.right);

                                    return `${l}\n${innerIndent}${inner.operator} ${r}`;
                                }

                                return getSourceTextWithGroupsHandler(inner);
                            };

                            const innerLeft = buildInner(n.left);
                            const innerRight = buildInner(n.right);

                            return `(\n${innerIndent}${innerLeft}\n${innerIndent}${n.operator} ${innerRight}\n${currentIndent})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Build the full condition with nested group formatted multiline
                const buildFullConditionHandler = (n, targetNode) => {
                    if (n === targetNode) {
                        // This is the nested group - format it multiline
                        // Pass true to ignore outer parentheses check
                        const nestedText = buildNestedMultilineHandler(n, true);

                        return `(\n${contentIndent}${nestedText}\n${parenIndent})`;
                    }

                    if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                        const leftText = buildFullConditionHandler(n.left, targetNode);
                        const rightText = buildFullConditionHandler(n.right, targetNode);

                        return `${leftText} ${n.operator} ${rightText}`;
                    }

                    if (n.type === "LogicalExpression" && isParenthesizedHandler(n)) {
                        // Check if this contains the target
                        const containsTargetHandler = (node, target) => {
                            if (node === target) return true;
                            if (node.type === "LogicalExpression") {
                                return containsTargetHandler(node.left, target) || containsTargetHandler(node.right, target);
                            }

                            return false;
                        };

                        if (containsTargetHandler(n, targetNode)) {
                            const innerText = buildFullConditionHandler(n, targetNode);

                            return `(${innerText})`;
                        }
                    }

                    return getSourceTextWithGroupsHandler(n);
                };

                // Check if already correctly formatted
                // Collect operands INSIDE the nested group (not treating the group itself as 1 operand)
                const collectInsideGroupHandler = (node) => {
                    const operands = [];
                    const collectHelper = (n) => {
                        if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                            collectHelper(n.left);
                            collectHelper(n.right);
                        } else {
                            operands.push(n);
                        }
                    };

                    // Start from children directly, ignoring outer parentheses
                    if (node.type === "LogicalExpression") {
                        collectHelper(node.left);
                        collectHelper(node.right);
                    }

                    return operands;
                };

                const nestedOperands = collectInsideGroupHandler(nestedGroupExceeding);
                const allOnDifferentLines = nestedOperands.every((op, i) => {
                    if (i === 0) return true;

                    return op.loc.start.line !== nestedOperands[i - 1].loc.start.line;
                });

                if (!allOnDifferentLines) {
                    const newCondition = buildFullConditionHandler(test, nestedGroupExceeding);

                    // Get consequent and alternate text
                    const consequentText = getSourceTextWithGroupsHandler(node.consequent).replace(/\s+/g, " ").trim();
                    const alternateText = getSourceTextWithGroupsHandler(node.alternate).replace(/\s+/g, " ").trim();

                    context.report({
                        fix: (fixer) => fixer.replaceText(node, `${newCondition} ? ${consequentText} : ${alternateText}`),
                        message: `Nested condition with >${maxOperands} operands should be formatted multiline`,
                        node: nestedGroupExceeding,
                    });

                    return;
                }
            }

            // ≤maxOperands operands: collapse to single line
            // BUT skip if any nested group has >maxOperands (already expanded or needs expansion)
            if (operands.length <= maxOperands) {
                // Check if any nested parenthesized group has >maxOperands (should stay multiline)
                const hasExpandedNestedGroup = findNestedGroupExceedingMaxOperandsHandler(test);
                if (hasExpandedNestedGroup) {
                    return; // Don't collapse - nested group needs multiline
                }

                // Skip if branches have complex objects or JSX elements
                const hasComplexBranches = hasComplexObjectHandler(node.consequent) || hasComplexObjectHandler(node.alternate);

                // Skip ternaries with JSX branches (should stay multiline for readability)
                if (hasJsxBranchesHandler(node)) {
                    return;
                }

                // Skip unparenthesized nested ternaries (parenthesized ones count as 1 operand)
                const hasUnparenthesizedNestedTernary = (node.consequent.type === "ConditionalExpression" && !isParenthesizedHandler(node.consequent))
                    || (node.alternate.type === "ConditionalExpression" && !isParenthesizedHandler(node.alternate));

                // Skip parenthesized nested ternaries with complex condition (>maxOperands)
                if (hasComplexBranches || hasUnparenthesizedNestedTernary || hasComplexNestedTernaryHandler(node)) {
                    return;
                }

                // Check if already properly formatted (single line)
                const isOnSingleLine = node.loc.start.line === node.loc.end.line;
                const hasOperatorOnOwnLine = isOperatorOnOwnLineHandler(node);

                if (isOnSingleLine && !hasOperatorOnOwnLine) {
                    return;
                }

                // Collapse to single line
                const singleLineText = getTernarySingleLineHandler(node);

                context.report({
                    fix: (fixer) => fixer.replaceText(node, singleLineText),
                    message: `Ternary with ≤${maxOperands} operands should be on a single line`,
                    node,
                });

                return;
            }

            // More than maxOperands: each on its own line
            let isCorrectionNeeded = !isMultiLine;
            const parent = node.parent;

            if (isMultiLine) {
                for (let i = 0; i < operands.length - 1; i += 1) {
                    if (operands[i].loc.end.line === operands[i + 1].loc.start.line) {
                        isCorrectionNeeded = true;
                        break;
                    }
                }

                // Check if any operator is at end of line (should be at beginning)
                if (!isCorrectionNeeded && hasOperatorAtEndOfLineHandler(test)) {
                    isCorrectionNeeded = true;
                }

                // Check if ? is on same line as end of multiline condition (BAD - should be on its own line)
                if (!isCorrectionNeeded) {
                    const questionToken = sourceCode.getTokenAfter(test, (t) => t.value === "?");

                    if (questionToken && questionToken.loc.start.line === test.loc.end.line) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check for empty lines before ? (between condition and ?)
                if (!isCorrectionNeeded) {
                    const questionToken = sourceCode.getTokenAfter(test, (t) => t.value === "?");

                    if (questionToken && questionToken.loc.start.line > test.loc.end.line + 1) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check for empty lines before : (between consequent and :)
                if (!isCorrectionNeeded) {
                    const colonToken = sourceCode.getTokenAfter(node.consequent, (t) => t.value === ":");

                    if (colonToken && colonToken.loc.start.line > node.consequent.loc.end.line + 1) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check if ? or : is on its own line without its value
                if (!isCorrectionNeeded && isOperatorOnOwnLineHandler(node)) {
                    isCorrectionNeeded = true;
                }

                // Check if : is on same line as ? (both should be on their own lines for multiline)
                if (!isCorrectionNeeded) {
                    const questionToken = sourceCode.getTokenAfter(test, (t) => t.value === "?");
                    const colonToken = sourceCode.getTokenAfter(node.consequent, (t) => t.value === ":");

                    if (questionToken && colonToken && questionToken.loc.start.line === colonToken.loc.start.line) {
                        isCorrectionNeeded = true;
                    }
                }

                // Check if first operand is not on same line as parent property key
                if (!isCorrectionNeeded && parent && parent.type === "Property" && parent.value === node) {
                    const keyEndLine = parent.key.loc.end.line;
                    const firstOperandLine = operands[0].loc.start.line;

                    if (firstOperandLine !== keyEndLine) {
                        isCorrectionNeeded = true;
                    }
                }
            }

            if (isCorrectionNeeded) {
                context.report({
                    fix: (fixer) => {
                        // Get proper base indent
                        let baseIndent;
                        let includePropertyKey = false;
                        let propertyKeyText = "";

                        // Check if parent is Property and value starts on different line
                        if (parent && parent.type === "Property" && parent.value === node) {
                            const keyEndLine = parent.key.loc.end.line;
                            const firstOperandLine = operands[0].loc.start.line;

                            if (firstOperandLine !== keyEndLine) {
                                // Need to include property key in fix
                                includePropertyKey = true;
                                propertyKeyText = sourceCode.getText(parent.key) + ": ";
                                const propertyLineText = sourceCode.lines[parent.loc.start.line - 1];

                                baseIndent = propertyLineText.match(/^\s*/)[0];
                            }
                        }

                        if (!baseIndent) {
                            const lineText = sourceCode.lines[node.loc.start.line - 1];

                            baseIndent = lineText.match(/^\s*/)[0];
                        }

                        const conditionIndent = baseIndent + "    ";

                        const buildMultilineHandler = (n) => {
                            if (n.type === "LogicalExpression" && !isParenthesizedHandler(n)) {
                                const leftText = buildMultilineHandler(n.left);
                                const rightText = buildMultilineHandler(n.right);

                                return `${leftText}\n${conditionIndent}${n.operator} ${rightText}`;
                            }

                            return getSourceTextWithGroupsHandler(n);
                        };

                        const consequentText = sourceCode.getText(node.consequent);
                        const alternateText = sourceCode.getText(node.alternate);

                        // Build multiline with ? and : each on their own lines
                        const conditionPart = buildMultilineHandler(test);
                        const newText = `${conditionPart}\n${conditionIndent}? ${consequentText}\n${conditionIndent}: ${alternateText}`;

                        if (includePropertyKey) {
                            // Replace the entire property value including fixing the key position
                            return fixer.replaceTextRange(
                                [parent.key.range[0], node.range[1]],
                                `${propertyKeyText}${newText}`,
                            );
                        }

                        return fixer.replaceText(node, newText);
                    },
                    message: `Ternary conditions with more than ${maxOperands} operands should be multiline, with each operand on its own line`,
                    node: test,
                });
            }
        };

        // Check if this ternary is a nested ternary inside another ternary's branch
        const isNestedInTernaryBranchHandler = (node) => {
            let parent = node.parent;

            // Walk up through parentheses
            while (parent && parent.type === "ParenthesizedExpression") {
                parent = parent.parent;
            }

            // Check if parent is a ternary and this node is in consequent or alternate
            if (parent && parent.type === "ConditionalExpression") {
                return parent.consequent === node || parent.alternate === node
                    || (node.parent.type === "ParenthesizedExpression"
                        && (parent.consequent === node.parent || parent.alternate === node.parent));
            }

            return false;
        };

        return {
            ConditionalExpression(node) {
                const { test } = node;

                // Skip nested ternaries that are inside another ternary's branch
                // They will be formatted by their parent ternary
                if (isNestedInTernaryBranchHandler(node)) {
                    return;
                }

                // Check for excessive nesting depth in the condition
                if (test.type === "LogicalExpression") {
                    const nestingDepth = getNestingDepthHandler(test);

                    if (nestingDepth > maxNestingLevel) {
                        const deepGroup = findDeepNestedGroupHandler(test);

                        if (deepGroup) {
                            const groupText = getSourceTextWithGroupsHandler(deepGroup.node);

                            // Generate unique variable name
                            let varName = `is${getConditionNameHandler(deepGroup.node)}`;
                            // Limit length and sanitize
                            if (varName.length > 30) {
                                varName = "isNestedCondition";
                            }

                            context.report({
                                fix: (fixer) => {
                                    const fixes = [];

                                    // Get the line before the ternary statement for inserting the variable
                                    // Find the statement that contains this ternary
                                    let statementNode = node;
                                    while (statementNode.parent && statementNode.parent.type !== "Program" && statementNode.parent.type !== "BlockStatement") {
                                        statementNode = statementNode.parent;
                                    }

                                    const ternaryLine = statementNode.loc.start.line;
                                    const lineStart = sourceCode.getIndexFromLoc({ line: ternaryLine, column: 0 });
                                    const lineText = sourceCode.lines[ternaryLine - 1];
                                    const indent = lineText.match(/^\s*/)[0];

                                    // Insert variable declaration before the statement containing the ternary
                                    fixes.push(fixer.insertTextBeforeRange(
                                        [lineStart, lineStart],
                                        `const ${varName} = ${groupText};\n${indent}`,
                                    ));

                                    // Replace the nested group with the variable name in the condition
                                    // We need to replace including the parentheses around the group
                                    const tokenBefore = sourceCode.getTokenBefore(deepGroup.node);
                                    const tokenAfter = sourceCode.getTokenAfter(deepGroup.node);

                                    if (tokenBefore && tokenAfter && tokenBefore.value === "(" && tokenAfter.value === ")") {
                                        fixes.push(fixer.replaceTextRange(
                                            [tokenBefore.range[0], tokenAfter.range[1]],
                                            varName,
                                        ));
                                    } else {
                                        fixes.push(fixer.replaceText(deepGroup.node, varName));
                                    }

                                    return fixes;
                                },
                                message: `Ternary condition nesting depth (${nestingDepth}) exceeds maximum (${maxNestingLevel}). Extract deeply nested condition to a variable.`,
                                node: deepGroup.node,
                            });

                            return; // Don't process other rules for this statement
                        }
                    }
                }

                // First, try to collapse simple ternaries to single line
                if (isSimpleConditionHandler(test)) {
                    if (handleSimpleTernaryHandler(node)) return;
                }

                // For complex logical expressions, handle multiline formatting
                if (test.type === "LogicalExpression") {
                    handleComplexLogicalTernaryHandler(node);
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent ternary formatting based on condition operand count: ≤maxOperands collapses to single line, >maxOperands expands to multiline" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxOperands: {
                        default: 3,
                        description: "Maximum condition operands to keep ternary on single line (default: 3). Also applies to nested groups.",
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
 * Rule: Logical Expression Multiline
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce multiline formatting for logical expressions with more
 *   than maxOperands. This applies to variable declarations, return
 *   statements, assignment expressions, and other contexts.
 *
 * Options:
 *   { maxOperands: 3 } - Maximum operands on single line (default: 3)
 *
 * ✓ Good:
 *   const err = data.error
 *       || data.message
 *       || data.status
 *       || data.fallback;
 *
 * ✗ Bad:
 *   const err = data.error || data.message || data.status || data.fallback;
 */
const logicalExpressionMultiline = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxOperands = options.maxOperands !== undefined ? options.maxOperands : 3;

        // Check if node is wrapped in parentheses
        const isParenthesizedHandler = (node) => {
            const tokenBefore = sourceCode.getTokenBefore(node);
            const tokenAfter = sourceCode.getTokenAfter(node);

            if (!tokenBefore || !tokenAfter) return false;

            return tokenBefore.value === "(" && tokenAfter.value === ")";
        };

        // Collect all operands from a logical expression (flattening non-parenthesized ones)
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

        // Get the operator between two operands
        const getOperatorHandler = (leftNode, rightNode) => {
            const tokens = sourceCode.getTokensBetween(leftNode, rightNode);
            const opToken = tokens.find((t) => t.value === "||" || t.value === "&&" || t.value === "??" || t.value === "|" || t.value === "&");

            return opToken ? opToken.value : "||";
        };

        // Check if the expression is already multiline
        const isMultilineHandler = (node) => node.loc.start.line !== node.loc.end.line;

        // Check if we're inside an if condition or ternary test (handled by other rules)
        const isInIfOrTernaryHandler = (node) => {
            let current = node.parent;

            while (current) {
                if (current.type === "IfStatement" && current.test === node) return true;

                if (current.type === "ConditionalExpression" && current.test === node) return true;

                // Stop if we hit a statement or declaration boundary
                if (current.type.includes("Statement") || current.type.includes("Declaration")) return false;

                current = current.parent;
            }

            return false;
        };

        // Handle logical expression
        const checkLogicalExpressionHandler = (node) => {
            // Only process top-level logical expressions (not nested ones)
            if (node.parent.type === "LogicalExpression" && !isParenthesizedHandler(node)) return;

            // Skip if this is in an if condition or ternary test (handled by other rules)
            if (isInIfOrTernaryHandler(node)) return;

            // Collect all operands
            const operands = collectOperandsHandler(node);

            // Case 1: Simple expression (≤maxOperands) that's multiline → collapse to single line
            if (operands.length <= maxOperands) {
                if (isMultilineHandler(node)) {
                    // Skip if any operand is itself multiline (e.g., JSX elements, function calls)
                    const hasMultilineOperand = operands.some((op) => op.loc.start.line !== op.loc.end.line);

                    if (hasMultilineOperand) return;

                    context.report({
                        fix(fixer) {
                            // Build single line: operand1 op operand2 op operand3
                            const parts = [sourceCode.getText(operands[0])];

                            for (let i = 1; i < operands.length; i++) {
                                const operator = getOperatorHandler(operands[i - 1], operands[i]);
                                parts.push(` ${operator} ${sourceCode.getText(operands[i])}`);
                            }

                            return fixer.replaceText(node, parts.join(""));
                        },
                        message: `Logical expression with ${operands.length} operands should be on a single line (max for multiline: ${maxOperands})`,
                        node,
                    });
                }

                return;
            }

            // Case 2: Complex expression (>maxOperands) → enforce multiline
            // Check if already properly multiline
            if (isMultilineHandler(node)) {
                // Check if each operand is on its own line
                let allOnOwnLines = true;

                for (let i = 1; i < operands.length; i++) {
                    if (operands[i].loc.start.line === operands[i - 1].loc.end.line) {
                        allOnOwnLines = false;
                        break;
                    }
                }

                if (allOnOwnLines) return;
            }

            // Report and fix
            context.report({
                fix(fixer) {
                    // Build the formatted expression
                    const firstOperandText = sourceCode.getText(operands[0]);

                    // Get the line containing the first operand
                    const firstToken = sourceCode.getFirstToken(operands[0]);
                    const lineStart = sourceCode.text.lastIndexOf("\n", firstToken.range[0]) + 1;
                    const lineContent = sourceCode.text.slice(lineStart, firstToken.range[0]);

                    // Extract only the whitespace indentation from the line
                    const indentMatch = lineContent.match(/^(\s*)/);
                    const baseIndent = indentMatch ? indentMatch[1] : "";

                    // Build each line: first operand, then operator + operand for each subsequent
                    const lines = [firstOperandText];

                    for (let i = 1; i < operands.length; i++) {
                        const operator = getOperatorHandler(operands[i - 1], operands[i]);
                        const operandText = sourceCode.getText(operands[i]);
                        lines.push(`${baseIndent}    ${operator} ${operandText}`);
                    }

                    // Get the full range of the expression
                    const fullText = lines.join("\n");

                    return fixer.replaceText(node, fullText);
                },
                message: `Logical expression with ${operands.length} operands should be on multiple lines (max: ${maxOperands})`,
                node,
            });
        };

        return {
            LogicalExpression: checkLogicalExpressionHandler,
        };
    },
    meta: {
        docs: { description: "Enforce single line for ≤maxOperands, multiline for >maxOperands logical expressions" },
        fixable: "code",
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
 * Rule: Empty Line After Block
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Require an empty line between a closing brace `}` of a block
 *   statement (if, try, for, while, etc.) and the next statement,
 *   unless the next statement is part of the same construct (else, catch, finally).
 *
 * Note: Consecutive if statements are handled by if-else-spacing rule.
 *
 * ✓ Good:
 *   if (condition) {
 *       doSomething();
 *   }
 *
 *   const x = 1;
 *
 * ✗ Bad:
 *   if (condition) {
 *       doSomething();
 *   }
 *   const x = 1;
 */
const emptyLineAfterBlock = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Check if a node is a block-containing statement
        const isBlockStatementHandler = (node) => {
            const blockTypes = [
                "IfStatement",
                "ForStatement",
                "ForInStatement",
                "ForOfStatement",
                "WhileStatement",
                "DoWhileStatement",
                "TryStatement",
                "SwitchStatement",
                "WithStatement",
            ];

            return blockTypes.includes(node.type);
        };

        // Get the actual end line of a statement (including else, catch, finally)
        const getStatementEndLineHandler = (node) => {
            if (node.type === "IfStatement" && node.alternate) {
                return getStatementEndLineHandler(node.alternate);
            }

            if (node.type === "TryStatement") {
                if (node.finalizer) return node.finalizer.loc.end.line;

                if (node.handler) return node.handler.loc.end.line;
            }

            return node.loc.end.line;
        };

        return {
            "BlockStatement:exit"(node) {
                const parent = node.parent;

                // Only check for block-containing statements
                if (!parent || !isBlockStatementHandler(parent)) return;

                // Skip if this block is followed by else, catch, or finally
                if (parent.type === "IfStatement" && parent.consequent === node && parent.alternate) {
                    return;
                }

                if (parent.type === "TryStatement" && (parent.block === node || parent.handler?.body === node) && (parent.handler || parent.finalizer)) {
                    if (parent.block === node && (parent.handler || parent.finalizer)) return;

                    if (parent.handler?.body === node && parent.finalizer) return;
                }

                // Get the parent's container (the block that contains the parent statement)
                const grandparent = parent.parent;

                if (!grandparent || grandparent.type !== "BlockStatement") return;

                // Find the index of the parent statement in the grandparent's body
                const stmtIndex = grandparent.body.indexOf(parent);

                if (stmtIndex === -1 || stmtIndex === grandparent.body.length - 1) return;

                // Get the next statement
                const nextStmt = grandparent.body[stmtIndex + 1];

                // Skip consecutive if statements - handled by if-else-spacing rule
                if (parent.type === "IfStatement" && nextStmt.type === "IfStatement") {
                    return;
                }

                // Get the actual end of the current statement
                const currentEndLine = getStatementEndLineHandler(parent);
                const nextStartLine = nextStmt.loc.start.line;

                // Check if there's an empty line between them
                if (nextStartLine - currentEndLine < 2) {
                    context.report({
                        fix: (fixer) => {
                            const endToken = sourceCode.getLastToken(parent);

                            return fixer.insertTextAfter(endToken, "\n");
                        },
                        message: "Expected empty line after block statement",
                        node: nextStmt,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Require empty line between block statement closing brace and next statement" },
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

export {
    blockStatementNewlines,
    ifStatementFormat,
    ifElseSpacing,
    multilineIfConditions,
    ternaryConditionMultiline,
    logicalExpressionMultiline,
    emptyLineAfterBlock,
    noEmptyLinesInSwitchCases,
};
