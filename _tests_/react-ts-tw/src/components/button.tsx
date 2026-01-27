/*
Test Rules:
- code-style/classname-multiline (multiline classes: "..." in JSX, `...` in variables/objects)
- code-style/component-props-destructure (props must be destructured)
- code-style/component-props-inline-type (inline type annotation)
- code-style/jsx-prop-naming-convention (camelCase for event handlers, data-* lowercase)
- code-style/jsx-closing-bracket-spacing (no space before closing bracket)
- code-style/jsx-simple-element-one-line (simple elements on single line)
- code-style/jsx-string-value-trim (no leading/trailing whitespace in string values)
- code-style/no-empty-lines-in-jsx (no empty lines between JSX attributes)
*/

export const Button = ({
    className = "",
    label,
    onClick,
    variant = "primary",
}: {
    className?: string,
    label: string,
    onClick?: () => void,
    variant?: "danger" | "primary" | "secondary",
}) => {
    const variantClasses = {
        danger: "bg-red-500 hover:bg-red-600",
        primary: "bg-blue-500 hover:bg-blue-600",
        secondary: "bg-gray-500 hover:bg-gray-600",
    };

    // Test: tailwindcss/classnames-order - classes should be in recommended order
    const buttonClasses = `
        flex
        items-center
        justify-center
        p-4
        font-bold
        text-white
        rounded-lg
        ${variantClasses[variant]}
        ${className}
    `;

    return (
        <button
            className={buttonClasses}
            type="button"
            onClick={onClick}
        >
            {label}
        </button>
    );
};