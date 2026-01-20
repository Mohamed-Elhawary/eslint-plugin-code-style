/*
Test Rules:
- code-style/enum-format (PascalCase + Enum suffix, UPPER_CASE members, commas)
- code-style/typescript-definition-location (enums in enums folder)
*/
// Test: enum-format - proper enum naming with UPPER_CASE members

export enum UserRoleEnum {
    ADMIN = "admin",
    GUEST = "guest",
    MODERATOR = "moderator",
    USER = "user",
}

// Test: numeric enum - UPPER_CASE members
export enum StatusCodeEnum {
    BAD_REQUEST = 400,
    FORBIDDEN = 403,
    INTERNAL_ERROR = 500,
    NOT_FOUND = 404,
    OK = 200,
    UNAUTHORIZED = 401,
}

// Test: enum with string values
export enum HttpMethodEnum {
    DELETE = "DELETE",
    GET = "GET",
    PATCH = "PATCH",
    POST = "POST",
    PUT = "PUT",
}

// Test: enum for user status
export enum UserStatusEnum {
    ACTIVE = "active",
    BANNED = "banned",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended",
}
