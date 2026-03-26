import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components";
import {
    badgeVariantValuesEnumsData,
    categoriesRulesData,
    configurableRulesData,
    fixableRulesData,
    reportOnlyRulesData,
    totalRulesData,
    tsOnlyRulesData,
} from "@/data";
import { rulesIndexStringsData } from "@/data";

export const metadata: Metadata = {
    description: rulesIndexStringsData.metadataDescription,
    title: rulesIndexStringsData.metadataTitle,
};

const RulesPage = () => (
    <div>
        <h1>{rulesIndexStringsData.title}</h1>
        <p>
            {rulesIndexStringsData.introPrefix}
            <strong>
                {totalRulesData}
                {rulesIndexStringsData.introSuffix}
            </strong>
            {rulesIndexStringsData.intro}
        </p>
        <div
            className="
                my-8
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-5
            "
        >
            {[
                {
                    label: rulesIndexStringsData.statTotal,
                    value: totalRulesData,
                    variant: badgeVariantValuesEnumsData["default"],
                },
                {
                    label: rulesIndexStringsData.statAutoFixable,
                    value: fixableRulesData,
                    variant: badgeVariantValuesEnumsData.success,
                },
                {
                    label: rulesIndexStringsData.statConfigurable,
                    value: configurableRulesData,
                    variant: badgeVariantValuesEnumsData.info,
                },
                {
                    label: rulesIndexStringsData.statReportOnly,
                    value: reportOnlyRulesData,
                    variant: badgeVariantValuesEnumsData.warning,
                },
                {
                    label: rulesIndexStringsData.statTsOnly,
                    value: tsOnlyRulesData,
                    variant: badgeVariantValuesEnumsData.purple,
                },
            ].map(({
                label,
                value,
                variant,
            }) => (
                <div
                    className="rounded-lg p-3 text-center"
                    key={label}
                    style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                    }}
                >
                    <div
                        className="text-2xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {value}
                    </div>
                    <div className="mt-0.5">
                        <Badge variant={variant}>{label}</Badge>
                    </div>
                </div>
            ))}
        </div>
        <div
            style={{ color: "var(--text-tertiary)" }}
            className="
                mb-8
                flex
                flex-wrap
                gap-3
                text-sm
            "
        >
            <span className="flex items-center gap-1.5">
                <Badge variant={badgeVariantValuesEnumsData.success}>{rulesIndexStringsData.badgeFixable}</Badge>
                {" "}
                {rulesIndexStringsData.legendFixable}
                <code>{rulesIndexStringsData.legendFixableCode}</code>
            </span>
            <span className="flex items-center gap-1.5">
                <Badge variant={badgeVariantValuesEnumsData.info}>{rulesIndexStringsData.badgeConfigurable}</Badge>
                {" "}
                {rulesIndexStringsData.legendConfigurable}
            </span>
            <span className="flex items-center gap-1.5">
                <Badge variant={badgeVariantValuesEnumsData.purple}>{rulesIndexStringsData.badgeTs}</Badge>
                {" "}
                {rulesIndexStringsData.legendTsOnly}
            </span>
        </div>
        <div className="space-y-6">
            {categoriesRulesData.map(({
                description,
                name,
                rules,
                slug,
            }) => (
                <div
                    className="overflow-hidden rounded-xl"
                    key={slug}
                    style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                    }}
                >
                    <Link
                        href={`/docs/rules/${slug}`}
                        style={{ borderBottom: "1px solid var(--border-primary)" }}
                        className="
                            flex
                            items-center
                            justify-between
                            px-5
                            py-4
                            no-underline
                            transition-colors
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
                                {name}
                            </h3>
                            <p
                                className="mt-0.5 text-sm"
                                style={{
                                    color: "var(--text-secondary)",
                                    margin: 0,
                                }}
                            >
                                {description}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="
                                    rounded-full
                                    px-2.5
                                    py-0.5
                                    text-xs
                                    font-semibold
                                "
                                style={{
                                    backgroundColor: "var(--bg-badge)",
                                    color: "var(--text-tertiary)",
                                }}
                            >
                                {rules.length}
                            </span>
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                style={{ color: "var(--text-tertiary)" }}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </Link>
                    <div
                        className="divide-y"
                        style={{ borderColor: "var(--border-secondary)" }}
                    >
                        {rules.map(({
                            description,
                            isConfigurable,
                            isFixable,
                            isTsOnly,
                            name,
                        }) => (
                            <Link
                                href={`/docs/rules/${slug}#${name}`}
                                key={name}
                                className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                    px-5
                                    py-3
                                    no-underline
                                    transition-colors
                                "
                            >
                                <div className="min-w-0">
                                    <code
                                        className="text-sm font-semibold"
                                        style={{
                                            backgroundColor: "transparent",
                                            color: "var(--text-primary)",
                                            padding: 0,
                                        }}
                                    >
                                        {name}
                                    </code>
                                    <p
                                        className="mt-0.5 truncate text-xs"
                                        style={{
                                            color: "var(--text-tertiary)",
                                            margin: 0,
                                        }}
                                    >
                                        {description}
                                    </p>
                                </div>
                                <div
                                    className="
                                        flex
                                        shrink-0
                                        items-center
                                        gap-1.5
                                    "
                                >
                                    {isFixable && <Badge variant={badgeVariantValuesEnumsData.success}>{rulesIndexStringsData.badgeFixable}</Badge>}
                                    {isConfigurable && <Badge variant={badgeVariantValuesEnumsData.info}>{rulesIndexStringsData.badgeOptions}</Badge>}
                                    {isTsOnly && <Badge variant={badgeVariantValuesEnumsData.purple}>{rulesIndexStringsData.badgeTs}</Badge>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// eslint-disable-next-line import-x/no-default-export
export default RulesPage;
