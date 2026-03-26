import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components";
import { codeFilenameValuesEnumsData, codeLanguageValuesEnumsData, configurationStringsData } from "@/data";

export const metadata: Metadata = { title: configurationStringsData.metadataTitle };

const configs = [
    {
        code: `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs.react,
];`,
        description: configurationStringsData.configDescriptionJsReact,
        github: "https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/_tests_/v9/react/.eslintrc.config.js",
        name: "react",
        rules: 72,
    },
    {
        code: `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs["react-ts"],
];`,
        description: configurationStringsData.configDescriptionTsReact,
        github: "https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/_tests_/v9/react-ts/.eslintrc.config.js",
        name: "react-ts",
        rules: 81,
    },
    {
        code: `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs["react-tw"],
];`,
        description: configurationStringsData.configDescriptionJsReactTailwind,
        github: "https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/_tests_/v9/react-tw/.eslintrc.config.js",
        name: "react-tw",
        rules: 72,
    },
    {
        code: `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs["react-ts-tw"],
];`,
        description: configurationStringsData.configDescriptionTsReactTailwind,
        github: "https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/_tests_/v9/react-ts-tw/.eslintrc.config.js",
        name: "react-ts-tw",
        rules: 81,
    },
];

const manualConfig = `import codeStyle from "eslint-plugin-code-style";

export default [
    {
        plugins: {
            "code-style": codeStyle,
        },
        rules: {
            "code-style/array-items-per-line": "warn",
            "code-style/arrow-function-simplify": "warn",
            "code-style/jsx-simple-element-one-line": "warn",
            // ...add only the rules you need
        },
    },
];`;

const configurableRuleExample = `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs.react,
    {
        rules: {
            "code-style/array-items-per-line": ["warn", { maxItems: 5 }],
            "code-style/hook-deps-per-line": ["warn", { maxDeps: 4 }],
            "code-style/object-property-per-line": ["warn", { minProperties: 3 }],
        },
    },
];`;

const tsOnlyRules = [
    "enum-format",
    "enum-type-enforcement",
    "interface-format",
    "no-inline-type-definitions",
    "prop-naming-convention",
    "type-annotation-spacing",
    "type-format",
    "component-props-inline-type",
    "typescript-definition-location",
];

const ConfigurationPage = () => (
    <div>
        <h1>{configurationStringsData.title}</h1>
        <p>
            <strong>{configurationStringsData.pluginName}</strong>
            {configurationStringsData.intro}
        </p>
        <h2 id="preset-configs">{configurationStringsData.presetConfigsTitle}</h2>
        <p>{configurationStringsData.presetConfigsDescription}</p>
        <h2 id="available-configs">{configurationStringsData.availableConfigsTitle}</h2>
        <div className="space-y-6">
            {configs.map(({
                code,
                description,
                github,
                name,
                rules,
            }) => (
                <div
                    className="overflow-hidden rounded-xl"
                    key={name}
                    style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                    }}
                >
                    <div
                        style={{ borderBottom: "1px solid var(--border-primary)" }}
                        className="
                            flex
                            items-center
                            justify-between
                            px-5
                            py-3
                        "
                    >
                        <div>
                            <h3
                                className="text-base font-semibold"
                                style={{
                                    color: "var(--text-primary)",
                                    margin: 0,
                                }}
                            >
                                <code>{name}</code>
                            </h3>
                            <p
                                className="mt-0.5 text-sm"
                                style={{
                                    color: "var(--text-secondary)",
                                    margin: 0,
                                }}
                            >
                                {description}
                                {" "}
                                {configurationStringsData.configRulesSeparator}
                                {" "}
                                {rules}
                                {" "}
                                {configurationStringsData.configRulesSuffix}
                            </p>
                        </div>
                        <a
                            className="text-xs font-medium"
                            href={github}
                            rel="noopener noreferrer"
                            style={{ color: "var(--text-link)" }}
                            target="_blank"
                        >
                            {configurationStringsData.viewOnGitHub}
                        </a>
                    </div>
                    <div className="px-0">
                        <CodeBlock
                            code={code}
                            filename={codeFilenameValuesEnumsData.eslintConfig}
                            language={codeLanguageValuesEnumsData.js}
                        />
                    </div>
                </div>
            ))}
        </div>
        <h2 id="manual-configuration">{configurationStringsData.manualConfigTitle}</h2>
        <p>{configurationStringsData.manualConfigDescription}</p>
        <CodeBlock
            code={manualConfig}
            filename={codeFilenameValuesEnumsData.eslintConfig}
            language={codeLanguageValuesEnumsData.js}
        />
        <h2 id="rule-options">{configurationStringsData.ruleOptionsTitle}</h2>
        <p>{configurationStringsData.ruleOptionsDescription}</p>
        <CodeBlock
            code={configurableRuleExample}
            filename={codeFilenameValuesEnumsData.eslintConfig}
            language={codeLanguageValuesEnumsData.js}
        />
        <p>
            {configurationStringsData.ruleOptionsLinkPrefix}
            <Link href="/docs/rules">{configurationStringsData.ruleOptionsLinkText}</Link>
            {configurationStringsData.ruleOptionsLinkSuffix}
        </p>
        <h2 id="typescript-only-rules">{configurationStringsData.tsOnlyTitle}</h2>
        <p>
            {configurationStringsData.tsOnlyDescription}
            <code>{configurationStringsData.tsOnlyDescriptionCode1}</code>
            {configurationStringsData.tsOnlyDescriptionConnector}
            <code>{configurationStringsData.tsOnlyDescriptionCode2}</code>
            {configurationStringsData.tsOnlyDescriptionSuffix}
        </p>
        <ul>
            {tsOnlyRules.map((rule) => (
                <li key={rule}>
                    <code>{rule}</code>
                </li>
            ))}
        </ul>
        <p>
            {configurationStringsData.tsOnlyManualNote}
            <code>{configurationStringsData.tsOnlyManualNoteCode}</code>
            {configurationStringsData.tsOnlyManualNoteSuffix}
        </p>
        <h2 id="eslint-v9-vs-v10">{configurationStringsData.v9v10Title}</h2>
        <p>{configurationStringsData.v9v10Description}</p>
        <table>
            <thead>
                <tr>
                    <th>{configurationStringsData.v9v10TableHeaderPlugin}</th>
                    <th>{configurationStringsData.v9v10TableHeaderV9}</th>
                    <th>{configurationStringsData.v9v10TableHeaderV10}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{configurationStringsData.v9v10TablePluginReact}</td>
                    <td>
                        <code>{configurationStringsData.v9v10TableReactV9}</code>
                    </td>
                    <td>
                        <code>{configurationStringsData.v9v10TableReactV10}</code>
                    </td>
                </tr>
                <tr>
                    <td>{configurationStringsData.v9v10TablePluginReactHooks}</td>
                    <td>
                        <code>{configurationStringsData.v9v10TableReactHooksV9}</code>
                    </td>
                    <td>{configurationStringsData.v9v10TableReactHooksV10}</td>
                </tr>
                <tr>
                    <td>{configurationStringsData.v9v10TablePluginJsxA11y}</td>
                    <td>
                        <code>{configurationStringsData.v9v10TableJsxA11yV9}</code>
                    </td>
                    <td>{configurationStringsData.v9v10TableJsxA11yV10}</td>
                </tr>
            </tbody>
        </table>
        <p>{configurationStringsData.v9v10Note}</p>
        <p>
            {configurationStringsData.v9v10GitHubLinkPrefix}
            <a
                href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/tree/main/recommended-configs/v9"
                rel="noopener noreferrer"
                style={{ color: "var(--text-link)" }}
                target="_blank"
            >
                {configurationStringsData.v9v10GitHubLinkV9}
            </a>
            {" | "}
            <a
                href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/tree/main/recommended-configs/v10"
                rel="noopener noreferrer"
                style={{ color: "var(--text-link)" }}
                target="_blank"
            >
                {configurationStringsData.v9v10GitHubLinkV10}
            </a>
        </p>
        <h2 id="next-steps">{configurationStringsData.nextStepsTitle}</h2>
        <ul>
            <li>
                <Link href="/docs/rules">{configurationStringsData.nextStepsRulesReference}</Link>
                {configurationStringsData.nextStepsRulesReferenceSuffix}
            </li>
            <li>
                <Link href="/docs/philosophy">{configurationStringsData.nextStepsPhilosophy}</Link>
                {configurationStringsData.nextStepsPhilosophySuffix}
            </li>
            <li>
                <Link href="/docs/contributing">{configurationStringsData.nextStepsContributing}</Link>
                {configurationStringsData.nextStepsContributingSuffix}
            </li>
        </ul>
    </div>
);

// eslint-disable-next-line import-x/no-default-export
export default ConfigurationPage;
