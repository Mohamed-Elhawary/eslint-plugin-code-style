/*
 *Test Rules:
 *- code-style/component-props-destructure (props must be destructured)
 *- code-style/component-props-inline-type (inline type annotation)
 *- code-style/jsx-children-on-new-line
 *- Test: TypeScript component with inline type annotation
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
    <div className={`card ${className}`}>
        <h2 className="card-title">{title}</h2>
        {description && <p className="card-description">{description}</p>}
        <div className="card-body">{children}</div>
    </div>
);
