"use client";

import type React from "react";
import { useState } from "react";

import { Sidebar } from "@/components";
import { componentStringsData } from "@/data";

const DocsLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="mx-auto max-w-[90rem]">
            <button
                aria-label={componentStringsData.toggleNavigationLabel}
                className="
                    fixed
                    right-4
                    bottom-4
                    z-50
                    flex
                    h-12
                    w-12
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-full
                    shadow-lg
                    lg:hidden
                "
                style={{
                    background: "linear-gradient(135deg, oklch(0.52 0.24 270), oklch(0.59 0.22 270))",
                    color: "white",
                }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    {isSidebarOpen ? (
                        <path
                            d="M6 18L18 6M6 6l12 12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : (
                        <path
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                </svg>
            </button>
            {isSidebarOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/50
                        lg:hidden
                    "
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className="flex">
                <aside
                    className={`
                        fixed
                        top-16
                        left-0
                        z-40
                        h-[calc(100vh-4rem)]
                        w-64
                        shrink-0
                        overflow-y-auto
                        transition-transform
                        duration-300
                        lg:sticky
                        lg:translate-x-0
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
                    style={{
                        backgroundColor: "var(--bg-sidebar)",
                        borderRight: "1px solid var(--border-primary)",
                    }}
                >
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </aside>
                <div className="min-w-0 flex-1">
                    <div
                        className="
                            mx-auto
                            max-w-4xl
                            px-6
                            py-10
                            sm:px-8
                            lg:px-12
                        "
                    >
                        <article className="prose-docs animate-fade-in">{children}</article>
                    </div>
                </div>
            </div>
        </div>
    );
};

// eslint-disable-next-line import-x/no-default-export
export default DocsLayout;
