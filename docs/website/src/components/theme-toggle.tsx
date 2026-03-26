"use client";

import { useSyncExternalStore } from "react";

import { componentStringsData, themeValuesEnumsData } from "@/data";

import { useTheme } from "./theme-provider";

const emptySubscribeHandler = () => () => {};

const getClientSnapshotHandler = () => true;

const getServerSnapshotHandler = () => false;

export const ThemeToggle = () => {
    const {
        onSetTheme,
        resolvedTheme,
    } = useTheme();

    const isMounted = useSyncExternalStore(
        emptySubscribeHandler,
        getClientSnapshotHandler,
        getServerSnapshotHandler,
    );

    return (
        <button
            aria-label={componentStringsData.toggleThemeLabel}
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
            onClick={() => onSetTheme(resolvedTheme === themeValuesEnumsData.dark ? themeValuesEnumsData.light : themeValuesEnumsData.dark)}
            onMouseEnter={({ currentTarget }) => currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={({ currentTarget }) => currentTarget.style.color = "var(--text-secondary)"}
        >
            {!isMounted ? <span className="h-[18px] w-[18px]" /> : resolvedTheme === themeValuesEnumsData.dark ? (
                <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="5"
                    />
                    <line
                        x1="12"
                        x2="12"
                        y1="1"
                        y2="3"
                    />
                    <line
                        x1="12"
                        x2="12"
                        y1="21"
                        y2="23"
                    />
                    <line
                        x1="4.22"
                        x2="5.64"
                        y1="4.22"
                        y2="5.64"
                    />
                    <line
                        x1="18.36"
                        x2="19.78"
                        y1="18.36"
                        y2="19.78"
                    />
                    <line
                        x1="1"
                        x2="3"
                        y1="12"
                        y2="12"
                    />
                    <line
                        x1="21"
                        x2="23"
                        y1="12"
                        y2="12"
                    />
                    <line
                        x1="4.22"
                        x2="5.64"
                        y1="19.78"
                        y2="18.36"
                    />
                    <line
                        x1="18.36"
                        x2="19.78"
                        y1="5.64"
                        y2="4.22"
                    />
                </svg>
            ) : (
                <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    );
};
