/*
Test Rules:
- code-style/interface-format (PascalCase + Interface suffix, camelCase props, commas)
- code-style/typescript-definition-location (interfaces in interfaces folder)
*/
// Test: interfaces for hook return types

export interface FormInitialDataInterface {
    email: string,
    name: string,
}

export interface UseCounterReturnInterface {
    count: number,
    decrement: () => void,
    increment: () => void,
    reset: () => void,
}

export interface UseFormSubmissionReturnInterface {
    error: string | null,
    formData: { email: string, name: string },
    formSummary: { email: string, isValid: boolean, name: string },
    hasBeenSubmitted: boolean,
    isFormValid: boolean,
    isSubmitting: boolean,
    isSuccess: boolean,
    resetForm: () => void,
    submit: () => Promise<void>,
    updateField: (field: "name" | "email", value: string) => void,
    validateField: (field: "name" | "email") => boolean,
}

export interface UseToggleReturnInterface {
    setFalse: () => void,
    setTrue: () => void,
    toggle: () => void,
    value: boolean,
}
