/*
 *Test Rules:
 *- code-style/no-hardcoded-strings (UI strings should be in strings folder)
 */
// UI strings for app and components

export const appStrings = {
    actions: {
        close: "Close Modal",
        decrement: "Decrement",
        increment: "Increment",
        open: "Open Modal",
        reset: "Reset",
        submit: "Submit",
    },
    common: {
        loading: "Loading...",
        noItems: "No items",
        unknownError: "Unknown error",
    },
    form: {
        placeholderEmail: "john@example.com",
        placeholderSearch: "Search...",
        requiredFieldsError: "Please fill in all required fields",
        submissionFailed: "Submission failed",
    },
    items: {
        apple: "Apple",
        banana: "Banana",
        cherry: "Cherry",
        first: "First",
        second: "Second",
    },
    labels: {
        count: "Count: ",
        counterApp: "Counter App",
        modalContent: "Modal Content",
        welcome: "Welcome, ",
    },
    layout: {
        footer: "Footer",
        header: "Header",
    },
    user: { defaultName: "John Doe" },
};
