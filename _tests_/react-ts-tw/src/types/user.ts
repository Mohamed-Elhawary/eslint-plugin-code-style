/*
 *Test Rules:
 *- code-style/type-format (PascalCase + Type suffix, camelCase props, commas)
 *- code-style/typescript-definition-location (types in types folder)
 */

export type UserProfileType = {
    avatar: string,
    bio: string,
    createdAt: Date,
    updatedAt: Date,
    userId: string,
};

// Test: type with generic
export type PaginatedResponseType<T> = {
    currentPage: number,
    data: T[],
    hasNextPage: boolean,
    totalItems: number,
    totalPages: number,
};

// Test: type with union - properties sorted
export type UserWithMetaType = {
    createdBy: string,
    email: string,
    id: string,
    lastLogin: Date,
    metadata: Record<string, unknown>,
    name: string,
    version: number,
};

// Test: type alias with readonly properties
export type ReadonlyUserType = {
    readonly email: string,
    readonly id: string,
    readonly name: string,
};

// Test: intersection type with proper naming
export type FullUserType = UserProfileType & {
    accessToken: string,
    refreshToken: string,
};

// Test: discriminated union type
export type ApiResultType<T> = {
    data: T,
    error: string,
    status: "error",
} | {
    data: T,
    error: null,
    status: "success",
};
