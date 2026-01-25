/*
Test Rules:
- code-style/interface-format (PascalCase + Interface suffix, camelCase props, commas)
- code-style/typescript-definition-location (interfaces in interfaces folder)
*/
// Test: interfaces for component props and data

export interface ListItemInterface {
    id: string,
    label: string,
}

export interface TableColumnInterface<T> {
    accessor: keyof T,
    header: string,
    width?: number,
}

export interface PaginationInterface {
    currentPage: number,
    pageSize: number,
    totalItems: number,
    totalPages: number,
}
