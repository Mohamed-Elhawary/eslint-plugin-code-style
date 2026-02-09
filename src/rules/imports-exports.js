import fs from "fs";
import nodePath from "path";

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
 *   Exception: Files within the same module folder should use
 *   relative imports (./sibling) to avoid circular dependencies
 *   through the index file.
 *
 * Options:
 *   - aliasPrefix: string (default: "@/") - Change path alias prefix if your project uses something other than @/ (e.g., ~/, src/)
 *   - extraAllowedFolders: string[] - Add custom folders that can be imported with @/folder. Extends defaults without replacing them
 *   - extraReduxSubfolders: string[] - Add Redux subfolders importable directly (@/selectors) or nested (@/redux/selectors). Default: actions, reducers, store, thunks, types
 *   - extraDeepImportFolders: string[] - Add folders where direct file imports are allowed (@/assets/images/logo.svg). Use for folders without index files. Default: assets
 *   - allowedFolders: string[] - Completely replace the default allowed folders list. Use only if you need full control
 *   - reduxSubfolders: string[] - Completely replace the default Redux subfolders list
 *   - deepImportFolders: string[] - Completely replace the default deep import folders list
 *
 * ✓ Good:
 *   import { Button } from "@/components";
 *   import { useAuth } from "@/hooks";
 *   // Sibling import within same folder (avoids circular deps):
 *   import { helpers } from "./helpers";  (when in data/app.js importing data/helpers.js)
 *
 * ✗ Bad:
 *   import { Button } from "@/components/buttons/primary-button";
 *   import { useAuth } from "@/hooks/auth/useAuth";
 *   // Same-folder absolute import (circular dependency risk):
 *   import { helpers } from "@/data";  (when file is inside data/ folder)
 *
 * Configuration Example:
 *   "code-style/absolute-imports-only": ["error", {
 *       extraAllowedFolders: ["features", "modules"],
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
            "@constants",
            "@strings",
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
            "pages",
            "providers",
            "reducers",
            "redux",
            "requests",
            "routes",
            "schemas",
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

                // Check if this is an entry file (main.tsx, main.ts, etc.) - entry files are allowed
                // to use relative imports for app root and styles (e.g., ./index.css, ./app)
                const isEntryFile = /\/main\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

                // Detect if the file is inside a module folder at any depth
                // e.g., data/app.js, data/auth/login/guest.tsx are both inside "data"
                const getParentModuleFolderHandler = () => {
                    for (const folder of allowedFolders) {
                        const pattern = new RegExp(`/(${folder})/`);

                        if (pattern.test(normalizedFilename)) return folder;
                    }

                    return null;
                };

                const parentModuleFolder = getParentModuleFolderHandler();

                // 1. Disallow relative imports (starting with ./ or ../)
                // EXCEPT in index files, entry files, and sibling files within the same module folder
                if (importPath.startsWith("./") || importPath.startsWith("../")) {
                    // Always allow in index files and entry files
                    if (isIndexFile || isEntryFile) return;

                    // Allow relative imports within the same module folder (any depth)
                    // e.g., data/app.js → "./helpers", data/auth/forget-password/index.ts → "../../login/guest"
                    if (parentModuleFolder) return;

                    context.report({
                        message: `Relative imports are not allowed. Use absolute imports with "${aliasPrefix}" prefix instead.`,
                        node: node.source,
                    });

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

                    // Check if importing from own parent module folder (circular dependency risk)
                    // e.g., data/app.js importing @/data → should use relative import instead
                    if (parentModuleFolder && folderName === parentModuleFolder) {
                        const targetRelativeToModule = segments.slice(1).join("/");

                        // Deep path within own module (e.g., @/data/auth/login/guest) — auto-fixable
                        if (targetRelativeToModule) {
                            const moduleIndex = normalizedFilename.lastIndexOf(`/${parentModuleFolder}/`);
                            const fileRelativeToModule = normalizedFilename.slice(moduleIndex + parentModuleFolder.length + 2);
                            const fileDir = fileRelativeToModule.substring(0, fileRelativeToModule.lastIndexOf("/"));

                            let relativePath = nodePath.posix.relative(fileDir, targetRelativeToModule);

                            if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;

                            context.report({
                                message: `Files within "${parentModuleFolder}/" should use relative imports (e.g., "${relativePath}") instead of "${importPath}" to avoid circular dependencies.`,
                                node: node.source,
                                fix: (fixer) => fixer.replaceText(node.source, `"${relativePath}"`),
                            });

                            return;
                        }

                        // Barrel import to own module (e.g., @/data from inside data/) — report only
                        context.report({
                            message: `Files within "${parentModuleFolder}/" should use relative imports instead of "${importPath}" to avoid circular dependencies through the index file.`,
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
        docs: { description: "Enforce absolute imports from index files only for local paths, with relative imports required for files within the same module folder" },
        fixable: "code",
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
            const exportToken = sourceCode.getFirstToken(node);

            // Check for export with declaration (export interface, export enum, export type, export const, etc.)
            if (node.declaration) {
                const declarationFirstToken = sourceCode.getFirstToken(node.declaration);

                if (declarationFirstToken && exportToken.loc.end.line !== declarationFirstToken.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [exportToken.range[1], declarationFirstToken.range[0]],
                            " ",
                        ),
                        message: "Declaration keyword must be on the same line as 'export'",
                        node: declarationFirstToken,
                    });
                }

                return;
            }

            const specifiers = node.specifiers;

            if (specifiers.length === 0) return;

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
                        message: `Exports with ≤${maxSpecifiers} specifiers should be single line: export { a, b, c }`,
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
                        message: `Imports with ≤${maxSpecifiers} specifiers should be single line: import { a, b, c } from "module"`,
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
 *   - extraModuleFolders: string[] - Add folders that should have an index.js re-exporting all public files. Use for project-specific folders like features/, modules/
 *   - extraLazyLoadFolders: string[] - Add folders exempt from index file requirements. Use for route/page components loaded via dynamic import(). Default: pages, views
 *   - extraIgnorePatterns: string[] - Add file patterns to skip when checking for index exports. Supports wildcards like *.stories.js, *.mock.js
 *   - moduleFolders: string[] - Completely replace the default module folders list. Use only if you need full control
 *   - lazyLoadFolders: string[] - Completely replace the default lazy load folders list
 *   - ignorePatterns: string[] - Completely replace the default ignore patterns list
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
 *       extraModuleFolders: ["features", "modules"],
 *       extraLazyLoadFolders: ["screens"],
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
            "@constants",
            "@strings",
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
            "pages",
            "providers",
            "reducers",
            "redux",
            "requests",
            "routes",
            "schemas",
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
        ];

        // List of module folders (can be configured via options)
        // Use moduleFolders to replace entirely, or extraModuleFolders to extend defaults
        const moduleFolders = options.moduleFolders
            || [...defaultModuleFolders, ...(options.extraModuleFolders || [])];

        // Default lazy load folders
        const defaultLazyLoadFolders = ["pages", "views"];

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
            "*.test.ts",
            "*.test.tsx",
            "*.spec.js",
            "*.spec.jsx",
            "*.spec.ts",
            "*.spec.tsx",
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
                    if (isDirectory && (
                        source === `./${itemName}/index`
                        || source === `./${itemName}/index.js`
                        || source === `./${itemName}/index.jsx`
                        || source === `./${itemName}/index.ts`
                        || source === `./${itemName}/index.tsx`
                    )) {
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
                        const indexPathJs = nodePath.join(dirPath, "index.js");
                        const indexPathJsx = nodePath.join(dirPath, "index.jsx");
                        const indexPathTs = nodePath.join(dirPath, "index.ts");
                        const indexPathTsx = nodePath.join(dirPath, "index.tsx");

                        const hasIndexFile = fs.existsSync(indexPathJs)
                            || fs.existsSync(indexPathJsx)
                            || fs.existsSync(indexPathTs)
                            || fs.existsSync(indexPathTsx);

                        if (!hasIndexFile) {
                            context.report({
                                message: `Module folder "${folderName}" is missing an index file. Create an index file to export all modules.`,
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
 * Rule: Index Exports Only
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Index files (index.ts, index.tsx, index.js, index.jsx) should
 *   only contain imports and re-exports, not any code definitions.
 *   All definitions (types, interfaces, functions, variables, classes)
 *   should be moved to separate files.
 *
 * ✓ Good:
 *   // index.ts
 *   export { Button } from "./Button";
 *   export { helper } from "./utils";
 *   export type { ButtonProps } from "./types";
 *   export * from "./constants";
 *
 * ✗ Bad:
 *   // index.ts
 *   export type ButtonVariant = "primary" | "secondary";
 *   export interface ButtonProps { ... }
 *   export const CONSTANT = "value";
 *   export function helper() { ... }
 */
const indexExportsOnly = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");
        const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename)
            || /^index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

        if (!isIndexFile) return {};

        // Determine if this is a subfolder index inside a module folder
        // e.g., views/assessment/index.tsx (depth >= 2 from module folder) = subfolder index
        // vs views/index.ts (depth == 1 from module folder) = root barrel
        const moduleFolders = [
            "actions", "apis", "assets", "atoms", "components", "config", "configs",
            "constants", "contexts", "data", "enums", "helpers", "hooks", "interfaces",
            "layouts", "lib", "middlewares", "pages", "providers", "reducers", "redux",
            "requests", "routes", "schemas", "services", "store", "strings", "styles",
            "theme", "themes", "thunks", "types", "ui", "utils", "utilities", "views",
        ];
        const parts = normalizedFilename.split("/");
        const indexPos = parts.length - 1;
        let isSubfolderIndex = false;

        for (let i = 0; i < indexPos; i++) {
            if (moduleFolders.includes(parts[i])) {
                if (indexPos - i >= 2) isSubfolderIndex = true;

                break;
            }
        }

        // Helper to check if a node is an import or re-export (no inline declarations)
        const isImportOrReexportHandler = (node) => {
            const { type } = node;

            if (type === "ImportDeclaration") return true;

            if (type === "ExportNamedDeclaration") return !node.declaration;

            if (type === "ExportDefaultDeclaration") {
                return node.declaration && node.declaration.type === "Identifier";
            }

            if (type === "ExportAllDeclaration") return true;

            return false;
        };

        // Helper to check if a node contains actual code (declarations, logic)
        const hasCodeDeclarationHandler = (node) => {
            const { type } = node;

            if (type === "VariableDeclaration" || type === "FunctionDeclaration" || type === "ClassDeclaration") return true;

            if (type === "ExportNamedDeclaration" && node.declaration) return true;

            if (type === "ExportDefaultDeclaration") {
                return node.declaration && node.declaration.type !== "Identifier";
            }

            return false;
        };

        // Get a friendly description of what the disallowed node is
        const getNodeDescriptionHandler = (node) => {
            switch (node.type) {
                case "TSTypeAliasDeclaration":
                    return "Type definition";
                case "TSInterfaceDeclaration":
                    return "Interface definition";
                case "TSEnumDeclaration":
                    return "Enum definition";
                case "VariableDeclaration":
                    return "Variable declaration";
                case "FunctionDeclaration":
                    return "Function declaration";
                case "ClassDeclaration":
                    return "Class declaration";
                case "ExportNamedDeclaration":
                    if (node.declaration) return getNodeDescriptionHandler(node.declaration);

                    return "Export with inline declaration";
                case "ExportDefaultDeclaration":
                    return "Default export with inline definition";
                default:
                    return "Code";
            }
        };

        return {
            Program(programNode) {
                if (isSubfolderIndex) {
                    // Subfolder index (e.g., views/assessment/index.tsx):
                    // Must contain component code — must NOT be a barrel (re-exports only)
                    // Only one barrel per module (the root index)
                    const hasCode = programNode.body.some((node) => hasCodeDeclarationHandler(node));

                    if (!hasCode) {
                        const subfolder = parts[indexPos - 1];

                        context.report({
                            message: `Subfolder index file "${subfolder}/index" should contain component code, not just re-exports. Only the module root index file should be a barrel for imports and re-exports.`,
                            node: programNode,
                        });
                    }

                    return;
                }

                // Root module index (e.g., views/index.ts):
                // Must be barrel only — no code declarations allowed
                for (const node of programNode.body) {
                    if (!isImportOrReexportHandler(node)) {
                        const description = getNodeDescriptionHandler(node);

                        context.report({
                            message: `${description} should not be in index files. Index files should only contain imports and re-exports. Move this to a separate file.`,
                            node,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce index files as barrels (re-exports only) at module root, and as component entry points (with code) in subfolders" },
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Inline Export Declaration
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   In non-index files, enforce inline export declarations instead
 *   of declaring variables/functions separately and then exporting
 *   them with a grouped export statement at the end.
 *
 *   This does NOT apply to index files (which use barrel re-exports).
 *
 * ✓ Good:
 *   export const strings = { ... };
 *
 *   export const buttonTypeData = { button: "button" };
 *
 *   export const submitHandler = () => { ... };
 *
 * ✗ Bad:
 *   const strings = { ... };
 *   export { strings };
 *
 * ✗ Bad:
 *   const foo = 1;
 *   const bar = 2;
 *   export { foo, bar };
 *
 * Auto-fixable: Yes — adds "export" to each declaration and removes
 * the grouped export statement.
 */
const inlineExportDeclaration = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");
        const isIndexFile = /\/index\.(js|jsx|ts|tsx)$/.test(normalizedFilename)
            || /^index\.(js|jsx|ts|tsx)$/.test(normalizedFilename);

        // Only apply to non-index files
        if (isIndexFile) return {};

        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            Program(programNode) {
                // Find all grouped export statements: export { a, b, c };
                // These have specifiers but no source (not re-exports) and no declaration
                const groupedExports = programNode.body.filter(
                    (node) => node.type === "ExportNamedDeclaration"
                        && !node.source
                        && !node.declaration
                        && node.specifiers.length > 0,
                );

                if (groupedExports.length === 0) return;

                // Build a map of all top-level declarations: name → node
                const declarationMap = new Map();

                programNode.body.forEach((node) => {
                    if (node.type === "VariableDeclaration") {
                        node.declarations.forEach((decl) => {
                            if (decl.id && decl.id.type === "Identifier") {
                                declarationMap.set(decl.id.name, { declarationNode: node, kind: node.kind });
                            }
                        });
                    } else if (node.type === "FunctionDeclaration" && node.id) {
                        declarationMap.set(node.id.name, { declarationNode: node, kind: "function" });
                    } else if (node.type === "ClassDeclaration" && node.id) {
                        declarationMap.set(node.id.name, { declarationNode: node, kind: "class" });
                    }
                });

                groupedExports.forEach((exportNode) => {
                    // Skip if any specifier has an alias (export { a as b })
                    const hasAlias = exportNode.specifiers.some(
                        (spec) => spec.local.name !== spec.exported.name,
                    );

                    if (hasAlias) return;

                    // Check all specifiers have matching declarations
                    const allFound = exportNode.specifiers.every(
                        (spec) => declarationMap.has(spec.local.name),
                    );

                    if (!allFound) return;

                    // Check if any declaration is already exported (would cause duplicate)
                    const anyAlreadyExported = exportNode.specifiers.some((spec) => {
                        const info = declarationMap.get(spec.local.name);
                        const declNode = info.declarationNode;
                        const parent = declNode.parent;

                        // Check if declaration is inside an ExportNamedDeclaration
                        if (parent && parent.type === "ExportNamedDeclaration") return true;

                        // Check source text starts with "export"
                        const declText = sourceCode.getText(declNode);

                        return declText.startsWith("export ");
                    });

                    if (anyAlreadyExported) return;

                    context.report({
                        fix(fixer) {
                            const fixes = [];

                            // Add "export " before each declaration
                            exportNode.specifiers.forEach((spec) => {
                                const info = declarationMap.get(spec.local.name);
                                const declNode = info.declarationNode;

                                fixes.push(fixer.insertTextBefore(declNode, "export "));
                            });

                            // Remove the grouped export statement and any preceding blank line
                            const tokenBefore = sourceCode.getTokenBefore(exportNode, { includeComments: true });

                            if (tokenBefore) {
                                fixes.push(fixer.removeRange([tokenBefore.range[1], exportNode.range[1]]));
                            } else {
                                fixes.push(fixer.remove(exportNode));
                            }

                            return fixes;
                        },
                        message: "Use inline export declarations (export const x = ...) instead of grouped export statements (export { x }).",
                        node: exportNode,
                    });
                });
            },
        };
    },
    meta: {
        docs: { description: "Enforce inline export declarations instead of grouped export statements in non-index files" },
        fixable: "code",
        schema: [],
        type: "layout",
    },
};

export {
    absoluteImportsOnly,
    exportFormat,
    importFormat,
    importSourceSpacing,
    moduleIndexExports,
    indexExportStyle,
    indexExportsOnly,
    inlineExportDeclaration,
};
