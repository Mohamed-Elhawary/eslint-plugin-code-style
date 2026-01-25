/*
Test Rules:
- tailwindcss/enforces-shorthand
- code-style/component-props-destructure (props must be destructured)
- code-style/component-props-inline-type (inline type annotation)
- code-style/jsx-children-on-new-line
- Test: TypeScript component with inline type annotation
*/

import type { ReactNode } from "react";

export const Card = ({
    children,
    className = "",
    description,
    title,
}: {
    children: ReactNode,
    className?: string,
    description?: string,
    title: string,
}) => (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-md ${className}`}>
        <h2 className="mb-2 text-xl font-bold text-gray-800">{title}</h2>
        {description && <p className="mb-4 text-gray-600">{description}</p>}
        <div className="mt-4">{children}</div>
    </div>
);
