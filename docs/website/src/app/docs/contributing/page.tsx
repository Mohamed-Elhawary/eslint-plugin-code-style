import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components";
import {
    codeFilenameValuesEnumsData,
    codeLanguageValuesEnumsData,
    codeSnippetStringsData,
    contributingStringsData,
} from "@/data";

export const metadata: Metadata = { title: contributingStringsData.metadataTitle };

const cloneAndInstall = `git clone https://github.com/Mohamed-Elhawary/eslint-plugin-code-style.git
cd eslint-plugin-code-style
npm install`;

const projectStructure = `eslint-plugin-code-style/
├── src/
│   ├── rules/
│   │   ├── arrays.js
│   │   ├── arrow-functions.js
│   │   ├── call-expressions.js
│   │   ├── classes.js
│   │   ├── comments.js
│   │   ├── components.js
│   │   ├── control-flow.js
│   │   ├── functions.js
│   │   ├── hooks.js
│   │   ├── imports-exports.js
│   │   ├── jsx.js
│   │   ├── objects.js
│   │   ├── react.js
│   │   ├── spacing.js
│   │   ├── strings.js
│   │   ├── typescript.js
│   │   └── variables.js
│   ├── utils/
│   │   └── tailwind.js
│   └── index.js
├── _tests_/
│   ├── v9/
│   │   ├── react/
│   │   ├── react-ts/
│   │   ├── react-tw/
│   │   └── react-ts-tw/
│   └── v10/
│       ├── react/
│       ├── react-ts/
│       ├── react-tw/
│       └── react-ts-tw/
├── dist/
│   └── index.js
├── docs/
│   └── website/
├── package.json
└── esbuild.config.js`;

const rulePattern = `// src/rules/arrays.js

const arrayCallbackDestructure = {
    meta: {
        type: "layout",
        docs: {
            description: "Enforce destructured properties on separate lines",
        },
        fixable: "whitespace",
        schema: [],
    },
    create(context) {
        return {
            // AST visitor methods
            CallExpression(node) {
                // Rule logic here
                context.report({
                    node,
                    message: "Each destructured property should be on its own line",
                    fix(fixer) {
                        // Auto-fix logic
                    },
                });
            },
        };
    },
};`;

const testCommand = `cd _tests_/v9/react-ts
npx eslint . --fix`;

const ContributingPage = () => {
    const buildCommand = codeSnippetStringsData.npmRunBuild;

    return (
        <div>
            <h1>{contributingStringsData.title}</h1>
            <p>
                {contributingStringsData.introPrefix}
                <strong>{contributingStringsData.pluginName}</strong>
                {contributingStringsData.intro}
            </p>
            <h2 id="getting-started">{contributingStringsData.gettingStartedTitle}</h2>
            <p>{contributingStringsData.cloneDescription}</p>
            <CodeBlock
                code={cloneAndInstall}
                filename={codeFilenameValuesEnumsData.terminal}
                language={codeLanguageValuesEnumsData.bash}
            />
            <p>{contributingStringsData.gettingStartedBuildDescription}</p>
            <CodeBlock
                code={buildCommand}
                filename={codeFilenameValuesEnumsData.terminal}
                language={codeLanguageValuesEnumsData.bash}
            />
            <p>
                {contributingStringsData.gettingStartedBuildNote}
                <code>{contributingStringsData.gettingStartedBuildNoteCode}</code>
                {contributingStringsData.gettingStartedBuildNoteSuffix}
            </p>
            <h2 id="project-structure">{contributingStringsData.projectStructureTitle}</h2>
            <p>
                {contributingStringsData.projectStructureDescription}
                <code>{contributingStringsData.projectStructureDescriptionCode}</code>
                {contributingStringsData.projectStructureDescriptionSuffix}
            </p>
            <CodeBlock
                code={projectStructure}
                filename={codeFilenameValuesEnumsData.projectStructure}
                language={codeLanguageValuesEnumsData.text}
            />
            <h3>{contributingStringsData.keyFilesTitle}</h3>
            <ul>
                <li>
                    <code>{contributingStringsData.keyFilesEntryCode}</code>
                    {contributingStringsData.keyFilesEntry}
                </li>
                <li>
                    <code>{contributingStringsData.keyFilesRulesCode}</code>
                    {contributingStringsData.keyFilesRules}
                </li>
                <li>
                    <code>{contributingStringsData.keyFilesTailwindCode}</code>
                    {contributingStringsData.keyFilesTailwind}
                </li>
                <li>
                    <code>{contributingStringsData.keyFilesBuildConfigCode}</code>
                    {contributingStringsData.keyFilesBuildConfig}
                </li>
            </ul>
            <h2 id="rule-pattern">{contributingStringsData.rulePatternTitle}</h2>
            <p>{contributingStringsData.rulePatternDescription}</p>
            <CodeBlock
                code={rulePattern}
                filename={codeFilenameValuesEnumsData.rulesArrays}
                language={codeLanguageValuesEnumsData.js}
                isShowLineNumbers
            />
            <h3>{contributingStringsData.guidelinesTitle}</h3>
            <ul>
                <li>
                    {contributingStringsData.guidelinePlaceRule}
                    <code>{contributingStringsData.guidelinePlaceRuleCode}</code>
                    {contributingStringsData.guidelinePlaceRuleSuffix}
                </li>
                <li>
                    {contributingStringsData.guidelineFixable}
                    <code>{contributingStringsData.guidelineFixableCode1}</code>
                    {contributingStringsData.guidelineFixableMiddle}
                    <code>{contributingStringsData.guidelineFixableCode2}</code>
                    {contributingStringsData.guidelineFixableSuffix}
                </li>
                <li>{contributingStringsData.guidelineClearMessages}</li>
                <li>
                    {contributingStringsData.guidelineAddRule}
                    <code>{contributingStringsData.guidelineAddRuleCode}</code>
                    {contributingStringsData.guidelineAddRuleSuffix}
                </li>
                <li>
                    {contributingStringsData.guidelineTsOnly}
                    <code>{contributingStringsData.guidelineTsOnlyCode1}</code>
                    {contributingStringsData.guidelineTsOnlyMiddle}
                    <code>{contributingStringsData.guidelineTsOnlyCode2}</code>
                    {contributingStringsData.guidelineTsOnlySuffix}
                </li>
            </ul>
            <h2 id="testing">{contributingStringsData.testTitle}</h2>
            <p>
                {contributingStringsData.testDescription}
                <code>{contributingStringsData.testDescriptionCode}</code>
                {contributingStringsData.testDescriptionSuffix}
            </p>
            <table>
                <thead>
                    <tr>
                        <th>{contributingStringsData.tableHeaderTestProject}</th>
                        <th>{contributingStringsData.tableHeaderStack}</th>
                        <th>{contributingStringsData.tableHeaderRules}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <code>{contributingStringsData.titleTestProjectReact}</code>
                        </td>
                        <td>{contributingStringsData.testStackJsReact}</td>
                        <td>72</td>
                    </tr>
                    <tr>
                        <td>
                            <code>{contributingStringsData.titleTestProjectReactTs}</code>
                        </td>
                        <td>{contributingStringsData.testStackTsReact}</td>
                        <td>81</td>
                    </tr>
                    <tr>
                        <td>
                            <code>{contributingStringsData.titleTestProjectReactTw}</code>
                        </td>
                        <td>{contributingStringsData.testStackJsReactTailwind}</td>
                        <td>72</td>
                    </tr>
                    <tr>
                        <td>
                            <code>{contributingStringsData.titleTestProjectReactTsTw}</code>
                        </td>
                        <td>{contributingStringsData.testStackTsReactTailwind}</td>
                        <td>81</td>
                    </tr>
                </tbody>
            </table>
            <p>{contributingStringsData.testToTestDescription}</p>
            <ol>
                <li>
                    {contributingStringsData.testBuildStep}
                    <code>{contributingStringsData.testBuildStepCode}</code>
                    {contributingStringsData.testBuildStepSuffix}
                </li>
                <li>{contributingStringsData.testNavigateStep}</li>
            </ol>
            <CodeBlock
                code={testCommand}
                filename={codeFilenameValuesEnumsData.terminal}
                language={codeLanguageValuesEnumsData.bash}
            />
            <p>{contributingStringsData.testAllProjectsNote}</p>
            <h2 id="build">{contributingStringsData.buildTitle}</h2>
            <p>
                {contributingStringsData.buildDescription}
                <code>{contributingStringsData.buildDescriptionCode}</code>
                {contributingStringsData.buildDescriptionSuffix}
            </p>
            <ul>
                <li>{contributingStringsData.buildFormatEsm}</li>
                <li>{contributingStringsData.buildPlatformNode}</li>
                <li>{contributingStringsData.buildTargetNode}</li>
                <li>
                    {contributingStringsData.buildVersionInject}
                    <code>{contributingStringsData.buildVersionInjectCode1}</code>
                    {contributingStringsData.buildVersionInjectSuffix}
                    <code>{contributingStringsData.buildVersionInjectCode2}</code>
                </li>
            </ul>
            <CodeBlock
                code={buildCommand}
                filename={codeFilenameValuesEnumsData.terminal}
                language={codeLanguageValuesEnumsData.bash}
            />
            <h2 id="commit-conventions">{contributingStringsData.commitConventionsTitle}</h2>
            <p>{contributingStringsData.commitConventionsDescription}</p>
            <ul>
                <li>
                    <code>{contributingStringsData.commitFeat}</code>
                    {contributingStringsData.commitFeatSuffix}
                </li>
                <li>
                    <code>{contributingStringsData.commitFix}</code>
                    {contributingStringsData.commitFixSuffix}
                </li>
                <li>
                    <code>{contributingStringsData.commitDocs}</code>
                    {contributingStringsData.commitDocsSuffix}
                </li>
                <li>
                    <code>{contributingStringsData.commitRefactor}</code>
                    {contributingStringsData.commitRefactorSuffix}
                </li>
                <li>
                    <code>{contributingStringsData.commitChore}</code>
                    {contributingStringsData.commitChoreSuffix}
                </li>
            </ul>
            <h2 id="links">{contributingStringsData.linksTitle}</h2>
            <ul>
                <li>
                    <a
                        href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {contributingStringsData.linkGitHubRepo}
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/issues"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {contributingStringsData.linkIssueTracker}
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/CHANGELOG.md"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {contributingStringsData.linkChangelog}
                    </a>
                </li>
                <li>
                    <a
                        href="https://www.npmjs.com/package/eslint-plugin-code-style"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {contributingStringsData.linkNpmPackage}
                    </a>
                </li>
            </ul>
            <h2 id="next-steps">{contributingStringsData.nextStepsTitle}</h2>
            <ul>
                <li>
                    <Link href="/docs/rules">{contributingStringsData.nextStepsRulesReference}</Link>
                    {contributingStringsData.nextStepsRulesReferenceSuffix}
                </li>
                <li>
                    <Link href="/docs/philosophy">{contributingStringsData.nextStepsPhilosophy}</Link>
                    {contributingStringsData.nextStepsPhilosophySuffix}
                </li>
                <li>
                    <Link href="/docs/getting-started">{contributingStringsData.nextStepsGettingStarted}</Link>
                    {contributingStringsData.nextStepsGettingStartedSuffix}
                </li>
            </ul>
        </div>
    );
};

// eslint-disable-next-line import-x/no-default-export
export default ContributingPage;
