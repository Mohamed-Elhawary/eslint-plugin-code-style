import type { Metadata } from "next";
import Link from "next/link";

import { docsOverviewStringsData } from "@/data";

export const metadata: Metadata = { title: docsOverviewStringsData.metadataTitle };

const cards = [
    {
        description: docsOverviewStringsData.cardInstallationDescription,
        href: "/docs/getting-started",
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: docsOverviewStringsData.cardInstallationTitle,
    },
    {
        description: docsOverviewStringsData.cardConfigurationDescription,
        href: "/docs/configuration",
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
        title: docsOverviewStringsData.cardConfigurationTitle,
    },
    {
        description: docsOverviewStringsData.cardRulesDescription,
        href: "/docs/rules",
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: docsOverviewStringsData.cardRulesTitle,
    },
    {
        description: docsOverviewStringsData.cardPhilosophyDescription,
        href: "/docs/philosophy",
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: docsOverviewStringsData.cardPhilosophyTitle,
    },
];

const DocsPage = () => (
    <div>
        <h1>{docsOverviewStringsData.title}</h1>
        <p>
            {docsOverviewStringsData.introPrefix}
            <strong>{docsOverviewStringsData.pluginName}</strong>
            {docsOverviewStringsData.intro}
        </p>
        <div
            className="
                mt-8
                grid
                gap-4
                sm:grid-cols-2
            "
        >
            {cards.map(({
                description,
                href,
                icon,
                title,
            }) => (
                <Link
                    href={href}
                    key={href}
                    className="
                        group
                        rounded-xl
                        p-6
                        no-underline
                        transition-all
                        duration-200
                    "
                    style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        boxShadow: "var(--shadow-sm)",
                        textDecoration: "none",
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
                        style={{
                            color: "var(--text-secondary)",
                            marginBottom: 0,
                        }}
                    >
                        {description}
                    </p>
                </Link>
            ))}
        </div>
    </div>
);

// eslint-disable-next-line import-x/no-default-export
export default DocsPage;
