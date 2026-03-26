import type { ReactNode } from "react";

import { joinClassesHandler } from "@/lib";
import type { BadgeVariantType } from "@/types";

const variantStyles: Record<
    BadgeVariantType,
    {
        backgroundColor: string,
        color: string,
    }
> = {
    default: {
        backgroundColor: "var(--bg-badge)",
        color: "var(--text-badge)",
    },
    info: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        color: "rgb(59, 130, 246)",
    },
    purple: {
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        color: "rgb(139, 92, 246)",
    },
    success: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        color: "rgb(34, 197, 94)",
    },
    warning: {
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        color: "rgb(245, 158, 11)",
    },
};

export const Badge = ({
    children,
    variant,
}: {
    children: ReactNode,
    variant?: BadgeVariantType,
}) => {
    const defaultVariant: BadgeVariantType = "default";

    const resolvedVariant = variant ?? defaultVariant;

    const styles = variantStyles[resolvedVariant];

    return (
        <span
            style={styles}
            className={joinClassesHandler(`
                inline-flex
                items-center
                rounded-full
                px-2.5
                py-0.5
                text-xs
                font-medium
            `)}
        >
            {children}
        </span>
    );
};
