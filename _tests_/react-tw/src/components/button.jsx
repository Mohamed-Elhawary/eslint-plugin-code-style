/*
 *Test Rules:
 *- arrow-function-simplify
 *- arrow-function-block-body
 *- classname-no-extra-spaces
 *- classname-multiline (Tailwind multiline classes)
 *- jsx-simple-element-one-line
 *- jsx-closing-bracket-spacing
 *- jsx-prop-naming-convention
 *- jsx-string-value-trim
 *- variable-naming-convention
 *- function-naming-convention
 *- object-property-per-line
 *- tailwindcss/classnames-order
 */
// Test: variable-naming-convention (camelCase for regular variables)

import { buttonTypeData } from "@/data";

// Test: function-naming-convention (PascalCase for components)
export const Button = ({
    className = "",
    label,
    onClick,
    variant,
}) => {
    // Test: variable-naming-convention (derived state comes before handlers)
    const variantClasses = {
        danger: "text-white bg-red-500 hover:bg-red-600",
        primary: "text-white bg-blue-500 hover:bg-blue-600",
        secondary: "text-white bg-gray-500 hover:bg-gray-600",
    };

    // Test: classname-multiline (long Tailwind class strings)
    const buttonClasses = `
        inline-flex
        items-center
        justify-center
        px-4
        py-2
        font-medium
        rounded-lg
        transition-colors
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
    `;

    // Test: arrow-function-simplify (implicit return for simple expressions)
    const getLabelHandler = () => label.toUpperCase();

    // Test: jsx-simple-element-one-line, jsx-closing-bracket-spacing, classname-no-extra-spaces
    return (
        <div className="flex items-center gap-4">
            <button
                className={buttonClasses}
                type={buttonTypeData.button}
                onClick={onClick}
            >
                {getLabelHandler()}
            </button>
        </div>
    );
};
