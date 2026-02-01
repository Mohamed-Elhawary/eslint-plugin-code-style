/*
 *Test Rules:
 *- code-style/interface-format (PascalCase + Interface suffix, camelCase props, commas)
 *- code-style/typescript-definition-location (interfaces in interfaces folder)
 */
// Test: interface for action params - can be used with destructured params

export interface CreateUserParamsInterface {
    age: number,
    email: string,
    isActive?: boolean,
    name: string,
}

export interface UpdateUserParamsInterface {
    age?: number,
    email?: string,
    id: string,
    isActive?: boolean,
    name?: string,
}

export interface DeleteUserParamsInterface {
    force?: boolean,
    id: string,
}
