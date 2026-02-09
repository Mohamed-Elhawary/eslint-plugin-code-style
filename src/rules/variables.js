/**
 * ───────────────────────────────────────────────────────────────
 * Rule: Variable Naming Convention
 * ───────────────────────────────────────────────────────────────
 *
 * Description:
 *   Variable names should follow naming conventions: camelCase
 *   for regular variables and PascalCase for React components.
 *   Auto-fixes SCREAMING_SNAKE_CASE and snake_case to camelCase.
 *
 * ✓ Good:
 *   const userName = "John";
 *   const maxRetries = 3;
 *   const codeLength = 8;
 *   const UserProfile = () => <div />;
 *   const useCustomHook = () => {};
 *
 * ✗ Bad (auto-fixed):
 *   const user_name = "John";     // → userName
 *   const CODE_LENGTH = 8;        // → codeLength
 *   const MAX_RETRIES = 3;        // → maxRetries
 */
const variableNamingConvention = {
    create(context) {
        const sourceCode = context.sourceCode || context.getSourceCode();

        const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

        const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

        const hookRegex = /^use[A-Z][a-zA-Z0-9]*$/;

        const constantRegex = /^[A-Z][A-Z0-9_]*$/;

        // Convert any naming convention to camelCase
        const toCamelCaseHandler = (name) => {
            // Handle SCREAMING_SNAKE_CASE (e.g., CODE_LENGTH -> codeLength)
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

        // Get all references to a variable in the current scope
        const getVariableReferencesHandler = (node) => {
            const scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();
            const variable = scope.variables.find((v) => v.name === node.name);

            if (!variable) return [];

            return variable.references.map((ref) => ref.identifier);
        };

        const allowedIdentifiers = [
            "ArrowFunctionExpression", "CallExpression", "FunctionDeclaration", "FunctionExpression",
            "Property", "VariableDeclarator", "JSXElement", "JSXOpeningElement", "ReturnStatement",
            "SwitchCase", "SwitchStatement", "ObjectExpression", "ObjectPattern", "BlockStatement",
            "IfStatement", "Identifier", "RestElement", "AssignmentPattern", "ArrayPattern",
            "MemberExpression", "JSXText", "JSXAttribute", "JSXExpressionContainer",
            // Built-in JavaScript globals
            "Function", "Object", "Array", "String", "Number", "Boolean", "Symbol", "BigInt",
            "Date", "RegExp", "Error", "Map", "Set", "WeakMap", "WeakSet", "Promise",
        ];

        // Check if this is a MUI styled component: styled(Component)(...)
        const isStyledComponentHandler = (init) => {
            if (!init || init.type !== "CallExpression") return false;

            const { callee } = init;

            // Pattern: styled(Component)(...) - callee is CallExpression styled(Component)
            if (callee.type === "CallExpression") {
                const innerCallee = callee.callee;

                // Check if inner callee is "styled" identifier
                if (innerCallee.type === "Identifier" && innerCallee.name === "styled") {
                    return true;
                }

                // Check if inner callee is member expression like emotion's styled.div
                if (innerCallee.type === "MemberExpression" && innerCallee.object.name === "styled") {
                    return true;
                }
            }

            return false;
        };

        // Check if this CallExpression is a styled() call
        const isStyledCallHandler = (node) => {
            if (node.type !== "CallExpression") return false;

            const { callee } = node;

            // Direct styled(Component) call
            if (callee.type === "Identifier" && callee.name === "styled") {
                return true;
            }

            return false;
        };

        const isFunctionTypeHandler = (init) => {
            if (!init) return false;

            if (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") {
                return true;
            }

            if (init.type === "CallExpression" && init.callee) {
                const calleeName = init.callee.name || (init.callee.property && init.callee.property.name);
                const wrapperFunctions = ["memo", "forwardRef", "lazy", "createContext"];

                return wrapperFunctions.includes(calleeName);
            }

            return false;
        };

        const isComponentByNamingHandler = (node) => {
            if (!node.init) return false;

            const name = node.id.name;

            // PascalCase naming indicates a component
            if (/^[A-Z]/.test(name) && isFunctionTypeHandler(node.init)) {
                return true;
            }

            return false;
        };

        const isHookFunctionHandler = (node) => {
            if (!node.init) return false;

            const name = node.id.name;

            return name.startsWith("use") && /^use[A-Z]/.test(name) && isFunctionTypeHandler(node.init);
        };

        // Common component property names that should allow PascalCase
        const componentPropertyNames = [
            "Icon",
            "Component",
            "FormComponent",
            "Layout",
            "Wrapper",
            "Container",
            "Provider",
        ];

        const checkPatternHandler = (node, typeLabel) => {
            if (node.type === "Identifier") {
                const name = node.name;

                if (name.startsWith("_") || constantRegex.test(name) || allowedIdentifiers.includes(name)) return;

                // Allow component property names when destructuring (e.g., { Icon } from map callback)
                if (componentPropertyNames.includes(name)) return;

                if (!camelCaseRegex.test(name)) {
                    context.report({
                        message: `${typeLabel} "${name}" should be camelCase`,
                        node,
                    });
                }
            } else if (node.type === "ObjectPattern") {
                node.properties.forEach((prop) => {
                    if (prop.type === "Property") {
                        checkPatternHandler(
                            prop.value,
                            typeLabel,
                        );
                    }
                    else if (prop.type === "RestElement") {
                        checkPatternHandler(
                            prop.argument,
                            typeLabel,
                        );
                    }
                });
            } else if (node.type === "ArrayPattern") {
                node.elements.forEach((elem) => {
                    if (elem) {
                        checkPatternHandler(
                            elem,
                            typeLabel,
                        );
                    }
                });
            } else if (node.type === "AssignmentPattern") {
                checkPatternHandler(
                    node.left,
                    typeLabel,
                );
            }
            else if (node.type === "RestElement") {
                checkPatternHandler(
                    node.argument,
                    typeLabel,
                );
            }
        };

        const checkVariableDeclaratorHandler = (node) => {
            if (node.id.type !== "Identifier") {
                checkPatternHandler(
                    node.id,
                    "Variable",
                );

                return;
            }

            const name = node.id.name;

            // Enforce PascalCase for styled components: const StyledCard = styled(Card)(...)
            if (isStyledComponentHandler(node.init)) {
                if (!pascalCaseRegex.test(name)) {
                    context.report({
                        message: `Styled component "${name}" should be PascalCase (e.g., StyledCard instead of styledCard)`,
                        node: node.id,
                    });
                }

                return;
            }

            if (name.startsWith("_") || isComponentByNamingHandler(node)) return;

            // Allow PascalCase for variables that reference components by naming convention
            // e.g., const IconComponent = icons[variant], const ActiveIcon = getIcon()
            const componentSuffixes = ["Component", "Icon", "Layout", "Wrapper", "Container", "Provider", "View", "Screen", "Page"];

            if (pascalCaseRegex.test(name) && componentSuffixes.some((suffix) => name.endsWith(suffix))) return;

            if (isHookFunctionHandler(node)) {
                if (!hookRegex.test(name)) {
                    context.report({
                        message: `Hook "${name}" should start with "use" followed by PascalCase (e.g., useEventsList)`,
                        node: node.id,
                    });
                }

                return;
            }

            // Allow PascalCase for data arrays and config objects (e.g., SidebarData, Routes)
            // These typically hold configuration or data that includes component references
            const dataPatterns = [
                /^[A-Z][a-zA-Z]*Data$/,
                /^[A-Z][a-zA-Z]*Config$/,
                /^Routes$/,
            ];

            if (dataPatterns.some((pattern) => pattern.test(name))) {
                // Only allow if initialized with array, object, or function call
                if (node.init && (node.init.type === "ArrayExpression" || node.init.type === "ObjectExpression" || node.init.type === "CallExpression")) {
                    return;
                }
            }

            if (!camelCaseRegex.test(name)) {
                const camelCaseName = toCamelCaseHandler(name);
                const references = getVariableReferencesHandler(node.id);

                context.report({
                    fix: (fixer) => {
                        const fixes = [];

                        // Fix all references to this variable
                        references.forEach((ref) => {
                            fixes.push(fixer.replaceText(ref, camelCaseName));
                        });

                        return fixes;
                    },
                    message: `Variable "${name}" should be camelCase (e.g., ${camelCaseName} instead of ${name})`,
                    node: node.id,
                });
            }
        };

        const checkPropertyHandler = (node) => {
            if (node.computed || node.key.type !== "Identifier") return;

            const name = node.key.name;

            if (name.startsWith("_") || allowedIdentifiers.includes(name)) return;

            // Allow PascalCase for properties that hold component references
            // e.g., Icon: AdminPanelSettingsIcon, FormComponent: UpdateEventForm
            if (node.value && node.value.type === "Identifier") {
                const valueName = node.value.name;

                // If value is PascalCase (component reference), allow PascalCase property name
                if (pascalCaseRegex.test(valueName) && pascalCaseRegex.test(name)) {
                    return;
                }
            }

            // Allow common component property names
            if (componentPropertyNames.includes(name)) return;

            // Allow MUI theme component names (start with Mui)
            if (name.startsWith("Mui")) return;

            if (!camelCaseRegex.test(name)) {
                const camelCaseName = toCamelCaseHandler(name);

                context.report({
                    fix: (fixer) => fixer.replaceText(node.key, camelCaseName),
                    message: `Property "${name}" should be camelCase (e.g., ${camelCaseName} instead of ${name})`,
                    node: node.key,
                });
            }
        };

        const checkFunctionHandlerParamsHandler = (node) => {
            node.params.forEach((param) => checkPatternHandler(
                param,
                "Parameter",
            ));
        };

        const checkCallExpressionHandlerArguments = (node) => {
            // Skip argument checking for styled() calls - they accept PascalCase components
            if (isStyledCallHandler(node)) return;

            node.arguments.forEach((arg) => {
                if (arg.type === "Identifier") {
                    const name = arg.name;

                    if (name.startsWith("_") || constantRegex.test(name) || allowedIdentifiers.includes(name)) return;

                    // Allow component property names as arguments (e.g., Icon, Component)
                    if (componentPropertyNames.includes(name)) return;

                    // Skip PascalCase that doesn't look like a misnamed function
                    // (function-naming-convention handles verb-prefixed PascalCase)
                    if (pascalCaseRegex.test(name)) return;

                    if (!camelCaseRegex.test(name)) {
                        const camelCaseName = toCamelCaseHandler(name);

                        context.report({
                            fix(fixer) {
                                const scope = sourceCode.getScope ? sourceCode.getScope(arg) : context.getScope();
                                const variable = scope.variables.find((v) => v.name === name)
                                    || (scope.upper && scope.upper.variables.find((v) => v.name === name));

                                if (!variable) return fixer.replaceText(arg, camelCaseName);

                                const fixes = [];
                                const fixedRanges = new Set();

                                variable.references.forEach((ref) => {
                                    const rangeKey = `${ref.identifier.range[0]}-${ref.identifier.range[1]}`;

                                    if (!fixedRanges.has(rangeKey)) {
                                        fixedRanges.add(rangeKey);
                                        fixes.push(fixer.replaceText(ref.identifier, camelCaseName));
                                    }
                                });

                                return fixes;
                            },
                            message: `Argument "${name}" should be camelCase (e.g., ${camelCaseName} instead of ${name})`,
                            node: arg,
                        });
                    }
                }
            });
        };

        return {
            ArrowFunctionExpression: checkFunctionHandlerParamsHandler,
            CallExpression: checkCallExpressionHandlerArguments,
            FunctionDeclaration: checkFunctionHandlerParamsHandler,
            FunctionExpression: checkFunctionHandlerParamsHandler,
            Property: checkPropertyHandler,
            VariableDeclarator: checkVariableDeclaratorHandler,
        };
    },
    meta: {
        docs: { description: "Enforce naming conventions: camelCase for variables/properties/params/arguments, PascalCase for components, useXxx for hooks" },
        fixable: "code",
        schema: [],
        type: "suggestion",
    },
};

/*
 * typescript-definition-location
 *
 * Enforce that TypeScript definitions are declared in their designated folders:
 * - Interfaces must be in files inside the "interfaces" folder
 * - Enums must be in files inside the "enums" folder
 * - Types must be in files inside the "types" folder
 *
 * ✓ Good:
 *   // src/interfaces/user.ts
 *   export interface UserInterface { ... }
 *
 *   // src/enums/status.ts
 *   export enum StatusEnum { ... }
 *
 *   // src/types/config.ts
 *   export type ConfigType = { ... }
 *
 * ✗ Bad:
 *   // src/components/user.tsx
 *   export interface UserInterface { ... }  // Interface not in interfaces folder
 */
/*
 * interface-format
 *
 * Enforce consistent formatting for TypeScript interfaces:
 * - Interface name must be PascalCase and end with "Interface" suffix
 * - Properties must be in camelCase
 * - No empty lines between properties
 * - Each property must end with comma (,) not semicolon (;)
 *
 * ✓ Good:
 *   export interface UserInterface {
 *       firstName: string,
 *       lastName: string,
 *       age: number,
 *   }
 *
 * ✗ Bad:
 *   export interface User {           // Missing "Interface" suffix
 *       first_name: string;           // snake_case and semicolon
 *
 *       lastName: string;             // Empty line above and semicolon
 *   }
 */
/*
 * enum-format
 *
 * Enforce consistent formatting for TypeScript enums:
 * - Enum name must be PascalCase and end with "Enum" suffix
 * - Member names must be UPPER_CASE (e.g., DELETE, GET, POST)
 * - No empty lines between members
 * - Each member must end with comma (,) not semicolon (;)
 *
 * ✓ Good:
 *   export enum HttpMethodEnum {
 *       DELETE = "delete",
 *       GET = "get",
 *       POST = "post",
 *   }
 *
 * ✗ Bad:
 *   export enum HttpMethod {           // Missing "Enum" suffix
 *       delete = "delete";             // lowercase and semicolon
 *
 *       Get = "get";                   // PascalCase, empty line, semicolon
 *   }
 */

export { variableNamingConvention };
