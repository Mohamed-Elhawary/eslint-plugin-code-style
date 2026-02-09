/*
 *Test Rules:
 *- jsx-children-on-new-line
 *- jsx-element-child-new-line
 *- jsx-ternary-format
 *- jsx-logical-expression-simplify
 *- jsx-parentheses-position
 *- no-empty-lines-in-jsx
 *- arrow-function-simple-jsx
 *- tailwindcss/classnames-order
 *- tailwindcss/enforces-shorthand
 */
// Test: function-naming-convention (PascalCase for components)

import { appStrings } from "@/strings";

export const Card = ({
    children,
    description,
    isLoading,
    title,
}) => {
    // Test: jsx-logical-expression-simplify (derived state before handlers)
    const showDescription = Boolean(description);

    // Test: arrow-function-simple-jsx (simple JSX returns)
    const renderTitleHandler = () => <h2 className="text-xl font-bold text-gray-800">{title}</h2>;

    // Test: jsx-ternary-format, tailwindcss/classnames-order
    return (
        <div
            className="
                rounded-lg
                border
                border-gray-200
                bg-white
                p-6
                shadow-md
            "
        >
            <div className="mb-4">{renderTitleHandler()}</div>
            {isLoading ? <span className="text-gray-400">{appStrings.loading}</span> : (
                <div>
                    {showDescription && <p className="mb-4 text-gray-600">{description}</p>}
                    <div className="mt-4">{children}</div>
                </div>
            )}
        </div>
    );
};
