import fs from "fs";

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Component Props Destructure
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that React component props must be destructured
 *   in the function parameter, not received as a single 'props' object.
 *
 * ✓ Good:
 *   export const Button = ({ label, onClick }) => { ... }
 *   export const Card = ({ title, children, className = "" }) => { ... }
 *   export function Header({ title }: { title: string }) { ... }
 *
 * ✗ Bad:
 *   export const Button = (props) => { ... }  // Should destructure props
 *   export function Header(props) { ... }      // Should destructure props
 */
const componentPropsDestructure = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

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
            // Check if it's a named export or variable declarator with PascalCase name
            let componentName = null;

            if (node.parent) {
                if (node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    componentName = node.parent.id.name;
                } else if (node.id && node.id.type === "Identifier") {
                    componentName = node.id.name;
                }
            }

            // Check if name starts with uppercase (PascalCase convention for React components)
            if (componentName && /^[A-Z]/.test(componentName)) {
                // Check if function returns JSX
                const body = node.body;

                return containsJsxHandler(body);
            }

            return false;
        };

        // Find all property accesses on a parameter in the function body
        const findPropAccessesHandler = (body, paramName) => {
            const accesses = [];

            const visitNode = (n) => {
                if (!n || typeof n !== "object") return;

                // Check for member expression like props.name
                if (n.type === "MemberExpression" && !n.computed) {
                    if (n.object.type === "Identifier" && n.object.name === paramName) {
                        const propName = n.property.name;

                        accesses.push({
                            node: n,
                            property: propName,
                        });
                    }
                }

                // Recurse into child nodes
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

        // Find body destructuring like: const { name } = data; or const { name, age } = data;
        const findBodyDestructuringHandler = (body, paramName) => {
            const results = [];

            if (body.type !== "BlockStatement") return results;

            for (const statement of body.body) {
                if (statement.type === "VariableDeclaration") {
                    for (const declarator of statement.declarations) {
                        // Check if it's destructuring from the param: const { x } = paramName
                        if (
                            declarator.id.type === "ObjectPattern" &&
                            declarator.init &&
                            declarator.init.type === "Identifier" &&
                            declarator.init.name === paramName
                        ) {
                            const props = [];

                            for (const prop of declarator.id.properties) {
                                if (prop.type === "Property" && prop.key.type === "Identifier") {
                                    // Handle both { name } and { name: alias }
                                    const keyName = prop.key.name;
                                    const valueName = prop.value.type === "Identifier" ? prop.value.name : null;
                                    const hasDefault = prop.value.type === "AssignmentPattern";
                                    let defaultValue = null;

                                    if (hasDefault && prop.value.right) {
                                        defaultValue = sourceCode.getText(prop.value.right);
                                    }

                                    props.push({
                                        default: defaultValue,
                                        hasAlias: keyName !== valueName && !hasDefault,
                                        key: keyName,
                                        value: hasDefault ? prop.value.left.name : valueName,
                                    });
                                } else if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
                                    props.push({
                                        isRest: true,
                                        key: prop.argument.name,
                                        value: prop.argument.name,
                                    });
                                }
                            }

                            results.push({
                                declarator,
                                props,
                                statement,
                                // Track if this is the only declarator in the statement
                                statementHasOnlyThisDeclarator: statement.declarations.length === 1,
                            });
                        }
                    }
                }
            }

            return results;
        };

        const checkComponentPropsHandler = (node) => {
            if (!isReactComponentHandler(node)) return;

            const params = node.params;

            // Component with no params is fine
            if (params.length === 0) return;

            // Check if first param is not destructured (is an Identifier instead of ObjectPattern)
            const firstParam = params[0];

            if (firstParam.type === "Identifier") {
                const paramName = firstParam.name;

                // Find dot notation accesses: props.name
                const accesses = findPropAccessesHandler(node.body, paramName);

                // Find body destructuring: const { name } = props
                const bodyDestructures = findBodyDestructuringHandler(node.body, paramName);

                // Collect all accessed props from dot notation
                const dotNotationProps = [...new Set(accesses.map((a) => a.property))];

                // Collect all props from body destructuring
                const bodyDestructuredProps = [];

                bodyDestructures.forEach((bd) => {
                    bd.props.forEach((p) => {
                        bodyDestructuredProps.push(p);
                    });
                });

                // Check if param is used anywhere that we can't handle
                const allRefs = [];
                const countRefs = (n, skipNodes = []) => {
                    if (!n || typeof n !== "object") return;

                    // Skip nodes we're already accounting for
                    if (skipNodes.includes(n)) return;

                    if (n.type === "Identifier" && n.name === paramName) allRefs.push(n);

                    for (const key of Object.keys(n)) {
                        if (key === "parent") continue;

                        const child = n[key];

                        if (Array.isArray(child)) child.forEach((c) => countRefs(c, skipNodes));
                        else if (child && typeof child === "object" && child.type) countRefs(child, skipNodes);
                    }
                };

                countRefs(node.body);

                // Count expected refs: dot notation accesses + body destructuring init nodes
                const expectedRefCount = accesses.length + bodyDestructures.length;

                // Can auto-fix if:
                // 1. We have either dot notation props OR body destructured props
                // 2. All references to the param are accounted for
                const hasSomeProps = dotNotationProps.length > 0 || bodyDestructuredProps.length > 0;
                const canAutoFix = hasSomeProps && allRefs.length === expectedRefCount;

                context.report({
                    fix: canAutoFix
                        ? (fixer) => {
                            const fixes = [];

                            // Build the destructured props list for the parameter
                            const allProps = [];

                            // Add dot notation props (simple names)
                            dotNotationProps.forEach((p) => {
                                if (!allProps.some((ap) => ap.key === p)) {
                                    allProps.push({ key: p, simple: true });
                                }
                            });

                            // Add body destructured props (may have aliases, defaults, rest)
                            bodyDestructuredProps.forEach((p) => {
                                // Don't duplicate if already in dot notation
                                if (!allProps.some((ap) => ap.key === p.key)) {
                                    allProps.push(p);
                                }
                            });

                            // Build the destructured pattern string
                            const propStrings = allProps.map((p) => {
                                if (p.isRest) return `...${p.key}`;

                                if (p.simple) return p.key;

                                if (p.default) return `${p.key} = ${p.default}`;

                                if (p.hasAlias) return `${p.key}: ${p.value}`;

                                return p.key;
                            });
                            const destructuredPattern = `{ ${propStrings.join(", ")} }`;
                            let replacement = destructuredPattern;

                            // Preserve TypeScript type annotation if present
                            if (firstParam.typeAnnotation) {
                                const typeText = sourceCode.getText(firstParam.typeAnnotation);

                                replacement = `${destructuredPattern}${typeText}`;
                            }

                            // Replace param with destructured pattern
                            fixes.push(fixer.replaceText(firstParam, replacement));

                            // Replace all props.x with just x
                            accesses.forEach((access) => {
                                fixes.push(fixer.replaceText(access.node, access.property));
                            });

                            // Remove body destructuring statements
                            bodyDestructures.forEach((bd) => {
                                if (bd.statementHasOnlyThisDeclarator) {
                                    // Remove the entire statement including newline
                                    const statementStart = bd.statement.range[0];
                                    let statementEnd = bd.statement.range[1];

                                    // Try to also remove trailing newline/whitespace
                                    const textAfter = sourceCode.getText().slice(statementEnd, statementEnd + 2);

                                    if (textAfter.startsWith("\n")) statementEnd += 1;
                                    else if (textAfter.startsWith("\r\n")) statementEnd += 2;

                                    fixes.push(fixer.removeRange([statementStart, statementEnd]));
                                } else {
                                    // Only remove this declarator from a multi-declarator statement
                                    // This is more complex - for now just remove the declarator text
                                    fixes.push(fixer.remove(bd.declarator));
                                }
                            });

                            return fixes;
                        }
                        : undefined,
                    message: `Component props should be destructured. Use "({ ...props })" instead of "${firstParam.name}"`,
                    node: firstParam,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkComponentPropsHandler,
            FunctionDeclaration: checkComponentPropsHandler,
            FunctionExpression: checkComponentPropsHandler,
        };
    },
    meta: {
        docs: { description: "Enforce that React component props must be destructured in the function parameter" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Component Props Inline Type
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that React component props must use inline type annotation,
 *   not a reference to an interface or type alias. Also enforces:
 *   - Spacing: "}: {" with one space between colon and opening brace
 *   - Each prop type on its own line if more than one prop
 *   - Trailing commas (not semicolons) for each prop type
 *   - If single prop type, can be on single line
 *
 * ✓ Good:
 *   export const Button = ({ label }: { label: string }) => { ... }
 *   export const Card = ({
 *       className = "",
 *       title,
 *   }: {
 *       className?: string,
 *       title: string,
 *   }) => { ... }
 *
 * ✗ Bad:
 *   export const Button = ({ label }: ButtonPropsInterface) => { ... }
 *   export const Card = ({ title }:{ title: string }) => { ... }  // Missing space
 *   export const Card = ({ a, b }: { a: string; b: string }) => { ... }  // Semicolons
 */
const componentPropsInlineType = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

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

        const checkComponentPropsTypeHandler = (node) => {
            const params = node.params;

            if (params.length === 0) return;

            const isComponent = isReactComponentHandler(node);

            // For non-components: check ALL parameters for inline object types (not allowed)
            if (!isComponent) {
                params.forEach((param) => {
                    // Check Identifier params with type annotations (e.g., data: { email: string })
                    if (param.type === "Identifier" && param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const typeAnnotation = param.typeAnnotation.typeAnnotation;

                        if (typeAnnotation.type === "TSTypeLiteral") {
                            context.report({
                                message: `Parameter "${param.name}" must use a type reference (interface or type alias), not an inline object type. Define the type separately.`,
                                node: typeAnnotation,
                            });
                        }
                    }
                });
            }

            const firstParam = params[0];

            // Only check destructured params (ObjectPattern) for the rest of the checks
            if (firstParam.type !== "ObjectPattern") return;

            // Check if there's a type annotation
            if (!firstParam.typeAnnotation || !firstParam.typeAnnotation.typeAnnotation) {
                // For React components in TypeScript files: destructured props MUST have type annotation
                const filename = context.getFilename ? context.getFilename() : context.filename || "";
                const isTypeScriptFile = filename.endsWith(".ts") || filename.endsWith(".tsx");

                if (isTypeScriptFile && isComponent) {
                    context.report({
                        message: "Component props must have a type annotation. Add inline type: \"({ prop }: { prop: Type })\"",
                        node: firstParam,
                    });
                }

                return;
            }

            const typeAnnotation = firstParam.typeAnnotation.typeAnnotation;

            // Check spacing for ALL destructured params with type annotations
            // This applies to both React components and regular functions: }: TypeName
            const colonToken = sourceCode.getFirstToken(firstParam.typeAnnotation);
            const closingBraceToken = colonToken ? sourceCode.getTokenBefore(colonToken) : null;
            const typeFirstToken = sourceCode.getFirstToken(typeAnnotation);

            if (closingBraceToken && colonToken && typeFirstToken && closingBraceToken.value === "}") {
                const textBeforeColon = sourceCode.getText().slice(closingBraceToken.range[1], colonToken.range[0]);
                const textAfterColon = sourceCode.getText().slice(colonToken.range[1], typeFirstToken.range[0]);

                if (textBeforeColon !== "" || textAfterColon !== " ") {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [closingBraceToken.range[1], typeFirstToken.range[0]],
                            ": ",
                        ),
                        message: "Type annotation must have no space before colon and one space after: \"}: TypeName\"",
                        node: typeAnnotation,
                    });
                }
            }

            // Handle intersection types: ButtonHTMLAttributes<HTMLButtonElement> & { prop: Type }
            if (typeAnnotation.type === "TSIntersectionType" && isComponent) {
                const types = typeAnnotation.types;

                // Check & operators are on same line as previous type
                for (let i = 0; i < types.length - 1; i += 1) {
                    const currentType = types[i];
                    const nextType = types[i + 1];

                    const ampersandToken = sourceCode.getTokenAfter(currentType, (t) => t.value === "&");

                    if (ampersandToken && ampersandToken.loc.start.line !== currentType.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [currentType.range[1], ampersandToken.range[1]],
                                " &",
                            ),
                            message: "\"&\" must be on same line as previous type",
                            node: ampersandToken,
                        });
                    }

                    // { should be on same line as &
                    if (nextType.type === "TSTypeLiteral" && ampersandToken) {
                        const openBrace = sourceCode.getFirstToken(nextType);

                        if (openBrace && openBrace.loc.start.line !== ampersandToken.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [ampersandToken.range[1], openBrace.range[0]],
                                    " ",
                                ),
                                message: "Opening brace must be on same line as \"&\"",
                                node: openBrace,
                            });
                        }
                    }
                }

                // Find TSTypeLiteral in the intersection and apply formatting rules
                const typeLiteral = types.find((t) => t.type === "TSTypeLiteral");

                if (typeLiteral) {
                    const members = typeLiteral.members;

                    // Get the base indentation from the component declaration
                    const componentLine = sourceCode.lines[node.loc.start.line - 1];
                    const baseIndent = componentLine.match(/^\s*/)[0];
                    const propIndent = baseIndent + "    ";

                    // Get opening and closing brace tokens
                    const openBraceToken = sourceCode.getFirstToken(typeLiteral);
                    const closeBraceToken = sourceCode.getLastToken(typeLiteral);

                    // For multiple members, first member should be on new line after opening brace
                    if (members.length > 1 && members[0]) {
                        const firstMember = members[0];

                        if (firstMember.loc.start.line === openBraceToken.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [openBraceToken.range[1], firstMember.range[0]],
                                    "\n" + propIndent,
                                ),
                                message: "First props type property must be on a new line when there are multiple properties",
                                node: firstMember,
                            });
                        }
                    }

                    // Check closing brace position - should be on its own line for multiple members
                    if (members.length > 1 && closeBraceToken) {
                        const lastMember = members[members.length - 1];

                        if (closeBraceToken.loc.start.line === lastMember.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastMember.range[1], closeBraceToken.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "Closing brace must be on its own line when there are multiple properties",
                                node: closeBraceToken,
                            });
                        }
                    }

                    // Collapse single-member type to single line if it spans multiple lines
                    if (members.length === 1 && openBraceToken && closeBraceToken) {
                        const member = members[0];

                        // Check if the type spans multiple lines
                        if (openBraceToken.loc.end.line !== closeBraceToken.loc.start.line) {
                            let memberText = sourceCode.getText(member);

                            // Remove trailing comma/semicolon if any
                            memberText = memberText.replace(/[,;]\s*$/, "");

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [openBraceToken.range[0], closeBraceToken.range[1]],
                                    `{ ${memberText} }`,
                                ),
                                message: "Single props type property should be on a single line",
                                node: typeLiteral,
                            });
                        }
                    }

                    // Check each member for formatting
                    members.forEach((member, index) => {
                        const memberText = sourceCode.getText(member);

                        // Check property ends with comma, not semicolon
                        if (memberText.trimEnd().endsWith(";")) {
                            context.report({
                                fix: (fixer) => {
                                    const lastChar = memberText.lastIndexOf(";");
                                    const absolutePos = member.range[0] + lastChar;

                                    return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                                },
                                message: "Props type properties must end with comma (,) not semicolon (;)",
                                node: member,
                            });
                        }

                        // If more than one member, check each is on its own line
                        if (members.length > 1 && index > 0) {
                            const prevMember = members[index - 1];

                            if (member.loc.start.line === prevMember.loc.end.line) {
                                context.report({
                                    fix: (fixer) => {
                                        let commaToken = sourceCode.getTokenAfter(prevMember);

                                        while (commaToken && commaToken.value !== "," && commaToken.range[0] < member.range[0]) {
                                            commaToken = sourceCode.getTokenAfter(commaToken);
                                        }

                                        const insertPoint = commaToken && commaToken.value === "," ? commaToken.range[1] : prevMember.range[1];

                                        return fixer.replaceTextRange(
                                            [insertPoint, member.range[0]],
                                            "\n" + propIndent,
                                        );
                                    },
                                    message: "Each props type property must be on its own line when there are multiple properties",
                                    node: member,
                                });
                            }

                            // Check for empty lines between properties
                            if (member.loc.start.line - prevMember.loc.end.line > 1) {
                                context.report({
                                    fix: (fixer) => {
                                        const textBetween = sourceCode.getText().slice(
                                            prevMember.range[1],
                                            member.range[0],
                                        );
                                        const newText = textBetween.replace(/\n\s*\n/g, "\n");

                                        return fixer.replaceTextRange(
                                            [prevMember.range[1], member.range[0]],
                                            newText,
                                        );
                                    },
                                    message: "No empty lines allowed between props type properties",
                                    node: member,
                                });
                            }
                        }
                    });

                    // Check that last member has trailing comma (only for multiple members)
                    if (members.length > 1) {
                        const lastMember = members[members.length - 1];
                        const lastMemberText = sourceCode.getText(lastMember);

                        if (!lastMemberText.trimEnd().endsWith(",")) {
                            context.report({
                                fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                                message: "Last props type property must have trailing comma",
                                node: lastMember,
                            });
                        }
                    }

                    // Remove trailing comma for single member on single line
                    if (members.length === 1) {
                        const member = members[0];
                        const memberText = sourceCode.getText(member);

                        if (memberText.trimEnd().endsWith(",")) {
                            context.report({
                                fix: (fixer) => {
                                    const lastCommaIndex = memberText.lastIndexOf(",");
                                    const absolutePos = member.range[0] + lastCommaIndex;

                                    return fixer.removeRange([absolutePos, absolutePos + 1]);
                                },
                                message: "Single props type property should not have trailing comma",
                                node: member,
                            });
                        }
                    }

                    // Check for empty lines before closing brace
                    if (members.length > 0 && closeBraceToken) {
                        const lastMember = members[members.length - 1];

                        if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [lastMember.range[1], closeBraceToken.range[0]],
                                    "\n" + baseIndent,
                                ),
                                message: "No empty line before closing brace in props type",
                                node: closeBraceToken,
                            });
                        }
                    }
                }

                return;
            }

            // Check if type is a reference (TSTypeReference) instead of inline (TSTypeLiteral)
            // Only enforce inline types for React components - regular functions can use interface/type references
            if (typeAnnotation.type === "TSTypeReference") {
                if (isComponent) {
                    const typeName = typeAnnotation.typeName && typeAnnotation.typeName.name
                        ? typeAnnotation.typeName.name
                        : sourceCode.getText(typeAnnotation.typeName);

                    context.report({
                        message: `Component props should use inline type annotation instead of referencing "${typeName}". Define the type inline as "{ prop: type, ... }"`,
                        node: typeAnnotation,
                    });
                }

                // Regular functions with interface references are allowed - no error
                return;
            }

            // If it's a TSTypeLiteral, check formatting (only for React components)
            if (typeAnnotation.type === "TSTypeLiteral" && isComponent) {
                const members = typeAnnotation.members;

                // Get the base indentation from the component declaration
                const componentLine = sourceCode.lines[node.loc.start.line - 1];
                const baseIndent = componentLine.match(/^\s*/)[0];
                const propIndent = baseIndent + "    ";

                // Get opening brace token
                const openBraceToken = sourceCode.getFirstToken(typeAnnotation);

                // Check that props and type props are identical
                const destructuredProps = firstParam.properties
                    .filter((prop) => prop.type === "Property" || prop.type === "RestElement")
                    .map((prop) => {
                        if (prop.type === "RestElement") return null;

                        return prop.key && prop.key.name ? prop.key.name : null;
                    })
                    .filter(Boolean)
                    .sort();

                const typeProps = members
                    .filter((member) => member.type === "TSPropertySignature")
                    .map((member) => member.key && member.key.name ? member.key.name : null)
                    .filter(Boolean)
                    .sort();

                const missingInType = destructuredProps.filter((prop) => !typeProps.includes(prop));
                const extraInType = typeProps.filter((prop) => !destructuredProps.includes(prop));

                if (missingInType.length > 0) {
                    context.report({
                        message: `Props type is missing properties that are destructured: ${missingInType.join(", ")}`,
                        node: typeAnnotation,
                    });
                }

                if (extraInType.length > 0) {
                    context.report({
                        message: `Props type has extra properties not in destructured props: ${extraInType.join(", ")}`,
                        node: typeAnnotation,
                    });
                }

                // Get closing brace of type literal
                const closeBraceToken = sourceCode.getLastToken(typeAnnotation);

                // Check for empty line after opening brace
                if (members.length > 0) {
                    const firstMember = members[0];

                    if (firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[1], firstMember.range[0]],
                                "\n" + propIndent,
                            ),
                            message: "No empty line after opening brace in props type",
                            node: firstMember,
                        });
                    }
                }

                // Check for empty line before closing brace
                if (members.length > 0 && closeBraceToken) {
                    const lastMember = members[members.length - 1];

                    if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "No empty line before closing brace in props type",
                            node: lastMember,
                        });
                    }
                }

                // For multiple members, first member should be on new line after opening brace
                if (members.length > 1 && members[0]) {
                    const firstMember = members[0];

                    if (firstMember.loc.start.line === openBraceToken.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[1], firstMember.range[0]],
                                "\n" + propIndent,
                            ),
                            message: "First props type property must be on a new line when there are multiple properties",
                            node: firstMember,
                        });
                    }
                }

                // Check closing brace position - should be on its own line for multiple members
                if (members.length > 1 && closeBraceToken) {
                    const lastMember = members[members.length - 1];

                    if (closeBraceToken.loc.start.line === lastMember.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing brace must be on its own line when there are multiple properties",
                            node: closeBraceToken,
                        });
                    }
                }

                // Collapse single-member type to single line if it spans multiple lines
                if (members.length === 1 && openBraceToken && closeBraceToken) {
                    const member = members[0];

                    // Check if the type spans multiple lines
                    if (openBraceToken.loc.end.line !== closeBraceToken.loc.start.line) {
                        let memberText = sourceCode.getText(member);

                        // Remove trailing comma/semicolon if any
                        memberText = memberText.replace(/[,;]\s*$/, "");

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[0], closeBraceToken.range[1]],
                                `{ ${memberText} }`,
                            ),
                            message: "Single props type property should be on a single line",
                            node: typeAnnotation,
                        });
                    }
                }

                // Check each member for semicolons vs commas and line formatting
                members.forEach((member, index) => {
                    const memberText = sourceCode.getText(member);

                    // Check for space before ? in optional properties (e.g., "prop ?: type" should be "prop?: type")
                    if (member.type === "TSPropertySignature" && member.optional) {
                        const keyToken = sourceCode.getFirstToken(member);
                        const questionToken = sourceCode.getTokenAfter(keyToken);

                        if (questionToken && questionToken.value === "?") {
                            const textBetween = sourceCode.getText().slice(keyToken.range[1], questionToken.range[0]);

                            if (textBetween !== "") {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [keyToken.range[1], questionToken.range[0]],
                                        "",
                                    ),
                                    message: "No space allowed before \"?\" in optional property",
                                    node: member,
                                });
                            }
                        }
                    }

                    // Check property ends with comma, not semicolon
                    if (memberText.trimEnd().endsWith(";")) {
                        context.report({
                            fix: (fixer) => {
                                const lastChar = memberText.lastIndexOf(";");
                                const absolutePos = member.range[0] + lastChar;

                                return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                            },
                            message: "Props type properties must end with comma (,) not semicolon (;)",
                            node: member,
                        });
                    }

                    // If more than one member, check formatting
                    if (members.length > 1 && index > 0) {
                        const prevMember = members[index - 1];

                        // Check each is on its own line - with auto-fix
                        if (member.loc.start.line === prevMember.loc.end.line) {
                            context.report({
                                fix: (fixer) => {
                                    // Find the comma after prev member
                                    let commaToken = sourceCode.getTokenAfter(prevMember);

                                    while (commaToken && commaToken.value !== "," && commaToken.range[0] < member.range[0]) {
                                        commaToken = sourceCode.getTokenAfter(commaToken);
                                    }

                                    const insertPoint = commaToken && commaToken.value === "," ? commaToken.range[1] : prevMember.range[1];

                                    return fixer.replaceTextRange(
                                        [insertPoint, member.range[0]],
                                        "\n" + propIndent,
                                    );
                                },
                                message: "Each props type property must be on its own line when there are multiple properties",
                                node: member,
                            });
                        }

                        // Check for empty lines between properties
                        if (member.loc.start.line - prevMember.loc.end.line > 1) {
                            context.report({
                                fix: (fixer) => {
                                    const textBetween = sourceCode.getText().slice(
                                        prevMember.range[1],
                                        member.range[0],
                                    );
                                    const newText = textBetween.replace(/\n\s*\n/g, "\n");

                                    return fixer.replaceTextRange(
                                        [prevMember.range[1], member.range[0]],
                                        newText,
                                    );
                                },
                                message: "No empty lines allowed between props type properties",
                                node: member,
                            });
                        }
                    }
                });

                // Check that last member has trailing comma (only for multiple members)
                if (members.length > 1) {
                    const lastMember = members[members.length - 1];
                    const lastMemberText = sourceCode.getText(lastMember);

                    if (!lastMemberText.trimEnd().endsWith(",")) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                            message: "Last props type property must have trailing comma",
                            node: lastMember,
                        });
                    }
                }

                // Remove trailing comma for single member on single line
                if (members.length === 1) {
                    const member = members[0];
                    const memberText = sourceCode.getText(member);

                    if (memberText.trimEnd().endsWith(",")) {
                        context.report({
                            fix: (fixer) => {
                                const lastCommaIndex = memberText.lastIndexOf(",");
                                const absolutePos = member.range[0] + lastCommaIndex;

                                return fixer.removeRange([absolutePos, absolutePos + 1]);
                            },
                            message: "Single props type property should not have trailing comma",
                            node: member,
                        });
                    }
                }
            }
        };

        // Check return type annotation spacing and type reference requirement
        const checkReturnTypeSpacingHandler = (node) => {
            // Check if function has a return type annotation
            if (!node.returnType || !node.returnType.typeAnnotation) return;

            const returnType = node.returnType;
            const typeAnnotation = returnType.typeAnnotation;
            const isComponent = isReactComponentHandler(node);

            // For non-components: return type must be a type reference, not inline object type
            if (!isComponent && typeAnnotation.type === "TSTypeLiteral") {
                context.report({
                    message: "Function return type must be a type reference (interface, type, or built-in type), not an inline object type. Define the return type separately.",
                    node: typeAnnotation,
                });

                return;
            }

            // Get the closing paren of the params
            let closeParenToken;

            if (node.params.length > 0) {
                const lastParam = node.params[node.params.length - 1];

                closeParenToken = sourceCode.getTokenAfter(lastParam, (token) => token.value === ")");
            } else {
                // No params - find the () after the function name or the opening (
                const firstToken = sourceCode.getFirstToken(node);
                let searchToken = firstToken;

                while (searchToken && searchToken.value !== "(") {
                    searchToken = sourceCode.getTokenAfter(searchToken);
                }

                if (searchToken) {
                    closeParenToken = sourceCode.getTokenAfter(searchToken, (token) => token.value === ")");
                }
            }

            if (!closeParenToken) return;

            // Get the colon token
            const colonToken = sourceCode.getFirstToken(returnType);

            if (!colonToken || colonToken.value !== ":") return;

            // Get the first token of the type annotation
            const typeFirstToken = sourceCode.getFirstToken(typeAnnotation);

            if (!typeFirstToken) return;

            // Check spacing: ): TypeName (no space before colon, one space after)
            const textBeforeColon = sourceCode.getText().slice(closeParenToken.range[1], colonToken.range[0]);
            const textAfterColon = sourceCode.getText().slice(colonToken.range[1], typeFirstToken.range[0]);

            if (textBeforeColon !== "" || textAfterColon !== " ") {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [closeParenToken.range[1], typeFirstToken.range[0]],
                        ": ",
                    ),
                    message: "Return type annotation must have no space before colon and one space after: \"): TypeName\"",
                    node: returnType,
                });
            }
        };

        return {
            ArrowFunctionExpression(node) {
                checkComponentPropsTypeHandler(node);
                checkReturnTypeSpacingHandler(node);
            },
            FunctionDeclaration(node) {
                checkComponentPropsTypeHandler(node);
                checkReturnTypeSpacingHandler(node);
            },
            FunctionExpression(node) {
                checkComponentPropsTypeHandler(node);
                checkReturnTypeSpacingHandler(node);
            },
        };
    },
    meta: {
        docs: { description: "Enforce inline type annotation for React component props and return types with proper formatting" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: SVG Component Icon Naming
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Components that return only an SVG element must have a name
 *   ending with "Icon". Conversely, components with "Icon" suffix
 *   must return an SVG element.
 *
 * ✓ Good:
 *   export const SuccessIcon = ({ className }: { className?: string }) => (
 *       <svg className={className}>...</svg>
 *   );
 *
 *   export const Button = ({ children }: { children: ReactNode }) => (
 *       <button>{children}</button>
 *   );
 *
 * ✗ Bad:
 *   // Returns SVG but doesn't end with "Icon"
 *   export const Success = ({ className }: { className?: string }) => (
 *       <svg className={className}>...</svg>
 *   );
 *
 *   // Ends with "Icon" but doesn't return SVG
 *   export const ButtonIcon = ({ children }: { children: ReactNode }) => (
 *       <button>{children}</button>
 *   );
 */
const svgIconNamingConvention = {
    create(context) {
        // Get the component name from node
        const getComponentNameHandler = (node) => {
            // Arrow function: const Name = () => ...
            if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                return node.parent.id.name;
            }

            // Function declaration: function Name() { ... }
            if (node.id && node.id.type === "Identifier") {
                return node.id.name;
            }

            return null;
        };

        // Check if component name starts with uppercase (React component convention)
        const isReactComponentNameHandler = (name) => name && /^[A-Z]/.test(name);

        // Check if name ends with "Icon"
        const hasIconSuffixHandler = (name) => name && name.endsWith("Icon");

        // Check if the return value is purely an SVG element
        const returnsSvgOnlyHandler = (node) => {
            const body = node.body;

            if (!body) return false;

            // Arrow function with expression body: () => <svg>...</svg>
            if (body.type === "JSXElement") {
                return body.openingElement && body.openingElement.name && body.openingElement.name.name === "svg";
            }

            // Arrow function with parenthesized expression: () => (<svg>...</svg>)
            if (body.type === "ParenthesizedExpression" && body.expression) {
                if (body.expression.type === "JSXElement") {
                    return body.expression.openingElement && body.expression.openingElement.name && body.expression.openingElement.name.name === "svg";
                }
            }

            // Block body with return statement: () => { return <svg>...</svg>; }
            if (body.type === "BlockStatement") {
                // Find all return statements
                const returnStatements = body.body.filter((stmt) => stmt.type === "ReturnStatement" && stmt.argument);

                // Should have exactly one return statement for a simple SVG component
                if (returnStatements.length === 1) {
                    const returnArg = returnStatements[0].argument;

                    if (returnArg.type === "JSXElement") {
                        return returnArg.openingElement && returnArg.openingElement.name && returnArg.openingElement.name.name === "svg";
                    }

                    // Parenthesized: return (<svg>...</svg>);
                    if (returnArg.type === "ParenthesizedExpression" && returnArg.expression && returnArg.expression.type === "JSXElement") {
                        return returnArg.expression.openingElement && returnArg.expression.openingElement.name && returnArg.expression.openingElement.name.name === "svg";
                    }
                }
            }

            return false;
        };

        const checkFunctionHandler = (node) => {
            const componentName = getComponentNameHandler(node);

            // Only check React components (PascalCase)
            if (!isReactComponentNameHandler(componentName)) return;

            const returnsSvg = returnsSvgOnlyHandler(node);
            const hasIconSuffix = hasIconSuffixHandler(componentName);

            // Case 1: Returns SVG but doesn't end with "Icon"
            if (returnsSvg && !hasIconSuffix) {
                context.report({
                    message: `Component "${componentName}" returns an SVG element and should end with "Icon" suffix (e.g., "${componentName}Icon")`,
                    node: node.parent && node.parent.type === "VariableDeclarator" ? node.parent.id : node.id || node,
                });
            }

            // Case 2: Ends with "Icon" but doesn't return SVG
            if (hasIconSuffix && !returnsSvg) {
                context.report({
                    message: `Component "${componentName}" has "Icon" suffix but doesn't return an SVG element. Either rename it or make it return an SVG.`,
                    node: node.parent && node.parent.type === "VariableDeclarator" ? node.parent.id : node.id || node,
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
        docs: { description: "Enforce SVG components to have 'Icon' suffix and vice versa" },
        fixable: null,
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Folder Component Suffix
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces naming conventions for components based on folder location:
 *   - Components in "views" folder must end with "View" suffix
 *   - Components in "pages" folder must end with "Page" suffix
 *   - Components in "layouts" folder must end with "Layout" suffix
 *
 * ✓ Good:
 *   // In views/dashboard-view.tsx:
 *   export const DashboardView = () => <div>Dashboard</div>;
 *
 *   // In pages/home-page.tsx:
 *   export const HomePage = () => <div>Home</div>;
 *
 *   // In layouts/main-layout.tsx:
 *   export const MainLayout = () => <div>Main</div>;
 *
 * ✗ Bad:
 *   // In views/dashboard.tsx:
 *   export const Dashboard = () => <div>Dashboard</div>;  // Should be "DashboardView"
 *
 *   // In pages/home.tsx:
 *   export const Home = () => <div>Home</div>;  // Should be "HomePage"
 *
 *   // In layouts/main.tsx:
 *   export const Main = () => <div>Main</div>;  // Should be "MainLayout"
 */
const folderBasedNamingConvention = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        // Folder-to-suffix mapping
        // - JSX component folders: require function returning JSX (PascalCase)
        // - camelCase folders: check camelCase exported identifiers
        // - Other non-JSX folders: check PascalCase exported identifiers
        const folderSuffixMap = {
            atoms: "",
            components: "",
            constants: "Constants",
            contexts: "Context",
            data: "Data",
            layouts: "Layout",
            pages: "Page",
            providers: "Provider",
            reducers: "Reducer",
            services: "Service",
            strings: "Strings",
            theme: "Theme",
            themes: "Theme",
            views: "View",
        };

        // Folders where JSX return is required (component folders)
        const jsxRequiredFolders = new Set(["atoms", "components", "layouts", "pages", "providers", "views"]);

        // Folders where exports use camelCase naming (non-component, non-context)
        const camelCaseFolders = new Set(["constants", "data", "reducers", "services", "strings"]);

        // Convert kebab-case to PascalCase
        const toPascalCaseHandler = (str) => str.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

        // Convert PascalCase to camelCase (lowercase first letter)
        const toCamelCaseHandler = (str) => str.charAt(0).toLowerCase() + str.slice(1);

        // Build regex dynamically from folder names
        const folderNames = Object.keys(folderSuffixMap).join("|");

        // Parse the file path to extract module folder info at any depth
        const getModuleInfoHandler = () => {
            const pattern = new RegExp(`\\/(${folderNames})\\/(.+)\\.(jsx?|tsx?)$`);
            const match = normalizedFilename.match(pattern);

            if (!match) return null;

            const moduleFolderName = match[1];
            const suffix = folderSuffixMap[moduleFolderName];
            const relativePath = match[2];
            const segments = relativePath.split("/");
            const fileName = segments[segments.length - 1];
            const intermediateFolders = segments.slice(0, -1);

            return { fileName, folder: moduleFolderName, intermediateFolders, suffix };
        };

        // Build the expected name based on file position
        const buildExpectedNameHandler = (moduleInfo) => {
            const { fileName, folder, intermediateFolders, suffix } = moduleInfo;

            // Module barrel file (e.g., views/index.ts) — skip
            if (fileName === "index" && intermediateFolders.length === 0) return null;

            let nameParts;

            if (fileName === "index") {
                // Index in subfolder (e.g., layouts/auth/index.tsx) → parts from folders only
                nameParts = [...intermediateFolders].reverse();
            } else {
                // Regular file (e.g., layouts/auth/login.tsx) → file name + folders deepest-to-shallowest
                nameParts = [fileName, ...[...intermediateFolders].reverse()];
            }

            const pascalName = nameParts.map(toPascalCaseHandler).join("") + suffix;

            // camelCase folders produce camelCase names
            if (camelCaseFolders.has(folder)) return toCamelCaseHandler(pascalName);

            return pascalName;
        };

        // Get the component name from function node
        const getComponentNameHandler = (node) => {
            // Arrow function: const Name = () => ...
            if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                return { name: node.parent.id.name, identifierNode: node.parent.id };
            }

            // Function declaration: function Name() { ... }
            if (node.id && node.id.type === "Identifier") {
                return { name: node.id.name, identifierNode: node.id };
            }

            return null;
        };

        // Check if name starts with uppercase (PascalCase)
        const isPascalCaseHandler = (name) => name && /^[A-Z]/.test(name);

        // Check if the function returns JSX
        const returnsJsxHandler = (node) => {
            const body = node.body;

            if (!body) return false;

            // Arrow function with expression body: () => <div>...</div>
            if (body.type === "JSXElement" || body.type === "JSXFragment") {
                return true;
            }

            // Parenthesized expression
            if (body.type === "ParenthesizedExpression" && body.expression) {
                if (body.expression.type === "JSXElement" || body.expression.type === "JSXFragment") {
                    return true;
                }
            }

            // Block body with return statement
            if (body.type === "BlockStatement") {
                const hasJsxReturn = body.body.some((stmt) => {
                    if (stmt.type === "ReturnStatement" && stmt.argument) {
                        const arg = stmt.argument;

                        return arg.type === "JSXElement" || arg.type === "JSXFragment"
                            || (arg.type === "ParenthesizedExpression" && arg.expression
                                && (arg.expression.type === "JSXElement" || arg.expression.type === "JSXFragment"));
                    }

                    return false;
                });

                return hasJsxReturn;
            }

            return false;
        };

        // Shared fix logic for renaming identifier and all references
        const createRenameFixer = (node, name, expectedName, identifierNode) => (fixer) => {
            const scope = context.sourceCode
                ? context.sourceCode.getScope(node)
                : context.getScope();

            const findVariableHandler = (s, varName) => {
                const v = s.variables.find((variable) => variable.name === varName);

                if (v) return v;
                if (s.upper) return findVariableHandler(s.upper, varName);

                return null;
            };

            const variable = findVariableHandler(scope, name);

            if (!variable) return fixer.replaceText(identifierNode, expectedName);

            const fixes = [];
            const fixedRanges = new Set();

            variable.defs.forEach((def) => {
                const rangeKey = `${def.name.range[0]}-${def.name.range[1]}`;

                if (!fixedRanges.has(rangeKey)) {
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(def.name, expectedName));
                }
            });

            variable.references.forEach((ref) => {
                const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                if (!fixedRanges.has(rangeKey)) {
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(ref.identifier, expectedName));
                }
            });

            return fixes;
        };

        // Build the error message based on folder type
        const buildMessageHandler = (name, folder, suffix, expectedName) => {
            if (suffix) return `"${name}" in "${folder}" folder must be named "${expectedName}" (expected "${suffix}" suffix with chained folder names)`;

            return `"${name}" in "${folder}" folder must be named "${expectedName}" (expected chained folder names)`;
        };

        // Check if name starts with lowercase (camelCase)
        const isCamelCaseHandler = (name) => name && /^[a-z]/.test(name);

        // Check camelCase naming for camelCase folders (constants, data, reducers, services, strings)
        const checkCamelCaseHandler = (name, folder, suffix, identifierNode, scopeNode, moduleInfo) => {
            if (!name.endsWith(suffix)) {
                // Missing suffix — auto-fix by appending suffix
                const fixedName = name + suffix;

                context.report({
                    fix: createRenameFixer(scopeNode, name, fixedName, identifierNode),
                    message: `"${name}" in "${folder}" folder must end with "${suffix}" suffix (should be "${fixedName}")`,
                    node: identifierNode,
                });

                return;
            }

            // Has correct suffix — check if prefix is a near-match of expected file-based name
            // This catches cases like "routeConstants" → "routesConstants" (file is routes.ts)
            // but allows unrelated names like "buttonTypeData" in data/app.ts
            const expectedName = buildExpectedNameHandler(moduleInfo);

            if (!expectedName || name === expectedName) return;

            const actualPrefix = name.slice(0, -suffix.length);
            const expectedPrefix = expectedName.slice(0, -suffix.length);

            const isNearMatch = (expectedPrefix.startsWith(actualPrefix) && (expectedPrefix.length - actualPrefix.length) <= 2)
                || (actualPrefix.startsWith(expectedPrefix) && (actualPrefix.length - expectedPrefix.length) <= 2);

            if (isNearMatch) {
                context.report({
                    fix: createRenameFixer(scopeNode, name, expectedName, identifierNode),
                    message: `"${name}" in "${folder}" folder should be "${expectedName}" to match the file name`,
                    node: identifierNode,
                });
            }
        };

        // Check function declarations (JSX components + non-JSX functions like reducers)
        const checkFunctionHandler = (node) => {
            const moduleInfo = getModuleInfoHandler();

            if (!moduleInfo) return;

            const componentInfo = getComponentNameHandler(node);

            if (!componentInfo) return;

            const { name, identifierNode } = componentInfo;

            const { folder, suffix } = moduleInfo;

            // For camelCase folders, enforce suffix + near-match prefix check
            if (camelCaseFolders.has(folder)) {
                if (!isCamelCaseHandler(name) || !suffix) return;

                checkCamelCaseHandler(name, folder, suffix, identifierNode, node, moduleInfo);

                return;
            }

            if (!isPascalCaseHandler(name)) return;

            // For JSX-required folders, only check functions that return JSX
            if (jsxRequiredFolders.has(folder) && !returnsJsxHandler(node)) return;

            const expectedName = buildExpectedNameHandler(moduleInfo);

            if (!expectedName) return;

            if (name !== expectedName) {
                context.report({
                    fix: createRenameFixer(node, name, expectedName, identifierNode),
                    message: buildMessageHandler(name, folder, suffix, expectedName),
                    node: identifierNode,
                });
            }
        };

        // Check variable declarations for non-JSX folders (contexts, themes, data, etc.)
        const checkVariableHandler = (node) => {
            // Only check VariableDeclarators with an identifier name
            if (!node.id || node.id.type !== "Identifier") return;

            // Skip if init is a function (handled by checkFunctionHandler)
            if (node.init && (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression")) return;

            const moduleInfo = getModuleInfoHandler();

            if (!moduleInfo) return;

            const { folder, suffix } = moduleInfo;

            // Only check non-JSX folders (contexts, themes, data, constants, strings, etc.)
            if (jsxRequiredFolders.has(folder)) return;

            const name = node.id.name;

            // For camelCase folders, enforce suffix + near-match prefix check
            if (camelCaseFolders.has(folder)) {
                if (!isCamelCaseHandler(name) || !suffix) return;

                checkCamelCaseHandler(name, folder, suffix, node.id, node, moduleInfo);

                return;
            }

            if (!isPascalCaseHandler(name)) return;

            const expectedName = buildExpectedNameHandler(moduleInfo);

            if (!expectedName) return;

            if (name !== expectedName) {
                context.report({
                    fix: createRenameFixer(node, name, expectedName, node.id),
                    message: buildMessageHandler(name, folder, suffix, expectedName),
                    node: node.id,
                });
            }
        };

        return {
            ArrowFunctionExpression: checkFunctionHandler,
            FunctionDeclaration: checkFunctionHandler,
            FunctionExpression: checkFunctionHandler,
            VariableDeclarator: checkVariableHandler,
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions based on folder location — suffix for views/layouts/pages/providers/reducers/contexts/themes, chained folder names for nested files" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Folder Structure Consistency
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces that module folders have a consistent internal
 *   structure — either all flat files or all wrapped in folders.
 *
 *   Applies to the same folders as module-index-exports: atoms,
 *   components, hooks, utils, enums, types, reducers, etc.
 *
 *   - Flat mode: All items are direct files (e.g., atoms/input.tsx)
 *   - Wrapped mode: All items are in subfolders (e.g., atoms/input/index.tsx)
 *   - Wrapped mode is only justified when at least one subfolder has 2+ files
 *
 * ✓ Good (flat — all direct files):
 *   atoms/input.tsx
 *   atoms/calendar.tsx
 *
 * ✓ Good (wrapped — justified, input has multiple files):
 *   atoms/input/input.tsx
 *   atoms/input/helpers.ts
 *   atoms/calendar/index.tsx
 *
 * ✗ Bad (mixed — some flat, some wrapped):
 *   atoms/input.tsx
 *   atoms/calendar/index.tsx
 *
 * ✗ Bad (wrapped but unnecessary — each folder has only 1 file):
 *   atoms/input/index.tsx
 *   atoms/calendar/index.tsx
 */
const folderStructureConsistency = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const options = context.options[0] || {};
        const defaultModuleFolders = [
            "actions",
            "apis",
            "assets",
            "atoms",
            "components",
            "config",
            "configs",
            "constants",
            "contexts",
            "data",
            "enums",
            "helpers",
            "hooks",
            "interfaces",
            "layouts",
            "lib",
            "middlewares",
            "molecules",
            "organisms",
            "pages",
            "providers",
            "reducers",
            "redux",
            "requests",
            "routes",
            "schemas",
            "sections",
            "services",
            "store",
            "strings",
            "styles",
            "theme",
            "thunks",
            "types",
            "ui",
            "utils",
            "utilities",
            "views",
            "widgets",
        ];

        const moduleFolders = options.moduleFolders
            || [...defaultModuleFolders, ...(options.extraModuleFolders || [])];

        // Find the module folder in the file path
        const getModuleFolderInfoHandler = () => {
            for (const folder of moduleFolders) {
                const pattern = new RegExp(`(.*/${folder})/`);
                const match = normalizedFilename.match(pattern);

                if (match) return { folder, fullPath: match[1] };
            }

            return null;
        };

        const moduleFolderInfo = getModuleFolderInfoHandler();

        // Check for loose module files (e.g., src/data.js instead of src/data/)
        if (!moduleFolderInfo) {
            const fileBaseName = normalizedFilename.replace(/.*\//, "").replace(/\.(jsx?|tsx?)$/, "");

            if (moduleFolders.includes(fileBaseName)) {
                return {
                    Program(node) {
                        context.report({
                            message: `"${fileBaseName}" should be a folder, not a standalone file. Use "${fileBaseName}/" folder with an index file instead.`,
                            node,
                        });
                    },
                };
            }

            return {};
        }

        const { folder, fullPath } = moduleFolderInfo;

        // Read module folder children
        let children;

        try {
            children = fs.readdirSync(fullPath, { withFileTypes: true });
        } catch {
            return {};
        }

        const codeFilePattern = /\.(tsx?|jsx?)$/;

        // Categorize children
        const directFiles = children.filter(
            (child) => child.isFile() && codeFilePattern.test(child.name) && !child.name.startsWith("index."),
        );

        const subdirectories = children.filter((child) => child.isDirectory());

        // If only index files or empty, no issue
        if (directFiles.length === 0 && subdirectories.length === 0) return {};

        // If only one non-index file and no subdirectories, no issue
        if (directFiles.length <= 1 && subdirectories.length === 0) return {};

        // Check if wrapped mode is justified (any subfolder has 2+ code files)
        const isWrappedJustifiedHandler = () => {
            for (const dir of subdirectories) {
                try {
                    const dirPath = `${fullPath}/${dir.name}`;
                    const dirChildren = fs.readdirSync(dirPath, { withFileTypes: true });
                    const codeFiles = dirChildren.filter(
                        (child) => child.isFile() && codeFilePattern.test(child.name),
                    );

                    if (codeFiles.length >= 2) return true;
                } catch {
                    // Skip unreadable directories
                }
            }

            return false;
        };

        const hasDirectFiles = directFiles.length > 0;
        const hasSubdirectories = subdirectories.length > 0;
        const isMixed = hasDirectFiles && hasSubdirectories;
        const wrappedJustified = hasSubdirectories ? isWrappedJustifiedHandler() : false;

        return {
            Program(node) {
                // Case: All folders, NOT justified → unnecessary wrapping
                if (!hasDirectFiles && hasSubdirectories && !wrappedJustified) {
                    context.report({
                        message: `Unnecessary wrapper folders in "${folder}/". Each item has only one file, use direct files instead (e.g., ${folder}/component.tsx).`,
                        node,
                    });

                    return;
                }

                // Case: Mixed + wrapped justified → error on direct files
                if (isMixed && wrappedJustified) {
                    // Only report if this file IS a direct file in the module folder
                    const relativePart = normalizedFilename.slice(fullPath.length + 1);
                    const isDirectFile = !relativePart.includes("/");

                    if (isDirectFile) {
                        context.report({
                            message: `Since some items in "${folder}/" contain multiple files, all items should be wrapped in folders.`,
                            node,
                        });
                    }

                    return;
                }

                // Case: Mixed + NOT justified → error on subfolder files
                if (isMixed && !wrappedJustified) {
                    // Only report if this file IS inside a subfolder
                    const relativePart = normalizedFilename.slice(fullPath.length + 1);
                    const isInSubfolder = relativePart.includes("/");

                    if (isInSubfolder) {
                        context.report({
                            message: `Unnecessary wrapper folder. Each item in "${folder}/" has only one file, use direct files instead.`,
                            node,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent folder structure (flat vs wrapped) in module folders like atoms, components, hooks, enums, views, layouts, and pages" },
        fixable: null,
        schema: [
            {
                additionalProperties: false,
                properties: {
                    extraModuleFolders: {
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
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: No Redundant Folder Suffix
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Flags files whose name redundantly includes the parent (or ancestor)
 *   folder name as a suffix. Since the folder already provides context,
 *   the file name doesn't need to repeat it.
 *
 *   Checks all ancestor folders from "src/" onwards.
 *   Skips index files (index.ts, index.js, etc.).
 *
 * ✓ Good:
 *   layouts/main.tsx           → file "main" has no redundant suffix
 *   atoms/button.tsx           → file "button" has no redundant suffix
 *   views/dashboard.tsx        → file "dashboard" has no redundant suffix
 *   hooks/use-auth.ts          → file "use-auth" has no redundant suffix
 *
 * ✗ Bad:
 *   layouts/main-layout.tsx    → redundant "-layout" (already in layouts/)
 *   atoms/button-atom.tsx      → redundant "-atom" (already in atoms/)
 *   views/dashboard-view.tsx   → redundant "-view" (already in views/)
 *   hooks/use-auth-hook.ts     → redundant "-hook" (already in hooks/)
 *   atoms/forms/input-atom.tsx → redundant "-atom" from ancestor "atoms/"
 */
const noRedundantFolderSuffix = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        // Get the file base name without extension
        const parts = normalizedFilename.split("/");
        const fileWithExt = parts[parts.length - 1];
        const baseName = fileWithExt.replace(/\.(jsx?|tsx?)$/, "");

        // Singularize: convert folder name to singular form
        const singularizeHandler = (word) => {
            if (word.endsWith("ies")) return word.slice(0, -3) + "y";
            if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes")) return word.slice(0, -2);
            if (word.endsWith("s")) return word.slice(0, -1);

            return word;
        };

        // Find the src/ boundary and collect ancestor folders from src/ onwards
        const srcIndex = parts.indexOf("src");

        if (srcIndex === -1) return {};

        // Collect folders between src/ and the file itself
        const ancestorFolders = parts.slice(srcIndex + 1, parts.length - 1);

        if (ancestorFolders.length === 0) return {};

        // Check intermediate folder names for redundant suffixes
        const folderErrors = [];

        for (let i = 1; i < ancestorFolders.length; i++) {
            const folderName = ancestorFolders[i];

            for (let j = 0; j < i; j++) {
                const ancestorFolder = ancestorFolders[j];
                const singular = singularizeHandler(ancestorFolder);
                const suffix = `-${singular}`;

                if (folderName.endsWith(suffix)) {
                    folderErrors.push({
                        ancestorFolder,
                        folderName,
                        singular,
                        suffix,
                        suggestedName: folderName.slice(0, -suffix.length),
                    });
                }
            }
        }

        // Check if the file name matches the immediate parent folder name (e.g., input/input.tsx → should be input/index.tsx)
        let fileMatchesFolder = null;

        if (baseName !== "index" && ancestorFolders.length >= 2) {
            const immediateFolder = ancestorFolders[ancestorFolders.length - 1];

            if (baseName === immediateFolder) {
                fileMatchesFolder = immediateFolder;
            }
        }

        // Check if the file name ends with any ancestor folder name (singularized) — skip index files
        let fileRedundancy = null;

        if (baseName !== "index" && !fileMatchesFolder) {
            for (const folder of ancestorFolders) {
                const singular = singularizeHandler(folder);
                const suffix = `-${singular}`;

                if (baseName.endsWith(suffix)) {
                    fileRedundancy = { folder, singular, suffix };
                    break;
                }
            }
        }

        if (folderErrors.length === 0 && !fileRedundancy && !fileMatchesFolder) return {};

        return {
            Program(node) {
                for (const error of folderErrors) {
                    context.report({
                        message: `Folder name "${error.folderName}" has redundant suffix "${error.suffix}" — the "${error.ancestorFolder}/" ancestor folder already provides this context. Rename to "${error.suggestedName}".`,
                        node,
                    });
                }

                if (fileMatchesFolder) {
                    context.report({
                        message: `File name "${baseName}" is the same as its parent folder "${fileMatchesFolder}/". Use "index" instead (e.g., "${fileMatchesFolder}/index${fileWithExt.match(/\.\w+$/)[0]}").`,
                        node,
                    });
                }

                if (fileRedundancy) {
                    context.report({
                        message: `File name "${baseName}" has redundant suffix "${fileRedundancy.suffix}" — the "${fileRedundancy.folder}/" folder already provides this context. Rename to "${baseName.slice(0, -fileRedundancy.suffix.length)}".`,
                        node,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Disallow file and folder names that redundantly include the parent or ancestor folder name as a suffix" },
        fixable: null,
        schema: [],
        type: "suggestion",
    },
};

export {
    componentPropsDestructure,
    componentPropsInlineType,
    svgIconNamingConvention,
    folderBasedNamingConvention,
    folderStructureConsistency,
    noRedundantFolderSuffix,
};
