/*
 *Test Rules:
 *- code-style/interface-format (PascalCase + Interface suffix, camelCase props, commas)
 *- code-style/typescript-definition-location (interfaces in interfaces folder)
 */
// Test: interfaces for hook return types

export interface FormInitialDataInterface {
    email: string,
    name: string,
}

export interface UseCounterReturnInterface {
    count: number,
    onDecrement: () => void,
    onIncrement: () => void,
    onReset: () => void,
}

export interface UseFormSubmissionReturnInterface {
    error: string | null,
    formData: {
        email: string,
        name: string,
    },
    formSummary: {
        email: string,
        isValid: boolean,
        name: string,
    },
    hasBeenSubmitted: boolean,
    isFormValid: boolean,
    isSubmitting: boolean,
    isSuccess: boolean,
    onResetForm: () => void,
    onSubmit: () => Promise<void>,
    onUpdateField: (field: "name" | "email", value: string) => void,
    onValidateField: (field: "name" | "email") => boolean,
}

export interface UseToggleReturnInterface {
    hasValue: boolean,
    onSetFalse: () => void,
    onSetTrue: () => void,
    onToggle: () => void,
}
