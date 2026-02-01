/*
 *Test Rules:
 *- @typescript-eslint/consistent-type-imports (type imports)
 *- code-style/function-naming-convention
 *- code-style/object-property-per-line
 */
// Test: type import for TypeScript types

import type { UserInterface } from "@/interfaces";

// Test: function naming convention with TypeScript return type
export const formatCurrencyHandler = (amount: number): string => {
    const formatter = new Intl.NumberFormat(
        "en-US",
        {
            currency: "USD",
            style: "currency",
        },
    );

    return formatter.format(amount);
};

// Test: function with explicit return type
export const formatDateHandler = (date: Date): string => {
    const formatter = new Intl.DateTimeFormat(
        "en-US",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    );

    return formatter.format(date);
};

// Test: function using imported type
export const formatUserNameHandler = ({
    email,
    name,
}: UserInterface): string => `${name} (${email})`;

// Test: generic function with type parameter
export const formatListHandler = <T>(items: T[], formatter: (item: T) => string): string => items.map(formatter).join(", ");
