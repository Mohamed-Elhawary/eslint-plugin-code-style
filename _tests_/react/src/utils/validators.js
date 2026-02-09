/*
 *Test Rules:
 *- no-empty-lines-in-switch-cases
 *- no-empty-lines-in-objects
 *- no-empty-lines-in-function-calls
 *- no-empty-lines-in-function-params
 *- multiline-if-conditions
 *- nested-call-closing-brackets
 *- curried-arrow-same-line
 */
// Test: variable-naming-convention

import { typeOfData } from "@/data";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Test: arrow-function-simplify
const isEmailHandler = (value) => emailRegex.test(value);

// Test: arrow-function-block-body
const isEmptyHandler = (value) => {
    if (value === null || value === undefined) return true;

    if (typeof value === typeOfData.string) return value.trim() === "";

    if (Array.isArray(value)) return value.length === 0;

    return false;
};

// Test: simple function
const isNumberHandler = (value) =>
    typeof value === typeOfData.number && !Number.isNaN(value);

export { isEmailHandler as isEmail, isEmptyHandler as isEmpty, isNumberHandler as isNumber };
