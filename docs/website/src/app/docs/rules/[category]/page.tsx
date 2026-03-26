/* eslint-disable check-file/folder-naming-convention */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components";
import { CodeBlock } from "@/components";
import {
    badgeVariantValuesEnumsData,
    categoriesRulesData,
    codeFilenameValuesEnumsData,
    codeLanguageValuesEnumsData,
    getCategoryBySlugRulesDataHandler,
} from "@/data";
import { ruleConfigFragmentStringsData, rulesCategoryStringsData } from "@/data";
import type { CategoryPagePropsInterface } from "@/interfaces";

export const generateStaticParams = async () => categoriesRulesData.map(({ slug }) => ({ category: slug }));

export const generateMetadata = async (props: CategoryPagePropsInterface): Promise<Metadata> => {
    const { params } = props;

    const { category: slug } = await params;

    const category = getCategoryBySlugRulesDataHandler(slug);

    if (!category) return { title: rulesCategoryStringsData.metadataNotFound };

    return {
        description: category.description,
        title: `${category.name}${rulesCategoryStringsData.metadataRulesSuffix}`,
    };
};

const CategoryPage = async ({ params }: { params: Promise<{ category: string }> }) => {
    const { category: slug } = await params;

    const categoryIndex = categoriesRulesData.findIndex(({ slug: catSlug }) => catSlug === slug);

    const prevCategory = categoryIndex > 0 ? categoriesRulesData[categoryIndex - 1] : null;

    const nextCategory = categoryIndex < categoriesRulesData.length - 1 ? categoriesRulesData[categoryIndex + 1] : null;

    const category = getCategoryBySlugRulesDataHandler(slug);

    if (!category) notFound();

    return (
        <div>
            <nav
                style={{ color: "var(--text-tertiary)" }}
                className="
                    mb-6
                    flex
                    items-center
                    gap-2
                    text-sm
                "
            >
                <Link
                    className="transition-colors hover:underline"
                    href="/docs/rules"
                    style={{ color: "var(--text-tertiary)" }}
                >
                    {rulesCategoryStringsData.breadcrumbRules}
                </Link>
                <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span style={{ color: "var(--text-secondary)" }}>{category.name}</span>
            </nav>
            <h1>
                {category.name}
                {rulesCategoryStringsData.rulesSuffix}
            </h1>
            <p>{category.description}</p>
            <div
                className="
                    mb-8
                    flex
                    flex-wrap
                    gap-2
                "
            >
                <Badge variant={badgeVariantValuesEnumsData["default"]}>
                    {category.rules.length}
                    {rulesCategoryStringsData.badgeRules}
                </Badge>
                {category.rules.filter(({ isFixable }) => isFixable).length > 0 && (
                    <Badge variant={badgeVariantValuesEnumsData.success}>
                        {category.rules.filter(({ isFixable }) => isFixable).length}
                        {` ${rulesCategoryStringsData.badgeAutoFixable}`}
                    </Badge>
                )}
                {category.rules.filter(({ isConfigurable }) => isConfigurable).length > 0 && (
                    <Badge variant={badgeVariantValuesEnumsData.info}>
                        {category.rules.filter(({ isConfigurable }) => isConfigurable).length}
                        {` ${rulesCategoryStringsData.badgeConfigurable}`}
                    </Badge>
                )}
                {category.rules.filter(({ isTsOnly }) => isTsOnly).length > 0 && (
                    <Badge variant={badgeVariantValuesEnumsData.purple}>
                        {category.rules.filter(({ isTsOnly }) => isTsOnly).length}
                        {rulesCategoryStringsData.badgeTypeScriptOnly}
                    </Badge>
                )}
            </div>
            <div
                className="mb-10 rounded-lg p-4"
                style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                }}
            >
                <h4
                    className="
                        mb-2
                        text-xs
                        font-semibold
                        tracking-wider
                        uppercase
                    "
                    style={{
                        color: "var(--text-tertiary)",
                        margin: 0,
                    }}
                >
                    {rulesCategoryStringsData.onThisPageTitle}
                </h4>
                <div
                    className="
                        flex
                        flex-wrap
                        gap-x-4
                        gap-y-1
                    "
                >
                    {category.rules.map(({ name }) => (
                        <a
                            className="text-sm no-underline transition-colors"
                            href={`#${name}`}
                            key={name}
                            style={{ color: "var(--text-link)" }}
                        >
                            {name}
                        </a>
                    ))}
                </div>
            </div>
            <div className="space-y-16">
                {category.rules.map(({
                    badExample,
                    description,
                    goodExample,
                    isConfigurable,
                    isFixable,
                    isTsOnly,
                    name,
                    options,
                    rationale,
                }) => (
                    <section
                        className="scroll-mt-24"
                        id={name}
                        key={name}
                    >
                        <div
                            className="
                                mb-4
                                flex
                                flex-wrap
                                items-start
                                justify-between
                                gap-3
                            "
                        >
                            <h2
                                className="flex items-center gap-2"
                                style={{
                                    borderBottom: "none",
                                    marginTop: 0,
                                    paddingBottom: 0,
                                }}
                            >
                                <code
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "var(--text-primary)",
                                        fontSize: "1.25rem",
                                        padding: 0,
                                    }}
                                >
                                    {name}
                                </code>
                            </h2>
                            <div className="flex items-center gap-1.5">
                                {isFixable && <Badge variant={badgeVariantValuesEnumsData.success}>{rulesCategoryStringsData.badgeAutoFixable}</Badge>}
                                {isConfigurable && <Badge variant={badgeVariantValuesEnumsData.info}>{rulesCategoryStringsData.badgeConfigurable}</Badge>}
                                {isTsOnly && <Badge variant={badgeVariantValuesEnumsData.purple}>{rulesCategoryStringsData.typeScriptOnlyBadge}</Badge>}
                                {!isFixable && <Badge variant={badgeVariantValuesEnumsData.warning}>{rulesCategoryStringsData.reportOnlyBadge}</Badge>}
                            </div>
                        </div>
                        <p>{description}</p>
                        <blockquote>
                            <strong>{rulesCategoryStringsData.rationalePrefix}</strong>
                            {` ${rationale}`}
                        </blockquote>
                        {options.length > 0 && (
                            <>
                                <h3 style={{ marginTop: "1.5rem" }}>{rulesCategoryStringsData.optionsTitle}</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{rulesCategoryStringsData.tableHeaderOption}</th>
                                            <th>{rulesCategoryStringsData.tableHeaderType}</th>
                                            <th>{rulesCategoryStringsData.tableHeaderDefault}</th>
                                            <th>{rulesCategoryStringsData.tableHeaderDescription}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {options.map(({
                                            default: defaultVal,
                                            description: desc,
                                            name: optName,
                                            type: optType,
                                        }) => (
                                            <tr key={optName}>
                                                <td>
                                                    <code>{optName}</code>
                                                </td>
                                                <td>
                                                    <code>{optType}</code>
                                                </td>
                                                <td>
                                                    <code>{defaultVal}</code>
                                                </td>
                                                <td>{desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <CodeBlock
                                    filename={codeFilenameValuesEnumsData.eslintConfig}
                                    language={codeLanguageValuesEnumsData.javascript}
                                    code={`${ruleConfigFragmentStringsData.rulePrefix}${name}${ruleConfigFragmentStringsData.configOptionsSuffix}${options.map(({
                                        default: d,
                                        name: n,
                                    }) => `${n}: ${d}`).join(", ")}${ruleConfigFragmentStringsData.optionsSuffix}`}
                                />
                            </>
                        )}
                        <div
                            className="
                                mt-6
                                grid
                                gap-4
                                lg:grid-cols-2
                            "
                        >
                            <div>
                                <div
                                    style={{ color: "oklch(0.7 0.22 145)" }}
                                    className="
                                        mb-2
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        font-medium
                                    "
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M4.5 12.75l6 6 9-13.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    {rulesCategoryStringsData.exampleCorrect}
                                </div>
                                <CodeBlock
                                    code={goodExample}
                                    language={codeLanguageValuesEnumsData.javascript}
                                />
                            </div>
                            <div>
                                <div
                                    style={{ color: "oklch(0.65 0.2 25)" }}
                                    className="
                                        mb-2
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        font-medium
                                    "
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M6 18L18 6M6 6l12 12"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    {rulesCategoryStringsData.exampleIncorrect}
                                </div>
                                <CodeBlock
                                    code={badExample}
                                    language={codeLanguageValuesEnumsData.javascript}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <CodeBlock
                                code={`${ruleConfigFragmentStringsData.rulePrefix}${name}${ruleConfigFragmentStringsData.configErrorSuffix}`}
                                filename={codeFilenameValuesEnumsData.eslintConfig}
                                language={codeLanguageValuesEnumsData.javascript}
                            />
                        </div>
                    </section>
                ))}
            </div>
            <div
                style={{ borderTop: "1px solid var(--border-primary)" }}
                className="
                    mt-16
                    flex
                    items-center
                    justify-between
                    gap-4
                    pt-6
                "
            >
                {prevCategory ? (
                    <Link
                        href={`/docs/rules/${prevCategory.slug}`}
                        style={{ color: "var(--text-secondary)" }}
                        className="
                            group
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            no-underline
                        "
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {prevCategory.name}
                    </Link>
                ) : <div />}
                {nextCategory ? (
                    <Link
                        href={`/docs/rules/${nextCategory.slug}`}
                        style={{ color: "var(--text-secondary)" }}
                        className="
                            group
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            no-underline
                        "
                    >
                        {nextCategory.name}
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
                ) : <div />}
            </div>
        </div>
    );
};

// eslint-disable-next-line import-x/no-default-export
export default CategoryPage;
