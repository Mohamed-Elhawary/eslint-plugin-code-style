import type { NavSectionInterface } from "@/interfaces";

export type { NavItemInterface, NavSectionInterface } from "@/interfaces";

export const docsNavigationData: NavSectionInterface[] = [
    {
        items: [
            {
                href: "/docs",
                title: "Introduction",
            },
            {
                href: "/docs/getting-started",
                title: "Installation",
            },
            {
                href: "/docs/configuration",
                title: "Configuration",
            },
        ],
        title: "Getting Started",
    },
    {
        items: [
            {
                href: "/docs/rules",
                title: "Overview",
            },
            {
                href: "/docs/rules/arrays",
                title: "Arrays",
            },
            {
                href: "/docs/rules/arrow-functions",
                title: "Arrow Functions",
            },
            {
                href: "/docs/rules/call-expressions",
                title: "Call Expressions",
            },
            {
                href: "/docs/rules/classes",
                title: "Classes",
            },
            {
                href: "/docs/rules/comments",
                title: "Comments",
            },
            {
                href: "/docs/rules/components",
                title: "Components",
            },
            {
                href: "/docs/rules/control-flow",
                title: "Control Flow",
            },
            {
                href: "/docs/rules/functions",
                title: "Functions",
            },
            {
                href: "/docs/rules/hooks",
                title: "Hooks",
            },
            {
                href: "/docs/rules/imports-exports",
                title: "Imports & Exports",
            },
            {
                href: "/docs/rules/jsx",
                title: "JSX",
            },
            {
                href: "/docs/rules/objects",
                title: "Objects",
            },
            {
                href: "/docs/rules/react",
                title: "React",
            },
            {
                href: "/docs/rules/spacing",
                title: "Spacing",
            },
            {
                href: "/docs/rules/strings",
                title: "Strings",
            },
            {
                href: "/docs/rules/typescript",
                title: "TypeScript",
            },
            {
                href: "/docs/rules/variables",
                title: "Variables",
            },
        ],
        title: "Rules",
    },
    {
        items: [
            {
                href: "/docs/philosophy",
                title: "Philosophy",
            },
            {
                href: "/docs/contributing",
                title: "Contributing",
            },
        ],
        title: "Guides",
    },
];
