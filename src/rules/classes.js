/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Class Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce that class declarations must end with "Class" suffix.
 *   This distinguishes class definitions from other PascalCase names
 *   like React components or type definitions.
 *
 * ✓ Good:
 *   class ApiServiceClass { ... }
 *   class UserRepositoryClass { ... }
 *
 * ✗ Bad:
 *   class ApiService { ... }
 *   class UserRepository { ... }
 */
const classNamingConvention = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Store classes that need renaming and their references
        const classesToRename = new Map();

        // Collect all Identifier nodes that might be class references
        const collectReferencesHandler = (programNode, className) => {
            const references = [];

            const visitHandler = (node) => {
                if (!node || typeof node !== "object") return;

                // Found a matching Identifier
                if (node.type === "Identifier" && node.name === className) {
                    references.push(node);
                }

                // Recursively visit children
                for (const key in node) {
                    if (key === "parent" || key === "range" || key === "loc") continue;

                    const child = node[key];

                    if (Array.isArray(child)) {
                        child.forEach((c) => visitHandler(c));
                    } else if (child && typeof child === "object" && child.type) {
                        visitHandler(child);
                    }
                }
            };

            visitHandler(programNode);

            return references;
        };

        return {
            ClassDeclaration(node) {
                if (!node.id || !node.id.name) return;

                const className = node.id.name;

                if (!className.endsWith("Class")) {
                    classesToRename.set(className, {
                        classIdNode: node.id,
                        newName: `${className}Class`,
                    });
                }
            },

            "Program:exit"(programNode) {
                // Process all classes that need renaming
                classesToRename.forEach(({ classIdNode, newName }, className) => {
                    // Find all references to this class in the entire program
                    const allReferences = collectReferencesHandler(programNode, className);

                    context.report({
                        fix: (fixer) => {
                            const fixes = [];

                            allReferences.forEach((ref) => {
                                fixes.push(fixer.replaceText(ref, newName));
                            });

                            return fixes;
                        },
                        message: `Class name "${className}" should end with "Class" suffix`,
                        node: classIdNode,
                    });
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce class names end with 'Class' suffix" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Class/Method Definition Format
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforce consistent spacing in class and method definitions:
 *   - Space before opening brace { in class declarations
 *   - No space between method name and opening parenthesis (
 *   - Space before opening brace { in method definitions
 *   - Opening brace must be on same line as method signature
 *
 * ✓ Good:
 *   class ApiServiceClass {
 *       getDataHandler(): string {
 *           return "data";
 *       }
 *       async fetchUserHandler(id: string): Promise<User> {
 *           return await fetch(id);
 *       }
 *   }
 *
 * ✗ Bad:
 *   class ApiServiceClass{  // Missing space before {
 *   class ApiServiceClass
 *   {  // Opening brace on different line
 *       getDataHandler (): string {  // Space before (
 *       getDataHandler(): string{  // Missing space before {
 *       getDataHandler(): string
 *       {  // Opening brace on different line
 */
const classMethodDefinitionFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ClassDeclaration(node) {
                const classBody = node.body;

                if (!classBody) return;

                // Find the opening brace of the class body
                const openBrace = sourceCode.getFirstToken(classBody);

                if (!openBrace || openBrace.value !== "{") return;

                // Get the token before the opening brace (class name or extends clause)
                const tokenBefore = sourceCode.getTokenBefore(openBrace);

                if (!tokenBefore) return;

                // Check if opening brace is on same line as class declaration
                if (tokenBefore.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBefore.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Opening brace should be on the same line as class declaration",
                        node: openBrace,
                    });

                    return;
                }

                // Check for space before opening brace
                const textBetween = sourceCode.text.slice(tokenBefore.range[1], openBrace.range[0]);

                if (textBetween !== " ") {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBefore.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Expected single space before opening brace in class declaration",
                        node: openBrace,
                    });
                }
            },

            MethodDefinition(node) {
                const methodKey = node.key;
                const methodValue = node.value;

                if (!methodKey || !methodValue) return;

                // Check for space between method name and opening parenthesis
                // For computed properties, we need to get the ] token
                const keyLastToken = node.computed
                    ? sourceCode.getTokenAfter(methodKey, { filter: (t) => t.value === "]" })
                    : sourceCode.getLastToken(methodKey);

                if (!keyLastToken) return;

                // Find the opening parenthesis of the parameters
                let openParen = sourceCode.getTokenAfter(keyLastToken);

                // Skip over async, static, get, set keywords and * for generators
                while (openParen && openParen.value !== "(") {
                    openParen = sourceCode.getTokenAfter(openParen);
                }

                if (!openParen || openParen.value !== "(") return;

                // Get the token immediately before the opening paren (method name or modifier)
                const tokenBeforeParen = sourceCode.getTokenBefore(openParen);

                if (tokenBeforeParen) {
                    const textBeforeParen = sourceCode.text.slice(tokenBeforeParen.range[1], openParen.range[0]);

                    if (/\s/.test(textBeforeParen)) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeParen.range[1], openParen.range[0]],
                                "",
                            ),
                            message: "No space between method name and opening parenthesis",
                            node: openParen,
                        });
                    }
                }

                // Check for space before opening brace and brace on same line
                const functionBody = methodValue.body;

                if (!functionBody || functionBody.type !== "BlockStatement") return;

                const openBrace = sourceCode.getFirstToken(functionBody);

                if (!openBrace || openBrace.value !== "{") return;

                // Get the token before the opening brace (return type annotation or closing paren)
                const tokenBeforeBrace = sourceCode.getTokenBefore(openBrace);

                if (!tokenBeforeBrace) return;

                // Check if opening brace is on same line
                if (tokenBeforeBrace.loc.end.line !== openBrace.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBeforeBrace.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Opening brace should be on the same line as method signature",
                        node: openBrace,
                    });

                    return;
                }

                // Check for space before opening brace
                const textBeforeBrace = sourceCode.text.slice(tokenBeforeBrace.range[1], openBrace.range[0]);

                if (textBeforeBrace !== " ") {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [tokenBeforeBrace.range[1], openBrace.range[0]],
                            " ",
                        ),
                        message: "Expected single space before opening brace in method definition",
                        node: openBrace,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce consistent spacing in class and method definitions" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

export { classNamingConvention, classMethodDefinitionFormat };
