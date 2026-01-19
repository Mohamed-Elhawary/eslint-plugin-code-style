/*
Test Rules:
- tailwindcss/enforces-shorthand
- TypeScript children prop
- code-style/jsx-children-on-new-line
*/
// Test: TypeScript component with ReactNode children

import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    description?: string;
    title: string;
}

// Test: Tailwind classes with shorthand enforcement
export const Card = ({
    children,
    className = "",
    description,
    title,
}: CardProps) => (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-md ${className}`}>
        <h2 className="mb-2 text-xl font-bold text-gray-800">{title}</h2>
        {description && <p className="mb-4 text-gray-600">{description}</p>}
        <div className="mt-4">{children}</div>
    </div>
);
