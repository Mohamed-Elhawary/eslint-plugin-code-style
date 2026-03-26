"use client";

import Link from "next/link";
import { useState } from "react";

import { componentStringsData } from "@/data";

import { ThemeToggle } from "./theme-toggle";

const navLinks = [
    {
        href: "/docs/getting-started",
        label: componentStringsData.navLinkDocs,
    },
    {
        href: "/docs/rules",
        label: componentStringsData.navLinkRules,
    },
    {
        external: true,
        href: "https://github.com/Mohamed-Elhawary/eslint-plugin-code-style",
        label: componentStringsData.navLinkGitHub,
    },
];

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header
            className="
                fixed
                inset-x-0
                top-0
                z-50
            "
            style={{
                backdropFilter: "blur(12px)",
                backgroundColor: "var(--bg-nav)",
                borderBottom: "1px solid var(--border-primary)",
            }}
        >
            <nav
                className="
                    mx-auto
                    flex
                    h-16
                    max-w-7xl
                    items-center
                    justify-between
                    px-4
                    sm:px-6
                    lg:px-8
                "
            >
                <Link
                    href="/"
                    className="
                        flex
                        items-center
                        gap-2
                        transition-opacity
                        hover:opacity-80
                    "
                >
                    <span
                        className="
                            gradient-text
                            text-lg
                            font-bold
                            tracking-tight
                        "
                    >
                        {componentStringsData.brandName}
                    </span>
                </Link>
                <div
                    className="
                        hidden
                        items-center
                        gap-1
                        md:flex
                    "
                >
                    {navLinks.map(({
                        external,
                        href,
                        label,
                    }) => external ? (
                        <a
                            href={href}
                            key={label}
                            rel="noopener noreferrer"
                            style={{ color: "var(--text-secondary)" }}
                            target="_blank"
                            className="
                                flex
                                items-center
                                gap-1
                                rounded-lg
                                px-3
                                py-2
                                text-sm
                                font-medium
                                transition-colors
                                duration-200
                            "
                            onMouseEnter={(e) => {
                                const { currentTarget: { style } } = e;

                                style.color =
                                    "var(--text-primary)";

                                style.backgroundColor =
                                    "var(--bg-tertiary)";
                            }}
                            onMouseLeave={(e) => {
                                const { currentTarget: { style } } = e;

                                style.color =
                                    "var(--text-secondary)";

                                style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            {label}
                            <svg
                                fill="none"
                                height="12"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="12"
                            >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line
                                    x1="10"
                                    x2="21"
                                    y1="14"
                                    y2="3"
                                />
                            </svg>
                        </a>
                    ) : (
                        <Link
                            href={href}
                            key={label}
                            style={{ color: "var(--text-secondary)" }}
                            className="
                                rounded-lg
                                px-3
                                py-2
                                text-sm
                                font-medium
                                transition-colors
                                duration-200
                            "
                            onMouseEnter={(e) => {
                                const { currentTarget: { style } } = e;

                                style.color =
                                    "var(--text-primary)";

                                style.backgroundColor =
                                    "var(--bg-tertiary)";
                            }}
                            onMouseLeave={(e) => {
                                const { currentTarget: { style } } = e;

                                style.color =
                                    "var(--text-secondary)";

                                style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                    <div
                        className="mx-2 h-5 w-px"
                        style={{ backgroundColor: "var(--border-primary)" }}
                    />
                    <ThemeToggle />
                    <span
                        className="
                            ml-2
                            rounded-md
                            px-2
                            py-1
                            font-mono
                            text-xs
                            font-medium
                        "
                        style={{
                            backgroundColor: "var(--bg-badge)",
                            color: "var(--text-badge)",
                        }}
                    >
                        {componentStringsData.version}
                    </span>
                </div>
                <div
                    className="
                        flex
                        items-center
                        gap-2
                        md:hidden
                    "
                >
                    <ThemeToggle />
                    <button
                        aria-label={componentStringsData.toggleMenuLabel}
                        className="
                            flex
                            h-9
                            w-9
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            transition-colors
                            duration-200
                        "
                        style={{
                            backgroundColor: "var(--bg-tertiary)",
                            color: "var(--text-secondary)",
                        }}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <svg
                                fill="none"
                                height="20"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="20"
                            >
                                <line
                                    x1="18"
                                    x2="6"
                                    y1="6"
                                    y2="18"
                                />
                                <line
                                    x1="6"
                                    x2="18"
                                    y1="6"
                                    y2="18"
                                />
                            </svg>
                        ) : (
                            <svg
                                fill="none"
                                height="20"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="20"
                            >
                                <line
                                    x1="3"
                                    x2="21"
                                    y1="6"
                                    y2="6"
                                />
                                <line
                                    x1="3"
                                    x2="21"
                                    y1="12"
                                    y2="12"
                                />
                                <line
                                    x1="3"
                                    x2="21"
                                    y1="18"
                                    y2="18"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>
            {isMobileMenuOpen && (
                <div
                    className="animate-slide-up border-t md:hidden"
                    style={{
                        backgroundColor: "var(--bg-nav)",
                        borderColor: "var(--border-primary)",
                    }}
                >
                    <div className="space-y-1 px-4 py-3">
                        {navLinks.map(({
                            external,
                            href,
                            label,
                        }) => external ? (
                            <a
                                href={href}
                                key={label}
                                rel="noopener noreferrer"
                                style={{ color: "var(--text-secondary)" }}
                                target="_blank"
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    px-3
                                    py-2.5
                                    text-sm
                                    font-medium
                                    transition-colors
                                    duration-200
                                "
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {label}
                                <svg
                                    fill="none"
                                    height="12"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    width="12"
                                >
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line
                                        x1="10"
                                        x2="21"
                                        y1="14"
                                        y2="3"
                                    />
                                </svg>
                            </a>
                        ) : (
                            <Link
                                href={href}
                                key={label}
                                style={{ color: "var(--text-secondary)" }}
                                className="
                                    block
                                    rounded-lg
                                    px-3
                                    py-2.5
                                    text-sm
                                    font-medium
                                    transition-colors
                                    duration-200
                                "
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {label}
                            </Link>
                        ))}
                        <div
                            className="my-2 h-px"
                            style={{ backgroundColor: "var(--border-primary)" }}
                        />
                        <div
                            className="
                                flex
                                items-center
                                px-3
                                py-2
                            "
                        >
                            <span
                                className="
                                    rounded-md
                                    px-2
                                    py-1
                                    font-mono
                                    text-xs
                                    font-medium
                                "
                                style={{
                                    backgroundColor: "var(--bg-badge)",
                                    color: "var(--text-badge)",
                                }}
                            >
                                {componentStringsData.version}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
