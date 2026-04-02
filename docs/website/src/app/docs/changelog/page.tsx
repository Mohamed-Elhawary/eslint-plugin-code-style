import fs from "node:fs";
import nodePath from "node:path";

import type { Metadata } from "next";
import Link from "next/link";
import type React from "react";

import { changelogStringsData, pluginConfigData } from "@/data";
import type { VersionEntryInterface } from "@/interfaces";

export const metadata: Metadata = { title: changelogStringsData.metadataTitle };

const resolveChangelogPathHandler = (): string => {
    // Try relative path from cwd (local dev: docs/website/ → ../../CHANGELOG.md)
    const fromCwd = nodePath.resolve(
        process.cwd(),
        changelogStringsData.changelogRelativePath,
    );

    if (fs.existsSync(fromCwd)) return fromCwd;

    // Vercel: full repo cloned at /vercel/path0/, website root at /vercel/path1/
    const vercelPath = nodePath.resolve(
        changelogStringsData.vercelRepoRoot,
        changelogStringsData.changelogFilename,
    );

    if (fs.existsSync(vercelPath)) return vercelPath;

    return fromCwd;
};

const parseChangelogHandler = (): VersionEntryInterface[] => {
    const changelogPath = resolveChangelogPathHandler();

    const content = fs.readFileSync(
        changelogPath,
        changelogStringsData.encoding,
    );

    const versions: VersionEntryInterface[] = [];

    const versionRegex = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})$/;

    const lines = content.split(changelogStringsData.newline);

    let currentVersion: VersionEntryInterface | null = null;

    for (const line of lines) {
        const versionMatch = line.match(versionRegex);

        if (versionMatch) {
            if (currentVersion) versions.push(currentVersion);

            currentVersion = {
                date: versionMatch[2],
                entries: [],
                isRelease: false,
                title: null,
                version: versionMatch[1],
            };

            continue;
        }

        if (!currentVersion) continue;

        if (!currentVersion.title && /^\*\*.+\*\*$/.test(line.trim()) && !line.includes(changelogStringsData.fullChangelogMarker)) {
            currentVersion.title = line.trim().replace(
                /\*\*/g,
                changelogStringsData.emptyString,
            );

            currentVersion.isRelease = true;

            continue;
        }

        if (line.trim() === changelogStringsData.separator || line.trim() === changelogStringsData.emptyString || line.includes(changelogStringsData.fullChangelogMarker)) continue;

        if (line.startsWith(changelogStringsData.versionRangePrefix)) continue;

        currentVersion.entries.push(line);
    }

    if (currentVersion) versions.push(currentVersion);

    return versions;
};

const formatDateHandler = (dateStr: string) => {
    const date = new Date(`${dateStr}${changelogStringsData.dateSuffix}`);

    return date.toLocaleDateString(
        changelogStringsData.locale,
        changelogStringsData.dateFormatOptions,
    );
};

const formatEntryHtmlHandler = (item: string) => item.
    replace(
        /\*\*`([^`]+)`\*\*/g,
        changelogStringsData.strongCodeHtml,
    ).replace(
        /`([^`]+)`/g,
        changelogStringsData.codeHtml,
    ).replace(
        /\*\*([^*]+)\*\*/g,
        changelogStringsData.strongHtml,
    );

const renderEntriesHandler = (entries: string[]) => {
    const elements: React.ReactNode[] = [];

    let currentSection: string | null = null;

    let currentItems: string[] = [];

    let keyCounter = 0;

    const flushSectionHandler = () => {
        if (currentSection && currentItems.length > 0) {
            elements.push(
                <div
                    className="mb-4"
                    key={`section-${keyCounter++}`}
                >
                    <h4
                        style={{ color: "var(--text-secondary)" }}
                        className="
                            mb-2
                            text-sm
                            font-semibold
                            tracking-wide
                            uppercase
                        "
                    >
                        {currentSection}
                    </h4>
                    <ul className="space-y-1.5">
                        {currentItems.map((
                            item,
                            i,
                        ) => (
                            <li
                                className="text-sm leading-relaxed"
                                key={`item-${keyCounter}-${i}`}
                                style={{ color: "var(--text-primary)" }}
                            >
                                <span
                                    className="mr-2"
                                    style={{ color: "var(--text-tertiary)" }}
                                >
                                    {changelogStringsData.bullet}
                                </span>
                                <span dangerouslySetInnerHTML={{ __html: formatEntryHtmlHandler(item) }} />
                            </li>
                        ))}
                    </ul>
                </div>,
            );
        }

        currentItems = [];
    };

    for (const line of entries) {
        if (line.startsWith(changelogStringsData.sectionPrefix)) {
            flushSectionHandler();

            currentSection = line.replace(
                changelogStringsData.sectionPrefix,
                changelogStringsData.emptyString,
            );
        } else if (line.startsWith(changelogStringsData.listItemPrefix)) {
            currentItems.push(
                line.replace(
                    /^- /,
                    changelogStringsData.emptyString,
                ),
            );
        }
    }

    flushSectionHandler();

    return elements;
};

const ChangelogPage = () => {
    const versions = parseChangelogHandler();

    return (
        <div>
            <h1>{changelogStringsData.title}</h1>
            <p>{changelogStringsData.description}</p>
            <p
                className="mb-8 text-sm"
                style={{ color: "var(--text-secondary)" }}
            >
                {changelogStringsData.currentVersionLabel}
                {" "}
                <Link
                    className="font-medium"
                    href={`${pluginConfigData.githubUrl}/releases`}
                    style={{ color: "var(--text-link)" }}
                    target="_blank"
                >
                    {changelogStringsData.viewGitHubReleases}
                </Link>
            </p>
            <div className="space-y-8">
                {versions.map(({
                    date,
                    entries,
                    isRelease,
                    title,
                    version,
                }) => (
                    <div
                        className="rounded-lg border p-6"
                        id={`v${version}`}
                        key={version}
                        style={{ borderColor: "var(--border-primary)" }}
                    >
                        <div
                            className="
                                mb-4
                                flex
                                flex-wrap
                                items-center
                                gap-3
                            "
                        >
                            <h2
                                className="m-0 text-lg font-bold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {changelogStringsData.versionPrefix}
                                {version}
                            </h2>
                            {isRelease && (
                                <span
                                    className="
                                        rounded-full
                                        px-2.5
                                        py-0.5
                                        text-xs
                                        font-medium
                                    "
                                    style={{
                                        backgroundColor: "oklch(0.52 0.24 270 / 0.15)",
                                        color: "oklch(0.52 0.24 270)",
                                    }}
                                >
                                    {changelogStringsData.releaseBadge}
                                </span>
                            )}
                            <span
                                className="text-sm"
                                style={{ color: "var(--text-tertiary)" }}
                            >
                                {formatDateHandler(date)}
                            </span>
                        </div>
                        {title && (
                            <p
                                className="mb-4 text-sm font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {title}
                            </p>
                        )}
                        {renderEntriesHandler(entries)}
                    </div>
                ))}
            </div>
        </div>
    );
};

// eslint-disable-next-line import-x/no-default-export
export default ChangelogPage;
