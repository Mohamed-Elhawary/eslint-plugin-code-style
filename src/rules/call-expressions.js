import { DEFAULT_MAX_CLASS_COUNT, DEFAULT_MAX_CLASS_LENGTH } from "../utils/tailwind.js";

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

                // For single template literal: don't reformat, but fix back if already on separate line
                if (args[0].type === "TemplateLiteral") {
                    const openParen = sourceCode.getTokenAfter(
                        node.callee,
                        (token) => token.value === "(",
                    );
                    const closeParen = sourceCode.getLastToken(node);

                    if (openParen && closeParen && openParen.loc.end.line !== args[0].loc.start.line) {
                        // Template literal is on a separate line — collapse back to fn(`...`)
                        const argText = sourceCode.getText(args[0]);

                        // Include type arguments if they exist
                        const typeArgs = node.typeArguments || node.typeParameters;
                        let calleeText = sourceCode.getText(node.callee);

                        if (typeArgs) {
                            calleeText += sourceCode.getText(typeArgs);
                        }

                        context.report({
                            fix: (fixer) => fixer.replaceText(node, `${calleeText}(${argText})`),
                            message: "Single template literal argument should start on same line as function call",
                            node,
                        });
                    }

                    return;
                }
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
                    message: "With multiple arguments, first argument should be on its own line: fn(\\n    arg1,\\n    arg2,\\n)",
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

        // Helper to check and fix closing brackets pattern for arrow returning object
        const checkArrowReturningObjectHandler = (node, objectBody) => {
            // Find closing tokens: } ) ) (may have comma)
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

                return;
            }

            // Check for || [] pattern after })) - should be on same line
            const tokenAfterOuterParen = sourceCode.getTokenAfter(closeParenOuter);

            if (tokenAfterOuterParen && tokenAfterOuterParen.value === "||") {
                if (closeParenOuter.loc.end.line !== tokenAfterOuterParen.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [closeParenOuter.range[1], tokenAfterOuterParen.range[0]],
                            " ",
                        ),
                        message: "Logical operator || should be on the same line as closing ))",
                        node: tokenAfterOuterParen,
                    });
                }
            }
        };

        // Helper to check },\n); pattern - ONLY for single object/array argument calls
        // This should NOT apply to multi-argument calls like useEffect, useMemo, etc.
        const checkClosingBraceParenPatternHandler = (node) => {
            const { arguments: args } = node;

            // Only apply to single argument calls
            if (args.length !== 1) return;

            const lastArg = args[0];

            // Find the actual closing brace - could be from object, array, or TSAsExpression with type literal
            let closingBrace = null;

            if (lastArg.type === "ObjectExpression" || lastArg.type === "ArrayExpression") {
                closingBrace = sourceCode.getLastToken(lastArg);
            } else if (lastArg.type === "ArrowFunctionExpression") {
                const body = lastArg.body;

                if (body.type === "TSAsExpression" && body.typeAnnotation && body.typeAnnotation.type === "TSTypeLiteral") {
                    closingBrace = sourceCode.getLastToken(body.typeAnnotation);
                } else if (body.type === "ObjectExpression" || body.type === "ArrayExpression") {
                    closingBrace = sourceCode.getLastToken(body);
                }
            }

            if (!closingBrace || (closingBrace.value !== "}" && closingBrace.value !== "]")) return;

            // Get the close paren of the function call
            const closeParen = sourceCode.getLastToken(node);

            if (!closeParen || closeParen.value !== ")") return;

            // Check if there's a newline between the closing brace/type and the close paren
            const tokenAfterBrace = sourceCode.getTokenAfter(closingBrace);

            // Handle trailing comma case: }, or ],
            let lastTokenBeforeParen = closingBrace;

            if (tokenAfterBrace && tokenAfterBrace.value === ",") {
                lastTokenBeforeParen = tokenAfterBrace;
            }

            if (lastTokenBeforeParen.loc.end.line !== closeParen.loc.start.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastTokenBeforeParen.range[1], closeParen.range[0]],
                        "",
                    ),
                    message: "Closing parenthesis should be on same line as closing brace: });",
                    node: closeParen,
                });
            }
        };

        return {
            CallExpression(node) {
                const { callee, arguments: args } = node;

                // Check for },\n); pattern - only for single argument calls
                checkClosingBraceParenPatternHandler(node);

                if (args.length !== 1) return;

                const arg = args[0];

                // Check for arrow function with object expression body
                if (arg.type !== "ArrowFunctionExpression" || arg.body.type !== "ObjectExpression") return;

                // Pattern 1: fn()(arg) where fn() is also a CallExpression
                // e.g., styled(Card)(({ theme }) => ({...}))
                if (callee.type === "CallExpression") {
                    checkArrowReturningObjectHandler(node, arg.body);

                    return;
                }

                // Pattern 2: obj.method(arg) where method is like .map()
                // e.g., array.map(item => ({...})) || []
                if (callee.type === "MemberExpression") {
                    checkArrowReturningObjectHandler(node, arg.body);
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
            // For TypeScript, preserve type arguments: fn\n<T>( should become fn<T>(
            const calleeLastToken = sourceCode.getLastToken(callee);

            // Get type arguments if they exist (TypeScript generics)
            const typeArgs = node.typeArguments || node.typeParameters;

            // Find the opening paren - it comes after type arguments if they exist
            let openParenToken;

            if (typeArgs) {
                openParenToken = sourceCode.getTokenAfter(typeArgs);
            } else {
                openParenToken = sourceCode.getTokenAfter(callee);
            }

            // Make sure we found the opening paren
            if (!openParenToken || openParenToken.value !== "(") {
                // Search for it
                let searchToken = sourceCode.getTokenAfter(callee);

                while (searchToken && searchToken.range[0] < node.range[1]) {
                    if (searchToken.value === "(") {
                        openParenToken = searchToken;

                        break;
                    }

                    searchToken = sourceCode.getTokenAfter(searchToken);
                }
            }

            if (!openParenToken || openParenToken.value !== "(") return;

            // Check if callee and opening paren are on different lines
            if (calleeLastToken.loc.end.line !== openParenToken.loc.start.line) {
                // If type arguments exist and are multiline, this is expected - don't report
                if (typeArgs && typeArgs.loc.start.line !== typeArgs.loc.end.line) {
                    return;
                }

                // Build the replacement text: type arguments (if any) + opening paren
                let replacement = "";

                if (typeArgs) {
                    // Get the type arguments text directly from source
                    replacement = sourceCode.getText(typeArgs);
                }

                replacement += "(";

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [calleeLastToken.range[1], openParenToken.range[1]],
                        replacement,
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
                // Skip if there are multiple arguments - function-arguments-format handles that case
                // to avoid circular fixes where this rule wants fn((param) and that rule wants fn(\n    (param)
                if (args.length > 1) return;

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

                    // First, ensure fn( and (( are on same line: useSelector(\n(state) => fn((state)
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

                    if (arrowOpenParen.loc.end.line !== firstParam.loc.start.line) {
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

                // For simple single-line call expressions, closing } should be on same line
                const isSingleLineCall = expression.loc.start.line === expression.loc.end.line;

                if (isSingleLineCall && expression.loc.end.line !== closeBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [expression.range[1], closeBrace.range[0]],
                            "",
                        ),
                        message: "Closing brace should be on the same line as simple call expression",
                        node: closeBrace,
                    });
                }

                return;
            }

            // Case 2b: TemplateLiteral - collapse to single line if simple enough
            if (expression.type === "TemplateLiteral") {
                // Check if all expressions in template are simple (Identifier or MemberExpression)
                const allSimpleExpressions = expression.expressions.every(
                    (expr) => expr.type === "Identifier" || expr.type === "MemberExpression",
                );

                if (allSimpleExpressions) {
                    // Build the collapsed template literal
                    const quasis = expression.quasis;
                    const expressions = expression.expressions;
                    let collapsedText = "`";

                    const collapsedParts = [];

                    for (let i = 0; i < quasis.length; i += 1) {
                        // Collapse whitespace in quasi (newlines → spaces)
                        const quasiText = quasis[i].value.raw.replace(/\s*\n\s*/g, " ").trim();

                        if (quasiText) collapsedParts.push(quasiText);

                        if (i < expressions.length) {
                            collapsedParts.push("${" + sourceCode.getText(expressions[i]) + "}");
                        }
                    }

                    collapsedText = "`" + collapsedParts.join(" ") + "`";

                    // For className attributes, check if collapsed result exceeds multiline thresholds
                    // If so, keep the multiline format (classname-multiline will enforce it)
                    const parentAttr = node.parent;
                    const isClassNameAttr = parentAttr && parentAttr.type === "JSXAttribute"
                        && parentAttr.name && parentAttr.name.name === "className";

                    if (isClassNameAttr) {
                        const innerContent = collapsedText.slice(1, -1); // strip backticks
                        const staticParts = innerContent.replace(/\$\{[^}]+\}/g, "").trim();
                        const classes = staticParts.split(/\s+/).filter(Boolean);
                        const dynamicCount = expressions.length;
                        const maxClassCount = DEFAULT_MAX_CLASS_COUNT;
                        const maxLen = DEFAULT_MAX_CLASS_LENGTH;

                        // If exceeds thresholds, skip collapsing — keep multiline
                        if (classes.length + dynamicCount > maxClassCount || innerContent.length > maxLen) {
                            return;
                        }

                        // Under thresholds: collapse and convert to string literal if no expressions
                        if (expressions.length === 0) {
                            const classString = staticParts;
                            const collapsedAttrValue = `"${classString}"`;

                            const isMultiLine = expression.loc.start.line !== expression.loc.end.line;
                            const openingBraceOnDifferentLine = openBrace.loc.end.line !== expression.loc.start.line;

                            if (isMultiLine || openingBraceOnDifferentLine) {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [openBrace.range[0], closeBrace.range[1]],
                                        collapsedAttrValue,
                                    ),
                                    message: "Short className should use a string literal on a single line",
                                    node: expression,
                                });
                            }

                            return;
                        }
                    }

                    // Only fix if the result is reasonable length and different from original
                    const isMultiLine = expression.loc.start.line !== expression.loc.end.line;
                    const openingBraceOnDifferentLine = openBrace.loc.end.line !== expression.loc.start.line;
                    const closingBraceOnDifferentLine = expression.loc.end.line !== closeBrace.loc.start.line;

                    if ((isMultiLine || openingBraceOnDifferentLine || closingBraceOnDifferentLine) && collapsedText.length <= 80) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], closeBrace.range[0]],
                                collapsedText,
                            ),
                            message: "Simple template literal should be on a single line",
                            node: expression,
                        });
                    }
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

                    return;
                }

                // Check if parent JSX element should be collapsed to single line
                // e.g., <span>\n    {strings.label}\n</span> → <span>{strings.label}</span>
                const parent = node.parent;

                if (parent && parent.type === "JSXElement") {
                    const children = parent.children.filter(
                        (child) => !(child.type === "JSXText" && /^\s*$/.test(child.value)),
                    );

                    // Only collapse if this expression is the only meaningful child
                    if (children.length === 1 && children[0] === node) {
                        const openingTag = parent.openingElement;
                        const closingTag = parent.closingElement;

                        if (closingTag) {
                            const openTagEnd = openingTag.loc.end.line;
                            const closeTagStart = closingTag.loc.start.line;

                            // Check if element spans multiple lines but content is simple
                            if (openTagEnd !== closeTagStart) {
                                const openTagText = sourceCode.getText(openingTag);
                                const closeTagText = sourceCode.getText(closingTag);
                                const expressionText = sourceCode.getText(node);
                                const collapsedLength = openTagText.length + expressionText.length + closeTagText.length;

                                // Only collapse if total length is reasonable
                                if (collapsedLength <= 120) {
                                    context.report({
                                        fix: (fixer) => fixer.replaceTextRange(
                                            [openingTag.range[1], closingTag.range[0]],
                                            expressionText,
                                        ),
                                        message: "JSX element with simple expression should be on single line",
                                        node: parent,
                                    });
                                }
                            }
                        }
                    }
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

            // Case 5: LogicalExpression - handle based on complexity
            if (expression.type === "LogicalExpression") {
                // Count total operands in the logical expression
                const countOperandsHandler = (n) => {
                    if (n.type === "LogicalExpression") {
                        return countOperandsHandler(n.left) + countOperandsHandler(n.right);
                    }

                    return 1;
                };

                const operandCount = countOperandsHandler(expression);
                const expressionText = sourceCode.getText(expression);
                const isMultiLine = expression.loc.start.line !== expression.loc.end.line;

                // Simple expression (2 operands, <= 80 chars) - collapse to single line
                if (operandCount <= 2 && expressionText.length <= 80) {
                    const collapsedText = expressionText.replace(/\s*\n\s*/g, " ");

                    if (isMultiLine || openBrace.loc.end.line !== expression.loc.start.line
                        || expression.loc.end.line !== closeBrace.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBrace.range[1], closeBrace.range[0]],
                                collapsedText,
                            ),
                            message: "Simple logical expression should be on a single line",
                            node: expression,
                        });

                        return;
                    }

                    // Check if parent JSX element should be collapsed to single line
                    const parent = node.parent;

                    if (parent && parent.type === "JSXElement") {
                        const children = parent.children.filter(
                            (child) => !(child.type === "JSXText" && /^\s*$/.test(child.value)),
                        );

                        // Only collapse if this expression is the only meaningful child
                        if (children.length === 1 && children[0] === node) {
                            const openingTag = parent.openingElement;
                            const closingTag = parent.closingElement;

                            if (closingTag) {
                                const openTagEnd = openingTag.loc.end.line;
                                const closeTagStart = closingTag.loc.start.line;

                                // Check if element spans multiple lines but content is simple
                                if (openTagEnd !== closeTagStart) {
                                    const openTagText = sourceCode.getText(openingTag);
                                    const closeTagText = sourceCode.getText(closingTag);
                                    const collapsedExpr = "{" + collapsedText + "}";
                                    const collapsedLength = openTagText.length + collapsedExpr.length + closeTagText.length;

                                    // Only collapse if total length is reasonable
                                    if (collapsedLength <= 120) {
                                        context.report({
                                            fix: (fixer) => fixer.replaceTextRange(
                                                [openingTag.range[1], closingTag.range[0]],
                                                collapsedExpr,
                                            ),
                                            message: "JSX element with simple logical expression should be on single line",
                                            node: parent,
                                        });
                                    }
                                }
                            }
                        }
                    }

                    return;
                }

                // Complex expression (3+ operands) - closing } should be on its own line
                if (operandCount >= 3 && isMultiLine) {
                    // Ensure opening { and expression start are on same line
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

                    // Ensure closing } is on its own line after multiline expression
                    if (expression.loc.end.line === closeBrace.loc.start.line) {
                        // Get the indentation from the line with the opening brace
                        const openBraceLine = sourceCode.lines[openBrace.loc.start.line - 1];
                        const indent = openBraceLine.match(/^\s*/)[0];

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [expression.range[1], closeBrace.range[0]],
                                "\n" + indent,
                            ),
                            message: "Closing brace should be on its own line for multiline logical expression",
                            node: closeBrace,
                        });
                    }

                    return;
                }

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

                // Check if a condition expression is split incorrectly across lines
                // (operator and operands should be on the same line)
                // BUT skip if it's intentionally formatted multiline (operator at start of line pattern)
                const checkConditionSplitHandler = (conditionNode) => {
                    // Handle LogicalExpression (&&, ||) and BinaryExpression (===, !==, etc.)
                    if (conditionNode.type !== "LogicalExpression" && conditionNode.type !== "BinaryExpression") {
                        return false;
                    }

                    const { left, right } = conditionNode;

                    // Check if this expression spans multiple lines
                    if (conditionNode.loc.start.line !== conditionNode.loc.end.line) {
                        // Check if this is intentionally formatted multiline
                        // (pattern: operator at start of line, e.g., multiline-if-conditions format)
                        const condOperator = sourceCode.getTokenAfter(
                            left,
                            (t) => ["&&", "||", "===", "!==", "==", "!=", ">", "<", ">=", "<="].includes(t.value),
                        );

                        if (condOperator) {
                            // Check for intentional multiline format: operator at start of line with proper indentation
                            // This pattern indicates multiline-if-conditions has formatted it this way
                            const textBetween = sourceCode.text.slice(left.range[1], condOperator.range[0]);
                            const hasNewlineBeforeOperator = textBetween.includes("\n");
                            const operatorIsAtLineStart = hasNewlineBeforeOperator
                                && /\n\s*$/.test(textBetween);

                            // Skip collapsing if operator is intentionally at the start of a line
                            if (operatorIsAtLineStart) {
                                return false;
                            }

                            const leftEndLine = left.loc.end.line;
                            const operatorLine = condOperator.loc.start.line;
                            const rightStartLine = right.loc.start.line;

                            // Bad: operator or operands on different lines (not intentional format)
                            if (leftEndLine !== operatorLine || operatorLine !== rightStartLine) {
                                const tokenBefore = sourceCode.getTokenBefore(conditionNode);
                                const tokenAfter = sourceCode.getTokenAfter(conditionNode);
                                const hasParens = tokenBefore?.value === "(" && tokenAfter?.value === ")";

                                const collapsedText = sourceCode.getText(conditionNode).replace(/\s*\n\s*/g, " ").trim();

                                context.report({
                                    fix: (fixer) => {
                                        if (hasParens) {
                                            return fixer.replaceTextRange(
                                                [tokenBefore.range[0], tokenAfter.range[1]],
                                                `(${collapsedText})`,
                                            );
                                        }

                                        return fixer.replaceText(conditionNode, collapsedText);
                                    },
                                    message: "Condition operands should be on the same line",
                                    node: conditionNode,
                                });

                                return true;
                            }
                        }
                    }

                    // Recursively check nested expressions
                    if (conditionNode.type === "LogicalExpression") {
                        return checkConditionSplitHandler(left) || checkConditionSplitHandler(right);
                    }

                    return false;
                };

                // Check the left side of && for split conditions
                if (expression.operator === "&&" && checkConditionSplitHandler(expression.left)) {
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
                        || expression.right.type === "ConditionalExpression"
                        || expression.right.type === "ObjectExpression"
                        || (sourceCode.getTokenBefore(expression.right)?.value === "(");

                    // Check if left expression is wrapped in parentheses
                    const tokenAfterLeft = sourceCode.getTokenAfter(expression.left);
                    const leftEndsWithParen = tokenAfterLeft && tokenAfterLeft.value === ")";

                    // Get the actual end position (including closing paren if present)
                    const leftEndPos = leftEndsWithParen ? tokenAfterLeft.range[1] : expression.left.range[1];
                    const leftEndLine = leftEndsWithParen ? tokenAfterLeft.loc.end.line : expression.left.loc.end.line;

                    if (isSimplePattern && leftEndLine !== operatorToken.loc.start.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [leftEndPos, operatorToken.range[1]],
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

            // Check 1d: Arrow function with TSAsExpression or other expression body
            // e.g., (state) => state as { user: Type } should be on same line
            if (node.body.type === "TSAsExpression" || node.body.type === "Identifier" || node.body.type === "MemberExpression") {
                const arrowToken = sourceCode.getTokenBefore(
                    node.body,
                    (t) => t.value === "=>",
                );

                if (arrowToken) {
                    const tokenAfterArrow = sourceCode.getTokenAfter(arrowToken);

                    // If not wrapped in parentheses, body should be on same line
                    if (tokenAfterArrow && tokenAfterArrow.value !== "(") {
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
            }

            // Check 1e: Ensure space before => in arrow functions
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

        // Handle LogicalExpression chains in variable declarations
        // e.g., func() || func() - the operator should be on the same line as ) and the start of next call
        const checkLogicalExpressionHandler = (node) => {
            // Skip if inside JSXExpressionContainer (handled separately)
            if (node.parent && node.parent.type === "JSXExpressionContainer") return;

            // Only handle top-level logical expressions in variable declarations
            // Skip nested ones (they'll be handled when processing the parent)
            if (node.parent && node.parent.type === "LogicalExpression") return;

            // Skip if this is the test of an IfStatement - those are handled by multiline-if-conditions
            if (node.parent && node.parent.type === "IfStatement" && node.parent.test === node) return;

            // Skip if this is the test of a ConditionalExpression (ternary) - those are handled by ternary-condition-multiline
            if (node.parent && node.parent.type === "ConditionalExpression" && node.parent.test === node) return;

            // Check if operands are valid for same-line formatting
            const isValidOperand = (n) => n.type === "CallExpression"
                || n.type === "LogicalExpression"
                || n.type === "MemberExpression"
                || n.type === "Identifier"
                || n.type === "TSAsExpression"
                || n.type === "ObjectExpression"
                || n.type === "ArrayExpression";

            if (!isValidOperand(node.left) || !isValidOperand(node.right)) return;

            // Recursively check and fix all operators in the chain
            const checkOperator = (expr) => {
                if (expr.type !== "LogicalExpression") return;

                const { left, right, operator } = expr;

                // First, recursively check nested logical expressions
                checkOperator(left);
                checkOperator(right);

                // Find the operator token
                const operatorToken = sourceCode.getTokenAfter(
                    left,
                    (t) => t.value === "||" || t.value === "&&",
                );

                if (!operatorToken) return;

                const leftEndLine = left.loc.end.line;
                const operatorLine = operatorToken.loc.start.line;
                const rightStartLine = right.loc.start.line;

                // Check if operator is split from left or right operand
                // Correct: ) || canDoHandler(  (all on same line)
                // Wrong: ) ||\n    canDoHandler(  or  )\n    || canDoHandler(
                if (leftEndLine !== operatorLine || operatorLine !== rightStartLine) {
                    // Check for intentional multiline format (operator at start of line)
                    // This indicates multiline-if-conditions or ternary-condition-multiline has formatted it this way
                    const textBetween = sourceCode.text.slice(left.range[1], operatorToken.range[0]);
                    const operatorIsAtLineStart = textBetween.includes("\n") && /\n\s*$/.test(textBetween);

                    // Skip if intentionally formatted with operator at start of line
                    if (operatorIsAtLineStart) return;

                    // Get the end of left operand (might end with closing paren)
                    const leftEndToken = sourceCode.getLastToken(left);

                    // Get the start of right operand
                    const rightStartToken = sourceCode.getFirstToken(right);

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [leftEndToken.range[1], rightStartToken.range[0]],
                            ` ${operator} `,
                        ),
                        message: "Logical operator should be on the same line as both operands: ) || func(",
                        node: operatorToken,
                    });
                }
            };

            checkOperator(node);
        };

        return {
            ArrowFunctionExpression: checkArrowFunctionHandler,
            CallExpression: checkCallExpressionHandler,
            JSXExpressionContainer: checkJSXExpressionContainerHandler,
            JSXSpreadAttribute: checkJSXSpreadAttributeHandler,
            LogicalExpression: checkLogicalExpressionHandler,
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

        // Check if an expression body is simple enough for single line
        const isSimpleExpressionHandler = (bodyNode) => {
            if (!bodyNode) return false;

            // Simple literals, identifiers
            if (bodyNode.type === "Literal" || bodyNode.type === "Identifier") return true;

            // Template literals without expressions
            if (bodyNode.type === "TemplateLiteral" && bodyNode.expressions.length === 0) return true;

            // Simple call/import expressions
            if (isSimpleBodyHandler(bodyNode)) return true;

            // Binary/logical expressions (comparisons like code === x)
            if (bodyNode.type === "BinaryExpression" || bodyNode.type === "LogicalExpression") return true;

            // Member expressions (a.b, a?.b)
            if (bodyNode.type === "MemberExpression") return true;

            // Unary expressions (!x, -x)
            if (bodyNode.type === "UnaryExpression") return true;

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

                // Callbacks with 2+ params should be multiline (handled by function-params-per-line)
                if (arg.params.length >= 2) return;

                const { body } = arg;

                // Zero params: body must be a simple call/import
                if (arg.params.length === 0 && !isSimpleBodyHandler(body)) return;

                // With single param: body must be expression (not block) and simple
                if (arg.params.length === 1) {
                    if (body.type === "BlockStatement") return;
                    if (!isSimpleExpressionHandler(body)) return;
                }

                // For optional chaining like .find(...)?.symbol, include the full chain
                let replaceNode = node;

                // Walk up through chain/member expressions to get full chain text
                let chainParent = node.parent;

                while (chainParent && (chainParent.type === "MemberExpression" || chainParent.type === "ChainExpression")) {
                    replaceNode = chainParent;
                    chainParent = chainParent.parent;
                }

                // Check if the full chain spans multiple lines
                if (replaceNode.loc.start.line === replaceNode.loc.end.line) return;

                // Build the collapsed single-line version from source text, normalizing whitespace
                const fullText = sourceCode.getText(replaceNode);
                const fullCollapsed = fullText.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").replace(/\( \)/, "()").replace(/,\s*\)/, ")").replace(/\s+\?\./g, "?.").replace(/\?\.\s+/g, "?.");

                // Account for surrounding context (indentation + variable declaration)
                const line = sourceCode.lines[replaceNode.loc.start.line - 1];
                const indent = line.match(/^(\s*)/)[1].length;

                // Check parent chain for variable declarator to account for "const x = " prefix
                let prefixLength = 0;
                let current = replaceNode.parent;

                while (current) {
                    if (current.type === "VariableDeclarator") {
                        const declText = sourceCode.getText(current.id);

                        prefixLength = `const ${declText} = `.length;

                        break;
                    }

                    if (current.type === "MemberExpression" || current.type === "ChainExpression") {
                        current = current.parent;

                        continue;
                    }

                    break;
                }

                const totalLength = indent + prefixLength + fullCollapsed.length;

                // Only simplify if the result fits on one line (max ~120 chars)
                if (totalLength > 120) return;

                context.report({
                    fix: (fixer) => fixer.replaceText(replaceNode, fullCollapsed),
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

            // Template literals without expressions (only if single-line — multi-line ones are intentional)
            if (argNode.type === "TemplateLiteral" && argNode.expressions.length === 0) {
                return argNode.loc.start.line === argNode.loc.end.line;
            }

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
                // Include type arguments if they exist (TypeScript generics)
                const typeArgs = node.typeArguments || node.typeParameters;
                let calleeText = sourceCode.getText(callee);

                if (typeArgs) {
                    calleeText += sourceCode.getText(typeArgs);
                }

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

export {
    functionArgumentsFormat,
    nestedCallClosingBrackets,
    noEmptyLinesInFunctionCalls,
    openingBracketsSameLine,
    simpleCallSingleLine,
    singleArgumentOnOneLine,
};
