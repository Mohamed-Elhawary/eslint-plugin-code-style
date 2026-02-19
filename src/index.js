import { arrayCallbackDestructure, arrayItemsPerLine, arrayObjectsOnNewLines } from "./rules/arrays.js";
import {
    arrowFunctionBlockBody,
    arrowFunctionSimpleJsx,
    arrowFunctionSimplify,
    curriedArrowSameLine,
} from "./rules/arrow-functions.js";
import {
    functionArgumentsFormat,
    nestedCallClosingBrackets,
    noEmptyLinesInFunctionCalls,
    openingBracketsSameLine,
    simpleCallSingleLine,
    singleArgumentOnOneLine,
} from "./rules/call-expressions.js";
import { classMethodDefinitionFormat, classNamingConvention } from "./rules/classes.js";
import { commentFormat } from "./rules/comments.js";
import {
    componentPropsDestructure,
    componentPropsInlineType,
    folderBasedNamingConvention,
    folderStructureConsistency,
    noRedundantFolderSuffix,
    svgIconNamingConvention,
} from "./rules/components.js";
import {
    blockStatementNewlines,
    emptyLineAfterBlock,
    ifElseSpacing,
    ifStatementFormat,
    logicalExpressionMultiline,
    multilineIfConditions,
    noEmptyLinesInSwitchCases,
    ternaryConditionMultiline,
} from "./rules/control-flow.js";
import {
    functionCallSpacing,
    functionDeclarationStyle,
    functionNamingConvention,
    functionObjectDestructure,
    functionParamsPerLine,
    noEmptyLinesInFunctionParams,
} from "./rules/functions.js";
import { hookCallbackFormat, hookDepsPerLine, hookFileNamingConvention, useStateNamingConvention } from "./rules/hooks.js";
import {
    absoluteImportsOnly,
    exportFormat,
    importFormat,
    importSourceSpacing,
    indexExportStyle,
    indexExportsOnly,
    inlineExportDeclaration,
    moduleIndexExports,
} from "./rules/imports-exports.js";
import {
    classNameDynamicAtEnd,
    classNameMultiline,
    classNameNoExtraSpaces,
    classNameOrder,
    jsxChildrenOnNewLine,
    jsxClosingBracketSpacing,
    jsxElementChildNewLine,
    jsxLogicalExpressionSimplify,
    jsxParenthesesPosition,
    jsxPropNamingConvention,
    jsxSimpleElementOneLine,
    jsxStringValueTrim,
    jsxTernaryFormat,
    noEmptyLinesInJsx,
} from "./rules/jsx.js";
import {
    noEmptyLinesInObjects,
    objectPropertyPerLine,
    objectPropertyValueBrace,
    objectPropertyValueFormat,
    stringPropertySpacing,
} from "./rules/objects.js";
import { reactCodeOrder } from "./rules/react.js";
import { assignmentValueSameLine, memberExpressionBracketSpacing } from "./rules/spacing.js";
import { noHardcodedStrings } from "./rules/strings.js";
import {
    enumFormat,
    enumTypeEnforcement,
    interfaceFormat,
    noInlineTypeDefinitions,
    propNamingConvention,
    typeAnnotationSpacing,
    typeFormat,
    typescriptDefinitionLocation,
} from "./rules/typescript.js";
import { variableNamingConvention } from "./rules/variables.js";

export default {
    meta: {
        name: "eslint-plugin-code-style",
        version: __VERSION__,
    },
    rules: {
        // Array rules
        "array-callback-destructure": arrayCallbackDestructure,
        "array-items-per-line": arrayItemsPerLine,
        "array-objects-on-new-lines": arrayObjectsOnNewLines,

        // Arrow function rules
        "arrow-function-block-body": arrowFunctionBlockBody,
        "arrow-function-simple-jsx": arrowFunctionSimpleJsx,
        "arrow-function-simplify": arrowFunctionSimplify,
        "curried-arrow-same-line": curriedArrowSameLine,

        // Call expression rules
        "function-arguments-format": functionArgumentsFormat,
        "nested-call-closing-brackets": nestedCallClosingBrackets,
        "no-empty-lines-in-function-calls": noEmptyLinesInFunctionCalls,
        "opening-brackets-same-line": openingBracketsSameLine,
        "simple-call-single-line": simpleCallSingleLine,
        "single-argument-on-one-line": singleArgumentOnOneLine,

        // Comment rules
        "comment-format": commentFormat,

        // Component rules
        "component-props-destructure": componentPropsDestructure,
        "component-props-inline-type": componentPropsInlineType,
        "folder-based-naming-convention": folderBasedNamingConvention,
        "folder-structure-consistency": folderStructureConsistency,
        "no-redundant-folder-suffix": noRedundantFolderSuffix,
        "svg-icon-naming-convention": svgIconNamingConvention,

        // React rules
        "react-code-order": reactCodeOrder,

        // Control flow rules
        "block-statement-newlines": blockStatementNewlines,
        "empty-line-after-block": emptyLineAfterBlock,
        "if-else-spacing": ifElseSpacing,
        "if-statement-format": ifStatementFormat,
        "logical-expression-multiline": logicalExpressionMultiline,
        "multiline-if-conditions": multilineIfConditions,
        "no-empty-lines-in-switch-cases": noEmptyLinesInSwitchCases,
        "ternary-condition-multiline": ternaryConditionMultiline,

        // Class rules
        "class-method-definition-format": classMethodDefinitionFormat,
        "class-naming-convention": classNamingConvention,

        // Function rules
        "function-call-spacing": functionCallSpacing,
        "function-declaration-style": functionDeclarationStyle,
        "function-naming-convention": functionNamingConvention,
        "function-object-destructure": functionObjectDestructure,
        "function-params-per-line": functionParamsPerLine,
        "no-empty-lines-in-function-params": noEmptyLinesInFunctionParams,

        // Hook rules
        "hook-callback-format": hookCallbackFormat,
        "hook-deps-per-line": hookDepsPerLine,
        "hook-file-naming-convention": hookFileNamingConvention,
        "use-state-naming-convention": useStateNamingConvention,

        // Import/Export rules
        "absolute-imports-only": absoluteImportsOnly,
        "export-format": exportFormat,
        "import-format": importFormat,
        "import-source-spacing": importSourceSpacing,
        "index-export-style": indexExportStyle,
        "index-exports-only": indexExportsOnly,
        "inline-export-declaration": inlineExportDeclaration,
        "module-index-exports": moduleIndexExports,

        // JSX rules
        "classname-dynamic-at-end": classNameDynamicAtEnd,
        "classname-multiline": classNameMultiline,
        "classname-no-extra-spaces": classNameNoExtraSpaces,
        "classname-order": classNameOrder,
        "jsx-children-on-new-line": jsxChildrenOnNewLine,
        "jsx-closing-bracket-spacing": jsxClosingBracketSpacing,
        "jsx-element-child-new-line": jsxElementChildNewLine,
        "jsx-logical-expression-simplify": jsxLogicalExpressionSimplify,
        "jsx-parentheses-position": jsxParenthesesPosition,
        "jsx-prop-naming-convention": jsxPropNamingConvention,
        "jsx-simple-element-one-line": jsxSimpleElementOneLine,
        "jsx-string-value-trim": jsxStringValueTrim,
        "jsx-ternary-format": jsxTernaryFormat,
        "no-empty-lines-in-jsx": noEmptyLinesInJsx,

        // Object rules
        "no-empty-lines-in-objects": noEmptyLinesInObjects,
        "object-property-per-line": objectPropertyPerLine,
        "object-property-value-brace": objectPropertyValueBrace,
        "object-property-value-format": objectPropertyValueFormat,
        "string-property-spacing": stringPropertySpacing,

        // Spacing rules
        "assignment-value-same-line": assignmentValueSameLine,
        "member-expression-bracket-spacing": memberExpressionBracketSpacing,

        // TypeScript rules
        "enum-format": enumFormat,
        "enum-type-enforcement": enumTypeEnforcement,
        "interface-format": interfaceFormat,
        "no-inline-type-definitions": noInlineTypeDefinitions,
        "prop-naming-convention": propNamingConvention,
        "type-annotation-spacing": typeAnnotationSpacing,
        "type-format": typeFormat,
        "typescript-definition-location": typescriptDefinitionLocation,

        // String rules
        "no-hardcoded-strings": noHardcodedStrings,

        // Variable rules
        "variable-naming-convention": variableNamingConvention,
    },
};
