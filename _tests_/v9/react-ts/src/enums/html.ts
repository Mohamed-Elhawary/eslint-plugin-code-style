/*
 *Test Rules:
 *- code-style/enum-format (PascalCase + Enum suffix, UPPER_CASE members, commas)
 *- code-style/typescript-definition-location (enums in enums folder)
 */
// HTML input types

export enum InputTypeEnum {
    BUTTON = "button",
    CHECKBOX = "checkbox",
    EMAIL = "email",
    NUMBER = "number",
    PASSWORD = "password",
    SUBMIT = "submit",
    TEXT = "text",
}

// Date format styles
export enum DateFormatStyleEnum {
    FULL = "full",
    LONG = "long",
    MEDIUM = "medium",
    NUMERIC = "numeric",
    SHORT = "short",
}

// Number format styles
export enum NumberFormatStyleEnum {
    CURRENCY = "currency",
    DECIMAL = "decimal",
    PERCENT = "percent",
    UNIT = "unit",
}

// Form field names
export enum FormFieldEnum {
    EMAIL = "email",
    NAME = "name",
    PASSWORD = "password",
    USERNAME = "username",
}

// Number sign types
export enum NumberSignEnum {
    NEGATIVE = "negative",
    POSITIVE = "positive",
    ZERO = "zero",
}

// Status types
export enum StatusEnum {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
}
