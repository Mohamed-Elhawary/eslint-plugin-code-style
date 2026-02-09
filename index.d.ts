import type { Linter, Rule } from "eslint";

/**
 * All available rule names in eslint-plugin-code-style
 */
export type RuleNames =
    | "code-style/absolute-imports-only"
    | "code-style/array-callback-destructure"
    | "code-style/array-items-per-line"
    | "code-style/array-objects-on-new-lines"
    | "code-style/arrow-function-block-body"
    | "code-style/arrow-function-simple-jsx"
    | "code-style/arrow-function-simplify"
    | "code-style/assignment-value-same-line"
    | "code-style/block-statement-newlines"
    | "code-style/class-method-definition-format"
    | "code-style/class-naming-convention"
    | "code-style/comment-format"
    | "code-style/component-props-destructure"
    | "code-style/react-code-order"
    | "code-style/component-props-inline-type"
    | "code-style/svg-icon-naming-convention"
    | "code-style/curried-arrow-same-line"
    | "code-style/empty-line-after-block"
    | "code-style/enum-type-enforcement"
    | "code-style/export-format"
    | "code-style/folder-based-naming-convention"
    | "code-style/folder-structure-consistency"
    | "code-style/function-arguments-format"
    | "code-style/function-call-spacing"
    | "code-style/function-declaration-style"
    | "code-style/function-naming-convention"
    | "code-style/function-object-destructure"
    | "code-style/function-params-per-line"
    | "code-style/hook-callback-format"
    | "code-style/hook-deps-per-line"
    | "code-style/use-state-naming-convention"
    | "code-style/if-else-spacing"
    | "code-style/if-statement-format"
    | "code-style/import-format"
    | "code-style/import-source-spacing"
    | "code-style/index-export-style"
    | "code-style/index-exports-only"
    | "code-style/classname-dynamic-at-end"
    | "code-style/classname-multiline"
    | "code-style/classname-no-extra-spaces"
    | "code-style/classname-order"
    | "code-style/jsx-children-on-new-line"
    | "code-style/jsx-closing-bracket-spacing"
    | "code-style/jsx-element-child-new-line"
    | "code-style/jsx-logical-expression-simplify"
    | "code-style/jsx-parentheses-position"
    | "code-style/jsx-prop-naming-convention"
    | "code-style/jsx-simple-element-one-line"
    | "code-style/jsx-string-value-trim"
    | "code-style/jsx-ternary-format"
    | "code-style/logical-expression-multiline"
    | "code-style/member-expression-bracket-spacing"
    | "code-style/module-index-exports"
    | "code-style/multiline-if-conditions"
    | "code-style/nested-call-closing-brackets"
    | "code-style/no-inline-type-definitions"
    | "code-style/no-redundant-folder-suffix"
    | "code-style/no-empty-lines-in-function-calls"
    | "code-style/no-empty-lines-in-function-params"
    | "code-style/no-empty-lines-in-jsx"
    | "code-style/no-empty-lines-in-objects"
    | "code-style/no-empty-lines-in-switch-cases"
    | "code-style/no-hardcoded-strings"
    | "code-style/object-property-per-line"
    | "code-style/object-property-value-brace"
    | "code-style/object-property-value-format"
    | "code-style/opening-brackets-same-line"
    | "code-style/prop-naming-convention"
    | "code-style/simple-call-single-line"
    | "code-style/single-argument-on-one-line"
    | "code-style/string-property-spacing"
    | "code-style/ternary-condition-multiline"
    | "code-style/enum-format"
    | "code-style/interface-format"
    | "code-style/type-annotation-spacing"
    | "code-style/type-format"
    | "code-style/typescript-definition-location"
    | "code-style/variable-naming-convention";

/**
 * Rule severity levels
 */
export type RuleSeverity = "off" | "warn" | "error" | 0 | 1 | 2;

/**
 * Rule configuration: severity only or [severity, options]
 */
export type RuleConfig = RuleSeverity | [RuleSeverity, ...unknown[]];

/**
 * Rules configuration object for eslint-plugin-code-style
 */
export type CodeStyleRulesConfig = {
    [K in RuleNames]?: RuleConfig;
};

/**
 * Plugin rules object containing all rule modules
 */
interface PluginRules {
    "absolute-imports-only": Rule.RuleModule;
    "array-callback-destructure": Rule.RuleModule;
    "array-items-per-line": Rule.RuleModule;
    "array-objects-on-new-lines": Rule.RuleModule;
    "arrow-function-block-body": Rule.RuleModule;
    "arrow-function-simple-jsx": Rule.RuleModule;
    "arrow-function-simplify": Rule.RuleModule;
    "assignment-value-same-line": Rule.RuleModule;
    "block-statement-newlines": Rule.RuleModule;
    "class-method-definition-format": Rule.RuleModule;
    "class-naming-convention": Rule.RuleModule;
    "comment-format": Rule.RuleModule;
    "component-props-destructure": Rule.RuleModule;
    "react-code-order": Rule.RuleModule;
    "component-props-inline-type": Rule.RuleModule;
    "svg-icon-naming-convention": Rule.RuleModule;
    "curried-arrow-same-line": Rule.RuleModule;
    "empty-line-after-block": Rule.RuleModule;
    "enum-type-enforcement": Rule.RuleModule;
    "export-format": Rule.RuleModule;
    "folder-based-naming-convention": Rule.RuleModule;
    "folder-structure-consistency": Rule.RuleModule;
    "function-arguments-format": Rule.RuleModule;
    "function-call-spacing": Rule.RuleModule;
    "function-declaration-style": Rule.RuleModule;
    "function-naming-convention": Rule.RuleModule;
    "function-object-destructure": Rule.RuleModule;
    "function-params-per-line": Rule.RuleModule;
    "hook-callback-format": Rule.RuleModule;
    "hook-deps-per-line": Rule.RuleModule;
    "if-else-spacing": Rule.RuleModule;
    "if-statement-format": Rule.RuleModule;
    "import-format": Rule.RuleModule;
    "import-source-spacing": Rule.RuleModule;
    "index-export-style": Rule.RuleModule;
    "index-exports-only": Rule.RuleModule;
    "classname-dynamic-at-end": Rule.RuleModule;
    "classname-multiline": Rule.RuleModule;
    "classname-no-extra-spaces": Rule.RuleModule;
    "classname-order": Rule.RuleModule;
    "jsx-children-on-new-line": Rule.RuleModule;
    "jsx-closing-bracket-spacing": Rule.RuleModule;
    "jsx-element-child-new-line": Rule.RuleModule;
    "jsx-logical-expression-simplify": Rule.RuleModule;
    "jsx-parentheses-position": Rule.RuleModule;
    "jsx-prop-naming-convention": Rule.RuleModule;
    "jsx-simple-element-one-line": Rule.RuleModule;
    "jsx-string-value-trim": Rule.RuleModule;
    "jsx-ternary-format": Rule.RuleModule;
    "logical-expression-multiline": Rule.RuleModule;
    "member-expression-bracket-spacing": Rule.RuleModule;
    "module-index-exports": Rule.RuleModule;
    "multiline-if-conditions": Rule.RuleModule;
    "nested-call-closing-brackets": Rule.RuleModule;
    "no-inline-type-definitions": Rule.RuleModule;
    "no-redundant-folder-suffix": Rule.RuleModule;
    "no-empty-lines-in-function-calls": Rule.RuleModule;
    "no-empty-lines-in-function-params": Rule.RuleModule;
    "no-empty-lines-in-jsx": Rule.RuleModule;
    "no-empty-lines-in-objects": Rule.RuleModule;
    "no-empty-lines-in-switch-cases": Rule.RuleModule;
    "no-hardcoded-strings": Rule.RuleModule;
    "object-property-per-line": Rule.RuleModule;
    "object-property-value-brace": Rule.RuleModule;
    "object-property-value-format": Rule.RuleModule;
    "opening-brackets-same-line": Rule.RuleModule;
    "prop-naming-convention": Rule.RuleModule;
    "simple-call-single-line": Rule.RuleModule;
    "single-argument-on-one-line": Rule.RuleModule;
    "string-property-spacing": Rule.RuleModule;
    "ternary-condition-multiline": Rule.RuleModule;
    "enum-format": Rule.RuleModule;
    "interface-format": Rule.RuleModule;
    "type-annotation-spacing": Rule.RuleModule;
    "type-format": Rule.RuleModule;
    "typescript-definition-location": Rule.RuleModule;
    "variable-naming-convention": Rule.RuleModule;
}

/**
 * ESLint plugin for enforcing consistent code formatting and style rules
 */
interface CodeStylePlugin {
    meta: {
        name: "eslint-plugin-code-style";
        version: string;
    };
    rules: PluginRules;
}

declare const plugin: CodeStylePlugin;

export default plugin;

/**
 * Module augmentation for ESLint's Linter.RulesRecord
 * Enables type checking for rule configurations in eslint.config.js
 */
declare module "eslint" {
    namespace Linter {
        interface RulesRecord extends CodeStyleRulesConfig {}
    }
}
