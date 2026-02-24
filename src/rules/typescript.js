/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Enum Type Enforcement
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   When a variable/parameter has a type like "ButtonVariantType",
 *   enforce using the corresponding enum "ButtonVariantEnum.VALUE"
 *   instead of string literals like "primary" or "ghost".
 *
 *   The rule detects:
 *   - Default values in destructuring: `variant = "primary"` → `variant = ButtonVariantEnum.PRIMARY`
 *   - Comparisons: `variant === "ghost"` → `variant === ButtonVariantEnum.GHOST`
 *   - Object property values matching the type
 *
 * ✓ Good:
 *   const Button = ({ variant = ButtonVariantEnum.PRIMARY }: { variant?: ButtonVariantType }) => ...
 *   if (variant === ButtonVariantEnum.GHOST) { ... }
 *
 * ✗ Bad:
 *   const Button = ({ variant = "primary" }: { variant?: ButtonVariantType }) => ...
 *   if (variant === "ghost") { ... }
 */
const enumTypeEnforcement = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        // Map to track variables with Type annotations and their corresponding Enum
        // e.g., "variant" -> { typeName: "ButtonVariantType", enumName: "ButtonVariantEnum" }
        const typeAnnotatedVars = new Map();

        // Convert type name to enum name: ButtonVariantType -> ButtonVariantEnum
        const getEnumNameFromTypeHandler = (typeName) => {
            if (typeName.endsWith("Type")) {
                return typeName.slice(0, -4) + "Enum";
            }

            return null;
        };

        // Convert string literal to enum member: "primary" -> "PRIMARY", "ghost-danger" -> "GHOST_DANGER"
        const toEnumMemberHandler = (str) => str.toUpperCase().replace(/-/g, "_");

        // Check if a type annotation references a Type that has a corresponding Enum
        const extractTypeInfoHandler = (typeAnnotation) => {
            if (!typeAnnotation) return null;

            const annotation = typeAnnotation.typeAnnotation;

            if (!annotation) return null;

            // Handle direct type reference: : ButtonVariantType
            if (annotation.type === "TSTypeReference" && annotation.typeName?.type === "Identifier") {
                const typeName = annotation.typeName.name;

                if (typeName.endsWith("Type")) {
                    return {
                        enumName: getEnumNameFromTypeHandler(typeName),
                        typeName,
                    };
                }
            }

            return null;
        };

        // Helper to process TSTypeLiteral members
        const processTypeLiteralMembersHandler = (members) => {
            members.forEach((member) => {
                if (member.type === "TSPropertySignature" && member.key?.type === "Identifier") {
                    const propName = member.key.name;
                    const typeInfo = extractTypeInfoHandler(member.typeAnnotation);

                    if (typeInfo) {
                        typeAnnotatedVars.set(propName, typeInfo);
                    }
                }
            });
        };

        // Track type-annotated parameters in function/component definitions
        const trackTypedParamsHandler = (params) => {
            params.forEach((param) => {
                // Handle destructured params: ({ variant }: { variant?: ButtonVariantType })
                if (param.type === "ObjectPattern" && param.typeAnnotation) {
                    const annotation = param.typeAnnotation.typeAnnotation;

                    if (annotation && annotation.type === "TSTypeLiteral") {
                        processTypeLiteralMembersHandler(annotation.members);
                    }

                    // Handle intersection types: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariantType }
                    if (annotation && annotation.type === "TSIntersectionType") {
                        annotation.types.forEach((intersectionType) => {
                            if (intersectionType.type === "TSTypeLiteral") {
                                processTypeLiteralMembersHandler(intersectionType.members);
                            }
                        });
                    }
                }

                // Handle simple typed param: (variant: ButtonVariantType)
                if (param.type === "Identifier" && param.typeAnnotation) {
                    const typeInfo = extractTypeInfoHandler(param);

                    if (typeInfo) {
                        typeAnnotatedVars.set(param.name, typeInfo);
                    }
                }
            });
        };

        // Check if an enum name exists in the current scope or imports
        const isEnumInScopeHandler = (enumName, node) => {
            const scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();

            // Walk up scope chain looking for the enum variable
            let currentScope = scope;

            while (currentScope) {
                if (currentScope.variables.some((v) => v.name === enumName)) return true;
                currentScope = currentScope.upper;
            }

            return false;
        };

        return {
            // Track function parameters
            "ArrowFunctionExpression, FunctionDeclaration, FunctionExpression"(node) {
                trackTypedParamsHandler(node.params);
            },

            // Check default values in destructuring patterns
            AssignmentPattern(node) {
                // Pattern like: variant = "primary"
                if (node.left.type !== "Identifier") return;

                const varName = node.left.name;
                const typeInfo = typeAnnotatedVars.get(varName);

                if (!typeInfo) return;

                // Check if the default is a string literal
                if (node.right.type === "Literal" && typeof node.right.value === "string") {
                    const stringValue = node.right.value;
                    const enumMember = toEnumMemberHandler(stringValue);
                    const replacement = `${typeInfo.enumName}.${enumMember}`;
                    const enumExists = isEnumInScopeHandler(typeInfo.enumName, node);

                    context.report({
                        fix: enumExists
                            ? (fixer) => fixer.replaceText(node.right, replacement)
                            : undefined,
                        message: `Use "${replacement}" instead of string literal "${stringValue}"`,
                        node: node.right,
                    });
                }
            },

            // Check comparisons: variant === "ghost"
            BinaryExpression(node) {
                if (node.operator !== "===" && node.operator !== "!==") return;

                let varNode = null;
                let literalNode = null;

                if (node.left.type === "Identifier" && node.right.type === "Literal") {
                    varNode = node.left;
                    literalNode = node.right;
                } else if (node.right.type === "Identifier" && node.left.type === "Literal") {
                    varNode = node.right;
                    literalNode = node.left;
                }

                if (!varNode || !literalNode) return;

                if (typeof literalNode.value !== "string") return;

                const typeInfo = typeAnnotatedVars.get(varNode.name);

                if (!typeInfo) return;

                const stringValue = literalNode.value;
                const enumMember = toEnumMemberHandler(stringValue);
                const replacement = `${typeInfo.enumName}.${enumMember}`;
                const enumExists = isEnumInScopeHandler(typeInfo.enumName, node);

                context.report({
                    fix: enumExists
                        ? (fixer) => fixer.replaceText(literalNode, replacement)
                        : undefined,
                    message: `Use "${replacement}" instead of string literal "${stringValue}"`,
                    node: literalNode,
                });
            },

            // Clear tracked vars when exiting function scope
            "ArrowFunctionExpression:exit"() {
                typeAnnotatedVars.clear();
            },

            "FunctionDeclaration:exit"() {
                typeAnnotatedVars.clear();
            },

            "FunctionExpression:exit"() {
                typeAnnotatedVars.clear();
            },
        };
    },
    meta: {
        docs: { description: "Enforce using enum values instead of string literals for typed variables" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Prop Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces naming conventions for boolean and callback/method props:
 *   - Boolean props must start with: is, has, with, without (followed by capital letter)
 *   - Callback props must start with: on (followed by capital letter)
 *
 *   Applies to: interfaces, type aliases, inline types, and nested object types
 *   at any nesting level. Does NOT apply to JSX element attributes.
 *
 * Options:
 *   { booleanPrefixes: ["is", "has"] } - Replace default prefixes entirely
 *   { extendBooleanPrefixes: ["should", "can"] } - Add to default prefixes
 *   { allowPastVerbBoolean: false } - Allow past verb booleans (disabled, selected, checked, opened, etc.)
 *   { allowContinuousVerbBoolean: false } - Allow continuous verb booleans (loading, saving, closing, etc.)
 *   { callbackPrefix: "on" } - Required prefix for callbacks
 *   { allowActionSuffix: false } - Allow "xxxAction" pattern for callbacks
 *
 * ✓ Good:
 *   interface PropsInterface {
 *       isLoading: boolean,
 *       hasError: boolean,
 *       onClick: () => void,
 *       onSubmit: (data: Data) => void,
 *       config: {
 *           isEnabled: boolean,
 *           onToggle: () => void,
 *       },
 *   }
 *
 * ✗ Bad:
 *   interface PropsInterface {
 *       loading: boolean,      // Should be isLoading
 *       error: boolean,        // Should be hasError
 *       click: () => void,     // Should be onClick
 *       handleSubmit: () => void, // Should be onSubmit
 *       config: {
 *           enabled: boolean,  // Should be isEnabled (nested)
 *           toggle: () => void, // Should be onToggle (nested)
 *       },
 *   }
 *
 * ✓ Good (with allowPastVerbBoolean: true):
 *   interface PropsInterface {
 *       disabled: boolean,     // Past verb - allowed
 *       selected: boolean,     // Past verb - allowed
 *       checked: boolean,      // Past verb - allowed
 *   }
 *
 * ✓ Good (with allowContinuousVerbBoolean: true):
 *   interface PropsInterface {
 *       loading: boolean,      // Continuous verb - allowed
 *       saving: boolean,       // Continuous verb - allowed
 *       fetching: boolean,     // Continuous verb - allowed
 *   }
 */
const propNamingConvention = {
    create(context) {
        const options = context.options[0] || {};

        // Boolean prefixes handling (like module-index-exports pattern)
        const defaultBooleanPrefixes = ["is", "has", "with", "without"];
        const booleanPrefixes = options.booleanPrefixes || [
            ...defaultBooleanPrefixes,
            ...(options.extendBooleanPrefixes || []),
        ];

        const allowPastVerbBoolean = options.allowPastVerbBoolean || false;
        const allowContinuousVerbBoolean = options.allowContinuousVerbBoolean || false;
        const callbackPrefix = options.callbackPrefix || "on";
        const allowActionSuffix = options.allowActionSuffix || false;

        // Pattern to check if name starts with valid boolean prefix followed by capital letter
        const booleanPrefixPattern = new RegExp(`^(${booleanPrefixes.join("|")})[A-Z]`);

        // Pattern for callback prefix
        const callbackPrefixPattern = new RegExp(`^${callbackPrefix}[A-Z]`);

        // Pattern for past verb booleans (ends with -ed: disabled, selected, checked, opened, closed, etc.)
        const pastVerbPattern = /^[a-z]+ed$/;

        // Pattern for continuous verb booleans (ends with -ing: loading, saving, closing, etc.)
        const continuousVerbPattern = /^[a-z]+ing$/;

        // Words that suggest "has" prefix instead of "is"
        const hasKeywords = [
            "children", "content", "data", "error", "errors", "items",
            "permission", "permissions", "value", "values",
        ];

        // Convert name to appropriate boolean prefix
        const toBooleanNameHandler = (name) => {
            const lowerName = name.toLowerCase();
            const prefix = hasKeywords.some((k) => lowerName.includes(k)) ? "has" : "is";

            return prefix + name[0].toUpperCase() + name.slice(1);
        };

        // Convert name to callback format (add "on" prefix)
        const toCallbackNameHandler = (name) => {
            // Handle "handleXxx" pattern -> "onXxx"
            if (name.startsWith("handle") && name.length > 6) {
                const rest = name.slice(6);

                return callbackPrefix + rest[0].toUpperCase() + rest.slice(1);
            }

            // Handle "xxxHandler" pattern -> "onXxx"
            if (name.endsWith("Handler") && name.length > 7) {
                const rest = name.slice(0, -7);

                return callbackPrefix + rest[0].toUpperCase() + rest.slice(1);
            }

            // Simple case: just add "on" prefix
            return callbackPrefix + name[0].toUpperCase() + name.slice(1);
        };

        // Check if type annotation indicates boolean
        const isBooleanTypeHandler = (typeAnnotation) => {
            if (!typeAnnotation) return false;
            const type = typeAnnotation.typeAnnotation;

            if (!type) return false;
            if (type.type === "TSBooleanKeyword") return true;
            // Check for union with boolean (e.g., boolean | undefined)
            if (type.type === "TSUnionType") {
                return type.types.some((t) => t.type === "TSBooleanKeyword");
            }

            return false;
        };

        // React event handler type names
        const reactEventHandlerTypes = [
            "MouseEventHandler",
            "ChangeEventHandler",
            "FormEventHandler",
            "KeyboardEventHandler",
            "FocusEventHandler",
            "TouchEventHandler",
            "PointerEventHandler",
            "DragEventHandler",
            "WheelEventHandler",
            "AnimationEventHandler",
            "TransitionEventHandler",
            "ClipboardEventHandler",
            "CompositionEventHandler",
            "UIEventHandler",
            "ScrollEventHandler",
            "EventHandler",
        ];

        // Check if type annotation indicates function/callback
        const isCallbackTypeHandler = (typeAnnotation) => {
            if (!typeAnnotation) return false;
            const type = typeAnnotation.typeAnnotation;

            if (!type) return false;
            if (type.type === "TSFunctionType") return true;
            if (type.type === "TSTypeReference") {
                const typeName = type.typeName?.name;

                // Check for Function, VoidFunction, or React event handler types
                if (typeName === "Function" || typeName === "VoidFunction") return true;
                if (reactEventHandlerTypes.includes(typeName)) return true;
            }

            // Check for union with function (e.g., (() => void) | undefined)
            if (type.type === "TSUnionType") {
                return type.types.some((t) =>
                    t.type === "TSFunctionType" ||
                    (t.type === "TSTypeReference" && (
                        t.typeName?.name === "Function" ||
                        t.typeName?.name === "VoidFunction" ||
                        reactEventHandlerTypes.includes(t.typeName?.name)
                    )));
            }

            return false;
        };

        // Check if type annotation is a nested object type (TSTypeLiteral)
        const isNestedObjectTypeHandler = (typeAnnotation) => {
            if (!typeAnnotation) return false;
            const type = typeAnnotation.typeAnnotation;

            if (!type) return false;

            return type.type === "TSTypeLiteral";
        };

        // Check if name is a valid boolean prop name
        const isValidBooleanNameHandler = (name) => {
            // Starts with valid prefix
            if (booleanPrefixPattern.test(name)) return true;

            // Allow past verb booleans if option is enabled (disabled, selected, checked, etc.)
            if (allowPastVerbBoolean && pastVerbPattern.test(name)) return true;

            // Allow continuous verb booleans if option is enabled (loading, saving, etc.)
            if (allowContinuousVerbBoolean && continuousVerbPattern.test(name)) return true;

            return false;
        };

        // Check if name is a valid callback prop name
        const isValidCallbackNameHandler = (name) => {
            // Starts with "on" prefix
            if (callbackPrefixPattern.test(name)) return true;

            // Allow "xxxAction" suffix if option is enabled
            if (allowActionSuffix && name.endsWith("Action") && name.length > 6) return true;

            return false;
        };

        // Find the containing function for inline type annotations
        const findContainingFunctionHandler = (node) => {
            let current = node;

            while (current) {
                if (current.type === "ArrowFunctionExpression" ||
                    current.type === "FunctionExpression" ||
                    current.type === "FunctionDeclaration") {
                    return current;
                }

                current = current.parent;
            }

            return null;
        };

        // Find matching property in ObjectPattern (destructured params)
        const findDestructuredPropertyHandler = (funcNode, propName) => {
            if (!funcNode || !funcNode.params || funcNode.params.length === 0) return null;

            const firstParam = funcNode.params[0];

            if (firstParam.type !== "ObjectPattern") return null;

            // Find the property in the ObjectPattern
            for (const prop of firstParam.properties) {
                if (prop.type === "Property" && prop.key && prop.key.type === "Identifier") {
                    if (prop.key.name === propName) {
                        return prop;
                    }
                }
            }

            return null;
        };

        // Create fix that renames type annotation, destructured prop, and all references
        const createRenamingFixHandler = (fixer, member, propName, suggestedName) => {
            const fixes = [fixer.replaceText(member.key, suggestedName)];

            // Find the containing function
            const funcNode = findContainingFunctionHandler(member);

            if (!funcNode) return fixes;

            // Find the matching destructured property
            const destructuredProp = findDestructuredPropertyHandler(funcNode, propName);

            if (!destructuredProp) return fixes;

            // Get the value node (the actual variable being declared)
            const valueNode = destructuredProp.value || destructuredProp.key;

            if (!valueNode || valueNode.type !== "Identifier") return fixes;

            // If key and value are the same (shorthand: { copied }), we need to expand and rename
            // If different (renamed: { copied: isCopied }), just rename the value
            const isShorthand = destructuredProp.shorthand !== false &&
                destructuredProp.key === destructuredProp.value;

            if (isShorthand) {
                // Shorthand syntax: { copied } -> { copied: isCopied }
                // We need to keep the key (for the type match) and add the renamed value
                fixes.push(fixer.replaceText(destructuredProp, `${propName}: ${suggestedName}`));
            } else {
                // Already renamed syntax or explicit: just update the value
                fixes.push(fixer.replaceText(valueNode, suggestedName));
            }

            // Find all references to the variable and rename them
            const scope = context.sourceCode
                ? context.sourceCode.getScope(funcNode)
                : context.getScope();

            // Find the variable in the scope
            const findVariableHandler = (s, name) => {
                const v = s.variables.find((variable) => variable.name === name);

                if (v) return v;
                if (s.upper) return findVariableHandler(s.upper, name);

                return null;
            };

            const variable = findVariableHandler(scope, propName);

            if (variable) {
                const fixedRanges = new Set();

                variable.references.forEach((ref) => {
                    // Skip the definition itself
                    if (ref.identifier === valueNode) return;
                    // Skip if already fixed
                    const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                    if (fixedRanges.has(rangeKey)) return;
                    fixedRanges.add(rangeKey);
                    fixes.push(fixer.replaceText(ref.identifier, suggestedName));
                });
            }

            return fixes;
        };

        // Check a property signature (interface/type member) - recursive for nested types
        const checkPropertySignatureHandler = (member) => {
            if (member.type !== "TSPropertySignature") return;
            if (!member.key || member.key.type !== "Identifier") return;

            const propName = member.key.name;

            // Skip private properties (starting with _)
            if (propName.startsWith("_")) return;

            // Check for nested object types and recursively check their members
            if (isNestedObjectTypeHandler(member.typeAnnotation)) {
                const nestedType = member.typeAnnotation.typeAnnotation;

                if (nestedType && nestedType.members) {
                    nestedType.members.forEach(checkPropertySignatureHandler);
                }

                return;
            }

            // Check boolean props
            if (isBooleanTypeHandler(member.typeAnnotation)) {
                if (!isValidBooleanNameHandler(propName)) {
                    const suggestedName = toBooleanNameHandler(propName);

                    context.report({
                        fix: (fixer) => createRenamingFixHandler(fixer, member, propName, suggestedName),
                        message: `Boolean prop "${propName}" should start with a valid prefix (${booleanPrefixes.join(", ")}). Use "${suggestedName}" instead.`,
                        node: member.key,
                    });
                }

                return;
            }

            // Check callback props
            if (isCallbackTypeHandler(member.typeAnnotation)) {
                if (!isValidCallbackNameHandler(propName)) {
                    const suggestedName = toCallbackNameHandler(propName);

                    context.report({
                        fix: (fixer) => createRenamingFixHandler(fixer, member, propName, suggestedName),
                        message: `Callback prop "${propName}" should start with "${callbackPrefix}" prefix. Use "${suggestedName}" instead.`,
                        node: member.key,
                    });
                }
            }
        };

        // Check members of a type literal (inline types, type aliases)
        const checkTypeLiteralHandler = (node) => {
            if (!node.members) return;
            node.members.forEach(checkPropertySignatureHandler);
        };

        return {
            // Interface declarations
            TSInterfaceDeclaration(node) {
                if (!node.body || !node.body.body) return;
                node.body.body.forEach(checkPropertySignatureHandler);
            },

            // Type alias declarations with object type
            TSTypeAliasDeclaration(node) {
                if (node.typeAnnotation?.type === "TSTypeLiteral") {
                    checkTypeLiteralHandler(node.typeAnnotation);
                }
            },

            // Inline type literals (e.g., in function parameters)
            TSTypeLiteral(node) {
                // Skip if already handled by TSTypeAliasDeclaration
                if (node.parent?.type === "TSTypeAliasDeclaration") return;
                checkTypeLiteralHandler(node);
            },
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions: boolean props must start with is/has/with/without, callback props must start with on" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    allowActionSuffix: {
                        default: false,
                        description: "Allow 'xxxAction' pattern for callback props (e.g., submitAction, copyAction)",
                        type: "boolean",
                    },
                    allowContinuousVerbBoolean: {
                        default: false,
                        description: "Allow continuous verb boolean props without prefix (e.g., loading, saving, fetching, closing)",
                        type: "boolean",
                    },
                    allowPastVerbBoolean: {
                        default: false,
                        description: "Allow past verb boolean props without prefix (e.g., disabled, selected, checked, opened)",
                        type: "boolean",
                    },
                    booleanPrefixes: {
                        description: "Replace default boolean prefixes entirely. If not provided, defaults are used with extendBooleanPrefixes",
                        items: { type: "string" },
                        type: "array",
                    },
                    callbackPrefix: {
                        default: "on",
                        description: "Required prefix for callback props",
                        type: "string",
                    },
                    extendBooleanPrefixes: {
                        default: [],
                        description: "Add additional prefixes to the defaults (is, has, with, without)",
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
 * Rule: No Inline Type Definitions
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Function parameters with inline union types should be extracted
 *   to a separate type file. This rule reports union types with
 *   more than a threshold number of members or exceeding a length limit.
 *
 * ✓ Good:
 *   // In types.ts:
 *   export type ButtonVariant = "primary" | "muted" | "danger";
 *
 *   // In Button.tsx:
 *   import { ButtonVariant } from "./types";
 *   export const Button = ({ variant }: { variant?: ButtonVariant }) => ...
 *
 * ✗ Bad:
 *   export const Button = ({ variant }: { variant?: "primary" | "muted" | "danger" }) => ...
 */
const noInlineTypeDefinitions = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const maxUnionMembers = options.maxUnionMembers ?? 2;
        const maxLength = options.maxLength ?? 50;

        // Built-in type keywords that don't need to be extracted
        const builtInTypeKeywords = new Set([
            "any",
            "bigint",
            "boolean",
            "never",
            "null",
            "number",
            "object",
            "string",
            "symbol",
            "undefined",
            "unknown",
            "void",
        ]);

        // Built-in type references (classes/interfaces that are built-in)
        const builtInTypeReferences = new Set([
            "Array",
            "BigInt",
            "Boolean",
            "Date",
            "Error",
            "Function",
            "Map",
            "Number",
            "Object",
            "Promise",
            "ReadonlyArray",
            "RegExp",
            "Set",
            "String",
            "Symbol",
            "WeakMap",
            "WeakSet",
        ]);

        // Check if a type node is a built-in type
        const isBuiltInTypeHandler = (node) => {
            if (!node) return false;

            // Keyword types: string, number, boolean, null, undefined, etc.
            if (node.type === "TSStringKeyword" || node.type === "TSNumberKeyword"
                || node.type === "TSBooleanKeyword" || node.type === "TSNullKeyword"
                || node.type === "TSUndefinedKeyword" || node.type === "TSVoidKeyword"
                || node.type === "TSAnyKeyword" || node.type === "TSUnknownKeyword"
                || node.type === "TSNeverKeyword" || node.type === "TSObjectKeyword"
                || node.type === "TSSymbolKeyword" || node.type === "TSBigIntKeyword") {
                return true;
            }

            // Type reference: Error, Promise, Array, etc.
            if (node.type === "TSTypeReference" && node.typeName) {
                const typeName = node.typeName.name || (node.typeName.type === "Identifier" && node.typeName.name);

                if (typeName && builtInTypeReferences.has(typeName)) {
                    return true;
                }
            }

            // Literal types: true, false, specific strings/numbers
            if (node.type === "TSLiteralType") {
                return true;
            }

            return false;
        };

        // Check if all members of a union are built-in types
        const isBuiltInUnionHandler = (unionNode) => {
            if (unionNode.type !== "TSUnionType") return false;

            return unionNode.types.every((type) => isBuiltInTypeHandler(type));
        };

        // Count union type members
        const countUnionMembersHandler = (node) => {
            if (node.type !== "TSUnionType") return 1;

            let count = 0;

            for (const type of node.types) {
                count += countUnionMembersHandler(type);
            }

            return count;
        };

        // Check if a type annotation contains a complex inline union
        const checkTypeAnnotationHandler = (typeNode, paramName) => {
            if (!typeNode) return;

            // Handle union types directly
            if (typeNode.type === "TSUnionType") {
                // Skip union types with only built-in types (e.g., string | null, Error | null)
                if (isBuiltInUnionHandler(typeNode)) return;

                const memberCount = countUnionMembersHandler(typeNode);
                const typeText = sourceCode.getText(typeNode);

                if (memberCount >= maxUnionMembers || typeText.length > maxLength) {
                    context.report({
                        message: `Inline union type with ${memberCount} members is too complex. Extract to a named type in a types file.`,
                        node: typeNode,
                    });
                }

                return;
            }

            // Handle intersection types (e.g., ButtonHTMLAttributes & { variant: "a" | "b" })
            if (typeNode.type === "TSIntersectionType") {
                for (const type of typeNode.types) {
                    checkTypeAnnotationHandler(type, paramName);
                }

                return;
            }

            // Handle object types with union properties
            if (typeNode.type === "TSTypeLiteral") {
                for (const member of typeNode.members) {
                    if (member.type === "TSPropertySignature" && member.typeAnnotation) {
                        const propType = member.typeAnnotation.typeAnnotation;
                        const propName = member.key && member.key.name ? member.key.name : "unknown";

                        if (propType && propType.type === "TSUnionType") {
                            const memberCount = countUnionMembersHandler(propType);
                            const typeText = sourceCode.getText(propType);

                            if (memberCount >= maxUnionMembers || typeText.length > maxLength) {
                                context.report({
                                    message: `Property "${propName}" has inline union type with ${memberCount} members. Extract to a named type in a types file.`,
                                    node: propType,
                                });
                            }
                        }
                    }
                }
            }
        };

        return {
            // Check function parameters
            ArrowFunctionExpression(node) {
                for (const param of node.params) {
                    if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const paramName = param.type === "Identifier" ? param.name : "param";

                        checkTypeAnnotationHandler(param.typeAnnotation.typeAnnotation, paramName);
                    }
                }
            },
            FunctionDeclaration(node) {
                for (const param of node.params) {
                    if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const paramName = param.type === "Identifier" ? param.name : "param";

                        checkTypeAnnotationHandler(param.typeAnnotation.typeAnnotation, paramName);
                    }
                }
            },
            FunctionExpression(node) {
                for (const param of node.params) {
                    if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
                        const paramName = param.type === "Identifier" ? param.name : "param";

                        checkTypeAnnotationHandler(param.typeAnnotation.typeAnnotation, paramName);
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce extracting inline union types to named types in type files" },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    maxLength: {
                        default: 50,
                        description: "Maximum character length for inline union types (default: 50)",
                        minimum: 1,
                        type: "integer",
                    },
                    maxUnionMembers: {
                        default: 2,
                        description: "Maximum union members to keep inline (default: 2)",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

/*
 * type-format
 *
 * Enforce consistent formatting for TypeScript type aliases:
 * - Type name must be PascalCase and end with "Type" suffix
 * - If object-like, properties must be in camelCase
 * - No empty lines between properties (for object types)
 * - Each property must end with comma (,) not semicolon (;)
 *
 * ✓ Good:
 *   export type UserType = {
 *       firstName: string,
 *       lastName: string,
 *   }
 *
 *   export type IdType = string | number;
 *
 * ✗ Bad:
 *   export type User = {             // Missing "Type" suffix
 *       first_name: string;          // snake_case and semicolon
 *   }
 */
const typeFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const options = context.options[0] || {};
        const minUnionMembersForMultiline = options.minUnionMembersForMultiline !== undefined ? options.minUnionMembersForMultiline : 5;

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        // Convert PascalCase/SCREAMING_SNAKE_CASE/snake_case to camelCase
        const toCamelCaseHandler = (name) => {
            // Handle SCREAMING_SNAKE_CASE (e.g., USER_NAME -> userName)
            if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle snake_case (e.g., user_name -> userName)
            if (/_/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle PascalCase (e.g., UserName -> userName)
            if (/^[A-Z]/.test(name)) {
                return name[0].toLowerCase() + name.slice(1);
            }

            return name;
        };

        const checkTypeLiteralHandler = (declarationNode, typeLiteralNode, members) => {
            if (members.length === 0) return;

            // Get indentation
            const typeLine = sourceCode.lines[declarationNode.loc.start.line - 1];
            const baseIndent = typeLine.match(/^\s*/)[0];
            const propIndent = baseIndent + "    ";

            // Get opening and closing braces
            const openBraceToken = sourceCode.getFirstToken(typeLiteralNode);
            const closeBraceToken = sourceCode.getLastToken(typeLiteralNode);

            // Check for empty line after opening brace
            const firstMember = members[0];

            if (firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBraceToken.range[1], firstMember.range[0]],
                        "\n" + propIndent,
                    ),
                    message: "No empty line after opening brace in type",
                    node: firstMember,
                });
            }

            // Check for empty line before closing brace
            const lastMember = members[members.length - 1];

            if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastMember.range[1], closeBraceToken.range[0]],
                        "\n" + baseIndent,
                    ),
                    message: "No empty line before closing brace in type",
                    node: lastMember,
                });
            }

            // For multiple members, closing brace must be on its own line
            if (members.length >= 2 && closeBraceToken.loc.start.line === lastMember.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastMember.range[1], closeBraceToken.range[0]],
                        "\n" + baseIndent,
                    ),
                    message: "Closing brace should be on its own line in multiline type literal",
                    node: closeBraceToken,
                });
            }

            // For multiple members, first member should be on new line after opening brace
            if (members.length > 1 && firstMember.loc.start.line === openBraceToken.loc.end.line) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBraceToken.range[1], firstMember.range[0]],
                        "\n" + propIndent,
                    ),
                    message: "First type property must be on a new line when there are multiple properties",
                    node: firstMember,
                });
            }

            members.forEach((member, index) => {
                // Check property name is camelCase
                if (member.type === "TSPropertySignature" && member.key && member.key.type === "Identifier") {
                    const propName = member.key.name;

                    if (!camelCaseRegex.test(propName)) {
                        const fixedName = toCamelCaseHandler(propName);

                        context.report({
                            fix: (fixer) => fixer.replaceText(member.key, fixedName),
                            message: `Type property "${propName}" must be camelCase. Use "${fixedName}" instead.`,
                            node: member.key,
                        });
                    }
                }

                // Handle nested object types (e.g., options: { label: string, value: string } or { label: string }[])
                let nestedTypeLiteral = null;

                if (member.type === "TSPropertySignature" && member.typeAnnotation?.typeAnnotation) {
                    const typeNode = member.typeAnnotation.typeAnnotation;

                    if (typeNode.type === "TSTypeLiteral") {
                        nestedTypeLiteral = typeNode;
                    } else if (typeNode.type === "TSArrayType" && typeNode.elementType?.type === "TSTypeLiteral") {
                        nestedTypeLiteral = typeNode.elementType;
                    }
                }

                if (nestedTypeLiteral) {
                    const nestedType = nestedTypeLiteral;

                    if (nestedType.members && nestedType.members.length === 1) {
                        // Collapse single-member nested object types to one line
                        const nestedOpenBrace = sourceCode.getFirstToken(nestedType);
                        const nestedCloseBrace = sourceCode.getLastToken(nestedType);
                        const isNestedMultiLine = nestedOpenBrace.loc.end.line !== nestedCloseBrace.loc.start.line;

                        if (isNestedMultiLine) {
                            const nestedMember = nestedType.members[0];
                            let nestedMemberText = sourceCode.getText(nestedMember).trim();

                            // Remove trailing punctuation
                            if (nestedMemberText.endsWith(",") || nestedMemberText.endsWith(";")) {
                                nestedMemberText = nestedMemberText.slice(0, -1);
                            }

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [nestedOpenBrace.range[0], nestedCloseBrace.range[1]],
                                    `{ ${nestedMemberText} }`,
                                ),
                                message: "Single property nested object type should be on one line",
                                node: nestedType,
                            });
                        }
                    } else if (nestedType.members && nestedType.members.length >= 2) {
                        // Multi-member nested types get the same formatting as outer types
                        checkTypeLiteralHandler(member, nestedType, nestedType.members);
                    }
                }

                // Check for space before ? in optional properties
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
                const memberText = sourceCode.getText(member);

                if (memberText.trimEnd().endsWith(";")) {
                    context.report({
                        fix(fixer) {
                            const lastChar = memberText.lastIndexOf(";");
                            const absolutePos = member.range[0] + lastChar;

                            return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                        },
                        message: "Type properties must end with comma (,) not semicolon (;)",
                        node: member,
                    });
                }

                // Ensure trailing comma on last member (for multi-member types)
                if (members.length >= 2 && index === members.length - 1) {
                    const trimmedText = memberText.trimEnd();

                    if (!trimmedText.endsWith(",") && !trimmedText.endsWith(";")) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(member, ","),
                            message: "Last type property must have trailing comma",
                            node: member,
                        });
                    }
                }

                // Check formatting for multiple members
                if (members.length > 1 && index > 0) {
                    const prevMember = members[index - 1];

                    // Check each is on its own line - with auto-fix
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
                            message: "Each type property must be on its own line when there are multiple properties",
                            node: member,
                        });
                    }

                    // Check for empty lines between properties
                    if (member.loc.start.line - prevMember.loc.end.line > 1) {
                        context.report({
                            fix(fixer) {
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
                            message: "No empty lines allowed between type properties",
                            node: member,
                        });
                    }
                }
            });
        };

        // Handle inline type literals (in TSAsExpression) - single prop on one line, 2+ multiline
        const checkInlineTypeLiteralHandler = (typeLiteral, parentNode) => {
            const { members } = typeLiteral;

            if (members.length === 0) return;

            const openBrace = sourceCode.getFirstToken(typeLiteral);
            const closeBrace = sourceCode.getLastToken(typeLiteral);
            const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;

            // Single property: should be on one line without trailing comma
            if (members.length === 1) {
                const member = members[0];
                const memberText = sourceCode.getText(member);

                // Check for trailing comma in single property
                if (memberText.trimEnd().endsWith(",")) {
                    context.report({
                        fix: (fixer) => {
                            const lastComma = member.range[1] - 1;
                            const textBefore = sourceCode.getText().slice(member.range[0], member.range[1]);
                            const commaIndex = textBefore.lastIndexOf(",");

                            if (commaIndex !== -1) {
                                return fixer.removeRange([member.range[0] + commaIndex, member.range[0] + commaIndex + 1]);
                            }

                            return null;
                        },
                        message: "Single property inline type should not have trailing comma",
                        node: member,
                    });

                    return;
                }

                // If multiline with single property, collapse to single line
                if (isMultiLine) {
                    const typeText = `{ ${memberText.trim().replace(/,$/, "")} }`;

                    context.report({
                        fix: (fixer) => fixer.replaceText(typeLiteral, typeText),
                        message: "Single property inline type should be on one line",
                        node: typeLiteral,
                    });
                }

                return;
            }

            // 2+ properties: should be multiline with trailing comma
            if (!isMultiLine) {
                // Get proper indentation from the line where the type assertion starts
                const asKeyword = sourceCode.getTokenBefore(typeLiteral);
                const lineStart = sourceCode.getText().lastIndexOf("\n", asKeyword.range[0]) + 1;
                const lineText = sourceCode.getText().slice(lineStart, asKeyword.range[0]);
                const baseIndent = lineText.match(/^\s*/)[0];
                const propIndent = baseIndent + "        "; // 8 spaces for nested content

                const formattedMembers = members.map((m) => {
                    let text = sourceCode.getText(m).trim();

                    // Replace semicolon with comma
                    if (text.endsWith(";")) {
                        text = text.slice(0, -1) + ",";
                    } else if (!text.endsWith(",")) {
                        text += ",";
                    }

                    return propIndent + text;
                }).join("\n");

                const newText = `{\n${formattedMembers}\n${baseIndent}    }`;

                context.report({
                    fix: (fixer) => fixer.replaceText(typeLiteral, newText),
                    message: "Inline type with 2+ properties should be multiline with trailing commas",
                    node: typeLiteral,
                });

                return;
            }

            // Already multiline - check for semicolons, missing trailing commas, and empty lines between members
            members.forEach((member, index) => {
                const memberText = sourceCode.getText(member);

                // Check for semicolon (should be comma)
                if (memberText.trimEnd().endsWith(";")) {
                    const semicolonIndex = memberText.lastIndexOf(";");

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [member.range[0] + semicolonIndex, member.range[0] + semicolonIndex + 1],
                            ",",
                        ),
                        message: "Type properties must end with comma (,) not semicolon (;)",
                        node: member,
                    });
                } else if (index === members.length - 1 && !memberText.trimEnd().endsWith(",")) {
                    // Last member needs trailing comma
                    context.report({
                        fix: (fixer) => fixer.insertTextAfter(member, ","),
                        message: "Last property in multiline inline type should have trailing comma",
                        node: member,
                    });
                }

                // Check for empty lines between members
                if (index < members.length - 1) {
                    const nextMember = members[index + 1];

                    if (nextMember.loc.start.line - member.loc.end.line > 1) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [member.range[1], nextMember.range[0]],
                                "\n" + " ".repeat(nextMember.loc.start.column),
                            ),
                            message: "No empty lines between type properties",
                            node: nextMember,
                        });
                    }
                }
            });

            // Check for empty lines after opening brace
            const firstMember = members[0];

            if (firstMember.loc.start.line - openBrace.loc.end.line > 1) {
                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstMember.range[0]],
                        "\n" + " ".repeat(firstMember.loc.start.column),
                    ),
                    message: "No empty line after opening brace in inline type",
                    node: firstMember,
                });
            }

            // For 2+ members: first member should be on its own line (not on same line as opening brace)
            if (members.length >= 2 && openBrace.loc.end.line === firstMember.loc.start.line) {
                // Calculate indentation based on the closing brace position or parent
                const lastMember = members[members.length - 1];
                const propIndent = " ".repeat(lastMember.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [openBrace.range[1], firstMember.range[0]],
                        "\n" + propIndent,
                    ),
                    message: "First property of multiline inline type should be on its own line",
                    node: firstMember,
                });
            }

            // Check for empty lines before closing brace
            const lastMember = members[members.length - 1];

            if (closeBrace.loc.start.line - lastMember.loc.end.line > 1) {
                const indent = " ".repeat(closeBrace.loc.start.column);

                context.report({
                    fix: (fixer) => fixer.replaceTextRange(
                        [lastMember.range[1], closeBrace.range[0]],
                        "\n" + indent,
                    ),
                    message: "No empty line before closing brace in inline type",
                    node: closeBrace,
                });
            }

            // Check if closing brace is on same line as last member - should be on its own line for 2+ properties
            if (members.length >= 2 && closeBrace.loc.start.line === lastMember.loc.end.line) {
                // Get proper indentation - should match the opening brace's line
                const asToken = sourceCode.getTokenBefore(typeLiteral, (t) => t.value === "as");

                if (asToken) {
                    const lineStart = sourceCode.getText().lastIndexOf("\n", asToken.range[0]) + 1;
                    const lineText = sourceCode.getText().slice(lineStart, asToken.range[0]);
                    const baseIndent = lineText.match(/^\s*/)[0];

                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBrace.range[0]],
                            "\n" + baseIndent + "    ",
                        ),
                        message: "Closing brace should be on its own line in multiline type literal",
                        node: closeBrace,
                    });
                }
            }
        };

        return {
            TSAsExpression(node) {
                // Handle type assertions like: state as { user: Type }
                const { typeAnnotation } = node;

                // Find the 'as' keyword token
                const asToken = sourceCode.getTokenBefore(typeAnnotation, (t) => t.value === "as");

                if (asToken && typeAnnotation) {
                    const firstTypeToken = sourceCode.getFirstToken(typeAnnotation);
                    const textAfterAs = sourceCode.text.slice(asToken.range[1], firstTypeToken.range[0]);

                    // Check for proper spacing: should be exactly " " (single space)
                    // Also check that opening brace is on same line as "as"
                    if (firstTypeToken.value === "{") {
                        // For object type literal: as {
                        if (textAfterAs !== " ") {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([asToken.range[1], firstTypeToken.range[0]], " "),
                                message: "Type assertion should have exactly one space after 'as' and opening brace on same line",
                                node: firstTypeToken,
                            });
                        }
                    } else if (asToken.loc.end.line !== firstTypeToken.loc.start.line) {
                        // For other types, ensure same line
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange([asToken.range[1], firstTypeToken.range[0]], " "),
                            message: "Type should be on same line as 'as' keyword",
                            node: firstTypeToken,
                        });
                    }
                }

                if (typeAnnotation && typeAnnotation.type === "TSTypeLiteral") {
                    checkInlineTypeLiteralHandler(typeAnnotation, node);
                }
            },
            TSTypeAliasDeclaration(node) {
                const typeName = node.id.name;

                // Check type name is PascalCase and ends with Type
                if (!pascalCaseRegex.test(typeName)) {
                    context.report({
                        message: `Type name "${typeName}" must be PascalCase`,
                        node: node.id,
                    });
                } else if (!typeName.endsWith("Type")) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceText(node.id, `${typeName}Type`);
                        },
                        message: `Type name "${typeName}" must end with "Type" suffix. Use "${typeName}Type" instead of "${typeName}"`,
                        node: node.id,
                    });
                }

                // Check if it's an object type (TSTypeLiteral)
                if (node.typeAnnotation && node.typeAnnotation.type === "TSTypeLiteral") {
                    const { members } = node.typeAnnotation;

                    // Single property type alias: collapse to one line without trailing punctuation
                    if (members.length === 1) {
                        const openBrace = sourceCode.getFirstToken(node.typeAnnotation);
                        const closeBrace = sourceCode.getLastToken(node.typeAnnotation);
                        const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;
                        const member = members[0];
                        let memberText = sourceCode.getText(member).trim();

                        if (memberText.endsWith(",") || memberText.endsWith(";")) {
                            memberText = memberText.slice(0, -1);
                        }

                        if (isMultiLine) {
                            const equalToken = sourceCode.getTokenAfter(node.id);

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [equalToken.range[0], closeBrace.range[1]],
                                    `= { ${memberText} }`,
                                ),
                                message: "Single property type should be on one line",
                                node: node.typeAnnotation,
                            });
                        } else {
                            // Already inline — check trailing punctuation
                            const rawMemberText = sourceCode.getText(member);

                            if (rawMemberText.trimEnd().endsWith(",")) {
                                const commaIndex = rawMemberText.lastIndexOf(",");

                                context.report({
                                    fix: (fixer) => fixer.removeRange([
                                        member.range[0] + commaIndex,
                                        member.range[0] + commaIndex + 1,
                                    ]),
                                    message: "Single property inline type should not have trailing comma",
                                    node: member,
                                });
                            } else if (rawMemberText.trimEnd().endsWith(";")) {
                                const semiIndex = rawMemberText.lastIndexOf(";");

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange([
                                        member.range[0] + semiIndex,
                                        member.range[0] + semiIndex + 1,
                                    ], ","),
                                    message: "Type properties must end with comma (,) not semicolon (;)",
                                    node: member,
                                });
                            }
                        }
                    } else {
                        // Get opening brace of the type literal
                        const openBraceToken = sourceCode.getFirstToken(node.typeAnnotation);

                        // Check opening brace is on same line as type name (or = sign)
                        if (openBraceToken && openBraceToken.loc.start.line !== node.id.loc.end.line) {
                            context.report({
                                fix: (fixer) => {
                                    const equalToken = sourceCode.getTokenAfter(node.id);

                                    return fixer.replaceTextRange(
                                        [equalToken.range[1], openBraceToken.range[0]],
                                        " ",
                                    );
                                },
                                message: "Opening brace must be on the same line as type name",
                                node: openBraceToken,
                            });
                        }

                        checkTypeLiteralHandler(node, node.typeAnnotation, node.typeAnnotation.members);
                    }
                }

                // Also check intersection types
                if (node.typeAnnotation && node.typeAnnotation.type === "TSIntersectionType") {
                    const types = node.typeAnnotation.types;
                    const equalToken = sourceCode.getTokenAfter(node.id);

                    // Handle TSTypeLiteral members in the intersection
                    types.forEach((type) => {
                        if (type.type !== "TSTypeLiteral") return;

                        const { members } = type;

                        if (members.length === 0) return;

                        if (members.length === 1) {
                            // Single-prop: collapse to inline { prop: Type } with no trailing punctuation
                            const openBrace = sourceCode.getFirstToken(type);
                            const closeBrace = sourceCode.getLastToken(type);
                            const member = members[0];
                            const isMultiLine = openBrace.loc.start.line !== closeBrace.loc.end.line;

                            if (isMultiLine) {
                                let memberText = sourceCode.getText(member).trim();

                                if (memberText.endsWith(",") || memberText.endsWith(";")) {
                                    memberText = memberText.slice(0, -1);
                                }

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [openBrace.range[0], closeBrace.range[1]],
                                        `{ ${memberText} }`,
                                    ),
                                    message: "Single property type in intersection should be inline",
                                    node: type,
                                });
                            } else {
                                // Already inline - check for trailing comma or semicolon
                                const memberText = sourceCode.getText(member);

                                if (memberText.trimEnd().endsWith(",")) {
                                    const commaIndex = memberText.lastIndexOf(",");

                                    context.report({
                                        fix: (fixer) => fixer.removeRange([
                                            member.range[0] + commaIndex,
                                            member.range[0] + commaIndex + 1,
                                        ]),
                                        message: "Single property inline type should not have trailing comma",
                                        node: member,
                                    });
                                } else if (memberText.trimEnd().endsWith(";")) {
                                    const semiIndex = memberText.lastIndexOf(";");

                                    context.report({
                                        fix: (fixer) => fixer.replaceTextRange([
                                            member.range[0] + semiIndex,
                                            member.range[0] + semiIndex + 1,
                                        ], ","),
                                        message: "Type properties must end with comma (,) not semicolon (;)",
                                        node: member,
                                    });
                                }
                            }
                        } else {
                            // Multi-prop: use existing handler for formatting
                            checkTypeLiteralHandler(node, type, members);
                        }
                    });

                    // Check intersection members are on same line (joined by &)
                    // = should be on same line as first type
                    if (equalToken && types[0] && types[0].loc.start.line !== equalToken.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [equalToken.range[1], types[0].range[0]],
                                " ",
                            ),
                            message: "First intersection member should be on same line as '='",
                            node: types[0],
                        });
                    }

                    // Check each consecutive pair - & and next type on same line
                    for (let i = 1; i < types.length; i++) {
                        const prevType = types[i - 1];
                        const currentType = types[i];
                        const ampToken = sourceCode.getTokenBefore(currentType, (t) => t.value === "&");

                        if (!ampToken) continue;

                        // & should be on same line as end of previous type
                        if (ampToken.loc.start.line !== prevType.loc.end.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [prevType.range[1], ampToken.range[0]],
                                    " ",
                                ),
                                message: "'&' should be on same line as previous intersection member",
                                node: ampToken,
                            });
                        }

                        // Current type should start on same line as &
                        if (currentType.loc.start.line !== ampToken.loc.start.line) {
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [ampToken.range[1], currentType.range[0]],
                                    " ",
                                ),
                                message: "Intersection member should be on same line as '&'",
                                node: currentType,
                            });
                        }
                    }
                }

                // Check union types formatting (e.g., "a" | "b" | "c")
                if (node.typeAnnotation && node.typeAnnotation.type === "TSUnionType") {
                    const unionType = node.typeAnnotation;
                    const types = unionType.types;
                    const minMembersForMultiline = minUnionMembersForMultiline;

                    // Get line info
                    const typeLine = sourceCode.lines[node.loc.start.line - 1];
                    const baseIndent = typeLine.match(/^\s*/)[0];
                    const memberIndent = baseIndent + "    ";

                    // Get the = token
                    const equalToken = sourceCode.getTokenAfter(node.id);
                    const firstType = types[0];
                    const lastType = types[types.length - 1];

                    // Check if currently on single line
                    const isCurrentlySingleLine = firstType.loc.start.line === lastType.loc.end.line &&
                        equalToken.loc.end.line === firstType.loc.start.line;

                    // Check if currently properly multiline (= on its own conceptually, first type on new line)
                    const isFirstTypeOnNewLine = firstType.loc.start.line > equalToken.loc.end.line;

                    if (types.length >= minMembersForMultiline) {
                        // Should be multiline format
                        // Check if needs reformatting
                        let needsReformat = false;

                        // Check if first type is on new line after =
                        if (!isFirstTypeOnNewLine) {
                            needsReformat = true;
                        }

                        // Check if each type is on its own line
                        if (!needsReformat) {
                            for (let i = 1; i < types.length; i++) {
                                if (types[i].loc.start.line === types[i - 1].loc.end.line) {
                                    needsReformat = true;
                                    break;
                                }
                            }
                        }

                        // Check proper indentation and | placement
                        if (!needsReformat) {
                            for (let i = 1; i < types.length; i++) {
                                const pipeToken = sourceCode.getTokenBefore(types[i]);

                                if (pipeToken && pipeToken.value === "|") {
                                    // | should be at start of line (after indent)
                                    if (pipeToken.loc.start.line !== types[i].loc.start.line) {
                                        needsReformat = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (needsReformat) {
                            // Build the correct multiline format
                            const formattedTypes = types.map((type, index) => {
                                const typeText = sourceCode.getText(type);

                                if (index === 0) {
                                    return memberIndent + typeText;
                                }

                                return memberIndent + "| " + typeText;
                            }).join("\n");

                            const newTypeText = `= \n${formattedTypes}`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [equalToken.range[0], lastType.range[1]],
                                    newTypeText,
                                ),
                                message: `Union type with ${types.length} members should be multiline with each member on its own line`,
                                node: unionType,
                            });
                        }
                    } else {
                        // Should be single line format (less than 5 members)
                        // But skip if any union member is a multi-prop type literal (those need to stay expanded)
                        const hasMultiPropTypeLiteral = types.some(
                            (type) => type.type === "TSTypeLiteral" && type.members && type.members.length >= 2,
                        );

                        if (!isCurrentlySingleLine && !hasMultiPropTypeLiteral) {
                            // Build single line format
                            const typeTexts = types.map((type) => sourceCode.getText(type));
                            const singleLineText = `= ${typeTexts.join(" | ")}`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [equalToken.range[0], lastType.range[1]],
                                    singleLineText,
                                ),
                                message: `Union type with ${types.length} members should be on a single line`,
                                node: unionType,
                            });
                        }
                    }
                }
            },
            // Handle inline type literals (e.g., in function parameters)
            TSTypeLiteral(node) {
                // Skip if already handled by TSTypeAliasDeclaration or TSAsExpression
                if (node.parent?.type === "TSTypeAliasDeclaration") return;
                if (node.parent?.type === "TSAsExpression") return;
                // Skip if already handled as nested type inside checkTypeLiteralHandler
                if (node.parent?.type === "TSTypeAnnotation"
                    && node.parent.parent?.type === "TSPropertySignature"
                    && node.parent.parent.parent?.type === "TSTypeLiteral"
                    && (node.parent.parent.parent.parent?.type === "TSTypeAliasDeclaration"
                        || node.parent.parent.parent.parent?.type === "TSIntersectionType")) return;

                if (!node.members || node.members.length === 0) return;

                // Find a suitable parent for indentation reference
                let indentRef = node.parent;

                while (indentRef && !indentRef.loc) {
                    indentRef = indentRef.parent;
                }

                if (indentRef) {
                    checkTypeLiteralHandler(indentRef, node, node.members);
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce type naming (PascalCase + Type suffix), camelCase properties, proper formatting, union type formatting, and trailing commas" },
        fixable: "code",
        schema: [
            {
                additionalProperties: false,
                properties: {
                    minUnionMembersForMultiline: {
                        default: 5,
                        description: "Minimum number of union members to require multiline format",
                        minimum: 2,
                        type: "integer",
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
 * Rule: Type Annotation Spacing
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Enforces proper spacing in TypeScript type annotations:
 *   - No space before colon in type annotations
 *   - Type should be on same line as colon
 *   - No spaces inside generic type parameters
 *
 * ✓ Good:
 *   const x: Type = value;
 *   const arr: ColumnDef<T>[] = [];
 *
 * ✗ Bad:
 *   const x : Type = value;
 *   const x:
 *       Type = value;
 *   const arr: ColumnDef< T >[] = [];
 */
const typeAnnotationSpacing = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        return {
            ArrowFunctionExpression(node) {
                // Check for space after async keyword: async() => -> async () =>
                if (node.async) {
                    const asyncToken = sourceCode.getFirstToken(node, (t) => t.value === "async");
                    const openParen = sourceCode.getTokenAfter(asyncToken, (t) => t.value === "(");

                    if (asyncToken && openParen) {
                        const textBetween = sourceCode.text.slice(asyncToken.range[1], openParen.range[0]);

                        // Should have exactly one space after async
                        if (textBetween === "") {
                            context.report({
                                fix: (fixer) => fixer.insertTextAfter(asyncToken, " "),
                                message: "Missing space after async keyword",
                                node: asyncToken,
                            });
                        } else if (textBetween !== " " && !textBetween.includes("\n")) {
                            // Has extra spaces but not newline
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([asyncToken.range[1], openParen.range[0]], " "),
                                message: "Should have exactly one space after async keyword",
                                node: asyncToken,
                            });
                        }
                    }
                }
            },
            FunctionExpression(node) {
                // Check for space after async keyword in function expressions: async function() -> async function ()
                if (node.async) {
                    const asyncToken = sourceCode.getFirstToken(node, (t) => t.value === "async");
                    const functionToken = sourceCode.getTokenAfter(asyncToken, (t) => t.value === "function");

                    if (functionToken) {
                        const openParen = sourceCode.getTokenAfter(functionToken, (t) => t.value === "(");

                        if (openParen) {
                            const textBetween = sourceCode.text.slice(functionToken.range[1], openParen.range[0]);

                            // Should have exactly one space after function keyword
                            if (textBetween === "") {
                                context.report({
                                    fix: (fixer) => fixer.insertTextAfter(functionToken, " "),
                                    message: "Missing space after function keyword",
                                    node: functionToken,
                                });
                            }
                        }
                    }
                }
            },
            TSArrayType(node) {
                // Check for space before [] like: Type []
                const elementType = node.elementType;
                const openBracket = sourceCode.getTokenAfter(elementType, (t) => t.value === "[");

                if (openBracket) {
                    const textBetween = sourceCode.text.slice(elementType.range[1], openBracket.range[0]);

                    if (textBetween !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([elementType.range[1], openBracket.range[0]]),
                            message: "No space allowed before [] in array type",
                            node: openBracket,
                        });
                    }
                }
            },
            TSTypeReference(node) {
                // Check for space before generic < like: ColumnDef <T>
                if (node.typeArguments || node.typeParameters) {
                    const typeArgs = node.typeArguments || node.typeParameters;
                    const openAngle = sourceCode.getFirstToken(typeArgs);

                    if (openAngle && openAngle.value === "<") {
                        const tokenBefore = sourceCode.getTokenBefore(openAngle);

                        if (tokenBefore) {
                            const textBetween = sourceCode.text.slice(tokenBefore.range[1], openAngle.range[0]);

                            if (textBetween !== "") {
                                context.report({
                                    fix: (fixer) => fixer.removeRange([tokenBefore.range[1], openAngle.range[0]]),
                                    message: "No space allowed before < in generic type",
                                    node: openAngle,
                                });
                            }
                        }
                    }
                }
            },
            TSTypeAnnotation(node) {
                const colonToken = sourceCode.getFirstToken(node);

                if (!colonToken || colonToken.value !== ":") return;

                // Check for space before colon
                const tokenBeforeColon = sourceCode.getTokenBefore(colonToken);

                if (tokenBeforeColon) {
                    const textBetween = sourceCode.getText().slice(
                        tokenBeforeColon.range[1],
                        colonToken.range[0],
                    );

                    if (textBetween !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([tokenBeforeColon.range[1], colonToken.range[0]]),
                            message: "No space allowed before colon in type annotation",
                            node: colonToken,
                        });

                        return;
                    }
                }

                // Check for missing space after colon
                const typeNode = node.typeAnnotation;

                if (typeNode) {
                    const textAfterColon = sourceCode.text.slice(colonToken.range[1], typeNode.range[0]);

                    // Should have exactly one space after colon
                    if (textAfterColon === "") {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(colonToken, " "),
                            message: "Missing space after colon in type annotation",
                            node: colonToken,
                        });

                        return;
                    }
                }

                // Check if type is on same line as colon
                if (typeNode && colonToken.loc.end.line !== typeNode.loc.start.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [colonToken.range[1], typeNode.range[0]],
                            " ",
                        ),
                        message: "Type should be on the same line as colon in type annotation",
                        node: typeNode,
                    });
                }
            },
            TSTypeParameterInstantiation(node) {
                // Check for spaces inside generics like ColumnDef< T >
                const openBracket = sourceCode.getFirstToken(node);
                const closeBracket = sourceCode.getLastToken(node);

                if (!openBracket || !closeBracket) return;

                if (openBracket.value !== "<" || closeBracket.value !== ">") return;

                // Check for space after < (only for single-line generics — multiline handled by formatting below)
                const firstParam = node.params[0];
                const isSingleLine = firstParam && openBracket.loc.end.line === closeBracket.loc.start.line;

                if (firstParam && isSingleLine) {
                    const textAfterOpen = sourceCode.getText().slice(
                        openBracket.range[1],
                        firstParam.range[0],
                    );

                    if (textAfterOpen.trim() === "" && textAfterOpen !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([openBracket.range[1], firstParam.range[0]]),
                            message: "No space allowed after < in generic type",
                            node: openBracket,
                        });
                    }
                }

                // Check for space before > (only for single-line generics)
                const lastParam = node.params[node.params.length - 1];

                if (lastParam && isSingleLine) {
                    const textBeforeClose = sourceCode.getText().slice(
                        lastParam.range[1],
                        closeBracket.range[0],
                    );

                    if (textBeforeClose.trim() === "" && textBeforeClose !== "") {
                        context.report({
                            fix: (fixer) => fixer.removeRange([lastParam.range[1], closeBracket.range[0]]),
                            message: "No space allowed before > in generic type",
                            node: closeBracket,
                        });
                    }
                }

                // Generic type params formatting (like function params)
                const params = node.params;

                if (params.length === 1) {
                    // Single param: should be inline — <ParamType> (no trailing comma, no newlines)
                    const param = params[0];
                    const isMultiLine = openBracket.loc.end.line !== closeBracket.loc.start.line;

                    if (isMultiLine) {
                        const paramText = sourceCode.getText(param).trim();
                        // Remove trailing comma if present
                        const cleanParamText = paramText.endsWith(",") ? paramText.slice(0, -1) : paramText;

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBracket.range[1], closeBracket.range[0]],
                                cleanParamText,
                            ),
                            message: "Single generic type parameter should be inline",
                            node,
                        });

                        return;
                    }

                    // Already inline — check for trailing comma (not allowed for single param)
                    const paramText = sourceCode.getText(param);

                    if (paramText.trimEnd().endsWith(",")) {
                        const commaIndex = paramText.lastIndexOf(",");

                        context.report({
                            fix: (fixer) => fixer.removeRange([
                                param.range[0] + commaIndex,
                                param.range[0] + commaIndex + 1,
                            ]),
                            message: "Single generic type parameter should not have trailing comma",
                            node: param,
                        });

                        return;
                    }
                } else if (params.length >= 2) {
                    // Multiple params: each on its own line with trailing commas, > on its own line
                    // But only if the generic params span is long enough to warrant multiline
                    const genericText = sourceCode.getText().slice(openBracket.range[0], closeBracket.range[1]);

                    if (genericText.length <= 80 && openBracket.loc.start.line === closeBracket.loc.end.line) return;

                    const nodeLine = sourceCode.lines[node.loc.start.line - 1];
                    const baseIndent = nodeLine.match(/^\s*/)[0];
                    const paramIndent = baseIndent + "    ";

                    const isFirstOnNewLine = firstParam.loc.start.line > openBracket.loc.end.line;
                    const isClosingOnOwnLine = closeBracket.loc.start.line > lastParam.loc.end.line;

                    let needsReformat = !isFirstOnNewLine || !isClosingOnOwnLine;

                    // Check each param is on its own line
                    if (!needsReformat) {
                        for (let i = 1; i < params.length; i++) {
                            if (params[i].loc.start.line === params[i - 1].loc.end.line) {
                                needsReformat = true;
                                break;
                            }
                        }
                    }

                    // Check commas between params (not trailing on last — TS doesn't allow it)
                    if (!needsReformat) {
                        for (let i = 0; i < params.length - 1; i++) {
                            const tokenAfter = sourceCode.getTokenAfter(params[i]);

                            if (!tokenAfter || tokenAfter.value !== ",") {
                                needsReformat = true;
                                break;
                            }
                        }

                        // Last param should NOT have a trailing comma
                        if (!needsReformat) {
                            const lastTokenAfter = sourceCode.getTokenAfter(lastParam);

                            if (lastTokenAfter && lastTokenAfter.value === ",") {
                                needsReformat = true;
                            }
                        }
                    }

                    if (needsReformat) {
                        const formattedParams = params.map((param, index) => {
                            const text = sourceCode.getText(param).trim();
                            const comma = index < params.length - 1 ? "," : "";

                            return paramIndent + text + comma;
                        }).join("\n");

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBracket.range[1], closeBracket.range[0]],
                                "\n" + formattedParams + "\n" + baseIndent,
                            ),
                            message: "Generic type parameters should each be on their own line",
                            node,
                        });

                        return;
                    }
                }

                // Check for formatting inside type literal params
                node.params.forEach((param) => {
                    if (param.type === "TSTypeLiteral" && param.members && param.members.length > 0) {
                        const typeOpenBrace = sourceCode.getFirstToken(param);
                        const typeCloseBrace = sourceCode.getLastToken(param);

                        if (!typeOpenBrace || !typeCloseBrace) return;
                        if (typeOpenBrace.value !== "{" || typeCloseBrace.value !== "}") return;

                        const members = param.members;
                        const isMultiLine = typeOpenBrace.loc.start.line !== typeCloseBrace.loc.end.line;

                        // Single property type literal should be on one line without trailing punctuation
                        if (members.length === 1) {
                            const member = members[0];
                            let memberText = sourceCode.getText(member).trim();
                            const originalText = memberText;

                            // Remove trailing comma or semicolon for single property
                            if (memberText.endsWith(",") || memberText.endsWith(";")) {
                                memberText = memberText.slice(0, -1);
                            }

                            if (isMultiLine) {
                                const newText = `{ ${memberText} }`;

                                context.report({
                                    fix: (fixer) => fixer.replaceText(param, newText),
                                    message: "Single property generic type literal should be on one line",
                                    node: param,
                                });

                                return;
                            }

                            // Single line but has trailing comma - remove it
                            if (originalText.endsWith(",") || originalText.endsWith(";")) {
                                const newText = `{ ${memberText} }`;

                                context.report({
                                    fix: (fixer) => fixer.replaceText(param, newText),
                                    message: "Single property generic type literal should not have trailing punctuation",
                                    node: param,
                                });
                            }

                            return; // Skip other checks for single property
                        }

                        // 2+ properties: should be multiline
                        if (!isMultiLine) {
                            // Get indentation from the line where the generic starts
                            const lineStart = sourceCode.getText().lastIndexOf("\n", node.range[0]) + 1;
                            const lineText = sourceCode.getText().slice(lineStart, node.range[0]);
                            const baseIndent = lineText.match(/^\s*/)[0];
                            const propIndent = baseIndent + "    ";

                            const formattedMembers = members.map((m) => {
                                let text = sourceCode.getText(m).trim();

                                // Replace semicolon with comma
                                if (text.endsWith(";")) {
                                    text = text.slice(0, -1) + ",";
                                } else if (!text.endsWith(",")) {
                                    text += ",";
                                }

                                return propIndent + text;
                            }).join("\n");

                            const newText = `{\n${formattedMembers}\n${baseIndent}}`;

                            context.report({
                                fix: (fixer) => fixer.replaceText(param, newText),
                                message: "Generic type literal with 2+ properties should be multiline",
                                node: param,
                            });

                            return;
                        }

                        const firstMember = members[0];
                        const lastMember = members[members.length - 1];

                        // Check for empty line after opening brace
                        if (firstMember && typeOpenBrace.loc.end.line < firstMember.loc.start.line - 1) {
                            context.report({
                                fix: (fixer) => {
                                    const textAfterBrace = sourceCode.text.slice(typeOpenBrace.range[1], firstMember.range[0]);
                                    const newText = textAfterBrace.replace(/\n\s*\n/, "\n");

                                    return fixer.replaceTextRange([typeOpenBrace.range[1], firstMember.range[0]], newText);
                                },
                                message: "No empty line allowed after opening brace in generic type literal",
                                node: typeOpenBrace,
                            });
                        }

                        // Check for empty line before closing brace
                        if (lastMember && lastMember.loc.end.line < typeCloseBrace.loc.start.line - 1) {
                            context.report({
                                fix: (fixer) => {
                                    const textBeforeBrace = sourceCode.text.slice(lastMember.range[1], typeCloseBrace.range[0]);
                                    const newText = textBeforeBrace.replace(/\n\s*\n/, "\n");

                                    return fixer.replaceTextRange([lastMember.range[1], typeCloseBrace.range[0]], newText);
                                },
                                message: "No empty line allowed before closing brace in generic type literal",
                                node: typeCloseBrace,
                            });
                        }

                        // Check for semicolons, missing trailing commas, and empty lines between members
                        members.forEach((member, index) => {
                            const memberText = sourceCode.getText(member);

                            // Check for semicolon (should be comma)
                            if (memberText.trimEnd().endsWith(";")) {
                                const semicolonIndex = memberText.lastIndexOf(";");

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [member.range[0] + semicolonIndex, member.range[0] + semicolonIndex + 1],
                                        ",",
                                    ),
                                    message: "Type properties must end with comma (,) not semicolon (;)",
                                    node: member,
                                });
                            } else if (index === members.length - 1 && !memberText.trimEnd().endsWith(",")) {
                                // Last member needs trailing comma
                                context.report({
                                    fix: (fixer) => fixer.insertTextAfter(member, ","),
                                    message: "Last property in generic type literal should have trailing comma",
                                    node: member,
                                });
                            }

                            // Check for empty lines between members
                            if (index < members.length - 1) {
                                const nextMember = members[index + 1];

                                if (nextMember.loc.start.line - member.loc.end.line > 1) {
                                    context.report({
                                        fix: (fixer) => fixer.replaceTextRange(
                                            [member.range[1], nextMember.range[0]],
                                            "\n" + " ".repeat(nextMember.loc.start.column),
                                        ),
                                        message: "No empty lines between type properties in generic",
                                        node: nextMember,
                                    });
                                }
                            }
                        });
                    }
                });

                // Check for }>( pattern - closing > should be followed by ( on same line with no space
                const parent = node.parent;

                if (parent && parent.type === "CallExpression" && parent.typeArguments === node) {
                    const args = parent.arguments;

                    if (args && args.length > 0) {
                        const openParen = sourceCode.getTokenAfter(closeBracket, (t) => t.value === "(");

                        if (openParen) {
                            // Check if > and ( are on same line
                            if (closeBracket.loc.end.line !== openParen.loc.start.line) {
                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange([closeBracket.range[1], openParen.range[0]], ""),
                                    message: "Opening parenthesis should be on same line as closing > in generic call",
                                    node: openParen,
                                });
                            }

                            // Check for >({ pattern with first argument - ONLY for single argument calls
                            // Multi-argument calls (like hooks) should have ) on its own line
                            if (args.length === 1) {
                                const firstArg = args[0];

                                if (firstArg && (firstArg.type === "ObjectExpression" || firstArg.type === "ArrayExpression")) {
                                    const firstArgFirstToken = sourceCode.getFirstToken(firstArg);

                                    if (firstArgFirstToken && openParen.loc.end.line !== firstArgFirstToken.loc.start.line) {
                                        context.report({
                                            fix: (fixer) => fixer.replaceTextRange([openParen.range[1], firstArgFirstToken.range[0]], ""),
                                            message: "First argument should be on same line as opening parenthesis in generic call",
                                            node: firstArg,
                                        });
                                    }

                                    // Check for },\n); pattern - closing } should be followed by ); on same line
                                    const lastArgLastToken = sourceCode.getLastToken(firstArg);
                                    const closeParen = sourceCode.getTokenAfter(firstArg, (t) => t.value === ")");

                                    if (lastArgLastToken && closeParen) {
                                        const textBetween = sourceCode.text.slice(lastArgLastToken.range[1], closeParen.range[0]);

                                        // Check if there's a newline between } and )
                                        if (textBetween.includes("\n")) {
                                            // Should be }); or }, with ) on same line
                                            const hasTrailingComma = textBetween.trim() === ",";

                                            context.report({
                                                fix: (fixer) => {
                                                    if (hasTrailingComma) {
                                                        // Remove the trailing comma and newline: },\n) -> )
                                                        return fixer.replaceTextRange([lastArgLastToken.range[1], closeParen.range[0]], "");
                                                    }

                                                    // Just remove the newline
                                                    return fixer.replaceTextRange([lastArgLastToken.range[1], closeParen.range[0]], "");

                                                },
                                                message: "Closing parenthesis should be on same line as closing brace in generic call",
                                                node: closeParen,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            VariableDeclaration(node) {
                // Check for semicolon on next line: const x = fn()\n;
                const lastToken = sourceCode.getLastToken(node);

                if (lastToken && lastToken.value === ";") {
                    // Get the token before the semicolon
                    const tokenBeforeSemi = sourceCode.getTokenBefore(lastToken);

                    if (tokenBeforeSemi && lastToken.loc.start.line > tokenBeforeSemi.loc.end.line) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [tokenBeforeSemi.range[1], lastToken.range[1]],
                                ";",
                            ),
                            message: "Semicolon should be on the same line as statement",
                            node: lastToken,
                        });
                    }
                }
            },
            TSFunctionType(node) {
                // Check for space after => in function types: () =>void -> () => void
                // Find the arrow token by searching all tokens in the node
                const tokens = sourceCode.getTokens(node);
                const arrowToken = tokens.find((t) => t.value === "=>");

                if (arrowToken) {
                    const nextToken = sourceCode.getTokenAfter(arrowToken);

                    if (nextToken) {
                        const textAfterArrow = sourceCode.text.slice(arrowToken.range[1], nextToken.range[0]);

                        // Should have exactly one space after =>
                        if (textAfterArrow === "") {
                            context.report({
                                fix: (fixer) => fixer.insertTextAfter(arrowToken, " "),
                                message: "Missing space after => in function type",
                                node: arrowToken,
                            });
                        } else if (textAfterArrow !== " " && !textAfterArrow.includes("\n")) {
                            // Has extra spaces but not newline
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([arrowToken.range[1], nextToken.range[0]], " "),
                                message: "Should have exactly one space after => in function type",
                                node: arrowToken,
                            });
                        }
                    }
                }

                // Check function type params formatting
                // - 3+ params should be multiline
                // - 0-2 params should be on one line
                const params = node.params;
                const openParen = tokens.find((t) => t.value === "(");

                if (openParen && arrowToken) {
                    const closeParen = sourceCode.getTokenBefore(arrowToken, (t) => t.value === ")");

                    if (closeParen) {
                        const isMultiLine = openParen.loc.start.line !== closeParen.loc.end.line;

                        if (params && params.length >= 3 && !isMultiLine) {
                            // 3+ params on one line - expand to multiple lines
                            const lineStart = sourceCode.text.lastIndexOf("\n", node.range[0]) + 1;
                            const lineText = sourceCode.text.slice(lineStart, node.range[0]);
                            const match = lineText.match(/^(\s*)/);
                            const baseIndent = match ? match[1] : "";
                            const paramIndent = baseIndent + "    ";

                            const formattedParams = params.map((p) => {
                                const paramText = sourceCode.getText(p);

                                return paramIndent + paramText;
                            }).join(",\n");

                            const newParamsText = `(\n${formattedParams},\n${baseIndent})`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([openParen.range[0], closeParen.range[1]], newParamsText),
                                message: "Function type with 3+ parameters should have each parameter on its own line",
                                node,
                            });
                        } else if (params && params.length <= 2 && isMultiLine) {
                            // 0-2 params on multiple lines - collapse to one line
                            const formattedParams = params.map((p) => sourceCode.getText(p).trim()).join(", ");
                            const newParamsText = `(${formattedParams})`;

                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([openParen.range[0], closeParen.range[1]], newParamsText),
                                message: "Function type with 2 or fewer parameters should be on one line",
                                node,
                            });
                        }
                    }
                }
            },
            VariableDeclarator(node) {
                // Check for space before generic like: ColumnDef <T>
                if (node.id && node.id.typeAnnotation) {
                    const typeNode = node.id.typeAnnotation.typeAnnotation;

                    if (typeNode && typeNode.type === "TSTypeReference" && typeNode.typeArguments) {
                        const typeName = typeNode.typeName;
                        const typeArgs = typeNode.typeArguments;
                        const textBetween = sourceCode.getText().slice(
                            typeName.range[1],
                            typeArgs.range[0],
                        );

                        if (textBetween !== "") {
                            context.report({
                                fix: (fixer) => fixer.removeRange([typeName.range[1], typeArgs.range[0]]),
                                message: "No space allowed between type name and generic parameters",
                                node: typeArgs,
                            });
                        }
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce proper spacing in TypeScript type annotations" },
        fixable: "whitespace",
        schema: [],
        type: "layout",
    },
};

const enumFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
        const upperCaseRegex = /^[A-Z][A-Z0-9_]*$/;

        return {
            TSEnumDeclaration(node) {
                const enumName = node.id.name;

                // Check enum name is PascalCase and ends with Enum
                if (!pascalCaseRegex.test(enumName)) {
                    context.report({
                        message: `Enum name "${enumName}" must be PascalCase`,
                        node: node.id,
                    });
                } else if (!enumName.endsWith("Enum")) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceText(node.id, `${enumName}Enum`);
                        },
                        message: `Enum name "${enumName}" must end with "Enum" suffix. Use "${enumName}Enum" instead of "${enumName}"`,
                        node: node.id,
                    });
                }

                // Get opening brace
                const openBraceToken = sourceCode.getTokenAfter(node.id, { filter: (token) => token.value === "{" });

                // Check opening brace is on same line as enum name
                if (openBraceToken && openBraceToken.loc.start.line !== node.id.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [node.id.range[1], openBraceToken.range[0]],
                            " ",
                        ),
                        message: "Opening brace must be on the same line as enum name",
                        node: openBraceToken,
                    });
                }

                // Check members
                const members = node.members;

                if (members.length === 0) return;

                // Get indentation
                const enumLine = sourceCode.lines[node.loc.start.line - 1];
                const baseIndent = enumLine.match(/^\s*/)[0];
                const memberIndent = baseIndent + "    ";

                // Get closing brace
                const closeBraceToken = sourceCode.getLastToken(node);

                // Check for empty line after opening brace
                const firstMember = members[0];

                if (openBraceToken && firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + memberIndent,
                        ),
                        message: "No empty line after opening brace in enum",
                        node: firstMember,
                    });
                }

                // Check for empty line before closing brace
                const lastMember = members[members.length - 1];

                if (closeBraceToken && closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBraceToken.range[0]],
                            "\n" + baseIndent,
                        ),
                        message: "No empty line before closing brace in enum",
                        node: lastMember,
                    });
                }

                // For single member, should be on one line without trailing comma
                if (members.length === 1) {
                    const member = members[0];
                    const memberText = sourceCode.getText(member);
                    const isMultiLine = openBraceToken.loc.end.line !== closeBraceToken.loc.start.line;

                    if (isMultiLine) {
                        // Collapse to single line without trailing comma
                        let cleanText = memberText.trim();

                        if (cleanText.endsWith(",")) cleanText = cleanText.slice(0, -1);

                        const newEnumText = `{ ${cleanText} }`;

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[0], closeBraceToken.range[1]],
                                newEnumText,
                            ),
                            message: "Single member enum should be on one line without trailing comma",
                            node,
                        });

                        return;
                    }

                    // Check for trailing comma in single-line single member
                    if (memberText.trimEnd().endsWith(",")) {
                        const commaIndex = memberText.lastIndexOf(",");

                        context.report({
                            fix: (fixer) => fixer.removeRange([member.range[0] + commaIndex, member.range[0] + commaIndex + 1]),
                            message: "Single member enum should not have trailing comma",
                            node: member,
                        });
                    }

                    return;
                }

                // For multiple members, first member should be on new line after opening brace
                if (openBraceToken && firstMember.loc.start.line === openBraceToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + memberIndent,
                        ),
                        message: "First enum member must be on a new line when there are multiple members",
                        node: firstMember,
                    });
                }

                // Convert camelCase/PascalCase to UPPER_SNAKE_CASE
                const toUpperSnakeCaseHandler = (name) => {
                    // Insert underscore before each uppercase letter (except the first)
                    // Then convert to uppercase
                    return name
                        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
                        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
                        .toUpperCase();
                };

                members.forEach((member, index) => {
                    // Check member name is UPPER_CASE
                    if (member.id && member.id.type === "Identifier") {
                        const memberName = member.id.name;

                        if (!upperCaseRegex.test(memberName)) {
                            const fixedName = toUpperSnakeCaseHandler(memberName);

                            context.report({
                                fix: (fixer) => fixer.replaceText(member.id, fixedName),
                                message: `Enum member "${memberName}" must be UPPER_CASE (e.g., ${fixedName})`,
                                node: member.id,
                            });
                        }
                    }

                    // Check member ends with comma, not semicolon
                    // Skip last member when multiple members - handled by combined check below
                    const isLastMember = index === members.length - 1;

                    if (!isLastMember || members.length === 1) {
                        const memberText = sourceCode.getText(member);

                        if (memberText.trimEnd().endsWith(";")) {
                            context.report({
                                fix(fixer) {
                                    const lastChar = memberText.lastIndexOf(";");
                                    const absolutePos = member.range[0] + lastChar;

                                    return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                                },
                                message: "Enum members must end with comma (,) not semicolon (;)",
                                node: member,
                            });
                        }
                    }

                    // Check formatting for multiple members
                    if (members.length > 1 && index > 0) {
                        const prevMember = members[index - 1];

                        // Check each is on its own line - with auto-fix
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
                                        "\n" + memberIndent,
                                    );
                                },
                                message: "Each enum member must be on its own line when there are multiple members",
                                node: member,
                            });
                        }

                        // Check for empty lines between members
                        if (member.loc.start.line - prevMember.loc.end.line > 1) {
                            context.report({
                                fix(fixer) {
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
                                message: "No empty lines allowed between enum members",
                                node: member,
                            });
                        }
                    }
                });

                // Check closing brace position and trailing comma/semicolon (for multiple members)
                if (members.length > 1) {
                    const lastMemberText = sourceCode.getText(lastMember);
                    const trimmedText = lastMemberText.trimEnd();
                    // Check both: text ends with comma OR there's a comma token after the member
                    const tokenAfterLast = sourceCode.getTokenAfter(lastMember);
                    const hasTrailingComma = trimmedText.endsWith(",") || (tokenAfterLast && tokenAfterLast.value === ",");
                    const hasTrailingSemicolon = trimmedText.endsWith(";");
                    const braceOnSameLine = closeBraceToken && closeBraceToken.loc.start.line === lastMember.loc.end.line;

                    // Handle semicolon on last member (needs replacement with comma)
                    if (hasTrailingSemicolon) {
                        const lastSemicolon = lastMemberText.lastIndexOf(";");
                        const absolutePos = lastMember.range[0] + lastSemicolon;

                        if (braceOnSameLine) {
                            // Both semicolon and brace issues - fix together
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [absolutePos, closeBraceToken.range[0]],
                                    ",\n" + baseIndent,
                                ),
                                message: "Last enum member must end with comma and closing brace must be on its own line",
                                node: lastMember,
                            });
                        } else {
                            // Just semicolon issue
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([absolutePos, absolutePos + 1], ","),
                                message: "Enum members must end with comma (,) not semicolon (;)",
                                node: lastMember,
                            });
                        }
                    } else if (!hasTrailingComma && braceOnSameLine) {
                        // Both missing comma and brace issues - fix together
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                ",\n" + baseIndent,
                            ),
                            message: "Last enum member must have trailing comma and closing brace must be on its own line",
                            node: lastMember,
                        });
                    } else if (!hasTrailingComma) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                            message: "Last enum member must have trailing comma",
                            node: lastMember,
                        });
                    } else if (braceOnSameLine) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing brace must be on its own line",
                            node: closeBraceToken,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce enum naming (PascalCase + Enum suffix), UPPER_CASE members, proper formatting, and trailing commas" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

const interfaceFormat = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        // Convert PascalCase/SCREAMING_SNAKE_CASE/snake_case to camelCase
        const toCamelCaseHandler = (name) => {
            // Handle SCREAMING_SNAKE_CASE (e.g., USER_NAME -> userName)
            if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle snake_case (e.g., user_name -> userName)
            if (/_/.test(name)) {
                return name.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
            }

            // Handle PascalCase (e.g., UserName -> userName)
            if (/^[A-Z]/.test(name)) {
                return name[0].toLowerCase() + name.slice(1);
            }

            return name;
        };

        return {
            TSInterfaceDeclaration(node) {
                const interfaceName = node.id.name;

                // Check interface name is PascalCase and ends with Interface
                if (!pascalCaseRegex.test(interfaceName)) {
                    context.report({
                        message: `Interface name "${interfaceName}" must be PascalCase`,
                        node: node.id,
                    });
                } else if (!interfaceName.endsWith("Interface")) {
                    context.report({
                        fix(fixer) {
                            return fixer.replaceText(node.id, `${interfaceName}Interface`);
                        },
                        message: `Interface name "${interfaceName}" must end with "Interface" suffix. Use "${interfaceName}Interface" instead of "${interfaceName}"`,
                        node: node.id,
                    });
                } else {
                    // Check verb-first ordering in interface names
                    const nameWithoutSuffix = interfaceName.slice(0, -"Interface".length);
                    const words = nameWithoutSuffix.match(/[A-Z][a-z0-9]*/g);

                    if (words && words.length >= 2) {
                        const commonVerbs = new Set([
                            "Accept", "Activate", "Add", "Approve", "Assign",
                            "Cancel", "Change", "Clear", "Close", "Confirm", "Connect", "Create",
                            "Deactivate", "Delete", "Deny", "Disable", "Disconnect", "Download",
                            "Edit", "Enable", "Execute", "Export",
                            "Fetch", "Filter", "Find",
                            "Generate", "Get",
                            "Handle", "Hide",
                            "Import", "Insert", "Invite",
                            "Load", "Login", "Logout",
                            "Merge", "Mount", "Move",
                            "Open",
                            "Patch", "Pause", "Post", "Process", "Publish", "Push", "Put",
                            "Receive", "Register", "Reject", "Remove", "Rename", "Replace", "Reset", "Resolve", "Resume", "Revoke",
                            "Save", "Search", "Select", "Send", "Set", "Show", "Sign", "Sort", "Start", "Stop", "Submit", "Subscribe", "Suspend", "Sync",
                            "Toggle", "Transform", "Trigger",
                            "Unassign", "Undo", "Unmount", "Unsubscribe", "Update", "Upload", "Upsert", "Use",
                            "Validate", "Verify",
                        ]);

                        const verbIndex = words.findIndex((w) => commonVerbs.has(w));

                        if (verbIndex > 0) {
                            const verb = words[verbIndex];
                            const otherWords = words.filter((_, i) => i !== verbIndex);
                            const fixedName = verb + otherWords.join("") + "Interface";

                            context.report({
                                fix(fixer) {
                                    return fixer.replaceText(node.id, fixedName);
                                },
                                message: `Interface name "${interfaceName}" should start with the verb "${verb}". Use "${fixedName}" instead.`,
                                node: node.id,
                            });
                        }
                    }
                }

                // Get opening brace
                const openBraceToken = sourceCode.getFirstToken(node.body);

                // Check opening brace is on same line as interface name
                if (openBraceToken && openBraceToken.loc.start.line !== node.id.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [node.id.range[1], openBraceToken.range[0]],
                            " ",
                        ),
                        message: "Opening brace must be on the same line as interface name",
                        node: openBraceToken,
                    });
                }

                // Check properties
                const members = node.body.body;

                if (members.length === 0) return;

                // Get indentation
                const interfaceLine = sourceCode.lines[node.loc.start.line - 1];
                const baseIndent = interfaceLine.match(/^\s*/)[0];
                const propIndent = baseIndent + "    ";

                // Get closing brace
                const closeBraceToken = sourceCode.getLastToken(node.body);

                // Check for empty line after opening brace
                const firstMember = members[0];

                if (firstMember.loc.start.line - openBraceToken.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + propIndent,
                        ),
                        message: "No empty line after opening brace in interface",
                        node: firstMember,
                    });
                }

                // Check for empty line before closing brace
                const lastMember = members[members.length - 1];

                if (closeBraceToken.loc.start.line - lastMember.loc.end.line > 1) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [lastMember.range[1], closeBraceToken.range[0]],
                            "\n" + baseIndent,
                        ),
                        message: "No empty line before closing brace in interface",
                        node: lastMember,
                    });
                }

                // For single member, should be on one line without trailing punctuation
                // But skip if the property has a nested object type with 2+ members
                // Or if the property has a multi-line function type (let type-annotation-spacing handle it first)
                if (members.length === 1) {
                    const member = members[0];
                    const isMultiLine = openBraceToken.loc.end.line !== closeBraceToken.loc.start.line;

                    // Check if property has nested object type
                    const nestedType = member.typeAnnotation?.typeAnnotation;
                    const hasNestedType = nestedType?.type === "TSTypeLiteral";
                    const hasMultiMemberNestedType = hasNestedType && nestedType.members?.length >= 2;
                    const hasSingleMemberNestedType = hasNestedType && nestedType.members?.length === 1;

                    // Check if property has function type that spans multiple lines
                    const hasMultiLineFunctionType = nestedType?.type === "TSFunctionType" &&
                        nestedType.loc.start.line !== nestedType.loc.end.line;

                    if (isMultiLine && !hasMultiMemberNestedType && !hasMultiLineFunctionType) {
                        // Build the collapsed text, handling nested types specially
                        let cleanText;

                        if (hasSingleMemberNestedType) {
                            // Collapse nested type first, then build the member text
                            const nestedMember = nestedType.members[0];
                            let nestedMemberText = sourceCode.getText(nestedMember).trim();

                            if (nestedMemberText.endsWith(",") || nestedMemberText.endsWith(";")) {
                                nestedMemberText = nestedMemberText.slice(0, -1);
                            }

                            // Build: propName: { nestedProp: type }
                            const propName = member.key.name;
                            const optionalMark = member.optional ? "?" : "";

                            cleanText = `${propName}${optionalMark}: { ${nestedMemberText} }`;
                        } else {
                            cleanText = sourceCode.getText(member).trim();

                            if (cleanText.endsWith(",") || cleanText.endsWith(";")) {
                                cleanText = cleanText.slice(0, -1);
                            }
                        }

                        const newInterfaceText = `{ ${cleanText} }`;

                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [openBraceToken.range[0], closeBraceToken.range[1]],
                                newInterfaceText,
                            ),
                            message: "Single property interface should be on one line without trailing punctuation",
                            node,
                        });

                        return;
                    }

                    // Check for trailing comma/semicolon in single-line single member
                    const memberText = sourceCode.getText(member);

                    if (memberText.trimEnd().endsWith(",") || memberText.trimEnd().endsWith(";")) {
                        const punctIndex = Math.max(memberText.lastIndexOf(","), memberText.lastIndexOf(";"));

                        context.report({
                            fix: (fixer) => fixer.removeRange([member.range[0] + punctIndex, member.range[0] + punctIndex + 1]),
                            message: "Single property interface should not have trailing punctuation",
                            node: member,
                        });
                    }

                    return;
                }

                // For multiple members, first member should be on new line after opening brace
                if (firstMember.loc.start.line === openBraceToken.loc.end.line) {
                    context.report({
                        fix: (fixer) => fixer.replaceTextRange(
                            [openBraceToken.range[1], firstMember.range[0]],
                            "\n" + propIndent,
                        ),
                        message: "First interface property must be on a new line when there are multiple properties",
                        node: firstMember,
                    });
                }

                members.forEach((member, index) => {
                    // Check property name is camelCase
                    if (member.type === "TSPropertySignature" && member.key && member.key.type === "Identifier") {
                        const propName = member.key.name;

                        if (!camelCaseRegex.test(propName)) {
                            const fixedName = toCamelCaseHandler(propName);

                            context.report({
                                fix: (fixer) => fixer.replaceText(member.key, fixedName),
                                message: `Interface property "${propName}" must be camelCase. Use "${fixedName}" instead.`,
                                node: member.key,
                            });
                        }
                    }

                    // Collapse single-member nested object types to one line
                    if (member.type === "TSPropertySignature" && member.typeAnnotation?.typeAnnotation?.type === "TSTypeLiteral") {
                        const nestedType = member.typeAnnotation.typeAnnotation;

                        if (nestedType.members && nestedType.members.length === 1) {
                            const nestedOpenBrace = sourceCode.getFirstToken(nestedType);
                            const nestedCloseBrace = sourceCode.getLastToken(nestedType);
                            const isNestedMultiLine = nestedOpenBrace.loc.end.line !== nestedCloseBrace.loc.start.line;

                            if (isNestedMultiLine) {
                                const nestedMember = nestedType.members[0];
                                let nestedMemberText = sourceCode.getText(nestedMember).trim();

                                // Remove trailing punctuation
                                if (nestedMemberText.endsWith(",") || nestedMemberText.endsWith(";")) {
                                    nestedMemberText = nestedMemberText.slice(0, -1);
                                }

                                context.report({
                                    fix: (fixer) => fixer.replaceTextRange(
                                        [nestedOpenBrace.range[0], nestedCloseBrace.range[1]],
                                        `{ ${nestedMemberText} }`,
                                    ),
                                    message: "Single property nested object type should be on one line",
                                    node: nestedType,
                                });
                            }
                        }
                    }

                    // Check for space before ? in optional properties
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
                    // Skip last member when multiple members - handled by combined check below
                    const isLastMember = index === members.length - 1;

                    if (!isLastMember || members.length === 1) {
                        const memberText = sourceCode.getText(member);

                        if (memberText.trimEnd().endsWith(";")) {
                            context.report({
                                fix(fixer) {
                                    const lastChar = memberText.lastIndexOf(";");
                                    const absolutePos = member.range[0] + lastChar;

                                    return fixer.replaceTextRange([absolutePos, absolutePos + 1], ",");
                                },
                                message: "Interface properties must end with comma (,) not semicolon (;)",
                                node: member,
                            });
                        }
                    }

                    // Check formatting for multiple members
                    if (members.length > 1 && index > 0) {
                        const prevMember = members[index - 1];

                        // Check each is on its own line - with auto-fix
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
                                message: "Each interface property must be on its own line when there are multiple properties",
                                node: member,
                            });
                        }

                        // Check for empty lines between properties
                        if (member.loc.start.line - prevMember.loc.end.line > 1) {
                            context.report({
                                fix(fixer) {
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
                                message: "No empty lines allowed between interface properties",
                                node: member,
                            });
                        }
                    }
                });

                // Check closing brace position and trailing comma/semicolon (for multiple members)
                if (members.length > 1) {
                    const lastMemberText = sourceCode.getText(lastMember);
                    const trimmedText = lastMemberText.trimEnd();
                    // Check both: text ends with comma OR there's a comma token after the member
                    const tokenAfterLast = sourceCode.getTokenAfter(lastMember);
                    const hasTrailingComma = trimmedText.endsWith(",") || (tokenAfterLast && tokenAfterLast.value === ",");
                    const hasTrailingSemicolon = trimmedText.endsWith(";");
                    const braceOnSameLine = closeBraceToken.loc.start.line === lastMember.loc.end.line;

                    // Handle semicolon on last member (needs replacement with comma)
                    if (hasTrailingSemicolon) {
                        const lastSemicolon = lastMemberText.lastIndexOf(";");
                        const absolutePos = lastMember.range[0] + lastSemicolon;

                        if (braceOnSameLine) {
                            // Both semicolon and brace issues - fix together
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange(
                                    [absolutePos, closeBraceToken.range[0]],
                                    ",\n" + baseIndent,
                                ),
                                message: "Last interface property must end with comma and closing brace must be on its own line",
                                node: lastMember,
                            });
                        } else {
                            // Just semicolon issue
                            context.report({
                                fix: (fixer) => fixer.replaceTextRange([absolutePos, absolutePos + 1], ","),
                                message: "Interface properties must end with comma (,) not semicolon (;)",
                                node: lastMember,
                            });
                        }
                    } else if (!hasTrailingComma && braceOnSameLine) {
                        // Both missing comma and brace issues - fix together
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                ",\n" + baseIndent,
                            ),
                            message: "Last interface property must have trailing comma and closing brace must be on its own line",
                            node: lastMember,
                        });
                    } else if (!hasTrailingComma) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(lastMember, ","),
                            message: "Last interface property must have trailing comma",
                            node: lastMember,
                        });
                    } else if (braceOnSameLine) {
                        context.report({
                            fix: (fixer) => fixer.replaceTextRange(
                                [lastMember.range[1], closeBraceToken.range[0]],
                                "\n" + baseIndent,
                            ),
                            message: "Closing brace must be on its own line",
                            node: closeBraceToken,
                        });
                    }
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce interface naming (PascalCase + Interface suffix), camelCase properties, proper formatting, and trailing commas" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

const typescriptDefinitionLocation = {
    create(context) {
        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        const isInFolderHandler = (folderName) => {
            const pattern = new RegExp(`/${folderName}/[^/]+\\.(ts|tsx)$`);

            return pattern.test(normalizedFilename);
        };

        const isTypeScriptFileHandler = () => /\.(ts|tsx)$/.test(normalizedFilename);

        return {
            TSInterfaceDeclaration(node) {
                if (!isTypeScriptFileHandler()) return;

                if (!isInFolderHandler("interfaces")) {
                    context.report({
                        message: "Interfaces must be declared in files inside the \"interfaces\" folder",
                        node: node.id || node,
                    });
                }
            },
            TSEnumDeclaration(node) {
                if (!isTypeScriptFileHandler()) return;

                if (!isInFolderHandler("enums")) {
                    context.report({
                        message: "Enums must be declared in files inside the \"enums\" folder",
                        node: node.id || node,
                    });
                }
            },
            TSTypeAliasDeclaration(node) {
                if (!isTypeScriptFileHandler()) return;

                if (!isInFolderHandler("types")) {
                    context.report({
                        message: "Type aliases must be declared in files inside the \"types\" folder",
                        node: node.id || node,
                    });
                }
            },
        };
    },
    meta: {
        docs: { description: "Enforce that interfaces are in interfaces folder, enums in enums folder, and types in types folder" },
        schema: [],
        type: "suggestion",
    },
};

export {
    enumTypeEnforcement,
    propNamingConvention,
    noInlineTypeDefinitions,
    typeFormat,
    typeAnnotationSpacing,
    enumFormat,
    interfaceFormat,
    typescriptDefinitionLocation,
};
