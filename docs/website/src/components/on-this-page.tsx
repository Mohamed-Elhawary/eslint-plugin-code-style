"use client";

import { useEffect, useState } from "react";

import { componentStringsData, scrollBehaviorValuesEnumsData } from "@/data";
import type { HeadingInterface } from "@/interfaces";
import { joinClassesHandler } from "@/lib";

export const OnThisPage = ({ headings }: { headings: HeadingInterface[] }) => {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(
        () => {
            if (headings.length === 0) return;

            const observer = new IntersectionObserver(
                (entries) => {
                // Find the first heading that is intersecting
                    const visible = entries.filter(({ isIntersecting }) => isIntersecting).sort((
                        { boundingClientRect: rectA },
                        { boundingClientRect: rectB },
                    ) =>
                        rectA.top - rectB.top);

                    if (visible.length > 0) setActiveId(visible[0].target.id);
                },
                {
                    rootMargin: componentStringsData.intersectionObserverRootMargin,
                    threshold: 0,
                },
            );

            headings.forEach(({ id }) => {
                const element = document.getElementById(id);

                if (element) observer.observe(element);
            });

            return () => observer.disconnect();
        },
        [headings],
    );

    if (headings.length === 0) return null;

    return (
        <div className="hidden xl:block">
            <div className="sticky top-20 w-56">
                <h4
                    style={{ color: "var(--text-tertiary)" }}
                    className="
                        mb-3
                        text-[11px]
                        font-semibold
                        tracking-widest
                        uppercase
                    "
                >
                    {componentStringsData.onThisPageTitle}
                </h4>
                <nav>
                    <ul className="space-y-1">
                        {headings.map((heading) => {
                            const {
                                id,
                                level,
                                text,
                            } = heading;

                            const isActive = activeId === id;

                            return (
                                <li key={id}>
                                    <a
                                        href={`#${id}`}
                                        className={joinClassesHandler(`
                                            block
                                            text-[13px]
                                            leading-relaxed
                                            transition-colors
                                            duration-150
                                        `)}
                                        style={{
                                            color: isActive ? "var(--text-link)" : "var(--text-tertiary)",
                                            fontWeight: isActive ? 500 : 400,
                                            paddingLeft:
                                                level === 3 ? "0.75rem" : level >= 4 ? "1.5rem" : "0",
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();

                                            const element = document.getElementById(id);

                                            if (element) {
                                                element.scrollIntoView({ behavior: scrollBehaviorValuesEnumsData.smooth });

                                                setActiveId(id);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            const { currentTarget: { style } } = e;

                                            if (!isActive) {
                                                style.color =
                                                    "var(--text-primary)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            const { currentTarget: { style } } = e;

                                            if (!isActive) {
                                                style.color =
                                                    "var(--text-tertiary)";
                                            }
                                        }}
                                    >
                                        {text}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </div>
    );
};
