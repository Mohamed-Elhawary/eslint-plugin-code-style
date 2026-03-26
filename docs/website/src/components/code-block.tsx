import { CopyButton } from "./copy-button";

export const CodeBlock = ({
    code,
    filename,
    isShowLineNumbers = false,
    language,
}: {
    code: string,
    filename?: string,
    isShowLineNumbers?: boolean,
    language?: string,
}) => {
    const lines = code.split("\n");

    // Remove trailing empty line if present
    if (lines[lines.length - 1] === "") lines.pop();

    return (
        <div
            className="
                group
                relative
                overflow-hidden
                rounded-xl
            "
            style={{
                backgroundColor: "var(--bg-code)",
                border: "1px solid var(--border-primary)",
                boxShadow: "var(--shadow-md)",
            }}
        >
            {(filename || language) && (
                <div
                    style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
                    className="
                        flex
                        items-center
                        justify-between
                        px-4
                        py-2.5
                    "
                >
                    {filename ? (
                        <span
                            className="font-mono text-xs font-medium"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            {filename}
                        </span>
                    ) : <span />}
                    <div className="flex items-center gap-2">
                        {language && !filename && (
                            <span
                                className="
                                    rounded-md
                                    px-2
                                    py-0.5
                                    font-mono
                                    text-[11px]
                                    font-medium
                                    tracking-wide
                                    uppercase
                                "
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                                    color: "var(--text-tertiary)",
                                }}
                            >
                                {language}
                            </span>
                        )
                        }
                        {filename && language && (
                            <span
                                className="
                                    rounded-md
                                    px-2
                                    py-0.5
                                    font-mono
                                    text-[11px]
                                    font-medium
                                    tracking-wide
                                    uppercase
                                "
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                                    color: "var(--text-tertiary)",
                                }}
                            >
                                {language}
                            </span>
                        )
                        }
                        <CopyButton text={code} />
                    </div>
                </div>
            )
            }
            <div className="relative">
                {!filename && !language && (
                    <div
                        className="
                            absolute
                            top-2
                            right-2
                            z-10
                            opacity-0
                            transition-opacity
                            duration-200
                            group-hover:opacity-100
                        "
                    >
                        <CopyButton text={code} />
                    </div>
                )
                }
                <div className="overflow-x-auto">
                    <pre
                        className="
                            py-4
                            font-mono
                            text-sm
                            leading-relaxed
                        "
                        style={{
                            color: "var(--text-code)",
                            whiteSpace: "pre",
                        }}
                    >
                        <code
                            className="block min-w-fit"
                            style={{ whiteSpace: "pre" }}
                        >
                            {lines.map((
                                line,
                                index,
                            ) => (
                                <span
                                    className="block px-4"
                                    key={index}
                                >
                                    {isShowLineNumbers && (
                                        <span
                                            style={{ color: "rgba(148, 163, 184, 0.3)" }}
                                            className="
                                                mr-4
                                                inline-block
                                                w-8
                                                text-right
                                                select-none
                                            "
                                        >
                                            {index + 1}
                                        </span>
                                    )}
                                    {line || " "}
                                </span>
                            ))}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};
