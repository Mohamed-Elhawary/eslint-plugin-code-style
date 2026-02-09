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
                            message: `Array with ≤${maxItems} simple items should be single line: [a, b, c]. Multi-line only for >${maxItems} items or complex values`,
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
 * Rule: Array Callback Destructure
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When destructuring parameters in array method callbacks (map,
 *   filter, find, etc.), put each property on its own line when
 *   there are 2 or more properties.
 *
 * ✓ Good:
 *   items.map(({
 *       name,
 *       value,
 *   }) => name + value);
 *
 * ✗ Bad:
 *   items.map(({ name, value }) => name + value);
 */
const arrayCallbackDestructure = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const arrayMethods = [
            "map", "filter", "find", "findIndex", "findLast", "findLastIndex",
            "some", "every", "forEach", "reduce", "reduceRight", "flatMap",
            "sort", "toSorted",
        ];

        const checkDestructuringHandler = (pattern, callNode) => {
            if (pattern.type !== "ObjectPattern") return;

            const properties = pattern.properties.filter((p) => p.type === "Property");

            // Only enforce multiline when 2+ properties
            if (properties.length < 2) return;

            const firstProp = properties[0];
            const lastProp = properties[properties.length - 1];
            const closeBrace = sourceCode.getLastToken(pattern);

            // Calculate indent based on the call expression
            const callLine = sourceCode.lines[callNode.loc.start.line - 1];
            const baseIndent = callLine.match(/^\s*/)[0];
            const propIndent = baseIndent + "        ";

            // Check if all properties are on the same line (need full reformat)
            if (firstProp.loc.start.line === lastProp.loc.end.line) {
                context.report({
                    fix(fixer) {
                        const openBrace = sourceCode.getFirstToken(pattern);

                        const propsText = properties
                            .map((prop) => propIndent + sourceCode.getText(prop))
                            .join(",\n");

                        return fixer.replaceTextRange(
                            [openBrace.range[0], closeBrace.range[1]],
                            `{\n${propsText},\n${baseIndent}    }`,
                        );
                    },
                    message: "Destructured properties in array callback should each be on their own line when there are 2 or more properties",
                    node: pattern,
                });

                return;
            }

            // Check if closing brace is on the same line as last property (needs fixing)
            if (closeBrace.loc.start.line === lastProp.loc.end.line) {
                context.report({
                    fix(fixer) {
                        // Add trailing comma if missing and move closing brace to new line
                        const tokenBeforeClose = sourceCode.getTokenBefore(closeBrace);
                        const hasTrailingComma = tokenBeforeClose.value === ",";

                        if (hasTrailingComma) {
                            return fixer.replaceTextRange(
                                [tokenBeforeClose.range[1], closeBrace.range[0]],
                                "\n" + baseIndent + "    ",
                            );
                        }

                        return fixer.replaceTextRange(
                            [lastProp.range[1], closeBrace.range[0]],
                            ",\n" + baseIndent + "    ",
                        );
                    },
                    message: "Closing brace should be on its own line in multiline destructuring",
                    node: closeBrace,
                });
            }
        };

        return {
            CallExpression(node) {
                // Check if this is an array method call
                if (node.callee.type !== "MemberExpression") return;

                const methodName = node.callee.property && node.callee.property.name;

                if (!arrayMethods.includes(methodName)) return;

                // Check the callback argument (usually the first argument)
                const callback = node.arguments[0];

                if (!callback) return;

                if (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression") {
                    // Check each parameter
                    callback.params.forEach((param) => {
                        checkDestructuringHandler(param, node);
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce multiline destructuring in array method callbacks (map, filter, find, etc.) when there are 2+ properties" },
        fixable: "code",
        schema: [],
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

export { arrayItemsPerLine, arrayCallbackDestructure, arrayObjectsOnNewLines };
