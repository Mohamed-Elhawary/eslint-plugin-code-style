"use client";

import { useState } from "react";

import { componentStringsData } from "@/data";
import { joinClassesHandler } from "@/lib";

export const CopyButton = ({
    className,
    text,
}: {
    className?: string,
    text: string,
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyHandler = async () => {
        try {
            await navigator.clipboard.writeText(text);

            setIsCopied(true);

            setTimeout(
                () => setIsCopied(false),
                2000,
            );
        } catch {
            // Fallback: silently fail
        }
    };

    return (
        <button
            aria-label={isCopied ? componentStringsData.copiedLabel : componentStringsData.copyLabel}
            style={{ color: isCopied ? "var(--color-brand-400)" : "var(--text-tertiary)" }}
            className={joinClassesHandler(
                `
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-md
                transition-colors
                duration-200
            `,
                className,
            )}
            onClick={copyHandler}
            onMouseEnter={(e) => {
                const { currentTarget: { style } } = e;

                if (!isCopied) {
                    style.color = "var(--text-secondary)";

                    style.backgroundColor =
                        "rgba(255, 255, 255, 0.1)";
                }
            }}
            onMouseLeave={(e) => {
                const { currentTarget: { style } } = e;

                if (!isCopied) {
                    style.color = "var(--text-tertiary)";

                    style.backgroundColor = "transparent";
                }
            }}
        >
            {isCopied ? (
                <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                >
                    <rect
                        height="13"
                        rx="2"
                        ry="2"
                        width="13"
                        x="9"
                        y="9"
                    />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            )}
        </button>
    );
};
