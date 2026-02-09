/*
 *Test Rules:
 *- jsx-ternary-format (return statement with complex consequent, simple alternate)
 */
// Test: jsx-ternary-format in return statements

import { fieldData } from "@/data";
import { appStrings } from "@/strings";

export const TernaryTest = ({
    eventsModule,
    field,
    isComplex,
    moduleName,
}) => {
    // Test: complex consequent, simple alternate - correct format
    const renderCellHandler = ({
        id,
        title,
    }) => moduleName === eventsModule && field === fieldData.title ? (
        <a
            className="link"
            href={`/events/${id}`}
        >
            <span>{title}</span>
        </a>
    ) : <span>{title}</span>;

    // Test: ternary with JSX in return - correct format
    return isComplex ? (
        <div className="complex">
            <h1>{appStrings.complex}</h1>
            <p>{appStrings.content}</p>
            {renderCellHandler({ id: 1 })}
        </div>
    ) : <span>{appStrings.simple}</span>;
};
