"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsNavigationData } from "@/data";
import { joinClassesHandler } from "@/lib";

export const Sidebar = ({
    isOpen = false,
    onClose,
}: {
    isOpen?: boolean,
    onClose?: () => void,
}) => {
    const pathname = usePathname();

    return (
        <>
            {isOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/50
                        md:hidden
                    "
                    onClick={onClose}
                />
            )}
            <aside
                className={joinClassesHandler(
                    `
                    fixed
                    top-16
                    z-40
                    h-[calc(100vh-4rem)]
                    w-64
                    shrink-0
                    overflow-y-auto
                `,
                    "transition-transform duration-300 ease-in-out",
                    "md:sticky md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
                style={{
                    backgroundColor: "var(--bg-sidebar)",
                    borderRight: "1px solid var(--border-primary)",
                }}
            >
                <nav className="px-4 py-6">
                    {docsNavigationData.map(({
                        items,
                        title,
                    }) => (
                        <div
                            className="mb-6"
                            key={title}
                        >
                            <h4
                                style={{ color: "var(--text-tertiary)" }}
                                className="
                                    mb-2
                                    px-3
                                    text-[11px]
                                    font-semibold
                                    tracking-widest
                                    uppercase
                                "
                            >
                                {title}
                            </h4>
                            <ul className="space-y-0.5">
                                {items.map((item) => {
                                    const {
                                        href,
                                        title,
                                    } = item;

                                    const isActive = pathname === href;

                                    return (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                className={joinClassesHandler(`
                                                    block
                                                    rounded-md
                                                    px-3
                                                    py-1.5
                                                    text-[13px]
                                                    font-medium
                                                    transition-all
                                                    duration-150
                                                `)}
                                                style={{
                                                    backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                                                    borderLeft: isActive ? "2px solid var(--border-active)" : "2px solid transparent",
                                                    color: isActive ? "var(--text-link)" : "var(--text-secondary)",
                                                }}
                                                onClick={onClose}
                                                onMouseEnter={(e) => {
                                                    const { currentTarget: { style } } = e;

                                                    if (!isActive) {
                                                        style.color =
                                                            "var(--text-primary)";

                                                        style.backgroundColor =
                                                            "var(--bg-secondary)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    const { currentTarget: { style } } = e;

                                                    if (!isActive) {
                                                        style.color =
                                                            "var(--text-secondary)";

                                                        style.backgroundColor =
                                                            "transparent";
                                                    }
                                                }}
                                            >
                                                {title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};
