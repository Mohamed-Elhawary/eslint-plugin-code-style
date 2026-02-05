/*
 *Test Rules:
 *- code-style/interface-format (PascalCase + Interface suffix, camelCase props, commas)
 *- code-style/typescript-definition-location (interfaces in interfaces folder)
 */
// Test: interface-format - proper interface naming and formatting

export interface UserInterface {
    age: number,
    email: string,
    id: string,
    isActive: boolean,
    name: string,
}

// Test: interface with generic - still follows naming convention
export interface ApiResponseInterface<T> {
    data: T,
    error: string | null,
    isSuccess: boolean,
    status: number,
    timestamp: Date,
}

// Test: interface with optional properties - all camelCase
export interface UserSettingsInterface {
    isDarkMode?: boolean,
    isNotifications: boolean,
    language: string,
    timezone?: string,
}

// Test: interface extending another - both follow naming convention
export interface AdminUserInterface extends UserInterface {
    department: string,
    permissions: string[],
    role: string,
}

// Test: interface with function properties - camelCase method names
export interface UserActionsInterface {
    onDeleteUser: (id: string) => Promise<void>,
    onGetUser: (id: string) => Promise<UserInterface>,
    onListUsers: () => Promise<UserInterface[]>,
    onUpdateUser: (id: string, data: Partial<UserInterface>) => Promise<UserInterface>,
}

// Test: interface with index signature
export interface UserDictionaryInterface {
    [key: string]: UserInterface,
    defaultUser: UserInterface,
    lastAccessed: UserInterface,
}
