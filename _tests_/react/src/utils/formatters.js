/*
 *Test Rules:
 *- import-format
 *- export-format
 *- import-source-spacing
 *- array-items-per-line
 *- array-objects-on-new-lines
 *- object-property-value-format
 *- object-property-value-brace
 *- string-property-spacing
 *- member-expression-bracket-spacing
 *- comment-format
 *- assignment-value-same-line
 *- absolute-imports-only
 */
/*
 * Test: import-format (single specifier on one line)
 * Test: absolute-imports-only 
 */

import { isNumber } from "@/utils";

// Test: variable-naming-convention (camelCase for constants)
const defaultLocale = "en-US";

const defaultCurrency = "USD";

// Test: array-objects-on-new-lines
const currencyFormats = [
    {
        code: "EUR",
        symbol: "€",
    },
    {
        code: "GBP",
        symbol: "£",
    },
    {
        code: "USD",
        symbol: "$",
    },
];

// Test: object-property-value-format, string-property-spacing
const formatOptions = {
    currency: defaultCurrency,
    locale: defaultLocale,
};

// Test: arrow-function-simplify
const formatCurrencyHandler = (amount) => {
    // Test: member-expression-bracket-spacing
    const symbol = currencyFormats.find(({ code }) => code === formatOptions.currency)?.symbol;

    return `${symbol}${amount.toFixed(2)}`;
};

// Test: assignment-value-same-line
const formatDateHandler = (date) => {
    const formatted = new Date(date).toLocaleDateString(defaultLocale);

    return formatted;
};

// Test: function with validation
const formatNumberHandler = (value) => {
    if (!isNumber(value)) return "NaN";

    return value.toLocaleString(defaultLocale);
};

export { formatCurrencyHandler as formatCurrency, formatDateHandler as formatDate, formatNumberHandler as formatNumber };
