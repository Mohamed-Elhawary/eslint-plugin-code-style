/*
 *Test Rules:
 *- code-style/type-annotation-spacing (no space before colon, one space after)
 *- code-style/variable-naming-convention (camelCase for variables, UPPER_CASE for constants)
 *- code-style/arrow-function-simplify (simplify arrow functions when possible)
 *- code-style/assignment-value-same-line (value must be on same line as assignment)
 *- code-style/block-statement-newlines (empty line after multi-line blocks)
 *- code-style/export-format (export keyword on same line as declaration)
 *- code-style/function-call-spacing (no space between function name and parentheses)
 *- code-style/member-expression-bracket-spacing (no space inside brackets)
 */

import { NumberSignEnum } from "@/enums";

export const formatValueHandler = (value: string): string => value.trim();

// Test: variable-naming-convention - camelCase for variables
export const defaultTimeout = 5000;

// Test: variable-naming-convention - camelCase for constants
export const maxRetries = 3;

export const apiBaseUrl = "https://api.example.com"; // eslint-disable-line code-style/no-hardcoded-strings -- config URL

// Test: type-annotation-spacing with generics - no space before <
export const createArrayHandler = <T>(item: T, count: number): T[] => Array.from(
    { length: count },
    () => item,
);

// Test: arrow-function-simplify - implicit return when possible
export const getDoubleHandler = (n: number): number => n * 2;

export const isEvenHandler = (n: number): boolean => n % 2 === 0;

// Test: assignment-value-same-line
export const calculateTotalHandler = (items: number[]): number => {
    const sum = items.reduce(
        (
            acc,
            item,
        ) => acc + item,
        0,
    );

    return sum;
};

// Test: block-statement-newlines - empty line after multi-line if/else blocks
export const processValueHandler = (value: number): NumberSignEnum => {
    if (value < 0) return NumberSignEnum.NEGATIVE;

    if (value === 0) return NumberSignEnum.ZERO;

    return NumberSignEnum.POSITIVE;
};

// Test: export-format - export on same line as declaration (not on separate line)
export const parseJsonHandler = <T>(json: string): T | null => {
    try {
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
};

// Test: function-call-spacing - no space between function name and parentheses
export const fetchDataHandler = async (url: string): Promise<unknown> => {
    const response = await fetch(url);

    return response.json();
};

// Test: member-expression-bracket-spacing - no space inside brackets
export const getItemHandler = (arr: string[], index: number): string | undefined => arr[index];

// Test: type-annotation-spacing with array types - no space before []
export const filterNumbersHandler = (values: Array<string | number>): number[] => values.filter((v): v is number => typeof v === "number", // eslint-disable-line code-style/no-hardcoded-strings -- typeof check
);
