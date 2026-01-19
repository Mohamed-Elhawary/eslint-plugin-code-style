/*
Test Rules:
- tailwindcss/classnames-order (sorted Tailwind classes)
- tailwindcss/enforces-shorthand (use shorthand classes)
- TypeScript props interface
- code-style/jsx-prop-naming-convention
*/
// Test: TypeScript component with interface props

interface ButtonProps {
    className?: string;
    label: string;
    onClick?: () => void;
    variant?: "danger" | "primary" | "secondary";
}

// Test: Tailwind classes - should be ordered correctly
export const Button = ({
    className = "",
    label,
    onClick,
    variant = "primary",
}: ButtonProps) => {
    const variantClasses = {
        danger: "bg-red-500 hover:bg-red-600",
        primary: "bg-blue-500 hover:bg-blue-600",
        secondary: "bg-gray-500 hover:bg-gray-600",
    };

    // Test: tailwindcss/classnames-order - classes should be in recommended order
    const buttonClasses = `flex items-center justify-center rounded-lg p-4 text-white font-bold ${variantClasses[variant]} ${className}`;

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
