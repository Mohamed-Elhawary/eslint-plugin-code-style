/*
Test Rules:
- perfectionist/sort-interfaces (sorted interface properties)
- perfectionist/sort-enums (sorted enum members)
- perfectionist/sort-object-types (sorted type properties)
- code-style/export-format
*/
// Test: perfectionist/sort-interfaces - properties must be alphabetically sorted

export interface User {
    age: number;
    email: string;
    id: string;
    isActive: boolean;
    name: string;
}

// Test: perfectionist/sort-enums - enum members must be sorted
export enum UserRole {
    Admin = "admin",
    Guest = "guest",
    Moderator = "moderator",
    User = "user",
}

// Test: numeric enum - members must be sorted
export enum StatusCode {
    BadRequest = 400,
    Forbidden = 403,
    InternalError = 500,
    NotFound = 404,
    Ok = 200,
    Unauthorized = 401,
}

// Test: perfectionist/sort-object-types - type properties must be sorted
export type ApiResponse<T> = {
    data: T;
    error: string | null;
    status: number;
    success: boolean;
    timestamp: Date;
};

// Test: nested interface with sorted properties
export interface UserProfile {
    avatar: string;
    bio: string;
    createdAt: Date;
    role: UserRole;
    settings: UserSettings;
    updatedAt: Date;
    user: User;
}

// Test: interface with optional properties - still sorted
export interface UserSettings {
    darkMode?: boolean;
    language: string;
    notifications: boolean;
    timezone?: string;
}

// Test: interface extending another - properties sorted
export interface AdminUser extends User {
    department: string;
    permissions: string[];
    role: UserRole;
}

// Test: type with union and intersection - properties sorted
export type UserWithMeta = {
    createdBy: string;
    lastLogin: Date;
    metadata: Record<string, unknown>;
    version: number;
} & User;

// Test: enum with computed values
export enum HttpMethod {
    Delete = "DELETE",
    Get = "GET",
    Patch = "PATCH",
    Post = "POST",
    Put = "PUT",
}

// Test: interface with function properties - sorted
export interface UserActions {
    deleteUser: (id: string) => Promise<void>;
    getUser: (id: string) => Promise<User>;
    listUsers: () => Promise<User[]>;
    updateUser: (id: string, data: Partial<User>) => Promise<User>;
}

// Test: type alias with readonly properties - sorted
export type ReadonlyUser = {
    readonly email: string;
    readonly id: string;
    readonly name: string;
};

// Test: interface with index signature - sorted
export interface UserDictionary {
    [key: string]: User;
    defaultUser: User;
    lastAccessed: User;
}
