/*
 *Test Rules:
 *- arrow-function-simplify
 *- arrow-function-block-body
 *- classname-no-extra-spaces
 *- jsx-simple-element-one-line
 *- jsx-closing-bracket-spacing
 *- jsx-prop-naming-convention
 *- jsx-string-value-trim
 *- variable-naming-convention
 *- function-naming-convention
 *- object-property-per-line
 */
// Test: variable-naming-convention (camelCase for regular variables)

const buttonVariants = { 
    danger: "red",
    primary: "blue",
    variant: "contained",
};

// Test: function-naming-convention (PascalCase for components)
const Button = ({
    className,
    disabled,
    label,
    onClick,
    variant,
}) => {
    // Test: variable-naming-convention (derived state comes before handlers)
    const buttonClass = buttonVariants[variant] || buttonVariants.primary;

    // Test: object-property-per-line (each property on own line when >= 2)
    const buttonStyle = {
        backgroundColor: buttonClass,
        padding: "10px",
    };

    // Test: arrow-function-simplify (implicit return for simple expressions)
    const getLabelHandler = () => label.toUpperCase();

    // Test: jsx-simple-element-one-line, jsx-closing-bracket-spacing, classname-no-extra-spaces
    return (
        <div className="flex items-center gap-4">
            <button
                className={className}
                disabled={disabled}
                style={buttonStyle}
                type="button"
                onClick={onClick}
            >
                {getLabelHandler()}
            </button>
        </div>
    );
};

export { Button };
