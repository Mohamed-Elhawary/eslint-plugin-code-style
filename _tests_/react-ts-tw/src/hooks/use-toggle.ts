/*
 *Test Rules:
 *- TypeScript generics in hooks
 *- code-style/function-params-per-line
 *- code-style/component-props-inline-type (return type must be interface reference)
 */
// Test: hook with TypeScript types and interface return type

import { useCallback, useState } from "react";

import type { UseToggleReturnInterface } from "@/interfaces";

export const useToggle = (initialValue: boolean = false): UseToggleReturnInterface => {
    const [value, setValue] = useState<boolean>(initialValue);

    const toggleHandler = useCallback(
        () => setValue((prev) => !prev),
        [],
    );

    const setTrueHandler = useCallback(
        () => setValue(true),
        [],
    );

    const setFalseHandler = useCallback(
        () => setValue(false),
        [],
    );

    return {
        setFalse: setFalseHandler,
        setTrue: setTrueHandler,
        toggle: toggleHandler,
        value,
    };
};
