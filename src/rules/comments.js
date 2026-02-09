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
const commentFormat = {
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
                            // Skip ESLint directive comments (eslint-disable, eslint-enable, etc.)
                            const trimmedValue = value.trim();
                            const isEslintDirective = /^eslint-disable|^eslint-enable|^eslint-disable-next-line|^eslint-disable-line/.test(trimmedValue);

                            if (isEslintDirective) {
                                // Allow /* */ syntax for ESLint directives
                                return;
                            }

                            // Single-line block comment should use // syntax
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

export { commentFormat };
