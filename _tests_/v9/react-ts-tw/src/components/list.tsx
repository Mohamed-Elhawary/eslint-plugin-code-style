/*
 *Test Rules:
 *- code-style/jsx-children-on-new-line (children on separate lines)
 *- code-style/jsx-element-child-new-line (child elements on new lines)
 *- code-style/jsx-logical-expression-simplify (simplify && expressions)
 *- code-style/jsx-parentheses-position (opening parenthesis on same line)
 *- code-style/jsx-closing-bracket-spacing (no space before />)
 *- code-style/no-empty-lines-in-jsx (no empty lines inside JSX elements)
 *- code-style/object-property-per-line (object properties on separate lines)
 *- code-style/array-items-per-line (array items on separate lines)
 */

import { useMemo, useState } from "react";

import { StatusEnum } from "@/enums";
import type { ListItemInterface } from "@/interfaces";
import { appStrings } from "@/strings";

export const List = ({
    emptyMessage = appStrings.common.noItems,
    items,
    title,
}: {
    emptyMessage?: string,
    items: ListItemInterface[],
    title: string,
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Test: array-items-per-line - each item on its own line when 2+ items
    const defaultItems: ListItemInterface[] = [
        {
            id: "1",
            label: appStrings.items.first,
        },
        {
            id: "2",
            label: appStrings.items.second,
        },
    ];

    // Derived state / computed values
    const hasItems = items.length > 0 || defaultItems.length > 0;

    // Test: logical-expression-multiline - simple expression should be on single line
    const testData = {
        currentStep: 1,
        errorMessage: null,
        status: StatusEnum.ACTIVE,
    };

    const _err = testData.errorMessage || testData.currentStep || testData.status;

    // Test: object-property-per-line - each property on its own line when 2+ properties
    const listStyle = useMemo(
        () => ({
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            padding: "16px",
        }),
        [],
    );

    const displayItems = useMemo(
        () => items.length > 0 ? items : defaultItems,
        [items],
    );

    // Test: jsx-parentheses-position - opening parenthesis on same line as return
    return (
        <div style={listStyle}>
            <h2>{title}</h2>
            {hasItems && (
                <ul>
                    {displayItems.map(({
                        id,
                        label,
                    }) => (
                        <li
                            key={id}
                            style={{
                                backgroundColor: selectedId === id ? "#e0e0e0" : "transparent",
                                cursor: "pointer",
                                padding: "8px",
                            }}
                            onClick={() => setSelectedId(id)}
                        >
                            {label}
                        </li>
                    ))}
                </ul>
            )}
            {!hasItems && <p>{emptyMessage}</p>}
        </div>
    );
};
