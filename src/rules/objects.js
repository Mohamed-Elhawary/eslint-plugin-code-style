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

        const checkObjectHandler = (node, isObjectPattern = false) => {
            const { properties } = node;

            if (properties.length === 0) return;

            // Skip ObjectPatterns with type annotations (component props with inline types)
            // These are handled by the component-props-inline-type rule
            if (isObjectPattern && node.typeAnnotation) return;

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

                    // Check if comma is on a different line than the property value end
                    // If so, move the comma to be directly after the property value
                    const commaOnDifferentLine = commaToken && commaToken.value === "," &&
                        commaToken.loc.start.line !== current.loc.end.line;

                    context.report({
                        fix: (fixer) => {
                            if (commaOnDifferentLine) {
                                // Replace from end of property value to start of next property
                                // This moves the comma to be right after the value
                                return fixer.replaceTextRange(
                                    [current.range[1], next.range[0]],
                                    ",\n" + " ".repeat(next.loc.start.column),
                                );
                            }

                            // Normal case: comma is on same line, just remove empty line after
                            return fixer.replaceTextRange(
                                [commaToken && commaToken.value === "," ? commaToken.range[1] : current.range[1], next.range[0]],
                                "\n" + " ".repeat(next.loc.start.column),
                            );
                        },
                        message: "No empty line between object properties",
                        node: next,
                    });
                }
            }
        };

        return {
            ObjectExpression: (node) => checkObjectHandler(node, false),
            ObjectPattern: (node) => checkObjectHandler(node, true),
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

            // Conditional expressions (ternary): can collapse if short enough
            if (valueNode.type === "ConditionalExpression") {
                const text = sourceCode.getText(valueNode).replace(/\s*\n\s*/g, " ").trim();

                return text.length <= 80;
            }

            // Logical expressions: can collapse if short enough
            if (valueNode.type === "LogicalExpression") {
                const text = sourceCode.getText(valueNode).replace(/\s*\n\s*/g, " ").trim();

                return text.length <= 80;
            }

            // Binary expressions: can collapse if short enough
            if (valueNode.type === "BinaryExpression") {
                const text = sourceCode.getText(valueNode).replace(/\s*\n\s*/g, " ").trim();

                return text.length <= 80;
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

            // Skip ObjectPatterns that are function parameters or inside function parameters
            // These are handled by function-params-per-line rule
            if (node.type === "ObjectPattern") {
                let parent = node.parent;

                while (parent) {
                    // Direct function parameter
                    if (
                        (parent.type === "FunctionDeclaration"
                        || parent.type === "FunctionExpression"
                        || parent.type === "ArrowFunctionExpression")
                        && parent.params && parent.params.includes(node)
                    ) {
                        return;
                    }

                    // Nested inside another ObjectPattern that's a function param
                    if (parent.type === "Property" && parent.parent && parent.parent.type === "ObjectPattern") {
                        // Continue up to check if the root ObjectPattern is a function param
                        parent = parent.parent;

                        continue;
                    }

                    // ObjectPattern inside function params array
                    if (
                        (parent.type === "FunctionDeclaration"
                        || parent.type === "FunctionExpression"
                        || parent.type === "ArrowFunctionExpression")
                    ) {
                        // Check if we came from params
                        let current = node;
                        let isInParams = false;

                        while (current && current !== parent) {
                            if (parent.params && parent.params.some((p) => p === current || isDescendant(p, current))) {
                                isInParams = true;

                                break;
                            }

                            current = current.parent;
                        }

                        if (isInParams) return;
                    }

                    parent = parent.parent;
                }
            }

            // Helper to check if node is descendant of another
            function isDescendant(ancestor, node) {
                let current = node;

                while (current) {
                    if (current === ancestor) return true;

                    current = current.parent;
                }

                return false;
            }

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
                        message: `Objects with <${minProperties} properties should be single line: { key: value }. Multi-line only for ${minProperties}+ properties`,
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

            // Check SpreadElements with LogicalExpression - they should be on one line
            // e.g., ...subAccounts && { subAccounts } should NOT be split across lines
            for (const prop of properties) {
                if (prop.type === "SpreadElement" && prop.argument) {
                    const arg = prop.argument;

                    // Check if ... is on a different line than the argument (e.g., "...\n    arg")
                    const spreadOnDifferentLine = prop.loc.start.line !== arg.loc.start.line;

                    // Check if it's a LogicalExpression that spans multiple lines
                    const logicalExpressionSpansLines = arg.type === "LogicalExpression"
                        && arg.loc.start.line !== arg.loc.end.line;

                    if (spreadOnDifferentLine || logicalExpressionSpansLines) {
                        // For LogicalExpression, check if it can be collapsed
                        if (arg.type === "LogicalExpression") {
                            const rightIsSimpleObject = arg.right.type === "ObjectExpression"
                                && arg.right.properties.length === 1
                                && arg.right.properties[0].type !== "SpreadElement";

                            if (rightIsSimpleObject || arg.right.type === "Identifier") {
                                // Collapse to single line and ensure no space after ...
                                const spreadText = sourceCode.getText(prop)
                                    .replace(/\s*\n\s*/g, " ")
                                    .replace(/\.\.\.\s+/, "...")
                                    .trim();

                                context.report({
                                    fix: (fixer) => fixer.replaceText(prop, spreadText),
                                    message: "Spread element with logical expression should be on a single line",
                                    node: prop,
                                });
                            }
                        } else if (spreadOnDifferentLine) {
                            // For non-LogicalExpression, just collapse the ... and argument to same line
                            const spreadText = sourceCode.getText(prop)
                                .replace(/\s*\n\s*/g, " ")
                                .replace(/\.\.\.\s+/, "...")
                                .trim();

                            context.report({
                                fix: (fixer) => fixer.replaceText(prop, spreadText),
                                message: "Spread operator should be on the same line as its argument",
                                node: prop,
                            });
                        }
                    }
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

            // Handle ternary expressions - short ones should be on single line
            if (valueNode.type === "ConditionalExpression") {
                const ternaryText = sourceCode.getText(valueNode);
                const collapsedText = ternaryText.replace(/\s*\n\s*/g, " ").trim();
                const isMultiLine = valueNode.loc.start.line !== valueNode.loc.end.line;

                // If it's short enough (under 80 chars) and multiline, collapse it
                if (isMultiLine && collapsedText.length <= 80) {
                    context.report({
                        fix: (fixer) => fixer.replaceText(valueNode, collapsedText),
                        message: "Short ternary expression should be on a single line",
                        node: valueNode,
                    });

                    return;
                }

                // Check if ? or : is at the end of a line (wrong position)
                const questionToken = sourceCode.getTokenAfter(
                    valueNode.test,
                    (t) => t.value === "?",
                );
                const colonTernaryToken = sourceCode.getTokenAfter(
                    valueNode.consequent,
                    (t) => t.value === ":",
                );

                if (questionToken) {
                    const tokenAfterQuestion = sourceCode.getTokenAfter(questionToken);

                    if (tokenAfterQuestion && questionToken.loc.end.line < tokenAfterQuestion.loc.start.line) {
                        // ? is at end of line, but only report if it's short enough to fit
                        if (collapsedText.length <= 80) {
                            context.report({
                                fix: (fixer) => fixer.replaceText(valueNode, collapsedText),
                                message: "Ternary operator '?' should not be at end of line",
                                node: questionToken,
                            });

                            return;
                        }
                    }
                }

                if (colonTernaryToken) {
                    const tokenAfterColonTernary = sourceCode.getTokenAfter(colonTernaryToken);

                    if (tokenAfterColonTernary && colonTernaryToken.loc.end.line < tokenAfterColonTernary.loc.start.line) {
                        // : is at end of line, but only report if it's short enough to fit
                        if (collapsedText.length <= 80) {
                            context.report({
                                fix: (fixer) => fixer.replaceText(valueNode, collapsedText),
                                message: "Ternary operator ':' should not be at end of line",
                                node: colonTernaryToken,
                            });

                            return;
                        }
                    }
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

export {
    noEmptyLinesInObjects,
    objectPropertyPerLine,
    objectPropertyValueBrace,
    objectPropertyValueFormat,
    stringPropertySpacing,
};
