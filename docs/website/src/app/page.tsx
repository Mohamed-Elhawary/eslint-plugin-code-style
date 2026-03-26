import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components";
import {
    codeFilenameValuesEnumsData,
    codeLanguageValuesEnumsData,
    codeSnippetStringsData,
    homeStringsData,
    metadataStringsData,
} from "@/data";

export const metadata: Metadata = { title: homeStringsData.metadataTitle };

const categories = [
    {
        count: 3,
        name: "Arrays",
        slug: "arrays",
    },
    {
        count: 4,
        name: "Arrow Functions",
        slug: "arrow-functions",
    },
    {
        count: 7,
        name: "Call Expressions",
        slug: "call-expressions",
    },
    {
        count: 2,
        name: "Classes",
        slug: "classes",
    },
    {
        count: 1,
        name: "Comments",
        slug: "comments",
    },
    {
        count: 6,
        name: "Components",
        slug: "components",
    },
    {
        count: 9,
        name: "Control Flow",
        slug: "control-flow",
    },
    {
        count: 6,
        name: "Functions",
        slug: "functions",
    },
    {
        count: 5,
        name: "Hooks",
        slug: "hooks",
    },
    {
        count: 9,
        name: "Imports & Exports",
        slug: "imports-exports",
    },
    {
        count: 13,
        name: "JSX",
        slug: "jsx",
    },
    {
        count: 5,
        name: "Objects",
        slug: "objects",
    },
    {
        count: 1,
        name: "React",
        slug: "react",
    },
    {
        count: 2,
        name: "Spacing",
        slug: "spacing",
    },
    {
        count: 1,
        name: "Strings",
        slug: "strings",
    },
    {
        count: 9,
        name: "TypeScript",
        slug: "typescript",
    },
    {
        count: 1,
        name: "Variables",
        slug: "variables",
    },
];

const stats = [
    {
        label: homeStringsData.statsRules,
        value: homeStringsData.statsRulesValue,
    },
    {
        label: homeStringsData.statsAutoFixable,
        value: homeStringsData.statsAutoFixableValue,
    },
    {
        label: homeStringsData.statsConfigurable,
        value: homeStringsData.statsConfigurableValue,
    },
    {
        label: homeStringsData.statsCategories,
        value: homeStringsData.statsCategoriesValue,
    },
];

const features = [
    {
        description: homeStringsData.featureAutoFixDescription,
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.048.58.024 1.194-.14 1.743"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: homeStringsData.featureAutoFixTitle,
    },
    {
        description: homeStringsData.featureReactDescription,
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: homeStringsData.featureReactTitle,
    },
    {
        description: homeStringsData.featureFlatConfigDescription,
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: homeStringsData.featureFlatConfigTitle,
    },
    {
        description: homeStringsData.featureZeroDepsDescription,
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: homeStringsData.featureZeroDepsTitle,
    },
    {
        description: homeStringsData.featureTypeScriptDescription,
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: homeStringsData.featureTypeScriptTitle,
    },
    {
        description: homeStringsData.featureConfigsDescription,
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: homeStringsData.featureConfigsTitle,
    },
];

const eslintConfigCode = `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs.react,
];`;

const eslintConfigTsCode = `import codeStyle from "eslint-plugin-code-style";

export default [
    codeStyle.configs["react-ts"],
];`;

const HomePage = () => (
    <div className="animate-fade-in">
        <section
            className="relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, oklch(0.97 0.02 270), oklch(0.94 0.04 270) 30%, oklch(0.97 0.02 300) 70%, oklch(0.98 0.01 270))" }}
        >
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 30% 20%, oklch(0.88 0.08 270 / 0.3), transparent 60%), radial-gradient(ellipse at 70% 80%, oklch(0.88 0.08 300 / 0.2), transparent 60%)" }}
            />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: "var(--bg-primary)",
                    opacity: 0,
                }}
            />
            <div className="dark:bg-[var(--bg-primary)]">
                <div
                    className="
                        relative
                        mx-auto
                        max-w-5xl
                        px-4
                        py-24
                        text-center
                        sm:px-6
                        sm:py-32
                        lg:py-40
                    "
                >
                    <div
                        className="
                            mb-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            px-4
                            py-1.5
                        "
                        style={{
                            backgroundColor: "var(--bg-badge)",
                            border: "1px solid var(--border-primary)",
                        }}
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "oklch(0.59 0.22 270)" }}
                        />
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {homeStringsData.badge}
                        </span>
                    </div>
                    <h1
                        className="
                            mb-6
                            text-4xl
                            font-extrabold
                            tracking-tight
                            sm:text-5xl
                            lg:text-6xl
                        "
                    >
                        <span className="gradient-text">{homeStringsData.heroTitle}</span>
                        <br />
                        <span style={{ color: "var(--text-primary)" }}>{homeStringsData.heroTitleSuffix}</span>
                    </h1>
                    <p
                        style={{ color: "var(--text-secondary)" }}
                        className="
                            mx-auto
                            mb-10
                            max-w-2xl
                            text-lg
                            leading-relaxed
                            sm:text-xl
                        "
                    >
                        {homeStringsData.heroSubtitle}
                    </p>
                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            gap-4
                            sm:flex-row
                        "
                    >
                        <Link
                            href="/docs/getting-started"
                            style={{ background: "linear-gradient(135deg, oklch(0.52 0.24 270), oklch(0.59 0.22 270))" }}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                transition-all
                                duration-200
                                hover:shadow-xl
                            "
                        >
                            {homeStringsData.ctaGetStarted}
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>
                        <Link
                            href="/docs/rules"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                transition-all
                                duration-200
                            "
                            style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-primary)",
                                boxShadow: "var(--shadow-sm)",
                                color: "var(--text-primary)",
                            }}
                        >
                            {homeStringsData.ctaViewRules}
                        </Link>
                        <a
                            href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style"
                            rel="noopener noreferrer"
                            style={{ color: "var(--text-secondary)" }}
                            target="_blank"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                transition-all
                                duration-200
                            "
                        >
                            <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            {homeStringsData.ctaGitHub}
                        </a>
                    </div>
                    <div className="mx-auto mt-12 max-w-xl">
                        <CodeBlock
                            code={codeSnippetStringsData.installNpm}
                            filename={codeFilenameValuesEnumsData.terminal}
                            language={codeLanguageValuesEnumsData.bash}
                        />
                    </div>
                </div>
            </div>
        </section>
        <section
            style={{
                backgroundColor: "var(--bg-secondary)",
                borderBottom: "1px solid var(--border-primary)",
                borderTop: "1px solid var(--border-primary)",
            }}
        >
            <div
                className="
                    mx-auto
                    grid
                    max-w-5xl
                    grid-cols-2
                    gap-4
                    px-4
                    py-10
                    sm:grid-cols-4
                    sm:px-6
                "
            >
                {stats.map(({
                    label,
                    value,
                }) => (
                    <div
                        className="text-center"
                        key={label}
                    >
                        <div
                            className="
                                gradient-text
                                text-3xl
                                font-extrabold
                                sm:text-4xl
                            "
                        >
                            {value}
                        </div>
                        <div
                            className="mt-1 text-sm font-medium"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
        <section style={{ backgroundColor: "var(--bg-primary)" }}>
            <div
                className="
                    mx-auto
                    max-w-5xl
                    px-4
                    py-20
                    sm:px-6
                "
            >
                <div className="mb-12 text-center">
                    <h2
                        style={{ color: "var(--text-primary)" }}
                        className="
                            mb-4
                            text-3xl
                            font-bold
                            tracking-tight
                        "
                    >
                        {homeStringsData.featuresSectionTitle}
                    </h2>
                    <p
                        className="mx-auto max-w-2xl text-lg"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {homeStringsData.featuresSectionSubtitle}
                    </p>
                </div>
                <div
                    className="
                        grid
                        gap-6
                        sm:grid-cols-2
                        lg:grid-cols-3
                    "
                >
                    {features.map(({
                        description,
                        icon,
                        title,
                    }) => (
                        <div
                            key={title}
                            className="
                                rounded-xl
                                p-6
                                transition-all
                                duration-200
                            "
                            style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-primary)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        >
                            <div
                                className="
                                    mb-4
                                    inline-flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-lg
                                "
                                style={{
                                    backgroundColor: "oklch(0.59 0.22 270 / 0.1)",
                                    color: "oklch(0.59 0.22 270)",
                                }}
                            >
                                {icon}
                            </div>
                            <h3
                                className="mb-2 text-base font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {title}
                            </h3>
                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        <section
            style={{
                backgroundColor: "var(--bg-secondary)",
                borderTop: "1px solid var(--border-primary)",
            }}
        >
            <div
                className="
                    mx-auto
                    max-w-5xl
                    px-4
                    py-20
                    sm:px-6
                "
            >
                <div className="mb-12 text-center">
                    <h2
                        style={{ color: "var(--text-primary)" }}
                        className="
                            mb-4
                            text-3xl
                            font-bold
                            tracking-tight
                        "
                    >
                        {homeStringsData.categoriesSectionTitle}
                    </h2>
                    <p
                        className="mx-auto max-w-2xl text-lg"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {homeStringsData.categoriesSectionSubtitle}
                    </p>
                </div>
                <div
                    className="
                        grid
                        gap-3
                        sm:grid-cols-2
                        lg:grid-cols-3
                    "
                >
                    {categories.map(({
                        count,
                        name,
                        slug,
                    }) => (
                        <Link
                            href={`/docs/rules/${slug}`}
                            key={slug}
                            className="
                                group
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                px-5
                                py-4
                                transition-all
                                duration-200
                            "
                            style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-primary)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {name}
                            </span>
                            <span
                                className="
                                    rounded-full
                                    px-2.5
                                    py-0.5
                                    text-xs
                                    font-semibold
                                "
                                style={{
                                    backgroundColor: "oklch(0.59 0.22 270 / 0.1)",
                                    color: "oklch(0.59 0.22 270)",
                                }}
                            >
                                {count}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        <section
            style={{
                backgroundColor: "var(--bg-primary)",
                borderTop: "1px solid var(--border-primary)",
            }}
        >
            <div
                className="
                    mx-auto
                    max-w-3xl
                    px-4
                    py-20
                    sm:px-6
                "
            >
                <div className="mb-12 text-center">
                    <h2
                        style={{ color: "var(--text-primary)" }}
                        className="
                            mb-4
                            text-3xl
                            font-bold
                            tracking-tight
                        "
                    >
                        {homeStringsData.quickStartSectionTitle}
                    </h2>
                    <p
                        className="mx-auto max-w-2xl text-lg"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {homeStringsData.quickStartSectionSubtitle}
                    </p>
                </div>
                <div className="space-y-8">
                    <div>
                        <div
                            className="
                                mb-3
                                flex
                                items-center
                                gap-3
                            "
                        >
                            <span
                                style={{ background: "linear-gradient(135deg, oklch(0.52 0.24 270), oklch(0.59 0.22 270))" }}
                                className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-xs
                                    font-bold
                                    text-white
                                "
                            >
                                1
                            </span>
                            <h3
                                className="text-base font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {homeStringsData.quickStartStepInstall}
                            </h3>
                        </div>
                        <CodeBlock
                            code={codeSnippetStringsData.installNpm}
                            filename={codeFilenameValuesEnumsData.terminal}
                            language={codeLanguageValuesEnumsData.bash}
                        />
                    </div>
                    <div>
                        <div
                            className="
                                mb-3
                                flex
                                items-center
                                gap-3
                            "
                        >
                            <span
                                style={{ background: "linear-gradient(135deg, oklch(0.52 0.24 270), oklch(0.59 0.22 270))" }}
                                className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-xs
                                    font-bold
                                    text-white
                                "
                            >
                                2
                            </span>
                            <h3
                                className="text-base font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {homeStringsData.quickStartStepConfigure}
                            </h3>
                        </div>
                        <CodeBlock
                            code={eslintConfigCode}
                            filename={codeFilenameValuesEnumsData.eslintConfig}
                            language={codeLanguageValuesEnumsData.js}
                        />
                        <p
                            className="mt-3 text-sm"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            {homeStringsData.quickStartTypeScriptHint}
                            <code
                                className="
                                    rounded
                                    px-1.5
                                    py-0.5
                                    font-mono
                                    text-xs
                                "
                                style={{
                                    backgroundColor: "var(--bg-code-inline)",
                                    color: "var(--text-code-inline)",
                                }}
                            >
                                {homeStringsData.quickStartTypeScriptHintCode}
                            </code>
                            {homeStringsData.quickStartTypeScriptHintSuffix}
                        </p>
                        <div className="mt-2">
                            <CodeBlock
                                code={eslintConfigTsCode}
                                filename={codeFilenameValuesEnumsData.eslintConfig}
                                language={codeLanguageValuesEnumsData.js}
                            />
                        </div>
                    </div>
                    <div>
                        <div
                            className="
                                mb-3
                                flex
                                items-center
                                gap-3
                            "
                        >
                            <span
                                style={{ background: "linear-gradient(135deg, oklch(0.52 0.24 270), oklch(0.59 0.22 270))" }}
                                className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-xs
                                    font-bold
                                    text-white
                                "
                            >
                                3
                            </span>
                            <h3
                                className="text-base font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {homeStringsData.quickStartStepLint}
                            </h3>
                        </div>
                        <CodeBlock
                            code={codeSnippetStringsData.eslintFixCommand}
                            filename={codeFilenameValuesEnumsData.terminal}
                            language={codeLanguageValuesEnumsData.bash}
                        />
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <Link
                        href="/docs/getting-started"
                        style={{ background: "linear-gradient(135deg, oklch(0.52 0.24 270), oklch(0.59 0.22 270))" }}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            px-6
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            shadow-lg
                            transition-all
                            duration-200
                            hover:shadow-xl
                        "
                    >
                        {homeStringsData.ctaInstallationGuide}
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
        <footer
            style={{
                backgroundColor: "var(--bg-secondary)",
                borderTop: "1px solid var(--border-primary)",
            }}
        >
            <div
                className="
                    mx-auto
                    max-w-5xl
                    px-4
                    py-12
                    sm:px-6
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-6
                        sm:flex-row
                        sm:justify-between
                    "
                >
                    <div>
                        <span className="gradient-text text-base font-bold">{metadataStringsData.defaultTitle}</span>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            {homeStringsData.footerLicense}
                            <a
                                className="font-medium hover:underline"
                                href="https://hawary.dev"
                                rel="noopener noreferrer"
                                style={{ color: "var(--text-link)" }}
                                target="_blank"
                            >
                                {homeStringsData.footerAuthorName}
                            </a>
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://www.npmjs.com/package/eslint-plugin-code-style"
                            rel="noopener noreferrer"
                            style={{ color: "var(--text-secondary)" }}
                            target="_blank"
                            className="
                                text-sm
                                font-medium
                                transition-colors
                                duration-200
                            "
                        >
                            {homeStringsData.footerNpm}
                        </a>
                        <a
                            href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style"
                            rel="noopener noreferrer"
                            style={{ color: "var(--text-secondary)" }}
                            target="_blank"
                            className="
                                text-sm
                                font-medium
                                transition-colors
                                duration-200
                            "
                        >
                            {homeStringsData.footerGitHub}
                        </a>
                        <a
                            href="https://github.com/Mohamed-Elhawary/eslint-plugin-code-style/blob/main/CHANGELOG.md"
                            rel="noopener noreferrer"
                            style={{ color: "var(--text-secondary)" }}
                            target="_blank"
                            className="
                                text-sm
                                font-medium
                                transition-colors
                                duration-200
                            "
                        >
                            {homeStringsData.footerChangelog}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
);

// eslint-disable-next-line import-x/no-default-export
export default HomePage;
