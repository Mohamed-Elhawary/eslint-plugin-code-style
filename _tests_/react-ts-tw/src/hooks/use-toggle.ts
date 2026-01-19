/*
Test Rules:
- TypeScript generics in hooks
- code-style/function-params-per-line
*/
// Test: hook with TypeScript types

import { useCallback, useState } from "react";

interface UseToggleReturn {
    setFalse: () => void;
    setTrue: () => void;
    toggle: () => void;
    value: boolean;
}

export const useToggle = (initialValue: boolean = false): UseToggleReturn => {
    const [value, setValue] = useState<boolean>(initialValue);

    const toggleHandler = useCallback(
        () => {
            setValue((prev) => !prev);
        },
        [],
    );

    const setTrueHandler = useCallback(
        () => {
            setValue(true);
        },
        [],
    );

    const setFalseHandler = useCallback(
        () => {
            setValue(false);
        },
        [],
    );

    return {
        setFalse: setFalseHandler,
        setTrue: setTrueHandler,
        toggle: toggleHandler,
        value,
    };
};
