/*
 *Test Rules:
 *- @typescript-eslint/consistent-type-imports (type imports)
 *- code-style/function-naming-convention
 *- code-style/object-property-per-line
 */
// Test: type import for TypeScript types

import { localeConstants } from "@/constants";
import { DateFormatStyleEnum, NumberFormatStyleEnum } from "@/enums";
import type { UserInterface } from "@/interfaces";

// Test: function naming convention with TypeScript return type
export const formatCurrencyHandler = (amount: number): string => {
    const formatter = new Intl.NumberFormat(
        localeConstants.enUs,
        {
            currency: localeConstants.currencyUsd,
            style: NumberFormatStyleEnum.CURRENCY,
        },
    );

    return formatter.format(amount);
};

// Test: function with explicit return type
export const formatDateHandler = (date: Date): string => {
    const formatter = new Intl.DateTimeFormat(
        localeConstants.enUs,
        {
            day: DateFormatStyleEnum.NUMERIC,
            month: DateFormatStyleEnum.LONG,
            year: DateFormatStyleEnum.NUMERIC,
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
