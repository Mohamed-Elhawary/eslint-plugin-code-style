/*
 *Test Rules:
 *- jsx-children-on-new-line
 *- jsx-element-child-new-line
 *- jsx-ternary-format
 *- jsx-logical-expression-simplify
 *- jsx-parentheses-position
 *- no-empty-lines-in-jsx
 *- arrow-function-simple-jsx
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
    const renderTitleHandler = () => <h2>{title}</h2>;

    // Test: jsx-ternary-format
    return (
        <div className="card">
            <div className="card-header">{renderTitleHandler()}</div>
            {isLoading ? <span>{appStrings.loading}</span> : (
                <div className="card-body">
                    {showDescription && <p>{description}</p>}
                    <div className="card-content">{children}</div>
                </div>
            )}
        </div>
    );
};
