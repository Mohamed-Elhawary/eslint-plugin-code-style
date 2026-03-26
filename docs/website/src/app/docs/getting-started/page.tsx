import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components";
import {
    codeFilenameValuesEnumsData,
    codeLanguageValuesEnumsData,
    codeSnippetStringsData,
    gettingStartedStringsData,
} from "@/data";

export const metadata: Metadata = { title: gettingStartedStringsData.metadataTitle };

const allRulesConfig = `import codeStyle from "eslint-plugin-code-style";

export default [
    {
        plugins: {
            "code-style": codeStyle,
        },
        rules: {
            "code-style/array-callback-destructure": "warn",
            "code-style/array-items-per-line": "warn",
            "code-style/array-objects-on-new-lines": "warn",
            "code-style/arrow-function-block-body": "warn",
            "code-style/arrow-function-simple-jsx": "warn",
            "code-style/arrow-function-simplify": "warn",
            "code-style/curried-arrow-same-line": "warn",
            "code-style/function-arguments-format": "warn",
            "code-style/nested-call-closing-brackets": "warn",
            "code-style/no-empty-lines-in-function-calls": "warn",
            "code-style/opening-brackets-same-line": "warn",
            "code-style/simple-call-single-line": "warn",
            "code-style/single-argument-on-one-line": "warn",
            "code-style/comment-format": "warn",
            "code-style/component-props-destructure": "warn",
            "code-style/component-props-inline-type": "warn",
            "code-style/folder-based-naming-convention": "warn",
            "code-style/folder-structure-consistency": "warn",
            "code-style/no-redundant-folder-suffix": "warn",
            "code-style/svg-icon-naming-convention": "warn",
            "code-style/class-method-definition-format": "warn",
            "code-style/class-naming-convention": "warn",
            "code-style/block-statement-newlines": "warn",
            "code-style/empty-line-after-block": "warn",
            "code-style/if-else-spacing": "warn",
            "code-style/if-statement-format": "warn",
            "code-style/logical-expression-multiline": "warn",
            "code-style/multiline-if-conditions": "warn",
            "code-style/no-empty-lines-in-switch-cases": "warn",
            "code-style/ternary-condition-multiline": "warn",
            "code-style/function-call-spacing": "warn",
            "code-style/function-declaration-style": "warn",
            "code-style/function-naming-convention": "warn",
            "code-style/function-object-destructure": "warn",
            "code-style/function-params-per-line": "warn",
            "code-style/no-empty-lines-in-function-params": "warn",
            "code-style/hook-callback-format": "warn",
            "code-style/hook-deps-per-line": "warn",
            "code-style/hook-file-naming-convention": "warn",
            "code-style/hook-function-naming-convention": "warn",
            "code-style/use-state-naming-convention": "warn",
            "code-style/absolute-imports-only": "warn",
            "code-style/export-format": "warn",
            "code-style/import-format": "warn",
            "code-style/import-source-spacing": "warn",
            "code-style/index-export-style": "warn",
            "code-style/index-exports-only": "warn",
            "code-style/inline-export-declaration": "warn",
            "code-style/module-index-exports": "warn",
            "code-style/classname-dynamic-at-end": "warn",
            "code-style/classname-multiline": "warn",
            "code-style/classname-no-extra-spaces": "warn",
            "code-style/classname-order": "warn",
            "code-style/jsx-children-on-new-line": "warn",
            "code-style/jsx-closing-bracket-spacing": "warn",
            "code-style/jsx-element-child-new-line": "warn",
            "code-style/jsx-logical-expression-simplify": "warn",
            "code-style/jsx-parentheses-position": "warn",
            "code-style/jsx-prop-naming-convention": "warn",
            "code-style/jsx-simple-element-one-line": "warn",
            "code-style/jsx-string-value-trim": "warn",
            "code-style/jsx-ternary-format": "warn",
            "code-style/no-empty-lines-in-jsx": "warn",
            "code-style/no-empty-lines-in-objects": "warn",
            "code-style/object-property-per-line": "warn",
            "code-style/object-property-value-brace": "warn",
            "code-style/object-property-value-format": "warn",
            "code-style/string-property-spacing": "warn",
            "code-style/assignment-value-same-line": "warn",
            "code-style/member-expression-bracket-spacing": "warn",
            "code-style/react-code-order": "warn",
            "code-style/no-hardcoded-strings": "warn",
            "code-style/enum-format": "warn",
            "code-style/enum-type-enforcement": "warn",
            "code-style/interface-format": "warn",
            "code-style/no-inline-type-definitions": "warn",
            "code-style/prop-naming-convention": "warn",
            "code-style/type-annotation-spacing": "warn",
            "code-style/type-format": "warn",
            "code-style/typescript-definition-location": "warn",
            "code-style/variable-naming-convention": "warn",
        },
    },
];`;

const basicConfig = `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs.react,
];`;

const disableRulesConfig = `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs.react,
    {
        rules: {
            "code-style/array-items-per-line": "off",
            "code-style/comment-format": "off",
        },
    },
];`;

const GettingStartedPage = () => (
    <div>
        <h1>{gettingStartedStringsData.title}</h1>
        <p>
            {gettingStartedStringsData.introPrefix}
            <strong>{gettingStartedStringsData.pluginName}</strong>
            {gettingStartedStringsData.intro}
        </p>
        <h2 id="requirements">{gettingStartedStringsData.sectionRequirements}</h2>
        <table>
            <thead>
                <tr>
                    <th>{gettingStartedStringsData.tableHeaderDependency}</th>
                    <th>{gettingStartedStringsData.tableHeaderVersion}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>{gettingStartedStringsData.requirementEslint}</strong>
                    </td>
                    <td>{gettingStartedStringsData.requirementEslintVersion}</td>
                </tr>
                <tr>
                    <td>
                        <strong>{gettingStartedStringsData.requirementNode}</strong>
                    </td>
                    <td>{gettingStartedStringsData.requirementNodeVersion}</td>
                </tr>
            </tbody>
        </table>
        <h2 id="installation">{gettingStartedStringsData.sectionInstallation}</h2>
        <p>{gettingStartedStringsData.installationDescription}</p>
        <div className="space-y-4">
            <CodeBlock
                code={codeSnippetStringsData.installNpm}
                filename={codeFilenameValuesEnumsData.npm}
                language={codeLanguageValuesEnumsData.bash}
            />
            <CodeBlock
                code={codeSnippetStringsData.installPnpm}
                filename={codeFilenameValuesEnumsData.pnpm}
                language={codeLanguageValuesEnumsData.bash}
            />
            <CodeBlock
                code={codeSnippetStringsData.installYarn}
                filename={codeFilenameValuesEnumsData.yarn}
                language={codeLanguageValuesEnumsData.bash}
            />
        </div>
        <h2 id="basic-configuration">{gettingStartedStringsData.sectionBasicConfiguration}</h2>
        <p>
            {gettingStartedStringsData.basicConfigDescription}
            <code>{gettingStartedStringsData.basicConfigDescriptionCode}</code>
            {gettingStartedStringsData.basicConfigDescriptionSuffix}
        </p>
        <CodeBlock
            code={basicConfig}
            filename={codeFilenameValuesEnumsData.eslintConfig}
            language={codeLanguageValuesEnumsData.js}
        />
        <p>
            {gettingStartedStringsData.basicConfigLinkPrefix}
            <Link href="/docs/configuration">{gettingStartedStringsData.basicConfigLinkText}</Link>
            {gettingStartedStringsData.basicConfigLinkSuffix}
        </p>
        <h2 id="run-eslint">{gettingStartedStringsData.sectionRunEslint}</h2>
        <p>
            {gettingStartedStringsData.runEslintDescription}
            <code>{gettingStartedStringsData.runEslintDescriptionCode}</code>
            {gettingStartedStringsData.runEslintDescriptionSuffix}
        </p>
        <CodeBlock
            code={codeSnippetStringsData.eslintFixCommand}
            filename={codeFilenameValuesEnumsData.terminal}
            language={codeLanguageValuesEnumsData.bash}
        />
        <h2 id="all-rules">{gettingStartedStringsData.sectionEnableAllRules}</h2>
        <p>{gettingStartedStringsData.enableAllRulesDescription}</p>
        <CodeBlock
            code={allRulesConfig}
            filename={codeFilenameValuesEnumsData.eslintConfig}
            language={codeLanguageValuesEnumsData.js}
            isShowLineNumbers
        />
        <blockquote>
            <p>
                <strong>{gettingStartedStringsData.allRulesNote}</strong>
                {" "}
                {gettingStartedStringsData.allRulesNoteText}
                <code>enum-format</code>
                {" "}
                {gettingStartedStringsData.allRulesNoteTextContinued}
                {" "}
                <code>variable-naming-convention</code>
                {" "}
                {gettingStartedStringsData.allRulesNoteTextEnd}
                <code>{gettingStartedStringsData.allRulesNoteTextParser}</code>
                {" "}
                {gettingStartedStringsData.allRulesNoteTextFinal}
            </p>
        </blockquote>
        <h2 id="disabling-rules">{gettingStartedStringsData.sectionDisablingRules}</h2>
        <p>
            {gettingStartedStringsData.disablingRulesDescription}
            <code>{gettingStartedStringsData.disablingRulesDescriptionCode}</code>
            {gettingStartedStringsData.disablingRulesDescriptionSuffix}
        </p>
        <CodeBlock
            code={disableRulesConfig}
            filename={codeFilenameValuesEnumsData.eslintConfig}
            language={codeLanguageValuesEnumsData.js}
        />
        <h2 id="next-steps">{gettingStartedStringsData.sectionNextSteps}</h2>
        <ul>
            <li>
                <Link href="/docs/configuration">{gettingStartedStringsData.nextStepsConfiguration}</Link>
                {gettingStartedStringsData.nextStepsConfigurationSuffix}
            </li>
            <li>
                <Link href="/docs/rules">{gettingStartedStringsData.nextStepsRulesReference}</Link>
                {gettingStartedStringsData.nextStepsRulesReferenceSuffix}
            </li>
            <li>
                <Link href="/docs/philosophy">{gettingStartedStringsData.nextStepsPhilosophy}</Link>
                {gettingStartedStringsData.nextStepsPhilosophySuffix}
            </li>
        </ul>
    </div>
);

// eslint-disable-next-line import-x/no-default-export
export default GettingStartedPage;
